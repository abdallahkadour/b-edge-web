import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { EarningsDataService } from '@bedge/shared';
import type { SalonOverview, SalonTotals } from '@bedge/shared';

import { SalonOverviewPage, change, noShowRate, periodRange } from './salon-overview.page';

// The owner's one screen for the whole salon: everyone's figures for a
// period, the period before, what is waiting now, and one row per artist.

const zero: SalonTotals = {
  earned: '0', earned_bookings: 0, deposits: '0', completed: 0, no_shows: 0,
  cancelled: 0, orders_delivered: 0, orders_value: '0',
};

const overview: SalonOverview = {
  period: { from: '2026-09-30T21:00:00Z', to: '2026-10-31T22:00:00Z' },
  previous_period: { from: '2026-08-31T21:00:00Z', to: '2026-09-10T12:00:00Z' },
  totals: { ...zero, earned: '450', earned_bookings: 5, deposits: '90', completed: 4, no_shows: 1, cancelled: 2, orders_delivered: 1, orders_value: '45.5' },
  previous: { ...zero, earned: '300', earned_bookings: 3, completed: 3 },
  waiting: { awaiting_approval: 2, deposits_to_check: 1, refunds_owed: 1, refunds_owed_amount: '25' },
  by_artist: [
    { artist_id: 'a1', name: 'Rania', is_you: true, is_member: true, earned: '300', earned_bookings: 3, completed: 3, no_shows: 0, cancelled: 1, rating: '4.8', review_count: 12 },
    { artist_id: 'a2', name: 'Maya', is_you: false, is_member: true, earned: '0', earned_bookings: 0, completed: 0, no_shows: 0, cancelled: 0, rating: '0', review_count: 0 },
    { artist_id: 'a3', name: 'Lina', is_you: false, is_member: false, earned: '150', earned_bookings: 2, completed: 1, no_shows: 1, cancelled: 1, rating: '4.5', review_count: 3 },
  ],
};

function render(get: (from?: string, to?: string) => Observable<SalonOverview>) {
  const asked: [string | undefined, string | undefined][] = [];
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: EarningsDataService, useValue: { getSalonOverview: (f?: string, t?: string) => { asked.push([f, t]); return get(f, t); } } },
    ],
  });
  const fixture = TestBed.createComponent(SalonOverviewPage);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const click = (label: string) => {
    const b = [...el.querySelectorAll('button')].find((x) => x.textContent?.trim() === label);
    if (!b) throw new Error(`no button "${label}"`);
    b.click();
    fixture.detectChanges();
  };
  return { el, asked, click };
}

describe('periodRange', () => {
  // Saturday 10 October 2026, 15:00 in Beirut (UTC+3).
  const sat = new Date('2026-10-10T12:00:00Z');

  it('this month is the 1st to the last day', () => {
    expect(periodRange('month', sat)).toEqual({ from: '2026-10-01', to: '2026-10-31' });
  });

  it('last month is the whole month before', () => {
    expect(periodRange('last-month', sat)).toEqual({ from: '2026-09-01', to: '2026-09-30' });
  });

  it('this week runs Monday to Sunday', () => {
    expect(periodRange('week', sat)).toEqual({ from: '2026-10-05', to: '2026-10-11' });
  });

  it('today is one day', () => {
    expect(periodRange('today', sat)).toEqual({ from: '2026-10-10', to: '2026-10-10' });
  });

  it('counts by the salon\'s calendar, not UTC', () => {
    // 22:30 UTC on 31 October is already 00:30 on 1 November in Beirut.
    expect(periodRange('month', new Date('2026-10-31T22:30:00Z'))).toEqual({ from: '2026-11-01', to: '2026-11-30' });
  });
});

describe('change', () => {
  it('is the rise or fall against the previous period', () => {
    expect(change('150', '100')).toEqual({ up: true, pct: 50 });
    expect(change('50', '100')).toEqual({ up: false, pct: 50 });
  });

  it('says nothing when there is nothing to compare with', () => {
    expect(change('120', '0')).toBeNull();
    expect(change('0', '0')).toBeNull();
  });
});

describe('noShowRate', () => {
  it('is no-shows out of the appointments that were due', () => {
    expect(noShowRate({ ...zero, completed: 3, no_shows: 1 })).toBe(25);
  });

  it('is null with nothing due', () => {
    expect(noShowRate(zero)).toBeNull();
  });
});

describe('SalonOverviewPage', () => {
  it('opens on this month and shows the salon\'s figures against last month', () => {
    const { el, asked } = render(() => of(overview));
    expect(asked[0][0]).toMatch(/^\d{4}-\d{2}-01$/);
    expect(el.textContent).toContain('$450');
    expect(el.textContent).toContain('5 appointments');
    expect(el.textContent).toContain('50%');
    expect(el.textContent).toContain('$45.50');
  });

  it('lists every artist, marks the owner\'s own row and anyone who has left', () => {
    const { el } = render(() => of(overview));
    const rows = [...el.querySelectorAll('[data-artist]')].map((r) => r.textContent ?? '');
    expect(rows).toHaveLength(3);
    expect(rows[0]).toContain('Rania');
    expect(rows[0]).toContain('You');
    expect(rows[1]).toContain('Maya');
    expect(rows[2]).toContain('Left the salon');
  });

  it('shows what is waiting now, including the money owed back', () => {
    const { el } = render(() => of(overview));
    const waiting = el.querySelector('[data-waiting]')?.textContent ?? '';
    expect(waiting).toContain('2');
    expect(waiting).toContain('$25');
  });

  it('a period button asks for that period', () => {
    const { asked, click } = render(() => of(overview));
    click('Today');
    const [f, t] = asked[asked.length - 1];
    expect(f).toBe(t);
  });

  it('a member who reaches it is told it is the owner\'s', () => {
    const { el } = render(() => throwError(() => new HttpErrorResponse({
      status: 403, error: { data: null, meta: null, error: { code: 'SALON_ROLE_FORBIDDEN', message: 'Only the salon owner can do this' } },
    })) as Observable<SalonOverview>);
    expect(el.textContent).toContain('Only the salon owner');
  });
});
