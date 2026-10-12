/**
 * E2E Suite 30 (UI) — the salon owner's dashboard, in a real browser
 * (2026-10-10). The API half is b-edge-api/scripts/e2e-suite30.py.
 *
 *   30u.1  the owner's nav has Salon and Activity; Salon's Earned matches the
 *          database and the Team table lists both artists, hers marked You
 *   30u.2  a member has neither, and typing /dashboard/salon turns her back
 *   30u.3  Bookings -> Showing -> Everyone: the member's booking says whose
 *          it is; the owner approves it there; the database agrees
 *   30u.4  Activity says "You approved ..." and highlights a payment account
 *          change, with the old and new account
 *   30u.5  Calendar -> Everyone: two artists at the same hour sit side by
 *          side, not one on top of the other
 *   30u.6  Salon and Activity at phone width: no sideways scroll
 *   30u.7  Bookings -> Move to another artist: the sheet lists the owner as
 *          able to take the member's booking; Move booking moves it; the
 *          screen says so and the database agrees; Activity words it
 *
 * Builds a salon of two (owner + member) with the API harness helpers and
 * tears it down. Chromium, for the Secure refresh cookie on localhost.
 *
 *   node scripts/e2e-suite30-ui.mjs
 */
import { chromium } from 'playwright';
import { waitForBudget } from './api-budget.mjs';
import { execFileSync } from 'node:child_process';

const DASH = 'http://localhost:4300';
const API = 'http://localhost:3000/api/v1';
const TAG = 's30u';
const API_DIR = new URL('../../b-edge-api/', import.meta.url).pathname;
const PW = 'password123';

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

function chaos(body) {
  const py = `
import importlib.util, json
spec = importlib.util.spec_from_file_location("chaos", "scripts/chaos-booking.py")
c = importlib.util.module_from_spec(spec); spec.loader.exec_module(c)
c.TAG = "${TAG}"
${body}`;
  return execFileSync('python3', ['-c', py], { cwd: API_DIR, encoding: 'utf8', env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } });
}

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
  throw new Error(`${method} ${path}: still rate-limited`);
}
const login = async (email) => (await api('POST', '/auth/login', { email, password: PW }))[1]?.data?.access_token;

async function signIn(page, email) {
  await page.goto(`${DASH}/login`);
  await page.fill('#email', email);
  await page.fill('#password', PW);
  await page.getByRole('button', { name: /^Sign in$/ }).click();
  await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 10000 }).catch(() => {});
}

async function settle(page) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(600);
}

const text = async (page) => (await page.locator('body').innerText()).replace(/\s+/g, ' ');

/** Owner and member in one salon, a customer, and bookings to look at. */
function setup() {
  const out = chaos(`
admin = c.login(c.ADMIN)
def artist(name, n):
    email = f"${TAG}.{name}@test.bedge.com"
    c.register(f"${TAG} {name.title()}", email, f"+96176365{n}")
    c.sql(f"UPDATE users SET status='active' WHERE email='{email}'")
    c.verify_phone(email)
    return email
oe = artist("owner", 310)
owner = c.onboard(oe, "${TAG} Salon", "${TAG}-owner")
c.approve_artist(owner, admin)
salon = c.sql(f"SELECT salon_id FROM artists WHERE id='{owner}'")
otok = c.login(oe)
store_id = c.sql(f"SELECT id FROM stores WHERE salon_id='{salon}' LIMIT 1")
for dow in range(7):
    c.call("POST", f"/artists/stores/{store_id}/hours",
           {"day_of_week": dow, "open_time": "08:00:00", "close_time": "20:00:00", "is_open": True}, otok)
if c.sql(f"SELECT count(*) FROM subscriptions WHERE artist_id='{owner}'") == "0":
    c.sql(f"INSERT INTO subscriptions (artist_id, plan_code, monthly_price) VALUES ('{owner}','multi',0)")
c.seat_plan(salon, "multi")
me = artist("member", 311)
member = c.join(c.login(oe), me, "+96176365311", "${TAG}-member", admin)
print(json.dumps({"owner_email": oe, "member_email": me, "owner": owner, "member": member, "salon": salon,
  "store": c.sql(f"SELECT id FROM stores WHERE salon_id='{salon}' LIMIT 1"),
  "service": c.sql(f"SELECT id FROM services WHERE salon_id='{salon}' LIMIT 1")}))
`);
  const w = JSON.parse(out.trim().split('\n').pop());
  w.customer = sql(`INSERT INTO users (name, email, password_hash, role) VALUES ('${TAG} Sara', '${TAG}.sara@test.bedge.com', 'x', 'customer')
    ON CONFLICT (email) DO UPDATE SET deleted_at = NULL RETURNING id`);
  const at = (days, hourUtc) => {
    const d = new Date(); d.setUTCDate(d.getUTCDate() + days); d.setUTCHours(hourUtc, 0, 0, 0); return d;
  };
  const book = (artist, start, status, price = '100.00') => {
    const s = start.toISOString(); const e = new Date(start.getTime() + 3_600_000).toISOString();
    return sql(`INSERT INTO bookings (salon_id, store_id, artist_id, customer_id, service_id, start_time, end_time, blocked_until,
      status, original_price, final_price, special_requests)
      VALUES ('${w.salon}','${w.store}','${artist}','${w.customer}','${w.service}','${s}','${e}','${e}','${status}',${price},${price},'${TAG} case') RETURNING id`);
  };
  // Last month, so the figure never straddles today.
  const lm = new Date(); lm.setUTCDate(1); lm.setUTCDate(0); lm.setUTCDate(10); lm.setUTCHours(8, 0, 0, 0);
  book(w.owner, lm, 'completed', '120.00');
  book(w.member, new Date(lm.getTime() + 2 * 3_600_000), 'completed', '80.00');
  w.memberPending = book(w.member, at(4, 6), 'pending');
  // Same hour, two artists - for the calendar's lanes.
  w.calDay = at(5, 9);
  book(w.owner, w.calDay, 'confirmed');
  book(w.member, w.calDay, 'confirmed');
  return w;
}

