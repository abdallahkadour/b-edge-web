import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService, ListResult } from './api.service';
import type {
  Booking,
  EnrichedBooking,
  TimeSlot,
  CreateBookingRequest,
  CancelBookingRequest,
  GetAvailableSlotsParams,
  HoldGuestSlotRequest,
  HoldGuestSlotResponse,
  SubmitGuestBookingRequest,
  JoinWaitlistRequest,
  WaitlistEntryResponse,
} from '../models';

/**
 * Data-access service for the booking domain.
 * Thin wrappers over ApiService - one method per endpoint.
 * Used by both the artist-dashboard and the customer-pwa.
 */
@Injectable({ providedIn: 'root' })
export class BookingDataService {
  private readonly api = inject(ApiService);

  /**
   * GET /bookings/artist/:id - paginated bookings for an artist.
   * status filters server-side (e.g. 'pending', 'confirmed'); omit for all.
   */
  getArtistBookings(
    artistId: string,
    cursor?: string,
    limit = 20,
    status?: string,
  ): Observable<ListResult<Booking>> {
    const params: Record<string, string | number> = { limit };
    if (cursor) params['cursor'] = cursor;
    if (status) params['status'] = status;
    return this.api.getList<Booking>(`/bookings/artist/${artistId}`, params);
  }

  /**
   * GET /bookings/customer/me - paginated bookings for the current
   * customer, WITH display names (service, artist, store) - confirmed
   * against the real handler, which calls ListEnrichedBookingsByCustomer,
   * not the plain (unused) GetBookingsByCustomer service method the name
   * might suggest. Typed as EnrichedBooking accordingly, not Booking.
   */
  getCustomerBookings(
    cursor?: string,
    limit = 20,
  ): Observable<ListResult<EnrichedBooking>> {
    const params: Record<string, string | number> = { limit };
    if (cursor) params['cursor'] = cursor;
    return this.api.getList<EnrichedBooking>('/bookings/customer/me', params);
  }

  /**
   * GET /bookings/:id - single booking by ID, WITH display names - confirmed
   * against the real handler, which calls GetEnrichedBookingByID, not the
   * plain type the name might suggest. Same class of type mismatch already
   * fixed on getCustomerBookings. Permits the booking's own customer, its
   * own artist, or an admin - enforced server-side, a 403 for anyone else.
   */
  getBooking(id: string): Observable<EnrichedBooking> {
    return this.api.get<EnrichedBooking>(`/bookings/${id}`);
  }

  /**
   * GET /bookings/slots - available time slots for a single date.
   *
   * Uses getArray: a fully-booked or closed day returns null, which is the
   * exact case the customer PWA renders a "no availability" state for.
   * Note: this returns only bookable windows for the given date - there is
   * no per-day "available: boolean" flag, and no bulk/range query yet.
   */
  getAvailableSlots(params: GetAvailableSlotsParams): Observable<TimeSlot[]> {
    return this.api.getArray<TimeSlot>(
      '/bookings/slots',
      params as unknown as Record<string, string | number>,
    );
  }

  /** POST /bookings - create a booking and hold the slot (authenticated customer). */
  createBooking(req: CreateBookingRequest): Observable<Booking> {
    return this.api.post<Booking>('/bookings', req);
  }

  /**
   * POST /bookings/guest/hold - guest holds a slot (C-04), no auth required.
   * Reserves the slot under a placeholder customer for 10 minutes
   * (`held_until` in the response). Call `submitGuestBooking` before it expires.
   */
  holdGuestSlot(req: HoldGuestSlotRequest): Observable<HoldGuestSlotResponse> {
    return this.api.post<HoldGuestSlotResponse>('/bookings/guest/hold', req);
  }

  /**
   * PATCH /bookings/guest/:id/submit - guest submits name + phone (C-05), no auth.
   * Attaches the guest's identity and transitions the booking held → pending.
   * Fails with HOLD_EXPIRED (409) if the 10-minute window has passed.
   */
  submitGuestBooking(bookingId: string, req: SubmitGuestBookingRequest): Observable<Booking> {
    return this.api.patch<Booking>(`/bookings/guest/${bookingId}/submit`, req);
  }

