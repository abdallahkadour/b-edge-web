/**
 * E2E Suite 28.1-28.3 — the join page, in a real browser at 390px.
 *
 * D26 (2026-09-29) made an invitation answerable only by the account it was
 * sent to, and declining needs a login. The API side is measured by
 * b-edge-api/scripts/e2e-suite28.py; the page was covered only by
 * join-salon.page.spec.ts. This drives the page itself:
 *
 *   28.1  logged out: the salon is shown, one Sign in, no Decline
 *   28.2  signed in as someone else: Join and Decline each say the
 *         invitation was sent to someone else, and change nothing
 *   28.3  the invitee declines: she leaves the page, the invitation is
 *         declined, and the link then says it is not valid
 *   28.10 (added with the reschedule screen, 2026-10-09) a signed-in customer
 *         opens her booking, taps Change time, picks a new time, and is
 *         back on her booking with it moved
 *   28.8  (screens, added with the AUTH-22 fix) an artist suspended while
 *         signed in is sent to sign-in on her next click, not left on a
 *         dashboard where every call answers 403 ACCOUNT_SUSPENDED
 *
 * Chromium, for the same reason as e2e-journeys-ui.mjs: it keeps the Secure
 * refresh cookie on http://localhost, so page.goto() works after signing in.
 * Builds its own salon and accounts under TAG and tears them down with
 * chaos-booking.py's cleanup().
 *
 *   node scripts/e2e-suite28-ui.mjs
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const DASH = 'http://localhost:4300';
const PWA = 'http://localhost:4200';
const API = 'http://localhost:3000/api/v1';
const TAG = 's28u';
const PW = 'password123';
const ADMIN = 'abdallah.kadour@b-edge.com';
const CUSTOMER_PHONE = '+96176365210';
const API_DIR = new URL('../../b-edge-api/', import.meta.url).pathname;

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
const status = (token) =>
  sql(`SELECT status FROM salon_invitations WHERE token_hash='${createHash('sha256').update(token).digest('hex')}'`);

/** A registered artist with a verified phone and no salon. */
async function artist(key, digits) {
  const email = `${TAG}.${key}@test.bedge.com`;
  sql(`UPDATE users SET deleted_at = NULL, status = 'active' WHERE email = '${email}'`);
  await api('POST', '/auth/register', { name: `${TAG} ${key}`, email, password: PW, role: 'artist', phone: `+961${digits}` });
  const [st, r] = await api('POST', '/artists/me/phone/verify', { code: '000000' }, await login(email));
  if (st >= 400) throw new Error(`verify phone ${key}: ${st} ${errCode(r)} (is the API built with -tags devbypass?)`);
  return email;
}

async function setup() {
  const owner = await artist('owner', '76365200');
  const tok = await login(owner);
  const [st, r] = await api('POST', '/onboarding/complete', {
    handle: `${TAG}-owner`, category: 'makeup', salon_name: `${TAG} Salon`, store_name: `${TAG} branch`,
    city: 'Beirut', service_name: `${TAG} Bridal`, service_duration_min: 60, service_price: '150.00',
  }, tok);
  if (st >= 400) throw new Error(`onboard owner: ${st} ${errCode(r)}`);
  const ownerId = r.data.artist_id;
  const salonId = sql(`SELECT salon_id FROM artists WHERE id='${ownerId}'`);
  await api('POST', `/admin/artists/${ownerId}/approve`, {}, await login(ADMIN));
  sql(`UPDATE subscriptions SET plan_code='multi' WHERE artist_id='${ownerId}'`);
  const invitee = await artist('a', '76365201');
  const other = await artist('x', '76365202');
  return { ownerTok: await login(owner), owner, ownerId, salonId, invitee, other };
}

