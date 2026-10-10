import type { ActivityEntry } from '@bedge/shared';

/**
 * The words for the salon activity log (2026-10-10).
 *
 * The API records an action code and the values before and after; this file
 * is the only place they become a sentence, so a change in wording is one
 * edit here and a test that says so. An action it does not know is shown by
 * its code rather than hidden - a row the screen cannot word is still a
 * thing that happened.
 */

/** Every store today is in Lebanon. */
const TZ = 'Asia/Beirut';

export interface EntryText {
  /** Follows the actor's name: "Maya approved Sara's Bridal makeup". */
  text: string;
  /** A second line: whose, when, or what changed from what. */
  detail?: string;
  /** Worth the owner's eye: a payment account changed. */
  alert?: boolean;
}

type Values = Record<string, unknown>;

/** "You", the person, "Sara (client)", or "B-Edge" for the system. */
export function whoDidIt(e: ActivityEntry): string {
  if (e.actor.is_you) return 'You';
  if (!e.actor.id || e.actor.role === 'system') return 'B-Edge';
  if (e.actor.role === 'customer') return `${e.actor.name} (client)`;
  if (e.actor.role === 'admin') return `${e.actor.name} (B-Edge)`;
  return e.actor.name;
}

export function describeEntry(e: ActivityEntry): EntryText {
  const o: Values = e.old ?? {};
  const n: Values = e.new ?? {};
  const s = e.subject;
  const client = s.customer_name || 'a client';
  const service = s.service_name || 'appointment';
  const booking = `${possessive(client)} ${service}`;
  const whoseWhen = join(s.artist_name, s.start_time ? when(s.start_time) : undefined);

  switch (e.action) {
    // ── bookings ─────────────────────────────────────────────────────────
    case 'booking.approve':
      return { text: `approved ${booking}`, detail: whoseWhen };
    case 'booking.deposit_paid':
      return { text: `marked the deposit received for ${booking}`, detail: whoseWhen };
    case 'booking.confirm':
      return { text: `confirmed ${booking}`, detail: join(whoseWhen, depositNote(n, 'deposit received')) };
    case 'booking.refunded':
      return { text: `sent back ${possessive(client)} ${money(n['deposit_amount'])} deposit`, detail: whoseWhen };
    case 'booking.cancel':
      return {
        text: `cancelled ${booking}`,
        detail: join(whoseWhen, n['status'] === 'refund_due' ? `${money(n['deposit_amount'])} deposit to send back` : undefined),
      };
    case 'booking.complete':
      return { text: `marked ${booking} done`, detail: whoseWhen };
    case 'booking.no_show':
      return { text: `marked ${client} a no-show for ${service}`, detail: whoseWhen };
    case 'booking.reschedule':
      return { text: `moved ${booking}`, detail: `${when(String(o['start_time']))} → ${when(String(n['start_time']))}` };
    case 'booking.shift_day': {
      const mins = Number(n['minutes']) || 0;
      const moved = Number(n['moved']) || 0;
      return {
        text: `shifted ${possessive(s.artist_name || 'an artist')} day by ${Math.abs(mins)} min ${mins < 0 ? 'earlier' : 'later'}`,
        detail: `${day(String(n['date']))} · ${moved} ${moved === 1 ? 'appointment' : 'appointments'} moved`,
      };
    }

    // ── payments ─────────────────────────────────────────────────────────
    case 'payment_method.save': {
      const m = methodName(n['method']);
      if (e.old) {
        return { text: `changed the ${m} account`, detail: `${account(o)} → ${account(n)}`, alert: true };
      }
      return { text: `added ${article(m)} ${m} account`, detail: account(n) };
    }
    case 'payment_method.retire':
      return { text: `turned off the ${methodName(n['method'])} account`, detail: account(n) };
    case 'payment_method.restore':
      return { text: `turned the ${methodName(n['method'])} account back on`, detail: account(n) };
    case 'salon.no_show_policy':
      return {
        text: 'changed the no-show deposit rule',
        detail: e.old ? `${noShowRule(o['after'])} → ${noShowRule(n['after'])}` : noShowRule(n['after']),
      };

    // ── the menu, stores and codes ───────────────────────────────────────
    case 'service.create':
      return { text: `added ${n['name']} to the menu`, detail: money(n['price']) };
    case 'service.update':
      return { text: `changed ${n['name'] ?? o['name']}`, detail: changes(o, n, ['name']) };
    case 'service.delete':
      return { text: `removed ${o['name']} from the menu`, detail: money(o['price']) };
    case 'store.update':
      return { text: `changed ${s.store_name || n['name']} settings`, detail: changes(o, n, ['name']) };
    case 'store.hours':
      return {
        text: `changed ${possessive(s.store_name || 'the store')} ${WEEKDAYS[Number(n['day_of_week'])] ?? ''} hours`,
        detail: n['is_open'] ? `${clock(n['open_time'])}–${clock(n['close_time'])}` : 'closed',
      };
    case 'store.closure_add':
      return n['is_closed']
        ? { text: `closed ${s.store_name || 'the store'} on ${day(String(n['date']))}`, detail: n['reason'] as string | undefined }
        : { text: `set special hours at ${s.store_name || 'the store'} on ${day(String(n['date']))}`,
            detail: join(n['open_time'] ? `${clock(n['open_time'])}–${clock(n['close_time'])}` : undefined, n['reason'] as string | undefined) };
    case 'store.closure_remove':
      return { text: `removed the ${day(String(n['date']))} closure at ${s.store_name || 'the store'}` };
    case 'discount.create':
      return { text: `created code ${n['code']}`, detail: n['kind'] === 'percentage' ? `${Number(n['value'])}% off` : `${money(n['value'])} off` };
    case 'discount.update':
      return { text: `changed code ${n['code'] ?? o['code']}`, detail: changes(o, n, ['code']) };
    case 'product.create':
      return { text: `added ${n['name']} to the shop`, detail: money(n['price']) };
    case 'product.update':
      return { text: `changed ${n['name'] ?? o['name']}`, detail: changes(o, n, ['name']) };

    // ── the shop ─────────────────────────────────────────────────────────
    case 'order.payment_confirmed':
      return { text: `confirmed payment for ${possessive(client)} order`, detail: money(n['total_amount']) };
    case 'order.shipped':
      return { text: `shipped ${possessive(client)} order`, detail: money(n['total_amount']) };
    case 'order.delivered':
      return { text: `delivered ${possessive(client)} order`, detail: money(n['total_amount']) };
    case 'order.cancelled':
      return { text: `cancelled ${possessive(client)} order`, detail: money(n['total_amount']) };

    // ── the team (the older spellings, written before this file) ─────────
    case 'invite':
      return { text: `invited ${(n['phone'] || n['email'] || 'an artist') as string}` };
    case 'accept':
      return { text: 'joined the salon' };
    case 'revoke':
      return { text: 'cancelled an invitation' };
    case 'remove_member':
      return { text: `removed ${s.artist_name || 'an artist'} from the salon` };
    case 'leave_salon':
      return { text: 'left the salon' };
    case 'transfer_ownership':
      return { text: 'handed the salon over to a new owner' };
    case 'offering.update':
      return {
        text: `updated the ${s.service_name || 'service'} offer${s.artist_name ? ` for ${s.artist_name}` : ''}`,
        detail: changes(o, n, ['artist_id', 'service_id']),
      };
    case 'offering.off':
      return { text: `stopped ${s.artist_name || 'an artist'} offering ${s.service_name || 'a service'}` };
  }
  return { text: e.action };
}

