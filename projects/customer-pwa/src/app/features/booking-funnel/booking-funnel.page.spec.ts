import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import {
  ArtistDataService,
  BookingDataService,
  DiscountDataService,
  DiscoveryDataService,
  MediaDataService,
} from '@bedge/shared';
import type { HoldGuestSlotResponse } from '@bedge/shared';

import { BookingFunnelPage } from './booking-funnel.page';

const quote: HoldGuestSlotResponse = {
  booking_id: 'bk-1',
  held_until: new Date(Date.now() + 5 * 60_000).toISOString(),
  start_time: new Date(Date.now() + 86_400_000).toISOString(),
  end_time: new Date(Date.now() + 86_400_000 + 90 * 60_000).toISOString(),
  original_price: '150', early_bird_fee: '0', final_price: '150', deposit_amount: '30',
};

// The page loads in ngOnInit, so building it without change detection makes
// no network call - only the release under test can reach the stub.
function pageWith(release: (id: string) => ReturnType<BookingDataService['releaseGuestHold']>) {
  TestBed.configureTestingModule({
    providers: [
      { provide: BookingDataService, useValue: { releaseGuestHold: release } },
      { provide: ArtistDataService, useValue: {} },
      { provide: MediaDataService, useValue: {} },
      { provide: DiscountDataService, useValue: {} },
      { provide: DiscoveryDataService, useValue: {} },
      { provide: Router, useValue: {} },
    ],
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const page = TestBed.runInInjectionContext(() => new BookingFunnelPage()) as any;
  page.holdBookingId.set('bk-1');
  page.heldUntil.set(quote.held_until);
  page.holdQuote.set(quote);
  page.step.set('details');
  return page;
}

describe('BookingFunnelPage - back from the last screen', () => {
  it('releases her hold, forgets it, and returns to the time picker', () => {
    // Before: the slot she let go stayed held for the rest of its 10
    // minutes, so the time she had just given up looked taken.
    const released: string[] = [];
    const page = pageWith((id) => { released.push(id); return of(undefined); });

    page.onBackFromDetails();

    expect(released).toEqual(['bk-1']);
    expect(page.holdBookingId()).toBeNull();
    expect(page.heldUntil()).toBeNull();
    expect(page.holdQuote()).toBeNull();
    expect(page.step()).toBe('pick-datetime');
  });

  it('still goes back when the release call fails - the timer frees the slot anyway', () => {
    const page = pageWith(() => throwError(() => new Error('offline')));

    expect(() => page.onBackFromDetails()).not.toThrow();
    expect(page.holdBookingId()).toBeNull();
    expect(page.step()).toBe('pick-datetime');
  });
});
