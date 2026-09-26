import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';

import { ArtistDataService, CartStore, ProductDataService } from '@bedge/shared';
import type { Order, PlaceOrderRequest } from '@bedge/shared';

import { CartPage } from './cart.page';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

// A lost reply: the server placed the order, the phone saw an error.
const lostReply = () => throwError(() => new HttpErrorResponse({ status: 0 }));
const placed = () => of({ id: 'order-1' } as Order);

// ngOnInit is never run, so no network call is made - only placeOrder can
// reach the stub, and every body it is sent is recorded.
function cartPage(replies: (() => Observable<Order>)[]) {
  const sent: PlaceOrderRequest[] = [];
  let items = [{ product_id: 'p-1', quantity: 2 }];
  TestBed.configureTestingModule({
    providers: [
      {
        provide: ProductDataService,
        useValue: { placeOrder: (req: PlaceOrderRequest) => { sent.push(req); return replies.shift()!(); } },
      },
      { provide: ArtistDataService, useValue: {} },
      {
        provide: CartStore,
        useValue: { isEmpty: () => false, toOrderItems: () => items, clear: () => {} },
      },
      { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
    ],
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const page = TestBed.runInInjectionContext(() => new CartPage()) as any;
  page.artistId = () => 'artist-1';
  page.salonId.set('salon-1');
  page.name.set('Maya');
  page.phoneDigits.set('70123456');
  page.deliveryLocation.set({ lat: 33.89, lng: 35.5 });
  return { page, sent, setItems: (next: typeof items) => (items = next) };
}

describe('CartPage - placing the same order twice', () => {
  it('sends the same request id when she retries after an error', () => {
    // Before: every tap was a new order, so a reply lost on a bad
    // connection turned "try again" into a second order and a second
    // stock deduction.
    const { page, sent } = cartPage([lostReply, placed]);

    page.placeOrder();
    page.placeOrder();

    expect(sent).toHaveLength(2);
    expect(sent[0].request_id).toMatch(UUID);
    expect(sent[1].request_id).toBe(sent[0].request_id);
  });

  it('treats a changed cart as a new order', () => {
    const { page, sent, setItems } = cartPage([lostReply, placed]);

    page.placeOrder();
    setItems([{ product_id: 'p-1', quantity: 3 }]);
    page.placeOrder();

    expect(sent[1].request_id).toMatch(UUID);
    expect(sent[1].request_id).not.toBe(sent[0].request_id);
  });

  it('treats changed details as a new order', () => {
    const { page, sent } = cartPage([lostReply, placed]);

    page.placeOrder();
    page.phoneDigits.set('71123456');
    page.placeOrder();

    expect(sent[1].request_id).not.toBe(sent[0].request_id);
  });

  it('starts a new order once one is placed', () => {
    const { page, sent } = cartPage([placed, placed]);

    page.placeOrder();
    page.placeOrder();

    expect(sent[1].request_id).toMatch(UUID);
    expect(sent[1].request_id).not.toBe(sent[0].request_id);
  });

  it('still makes a valid id where randomUUID is missing (plain http)', () => {
    // randomUUID exists only in secure contexts; a phone testing the PWA
    // over http on the LAN must still be able to check out.
    const own = Object.getOwnPropertyDescriptor(crypto, 'randomUUID');
    Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true });
    try {
      const { page, sent } = cartPage([placed, placed]);

      page.placeOrder();
      page.placeOrder();

      expect(sent[0].request_id).toMatch(UUID);
      expect(sent[1].request_id).toMatch(UUID);
      expect(sent[1].request_id).not.toBe(sent[0].request_id);
    } finally {
      if (own) Object.defineProperty(crypto, 'randomUUID', own);
      else delete (crypto as { randomUUID?: unknown }).randomUUID;
    }
  });
});
