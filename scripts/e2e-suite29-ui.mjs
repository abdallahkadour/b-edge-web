/**
 * E2E Suite 29 — the features built on 2026-10-09, in a real browser.
 *
 *   29.1  admin -> Bookings: every salon's bookings, led by the refunds owed;
 *         the figure matches the database, and tapping it filters to them
 *   29.2  the no-show deposit rule (D29): two no-shows at a salon -> half the
 *         price as a deposit for a no-deposit service; one -> none; another
 *         salon's -> none; turned off -> none. The owner changes the setting
 *         in Profile; the artist's card and the customer's booking say why
 *   29.3  favourites: signed out, the heart asks her to sign in and brings her
 *         back; signed in, it saves the artist, who is then under My
 *         Bookings -> Favourites, where the heart forgets her again
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
const PWA = 'http://localhost:4200';
const API = 'http://localhost:3000/api/v1';
const TAG = 's29u';
const API_DIR = new URL('../../b-edge-api/', import.meta.url).pathname;
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

/** Waits out the API's GENERAL request limit (and only that code), like the
 *  Python harnesses: run straight after the other suites, the setup here
 *  spends enough of the 600-per-5-minutes budget that the dashboard's own
 *  calls were refused and the page rendered without the setting. */
async function api(method, path, body, token) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const r = await fetch(API + path, {
      method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const t = await r.text();
    let json = {};
    try { json = t ? JSON.parse(t) : {}; } catch { /* non-JSON */ }
    if (r.status === 429 && json?.error?.code === 'RATE_LIMIT_EXCEEDED') {
      console.log('    (request limit reached - waiting 30s)');
      await new Promise((res) => setTimeout(res, 30_000));
      continue;
    }
    return [r.status, json];
  }
  throw new Error(`${method} ${path}: still rate-limited after 6 minutes`);
}
const login = async (email) => (await api('POST', '/auth/login', { email, password: PW }))[1]?.data?.access_token;

/** An onboarded, approved owner with her own salon, store and one
 *  no-deposit service (onboarding creates it with deposit 0). */
async function owner(key, digits) {
  const email = `${TAG}.${key}@test.bedge.com`;
  sql(`UPDATE users SET deleted_at = NULL, status = 'active' WHERE email = '${email}'`);
  await api('POST', '/auth/register', { name: `${TAG} ${key}`, email, password: PW, role: 'artist', phone: `+961${digits}` });
  const tok = await login(email);
  const [st, r] = await api('POST', '/onboarding/complete', {
    handle: `${TAG}-${key}`, category: 'makeup', salon_name: `${TAG} Salon ${key}`, store_name: `${TAG} ${key} branch`,
    city: 'Beirut', service_name: `${TAG} Bridal`, service_duration_min: 60, service_price: '150.00',
  }, tok);
  if (st >= 400) throw new Error(`onboard ${key}: ${st} ${r?.error?.code}`);
  const artistId = r.data.artist_id;
  await api('POST', `/admin/artists/${artistId}/approve`, {}, await login(ADMIN));
  const salonId = sql(`SELECT salon_id FROM artists WHERE id='${artistId}'`);
  return { email, artistId, salonId,
    store: sql(`SELECT id FROM stores WHERE salon_id='${salonId}' LIMIT 1`),
    service: sql(`SELECT id FROM services WHERE salon_id='${salonId}' LIMIT 1`) };
}

/** A customer account (by phone) with n no-shows at a salon, months ago. */
async function customerWithNoShows(phone, salon, n) {
  await api('POST', '/customer-auth/verify-otp', { phone, code: '000000' });
  const id = sql(`SELECT id FROM users WHERE phone='${phone}' AND deleted_at IS NULL`);
  for (let i = 0; i < n; i++) {
    sql(`INSERT INTO bookings (salon_id,store_id,artist_id,customer_id,service_id,start_time,end_time,blocked_until,
      original_price,final_price,deposit_amount,status,special_requests) VALUES ('${salon.salonId}','${salon.store}','${salon.artistId}',
      '${id}','${salon.service}',NOW() - interval '${30 + i * 20} days',NOW() - interval '${30 + i * 20} days' + interval '1 hour',
      NOW() - interval '${30 + i * 20} days' + interval '1 hour',150,150,0,'no_show','${TAG} history')`);
  }
  return id;
}