  /** PATCH /bookings/:id/submit - held → pending (authenticated customer). */
  submit(id: string): Observable<Booking> {
    return this.api.patch<Booking>(`/bookings/${id}/submit`);
  }

  /** PATCH /bookings/:id/approve - pending → approved (artist action). */
  approve(id: string): Observable<Booking> {
    return this.api.patch<Booking>(`/bookings/${id}/approve`);
  }

  /**
   * GET /bookings/artist/:id/calendar?week_start=YYYY-MM-DD - the artist's
   * committed appointments for a 7-day window. Bounded, no pagination
   * a calendar week is a fixed size, unlike the main bookings list.
   * Only "committed" statuses appear here (approved/deposit_paid/confirmed/
   * completed/no_show) - pending requests are deliberately excluded from
   * the grid since they haven't been approved onto the calendar yet.
   */
  getArtistCalendar(artistId: string, weekStart: string): Observable<ListResult<EnrichedBooking>> {
    return this.api.getList<EnrichedBooking>(`/bookings/artist/${artistId}/calendar`, {
      week_start: weekStart,
    });
  }

  /** PATCH /bookings/:id/deposit-received - mark deposit received. */
  markDepositReceived(id: string): Observable<Booking> {
    return this.api.patch<Booking>(`/bookings/${id}/deposit-received`);
  }

  /** PATCH /bookings/:id/confirm-deposit - deposit_paid → confirmed (artist action). */
  confirmDeposit(id: string): Observable<Booking> {
    return this.api.patch<Booking>(`/bookings/${id}/confirm-deposit`);
  }

  /**
   * PATCH /bookings/:id/confirm-payment - approved → confirmed in one step
   * (artist action). This is the PRIMARY deposit action: the artist checks
   * her OMT/Wish transfer and confirms the moment she sees it land, so the
   * deposit-received and confirm-deposit steps above collapse into one call.
   * Use markDepositReceived/confirmDeposit only for edge cases (partial
   * payment, disputed transfer) that genuinely need the two steps apart.
   *
   * reference is an optional note for the artist's own reconciliation
   * (e.g. "Whish Code #94821") - never shown to the customer.
   */
  confirmPayment(id: string, reference?: string): Observable<Booking> {
    return this.api.patch<Booking>(`/bookings/${id}/confirm-payment`, { reference });
  }

  /** PATCH /bookings/:id/complete - confirmed → completed (artist action). */
  complete(id: string): Observable<Booking> {
    return this.api.patch<Booking>(`/bookings/${id}/complete`);
  }

  /** PATCH /bookings/:id/no-show - confirmed → no_show (artist action). */
  markNoShow(id: string): Observable<Booking> {
    return this.api.patch<Booking>(`/bookings/${id}/no-show`);
  }

  /**
   * PATCH /bookings/:id/cancel - works identically whether a customer is
   * cancelling their own booking or an artist is cancelling one of theirs;
   * the backend resolves which based on who's calling (raw user_id vs.
   * booking.customer_id), no separate customer-specific endpoint needed.
   * Refund eligibility (>24h before the appointment for a customer, always
   * for an artist-initiated cancellation) is entirely server-side - the
   * response's status field (cancelled vs refund_due) is the source of
   * truth for what actually happened.
   */
  cancel(id: string, req?: CancelBookingRequest): Observable<Booking> {
    return this.api.patch<Booking>(`/bookings/${id}/cancel`, req ?? {});
  }

  /**
   * POST /bookings/waitlist - join the queue for a fully-booked date.
   * Public, no account - identity resolved by phone, same as a guest
   * booking (PRD §9.5).
   */
  joinWaitlist(req: JoinWaitlistRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/bookings/waitlist', req);
  }

  /**
   * GET /bookings/artist/:id/waitlist - an artist's active waitlist queue.
   * Bearer - the requester must actually be this artist (or admin).
   */
  getWaitlistByArtist(artistId: string): Observable<WaitlistEntryResponse[]> {
    return this.api.getArray<WaitlistEntryResponse>(`/bookings/artist/${artistId}/waitlist`);
  }
}