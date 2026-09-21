/**
 * E2E suite 22.6 — the three screens this feature shipped, rendered.
 *
 * Team, My hours and the public join page have only ever been driven through
 * curl. Every defect that reached the launch artist was invisible in desktop
 * Chrome and obvious in WebKit at phone width, so this is the one place they
 * have not been looked at.
 *
 * Rules this follows, from B-Edge-Security-Test-Plan-v1.md 3.4c:
 *   - ASSERT IDENTITY BEFORE MEASURING. E2E 20.2 once reported "0 overflow,
 *     0 labels" while measuring the login page, because the app had bounced
 *     there. An overflow of 0 on the wrong screen is not a pass.
 *   - Report what was seen, not what was expected.
 *
 * Runs over HTTP and logs in WITHIN the session, then navigates by CLICKING
 * the nav - never page.goto() - because the refresh cookie is set
 * Secure:true unconditionally (auth/handler.go:327), so WebKit never stores
 * it over plain HTTP and any full navigation bounces straight to /login with
 * the in-memory access token gone.
 *
 * Two consequences, both stated rather than silently skipped:
 *   - This suite does NOT cover reload survival, or "typing an owner-only
 *     URL redirects", both of which need a real reload.
 *   - Clicking the nav is what a phone user does anyway, and at 390px it
 *     forces the "More" sheet open, which is a third rendering of the nav
 *     that filters navItems() again and could regress on its own.
 */
import { webkit } from 'playwright';

const BASE = 'http://localhost:4300';
const EMAIL = 'rania@bedge.com';
const PASSWORD = 'password123';
const WIDTHS = [390, 320];

const results = [];
const rec = (id, verdict, detail) => {
  results.push({ id, verdict, detail });
  console.log(`  ${verdict.padEnd(4)} ${id.padEnd(9)} ${detail}`);
};

/** Horizontal overflow of the page body, in px. Anything > 0 is a defect. */
const overflow = (page) =>
  page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - window.innerWidth));

/** Elements whose text is visually clipped by their own box. */
const clipped = (page, sel) =>
  page.evaluate((s) =>
    [...document.querySelectorAll(s)]
      .filter((el) => el.scrollWidth > el.clientWidth + 1)
      .map((el) => (el.textContent || el.value || '').trim().slice(0, 40)), sel);

/**
 * Navigates inside the SPA by clicking, falling back to the mobile "More"
 * sheet. page.goto() would reload the app and lose the access token.
 */
async function navTo(page, label) {
  // Regex-anchored text, not has-text and not getByRole. has-text("More")
  // also matches the bookings screen's "Load more"; :text-is returns 0 even
  // when textContent is exactly "More"; and getByRole with an exact name
  // times out because the icon contributes to the accessible name.
  // :visible in the base selector, not .first(). The desktop sidebar is in
  // the DOM at phone width but hidden, so .first() resolves to it and the
  // click waits 30s for an element that will never be visible.
  const exact = (sel) => page.locator(sel).filter({ hasText: new RegExp(`^\\s*${label}\\s*$`) });

  if (await exact('a:visible').count()) {
    await exact('a:visible').first().click();
  } else {
    // At phone width the sidebar is hidden and these live in the "More"
    // sheet - a third rendering of the nav that filters navItems() again.
    const more = page.locator('button').filter({ hasText: /^\s*More\s*$/ });
    if (!(await more.count())) throw new Error(`no visible "${label}" link and no More sheet`);
    await more.first().click();
    await page.waitForTimeout(600);
    if (!(await exact('a:visible').count())) {
      throw new Error(`"${label}" is in neither the nav bar nor the More sheet`);
    }
    await exact('a:visible').first().click();
  }
  await page.waitForTimeout(1500);
}