/** Hold and submit as a guest with this phone; the submit's answer. */
let dayOffset = 2;
async function bookAsGuest(salon, phone) {
  let times = [];
  for (; dayOffset < 30 && times.length === 0; dayOffset++) {
    const day = new Date(Date.now() + dayOffset * 86_400_000).toISOString().slice(0, 10);
    const [, sr] = await api('GET', `/bookings/slots?artist_id=${salon.artistId}&store_id=${salon.store}&service_id=${salon.service}&date=${day}`);
    times = (Array.isArray(sr?.data) ? sr.data : []).map((x) => x.start_time);
  }
  const [hs, h] = await api('POST', '/bookings/guest/hold', { artist_id: salon.artistId, store_id: salon.store, service_id: salon.service, start_time: times[0] });
  if (hs !== 201) throw new Error(`hold ${hs} ${h?.error?.code}`);
  const [, b] = await api('PATCH', `/bookings/guest/${h.data.booking_id}/submit`, { name: `${TAG} Guest`, phone });
  return b.data;
}

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

// ── 29.2 the no-show deposit rule ───────────────────────────────────────────

async function noShowRule(browser) {
  const a = await owner('a', '76365400');
  const b = await owner('b', '76365401');
  const twice = '+96176365410';
  const once = '+96176365411';
  await customerWithNoShows(twice, a, 2);
  await customerWithNoShows(once, a, 1);
  await customerWithNoShows(twice, b, 0);

  const two = await bookAsGuest(a, twice);
  const one = await bookAsGuest(a, once);
  const elsewhere = await bookAsGuest(b, twice);
  sql(`UPDATE salons SET no_show_deposit_after = 0 WHERE id='${a.salonId}'`);
  const off = await bookAsGuest(a, twice);
  sql(`UPDATE salons SET no_show_deposit_after = 2 WHERE id='${a.salonId}'`);
  const ok = two.deposit_amount === '75' && two.no_show_deposit === true
    && one.deposit_amount === '0' && !one.no_show_deposit
    && elsewhere.deposit_amount === '0' && off.deposit_amount === '0';
  rec('29.2 api', ok ? 'PASS' : 'FAIL',
    `two no-shows here: deposit $${two.deposit_amount} (flagged ${two.no_show_deposit}); one: $${one.deposit_amount}; ` +
    `two at ANOTHER salon: $${elsewhere.deposit_amount}; rule off: $${off.deposit_amount}`);

  // The owner's setting, in Profile.
  const c = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await c.newPage();
  await signIn(page, a.email);
  await page.goto(`${DASH}/dashboard/profile`);
  await settle(page);
  const select = page.locator('#no-show-after');
  await select.waitFor({ timeout: 15000 }).catch(() => {});
  if (!(await select.count())) {
    // Say where the browser is and what it shows, rather than time out.
    rec('29.2 setting', 'FAIL', `no setting on ${new URL(page.url()).pathname}: ${(await text(page)).slice(0, 240)}`);
    await c.close();
    return;
  }
  const shown = await select.inputValue();
  await select.selectOption('3');
  await settle(page);
  const saved = /Saved\./.test(await text(page));
  const stored = sql(`SELECT no_show_deposit_after FROM salons WHERE id='${a.salonId}'`);
  rec('29.2 setting', shown === '2' && saved && stored === '3' ? 'PASS' : 'FAIL',
    `Profile shows ${shown} (the default 2); chose 3 -> "Saved." ${saved}; salon now ${stored}`);

  // The artist's card says why.
  await page.goto(`${DASH}/dashboard/bookings`);
  await settle(page);
  const why = /asked for: this customer has missed appointments here before/i.test(await text(page));
  rec('29.2 artist', why ? 'PASS' : 'FAIL', `her bookings list explains the deposit: ${why}`);
  await c.close();

  // The customer's booking says it, neutrally.
  const cc = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const cp = await cc.newPage();
  await cp.route('**/api/v1/customer-auth/request-otp', (route) => route.fulfill({ status: 200, contentType: 'application/json',
    body: JSON.stringify({ data: { message: 'Verification code sent', delivery_looks_broken: false }, error: null, meta: null }) }));
  await cp.goto(`${PWA}/login`);
  await settle(cp);
  await cp.locator('input[type="tel"]').first().fill(twice.slice(4));
  await cp.getByRole('button', { name: 'Send code' }).click();
  await cp.fill('#login-code', '000000');
  await cp.getByRole('button', { name: 'Verify' }).click();
  await settle(cp);
  await cp.goto(`${PWA}/my-bookings/${two.id}`);
  await settle(cp);
  const t = await text(cp);
  const said = t.includes('This salon asks for a deposit to hold this booking') && t.includes('$75');
  const blames = /missed|no-show/i.test(t);
  rec('29.2 customer', said && !blames ? 'PASS' : 'FAIL',
    `her booking shows the $75 deposit and "This salon asks for a deposit to hold this booking": ${said}; mentions her misses: ${blames}`);
  await cc.close();
}

// ── 29.3 favourites ─────────────────────────────────────────────────────────

const FAV_PHONE = '+96176365430';

