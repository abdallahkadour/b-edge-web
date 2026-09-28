/**
 * E2E journeys 1-16 — the screen half, in a real browser at 390px.
 *
 * E2E-TEST-PLAN.md Suites 1-16 were written as manual journeys. This drives
 * the parts that are about SCREENS (redirect guards, forms, field errors,
 * what a customer sees); b-edge-api/scripts/e2e-journeys.py drives the parts
 * that are about behaviour. Both build their own data under a tag and tear it
 * down with chaos-booking.py's cleanup(), so there is one teardown.
 *
 * Chromium, not WebKit, on purpose: Chromium treats http://localhost as a
 * secure context and keeps the Secure refresh cookie, so page.goto() works
 * after login. That matters here because several cases ARE "type a URL" -
 * the redirect guards in 1.4. (WebKit drops that cookie over plain HTTP; the
 * other UI scripts in this folder log in and click for that reason.)
 *
 * Rules from security plan 3.4c: assert identity before measuring (an
 * overflow of 0 on the login page is not a pass), report what was seen.
 *
 *   node scripts/e2e-journeys-ui.mjs            # all suites
 *   node scripts/e2e-journeys-ui.mjs 1 3        # just suites 1 and 3
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';

const DASH = 'http://localhost:4300';
const PWA = 'http://localhost:4200';
const API = 'http://localhost:3000/api/v1';
const TAG = 'j1';            // every account and salon this run creates carries it
const PW = 'password123';
const ADMIN = 'abdallah.kadour@b-edge.com';
const API_DIR = new URL('../../b-edge-api/', import.meta.url).pathname;

const results = [];
const rec = (id, verdict, detail) => {
  results.push([id, verdict, detail]);
  console.log(`  ${verdict.padEnd(5)} ${id.padEnd(7)} ${detail}`);
};

function sql(q) {
  return execFileSync('docker', ['exec', '-i', 'bedge-postgres', 'psql', '-U', 'postgres', '-d', 'bedge',
    '-tA', '-v', 'ON_ERROR_STOP=1', '-c', q], { encoding: 'utf8' })
    .split('\n').filter((l) => l && !/^(INSERT|UPDATE|DELETE|SELECT) \d/.test(l)).join('\n').trim();
}

async function api(method, path, body, token) {
  const r = await fetch(API + path, {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  let json = {};
  try { json = text ? JSON.parse(text) : {}; } catch { /* non-JSON */ }
  return [r.status, json];
}
const errCode = (j) => j?.error?.code;
const login = async (email) => (await api('POST', '/auth/login', { email, password: PW }))[1]?.data?.access_token;

/** Registers and onboards an artist through the API - setup for cases that
 *  are not ABOUT onboarding. Returns { email, artistId, salonId }. */
async function apiArtist(key, phoneDigits) {
  const email = `${TAG}.${key}@test.bedge.com`;
  sql(`UPDATE users SET deleted_at = NULL WHERE email = '${email}'`);
  await api('POST', '/auth/register', { name: `${TAG} ${key}`, email, password: PW, role: 'artist', phone: `+961${phoneDigits}` });
  const tok = await login(email);
  const [st, r] = await api('POST', '/onboarding/complete', {
    handle: `${TAG}-${key}`, category: 'makeup', salon_name: `${TAG} Salon ${key}`, store_name: `${TAG} ${key} branch`,
    city: 'Beirut', service_name: `${TAG} Bridal`, service_duration_min: 60, service_price: '150.00',
  }, tok);
  if (st >= 400) throw new Error(`onboard ${key}: ${st} ${errCode(r)}`);
  const artistId = r?.data?.artist_id;
  return { email, artistId, salonId: sql(`SELECT salon_id FROM artists WHERE id='${artistId}'`) };
}

async function signIn(page, base, email) {
  await page.goto(`${base}/login`);
  await page.fill('#email', email);
  await page.fill('#password', PW);
  await page.getByRole('button', { name: /^Sign in$/ }).click();
}

const path = (page) => new URL(page.url()).pathname;

/** Waits until the app has finished loading AND its route guards have run.
 *  Reading the URL at the first match of /dashboard or /onboarding caught
 *  the router mid-redirect on the first run - a guard sends a pending
 *  artist on to /onboarding a moment after /dashboard/bookings. */
async function settle(page) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(800);
}