async function ownerScreens(browser, w) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await signIn(page, w.owner_email);

  // 30u.1 Salon
  await page.goto(`${DASH}/dashboard/salon`);
  await page.waitForSelector('[data-waiting]', { timeout: 10000 });
  const nav = await page.locator('nav').first().innerText();
  await page.getByRole('tab', { name: 'Last month' }).click();
  await settle(page);
  const body = await text(page);
  const team = await page.locator('[data-artist]').allInnerTexts();
  if (!/Salon/.test(nav) || !/Activity/.test(nav)) {
    rec('30u.1', 'FAIL', `owner nav lacks Salon/Activity: ${nav.replace(/\s+/g, ' ').slice(0, 120)}`);
  } else if (!body.includes('$200') || team.length !== 2 || !team.some((r) => /you/i.test(r)) || !team.some((r) => /Member/.test(r))) {
    rec('30u.1', 'FAIL', `Salon: earned $200 shown=${body.includes('$200')}, team=${JSON.stringify(team)}`);
  } else {
    rec('30u.1', 'PASS', 'owner nav has Salon and Activity; last month earned $200 (database: 120 + 80); both artists, hers marked You');
  }

  // 30u.3 Bookings, everyone, approve the member's
  await page.goto(`${DASH}/dashboard/bookings`);
  await settle(page);
  await page.getByLabel('Whose bookings').selectOption('all');
  await settle(page);
  const card = page.locator('div.rounded-lg', { has: page.locator('[data-artist-name]', { hasText: 'Member' }) })
    .filter({ has: page.getByRole('button', { name: 'Approve' }) }).first();
  const whose = await card.locator('[data-artist-name]').innerText().catch(() => '');
  await card.getByRole('button', { name: 'Approve' }).click().catch(() => {});
  await settle(page);
  const status = sql(`SELECT status FROM bookings WHERE id='${w.memberPending}'`);
  if (whose.includes('with s30u Member') && status === 'approved') {
    rec('30u.3', 'PASS', `Showing -> Everyone: card says "${whose.trim()}"; the owner approved it (database: approved)`);
  } else {
    rec('30u.3', 'FAIL', `whose="${whose}" status=${status}`);
  }

  // 30u.7 Move the member's (now approved) booking to the owner
  await page.goto(`${DASH}/dashboard/bookings`);
  await settle(page);
  await page.getByLabel('Whose bookings').selectOption('all');
  await settle(page);
  // That exact booking: the member has two upcoming, and the other one is at
  // the very hour the owner is booked herself (30u.5's side-by-side pair), so
  // the owner is rightly "not free" for it. The first harness run picked it.
  const moveCard = page.locator(`[data-booking-id="${w.memberPending}"]`);
  await moveCard.getByRole('button', { name: 'Move to another artist' }).click().catch(() => {});
  await page.waitForSelector('bedge-reassign-sheet input[type="radio"]', { timeout: 8000 }).catch(() => {});
  const sheetText = (await page.locator('bedge-reassign-sheet').innerText().catch(() => '')).replace(/\s+/g, ' ');
  // SHOT_DIR=/some/dir node scripts/e2e-suite30-ui.mjs keeps a picture of the sheet.
  if (process.env.SHOT_DIR) await page.screenshot({ path: `${process.env.SHOT_DIR}/reassign-sheet.png` });
  await page.locator(`bedge-reassign-sheet input[value="${w.owner}"]`).check().catch(() => {});
  await page.getByRole('button', { name: 'Move booking' }).click().catch(() => {});
  await settle(page);
  const banner = await page.getByRole('status').innerText().catch(() => '');
  const nowWith = sql(`SELECT artist_id FROM bookings WHERE id='${w.memberPending}'`);
  if (sheetText.includes('s30u Owner') && /keeps her price/.test(sheetText) && /Moved to s30u Owner/.test(banner) && nowWith === w.owner) {
    rec('30u.7', 'PASS', 'the sheet listed the owner; Move booking moved it; "Moved to s30u Owner" shown; the database agrees');
  } else {
    // Diagnosis, not a check: what the owner is actually offered that day,
    // and the store's hours as stored.
    const startUtc = sql(`SELECT to_char(start_time AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"') FROM bookings WHERE id='${w.memberPending}'`);
    const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Beirut' }).format(new Date(startUtc));
    const [, sl] = await api('GET', `/bookings/slots?artist_id=${w.owner}&store_id=${w.store}&service_id=${w.service}&date=${day}`);
    const hours = sql(`SELECT string_agg(day_of_week||':'||open_time||'-'||close_time||':'||is_open, ' ' ORDER BY day_of_week) FROM business_hours WHERE store_id='${w.store}'`);
    const [, cand] = await api('GET', `/bookings/${w.memberPending}/reassign-candidates`, undefined, await login(w.owner_email));
    const ownerDay = sql(`SELECT string_agg(status||'@'||to_char(start_time AT TIME ZONE 'UTC','MM-DD HH24:MI')||'-'||to_char(blocked_until AT TIME ZONE 'UTC','HH24:MI')||' store='||left(store_id::text,8), ', ')
      FROM bookings WHERE artist_id='${w.owner}' AND start_time::date BETWEEN (SELECT start_time::date - 1 FROM bookings WHERE id='${w.memberPending}') AND (SELECT start_time::date + 1 FROM bookings WHERE id='${w.memberPending}')`);
    console.log('    candidates API:', JSON.stringify(cand?.data ?? cand?.error), '\n    owner bookings around that day:', ownerDay, ' store', w.store.slice(0, 8));
    rec('30u.7', 'FAIL', `sheet="${sheetText.slice(0, 120)}" banner="${banner}" artist now ${nowWith === w.owner ? 'owner' : nowWith}`
      + ` | booking ${startUtc}; owner offered then: ${(sl?.data ?? []).some((x) => Date.parse(x.start_time) === Date.parse(startUtc))};`
      + ` owner slots 08:45-09:30: ${JSON.stringify((sl?.data ?? []).map((x) => x.start_time.slice(11, 16)).filter((t) => t >= '08:45' && t <= '09:30'))}; hours ${hours}`);
  }

  // 30u.4 Activity
  const tok = await login(w.owner_email);
  await api('PUT', '/artists/salon/payment-methods', { method: 'whish', account_name: 's30u Owner', account_ref: '71000001' }, tok);
  await api('PUT', '/artists/salon/payment-methods', { method: 'whish', account_name: 's30u Owner', account_ref: '71000009' }, tok);
  await page.goto(`${DASH}/dashboard/activity`);
  await settle(page);
  const act = await text(page);
  const flagged = await page.locator('[data-alert]').allInnerTexts();
  rec('30u.7b', act.includes("You moved s30u Sara's s30u Bridal from s30u Member to s30u Owner") ? 'PASS' : 'FAIL',
    'Activity says "You moved s30u Sara\'s s30u Bridal from s30u Member to s30u Owner"');
  if (act.includes("You approved s30u Sara's s30u Bridal") && flagged.length === 1 && flagged[0].includes('71000001') && flagged[0].includes('71000009')) {
    rec('30u.4', 'PASS', 'Activity: "You approved s30u Sara\'s s30u Bridal"; the Whish account change highlighted with old and new');
  } else {
    rec('30u.4', 'FAIL', `approve line=${act.includes('You approved')}, flagged=${JSON.stringify(flagged)}`);
  }

  // 30u.5 Calendar lanes
  await page.goto(`${DASH}/dashboard/calendar`);
  await settle(page);
  await page.getByLabel('Whose bookings').selectOption('all');
  await settle(page);
  const target = w.calDay;
  const weeksAhead = Math.floor(((Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate()) -
    Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate())) / 86_400_000 +
    ((new Date().getUTCDay() + 6) % 7)) / 7);
  for (let i = 0; i < weeksAhead; i++) { await page.getByRole('button', { name: 'Next week' }).click(); await settle(page); }
  const dayIdx = (target.getUTCDay() + 6) % 7;
  await page.locator('div.grid.grid-cols-7 > button').nth(dayIdx).click();
  await page.waitForTimeout(400);
  const blocks = page.locator('button[title]');
  const n = await blocks.count();
  const boxes = [];
  for (let i = 0; i < n; i++) boxes.push(await blocks.nth(i).boundingBox());
  const side = n === 2 && boxes[0] && boxes[1] &&
    (boxes[0].x + boxes[0].width <= boxes[1].x + 1 || boxes[1].x + boxes[1].width <= boxes[0].x + 1);
  if (side) {
    rec('30u.5', 'PASS', `two artists at the same hour: side by side (${Math.round(boxes[0].width)}px each)`);
  } else {
    rec('30u.5', 'FAIL', `${n} blocks, boxes=${JSON.stringify(boxes)}`);
  }
  await page.close();

  // 30u.6 phone width
  const phone = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await signIn(phone, w.owner_email);
  const widths = [];
  for (const p of ['salon', 'activity']) {
    await phone.goto(`${DASH}/dashboard/${p}`);
    await settle(phone);
    widths.push(await phone.evaluate(() => document.documentElement.scrollWidth));
  }
  if (widths.every((x) => x <= 390)) rec('30u.6', 'PASS', `Salon and Activity at 390px: no sideways scroll (${widths.join(', ')})`);
  else rec('30u.6', 'FAIL', `scroll widths ${widths.join(', ')}`);
  await phone.close();
}

