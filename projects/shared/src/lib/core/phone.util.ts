/**
 * Phone number validation, in one place.
 *
 * This logic previously existed as three byte-identical copies of
 * `isValidLocalPhone` (customer-login, cart, guest-details) plus a fourth
 * inline regex in pick-datetime-screen. Four copies of a rule means four
 * places to miss when the rule changes - and it will change the first time
 * B-Edge accepts a number that isn't Lebanese.
 *
 * Scope, deliberately: B-Edge is Lebanon-only today. Deposits move over
 * OMT and Whish, both Lebanon-only rails, and OTP codes go out over
 * WhatsApp to a local number. Accepting arbitrary international numbers
 * would let someone book who cannot actually pay or be reached, which is a
 * worse failure than rejecting them at the form. When that changes,
 * this file is the only thing that changes with it.
 */

/** Lebanese subscriber numbers are 7 or 8 digits after the +961 prefix. */
const LOCAL_PHONE_PATTERN = /^\d{7,8}$/;

/** Max digits a local number can have - used to cap input length. */
export const LOCAL_PHONE_MAX_DIGITS = 8;

/**
 * True when `digitsOnly` is a plausible Lebanese subscriber number.
 *
 * Expects digits ONLY, with no +961 prefix, spaces or punctuation - use
 * `stripToDigits()` on raw input first.
 */
export function isValidLocalPhone(digitsOnly: string): boolean {
  return LOCAL_PHONE_PATTERN.test(digitsOnly);
}

/**
 * Strips everything except digits and caps the result at the maximum
 * local length. Safe to call on every keystroke of a phone input.
 */
export function stripToDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, LOCAL_PHONE_MAX_DIGITS);
}
