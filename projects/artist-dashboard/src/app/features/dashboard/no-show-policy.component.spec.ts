import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';

import { PayoutDataService } from '@bedge/shared';
import type { NoShowPolicy } from '@bedge/shared';

import { NoShowPolicyComponent } from './no-show-policy.component';

// Decision D29: the owner sets after how many missed appointments a customer
// pays a deposit (half the price, for services that take none). 0 is off.

function render(current: number, set: (after: number) => Observable<NoShowPolicy>) {
  const sent: number[] = [];
  TestBed.configureTestingModule({
    providers: [{
      provide: PayoutDataService,
      useValue: { getNoShowPolicy: () => of({ after: current }), setNoShowPolicy: (a: number) => { sent.push(a); return set(a); } },
    }],
  });
  const fixture = TestBed.createComponent(NoShowPolicyComponent);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const select = el.querySelector('select') as HTMLSelectElement;
  const choose = (v: string) => {
    select.value = v;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  };
  return { el, select, sent, choose };
}

describe('NoShowPolicyComponent', () => {
  it('shows the salon\'s current setting', () => {
    const { select, el } = render(2, (a) => of({ after: a }));
    expect(select.value).toBe('2');
    expect(el.textContent).toContain('half the price');
  });

  it('a change is saved at once and says so', () => {
    const { sent, choose, el } = render(2, (a) => of({ after: a }));
    choose('3');
    expect(sent).toEqual([3]);
    expect(el.textContent).toContain('Saved');
  });

  it('Off sends 0', () => {
    const { sent, choose } = render(2, (a) => of({ after: a }));
    choose('0');
    expect(sent).toEqual([0]);
  });

  it('a refusal says why and puts the old value back', () => {
    const { select, choose, el } = render(2, () => throwError(() => new HttpErrorResponse({
      status: 403, error: { data: null, meta: null, error: { code: 'SALON_ROLE_FORBIDDEN', message: 'Only the salon owner can do this' } },
    })) as Observable<NoShowPolicy>);
    choose('5');
    expect(el.textContent).toContain('Only the salon owner');
    expect(select.value).toBe('2');
  });
});
