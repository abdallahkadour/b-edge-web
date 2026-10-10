/**
 * E2E Suite 29 — the features built on 2026-10-09, in a real browser.
 *
 *   29.1  admin -> Bookings: every salon's bookings, led by the refunds owed;
 *         the figure matches the database, and tapping it filters to them
 *   29.2  (added with the no-show rule)
 *   29.3  (added with favourites)
 *
 * Chromium, for the same reason as e2e-journeys-ui.mjs: it keeps the Secure
 * refresh cookie on http://localhost. Cases that create data tag it and tear
 * it down; 29.1 only reads.
 *
 *   node scripts/e2e-suite29-ui.mjs
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';

const DASH = 'http://localhost:4300';
const PW = 'password123';
const ADMIN = 'abdallah.kadour@b-edge.com';

const results = [];
const rec = (id, verdict, detail) => {
  results.push([id, verdict, detail]);
  console.log(`  ${verdict.padEnd(5)} ${id.padEnd(6)} ${detail}`);
};

function sql(q) {
  return execFileSync('docker', ['exec', '-i', 'bedge-postgres', 'psql', '-U', 'postgres', '-d', 'bedge',
    '-tA', '-v', 'ON_ERROR_STOP=1', '-c', q], { encoding: 'utf8' })
    .split('\n').filter((l) => l && !/^(INSERT|UPDATE|DELETE|SELECT) \d/.test(l)).join('\n').trim();
}

async function signIn(page, email) {
  await page.goto(`${DASH}/login`);
  await page.fill('#email', email);
  await page.fill('#password', PW);
  await page.getByRole('button', { name: /^Sign in$/ }).click();
  await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 10000 }).catch(() => {});
}

async function settle(page) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(800);
}

const text = async (page) => (await page.locator('body').innerText()).replace(/\s+/g, ' ');

// ── 29.1 admin -> Bookings ──────────────────────────────────────────────────

async function adminBookings(browser) {
  const [count, sum] = sql(`SELECT count(*) || '|' || COALESCE(sum(deposit_amount), 0)::numeric(10,0)
    FROM bookings WHERE status = 'refund_due' AND deleted_at IS NULL`).split('|');
  const salon = sql(`SELECT sa.name FROM bookings b JOIN salons sa ON sa.id = b.salon_id
    WHERE b.status = 'refund_due' AND b.deleted_at IS NULL ORDER BY b.created_at DESC LIMIT 1`);
  if (count === '0') {
    rec('29.1', 'SKIP', 'no booking in the database owes a refund, so the figure cannot be checked against one');
    return;
  }
  const c = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await c.newPage();
  await signIn(page, ADMIN);
  await page.goto(`${DASH}/admin`);
  await settle(page);
  await page.getByRole('button', { name: 'Bookings', exact: true }).click();
  await settle(page);
  const t = await text(page);
  const owed = `$${sum}`;
  const shows = t.includes(owed) && new RegExp(`${count} refunds? owed`).test(t);
  await page.getByRole('button', { name: /refunds? owed/ }).click();
  await settle(page);
  const badges = await page.locator('li span.uppercase').allInnerTexts();
  const onlyOwed = badges.length > 0 && badges.every((b) => /refund due/i.test(b));
  rec('29.1', shows && t.includes(salon) && onlyOwed ? 'PASS' : 'FAIL',
    `shows ${owed} across ${count} refunds owed (database: ${count}, $${sum}): ${shows}; lists ${salon}: ${t.includes(salon)}; ` +
    `after tapping the figure, ${badges.length} rows, all "Refund due": ${onlyOwed}`);
  await c.close();
}

console.log('\n  E2E suite 29 — the 2026-10-09 features\n');
const browser = await chromium.launch();
try {
  for (const run of [adminBookings]) {
    try { await run(browser); } catch (e) { rec(run.name, 'FAIL', `harness: ${e.message.split('\n')[0]}`); }
  }
} finally {
  await browser.close();
  const p = results.filter((r) => r[1] === 'PASS').length;
  const f = results.filter((r) => r[1] === 'FAIL').length;
  console.log(`\n  ${p} pass, ${f} FAIL\n`);
  process.exitCode = f ? 1 : 0;
}
