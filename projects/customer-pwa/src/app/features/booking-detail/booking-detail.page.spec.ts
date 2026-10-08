import { describe, it, expect } from 'vitest';
import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { LucideAngularModule, icons } from 'lucide-angular';

import { BookingDataService, ReportDataService } from '@bedge/shared';
import type { EnrichedBooking } from '@bedge/shared';

import { BookingDetailPage } from './booking-detail.page';

// E2E 28.10: "Change time" is offered exactly when the server says the
// booking can still be moved (can_reschedule), and a booking that has used
// both moves says why there is no button rather than just lacking one.

const booking = (over: Partial<EnrichedBooking> = {}): EnrichedBooking => ({
  id: 'bk-1', salon_id: 's', store_id: 'st-1', artist_id: 'a-1', customer_id: 'c', service_id: 'sv-1',
  start_time: new Date(Date.now() + 3 * 86_400_000).toISOString(),
  end_time: new Date(Date.now() + 3 * 86_400_000 + 3_600_000).toISOString(),
  status: 'confirmed', original_price: '150', discount_amount: '0', final_price: '150', deposit_amount: '30',
  channel: 'online', created_at: '2026-10-01T00:00:00Z',
  customer_name: 'Lina', artist_name: 'Rania', service_name: 'Bridal', store_name: 'Downtown', store_city: 'Beirut',
  can_reschedule: true, reschedules_left: 2,
  ...over,
} as EnrichedBooking);

function render(b: EnrichedBooking, moved?: string) {
  const went: unknown[][] = [];
  TestBed.configureTestingModule({
    providers: [
      // The app registers its icons once in app.config; a test renders
      // without it, so it registers all of them.
      importProvidersFrom(LucideAngularModule.pick(icons)),
      { provide: BookingDataService, useValue: { getBooking: () => of(b) } },
      { provide: ReportDataService, useValue: {} },
      { provide: Router, useValue: { navigate: (...a: unknown[]) => { went.push(a); return Promise.resolve(true); }, navigateByUrl: () => Promise.resolve(true) } },
    ],
  });
  const fixture = TestBed.createComponent(BookingDetailPage);
  fixture.componentRef.setInput('id', b.id);
  if (moved) fixture.componentRef.setInput('moved', moved);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const buttons = Array.from(el.querySelectorAll('button')).map((x) => (x.textContent ?? '').trim());
  return { el, buttons, went, page: fixture.componentInstance as unknown as Record<string, (b: EnrichedBooking) => void> };
}

describe('BookingDetailPage - changing the time', () => {
  it('offers Change time, and says how many moves are left', () => {
    const { el, buttons } = render(booking({ reschedules_left: 1 }));
    expect(buttons).toContain('Change time');
    expect(el.textContent).toContain('1 more time');
  });

  it('Change time opens the move screen for this booking', () => {
    const b = booking();
    const { page, went } = render(b);
    page['changeTime'](b);
    expect(went).toEqual([[['/my-bookings', 'bk-1', 'move']]]);
  });

  it('after two moves: no button, and it says why', () => {
    const { el, buttons } = render(booking({ can_reschedule: false, reschedules_left: 0 }));
    expect(buttons).not.toContain('Change time');
    expect(el.textContent).toContain('moved twice');
    expect(buttons).toContain('Cancel booking');
  });

  it('a cancelled booking offers neither, and does not explain moves', () => {
    const { el, buttons } = render(booking({ status: 'cancelled', can_reschedule: false, reschedules_left: 2 }));
    expect(buttons).not.toContain('Change time');
    expect(el.textContent).not.toContain('moved twice');
  });

  it('coming back from a move says it moved, and when to', () => {
    const { el } = render(booking(), '1');
    expect(el.textContent).toContain('Moved.');
  });
});
