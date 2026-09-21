/**
 * "Share" environment — the artist dashboard behind a Cloudflare quick tunnel.
 * See the customer-pwa file of the same name for why apiBaseUrl is relative.
 *
 * customerPwaUrl is the ONE value that cannot be relative: it builds links
 * the artist sends to customers (review links, booking links), which point at
 * a DIFFERENT origin — the customer app's own tunnel. It is therefore the only
 * reason this app needs rebuilding when a tunnel restarts.
 *
 * scripts/share.sh rewrites the line below before building, so that rebuild is
 * automatic rather than something to remember.
 */
export const environment = {
  production: false,
  apiBaseUrl: '/api/v1',
  customerPwaUrl: 'https://certainly-blocking-recommends-eds.trycloudflare.com', // rewritten by scripts/share.sh
};
