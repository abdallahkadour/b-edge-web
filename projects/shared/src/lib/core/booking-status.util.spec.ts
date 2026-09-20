import { TERMINAL_BOOKING_STATUSES, canCancelBooking } from './booking-status.util';
import { BLOCKING_STATUSES } from '../models/booking.model';
import type { BookingStatus } from '../models/booking.model';

/**
 * These tests exist because of a specific failure, not for coverage.
 *
 * The cancellable rule was written out by hand in two components and they
 * disagreed: the artist dashboard allowed five statuses, the customer app
 * three. A customer who had paid a deposit and wanted to cancel three days
 * out - entitled to a full refund - was shown no cancel button, while the
 * API would have allowed it.
 *
 * Every assertion below pins a TypeScript value to a rule that actually
 * lives in Go or in SQL. They are the only thing standing between those two
 * copies and the next silent divergence.
 */

// The eleven values the bookings.status CHECK constraint permits.
const DB_STATUSES: BookingStatus[] = [
  'held', 'pending', 'approved', 'deposit_paid', 'confirmed',
  'completed', 'cancelled', 'expired', 'no_show', 'refund_due', 'refunded',
];

describe('booking status rules', () => {
  it('cancellable is exactly the complement of the database terminal set', () => {
    // internal/booking/repository.go, CancelBooking:
    //   AND status NOT IN ('completed','cancelled','expired',
    //                      'no_show','refund_due','refunded')
    const cancellable = DB_STATUSES.filter((s) => canCancelBooking(s)).sort();
    expect(cancellable).toEqual(
      ['approved', 'confirmed', 'deposit_paid', 'held', 'pending'].sort(),
    );
  });

  it('allows cancelling a booking whose deposit has been paid', () => {
    // The exact case the customer app used to hide. Money has changed hands
    // and the customer is still entitled to cancel.
    expect(canCancelBooking('deposit_paid')).toBe(true);
  });

  it('refuses to cancel anything already finished', () => {
    for (const s of TERMINAL_BOOKING_STATUSES) {
      expect(canCancelBooking(s)).toBe(false);
    }
  });

  it('blocking statuses match BlockingStatuses in Go', () => {
    // internal/booking/model.go: pending, approved, held, deposit_paid, confirmed
    expect([...BLOCKING_STATUSES].sort()).toEqual(
      ['approved', 'confirmed', 'deposit_paid', 'held', 'pending'].sort(),
    );
  });

  it('knows no status the database cannot store', () => {
    // deposit_pending lived in the TypeScript union for months after being
    // dropped from the schema (decision D14). A phantom member makes an
    // exhaustive switch look complete while handling a case that cannot
    // arrive.
    for (const s of [...TERMINAL_BOOKING_STATUSES, ...BLOCKING_STATUSES]) {
      expect(DB_STATUSES).toContain(s);
    }
  });
});
