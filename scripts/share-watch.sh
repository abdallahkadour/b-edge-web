#!/usr/bin/env bash
#
# Keeps the shared tunnels alive, and records the current links.
#
# WHY THIS EXISTS
#
# Three outages in one afternoon, all the same shape. The laptop is tethered
# to a phone, so the connection drops for a minute at a time; cloudflared
# survives a short drop, but a long one gets the quick tunnel RECLAIMED by
# Cloudflare and the process then retries forever against a registration that
# no longer exists ("Unauthorized: Tunnel not found"). It looks alive - the
# process is running, the proxy answers locally - while the public URL is
# dead. Nobody finds out until the person testing says the link is broken.
#
# This watches for that state and restarts the tunnels, which is the only
# recovery a quick tunnel has. The hostnames CHANGE when it does; that is not
# a bug in this script, it is what a free tunnel with no domain costs.
#
# WHAT IT DOES NOT FIX
#
# The URL churn itself. Every restart means re-sending the link. The fix for
# that is a domain and a named tunnel - the same purchase that unblocks Meta
# verification and therefore every WhatsApp notification.
#
#   ./scripts/share-watch.sh            # watch, checking every 60s
#   ./scripts/share-watch.sh --once     # check once and exit
#   cat /tmp/bedge-share/urls           # the current links, always

set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

RUN=/tmp/bedge-share
INTERVAL="${INTERVAL:-60}"
ONCE=0
[ "${1:-}" = "--once" ] && ONCE=1

log() { printf '%s  %s\n' "$(date '+%H:%M:%S')" "$*"; }

# A tunnel is healthy only if its PUBLIC url answers. Checking the local
# proxy would report healthy for exactly the failure this exists to catch.
public_ok() {
  local url="$1"
  [ -z "$url" ] && return 1
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 25 "$url/" 2>/dev/null)
  [ "$code" = "200" ]
}

check_once() {
  local cust dash
  cust=$(sed -n 1p "$RUN/urls" 2>/dev/null)
  dash=$(sed -n 2p "$RUN/urls" 2>/dev/null)

  # "Tunnel not found" is terminal for a quick tunnel: cloudflared will retry
  # until killed and never recover the hostname. Treat it as down even if the
  # URL somehow still answers from cache.
  if grep -q 'Tunnel not found' "$RUN"/tun-*.log 2>/dev/null; then
    log "cloudflared reports the tunnel was reclaimed - restarting"
    return 1
  fi

  if public_ok "$cust" && public_ok "$dash"; then
    return 0
  fi

  log "a public URL is not answering - restarting"
  return 1
}

restart() {
  ./scripts/share.sh >"$RUN/restart.log" 2>&1
  if [ $? -ne 0 ]; then
    log "restart FAILED - see $RUN/restart.log"
    return 1
  fi
  log "restarted. NEW LINKS (the old ones are dead):"
  sed -n 1p "$RUN/urls" | sed 's/^/    customer  /'
  sed -n 2p "$RUN/urls" | sed 's/^/    dashboard /'
  log "send the dashboard link to the artist again"
}

if [ "$ONCE" = "1" ]; then
  check_once && { log "both links healthy"; exit 0; }
  restart
  exit $?
fi

log "watching every ${INTERVAL}s (ctrl-c to stop)"
while true; do
  if ! check_once; then
    restart
  fi
  sleep "$INTERVAL"
done
