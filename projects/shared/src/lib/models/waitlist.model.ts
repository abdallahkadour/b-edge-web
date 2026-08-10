/**
 * Waitlist models. Mirror the Go booking.JoinWaitlistRequest /
 * WaitlistEntryResponse structs (PRD §9.5).
 */

/** POST /bookings/waitlist request body - public, no account needed. */
export interface JoinWaitlistRequest {
  artist_id: string;
  store_id: string;
  service_id: string;
  requested_date: string; // YYYY-MM-DD
  name: string;
  phone: string; // bare local digits, matching the guest-booking convention
}

/** Artist-facing view of one queue entry. */
export interface WaitlistEntryResponse {
  readonly id: string;
  readonly service_id: string;
  readonly service_name: string;
  readonly customer_name: string;
  readonly customer_phone: string;
  readonly requested_date: string;
  readonly status: 'waiting' | 'notified' | 'expired' | 'cancelled';
  readonly notified_at?: string;
  readonly confirm_deadline?: string;
  readonly created_at: string;
}