async function invite(ownerTok) {
  const [st, r] = await api('POST', '/artists/salon/members/invite', { phone: '+96176365201' }, ownerTok);
  if (st !== 201) throw new Error(`invite: ${st} ${errCode(r)}`);
  return r.data.link.split('/').pop();
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
const buttons = async (page) => (await page.getByRole('button').allInnerTexts()).map((b) => b.trim());

async function run(browser) {
  const { ownerTok, owner, ownerId, salonId, invitee, other } = await setup();
  const token = await invite(ownerTok);
  const ctx = () => browser.newContext({ viewport: { width: 390, height: 844 } });

  // 28.1 — logged out
  {
    const c = await ctx();
    const page = await c.newPage();
    await page.goto(`${DASH}/join/${token}`);
    await settle(page);
    const t = await text(page);
    const b = await buttons(page);
    const shown = t.includes(`Join ${TAG} Salon`);
    if (!shown) {
      rec('28.1', 'FAIL', `positive control: the invitation is not shown logged out. Page says: ${t.slice(0, 160)}`);
    } else {
      const ok = b.includes('Sign in') && !b.includes('Decline') && /account this invitation was sent to/.test(t);
      rec('28.1', ok ? 'PASS' : 'FAIL', `buttons ${JSON.stringify(b)}; explains whose account: ${/account this invitation was sent to/.test(t)}`);
    }
    await c.close();
  }

  // 28.2 — signed in as someone else
  {
    const c = await ctx();
    const page = await c.newPage();
    await signIn(page, other);
    await page.goto(`${DASH}/join/${token}`);
    await settle(page);
    const before = await buttons(page);
    if (!before.includes('Decline')) {
      rec('28.2', 'FAIL', `positive control: signed in, no Decline offered. Buttons ${JSON.stringify(before)}`);
    } else {
      await page.getByRole('button', { name: 'Decline' }).click();
      await settle(page);
      const afterDecline = await text(page);
      const declineSays = /sent to someone else/i.test(afterDecline);
      const stayed = new URL(page.url()).pathname.startsWith('/join/');
      await page.fill('#j-handle', `${TAG}-x`);
      await page.getByRole('button', { name: new RegExp(`Join ${TAG} Salon`) }).click();
      await settle(page);
      const acceptSays = /sent to someone else/i.test(await text(page));
      const st = status(token);
      rec('28.2', declineSays && stayed && acceptSays && st === 'pending' ? 'PASS' : 'FAIL',
        `Decline: says "sent to someone else" ${declineSays}, stays on the page ${stayed}; ` +
        `Join: says so ${acceptSays}; invitation still ${st}`);
    }
    await c.close();
  }

  // 28.3 — the invitee declines
  {
    const c = await ctx();
    const page = await c.newPage();
    await signIn(page, invitee);
    await page.goto(`${DASH}/join/${token}`);
    await settle(page);
    if (!(await buttons(page)).includes('Decline')) {
      rec('28.3', 'FAIL', 'positive control: the invitee is not offered Decline');
    } else {
      await page.getByRole('button', { name: 'Decline' }).click();
      await settle(page);
      const where = new URL(page.url()).pathname;
      const st = status(token);
      await page.goto(`${DASH}/join/${token}`);
      await settle(page);
      const invalid = /This link is not valid/.test(await text(page));
      rec('28.3', !where.startsWith('/join/') && st === 'declined' && invalid ? 'PASS' : 'FAIL',
        `after Decline: on ${where}; invitation ${st}; reopening the link says "not valid": ${invalid}`);
    }
    await c.close();
  }

  // 28.10 — a customer moves her booking (before 28.8, which suspends the owner)
  {
    const store = sql(`SELECT id FROM stores WHERE salon_id='${salonId}' LIMIT 1`);
    const service = sql(`SELECT id FROM services WHERE salon_id='${salonId}' LIMIT 1`);
    let times = [];
    for (let d = 2; d < 12 && times.length < 4; d++) {
      const day = new Date(Date.now() + d * 86_400_000).toISOString().slice(0, 10);
      const [, sr] = await api('GET', `/bookings/slots?artist_id=${ownerId}&store_id=${store}&service_id=${service}&date=${day}`);
      times = (Array.isArray(sr?.data) ? sr.data : []).map((x) => x.start_time);
    }
    await api('POST', '/customer-auth/verify-otp', { phone: CUSTOMER_PHONE, code: '000000' });
    const cust = sql(`SELECT id FROM users WHERE phone='${CUSTOMER_PHONE}' AND deleted_at IS NULL`);
    const start = times[1];
    const booking = sql(`INSERT INTO bookings (salon_id,store_id,artist_id,customer_id,service_id,start_time,end_time,
      blocked_until,original_price,final_price,deposit_amount,status,special_requests) VALUES ('${salonId}','${store}','${ownerId}',
      '${cust}','${service}','${start}','${start}'::timestamptz + interval '1 hour','${start}'::timestamptz + interval '1 hour',
      150,150,30,'confirmed','${TAG} move') RETURNING id`);
    const target = times[3];
    const label = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Beirut', hour: 'numeric', minute: '2-digit', hour12: true })
      .format(new Date(target));

    const c = await ctx();
    const page = await c.newPage();
    await page.route('**/api/v1/customer-auth/request-otp', (route) => route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: { message: 'Verification code sent', delivery_looks_broken: false }, error: null, meta: null }) }));
    await page.goto(`${PWA}/login`);
    await settle(page);
    await page.locator('input[type="tel"]').first().fill(CUSTOMER_PHONE.slice(4));
    await page.getByRole('button', { name: 'Send code' }).click();
    await page.fill('#login-code', '000000');
    await page.getByRole('button', { name: 'Verify' }).click();
    await settle(page);
    await page.goto(`${PWA}/my-bookings/${booking}`);
    await settle(page);
    const offered = await page.getByRole('button', { name: 'Change time' }).count();
    if (!offered) {
      rec('28.10', 'FAIL', `no Change time on her booking. Page says: ${(await text(page)).slice(0, 160)}`);
    } else {
      await page.getByRole('button', { name: 'Change time' }).click();
      await settle(page);
      const onMove = new URL(page.url()).pathname.endsWith('/move');
      await page.getByRole('button', { name: label, exact: true }).click();
      await page.getByRole('button', { name: /^Move to:/ }).click();
      await page.waitForURL((u) => u.searchParams.get('moved') === '1', { timeout: 10000 }).catch(() => {});
      await settle(page);
      const said = /Moved\./.test(await text(page));
      const now = sql(`SELECT to_char(start_time AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI') FROM bookings WHERE id='${booking}'`);
      // Slot times carry the store's offset (+03:00), so compare instants:
      // the first run compared the local digits with UTC and failed a move
      // that had gone exactly right.
      const wanted = new Date(target).toISOString().slice(0, 16);
      const ok = onMove && said && now === wanted;
      rec('28.10', ok ? 'PASS' : 'FAIL',
        `Change time -> move screen ${onMove}; picked ${label} and moved; back on her booking saying "Moved." ${said}; ` +
        `booking now at ${now}Z (wanted ${wanted}Z)`);
    }
    await c.close();
  }

  // 28.8 — suspended mid-session (last: it suspends the owner)
  {
    const c = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await c.newPage();
    await signIn(page, owner);
    await settle(page);
    await page.getByRole('link', { name: 'Clients' }).first().click();
    await settle(page);
    const before = new URL(page.url()).pathname;
    if (!before.startsWith('/dashboard/clients')) {
      rec('28.8', 'FAIL', `positive control: the owner could not open Clients before suspension (on ${before})`);
    } else {
      sql(`UPDATE users SET status='suspended' WHERE email='${owner}'`);
      await page.getByRole('link', { name: 'Orders' }).first().click();
      await page.waitForURL((u) => u.pathname.startsWith('/login'), { timeout: 10000 }).catch(() => {});
      const after = new URL(page.url()).pathname;
      rec('28.8', after.startsWith('/login') ? 'PASS' : 'FAIL',
        `signed in and working (${before}); suspended, then one click -> ${after}`);
    }
    await c.close();
  }
}

