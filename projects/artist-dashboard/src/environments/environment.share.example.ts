/**
 * "Share" environment — the artist dashboard behind a Cloudflare quick tunnel.
 * See the customer-pwa file of the same name for why apiBaseUrl is relative.
 *
 * customerPwaUrl is the ONE value that cannot be relative: it builds links
 * the artist sends to customers (review links, booking links), which point at
 * a DIFFERENT origin — the customer app's own tunnel. It is therefore the only
 * reason this app needs rebuilding when a tunnel restarts.
 *
 * THIS IS A TEMPLATE. The build uses environment.share.ts, which
 * scripts/share.sh generates from this file on every run and then points at
 * the current tunnel. That generated file is gitignored: it carries a live
 * tunnel hostname, and before 2026-09-26 it was tracked, so every share run
 * left a hostname in the working tree waiting to be committed — and it was,
 * in at least eight commits. Edit this file, never the generated one.
 */
export const environment = {
  production: false,
  apiBaseUrl: '/api/v1',
  customerPwaUrl: 'http://localhost:4200', // rewritten by scripts/share.sh
};