async function favourites(browser) {
  const rania = sql(`SELECT id FROM artists WHERE handle = 'rania'`);
  const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await c.newPage();
  await page.route('**/api/v1/customer-auth/request-otp', (route) => route.fulfill({ status: 200, contentType: 'application/json',
    body: JSON.stringify({ data: { message: 'Verification code sent', delivery_looks_broken: false }, error: null, meta: null }) }));

  // Signed out: the heart is a way to sign in, and back.
  await page.goto(`${PWA}/book/rania`);
  await settle(page);
  await page.getByRole('button', { name: 'Save to favourites' }).click();
  await settle(page);
  const toLogin = new URL(page.url());
  const asked = toLogin.pathname === '/login' && (toLogin.searchParams.get('returnUrl') ?? '').startsWith('/book/rania');
  await page.locator('input[type="tel"]').first().fill(FAV_PHONE.slice(4));
  await page.getByRole('button', { name: 'Send code' }).click();
  await page.fill('#login-code', '000000');
  await page.getByRole('button', { name: 'Verify' }).click();
  await settle(page);
  const back = new URL(page.url()).pathname === '/book/rania';
  rec('29.3 signed out', asked && back ? 'PASS' : 'FAIL',
    `heart -> ${toLogin.pathname}?returnUrl=${toLogin.searchParams.get('returnUrl')}; after signing in, back on ${new URL(page.url()).pathname}`);

  // Signed in: save, see, forget.
  const heart = page.getByRole('button', { name: /favourites$/ });
  const before = await heart.getAttribute('aria-pressed');
  await page.getByRole('button', { name: 'Save to favourites' }).click();
  await settle(page);
  const after = await page.getByRole('button', { name: 'Remove from favourites' }).getAttribute('aria-pressed');
  const cust = sql(`SELECT id FROM users WHERE phone='${FAV_PHONE}' AND deleted_at IS NULL`);
  const stored = sql(`SELECT count(*) FROM customer_favourite_artists WHERE customer_id='${cust}' AND artist_id='${rania}'`);
  await page.goto(`${PWA}/my-bookings`);
  await settle(page);
  await page.getByRole('button', { name: 'Favourites' }).click();
  await settle(page);
  const listed = new URL(page.url()).pathname === '/favourites' && /Rania/.test(await text(page));
  await page.getByRole('button', { name: 'Remove Rania from favourites' }).click();
  await settle(page);
  const gone = /No favourites yet/.test(await text(page));
  const left = sql(`SELECT count(*) FROM customer_favourite_artists WHERE customer_id='${cust}'`);
  rec('29.3 signed in', before === 'false' && after === 'true' && stored === '1' && listed && gone && left === '0' ? 'PASS' : 'FAIL',
    `heart ${before} -> ${after}, stored ${stored}; My Bookings -> Favourites lists Rania: ${listed}; ` +
    `removed there -> "No favourites yet" ${gone}, rows left ${left}`);
  await c.close();
}

function cleanup() {
  for (const q of [
    `DELETE FROM refresh_tokens WHERE user_id IN (SELECT id FROM users WHERE phone='${FAV_PHONE}')`,
    `DELETE FROM customer_otps WHERE phone='${FAV_PHONE}'`,
    `DELETE FROM audit_events WHERE actor_id IN (SELECT id FROM users WHERE phone='${FAV_PHONE}')`,
    `DELETE FROM users WHERE phone='${FAV_PHONE}'`,
    `DELETE FROM notifications WHERE booking_id IN (SELECT id FROM bookings WHERE salon_id IN (SELECT id FROM salons WHERE name LIKE '${TAG}%'))`,
    `DELETE FROM bookings WHERE salon_id IN (SELECT id FROM salons WHERE name LIKE '${TAG}%')`,
    `DELETE FROM refresh_tokens WHERE user_id IN (SELECT id FROM users WHERE phone LIKE '+9617636541%')`,
    `DELETE FROM customer_otps WHERE phone LIKE '+9617636541%'`,
    `DELETE FROM audit_events WHERE actor_id IN (SELECT id FROM users WHERE phone LIKE '+9617636541%')`,
    `DELETE FROM users WHERE phone LIKE '+9617636541%'`,
  ]) {
    try { sql(q); } catch (e) { console.log('  cleanup:', e.message.split('\n')[0]); }
  }
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

console.log('\n  E2E suite 29 — the 2026-10-09 features\n');
const browser = await chromium.launch();
try {
  for (const run of [adminBookings, noShowRule, favourites]) {
    try { await run(browser); } catch (e) { rec(run.name, 'FAIL', `harness: ${e.message.split('\n')[0]}`); }
  }
} finally {
  await browser.close();
  cleanup();
  const p = results.filter((r) => r[1] === 'PASS').length;
  const f = results.filter((r) => r[1] === 'FAIL').length;
  console.log(`\n  ${p} pass, ${f} FAIL\n`);
  process.exitCode = f ? 1 : 0;
}
