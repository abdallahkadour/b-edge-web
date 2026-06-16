import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService, ListResult } from './api.service';
import type {
  Booking,
  TimeSlot,
  CreateBookingRequest,
  CancelBookingRequest,
  GetAvailableSlotsParams,
} from '../models';

/**
 * Data-access service for the booking domain.
 * Thin wrappers over ApiService — one method per endpoint.
 * Used by both the artist-dashboard and the customer-pwa.
 */
@Injectable({ providedIn: 'root' })
export class BookingDataService {
  private readonly api = inject(ApiService);

  /** GET /bookings/artist/:id — paginated bookings for an artist. */
  getArtistBookings(
    artistId: string,
    cursor?: string,
    limit = 20,
  ): Observable<ListResult<Booking>> {
    const params: Record<string, string | number> = { limit };
    if (cursor) params['cursor'] = cursor;
    return this.api.getList<Booking>(`/bookings/artist/${artistId}`, params);
  }

  /** GET /bookings/customer/me — paginated bookings for the current customer. */
  getCustomerBookings(
    cursor?: string,
    limit = 20,
  ): Observable<ListResult<Booking>> {
    const params: Record<string, string | number> = { limit };
    if (cursor) params['cursor'] = cursor;
    return this.api.getList<Booking>('/bookings/customer/me', params);
  }

  /** GET /bookings/:id — single booking by ID. */
  getBooking(id: string): Observable<Booking> {
    return this.api.get<Booking>(`/bookings/${id}`);
  }

  /** GET /bookings/slots — available time slots for a date. */
  getAvailableSlots(params: GetAvailableSlotsParams): Observable<TimeSlot[]> {
    return this.api.get<TimeSlot[]>(
      '/bookings/slots',
      params as unknown as Record<string, string | number>,
    );
  }

  /** POST /bookings — create a booking and hold the slot for 10 minutes. */
  createBooking(req: CreateBookingRequest): Observable<Booking> {
    return this.api.post<Booking>('/bookings', req);
  }

  /** PATCH /bookings/:id/submit — held → pending. */
  submit(id: string): Observable<Booking> {
    return this.api.patch<Booking>(`/bookings/${id}/submit`);
  }

  /** PATCH /bookings/:id/approve — pending → approved (artist action). */
  approve(id: string): Observable<Booking> {
    return this.api.patch<Booking>(`/bookings/${id}/approve`);
  }

  /** PATCH /bookings/:id/deposit-received — mark deposit received. */
  markDepositReceived(id: string): Observable<Booking> {
    return this.api.patch<Booking>(`/bookings/${id}/deposit-received`);
  }

  /** PATCH /bookings/:id/confirm-deposit — deposit_paid → confirmed (artist action). */
  confirmDeposit(id: string): Observable<Booking> {
    return this.api.patch<Booking>(`/bookings/${id}/confirm-deposit`);
  }

  /** PATCH /bookings/:id/complete — confirmed → completed (artist action). */
  complete(id: string): Observable<Booking> {
    return this.api.patch<Booking>(`/bookings/${id}/complete`);
  }

  /** PATCH /bookings/:id/no-show — confirmed → no_show (artist action). */
  markNoShow(id: string): Observable<Booking> {
    return this.api.patch<Booking>(`/bookings/${id}/no-show`);
  }

  /** PATCH /bookings/:id/cancel — cancel at any cancellable status. */
  cancel(id: string, req?: CancelBookingRequest): Observable<Booking> {
    return this.api.patch<Booking>(`/bookings/${id}/cancel`, req ?? {});
  }
}
