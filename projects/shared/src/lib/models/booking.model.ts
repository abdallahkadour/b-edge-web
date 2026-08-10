/**
 * Booking domain models.
 *
 * These interfaces mirror the Go API response structs exactly - field names
 * are snake_case to match the JSON sent over the wire. Do not rename fields
 * to camelCase; they must match the API contract precisely.
 *
 * Money fields are `string`, not `number`. The Go backend uses decimal.Decimal
 * which serializes to a JSON string (e.g. "50.00") to preserve precision.
 * Never parse these into floats for arithmetic - use a decimal library if math
 * is required. For display, the string is rendered as-is.
 */

/**
 * Every booking status. Maps to the CHECK constraint in the migration and the
 * Status* constants in internal/booking/model.go.
 *
 * Blocking statuses (occupy a slot): held, pending, approved, deposit_pending,
 * deposit_paid, confirmed. The rest free the slot.
 */
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

/**
 * Every channel a booking can originate from. Maps to the Channel* constants
 * in internal/booking/model.go.
 */
export type BookingChannel =
  | 'customer_pwa'
  | 'artist_dashboard'
  | 'whatsapp_bot'
  | 'walk_in'
  | 'phone'
  | 'instagram';

/**
 * The subset of channels a client may set when creating a booking.
 * The Go CreateBookingRequest validator allows only:
 *   oneof=customer_pwa artist_dashboard walk_in phone instagram
 * Note whatsapp_bot is excluded - the compiler enforces this rule.
 */
export type CreatableChannel =
  | 'customer_pwa'
  | 'artist_dashboard'
  | 'walk_in'
  | 'phone'
  | 'instagram';

/**
 * The set of blocking statuses, available at runtime for client-side checks.
 * Mirrors BlockingStatuses in internal/booking/model.go.
 */
export const BLOCKING_STATUSES: readonly BookingStatus[] = [
  'held',
  'pending',
  'approved',
  'deposit_pending',
  'deposit_paid',
  'confirmed',
] as const;

/**
 * Booking mirrors the Go BookingResponse struct.
 * Optional fields (`?`) correspond to Go fields tagged `omitempty`.
 */
export interface Booking {
  readonly id: string;
  readonly salon_id: string;
  readonly store_id: string;
  readonly artist_id: string;
  readonly customer_id: string;
  readonly service_id: string;
  readonly start_time: string; // ISO 8601 UTC timestamp
  readonly end_time: string;   // ISO 8601 UTC timestamp
  readonly status: BookingStatus;
  readonly original_price: string;  // decimal as string, e.g. "150.00"
  readonly discount_amount: string;
  readonly final_price: string;
  readonly deposit_amount: string;
  readonly deposit_deadline?: string;  // ISO 8601, present once approved
  readonly deposit_paid_at?: string;   // ISO 8601, present once deposit paid
  readonly deposit_reference?: string; // optional artist-entered note, e.g. a transaction code
  readonly channel: BookingChannel;
  readonly special_requests?: string;
  readonly cancellation_reason?: string;
  readonly created_at: string; // ISO 8601 UTC timestamp
}

/**
 * Request body for creating a booking (POST /api/v1/bookings).
 * Mirrors the Go CreateBookingRequest struct.
 */
export interface CreateBookingRequest {
  artist_id: string;
  store_id: string;
  service_id: string;
  start_time: string; // ISO 8601 UTC timestamp
  channel: CreatableChannel; // validator-allowed subset; excludes whatsapp_bot
  special_requests?: string;
}

/**
 * Request body for cancelling a booking (PATCH /api/v1/bookings/:id/cancel).
 * Mirrors the Go CancelBookingRequest struct.
 */
export interface CancelBookingRequest {
  reason?: string;
}

/**
 * Query parameters for the slot availability endpoint
 * (GET /api/v1/bookings/slots). Mirrors the Go GetAvailableSlotsRequest struct.
 * Date is formatted YYYY-MM-DD.
 */
export interface GetAvailableSlotsParams {
  artist_id: string;
  store_id: string;
  service_id: string;
  date: string; // YYYY-MM-DD
}

/**
 * A single available time slot returned by the slot algorithm
 * (GET /api/v1/bookings/slots). Mirrors the Go TimeSlot struct.
 * early_bird_fee is omitempty in Go, hence optional here.
 */
export interface TimeSlot {
  readonly start_time: string;   // ISO 8601 UTC timestamp
  readonly end_time: string;     // ISO 8601 UTC timestamp
  readonly is_early_bird: boolean;
  readonly early_bird_fee?: string; // decimal as string, omitempty in Go
}

/**
 * Request body for holding a slot as a guest, no identity yet
 * (POST /api/v1/bookings/guest/hold). Mirrors the Go HoldGuestSlotRequest
 * struct. No authentication required - this is the guest funnel's C-04 step.
 */
export interface HoldGuestSlotRequest {
  artist_id: string;
  store_id: string;
  service_id: string;
  start_time: string; // RFC3339, e.g. "2026-08-01T10:00:00Z"
}

/**
 * Response from holding a guest slot. Mirrors the Go HoldGuestSlotResponse
 * struct. `held_until` is the deadline by which submitGuestBooking must be
 * called, or the hold is released back to the pool by the background job.
 */
export interface HoldGuestSlotResponse {
  readonly booking_id: string;
  readonly held_until: string; // ISO 8601 UTC timestamp - 10-minute hold deadline
  readonly start_time: string;
  readonly end_time: string;
}

/**
 * Request body for submitting a guest's details to complete a held booking
 * (PATCH /api/v1/bookings/guest/:id/submit). Mirrors the Go
 * SubmitGuestBookingRequest struct. No authentication required - this is the
 * guest funnel's C-05 step. Fails with HOLD_EXPIRED (409) if held_until has
 * already passed.
 */
export interface SubmitGuestBookingRequest {
  name: string;
  phone: string;
  special_requests?: string;
}