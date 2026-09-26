#!/usr/bin/env node
/**
 * Per-artist services & prices, in a real browser at 390px.
 *
 * Checks 1-8 run in WebKit: logs in within the session and navigates by
 * CLICKING - the refresh cookie is Secure, so WebKit drops it over plain
 * HTTP and page.goto() would bounce to /login. Asserts ELEMENTS and stored
 * values, never loose text - a regex once matched "Verify" inside "verified"
 * and passed a broken button.
 *
 * Check 9 runs in CHROMIUM instead: Chromium keeps a Secure cookie set over
 * http://localhost, so - unlike WebKit - a full page.goto() there does not
 * drop the session. That is exactly what the join step needs after
 * accept(): the app calls auth.refresh() to exchange the invitation-scoped
 * token for one carrying the new salon_id, and that refresh rides the same
 * cookie. This check drives that accept-through-the-UI path for real, in
 * the one engine where it can actually succeed end to end.
 *
 * The whole run works against a THROWAWAY owner + salon + two members,
 * never Rania's real salon (Ruling T14-a) - the permanent roster
 * (user1-10, mkup1-4, rania@bedge.com) is never written, invited, or
 * touched. Setup mirrors the proven helpers in scripts/chaos-booking.py
 * (b-edge-api): register / onboard / approve_artist / seat_plan /
 * verify_phone / join. The OWNER is approved; both MEMBERS are left
 * pending - member1 to prove a pending member reaches My services (Task
 * 12), member2 because check 9 only cares about the join screen, which
 * renders before any admin review happens.
 *
 * Requires the API built with -tags devbypass (for the 000000 phone code).
 *
 * Check 1 verifies a real, discovered defect: at 390px a PENDING member has
 * no reachable path to My services at all (see the comment at check 1's
 * definition below for the root cause). Per this task's rules that defect
 * is reported, not fixed. Checks 2-8 are then re-run against the OWNER
 * (labelled o5-o8 for the money-handling ones; the owner's own row starts
 * already offered=true, so the joiner-only PP-7 assertions don't apply to
 * her) so the shared bedge-service-offerings component still gets verified
 * end to end through a path that IS reachable in a real browser.
 */
import { webkit, chromium } from 'playwright';
import { execFileSync } from 'node:child_process';

const API = 'http://localhost:3000/api/v1';
const DASH = 'http://localhost:4300';
const ADMIN = 'abdallah.kadour@b-edge.com'; // same admin the chaos harness signs in as
const PW = 'password123';

