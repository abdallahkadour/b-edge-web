/**
 * Phone parsing, validation and normalisation — the client half.
 *
 * WHAT CHANGED AND WHY
 *
 * This was Lebanon-only: a bare `^\d{7,8}$` with a hardcoded `+961` printed
 * beside four separate inputs. Two problems with that, both real:
 *
 *  1. It conflated PAYMENT with REACHABILITY. Deposits move over OMT and
 *     Whish, which genuinely are Lebanese rails - but a Gulf client booking a
 *     Beirut artist can pay in person. Refusing their number at the form
 *     turned a reachable customer into a lost one.
 *
 *  2. It produced bare local digits, which the backend then stored verbatim
 *     and handed to Twilio as `whatsapp:71900001`. Not a valid destination.
 *     83% of user rows were in that state.
 *
 * DELIBERATELY MIRRORS internal/pkg/phone
 *
 * Same eleven countries, same lengths, same mobile prefixes. Duplicated rather
 * than shared because there is no codegen between Go and TypeScript here, and
 * a thin duplicated table that both sides can read is safer than one side
 * silently drifting. The Go side remains the guarantee; this exists so the
 * person typing finds out before they submit.
 */

export interface PhoneCountry {
  /** ISO 3166-1 alpha-2. */
  readonly iso: string;
  readonly name: string;
  /** Calling code without the leading +. */
  readonly code: string;
  /** Valid digit counts AFTER the calling code. */
  readonly lengths: readonly number[];
  /** Leading digits of mobile ranges. Empty means length-only. */
  readonly mobilePrefixes: readonly string[];
  readonly flag: string;
}

/** Lebanon first: the home market and the default. */
export const PHONE_COUNTRIES: readonly PhoneCountry[] = [
  { iso: 'LB', name: 'Lebanon', code: '961', lengths: [7, 8], mobilePrefixes: ['3', '70', '71', '76', '78', '79', '81'], flag: '🇱🇧' },
  { iso: 'AE', name: 'UAE', code: '971', lengths: [9], mobilePrefixes: ['50', '52', '54', '55', '56', '58'], flag: '🇦🇪' },
  { iso: 'SA', name: 'Saudi Arabia', code: '966', lengths: [9], mobilePrefixes: ['5'], flag: '🇸🇦' },
  { iso: 'QA', name: 'Qatar', code: '974', lengths: [8], mobilePrefixes: ['3', '5', '6', '7'], flag: '🇶🇦' },
  { iso: 'KW', name: 'Kuwait', code: '965', lengths: [8], mobilePrefixes: ['5', '6', '9'], flag: '🇰🇼' },
  { iso: 'BH', name: 'Bahrain', code: '973', lengths: [8], mobilePrefixes: ['3'], flag: '🇧🇭' },
  { iso: 'OM', name: 'Oman', code: '968', lengths: [8], mobilePrefixes: ['7', '9'], flag: '🇴🇲' },
  { iso: 'JO', name: 'Jordan', code: '962', lengths: [9], mobilePrefixes: ['7'], flag: '🇯🇴' },
  { iso: 'EG', name: 'Egypt', code: '20', lengths: [10], mobilePrefixes: ['10', '11', '12', '15'], flag: '🇪🇬' },
  { iso: 'IQ', name: 'Iraq', code: '964', lengths: [10], mobilePrefixes: ['7'], flag: '🇮🇶' },
  { iso: 'SY', name: 'Syria', code: '963', lengths: [9], mobilePrefixes: ['9'], flag: '🇸🇾' },
];

export const DEFAULT_PHONE_ISO = 'LB';

export function phoneCountry(iso: string): PhoneCountry {
  return PHONE_COUNTRIES.find((c) => c.iso === iso) ?? PHONE_COUNTRIES[0];
}

/** The longest national number any supported country takes — caps input. */
export const MAX_NATIONAL_DIGITS = Math.max(
  ...PHONE_COUNTRIES.flatMap((c) => [...c.lengths]),
);

/**
 * Strips everything except digits.
 *
 * People type "71 900 001" and "(03) 123-456". The separators carry no
 * information, so removing them is not lossy — and a form that rejects a
 * space is rejecting a real customer over punctuation.
 */
export function stripToDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, MAX_NATIONAL_DIGITS);
}

/** True when `digits` is a plausible mobile number for `iso`. */
export function isValidNationalPhone(digits: string, iso = DEFAULT_PHONE_ISO): boolean {
  const c = phoneCountry(iso);
  // A leading trunk zero is a domestic dialling convention, never part of the
  // subscriber number.
  const n = digits.replace(/^0+/, '');
  if (!c.lengths.includes(n.length)) return false;
  if (c.mobilePrefixes.length === 0) return true;
  return c.mobilePrefixes.some((p) => n.startsWith(p));
}

/**
 * Builds the E.164 value to send to the API.
 *
 * The server normalises again and is the guarantee; sending the canonical
 * form just means the two agree and the error path is never hit for input
 * the user already got right.
 */
export function toE164(digits: string, iso = DEFAULT_PHONE_ISO): string {
  return `+${phoneCountry(iso).code}${digits.replace(/^0+/, '')}`;
}

/** What to tell someone whose number was refused, naming the country. */
export function phoneHint(iso = DEFAULT_PHONE_ISO): string {
  const c = phoneCountry(iso);
  return `${c.name} mobile numbers are ${c.lengths.join(' or ')} digits after +${c.code}.`;
}

/**
 * Kept so existing callers compile. Lebanon-only by definition.
 *
 * @deprecated Use isValidNationalPhone(digits, iso) — this hardcodes Lebanon
 * and is the rule that excluded every other MENA country.
 */
export function isValidLocalPhone(digitsOnly: string): boolean {
  return isValidNationalPhone(digitsOnly, 'LB');
}

/** @deprecated Use MAX_NATIONAL_DIGITS. */
export const LOCAL_PHONE_MAX_DIGITS = 8;
