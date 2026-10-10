import type { EnrichedBooking } from './enriched-booking.model';

/** Admin review-queue models. Mirror the Go admin.* structs. */

export interface PendingArtist {
  artist_id: string;
  name: string;
  email: string;
  handle: string | null;
  category: string | null;
  bio: string | null;
  salon_name: string;
  store_name: string;
  city: string;
  service_name: string;
  submitted_at: string;
}

export interface DecisionRequest {
  reason?: string;
}

/** GET /admin/bookings - a booking from any salon, with the salon's name.
 *  The admin view is read-only: the admin sees, the artist acts. */
export interface AdminBooking extends EnrichedBooking {
  readonly salon_name: string;
}

/** GET /admin/bookings/summary - what is waiting on someone, platform-wide.
 *  refunds_owed_amount is the deposits salons owe back to customers now;
 *  B-Edge never holds that money, so it can only be seen and chased. */
export interface AdminBookingSummary {
  readonly refunds_owed: number;
  readonly refunds_owed_amount: string;
  readonly awaiting_approval: number;
  readonly awaiting_deposit: number;
}
