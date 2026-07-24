/**
 * Enriched booking model — adds joined display names to the base Booking type.
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
  readonly channel: BookingChannel;
  readonly special_requests?: string;
  readonly cancellation_reason?: string;
  readonly created_at: string;
  // Joined display names
  readonly customer_name: string;
  readonly customer_phone?: string;
  readonly service_name: string;
  readonly store_name: string;
  readonly store_city: string;
}