async function memberScreens(browser, w) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await signIn(page, w.member_email);
  await page.goto(`${DASH}/dashboard/bookings`);
  await settle(page);
  const nav = await page.locator('nav').first().innerText();
  const showing = await page.getByLabel('Whose bookings').count();
  await page.goto(`${DASH}/dashboard/salon`);
  await settle(page);
  const url = new URL(page.url()).pathname;
  if (/\bSalon\b/.test(nav) || /Activity/.test(nav) || showing > 0) {
    rec('30u.2', 'FAIL', `member sees owner things: nav=${nav.replace(/\s+/g, ' ').slice(0, 120)} showing=${showing}`);
  } else if (url === '/dashboard/salon') {
    rec('30u.2', 'FAIL', 'member reached /dashboard/salon');
  } else {
    rec('30u.2', 'PASS', `member: no Salon, no Activity, no Showing; /dashboard/salon turned her back to ${url}`);
  }
  await page.close();
}

function cleanup() {
  for (const q of [
    `DELETE FROM notifications WHERE booking_id IN (SELECT id FROM bookings WHERE special_requests LIKE '${TAG}%')`,
    `DELETE FROM bookings WHERE special_requests LIKE '${TAG}%'`,
    `DELETE FROM artist_services WHERE artist_id IN (SELECT a.id FROM artists a JOIN users u ON u.id=a.user_id WHERE u.email LIKE '${TAG}.%')`,
  ]) {
    try { sql(q); } catch (e) { console.log('  cleanup:', e.message.split('\n')[0]); }
  }
  try { console.log(chaos('c.cleanup()').trim().split('\n').slice(-1)[0]); } catch (e) { console.log('  cleanup FAILED:', e.message.slice(0, 200)); }
}

console.log('\n  E2E suite 30 (UI) — the owner\'s dashboard\n');
await waitForBudget(API);
const browser = await chromium.launch();
try {
  const w = setup();
  console.log(`  setup: salon ${w.salon.slice(0, 8)}\n`);
  for (const run of [ownerScreens, memberScreens]) {
    try { await run(browser, w); } catch (e) { rec(run.name, 'FAIL', `harness: ${e.message.split('\n')[0]}`); }
  }
} catch (e) {
  rec('setup', 'FAIL', e.message.split('\n')[0]);
} finally {
  await browser.close();
  cleanup();
  const p = results.filter((r) => r[1] === 'PASS').length;
  const f = results.filter((r) => r[1] === 'FAIL').length;
  console.log(`\n  ${p} pass, ${f} FAIL\n`);
  process.exitCode = f ? 1 : 0;
}
