import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';

import { BookingDataService } from '@bedge/shared';
import type { Booking, EnrichedBooking, ReassignCandidate } from '@bedge/shared';

import { ReassignSheetComponent } from './reassign-sheet.component';

// Moving a booking to another artist when its own is off (2026-10-10).
// Everyone else in the salon is listed - an artist who cannot take it is
// shown with the reason, never hidden, or the owner reads her absence as a
// bug.

const booking = {
  id: 'b1', artist_name: 'Lina', customer_name: 'Sara', service_name: 'Bridal makeup',
  start_time: '2027-03-01T08:00:00Z', final_price: '150', status: 'confirmed',
} as unknown as EnrichedBooking;

const candidates: ReassignCandidate[] = [
  { artist_id: 'maya', name: 'Maya', eligible: true, price: '220' },
  { artist_id: 'rania', name: 'Rania', eligible: true, price: '150' },
  { artist_id: 'nour', name: 'Nour', eligible: false, reason: 'NOT_OFFERED', price: '0' },
  { artist_id: 'dana', name: 'Dana', eligible: false, reason: 'NOT_FREE', price: '150' },
];

function render(reassign: (id: string, to: string) => Observable<Booking>, list = () => of(candidates)) {
  const sent: [string, string][] = [];
  let listed = 0;
  TestBed.configureTestingModule({
    providers: [{
      provide: BookingDataService,
      useValue: {
        getReassignCandidates: () => { listed++; return list(); },
        reassign: (id: string, to: string) => { sent.push([id, to]); return reassign(id, to); },
      },
    }],
  });
  const fixture = TestBed.createComponent(ReassignSheetComponent);
  fixture.componentRef.setInput('booking', booking);
  let moved = 0;
  fixture.componentInstance.moved.subscribe(() => moved++);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const pick = (id: string) => {
    const r = el.querySelector(`input[value="${id}"]`) as HTMLInputElement;
    r.checked = true;
    r.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  };
  const press = (label: string) => {
    ([...el.querySelectorAll('button')].find((b) => b.textContent?.trim() === label) as HTMLButtonElement).click();
    fixture.detectChanges();
  };
  return { el, sent, pick, press, moved: () => moved, listed: () => listed };
}

describe('ReassignSheetComponent', () => {
  it('lists everyone, and says why the ones who cannot take it cannot', () => {
    const { el } = render(() => of({} as Booking));
    const rows = [...el.querySelectorAll('li')].map((r) => r.textContent?.replace(/\s+/g, ' ').trim() ?? '');
    expect(rows).toHaveLength(4);
    expect(rows[2]).toContain("Nour — doesn't offer this service");
    expect(rows[3]).toContain('Dana — is not free at this time');
    expect((el.querySelector('input[value="nour"]') as HTMLInputElement).disabled).toBe(true);
    expect((el.querySelector('input[value="maya"]') as HTMLInputElement).disabled).toBe(false);
  });

  it('shows a different price, and that the client keeps hers', () => {
    const { el } = render(() => of({} as Booking));
    const text = el.textContent?.replace(/\s+/g, ' ') ?? '';
    expect(text).toContain('her price $220');
    expect(text).not.toContain('her price $150');
    expect(text).toContain('keeps her price of $150');
  });

  it('nothing is moved until an artist is picked', () => {
    const { el, sent } = render(() => of({} as Booking));
    const move = [...el.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Move booking') as HTMLButtonElement;
    expect(move.disabled).toBe(true);
    expect(sent).toEqual([]);
  });

  it('moves it to the artist picked, and says so', () => {
    const { sent, pick, press, moved } = render(() => of({} as Booking));
    pick('maya');
    press('Move booking');
    expect(sent).toEqual([['b1', 'maya']]);
    expect(moved()).toBe(1);
  });

  it('a refusal says why, and the list is fetched again', () => {
    const { el, pick, press, moved, listed } = render(() => throwError(() => new HttpErrorResponse({
      status: 409, error: { data: null, meta: null, error: { code: 'ARTIST_NOT_FREE', message: 'That artist is not free at this time' } },
    })) as Observable<Booking>);
    pick('maya');
    press('Move booking');
    expect(el.textContent).toContain('That artist is not free at this time');
    expect(moved()).toBe(0);
    expect(listed()).toBe(2);
  });

  it('nobody else in the salon: says so', () => {
    const { el } = render(() => of({} as Booking), () => of([]));
    expect(el.textContent).toContain('Nobody else in the salon');
  });
});
