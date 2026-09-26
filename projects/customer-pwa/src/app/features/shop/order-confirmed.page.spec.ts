import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Check, ChevronRight, LucideAngularModule } from 'lucide-angular';

import { ProductDataService } from '@bedge/shared';
import type { Order } from '@bedge/shared';

import { OrderConfirmedPage } from './order-confirmed.page';

const order = (extra: Partial<Order>): Order => ({
  id: 'order-1', status: 'placed', total_amount: '30', created_at: '2026-09-27T10:00:00Z',
  items: [{ product_id: 'p-1', product_name: 'Serum', unit_price: '20', quantity: 2, subtotal: '40' }],
  ...extra,
} as Order);

function render(o: Order): HTMLElement {
  TestBed.configureTestingModule({
    imports: [LucideAngularModule.pick({ Check, ChevronRight })],
    providers: [
      { provide: ProductDataService, useValue: { getOrder: () => of(o) } },
      { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
    ],
  });
  const fixture = TestBed.createComponent(OrderConfirmedPage);
  fixture.componentRef.setInput('artistId', 'artist-1');
  fixture.componentRef.setInput('orderId', 'order-1');
  fixture.detectChanges();
  fixture.componentInstance.toggleDetails();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('OrderConfirmedPage - order details', () => {
  it('shows the code and what it took off between the items and the total', () => {
    // Before: $40 of items above a $30 total with nothing in between.
    const text = render(order({ discount_amount: '10', discount_code: 'SAVE10' })).textContent ?? '';

    expect(text).toContain('SAVE10');
    expect(text).toMatch(/−\$10(?!\d)/);
    expect(text.indexOf('SAVE10')).toBeLessThan(text.lastIndexOf('Total'));
  });

  it('shows no discount line when nothing was taken off', () => {
    const text = render(order({ total_amount: '40' })).textContent ?? '';

    expect(text).not.toContain('−$');
  });
});
