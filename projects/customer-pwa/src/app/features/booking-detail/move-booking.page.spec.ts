import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';

import { BookingDataService } from '@bedge/shared';
import type { Booking, EnrichedBooking } from '@bedge/shared';

import { MoveBookingPage } from './move-booking.page';

// E2E 28.10: the API could always move a booking, but no screen called it,
// so a customer who could not make it could only cancel - losing the slot
// and, inside 24 hours, the deposit. This page is the screen.

const booking = (over: Partial<EnrichedBooking> = {}): EnrichedBooking => ({
  id: 'bk-1', salon_id: 's', store_id: 'st-1', artist_id: 'a-1', customer_id: 'c', service_id: 'sv-1',
  start_time: '2026-10-20T07:00:00Z', end_time: '2026-10-20T08:00:00Z', status: 'confirmed',
  original_price: '150', discount_amount: '0', final_price: '150', deposit_amount: '30',
  channel: 'online', created_at: '2026-10-01T00:00:00Z',
  customer_name: 'Lina', artist_name: 'Rania', service_name: 'Bridal', store_name: 'Downtown', store_city: 'Beirut',
  can_reschedule: true, reschedules_left: 2,
  ...over,
} as EnrichedBooking);

function pageWith(svc: Partial<BookingDataService>, b = booking()) {
  const went: unknown[][] = [];
  TestBed.configureTestingModule({
    providers: [
      { provide: BookingDataService, useValue: svc },
      { provide: Router, useValue: { navigate: (...a: unknown[]) => { went.push(a); return Promise.resolve(true); } } },
    ],
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const page = TestBed.runInInjectionContext(() => new MoveBookingPage()) as any;
  page.booking.set(b);
  return { page, went };
}

const conflict = (code: string, message: string) =>
  new HttpErrorResponse({ status: 409, error: { data: null, meta: null, error: { code, message } } });

describe('MoveBookingPage', () => {
  it('offers the times the move will accept - the booking\'s own reschedule-slots', () => {
    const asked: string[][] = [];
    const { page } = pageWith({
      getRescheduleSlots: (id: string, date: string) => { asked.push([id, date]); return of([]); },
    });

    page.loadSlots()('st-1', '2026-10-21').subscribe();

    expect(asked).toEqual([['bk-1', '2026-10-21']]);
  });

  it('opens on the day the booking is on, in Beirut', () => {
    // 22:30 UTC on the 19th is 01:30 on the 20th in Beirut.
    const { page } = pageWith({}, booking({ start_time: '2026-10-19T22:30:00Z' }));
    expect(page.initialDate()).toBe('2026-10-20');
  });

  it('says how many more times it can be moved', () => {
    const { page } = pageWith({}, booking({ reschedules_left: 1 }));
    expect(page.note()).toContain('1 more time');
    expect(page.note()).not.toContain('times.');
  });

  it('a move that goes through returns to the booking, saying so', () => {
    const moved: string[][] = [];
    const { page, went } = pageWith({
      reschedule: (id: string, t: string) => { moved.push([id, t]); return of({} as Booking); },
    });

    page.move('2026-10-21T09:00:00Z');

    expect(moved).toEqual([['bk-1', '2026-10-21T09:00:00Z']]);
    expect(went).toEqual([[['/my-bookings', 'bk-1'], { queryParams: { moved: '1' } }]]);
  });

  it('a time taken a moment ago says so, and the times are fetched again', () => {
    const { page, went } = pageWith({
      reschedule: () => throwError(() => conflict('SLOT_UNAVAILABLE', 'That time is no longer available. Please pick another.')) as Observable<never>,
    });
    const before = page.loadSlots();

    page.move('2026-10-21T09:00:00Z');

    expect(page.problem()).toContain('no longer available');
    expect(page.loadSlots()).not.toBe(before);
    expect(page.moving()).toBe(false);
    expect(went).toEqual([]);
  });

  it('a booking that can no longer be moved is not offered times', () => {
    const { page } = pageWith({}, booking({ can_reschedule: false, reschedules_left: 0 }));
    expect(page.movable()).toBe(false);
  });
});
