import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AdminDataService } from '@bedge/shared';
import type { AdminBooking, AdminBookingSummary, ListResult } from '@bedge/shared';

import { AdminBookingsComponent } from './admin-bookings.component';

// The admin's Bookings tab (2026-10-09): every salon's bookings, read-only,
// led by what is waiting on someone - above all the deposits salons owe back.

const row = (id: string, over: Partial<AdminBooking> = {}): AdminBooking => ({
  id, salon_id: 's1', store_id: 'st', artist_id: 'a', customer_id: 'c', service_id: 'sv',
  start_time: '2026-10-20T07:00:00Z', end_time: '2026-10-20T08:00:00Z', status: 'refund_due',
  original_price: '150', discount_amount: '0', final_price: '150', deposit_amount: '30',
  channel: 'online', created_at: `2026-10-0${id.slice(-1)}T00:00:00Z`,
  customer_name: 'Lina', customer_phone: '+96170000001', artist_name: 'Rania', service_name: 'Bridal',
  store_name: 'Downtown', store_city: 'Beirut', salon_name: 'Rania Studio',
  ...over,
} as AdminBooking);

const summary: AdminBookingSummary = { refunds_owed: 2, refunds_owed_amount: '130', awaiting_approval: 1, awaiting_deposit: 3 };

function render(pages: ListResult<AdminBooking>[]) {
  const asked: Record<string, unknown>[] = [];
  TestBed.configureTestingModule({
    providers: [{
      provide: AdminDataService,
      useValue: {
        getBookingSummary: () => of(summary),
        listBookings: (p: Record<string, unknown>) => { asked.push(p); return of(pages.shift() ?? { items: [] }); },
      },
    }],
  });
  const fixture = TestBed.createComponent(AdminBookingsComponent);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const click = (label: RegExp) => {
    const b = Array.from(el.querySelectorAll('button')).find((x) => label.test((x.textContent ?? '').trim()));
    if (!b) throw new Error(`no button ${label}`);
    b.click();
    fixture.detectChanges();
  };
  return { el, asked, click, fixture };
}

describe('AdminBookingsComponent', () => {
  it('leads with what is owed back, and lists bookings with their salon', () => {
    const { el } = render([{ items: [row('b1')], meta: { has_more: false } }]);
    expect(el.textContent).toContain('$130');
    expect(el.textContent).toContain('2 refunds owed');
    expect(el.textContent).toContain('Rania Studio');
    expect(el.textContent).toContain('+96170000001');
  });

  it('the refunds-owed figure filters the list to them', () => {
    const { asked, click } = render([{ items: [row('b1')] }, { items: [row('b2')] }]);
    click(/refunds owed/);
    expect(asked[1]).toEqual({ status: 'refund_due', limit: 20 });
  });

  it('a status filter reloads from the first page', () => {
    const { asked, click } = render([{ items: [row('b1')] }, { items: [] }]);
    click(/^Pending$/);
    expect(asked[1]).toEqual({ status: 'pending', limit: 20 });
  });

  it('Load more asks for the next page and adds it below', () => {
    const { el, asked, click } = render([
      { items: [row('b1')], meta: { has_more: true, next_cursor: 'c-1' } },
      { items: [row('b2', { salon_name: 'mkup2 Studio' })], meta: { has_more: false } },
    ]);
    click(/Load more/);
    expect(asked[1]).toEqual({ cursor: 'c-1', limit: 20 });
    expect(el.textContent).toContain('Rania Studio');
    expect(el.textContent).toContain('mkup2 Studio');
    expect(Array.from(el.querySelectorAll('button')).some((b) => /Load more/.test(b.textContent ?? ''))).toBe(false);
  });
});
