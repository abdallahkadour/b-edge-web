import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';

import { OfferingDataService } from '@bedge/shared';
import type { ServiceOffering, UpdateOfferingRequest } from '@bedge/shared';

import { ServiceOfferingsComponent } from './service-offerings.component';

const row = (over: Partial<ServiceOffering> = {}): ServiceOffering => ({
  service_id: 'svc-1',
  service_name: 'Bridal',
  duration_min: 90,
  offered: true,
  salon_price: '150',
  salon_deposit: '30',
  own_price: null,
  own_deposit: null,
  effective_price: '150',
  effective_deposit: '30',
  deposit_capped: false,
  ...over,
});

/**
 * Stands in for the API. Each update records the request and answers with
 * whatever `reply` returns - by default the row as the server would store it.
 */
class StubOfferings {
  rows: ServiceOffering[] = [];
  calls: UpdateOfferingRequest[] = [];
  reply: (req: UpdateOfferingRequest) => Observable<ServiceOffering> = (req) => {
    const cur = this.rows[0];
    const own_price = req.price === undefined ? cur.own_price : req.price === null ? null : String(Number(req.price));
    const own_deposit =
      req.deposit_amount === undefined ? cur.own_deposit : req.deposit_amount === null ? null : String(Number(req.deposit_amount));
    const next = req.offered
      ? { ...cur, offered: true, own_price, own_deposit, effective_price: own_price ?? cur.salon_price }
      : { ...cur, offered: false, own_price: null, own_deposit: null };
    this.rows = [next];
    return of(next);
  };
  listMine() { return of(this.rows); }
  listForMember() { return of(this.rows); }
  updateMine(_id: string, req: UpdateOfferingRequest) { this.calls.push({ ...req }); return this.reply(req); }
  updateForMember(_a: string, _id: string, req: UpdateOfferingRequest) { this.calls.push({ ...req }); return this.reply(req); }
}

describe('ServiceOfferingsComponent', () => {
  let api: StubOfferings;
  let fixture: ReturnType<typeof TestBed.createComponent<ServiceOfferingsComponent>>;
  const realConfirm = window.confirm;

  async function render(r: ServiceOffering): Promise<void> {
    api.rows = [r];
    fixture = TestBed.createComponent(ServiceOfferingsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const box = () => el().querySelector<HTMLInputElement>('input[role="switch"]')!;
  const button = (label: string) =>
    Array.from(el().querySelectorAll('bedge-button')).find((b) => b.textContent?.includes(label))
      ?.querySelector('button') as HTMLButtonElement;
  const type = (id: string, value: string) => {
    const input = el().querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };
  const settle = async () => { fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges(); };

  beforeEach(async () => {
    api = new StubOfferings();
    await TestBed.configureTestingModule({
      imports: [ServiceOfferingsComponent],
      providers: [{ provide: OfferingDataService, useValue: api }],
    }).compileComponents();
  });

  afterEach(() => { window.confirm = realConfirm; });

  // Final review, Important: the switch is a native checkbox bound with
  // [checked]. A click flips the DOM box BEFORE toggle() runs; if she then
  // cancels the turn-off confirm, row.offered never changed, so the binding
  // never re-applies - the box showed OFF while the service stayed ON.
  it('keeps the switch ON when she cancels turning off a priced service', async () => {
    await render(row({ own_price: '200' }));
    window.confirm = vi.fn(() => false);
    expect(box().checked).toBe(true);

    box().click();
    await settle();

    expect(window.confirm).toHaveBeenCalledTimes(1);
    expect(api.calls).toHaveLength(0);
    expect(box().checked).toBe(true);
  });

  it('puts the switch back ON when turning off fails on the server', async () => {
    await render(row());
    api.reply = () => throwError(() => new HttpErrorResponse({ status: 500 }));

    box().click();
    await settle();

    expect(api.calls).toEqual([{ offered: false }]);
    expect(box().checked).toBe(true);
    expect(el().querySelector('[role="alert"]')).not.toBeNull();
  });

  it('puts the switch back OFF when turning on fails on the server', async () => {
    await render(row({ offered: false }));
    api.reply = () => throwError(() => new HttpErrorResponse({ status: 500 }));

    box().click();
    await settle();

    expect(api.calls).toEqual([{ offered: true }]);
    expect(box().checked).toBe(false);
  });

  // Final review, Minor: drafts were never cleared after a successful save,
  // so after "Use salon price" a later deposit-only save resent the stale
  // price and quietly put her override back.
  it('does not resend a saved price after "use salon price" and a deposit-only save', async () => {
    await render(row());

    type('p-svc-1', '200.00');
    button('Save').click();
    await settle();
    button('Use salon price').click();
    await settle();
    type('d-svc-1', '20');
    button('Save').click();
    await settle();

    expect(api.calls).toEqual([
      { offered: true, price: '200.00' },
      { offered: true, price: null, deposit_amount: null },
      { offered: true, deposit_amount: '20' },
    ]);
  });

  it('keeps her typed value after a refused save, so she can correct it', async () => {
    await render(row());
    api.reply = () => throwError(() => new HttpErrorResponse({ status: 422 }));

    type('d-svc-1', '999');
    button('Save').click();
    await settle();
    api.reply = (req) => of(row({ own_deposit: String(req.deposit_amount) }));
    button('Save').click();
    await settle();

    expect(api.calls).toEqual([
      { offered: true, deposit_amount: '999' },
      { offered: true, deposit_amount: '999' },
    ]);
  });

  // A box must show what the next Save would send. A refused deposit stays
  // typed (and is resent); once "use salon price" succeeds, the box must
  // empty rather than keep showing a value that is no longer pending.
  it('empties a box whose unsaved value was superseded by "use salon price"', async () => {
    await render(row({ own_price: '200' }));
    const echo = api.reply;
    api.reply = () => throwError(() => new HttpErrorResponse({ status: 422 }));
    type('d-svc-1', '250');
    button('Save').click();
    await settle();
    expect(el().querySelector<HTMLInputElement>('#d-svc-1')!.value).toBe('250');

    api.reply = echo;
    button('Use salon price').click();
    await settle();

    expect(el().querySelector<HTMLInputElement>('#p-svc-1')!.value).toBe('');
    expect(el().querySelector<HTMLInputElement>('#d-svc-1')!.value).toBe('');
  });

  // "Use salon price" also clears the deposit - the label says so.
  it('labels the reset button with both things it clears', async () => {
    await render(row({ own_price: '200' }));
    const b = button('Use salon price');
    expect(b.textContent?.trim()).toBe('Use salon price & deposit');
  });
});
