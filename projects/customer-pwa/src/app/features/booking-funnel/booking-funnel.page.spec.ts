import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
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

// A hold refused because this network already holds 2 unfinished slots with
// the artist is not "someone took your time": the picker stays, with the
// server's explanation, so she can finish one of the bookings she started.
function pickerWith(holdError: HttpErrorResponse) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: BookingDataService, useValue: { holdGuestSlot: () => throwError(() => holdError) } },
      { provide: ArtistDataService, useValue: {} },
      { provide: MediaDataService, useValue: {} },
      { provide: DiscountDataService, useValue: {} },
      { provide: DiscoveryDataService, useValue: {} },
      { provide: Router, useValue: {} },
    ],
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const page = TestBed.runInInjectionContext(() => new BookingFunnelPage()) as any;
  page.resolvedArtistId.set('artist-1');
  page.services.set([{ id: 'svc-1', name: 'Bridal', duration_min: 90, price: '150', deposit_amount: '30', deposit_deadline_hours: 48 }]);
  page.selectedServiceId.set('svc-1');
  page.step.set('pick-datetime');
  return page;
}

const apiError = (status: number, code: string, message: string) =>
  new HttpErrorResponse({ status, error: { data: null, error: { code, message }, meta: null } });

describe('BookingFunnelPage - a refused hold', () => {
  it('TOO_MANY_HOLDS keeps her on the picker and says why', () => {
    const page = pickerWith(apiError(429, 'TOO_MANY_HOLDS', "You're already holding 2 times with this artist."));

    page.onSlotChosen({ storeId: 'store-1', startTime: '2026-10-05T09:00:00Z' });

    expect(page.step()).toBe('pick-datetime');
    expect(page.holdLimitMessage()).toBe("You're already holding 2 times with this artist.");
    expect(page.holdingSlot()).toBe(false);
  });

  it('SLOT_UNAVAILABLE still goes to "choose another time"', () => {
    const page = pickerWith(apiError(409, 'SLOT_UNAVAILABLE', 'This slot was just taken.'));

    page.onSlotChosen({ storeId: 'store-1', startTime: '2026-10-05T09:00:00Z' });

    expect(page.step()).toBe('slot-unavailable');
  });
});

// ── A code the server would not check ──────────────────────────────────────

function pageWithPreview(preview: () => ReturnType<DiscountDataService['previewForBooking']>) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: BookingDataService, useValue: {} },
      { provide: ArtistDataService, useValue: {} },
      { provide: MediaDataService, useValue: {} },
      { provide: DiscountDataService, useValue: { previewForBooking: preview } },
      { provide: DiscoveryDataService, useValue: {} },
      { provide: Router, useValue: {} },
    ],
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const page = TestBed.runInInjectionContext(() => new BookingFunnelPage()) as any;
  page.holdBookingId.set('bk-1');
  return page;
}

describe('BookingFunnelPage - a promo code the server would not check', () => {
  it('says why when the server says why - too many codes tried is not a network fault', () => {
    // Before: every refusal read "Couldn't check that code just now", so a
    // guest stopped by the code-attempt limit (FRAUD-20) kept retrying.
    const page = pageWithPreview(() => throwError(() => new HttpErrorResponse({
      status: 429,
      error: { data: null, meta: null, error: { code: 'TOO_MANY_CODE_ATTEMPTS',
        message: 'Too many promo codes tried. Please wait a few minutes and try again.' } },
    })));

    page.onApplyPromo('SAVE10');

    expect(page.discountPreview().valid).toBe(false);
    expect(page.discountPreview().reason).toBe('Too many promo codes tried. Please wait a few minutes and try again.');
  });

  it('keeps its own words for a real network failure', () => {
    const page = pageWithPreview(() => throwError(() => new HttpErrorResponse({ status: 0 })));

    page.onApplyPromo('SAVE10');

    expect(page.discountPreview().reason).toBe("Couldn't check that code just now. Please try again.");
  });
});