const results = [];
const rec = (id, ok, detail) => {
  results.push(ok);
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${String(id).padEnd(3)} ${detail}`);
};

const sql = (q) => execFileSync('docker', ['exec', '-i', 'bedge-postgres', 'psql', '-U', 'postgres',
  '-d', 'bedge', '-tA', '-v', 'ON_ERROR_STOP=1', '-c', q]).toString().trim();

async function call(method, path, body, token) {
  const r = await fetch(API + path, { method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined });
  return { status: r.status, json: await r.json().catch(() => ({})) };
}
const login = async (email) => (await call('POST', '/auth/login', { email, password: PW })).json.data.access_token;

// Unique per run: a tag-based @test.bedge.com domain and Lebanese mobile
// numbers, never the permanent roster's addresses/numbers.
const tag = String(Date.now()).slice(-6);
const dom = 'test.bedge.com';
const ownerEmail = `t14own.${tag}@${dom}`;
const mem1Email = `t14mem1.${tag}@${dom}`;
const mem2Email = `t14mem2.${tag}@${dom}`;
const emails = [ownerEmail, mem1Email, mem2Email];
const emailList = emails.map((e) => `'${e}'`).join(',');
const phone = (offset) => `+96176${String(Date.now() + offset).slice(-6)}`;
const ownerPhone = phone(0);
const mem1Phone = phone(1);
const mem2Phone = phone(2);
const phoneList = [mem1Phone, mem2Phone].map((p) => `'${p}'`).join(',');
const salonName = `T14 Salon ${tag}`;

const own = (email, col) => sql(`SELECT coalesce(os.${col}::text,'null') FROM artist_services os
  JOIN artists a ON a.id=os.artist_id JOIN users u ON u.id=a.user_id WHERE u.email='${email}' LIMIT 1`);

// The same tally, before and after cleanup, gives a residual count WITH its
// denominator rather than a bare "0" that could just mean the query is
// wrong. Users are counted regardless of deleted_at for the "created"
// snapshot (soft-deleted still means "existed"), and only the live ones
// for the "residual" snapshot (soft-deleted is this app's convention for
// gone - see register()'s own deleted_at=NULL undo in chaos-booking.py).
const tally = (usersLive) => Number(sql(`
  SELECT
      (SELECT count(*) FROM salons WHERE name='${salonName}')
    + (SELECT count(*) FROM artists a JOIN users u ON u.id=a.user_id WHERE u.email IN (${emailList}))
    + (SELECT count(*) FROM artist_services os JOIN artists a ON a.id=os.artist_id
         JOIN users u ON u.id=a.user_id WHERE u.email IN (${emailList}))
    + (SELECT count(*) FROM services WHERE salon_id=(SELECT id FROM salons WHERE name='${salonName}'))
    + (SELECT count(*) FROM stores WHERE salon_id=(SELECT id FROM salons WHERE name='${salonName}'))
    + (SELECT count(*) FROM salon_invitations WHERE phone IN (${phoneList}))
    + (SELECT count(*) FROM subscriptions s JOIN artists a ON a.id=s.artist_id
         JOIN users u ON u.id=a.user_id WHERE u.email IN (${emailList}))
    + (SELECT count(*) FROM users WHERE email IN (${emailList})${usersLive ? ' AND deleted_at IS NULL' : ''})
`));

// The row-level assertions shared by every persona that reaches My
// services: switch/price/deposit/use-salon-price/overflow. `ids` supplies
// the check labels to print, in order; `isJoiner` gates the "starts OFF"
// and "switching on saves" assertions, which only make sense for someone
// whose row was never touched before (a fresh joiner) - an owner's own
// auto-created service already starts offered=true (see project context).
async function runOfferingChecks(page, email, ids, { isJoiner }) {
  const rows = page.locator('bedge-service-offerings li');
  const n = await rows.count();
  const active = Number(sql(`SELECT count(*) FROM services s JOIN artists a ON a.salon_id=s.salon_id
    JOIN users u ON u.id=a.user_id WHERE u.email='${email}' AND s.is_active`));
  let i = 0;
  rec(ids[i++], n === active && n > 0, `${n} rows for ${active} active salon services`);

  const row = rows.first();
  const sw = row.locator('input[role="switch"]');

  if (isJoiner) {
    rec(ids[i++], !(await sw.isChecked()), 'a joiner starts with every service OFF (PP-7)');
    await sw.click();
    await page.waitForTimeout(1500);
    rec(ids[i++], (await sw.isChecked()) && own(email, 'artist_id') !== 'null', 'switching on is saved (a row exists)');
  } else if (!(await sw.isChecked())) {
    await sw.click();
    await page.waitForTimeout(1500);
  }

  await row.locator('input[inputmode="decimal"]').first().fill('200.00');
  await row.locator('bedge-button', { hasText: 'Save' }).click();
  await page.waitForTimeout(1500);
  // Ruling P5: the API trims trailing zeros ("200"), and so does the UI
  // ("$200") - the stored SQL value is still the full "200.00". A loose
  // "$200" substring check would also match "$200.00", so the regex
  // requires $200 NOT to be followed by another digit.
  const rowText5 = await row.innerText();
  rec(ids[i++], own(email, 'price') === '200.00' && /\$200(?!\d)/.test(rowText5),
    `stored '${own(email, 'price')}', shown trimmed ($200, never $200.00)`);

  await row.locator('input[inputmode="decimal"]').nth(1).fill('250.00');
  await row.locator('bedge-button', { hasText: 'Save' }).click();
  await page.waitForTimeout(1500);
  rec(ids[i++], (await row.locator('[role="alert"]').count()) === 1 && own(email, 'deposit_amount') === 'null',
    `a deposit above her price is refused server-side, nothing saved (stored ${own(email, 'deposit_amount')})`);

  await row.locator('bedge-button', { hasText: 'Use salon price' }).click();
  await page.waitForTimeout(1500);
  rec(ids[i++], own(email, 'price') === 'null', 'Use salon price clears her override');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  rec(ids[i++], overflow <= 0, `page overflow at 390px: ${overflow}px`);
}

let wk, cr;
let created = null;
try {
  // ── setup: a throwaway owner + salon + two members ──────────────────
  const admTok = await login(ADMIN);
  if (!admTok) throw new Error('cannot sign in as admin - is ADMIN correct / API up?');

  await call('POST', '/auth/register',
    { name: 'T14 Owner', email: ownerEmail, password: PW, role: 'artist', phone: ownerPhone });
  const ownTokPre = await login(ownerEmail);
  const ob = await call('POST', '/onboarding/complete', {
    handle: `t14-own-${tag}`, category: 'makeup', salon_name: salonName,
    store_name: `${salonName} branch`, city: 'Beirut',
    service_name: `T14 Service ${tag}`, service_duration_min: 60, service_price: '150.00',
  }, ownTokPre);
  if (ob.status >= 400) throw new Error(`onboard owner: ${ob.status} ${JSON.stringify(ob.json.error)}`);
  const ownerArtistId = ob.json.data.artist_id;

  await call('POST', `/admin/artists/${ownerArtistId}/approve`, {}, admTok);
  if (sql(`SELECT status FROM artists WHERE id='${ownerArtistId}'`) !== 'active') {
    sql(`UPDATE artists SET status='active' WHERE id='${ownerArtistId}'`);
  }
  const salonId = sql(`SELECT salon_id FROM artists WHERE id='${ownerArtistId}'`);
  // New salons land on 'solo' (1-seat ceiling, enforced on invite); this
  // throwaway salon needs room for the owner plus two members.
  sql(`UPDATE subscriptions SET plan_code='multi' WHERE artist_id IN
       (SELECT id FROM artists WHERE salon_id='${salonId}')`);
  const ownTok = await login(ownerEmail);

  // Snapshot BEFORE anything else could fail, so the denominator in the
  // teardown report reflects what setup actually built even on an early throw.
  created = tally(false);

  // member 1: registered, phone-verified, invited, ACCEPTED via the API,
  // and left PENDING (never approved) - this is who checks 1-8 drive, to
  // prove a pending member still reaches My services (Task 12).
  await call('POST', '/auth/register',
    { name: 'T14 Mem1', email: mem1Email, password: PW, role: 'artist', phone: mem1Phone });
  const m1tok = await login(mem1Email);
  const v1 = await call('POST', '/artists/me/phone/verify', { code: '000000' }, m1tok);
  if (v1.status >= 400) throw new Error(`phone verify mem1 ${v1.status} - is the API built with -tags devbypass?`);
  const inv1 = await call('POST', '/artists/salon/members/invite', { phone: mem1Phone }, ownTok);
  if (inv1.status >= 400) throw new Error(`invite mem1 ${inv1.status} ${JSON.stringify(inv1.json.error)}`);
  const tok1 = inv1.json.data.link.split('/').pop();
  const acc1 = await call('POST', `/invitations/${tok1}/accept`,
    { handle: `t14-mem1-${tag}`, category: 'makeup' }, m1tok);
  if (acc1.status >= 400) throw new Error(`accept mem1 ${acc1.status} ${JSON.stringify(acc1.json.error)}`);

  // member 2: registered and phone-verified via the API only. NOT accepted
  // here - accepting through the join page's own UI is check 9 itself.
  await call('POST', '/auth/register',
    { name: 'T14 Mem2', email: mem2Email, password: PW, role: 'artist', phone: mem2Phone });
  const m2tok = await login(mem2Email);
  const v2 = await call('POST', '/artists/me/phone/verify', { code: '000000' }, m2tok);
  if (v2.status >= 400) throw new Error(`phone verify mem2 ${v2.status} - is the API built with -tags devbypass?`);
  const inv2 = await call('POST', '/artists/salon/members/invite', { phone: mem2Phone }, ownTok);
  if (inv2.status >= 400) throw new Error(`invite mem2 ${inv2.status} ${JSON.stringify(inv2.json.error)}`);
  const tok2 = inv2.json.data.link.split('/').pop();

  // ── WebKit: checks 1-8, driven as member1 (pending) ──────────────────
  wk = await webkit.launch();
  const page = await (await wk.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  await page.goto(DASH + '/login');
  await page.fill('#email', mem1Email);
  await page.fill('#password', PW);
  await page.click('button[type="submit"], bedge-button button');
  await page.waitForTimeout(2500);
  if (page.url().includes('/login')) throw new Error('login failed (member1) - nothing below would mean anything');

  const more = page.locator('button', { hasText: /More/i }).first();
  if (await more.count()) { await more.click(); await page.waitForTimeout(600); }
  const link = page.locator('a[href="/dashboard/my-services"]:visible').first();
  const visible = (await link.count()) === 1;
  rec('1', visible, 'a PENDING member sees My services in the nav');

  if (visible) {
    await link.click();
    await page.waitForTimeout(2000);
    await runOfferingChecks(page, mem1Email, ['2', '3', '4', '5', '6', '7', '8'], { isJoiner: true });
  } else {
    // REAL DEFECT, not fixed here (out of this task's scope - see report):
    // the mobile bottom nav bar - and with it the ONLY "More" trigger that
    // would reveal this link - is itself wrapped in
    // `@if (mobilePrimaryNavItems().length > 0)` in dashboard-layout.
    // component.html. A pending member's navItems() is collapsed to just
    // profile/my-services/help, none of which are in MOBILE_PRIMARY_PATHS
    // (bookings/calendar/orders/clients), so that whole bar never renders
    // for her at 390px - not even force-clickable, since it's display:none
    // with zero layout box, confirmed by Playwright refusing even a
    // { force: true } click ("Element is not visible"). Only the desktop
    // sidebar's copy of the same <a> exists in the DOM, CSS-hidden below
    // the md breakpoint. Checks 2-8 are therefore genuinely UNREACHABLE for
    // a pending member on a real phone; skipped here (not faked as PASS),
    // and re-verified below against the OWNER instead, who has an
    // unaffected nav and exercises the exact same shared component.
    console.log('  SKIP 2-8 blocked by check 1\'s defect - a pending member has no reachable path to My services at 390px');
  }

  // Supplementary: the OWNER (active, unaffected by the check-1 defect,
  // since her navItems() are never collapsed the same way) exercises the
  // SAME bedge-service-offerings component on her own auto-created
  // service, so the offering logic itself still gets verified end to end
  // even though the pending-member path above could not reach it.
  await page.goto(DASH + '/login');
  await page.fill('#email', ownerEmail);
  await page.fill('#password', PW);
  await page.click('button[type="submit"], bedge-button button');
  await page.waitForTimeout(2500);
  if (page.url().includes('/login')) throw new Error('login failed (owner) - supplementary checks skipped');
  const moreOwner = page.locator('button', { hasText: /More/i }).first();
  if (await moreOwner.count()) { await moreOwner.click(); await page.waitForTimeout(600); }
  const ownerLink = page.locator('a[href="/dashboard/my-services"]:visible').first();
  rec('o1', (await ownerLink.count()) === 1, 'the OWNER (3-artist salon, PP-8 unaffected) sees My services in the nav');
  await ownerLink.click();
  await page.waitForTimeout(2000);
  await runOfferingChecks(page, ownerEmail, ['o-rows', 'o-price', 'o-deposit', 'o-salon', 'o-overflow'], { isJoiner: false });

  // ── Chromium: check 9, the join step's post-accept refresh ──────────
  cr = await chromium.launch();
  const cpage = await (await cr.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  await cpage.goto(DASH + '/login');
  await cpage.fill('#email', mem2Email);
  await cpage.fill('#password', PW);
  await cpage.click('button[type="submit"], bedge-button button');
  await cpage.waitForTimeout(2500);
  if (cpage.url().includes('/login')) throw new Error('login failed (member2, chromium) - check 9 skipped');

  // A full navigation, unlike the WebKit checks above: Chromium keeps the
  // Secure refresh cookie over http://localhost, so the app's bootstrap
  // refresh() on this fresh load restores the session instead of bouncing.
  await cpage.goto(`${DASH}/join/${tok2}`);
  await cpage.fill('#j-handle', `t14-mem2-${tag}`);
  // A plain (trimmed, substring) string match, not an anchored regex - the
  // interpolated button text is indented by the template source, so a
  // regex anchored with ^ never matches its untrimmed textContent.
  const joinBtn = cpage.locator('bedge-button', { hasText: `Join ${salonName}` }).first();
  await joinBtn.click();
  await cpage.waitForTimeout(2500);

  const heading = cpage.locator('h2', { hasText: 'Which services do you offer?' });
  const switches = cpage.locator('input[role="switch"]');
  rec('9', (await heading.count()) === 1 && (await switches.count()) >= 1,
    'accepted through the join page UI in Chromium; services step rendered with switches');
} catch (e) {
  rec('err', false, String(e).slice(0, 200));
} finally {
  if (wk) await wk.close();
  if (cr) await cr.close();

  // ── teardown: everything this run created, in FK-safe order ─────────
  // Mirrors chaos-booking.py's cleanup() (:783) ordering - children before
  // parents - scoped throughout to this run's 3 emails/2 phones/1 salon
  // name, never the permanent roster.
  for (const stmt of [
    `DELETE FROM artist_services WHERE artist_id IN
       (SELECT a.id FROM artists a JOIN users u ON u.id=a.user_id WHERE u.email IN (${emailList}))`,
    // Scoped by user_id/recipient_phone rather than chaos's blanket
    // "template_name='salon_invitation'" delete, which would also remove
    // notification rows for other people's real invitations.
    `DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email IN (${emailList}))
       OR recipient_phone IN (${phoneList})`,
    `DELETE FROM artist_schedules WHERE artist_id IN
       (SELECT a.id FROM artists a JOIN users u ON u.id=a.user_id WHERE u.email IN (${emailList}))`,
    `DELETE FROM salon_invitations WHERE phone IN (${phoneList})
       OR salon_id=(SELECT id FROM salons WHERE name='${salonName}')`,
    `DELETE FROM artist_stores WHERE store_id IN
       (SELECT id FROM stores WHERE salon_id=(SELECT id FROM salons WHERE name='${salonName}'))`,
    `DELETE FROM subscriptions WHERE artist_id IN
       (SELECT a.id FROM artists a JOIN users u ON u.id=a.user_id WHERE u.email IN (${emailList}))`,
    `DELETE FROM salon_payment_methods WHERE salon_id=(SELECT id FROM salons WHERE name='${salonName}')`,
    `DELETE FROM services WHERE salon_id=(SELECT id FROM salons WHERE name='${salonName}')`,
    `DELETE FROM business_hours WHERE store_id IN
       (SELECT id FROM stores WHERE salon_id=(SELECT id FROM salons WHERE name='${salonName}'))`,
    `DELETE FROM business_hours_exceptions WHERE store_id IN
       (SELECT id FROM stores WHERE salon_id=(SELECT id FROM salons WHERE name='${salonName}'))`,
    `DELETE FROM stores WHERE salon_id=(SELECT id FROM salons WHERE name='${salonName}')`,
    `DELETE FROM artists WHERE user_id IN (SELECT id FROM users WHERE email IN (${emailList}))`,
    `DELETE FROM audit_events WHERE salon_id=(SELECT id FROM salons WHERE name='${salonName}')`,
    `DELETE FROM salons WHERE name='${salonName}'`,
    `DELETE FROM refresh_tokens WHERE user_id IN (SELECT id FROM users WHERE email IN (${emailList}))`,
    // Soft delete, matching this app's own convention (register() in
    // chaos-booking.py undoes exactly this with deleted_at=NULL on rerun).
    `UPDATE users SET deleted_at=NOW() WHERE email IN (${emailList})`,
  ]) {
    try { sql(stmt); } catch (e) { console.log(`  cleanup: ${String(e).slice(0, 160)}`); }
  }

  const residual = tally(true);
  console.log(`\n  cleanup: ${residual} residual out of ${created ?? '?'} rows this run created`);
  console.log(`  ${results.filter(Boolean).length} pass, ${results.filter((x) => !x).length} FAIL`);
}
