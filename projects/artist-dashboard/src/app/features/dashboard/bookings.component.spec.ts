import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { ArtistDataService, AuthStore, BookingDataService, MembershipDataService } from '@bedge/shared';
import type { EnrichedBooking } from '@bedge/shared';

import { BookingsComponent } from './bookings.component';

// The owner's team view of Bookings (2026-10-10): everyone's bookings come
// from the salon list, each card says whose it is, and the Salon screen's
// links land on the right tab.

const booking = (id: string, artist: string): EnrichedBooking => ({
  id, artist_id: 'a-' + artist, salon_id: 's', store_id: 'st', customer_id: 'c', service_id: 'sv',
  start_time: '2026-10-20T07:00:00Z', end_time: '2026-10-20T08:00:00Z', status: 'pending',
  original_price: '100', discount_amount: '0', final_price: '100', deposit_amount: '0',
  channel: 'customer_pwa', created_at: '2026-10-10T07:00:00Z',
  customer_name: 'Sara', artist_name: artist, service_name: 'Bridal', store_name: 'Hamra', store_city: 'Beirut',
} as unknown as EnrichedBooking);

function render(query: Record<string, string>) {
  const calls: { kind: string; args: unknown[] }[] = [];
  const page = (items: EnrichedBooking[]) => of({ items, meta: { has_more: false } });
  TestBed.configureTestingModule({
    providers: [
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(query) } } },
      { provide: AuthStore, useValue: { isSalonOwner: signal(true), role: signal('artist'), user: signal(null) } },
      { provide: ArtistDataService, useValue: { getMyProfile: () => of({ id: 'a-me' }) } },
      { provide: MembershipDataService, useValue: { listMembers: () => of([]) } },
      {
        provide: BookingDataService, useValue: {
          getArtistBookings: (...args: unknown[]) => { calls.push({ kind: 'mine', args }); return page([booking('b1', 'Rania')]); },
          getSalonBookings: (...args: unknown[]) => { calls.push({ kind: 'salon', args }); return page([booking('b2', 'Maya')]); },
        },
      },
    ],
  });
  const fixture = TestBed.createComponent(BookingsComponent);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement, calls };
}

describe('BookingsComponent - the owner\'s team view', () => {
  it('opens on her own bookings, with no artist line', () => {
    const { el, calls } = render({});
    expect(calls[0].kind).toBe('mine');
    expect(el.querySelector('[data-artist-name]')).toBeNull();
  });

  it('a link from Salon opens everyone\'s requests, each saying whose', () => {
    const { el, calls } = render({ status: 'pending', team: 'all' });
    expect(calls[0]).toEqual({ kind: 'salon', args: [{ artistId: undefined, status: 'pending', cursor: undefined }] });
    expect(el.querySelector('[data-artist-name]')?.textContent).toContain('with Maya');
  });

  it('one artist picked asks for hers', () => {
    const { fixture, calls } = render({});
    fixture.componentInstance.selectTeam('a-maya');
    expect(calls[calls.length - 1]).toEqual({ kind: 'salon', args: [{ artistId: 'a-maya', status: undefined, cursor: undefined }] });
  });

  it('an unknown status in the link is ignored rather than sent', () => {
    const { calls } = render({ status: 'everything' });
    expect(calls[0].args[3]).toBeUndefined();
  });
});
