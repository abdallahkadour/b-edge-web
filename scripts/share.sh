#!/usr/bin/env bash
#
# Puts both apps on the public internet behind Cloudflare quick tunnels, so
# someone who is not on this network can use them.
#
# WHY A TUNNEL AND NOT AN IP
#
# The obvious answer to "let someone else see this" is to hand them the
# machine's IP. It cannot work here, for two independent reasons:
#
#   - This machine is usually on an iPhone Personal Hotspot (172.20.10.x).
#     A LAN address is only reachable from a device on that same hotspot.
#   - The hotspot is behind carrier CGNAT, so there is no public address to
#     forward a port to, and no router to forward it on.
#
# A tunnel dials OUTWARD and Cloudflare accepts the inbound connection, which
# is why it works where port forwarding cannot. Quick tunnels need no account
# and no domain.
#
# WHAT THIS IS NOT
#
# Not a deployment. The laptop has to stay awake and online, and the
# hostnames change every run. It is for putting the product in front of one
# person for an afternoon. The real answer is a domain plus the €4/mo host in
# B-Edge-Deployment-Runbook-v1.md — which also unblocks Meta verification,
# and therefore every WhatsApp notification.
#
#   ./scripts/share.sh          start both
#   ./scripts/share.sh --stop   stop everything

set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Not 8080: a local Jenkins holds 127.0.0.1:8080 on this machine, and a
# tunnel pointed at a port something else answers on publishes THAT (see
# port_free below). Override either with CUST_PORT=... DASH_PORT=...
CUST_PORT="${CUST_PORT:-8090}"
DASH_PORT="${DASH_PORT:-8081}"
API="http://localhost:3000"
RUN=/tmp/bedge-share
DASH_ENV="projects/artist-dashboard/src/environments/environment.share.ts"

stop_all() {
  pkill -f 'share-proxy.mjs'            2>/dev/null
  pkill -f 'cloudflared.*tunnel.*--url' 2>/dev/null
  rm -rf "$RUN"
  echo "stopped."
}

[ "${1:-}" = "--stop" ] && { stop_all; exit 0; }

stop_all >/dev/null 2>&1
mkdir -p "$RUN"

# A port another program already listens on is worse than a failed start.
# The proxy binds 0.0.0.0, and another server can still hold 127.0.0.1 on the
# same port - the more specific bind wins, so the tunnel reaches THAT server
# and puts it on the public internet. On 2026-09-28 the customer link was
# about to serve this machine's Jenkins login page. So: refuse, and say who.
port_free() { ! lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1; }
for p in "$CUST_PORT" "$DASH_PORT"; do
  if ! port_free "$p"; then
    echo "port $p is already in use by:" >&2
    lsof -nP -iTCP:"$p" -sTCP:LISTEN >&2
    echo "pick free ports, e.g.  CUST_PORT=8092 DASH_PORT=8093 $0" >&2
    exit 1
  fi
done

# http2 over TCP 443, not the default QUIC over UDP: on the phone hotspot
# this machine usually uses, UDP to Cloudflare drops out ("sendmsg: network
# is unreachable") and a QUIC tunnel can sit retrying without ever
# connecting. 127.0.0.1 rather than localhost so the tunnel cannot resolve to
# a different listener on ::1.
tunnel() { nohup cloudflared tunnel --protocol http2 --url "http://127.0.0.1:$1" >"$2" 2>&1 & }

command -v cloudflared >/dev/null || { echo "cloudflared missing: brew install cloudflared" >&2; exit 1; }
curl -sf -o /dev/null --max-time 5 "$API/api/v1/health" \
  || { echo "The API is not answering on $API — start it first (make dev)." >&2; exit 1; }

# Waits for cloudflared to print the hostname it was assigned. The URL appears
# on stderr a second or two after launch; without waiting for it we would
# build the dashboard against an empty customerPwaUrl.
await_url() {
  local log="$1" i url
  for i in $(seq 1 40); do
    url=$(grep -ohE 'https://[a-z0-9-]+\.trycloudflare\.com' "$log" 2>/dev/null | head -1)
    [ -n "$url" ] && { echo "$url"; return 0; }
    sleep 1
  done
  return 1
}

echo "==> customer app"
npx ng build customer-pwa --configuration share >"$RUN/build-cust.log" 2>&1 \
  || { echo "build failed — see $RUN/build-cust.log" >&2; exit 1; }
nohup node scripts/share-proxy.mjs --dir dist/customer-pwa/browser --port "$CUST_PORT" --api "$API" \
  >"$RUN/proxy-cust.log" 2>&1 &
tunnel "$CUST_PORT" "$RUN/tun-cust.log"
CUST_URL=$(await_url "$RUN/tun-cust.log") || { echo "customer tunnel did not come up; see $RUN/tun-cust.log" >&2; exit 1; }
echo "    $CUST_URL"

# The dashboard builds review and booking links that point at the CUSTOMER
# app, which lives on a different origin. It is the only value here that
# cannot be relative, so it is rewritten before the dashboard is built rather
# than left as a stale localhost link an artist would send to a real customer.
#
# The file is GENERATED from its committed template on every run and is
# gitignored, because it carries the live tunnel hostname. It used to be
# tracked and rewritten in place, which left a hostname in the working tree
# after every run - and eight of them were committed.
echo "==> artist dashboard"
cp "${DASH_ENV%.ts}.example.ts" "$DASH_ENV"
sed -i '' "s|customerPwaUrl: '[^']*'|customerPwaUrl: '$CUST_URL'|" "$DASH_ENV"
npx ng build artist-dashboard --configuration share >"$RUN/build-dash.log" 2>&1 \
  || { echo "build failed — see $RUN/build-dash.log" >&2; exit 1; }
nohup node scripts/share-proxy.mjs --dir dist/artist-dashboard/browser --port "$DASH_PORT" --api "$API" \
  >"$RUN/proxy-dash.log" 2>&1 &
tunnel "$DASH_PORT" "$RUN/tun-dash.log"
DASH_URL=$(await_url "$RUN/tun-dash.log") || { echo "dashboard tunnel did not come up; see $RUN/tun-dash.log" >&2; exit 1; }
echo "    $DASH_URL"

printf '%s\n%s\n' "$CUST_URL" "$DASH_URL" > "$RUN/urls"

cat <<EOF

────────────────────────────────────────────────────────────
  Customer app    $CUST_URL
  Artist dashboard $DASH_URL
────────────────────────────────────────────────────────────

  Both stay up while this machine is awake and online.
  Stop with: ./scripts/share.sh --stop

  Known limits for whoever is testing:
    - Customer OTP login does NOT work. No WhatsApp message has ever
      been delivered (Meta has not verified the sender). Booking as a
      guest works; "My bookings" cannot be reached.
    - No booking approval, confirmation or review message will arrive,
      for the same reason.
    - The URLs change every time this script runs.
EOF