// ── Suite 1 — Bring a new artist from zero to bookable ────────────────────

async function suite1(browser) {
  // Fresh every run: cleanup() soft-deletes users, and a soft-deleted user
  // still holds her email and phone, so reusing them made the second run's
  // sign-up a (correctly refused) duplicate.
  const stamp = String(Date.now()).slice(-6);
  const email = `${TAG}.new${stamp}@test.bedge.com`;
  const phoneDigits = `7636${stamp.slice(-4)}`;
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();

  // 1.1 sign up through the form
  await page.goto(`${DASH}/register`);
  await page.fill('#name', `${TAG} New`);
  await page.fill('#email', email);
  await page.fill('#phone', phoneDigits);
  await page.fill('#password', PW);
  await page.fill('#confirm-password', PW);
  await page.getByRole('button', { name: /Create account/ }).click();
  await settle(page);
  await page.getByRole('button', { name: 'Submit for review' }).waitFor({ timeout: 10000 }).catch(() => {});
  const formShown = await page.getByRole('button', { name: 'Submit for review' }).count();
  if (!formShown) console.log('    register page says:', (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 200));
  rec('1.1', path(page) === '/onboarding' && formShown ? 'PASS' : 'FAIL',
    `after Create account: ${path(page)}, onboarding form shown: ${formShown > 0}`);

  // 1.2 a fresh login lands on onboarding, by the guard
  await ctx.clearCookies();
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await signIn(page, DASH, email);
  await settle(page);
  rec('1.2', path(page) === '/onboarding' ? 'PASS' : 'FAIL', `login lands on ${path(page)}`);

  // 1.3 validation first, then a real submission
  const fill = async (v) => {
    await page.getByLabel('Your public handle').fill(v.handle);
    await page.selectOption('#ob-category', 'makeup');
    await page.getByPlaceholder('e.g. Sarah Beauty Studio').fill(`${TAG} Salon New`);
    await page.getByPlaceholder('Downtown').fill(`${TAG} New branch`);
    await page.getByPlaceholder('Beirut').fill('Beirut');
    await page.getByPlaceholder('e.g. Bridal Makeup').fill(`${TAG} Bridal`);
    const dur = page.locator('input[type="number"]').first();
    await dur.fill(String(v.duration));
    await page.fill('#ob-price', v.price);
  };

  // Three of these never reach the server: the form keeps "Submit for
  // review" disabled until the handle is 3+ characters, the price is a
  // plain amount and the duration is 15-480. The plan asks for a field-level
  // error; what is measured is whether anything ON SCREEN says why the
  // button is disabled, since a greyed-out button alone tells her nothing.
  const submit = page.getByRole('button', { name: 'Submit for review' });
  const clientCases = [
    ['empty handle', { handle: '', duration: 60, price: '150.00' }, /at least 3|3 characters|required/i],
    ['negative price', { handle: `${TAG}-new${stamp}`, duration: 60, price: '-5' }, /price must|positive|more than|valid price|price like|at least \$?0/i],
    ['zero duration', { handle: `${TAG}-new${stamp}`, duration: 0, price: '150.00' }, /15|480|minutes? (minimum|at least)/i],
  ];
  for (const [name, v, rule] of clientCases) {
    await fill(v);
    await page.waitForTimeout(300);
    const disabled = await submit.isDisabled();
    const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    const explained = rule.test(text);
    rec(`1.3 ${name}`, disabled && explained ? 'PASS' : 'FAIL',
      `submit disabled: ${disabled}; anything on screen says why: ${explained}`);
  }
  // Taken handle: only the server knows, so submit and read the answer.
  await fill({ handle: 'rania', duration: 60, price: '150.00' });
  await submit.click();
  await page.waitForTimeout(1500);
  const takenField = await page.locator('p.text-xs.text-danger').allInnerTexts();
  const takenBanner = (await page.locator('.bg-danger-light').allInnerTexts()).join(' ');
  rec('1.3 handle taken', takenField.length || /taken/i.test(takenBanner) ? 'PASS' : 'FAIL',
    `field error: ${JSON.stringify(takenField)}; message: "${takenBanner.slice(0, 80)}"`);
  await fill({ handle: `${TAG}-new${stamp}`, duration: 60, price: '150.00' });
  await page.getByRole('button', { name: 'Submit for review' }).click();
  await page.getByText('Your application is under review').waitFor({ timeout: 10000 }).catch(() => {});
  const pendingShown = await page.getByText('Your application is under review').count();
  const row = sql(`SELECT a.status || '|' || (SELECT count(*) FROM stores WHERE salon_id=a.salon_id) || '|' ||
    (SELECT count(*) FROM services WHERE salon_id=a.salon_id) FROM artists a JOIN users u ON u.id=a.user_id WHERE u.email='${email}'`);
  rec('1.3', pendingShown && row === 'pending|1|1' ? 'PASS' : 'FAIL',
    `pending review shown: ${pendingShown > 0}; artist status|stores|services = ${row}`);

  // 1.4 while pending, only Profile and My services are reachable. The
  // plan said "redirected back to /onboarding"; the dashboard deliberately
  // sends a PENDING artist to Profile instead (PENDING_ALLOWED_PATHS[0] in
  // dashboard-layout.component.ts) so she can add photos and choose her
  // services while she waits. Measured against that design.
  const tried = {};
  for (const url of ['/dashboard/bookings', '/dashboard/services', '/dashboard/earnings', '/dashboard/clients',
    '/dashboard/profile', '/dashboard/my-services']) {
    await page.goto(DASH + url);
    await settle(page);
    tried[url] = path(page);
  }
  const blocked = ['/dashboard/bookings', '/dashboard/services', '/dashboard/earnings', '/dashboard/clients']
    .every((u) => tried[u] === '/dashboard/profile');
  const allowed = tried['/dashboard/profile'] === '/dashboard/profile' && tried['/dashboard/my-services'] === '/dashboard/my-services';
  rec('1.4', blocked && allowed ? 'PASS' : 'FAIL', `while pending: ${JSON.stringify(tried)}`);

  // 1.5 admin approves her, and rejects a second applicant
  const second = await apiArtist(`reject${stamp}`, `7637${stamp.slice(-4)}`);
  const actx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const admin = await actx.newPage();
  await signIn(admin, DASH, ADMIN);
  await settle(admin);
  await admin.goto(`${DASH}/admin`);
  await settle(admin);
  const card = admin.locator('div', { hasText: `${TAG}-new${stamp}` }).filter({ has: admin.getByRole('button', { name: 'Approve' }) }).last();
  await card.waitFor({ timeout: 10000 }).catch(() => {});
  const artistId = sql(`SELECT a.id FROM artists a JOIN users u ON u.id=a.user_id WHERE u.email='${email}'`);
  if (await card.count()) {
    await card.getByRole('button', { name: 'Approve' }).click();
    await admin.waitForTimeout(1500);
  }
  const status = sql(`SELECT status FROM artists WHERE id='${artistId}'`);
  const stillListed = await admin.getByText(`${TAG}-new${stamp}`, { exact: true }).count();
  const audited = sql(`SELECT count(*) FROM audit_events WHERE entity_id='${artistId}' AND action='approved'`);
  rec('1.5 approve', status === 'active' && !stillListed && audited !== '0' ? 'PASS' : 'FAIL',
    `status ${status}; still in the queue: ${stillListed > 0}; audit rows: ${audited}`);

  const reason = `${TAG}-private-reason-${Date.now()}`;
  await admin.reload();
  const rcard = admin.locator('div', { hasText: `${TAG}-reject${stamp}` }).filter({ has: admin.getByRole('button', { name: 'Reject' }) }).last();
  await rcard.waitFor({ timeout: 10000 }).catch(() => {});
  if (await rcard.count()) {
    await rcard.getByRole('button', { name: 'Reject' }).click();
    await admin.getByPlaceholder('Visible only in the audit log, not to the artist').fill(reason);
    await admin.getByRole('button', { name: 'Confirm reject' }).click();
    await admin.waitForTimeout(1500);
  }
  const rstatus = sql(`SELECT status FROM artists WHERE id='${second.artistId}'`);
  const reasonAudited = sql(`SELECT count(*) FROM audit_events WHERE entity_id='${second.artistId}' AND new_values->>'reason'='${reason}'`);
  const rctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const rpage = await rctx.newPage();
  await signIn(rpage, DASH, second.email);
  await settle(rpage);
  const rejectedShown = await rpage.getByText("Your application wasn't approved").count();
  const reasonLeaked = (await rpage.content()).includes(reason);
  rec('1.5 reject', rstatus === 'rejected' && rejectedShown && !reasonLeaked && reasonAudited === '1' ? 'PASS' : 'FAIL',
    `status ${rstatus}; artist sees the rejected state: ${rejectedShown > 0}; typed reason on her screen: ${reasonLeaked}; in the audit log: ${reasonAudited === '1'}`);

  // 1.6 approved: a fresh login lands on bookings with the full nav
  const nctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const npage = await nctx.newPage();
  await signIn(npage, DASH, email);
  await settle(npage);
  const underReview = await npage.getByText(/under review/i).count();
  const navLinks = await npage.locator('nav a:visible, nav button:visible').count();
  rec('1.6', path(npage) === '/dashboard/bookings' && !underReview && navLinks >= 4 ? 'PASS' : 'FAIL',
    `lands on ${path(npage)}; visible nav entries: ${navLinks}; "under review" shown: ${underReview > 0}`);

  await ctx.close(); await actx.close(); await rctx.close(); await nctx.close();
}

