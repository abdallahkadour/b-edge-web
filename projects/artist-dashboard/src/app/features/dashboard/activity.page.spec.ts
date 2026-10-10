import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';

import { ActivityDataService, MembershipDataService } from '@bedge/shared';
import type { ActivityEntry, ListResult, SalonMember } from '@bedge/shared';

import { ActivityPage } from './activity.page';

// The owner's Activity screen: who did what, newest first, by day.

const today = new Date().toISOString();

const rows: ActivityEntry[] = [
  {
    id: 'e1', at: today, entity_type: 'payment_method', entity_id: 'p1', action: 'payment_method.save',
    actor: { id: 'u2', name: 'Maya', role: 'artist', is_you: false }, subject: {},
    old: { method: 'whish', account_name: 'Rania', account_ref: '71900001' },
    new: { method: 'whish', account_name: 'Maya', account_ref: '70111222' },
  },
  {
    id: 'e2', at: today, entity_type: 'booking', entity_id: 'b1', action: 'booking.approve',
    actor: { id: 'u1', name: 'Rania', role: 'artist', is_you: true },
    subject: { service_name: 'Bridal makeup', customer_name: 'Sara', artist_name: 'Maya', start_time: today },
  },
];

const members = [
  { artist_id: 'a1', user_id: 'u1', display_name: 'Rania', is_owner: true },
  { artist_id: 'a2', user_id: 'u2', display_name: 'Maya', is_owner: false },
] as SalonMember[];

function render(list: (opts: Record<string, unknown>) => Observable<ListResult<ActivityEntry>>) {
  const asked: Record<string, unknown>[] = [];
  TestBed.configureTestingModule({
    providers: [
      { provide: ActivityDataService, useValue: { list: (o: Record<string, unknown>) => { asked.push(o); return list(o); } } },
      { provide: MembershipDataService, useValue: { listMembers: () => of(members) } },
    ],
  });
  const fixture = TestBed.createComponent(ActivityPage);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  return { fixture, el, asked };
}

const page = (items: ActivityEntry[], more = false) => of({ items, meta: { has_more: more, next_cursor: more ? 'c1' : undefined } } as ListResult<ActivityEntry>);

describe('ActivityPage', () => {
  it('says who did what, under the day it happened', () => {
    const { el } = render(() => page(rows));
    const text = el.textContent ?? '';
    expect(text).toContain('Today');
    expect(text).toContain('Maya changed the Whish account');
    expect(text).toContain('Rania 71900001 → Maya 70111222');
    expect(text).toContain("You approved Sara's Bridal makeup");
  });

  it('a payment account change stands out', () => {
    const { el } = render(() => page(rows));
    const flagged = [...el.querySelectorAll('[data-alert]')].map((r) => r.textContent ?? '');
    expect(flagged).toHaveLength(1);
    expect(flagged[0]).toContain('Whish');
  });

  it('a kind narrows the feed from the first page', () => {
    const { el, fixture, asked } = render(() => page(rows));
    const tab = [...el.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Payments') as HTMLButtonElement;
    tab.click();
    fixture.detectChanges();
    expect(asked[asked.length - 1]).toEqual({ kind: 'payments', actor: undefined, cursor: undefined });
  });

  it('a person narrows it to theirs, by user id', () => {
    const { el, fixture, asked } = render(() => page(rows));
    const select = el.querySelector('select') as HTMLSelectElement;
    expect([...select.options].map((o) => o.textContent?.trim())).toEqual(['Everyone', 'You', 'Maya']);
    select.value = 'u2';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(asked[asked.length - 1]).toEqual({ kind: undefined, actor: 'u2', cursor: undefined });
  });

  it('Load more asks for the next page and adds it below', () => {
    let n = 0;
    const { el, fixture, asked } = render(() => (n++ === 0 ? page([rows[0]], true) : page([rows[1]])));
    const more = [...el.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Load more') as HTMLButtonElement;
    more.click();
    fixture.detectChanges();
    expect(asked[1]).toEqual({ kind: undefined, actor: undefined, cursor: 'c1' });
    expect(el.querySelectorAll('[data-entry]')).toHaveLength(2);
  });

  it('a member who reaches it is told it is the owner\'s', () => {
    const { el } = render(() => throwError(() => new HttpErrorResponse({
      status: 403, error: { data: null, meta: null, error: { code: 'SALON_ROLE_FORBIDDEN', message: 'Only the salon owner can do this' } },
    })) as Observable<ListResult<ActivityEntry>>);
    expect(el.textContent).toContain('Only the salon owner');
  });
});
