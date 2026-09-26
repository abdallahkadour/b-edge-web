import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ChevronRight, LucideAngularModule } from 'lucide-angular';

import { CustomerAuthStore, ProductDataService } from '@bedge/shared';
import type { Order } from '@bedge/shared';

import { MyOrdersPage } from './my-orders.page';

function expandedText(order: Partial<Order>): string {
  const o = {
    id: 'order-1', status: 'placed', total_amount: '30', created_at: '2026-09-27T10:00:00Z',
    items: [{ product_id: 'p-1', product_name: 'Serum', unit_price: '20', quantity: 2, subtotal: '40' }],
    ...order,
  } as Order;
  TestBed.configureTestingModule({
    imports: [LucideAngularModule.pick({ ChevronRight })],
    providers: [
      { provide: ProductDataService, useValue: { getMyOrders: () => of([o]) } },
      { provide: CustomerAuthStore, useValue: { customer: () => null, logout: () => of(undefined) } },
      { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
    ],
  });
  const fixture = TestBed.createComponent(MyOrdersPage);
  fixture.detectChanges();
  fixture.componentInstance.expandedId.set('order-1');
  fixture.detectChanges();
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

describe('MyOrdersPage - an order paid with a code', () => {
  it('shows the code and what it took off under the items', () => {
    const text = expandedText({ discount_amount: '10', discount_code: 'SAVE10' });

    expect(text).toContain('SAVE10');
    expect(text).toMatch(/−\$10(?!\d)/);
  });

  it('shows no discount line when nothing was taken off', () => {
    expect(expandedText({ total_amount: '40' })).not.toContain('−$');
  });
});
