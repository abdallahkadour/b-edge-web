/**
 * "Share" environment — the customer PWA behind a Cloudflare quick tunnel.
 *
 * WHY THIS EXISTS, AND WHY apiBaseUrl IS RELATIVE
 *
 * A quick tunnel hands out a random `*.trycloudflare.com` hostname that
 * changes every time it restarts. With an absolute apiBaseUrl that hostname
 * is baked into the bundle at build time, so every restart would mean a
 * rebuild — and the whole point of this configuration is to hand someone a
 * working link without a deploy.
 *
 * A RELATIVE path removes the problem entirely: the app calls `/api/v1` on
 * whatever origin it was served from, and `scripts/share-proxy.mjs` forwards
 * that to the Go API on :3000. The tunnel URL can change as often as it
 * likes and this build keeps working.
 *
 * It also deletes CORS from the picture. Same-origin means no preflight, no
 * `CLIENT_URL` entry per tunnel, and no chance of the classic "it works on
 * localhost" failure where the browser blocks a call the server was happy to
 * answer.
 *
 * NOT for production. Production is api.<domain> on its own host, per
 * B-Edge-Deployment-Runbook-v1.md; `production: false` keeps Angular's dev
 * diagnostics on, which is what you want for a supervised trial.
 */
export const environment = {
  production: false,
  apiBaseUrl: '/api/v1',
};
