import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  Check, ChevronDown, ChevronUp, Clock, FileText, LucideAngularModule, MapPin, MessageSquare, Package,
} from 'lucide-angular';

import { ProductDataService } from '@bedge/shared';
import type { EnrichedOrder } from '@bedge/shared';

import { OrdersComponent } from './orders.component';

function queueText(order: Partial<EnrichedOrder>): string {
  const o = {
    id: 'order-1', status: 'placed', total_amount: '30', created_at: '2026-09-27T10:00:00Z',
    customer_name: 'Maya', customer_phone: '+96170123456',
    items: [{ product_id: 'p-1', product_name: 'Serum', unit_price: '20', quantity: 2, subtotal: '40' }],
    ...order,
  } as EnrichedOrder;
  TestBed.configureTestingModule({
    imports: [LucideAngularModule.pick({ Check, ChevronDown, ChevronUp, Clock, FileText, MapPin, MessageSquare, Package })],
    providers: [{ provide: ProductDataService, useValue: { getSalonOrders: () => of([o]) } }],
  });
  const fixture = TestBed.createComponent(OrdersComponent);
  fixture.detectChanges();
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

describe('OrdersComponent - an order paid with a code', () => {
  it('shows the code and what it took off, so $40 of items and a $30 total agree', () => {
    // She confirms she received a $30 transfer. Before, the card listed $40
    // of items and $30 with nothing explaining the gap.
    const text = queueText({ discount_amount: '10', discount_code: 'SAVE10' });

    expect(text).toContain('SAVE10');
    expect(text).toMatch(/−\$10(?!\d)/);
  });

  it('shows no discount line when nothing was taken off', () => {
    expect(queueText({ total_amount: '40' })).not.toContain('−$');
  });
});