function cleanup() {
  // The customer 28.10 signs in as is not tagged by email, so chaos cleanup
  // cannot see her; her booking goes with the salon's.
  for (const q of [
    `DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE phone='${CUSTOMER_PHONE}')`,
    `DELETE FROM notifications WHERE booking_id IN (SELECT id FROM bookings WHERE special_requests='${TAG} move')`,
    `DELETE FROM bookings WHERE special_requests='${TAG} move'`,
    `DELETE FROM refresh_tokens WHERE user_id IN (SELECT id FROM users WHERE phone='${CUSTOMER_PHONE}')`,
    `DELETE FROM customer_otps WHERE phone='${CUSTOMER_PHONE}'`,
    // The activity log names her (her reschedule, 2026-10-10); test rows only.
    `DELETE FROM audit_events WHERE actor_id IN (SELECT id FROM users WHERE phone='${CUSTOMER_PHONE}')`,
    `DELETE FROM users WHERE phone='${CUSTOMER_PHONE}'`,
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

console.log('\n  E2E suite 28.1-28.3 — the join page\n');
const browser = await chromium.launch();
try {
  await run(browser);
} catch (e) {
  rec('28.err', 'FAIL', `harness: ${e.message.split('\n')[0]}`);
} finally {
  await browser.close();
  cleanup();
  const p = results.filter((r) => r[1] === 'PASS').length;
  const f = results.filter((r) => r[1] === 'FAIL').length;
  console.log(`\n  ${p} pass, ${f} FAIL\n`);
  process.exitCode = f ? 1 : 0;
}