// ── Suite 5 — the logged-in customer account ──────────────────────────────

/** Signs a customer in through the real screens. "Send code" would queue a
 *  real WhatsApp message to whatever number is typed, so that ONE request is
 *  answered here and never reaches the API; the code itself is the dev
 *  bypass, verified by the real API (-tags devbypass). */
async function customerSignIn(page, localDigits) {
  await page.route('**/api/v1/customer-auth/request-otp', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: { message: 'Verification code sent', delivery_looks_broken: false }, error: null, meta: null }) }));
  await page.goto(`${PWA}/login`);
  await settle(page);
  await page.locator('input[type="tel"]').first().fill(localDigits);
  await page.getByRole('button', { name: 'Send code' }).click();
  await page.fill('#login-code', '000000');
  await page.getByRole('button', { name: 'Verify' }).click();
  await settle(page);
}

async function suite5(browser) {
  const stamp = String(Date.now()).slice(-4);
  const digits = `763698${stamp.slice(-2)}`;
  const artist = await apiArtist(`s5${stamp}`, `7637${stamp}`);
  const otok = await login(artist.email);
  const store = sql(`SELECT id FROM stores WHERE salon_id='${artist.salonId}' LIMIT 1`);
  const service = sql(`SELECT id FROM services WHERE salon_id='${artist.salonId}' LIMIT 1`);
  // the customer exists once she has signed in once
  const [, v] = await api('POST', '/customer-auth/verify-otp', { phone: `+961${digits}`, code: '000000' });
  const ctok = v?.data?.access_token;
  const cid = sql(`SELECT id FROM users WHERE phone='+961${digits}' AND deleted_at IS NULL`);
  const mk = (when, status) => sql(`INSERT INTO bookings (salon_id,store_id,artist_id,customer_id,service_id,start_time,end_time,
    blocked_until,original_price,final_price,deposit_amount,status) VALUES ('${artist.salonId}','${store}','${artist.artistId}','${cid}',
    '${service}',${when},${when}+interval '1 hour',${when}+interval '1 hour',150,150,0,'${status}') RETURNING id`);
  const pastPending = mk(`NOW() - interval '2 days'`, 'pending');
  const upcoming = mk(`NOW() + interval '5 days'`, 'confirmed');
  const [, p] = await api('POST', '/artists/salon/products', { name: `${TAG} Balm`, category: 'skincare', price: '12.00', stock_quantity: 9 }, otok);
  const pid = p?.data?.id;
  const order = async () => (await api('POST', '/orders', { salon_id: artist.salonId, name: `${TAG} Buyer`, phone: `+961${digits}`,
    delivery_lat: 33.89, delivery_lng: 35.5, items: [{ product_id: pid, quantity: 1 }] }))[1]?.data?.id;
  const liveOrder = await order();
  const cancelled = await order();
  await api('PATCH', `/orders/${cancelled}/cancel`, { reason: `${TAG} changed my mind` }, ctok);

  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  // 5.1
  await customerSignIn(page, digits);
  rec('5.1', path(page) === '/my-bookings' ? 'PASS' : 'FAIL', `after Verify: ${path(page)}`);
  // 5.2 a pending booking whose time has passed is Past, not Upcoming
  // Button text starts with whitespace, so no ^ anchors (the first run's
  // anchored patterns matched nothing and read as empty tabs).
  const tabs = (await page.locator('button', { hasText: /(Upcoming|Past) \(/ }).allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim());
  // The tabs are styled uppercase, so innerText is "UPCOMING (1)".
  const up = tabs.find((t) => /^upcoming/i.test(t)); const past = tabs.find((t) => /^past/i.test(t));
  rec('5.2 tabs', /^upcoming \(1\)$/i.test(up ?? '') && /^past \(1\)$/i.test(past ?? '') ? 'PASS' : 'FAIL',
    `tabs: ${JSON.stringify(tabs)} (1 future confirmed, 1 pending whose time has passed)`);
  await page.locator(`[role="button"], button, a`).filter({ hasText: /Bridal/ }).first().click().catch(() => {});
  await settle(page);
  const inDetail = path(page);
  const back = page.getByRole('button', { name: 'Back' });
  const backLabelled = await back.count();
  if (backLabelled) await back.first().click();
  await settle(page);
  rec('5.2 detail', /^\/my-bookings\/[0-9a-f-]{36}$/.test(inDetail) && backLabelled && path(page) === '/my-bookings' ? 'PASS' : 'FAIL',
    `card -> ${inDetail}; back button labelled "Back": ${backLabelled > 0}; back -> ${path(page)}`);
  // 5.3 orders expand in place; a cancelled one shows its reason
  await page.goto(`${PWA}/my-orders`);
  await settle(page);
  const card = page.locator('button').filter({ hasText: /Balm|\$12/ }).first();
  await card.click().catch(() => {});
  await page.waitForTimeout(500);
  const expanded = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  rec('5.3 expand', /Balm/.test(expanded) && /(placed|confirmed|shipped|delivered)/i.test(expanded) ? 'PASS' : 'FAIL',
    `expanded card shows the item and a status timeline: items ${/Balm/.test(expanded)}, timeline ${/(placed|confirmed|shipped|delivered)/i.test(expanded)}`);
  await page.locator('button', { hasText: /Cancelled \(/ }).first().click().catch(() => {});
  await page.waitForTimeout(400);
  await page.locator('button').filter({ hasText: /Balm|\$12/ }).first().click().catch(() => {});
  await page.waitForTimeout(500);
  const cancelledText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  rec('5.3 cancelled', cancelledText.includes(`${TAG} changed my mind`) ? 'PASS' : 'FAIL',
    `the cancelled order shows its reason: ${cancelledText.includes(`${TAG} changed my mind`)}`);
  // 5.4 sign out, back in, history intact
  await page.getByRole('button', { name: 'Sign out' }).first().click();
  await settle(page);
  const afterOut = path(page);
  await customerSignIn(page, digits);
  const again = (await page.locator('button', { hasText: /Upcoming \(/ }).allInnerTexts()).join('');
  rec('5.4', afterOut === '/' && path(page) === '/my-bookings' && again.includes('(1)') ? 'PASS' : 'FAIL',
    `sign out -> ${afterOut}; back in -> ${path(page)}, ${again.replace(/\s+/g, ' ')}`);
  await ctx.close();
  sql(`DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE salon_id='${artist.salonId}')`);
  sql(`DELETE FROM orders WHERE salon_id='${artist.salonId}'`);
  sql(`DELETE FROM products WHERE salon_id='${artist.salonId}'`);
  sql(`DELETE FROM notifications WHERE booking_id IN ('${pastPending}','${upcoming}') OR user_id='${cid}'`);
  sql(`DELETE FROM bookings WHERE id IN ('${pastPending}','${upcoming}')`);
  sql(`DELETE FROM refresh_tokens WHERE user_id='${cid}'`);
  sql(`DELETE FROM users WHERE id='${cid}'`);
  void liveOrder;
}

// ── Screens for Suites 2, 4, 9, 10, 13, 14, 15 ────────────────────────────
//
// The behaviour of these suites is driven through the API by
// b-edge-api/scripts/e2e-journeys.py. What only a browser can show is here.

async function suiteScreens(browser) {
  const stamp = String(Date.now()).slice(-4);
  const artist = await apiArtist(`scr${stamp}`, `7638${stamp}`);
  const handle = `${TAG}-scr${stamp}`;
  const adminTok = await login(ADMIN);
  await api('POST', `/admin/artists/${artist.artistId}/approve`, {}, adminTok);
  sql(`UPDATE artists SET status='active' WHERE id='${artist.artistId}'`);
  if (sql(`SELECT count(*) FROM subscriptions WHERE artist_id='${artist.artistId}'`) === '0') {
    sql(`INSERT INTO subscriptions (artist_id, plan_code, monthly_price) VALUES ('${artist.artistId}','comped',0)`);
  }
  sql(`UPDATE subscriptions SET plan_code='comped', monthly_price=0 WHERE artist_id='${artist.artistId}'`);
  const tok = await login(artist.email);
  const storeA = sql(`SELECT id FROM stores WHERE salon_id='${artist.salonId}' LIMIT 1`);
  const service = sql(`SELECT id FROM services WHERE salon_id='${artist.salonId}' LIMIT 1`);
  const beirutDow = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Beirut', weekday: 'short' })
    .formatToParts(new Date()).find((p) => p.type === 'weekday').value.replace(/Sun/, '0').replace(/Mon/, '1').replace(/Tue/, '2')
    .replace(/Wed/, '3').replace(/Thu/, '4').replace(/Fri/, '5').replace(/Sat/, '6'));
  await api('POST', `/artists/stores/${storeA}/hours`, { day_of_week: beirutDow, open_time: '00:00:00', close_time: '23:59:00', is_open: true }, tok);
  const [, sb] = await api('POST', '/artists/salon/stores', { name: `${TAG} NoHours`, city: 'Beirut' }, tok);
  sql(`DELETE FROM business_hours WHERE store_id='${sb?.data?.id}'`);
  await api('PATCH', `/artists/salon/services/${service}`, { buffer_min: 30 }, tok);
  const [, sold] = await api('POST', '/artists/salon/products', { name: `${TAG} Sold Serum`, category: 'skincare', price: '10.00', stock_quantity: 0 }, tok);
  const [, live] = await api('POST', '/artists/salon/products', { name: `${TAG} Live Balm`, category: 'skincare', price: '12.00', stock_quantity: 5 }, tok);
  const url = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
  const photo = sql(`INSERT INTO media (owner_type, owner_id, url, type, display_order) VALUES ('artist','${artist.artistId}','${url}','photo',0) RETURNING id`);
  await api('PUT', `/media/${photo}/services`, { service_ids: [service] }, tok);
  const user = sql(`SELECT user_id FROM artists WHERE id='${artist.artistId}'`);
  for (let i = 0; i < 12; i++) sql(`INSERT INTO user_notifications (user_id, kind, level, title) VALUES ('${user}','${TAG}_test','info','${TAG} note ${i}')`);
  const cust = sql(`SELECT id FROM users WHERE role='customer' AND deleted_at IS NULL ORDER BY created_at LIMIT 1`);
  const calTok = [...Array(64)].map(() => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
  const booking = sql(`INSERT INTO bookings (salon_id,store_id,artist_id,customer_id,service_id,start_time,end_time,blocked_until,
    original_price,final_price,deposit_amount,status,calendar_token) VALUES ('${artist.salonId}','${storeA}','${artist.artistId}','${cust}',
    '${service}',NOW()+interval '6 days',NOW()+interval '6 days 1 hour',NOW()+interval '6 days 1 hour',150,150,0,'confirmed','${calTok}') RETURNING id`);

  const mobile = { viewport: { width: 390, height: 844 } };
  // 9.1 / 9.4 / 10.5 / 15.1 - the customer's artist profile, in Beirut
  const bctx = await browser.newContext({ ...mobile, timezoneId: 'Asia/Beirut' });
  const bp = await bctx.newPage();
  await bp.goto(`${PWA}/book/${handle}`);
  await settle(bp);
  const beirutText = (await bp.locator('body').innerText()).replace(/\s+/g, ' ');
  const closesB = (beirutText.match(/Closes [0-9:APM ]+/) || [''])[0].trim();
  // The badge is styled uppercase, so its rendered text is "OPEN NOW".
  const badges = await bp.getByText(/^(Open now|Closed)$/i).count();
  const openNow = /open now/i.test(beirutText);
  rec('9.1', openNow && closesB ? 'PASS' : 'FAIL', `profile shows "Open now": ${openNow}; "${closesB}"`);
  rec('9.4', badges === 1 ? 'PASS' : 'FAIL', `2 stores, one with no hours at all: ${badges} badge(s) rendered (the unknown one must have none)`);
  const chips = await bp.getByRole('button', { name: /^All$/ }).count();
  const chipForService = await bp.getByRole('button', { name: /Bridal/ }).count();
  rec('10.5', chips && chipForService ? 'PASS' : 'FAIL', `gallery chips: "All" ${chips > 0}, the tagged service ${chipForService > 0}`);
  rec('15.1', !/cleanup|buffer/i.test(beirutText) ? 'PASS' : 'FAIL',
    `the customer's page mentions cleanup/buffer: ${/cleanup|buffer/i.test(beirutText)} (the service has a 30-min buffer)`);
  // 9.2 - the same profile from New York shows the salon's time
  const nctx = await browser.newContext({ ...mobile, timezoneId: 'America/New_York' });
  const np = await nctx.newPage();
  await np.goto(`${PWA}/book/${handle}`);
  await settle(np);
  const closesN = ((await np.locator('body').innerText()).replace(/\s+/g, ' ').match(/Closes [0-9:APM ]+/) || [''])[0].trim();
  rec('9.2', closesB && closesN === closesB ? 'PASS' : 'FAIL', `Beirut device "${closesB}"; New York device "${closesN}"`);
  await nctx.close();

  // 4.2 sold out, 4.4 checkout lands on payment instructions, not a login wall
  await bp.goto(`${PWA}/shop/${artist.artistId}`);
  await settle(bp);
  // "Sold out" sits over the product image, beside the name block; the add
  // control is named "Add <product> to cart". The in-stock product is the
  // positive control for that name.
  const soldAdd = await bp.getByRole('button', { name: `Add ${TAG} Sold Serum to cart` }).count();
  const liveAdd = await bp.getByRole('button', { name: `Add ${TAG} Live Balm to cart` }).count();
  const soldLabels = ((await bp.locator('body').innerText()).match(/sold out/gi) || []).length;
  rec('4.2', soldAdd === 0 && liveAdd === 1 && soldLabels === 1 ? 'PASS' : 'FAIL',
    `"Sold out" labels: ${soldLabels}; add control on the sold-out product: ${soldAdd}, on the in-stock one: ${liveAdd}`);
  await bp.evaluate((p) => localStorage.setItem('bedge_cart', JSON.stringify([{ productId: p, quantity: 1 }])), live?.data?.id);
  await bp.goto(`${PWA}/shop/${artist.artistId}/cart`);
  await settle(bp);
  await bp.getByPlaceholder('Your name').fill(`${TAG} Buyer`).catch(() => {});
  await bp.locator('input[type="tel"]').first().fill(`7638${stamp}`).catch(() => {});
  await bp.getByRole('button', { name: /Confirm this location/i }).click().catch(() => {});
  await bp.getByRole('button', { name: /Place order/i }).last().click().catch(() => {});
  await settle(bp);
  const confirmedText = (await bp.locator('body').innerText()).replace(/\s+/g, ' ');
  // A guest cannot read her own order back, so the page shows the
  // instructions without the amount ("Send your payment...") - still the
  // instructions, and not a login wall.
  const instructions = /Send (\$|your payment)/.test(confirmedText);
  rec('4.4', /\/confirmed\//.test(path(bp)) && instructions && !path(bp).includes('login') ? 'PASS' : 'FAIL',
    `after Place order: ${path(bp)}; payment instructions shown: ${instructions}`);
  const pin = sql(`SELECT count(*) FROM orders WHERE salon_id='${artist.salonId}' AND delivery_lat IS NOT NULL AND delivery_lng IS NOT NULL`);
  rec('4.4 pin', pin === '1' ? 'PASS' : 'FAIL', `orders with a stored pin: ${pin}`);
  await bctx.close();

  // 13.7 the bell - 9+, Escape returns focus, stays inside 390px
  const dctx = await browser.newContext(mobile);
  const dp = await dctx.newPage();
  await signIn(dp, DASH, artist.email);
  await settle(dp);
  const bell = dp.getByRole('button', { name: 'Notifications' }).first();
  const badge = (await bell.innerText().catch(() => '')).replace(/\s+/g, '');
  await bell.click();
  await dp.waitForTimeout(600);
  await dp.keyboard.press('Escape');
  await dp.waitForTimeout(300);
  const focus = await dp.evaluate(() => document.activeElement?.getAttribute('aria-label'));
  await bell.click();
  await dp.waitForTimeout(600);
  const overflow = await dp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  rec('13.7', badge.includes('9+') && /^Notifications/.test(focus ?? '') && overflow <= 0 ? 'PASS' : 'FAIL',
    `12 unread -> badge "${badge}"; focus after Escape: ${focus}; horizontal overflow with the panel open: ${overflow}px`);
  await dp.keyboard.press('Escape');

  // 2.1 add a store from Hours: a new tab, selected
  await dp.goto(`${DASH}/dashboard/hours`);
  await settle(dp);
  await dp.getByRole('button', { name: 'Add store' }).first().click();
  await dp.getByPlaceholder('e.g. Beirut Downtown').fill(`${TAG} Verdun`);
  await dp.getByPlaceholder('e.g. Tripoli').fill('Beirut');
  await dp.getByRole('button', { name: 'Add store' }).last().click();
  await settle(dp);
  const newTab = dp.getByRole('button', { name: `${TAG} Verdun` });
  const selected = await newTab.getAttribute('class').catch(() => '');
  rec('2.1', (await newTab.count()) && /border-ink/.test(selected || '') ? 'PASS' : 'FAIL',
    `new store tab shown: ${(await newTab.count()) > 0}; auto-selected: ${/border-ink/.test(selected || '')}`);
  await dctx.close();

  // 14.7 the calendar landing page at 390px
  const cctx = await browser.newContext(mobile);
  const cp = await cctx.newPage();
  await cp.goto(`http://localhost:3000/c/${calTok}`);
  const calOverflow = await cp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const google = await cp.getByRole('link', { name: /Google Calendar/ }).count();
  const ics = await cp.locator('a[href$=".ics"]').count();
  rec('14.7 page', calOverflow <= 0 && google && ics ? 'PASS' : 'FAIL',
    `overflow ${calOverflow}px; Google button ${google > 0}; file download ${ics > 0}`);
  await cctx.close();

  sql(`DELETE FROM user_notifications WHERE user_id='${user}'`);
  sql(`DELETE FROM media WHERE id='${photo}'`);
  sql(`DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE salon_id='${artist.salonId}')`);
  sql(`DELETE FROM orders WHERE salon_id='${artist.salonId}'`);
  sql(`DELETE FROM products WHERE salon_id='${artist.salonId}'`);
  sql(`DELETE FROM notifications WHERE booking_id='${booking}'`);
  sql(`DELETE FROM users WHERE phone='+9617638${stamp}' AND role='customer'`);
  void sold;
}

// ── runner ────────────────────────────────────────────────────────────────

const SUITES = { 1: suite1, 5: suite5, 99: suiteScreens };

function cleanup() {
  // chaos-booking.py's cleanup(), keyed on this TAG: one teardown for every harness.
  const py = `
import importlib.util
spec = importlib.util.spec_from_file_location("chaos", "scripts/chaos-booking.py")
c = importlib.util.module_from_spec(spec); spec.loader.exec_module(c)
c.TAG = "${TAG}"
c.cleanup()`;
  try {
    const out = execFileSync('python3', ['-c', py], { cwd: API_DIR, encoding: 'utf8', env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } });
    console.log(out.trim().split('\n').slice(-1)[0]);
  } catch (e) { console.log('  cleanup FAILED:', e.message.slice(0, 200)); }
}

const wanted = process.argv.slice(2).map(Number).filter(Boolean);
const browser = await chromium.launch();
try {
  for (const [n, fn] of Object.entries(SUITES)) {
    if (wanted.length && !wanted.includes(Number(n))) continue;
    console.log(`\n  ── Suite ${n} ──`);
    try { await fn(browser); } catch (e) { rec(`${n}.err`, 'FAIL', `harness: ${e.message.split('\n')[0]}`); }
  }
} finally {
  await browser.close();
  cleanup();
  const p = results.filter((r) => r[1] === 'PASS').length;
  const f = results.filter((r) => r[1] === 'FAIL').length;
  console.log(`\n  ${p} pass, ${f} FAIL\n`);
  process.exitCode = f ? 1 : 0;
}
