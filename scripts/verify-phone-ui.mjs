/**
 * Verifies the phone-verification section renders and works, in a real
 * browser at a real phone width.
 *
 * Logs in WITHIN the session and navigates by CLICKING, never page.goto():
 * the refresh cookie is Secure:true unconditionally, so WebKit never stores
 * it over plain HTTP and any full navigation bounces to /login with the
 * in-memory access token gone. That exact mistake produced a false pass in
 * this project before - a suite measuring the login page and reporting
 * "0 overflow".
 */
import { webkit } from 'playwright';

const BASE = 'http://localhost:4300';
const results = [];
const rec = (id, v, d) => { results.push([id, v, d]); console.log(`  ${v.padEnd(4)} ${id.padEnd(8)} ${d}`); };

const browser = await webkit.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();

try {
  await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
  await page.fill('#email', 'rania@bedge.com');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"], bedge-button button');
  await page.waitForTimeout(2500);

  // Establish that login actually worked before measuring anything. A
  // screen that bounced to /login renders zero of everything and would
  // otherwise read as a clean pass.
  const url = page.url();
  if (url.includes('/login')) {
    rec('pre', 'FAIL', `still on /login after submit - nothing below means anything (${url})`);
    throw new Error('login failed');
  }
  rec('pre', 'ok', `logged in, at ${new URL(url).pathname}`);

  // CLICK to Profile. page.goto() bounces to /login over HTTP because the
  // refresh cookie is Secure:true - the first version of this script did
  // exactly that and then measured a page that was not the profile.
  //
  // At 390px Profile lives behind the "More" sheet, which is itself a third
  // rendering of the nav and worth exercising.
  const more = page.locator('button', { hasText: /More/i }).first();
  if (await more.count()) {
    await more.click();
    await page.waitForTimeout(700);
  }
  // :visible matters. The href appears three times - desktop sidebar, mobile
  // bar, "More" sheet - and at 390px the first is hidden, so .first().click()
  // waits on visibility until it times out. That is what the first run did.
  const profileLink = page.locator('a[href="/dashboard/profile"]:visible').first();
  if (!(await profileLink.count())) {
    rec('nav', 'FAIL', 'no VISIBLE Profile link in the nav at 390px');
    throw new Error('cannot reach profile');
  }
  await profileLink.click();
  await page.waitForTimeout(2500);
  rec('nav', page.url().includes('/dashboard/profile') ? 'ok' : 'FAIL',
      `navigated to ${new URL(page.url()).pathname}`);

  const section = page.locator('bedge-phone-verification');
  const count = await section.count();
  rec('1', count === 1 ? 'PASS' : 'FAIL', `bedge-phone-verification present: ${count}`);

  if (count === 1) {
    const text = (await section.innerText()).replace(/\s+/g, ' ').trim();
    rec('2', text.includes('not verified') ? 'PASS' : 'FAIL',
        `unverified warning shown: "${text.slice(0, 90)}…"`);
    rec('3', text.includes('+96176555001') ? 'PASS' : 'FAIL',
        'the number is displayed so the artist knows what is being verified');

    const editable = await section.locator('input[type="tel"]').count();
    rec('4', editable === 0 ? 'PASS' : 'FAIL',
        `number is NOT editable here (tel inputs: ${editable}) - the server ignores a supplied number`);

    // Send code
    const sendBtn = section.locator('button', { hasText: /Send code/i }).first();
    if (await sendBtn.count()) {
      await sendBtn.click();
      await page.waitForTimeout(2500);
      // Assert on the ELEMENT, not on text. The first version of this
      // matched /six-digit|Verify|Resend/i against the section's text - and
      // "verified", already present in the warning above, contains "Verify".
      // It reported PASS while the state had not changed at all.
      const otpCount = await section.locator('#otp').count();
      const after = (await section.innerText()).replace(/\s+/g, ' ');
      rec('5', otpCount === 1 ? 'PASS' : 'FAIL',
          otpCount === 1
            ? 'code-entry state reached: the #otp input exists'
            : `no #otp input; section says: "${after.slice(0, 140)}…"`);

      const otp = section.locator('#otp');
      if (await otp.count()) {
        await otp.fill('000000');           // the dev bypass
        await section.locator('button', { hasText: /^Verify$/i }).first().click();
        await page.waitForTimeout(2500);
        const done = (await section.innerText()).replace(/\s+/g, ' ');
        rec('6', done.includes('is verified') ? 'PASS' : 'FAIL',
            `after verifying: "${done.slice(0, 90)}…"`);
      } else {
        rec('6', 'FAIL', 'no #otp input appeared');
      }
    } else {
      rec('5', 'FAIL', 'no "Send code" button found');
    }

    // Horizontal overflow at 390px - every defect that reached the launch
    // artist was invisible at desktop width.
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    rec('7', overflow <= 0 ? 'PASS' : 'FAIL', `page overflow at 390px: ${overflow}px`);
  }
} catch (e) {
  rec('err', 'FAIL', String(e).slice(0, 120));
} finally {
  await browser.close();
  const p = results.filter(r => r[1] === 'PASS').length;
  const f = results.filter(r => r[1] === 'FAIL').length;
  console.log(`\n  ${p} pass, ${f} FAIL`);
}
