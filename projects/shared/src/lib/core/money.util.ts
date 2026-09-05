/**
 * Money input validation, in one place.
 *
 * WHY THIS EXISTS
 *
 * The price field is a bare `type="text"` input whose value is sent to the
 * API verbatim. Until 2026-09-05 the backend was equally relaxed, and the
 * combination let a typo become a wrong price silently: "10.999" was accepted
 * by Go, then rounded to 11.00 by a NUMERIC(10,2) column, and nobody was told.
 * Worse forms got further - "1e3" became 1000.00, and on two endpoints "NaN"
 * reached Postgres, which accepts 'NaN'::numeric and made every later read of
 * that row fail.
 *
 * The server now rejects all of those (internal/pkg/money). This file exists
 * so the artist finds out while they are still looking at the field, rather
 * than by submitting and reading an error about a value they can no longer
 * see.
 *
 * THIS IS UX, NOT A CONTROL
 *
 * Client-side validation is a convenience and nothing more - anyone can post
 * to the API directly. The server check is the real one and must never be
 * relaxed because this exists. What this buys is that a legitimate artist
 * making an ordinary typo gets a helpful field-level message instead of a 400.
 *
 * The pattern is deliberately IDENTICAL to the Go one in internal/pkg/money.
 * Two validators that are meant to agree but are written differently will
 * drift, and the failure is silent in the direction that matters: the form
 * accepting something the API rejects.
 */

/**
 * A complete, valid money amount: up to 8 integer digits and at most 2
 * decimals, no sign and no exponent.
 *
 * 8 integer digits because every money column in the schema is
 * NUMERIC(10,2), so 99999999.99 is the real ceiling.
 */
const MONEY_PATTERN = /^\d{1,8}(\.\d{1,2})?$/;

/**
 * A value that is not valid YET but is a plausible prefix of something that
 * will be - "10." on the way to "10.50", or "" before the first keystroke.
 *
 * Needed because validating on every keystroke otherwise flashes an error at
 * someone who is typing correctly and simply has not finished. An input is
 * only worth complaining about once it can no longer become valid.
 */
const MONEY_IN_PROGRESS_PATTERN = /^\d{0,8}(\.\d{0,2})?$/;

/** True when `raw` is a complete, storable money amount. */
export function isValidMoney(raw: string): boolean {
  return MONEY_PATTERN.test(raw);
}

/**
 * True when `raw` cannot become a valid amount by typing more - i.e. it is
 * worth showing an error for now.
 *
 * Use this to gate the visible message; use `isValidMoney` to gate the save
 * button. An empty field is not an error here: "required" is a separate rule
 * with its own message.
 */
export function isBrokenMoney(raw: string): boolean {
  return raw.length > 0 && !MONEY_IN_PROGRESS_PATTERN.test(raw);
}

/** The message shown beside a rejected amount. Matches the API's wording. */
export const MONEY_HINT = 'Use an amount like 45 or 45.50 — at most 2 decimal places.';
