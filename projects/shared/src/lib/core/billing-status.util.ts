import type { BadgeTone } from '../ui';
import type { InvoiceStatus, SubscriptionStatus } from '../models';

/**
 * Maps a subscription's derived status (Go billing.DeriveStatus) to a
 * badge tone. Shared between the artist billing screen and the admin
 * billing overview so the same status never renders a different colour
 * depending on which screen is looking at it - see bookingStatusTone's
 * doc comment for the drift this pattern exists to prevent.
 */
export function subscriptionStatusTone(status: SubscriptionStatus | undefined): BadgeTone {
  switch (status) {
    case 'trialing':
      return 'ink';
    case 'active':
      return 'success';
    case 'grace':
    case 'past_due':
      return 'warning';
    case 'suspended':
      return 'danger';
    case 'cancelled':
      return 'muted';
    default:
      return 'neutral';
  }
}

/** Human-readable label for a subscription status - not a plain
 *  capitalize, since e.g. 'grace' and 'past_due' both need copy that
 *  actually explains what's happening, not just the raw enum value. */
export function subscriptionStatusLabel(status: SubscriptionStatus | undefined): string {
  switch (status) {
    case 'trialing':
      return 'Trial';
    case 'active':
      return 'Active';
    case 'grace':
      return 'Payment overdue';
    case 'past_due':
      return 'Past due';
    case 'suspended':
      return 'Suspended';
    case 'cancelled':
      return 'Cancelled';
    default:
      return '—';
  }
}

/** Maps an invoice status to a badge tone. */
export function invoiceStatusTone(status: InvoiceStatus): BadgeTone {
  switch (status) {
    case 'issued':
      return 'warning';
    case 'submitted':
      return 'ink';
    case 'paid':
      return 'success';
    case 'void':
      return 'muted';
  }
}
