/**
 * Booking domain models. Mirror the Go booking response/request structs.
 *
 * Field names are snake_case to match the wire format exactly.
 * Money fields are `string` (decimal.Decimal serializes to a quoted JSON
 * string). Never parse money into a JS float for arithmetic.
 */

/** Every booking status (Go Status* constants). */
export type BookingStatus =
  | 'held'
  | 'pending'
  | 'approved'
  | 'deposit_pending'
  | 'deposit_paid'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'no_show'
  | 'refund_due'
  | 'refunded';

/** Every booking channel (Go Channel* constants). */
export type BookingChannel =
  | 'customer_pwa'
  | 'artist_dashboard'
  | 'whatsapp_bot'
  | 'walk_in'
  | 'phone'
  | 'instagram';

/**
 * Channels a client may set when creating a booking. The Go validator allows:
 *   oneof=customer_pwa artist_dashboard walk_in phone instagram
 * whatsapp_bot is excluded — the compiler enforces this.
 */
export type CreatableChannel =
  | 'customer_pwa'
  | 'artist_dashboard'
  | 'walk_in'
  | 'phone'
  | 'instagram';

/** Statuses that occupy a slot. Mirrors Go BlockingStatuses. */
export const BLOCKING_STATUSES: readonly BookingStatus[] = [
  'held',
  'pending',
  'approved',
  'deposit_pending',
  'deposit_paid',
  'confirmed',
] as const;

/** A booking (Go booking.BookingResponse). */
export interface Booking {
  readonly id: string;
  readonly salon_id: string;
  readonly store_id: string;
  readonly artist_id: string;
  readonly customer_id: string;
  readonly service_id: string;
  readonly start_time: string; // ISO 8601 UTC
  readonly end_time: string;   // ISO 8601 UTC
  readonly status: BookingStatus;
  readonly original_price: string;  // decimal as string
  readonly discount_amount: string;
  readonly final_price: string;
  readonly deposit_amount: string;
  readonly deposit_deadline?: string;
  readonly deposit_paid_at?: string;
  readonly channel: BookingChannel;
  readonly special_requests?: string;
  readonly cancellation_reason?: string;
  readonly created_at: string;
}

/** A single available slot (Go booking.TimeSlot). */
export interface TimeSlot {
  readonly start_time: string;
  readonly end_time: string;
  readonly is_early_bird: boolean;
  readonly early_bird_fee?: string; // decimal as string, omitempty
}

/** Query params for GET /bookings/slots. */
export interface GetAvailableSlotsParams {
  artist_id: string;
  store_id: string;
  service_id: string;
  date: string; // YYYY-MM-DD
}

/** Request body for POST /bookings (Go booking.CreateBookingRequest). */
export interface CreateBookingRequest {
  artist_id: string;
  store_id: string;
  service_id: string;
  start_time: string; // ISO 8601 UTC
  channel: CreatableChannel;
  special_requests?: string;
}

/** Request body for PATCH /bookings/:id/cancel. */
export interface CancelBookingRequest {
  reason?: string;
}
