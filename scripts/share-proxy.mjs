// Serves one built Angular app and forwards /api to the Go backend, so the
// app and its API share a single origin.
//
// WHY A PROXY RATHER THAN THREE TUNNELS
//
// The obvious setup — one tunnel for the API, one per app — fails in two
// ways that only show up after you have sent someone the link:
//
//   1. A Cloudflare quick tunnel's hostname is random and changes on every
//      restart. Angular bakes apiBaseUrl into the bundle at BUILD time, so
//      every restart of the API tunnel would mean rebuilding both apps.
//   2. Three origins means CORS, so every new tunnel hostname has to be
//      added to CLIENT_URL and the API restarted — and when it is forgotten
//      the browser blocks calls the server was perfectly willing to answer,
//      which reads as "the app is broken" rather than "a header is missing".
//
// Putting the app and the API behind ONE origin removes both. The app calls
// a relative `/api/v1`, this process forwards it to :3000, and the tunnel
// hostname stops being something the build has to know.
//
// NOT a production server. No compression, no cache headers, no TLS (the
// tunnel terminates that). Production is the reverse proxy in
// B-Edge-Deployment-Runbook-v1.md.
//
//   node scripts/share-proxy.mjs --dir dist/customer-pwa/browser --port 8080

import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1]]);
    return acc;
  }, []),
);

const ROOT = args.dir;
const PORT = Number(args.port ?? 8080);
const API = args.api ?? 'http://localhost:3000';

if (!ROOT) {
  console.error('usage: node share-proxy.mjs --dir <build-output> --port <n> [--api http://localhost:3000]');
  process.exit(2);
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
};

const apiURL = new URL(API);

function proxy(req, res) {
  const upstream = http.request(
    {
      hostname: apiURL.hostname,
      port: apiURL.port || 80,
      path: req.url,
      method: req.method,
      // Host is rewritten to the upstream's own authority. Passing the tunnel
      // hostname through would leave the API generating absolute URLs (and
      // logging origins) for a host it cannot serve.
      headers: { ...req.headers, host: apiURL.host },
    },
    (up) => {
      res.writeHead(up.statusCode ?? 502, up.headers);
      up.pipe(res);
    },
  );
  upstream.on('error', (err) => {
    res.writeHead(502, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: `api unreachable: ${err.message}` }));
  });
  req.pipe(upstream);
}

async function serveFile(path, res) {
  const body = await readFile(path);
  res.writeHead(200, {
    'content-type': TYPES[extname(path).toLowerCase()] ?? 'application/octet-stream',
    // No caching: a trial build is rebuilt often and a stale bundle served to
    // the one person testing it is the most confusing possible failure.
    'cache-control': 'no-store',
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://x');

  if (url.pathname.startsWith('/api')) return proxy(req, res);

  // Resolve inside ROOT only. normalize() collapses any ../ before it is
  // joined, so a crafted path cannot escape the build directory.
  const rel = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  const file = join(ROOT, rel);

  try {
    const s = await stat(file);
    if (s.isFile()) return await serveFile(file, res);
  } catch {
    /* fall through to the SPA entry point */
  }

  // Angular owns routing: anything that is not a real file is a client route
  // and must receive index.html, or a deep link like /my-bookings 404s.
  try {
    return await serveFile(join(ROOT, 'index.html'), res);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('build not found — run the ng build first');
  }
});

// 0.0.0.0 so the tunnel (and a LAN device) can reach it, not just this host.
server.listen(PORT, '0.0.0.0', () => {
  console.log(`serving ${ROOT} on http://0.0.0.0:${PORT}  (/api -> ${API})`);
});
