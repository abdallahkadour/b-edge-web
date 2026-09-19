/**
 * Enriched booking model - adds joined display names to the base Booking type.
 * Returned by GET /bookings/artist/:id and GET /bookings/:id.
 * Mirror of Go booking.EnrichedBookingResponse.
 */

import type { BookingStatus, BookingChannel } from './booking.model';

/**
 * An enriched booking with joined customer name, service name, and store name.
 * Returned by the artist list endpoint and the single booking endpoint.
 */
export interface EnrichedBooking {
  readonly id: string;
  readonly salon_id: string;
  readonly store_id: string;
  readonly artist_id: string;
  readonly customer_id: string;
  readonly service_id: string;
  readonly start_time: string;
  readonly end_time: string;
  readonly status: BookingStatus;
  readonly original_price: string;
  readonly discount_amount: string;
  readonly final_price: string;
  readonly deposit_amount: string;
  readonly deposit_deadline?: string;
  readonly deposit_paid_at?: string;
  readonly deposit_reference?: string;
  /**
   * E.164 number the deposit actually ARRIVED FROM, when the artist recorded
   * it at confirmation.
   *
   * Never message this number - it may be an OMT counter rather than a
   * person. It exists to answer one question at refund time: is the account
   * we are about to send money to the account that sent it?
   */
  readonly deposit_payer_phone?: string;
  /**
   * True only when a payer number was recorded AND it differs from the
   * customer's own number.
   *
   * Derived server-side per response (the two numbers are normalised to
   * E.164 first, so "70 123 456" and "+96170123456" do not read as a
   * mismatch). An unrecorded payer is FALSE, not true - "nobody checked"
   * must not render as "these differ", or every booking predating the
   * feature would raise a false alarm.
   *
   * When true, the refund is blocked until the artist confirms they have
   * told the customer where to collect it. See markRefunded().
   */
  readonly deposit_payer_mismatch?: boolean;
  readonly review_token?: string; // present once completed; see leave-review.page.ts
  /** Present once the booking is APPROVED. Builds the customer's
   *  "add to calendar" link (`<api-origin>/c/<token>`). Artist-facing only,
   *  for the same reason as review_token above: until WhatsApp delivery is
   *  live, the artist sending it by hand is the only way it reaches anyone. */
  readonly calendar_token?: string;
  readonly channel: BookingChannel;
  readonly special_requests?: string;
  readonly cancellation_reason?: string;
  readonly created_at: string;
  // Joined display names
  readonly customer_name: string;
  readonly customer_phone?: string;
  readonly artist_name: string;
  readonly service_name: string;
  readonly store_name: string;
  readonly store_city: string;
}
