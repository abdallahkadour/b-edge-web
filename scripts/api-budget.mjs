/**
 * Waits until the API has request budget to spare before a browser suite
 * starts (2026-10-11).
 *
 * The API allows 600 requests per address per 5 minutes and says how many
 * are left (X-Ratelimit-Remaining) and when the window resets
 * (X-Ratelimit-Reset, seconds). The API harnesses already wait out a 429;
 * a browser cannot - a throttled screen simply never renders, and the run
 * dies on a click timeout that looks like a defect. Suite 5 of
 * e2e-journeys-ui and e2e-suite30-ui both did, only in back-to-back
 * batches, and both passed every time they ran with the budget intact.
 */
export async function waitForBudget(api = 'http://localhost:3000/api/v1', min = 400) {
  for (let i = 0; i < 12; i++) {
    const r = await fetch(`${api}/health`).catch(() => null);
    const left = Number(r?.headers.get('x-ratelimit-remaining') ?? 600);
    const reset = Number(r?.headers.get('x-ratelimit-reset') ?? 0);
    if (left >= min) return;
    const wait = Math.min(Math.max(reset, 5), 300);
    console.log(`    (API budget ${left}/600 - waiting ${wait}s for the window to reset)`);
    await new Promise((res) => setTimeout(res, wait * 1000 + 1000));
  }
}