/** Refuses to measure a screen that is not the one asked for. */
async function assertOn(page, fragment, label) {
  const url = page.url();
  if (!url.includes(fragment)) {
    throw new Error(
      `expected to be on ${fragment} for "${label}" but the browser is at ${url} — ` +
      `measuring here would produce a vacuous pass`);
  }
}

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"], input#email', EMAIL);
  await page.fill('input[type="password"], input#password', PASSWORD);
  // The design system renders type="button", not submit - selecting on
  // type would wait 30s and time out.
  await page.click('button:has-text("Sign in")');
  await page.waitForURL((u) => !u.toString().includes('/login'), { timeout: 20000 });
  // Let the dashboard settle. Without this the nav has not rendered yet and
  // navTo reports "no More sheet" for a sheet that simply is not there yet -
  // a timing failure that reads exactly like a missing control.
  await page.waitForSelector('h1', { timeout: 15000 });
  await page.waitForTimeout(1500);
}

async function run(width) {
  const browser = await webkit.launch();
  const ctx = await browser.newContext({
    viewport: { width, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
  });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(String(e).slice(0, 120)));

  try {
    await login(page);

    // ── Team ───────────────────────────────────────────────────────────
    await navTo(page, 'Team');
    await assertOn(page, '/dashboard/team', 'Team');

    const teamH1 = (await page.locator('h1').first().textContent())?.trim();
    const ov = await overflow(page);
    const clip = await clipped(page, 'li span, li p, h1, h2');
    rec(`22.6-team@${width}`, (teamH1 === 'Team' && ov === 0 && clip.length === 0) ? 'PASS' : 'FAIL',
      `h1="${teamH1}" overflow=${ov}px clipped=${clip.length ? JSON.stringify(clip) : 'none'}`);

    await page.screenshot({ path: `${process.env.SHOT}/team-${width}.png`, fullPage: true });

    // The invite panel, and whether the link is fully visible
    const inviteBtn = page.locator('bedge-button:has-text("Invite artist")');
    if (await inviteBtn.count()) {
      await inviteBtn.first().click();
      await page.waitForTimeout(400);
      const ovForm = await overflow(page);
      const phoneVisible = await page.locator('#invite-phone').isVisible();
      rec(`22.6-invite@${width}`, (ovForm === 0 && phoneVisible) ? 'PASS' : 'FAIL',
        `invite form: phone input visible=${phoneVisible} overflow=${ovForm}px`);
      await page.screenshot({ path: `${process.env.SHOT}/team-invite-${width}.png`, fullPage: true });
    } else {
      rec(`22.6-invite@${width}`, 'FAIL', 'no "Invite artist" control on the Team screen');
    }

    // ── My hours ───────────────────────────────────────────────────────
    await navTo(page, 'My hours');
    await assertOn(page, '/dashboard/my-hours', 'My hours');

    const hoursH1 = (await page.locator('h1').first().textContent())?.trim();
    const banner = await page.locator('text=/bookable whenever/i').count();
    const ovHours = await overflow(page);
    rec(`22.6-hours@${width}`, (hoursH1 === 'My hours' && ovHours === 0) ? 'PASS' : 'FAIL',
      `h1="${hoursH1}" default-state banner=${banner > 0 ? 'shown' : 'ABSENT'} overflow=${ovHours}px`);

    // Tick a day so the time inputs render, then check they are not clipped.
    const firstDay = page.locator('input[type="checkbox"]').first();
    if (await firstDay.count()) {
      await firstDay.click();
      await page.waitForTimeout(400);
      const times = await page.locator('input[type="time"]').count();
      const ovTicked = await overflow(page);

      // scrollWidth > clientWidth does NOT catch this. WebKit renders a time
      // input in 12-hour form and clips the meridiem below ~118px without
      // overflowing anything - "09:00 AM" simply draws as "09:00 AN". The
      // first run of this suite reported clipped=none while the screenshot
      // showed exactly that. Measure the box instead.
      const MIN_TIME_PX = 118;
      const narrow = await page.locator('input[type="time"]').evaluateAll(
        (els, min) => els.map((e) => Math.round(e.getBoundingClientRect().width))
                         .filter((w) => w > 0 && w < min), MIN_TIME_PX);
      // Page overflow is 0 even when a control spills out of its own card,
      // because the card clips it rather than widening the document. The
      // screenshot showed the second time input 9px past the card edge while
      // every numeric check read clean.
      const spill = await page.locator('input[type="time"]').evaluateAll((els) =>
        els.map((e) => {
          const card = e.closest('[class*="rounded-xl"]');
          if (!card) return 0;
          return Math.round(e.getBoundingClientRect().right -
                            card.getBoundingClientRect().right);
        }).filter((px) => px > 0));

      rec(`22.6-times@${width}`,
        (times >= 2 && narrow.length === 0 && ovTicked === 0 && spill.length === 0) ? 'PASS' : 'FAIL',
        `${times} time inputs, page overflow=${ovTicked}px, ` +
        `too narrow for "09:00 AM" (<${MIN_TIME_PX}px): ${narrow.length ? JSON.stringify(narrow) : 'none'}, ` +
        `spilling past their card: ${spill.length ? JSON.stringify(spill) + 'px' : 'none'}`);
    }
    await page.screenshot({ path: `${process.env.SHOT}/my-hours-${width}.png`, fullPage: true });

    // ── Nav ────────────────────────────────────────────────────────────
    const navText = await page.locator('nav, aside, [role="dialog"]').allTextContents();
    const nav = navText.join(' ');
    const asOwner = ['Team', 'Services', 'Store hours', 'Promos', 'Products']
      .filter((l) => nav.includes(l));
    rec(`22.6-nav@${width}`, asOwner.length === 5 ? 'PASS' : 'FAIL',
      `owner sees ${asOwner.length}/5 owner-only nav entries: ${JSON.stringify(asOwner)}`);

    // ── Join page, unauthenticated ─────────────────────────────────────
    const anon = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true });
    const anonPage = await anon.newPage();
    await anonPage.goto(`${BASE}/join/a-token-that-was-never-issued`, { waitUntil: 'networkidle' });
    await anonPage.waitForTimeout(1500);
    await assertOn(anonPage, '/join/', 'Join (invalid token)');

    const body = (await anonPage.locator('body').textContent()) || '';
    const saysInvalid = /not valid/i.test(body);
    const ovJoin = await overflow(anonPage);

    // Deliberately NOT keyword-matching for "expired" or "revoked". The copy
    // says "It may have already been used, or it may have expired", which
    // lists possibilities without committing to one - that is good copy, and
    // the first version of this check failed it for containing the word.
    //
    // The property that actually matters is that DIFFERENT invalid tokens
    // produce the SAME page, and that is already pinned where it is decided:
    // the API answers unknown, expired, revoked and already-accepted with an
    // identical 404 (suite 22.1c, suite 23.7d), so the page cannot
    // distinguish them. Re-testing it through the DOM would be testing the
    // same thing twice and testing the copy besides.
    rec(`22.6-join@${width}`, (saysInvalid && ovJoin === 0) ? 'PASS' : 'FAIL',
      `invalid link: renders the generic refusal=${saysInvalid} overflow=${ovJoin}px`);
    await anonPage.screenshot({ path: `${process.env.SHOT}/join-invalid-${width}.png`, fullPage: true });
    await anon.close();

    if (consoleErrors.length) {
      rec(`22.6-js@${width}`, 'FAIL', `${consoleErrors.length} page errors: ${JSON.stringify(consoleErrors.slice(0, 2))}`);
    } else {
      rec(`22.6-js@${width}`, 'PASS', 'no uncaught page errors');
    }
  } finally {
    await browser.close();
  }
}

console.log('\n  ── E2E suite 22.6: the three new screens, WebKit ──\n');
for (const w of WIDTHS) {
  console.log(`  ══ ${w}px ══`);
  try { await run(w); } catch (e) { rec(`22.6@${w}`, 'FAIL', `harness: ${e.message}`); }
}
const p = results.filter((r) => r.verdict === 'PASS').length;
const f = results.filter((r) => r.verdict === 'FAIL').length;
console.log(`\n  ${p} pass, ${f} fail\n`);
process.exit(f ? 1 : 0);