// ── helpers ──────────────────────────────────────────────────────────────────

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const LABELS: Record<string, string> = {
  price: 'price', deposit_amount: 'deposit', duration_min: 'duration', is_active: '',
  early_bird_fee: 'early-bird fee', early_bird_cutoff: 'early-bird before', same_day_notice_hours: 'same-day notice',
  weekday_buffer_min: 'weekday travel buffer', weekend_buffer_min: 'weekend travel buffer', city: 'city',
  value: 'value', max_redemptions: 'uses', ends_at: 'ends', first_time_only: 'first visit only',
  stock_quantity: 'stock', offered: 'offered',
};
const MONEY_KEYS = new Set(['price', 'deposit_amount', 'early_bird_fee']);
const MINUTE_KEYS = new Set(['duration_min', 'weekday_buffer_min', 'weekend_buffer_min']);

/** "price $200 → $250, deposit $50 → $60" - only the keys that moved. */
function changes(o: Values, n: Values, naming: string[]): string | undefined {
  const parts: string[] = [];
  for (const key of Object.keys(n)) {
    if (naming.includes(key) || sameValue(o[key], n[key])) continue;
    const label = LABELS[key] ?? key.replace(/_/g, ' ');
    const text = `${fmt(key, o[key])} → ${fmt(key, n[key])}`;
    parts.push(label ? `${label} ${text}` : text);
  }
  return parts.length ? parts.join(', ') : undefined;
}

function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function fmt(key: string, v: unknown): string {
  if (v === undefined || v === null || v === '') return '–';
  if (typeof v === 'boolean') return key === 'offered' || key === 'first_time_only' ? (v ? 'yes' : 'no') : v ? 'on' : 'off';
  if (MONEY_KEYS.has(key)) return money(v);
  if (MINUTE_KEYS.has(key)) return `${v} min`;
  if (key === 'ends_at' && typeof v === 'string') return day(v);
  if (key === 'stock_quantity' && v === -1) return 'not tracked';
  return String(v);
}

function money(v: unknown): string {
  const x = parseFloat(String(v ?? '0')) || 0;
  return Number.isInteger(x) ? `$${x}` : `$${x.toFixed(2)}`;
}

function depositNote(n: Values, words: string): string | undefined {
  const d = parseFloat(String(n['deposit_amount'] ?? '0')) || 0;
  return d > 0 ? `${money(d)} ${words}` : undefined;
}

function account(v: Values): string {
  return [v['account_name'], v['account_ref']].filter(Boolean).join(' ');
}

function methodName(v: unknown): string {
  return v === 'omt' ? 'OMT' : v === 'whish' ? 'Whish' : String(v ?? 'payment');
}

function article(word: string): string {
  return /^[AEIOU]/i.test(word) ? 'an' : 'a';
}

function noShowRule(v: unknown): string {
  const after = Number(v) || 0;
  return after === 0 ? 'off' : `after ${after} ${after === 1 ? 'no-show' : 'no-shows'}`;
}

function possessive(name: string): string {
  return name.endsWith('s') ? `${name}'` : `${name}'s`;
}

function join(...parts: (string | undefined)[]): string | undefined {
  const kept = parts.filter((p): p is string => !!p);
  return kept.length ? kept.join(' · ') : undefined;
}

/** "Sat 18 Oct, 10:00" on the salon's clock. */
function when(iso: string): string {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' }).format(d);
  const time = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(d);
  return `${date.replace(',', '')}, ${time}`;
}

/** "Sat 18 Oct" for a calendar date (YYYY-MM-DD) or an instant. */
function day(v: string): string {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(v + 'T12:00:00Z') : new Date(v);
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' }).format(d).replace(',', '');
}

/** "10:00" from "10:00:00". */
function clock(v: unknown): string {
  return String(v ?? '').slice(0, 5);
}
