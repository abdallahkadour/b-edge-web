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
const API = 'http://localhost:3000/api/v1';
const TAG = 's28u';
const PW = 'password123';
const ADMIN = 'abdallah.kadour@b-edge.com';
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
  await api('POST', `/admin/artists/${ownerId}/approve`, {}, await login(ADMIN));
  sql(`UPDATE subscriptions SET plan_code='multi' WHERE artist_id='${ownerId}'`);
  const invitee = await artist('a', '76365201');
  const other = await artist('x', '76365202');
  return { ownerTok: await login(owner), invitee, other };
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
  const { ownerTok, invitee, other } = await setup();
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
}

function cleanup() {
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
