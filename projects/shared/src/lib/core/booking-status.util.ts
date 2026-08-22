import type { BadgeTone } from '../ui';

/**
 * Maps a booking status to a badge tone.
 *
 * This existed as three separate switch statements (bookings,
 * client-detail, waitlist) and they had already drifted: `confirmed`
 * rendered `text-green-800` on one screen and `text-green-700` on
 * another, `pending` was `amber-800` versus `amber-700`, and the waitlist
 * hardcoded `#16a34a` instead of using any token at all. All three also
 * reached for raw Tailwind palette colours (blue-100, amber-100) rather
 * than the semantic tokens that already existed in tailwind.config.js.
 *
 * On the blue states: `approved` and `deposit_paid` previously rendered
 * blue, but the brand palette is deliberately restrained - ink and gray,
 * with exactly three functional colours (success, danger, warning). Rather
 * than introduce a fourth, both map to `ink`: they are active, in-progress
 * states, which is what the ink accent means everywhere else in the app.
 *
 * Kept separate from the ORDER status mapping deliberately. Bookings and
 * orders share some words ("confirmed", "cancelled") but not the same
 * lifecycle - collapsing them into one function would force a false
 * abstraction that breaks the first time either state machine changes.
 */
export function bookingStatusTone(status: string): BadgeTone {
  switch (status) {
    // Waiting on the artist to act.
    case 'pending':
      return 'warning';

    // Active and progressing: approved, awaiting or holding a deposit.
    case 'approved':
    case 'deposit_paid':
    case 'notified':
      return 'ink';

    // Locked in.
    case 'confirmed':
      return 'success';

    // Finished successfully - present but receding.
    case 'completed':
      return 'neutral';

    // Something went wrong and money may be owed.
    case 'cancelled':
    case 'no_show':
      return 'danger';
    case 'refund_due':
      return 'warning';

    // Terminal and inactive.
    case 'expired':
      return 'muted';

    default:
      return 'neutral';
  }
}

/** Turns a snake_case status into a human label ("no_show" -> "No show"). */
export function formatStatusLabel(status: string): string {
  const spaced = status.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
