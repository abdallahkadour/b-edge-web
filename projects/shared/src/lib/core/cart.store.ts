import { Injectable, computed, signal } from '@angular/core';

import type { Product } from '../models';

/** One line in the cart: a product plus how many of it. */
export interface CartLine {
  readonly product: Product;
  readonly quantity: number;
}

/** Hard cap per line, matching the backend's own `max=50` validation on
 *  OrderItemRequest.Quantity. Enforced here purely so the UI can't offer
 *  something the server would reject. */
const MAX_QUANTITY_PER_LINE = 50;

/**
 * Holds the shopping cart while a customer moves between the catalogue,
 * the cart, and checkout.
 *
 * Deliberately in-memory only, no localStorage. Two reasons: artifacts of
 * a stale cart (a product that has since been deactivated or repriced) are
 * a worse experience than an empty one, and every price shown here is
 * advisory anyway - the server recomputes the real total from current
 * product rows at order time, so nothing here is ever authoritative.
 */
@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly _lines = signal<CartLine[]>([]);

  /** Current cart contents. */
  readonly lines = this._lines.asReadonly();

  /** Total number of individual items, for the header badge. */
  readonly itemCount = computed(() =>
    this._lines().reduce((sum, l) => sum + l.quantity, 0),
  );

  readonly isEmpty = computed(() => this._lines().length === 0);

  /**
   * Advisory total for display only. The server computes the real total
   * from current product prices when the order is placed - if a price
   * changed between browsing and checkout, the server's number wins and
   * this one was simply out of date.
   */
  readonly estimatedTotal = computed(() =>
    this._lines()
      .reduce((sum, l) => sum + parseFloat(l.product.price) * l.quantity, 0)
      .toFixed(2),
  );

  /** Quantity of a given product currently in the cart, or 0. */
  quantityOf(productId: string): number {
    return this._lines().find((l) => l.product.id === productId)?.quantity ?? 0;
  }

  add(product: Product): void {
    this._lines.update((lines) => {
      const existing = lines.find((l) => l.product.id === product.id);
      if (!existing) {
        return [...lines, { product, quantity: 1 }];
      }
      return lines.map((l) =>
        l.product.id === product.id
          ? { ...l, quantity: Math.min(l.quantity + 1, MAX_QUANTITY_PER_LINE) }
          : l,
      );
    });
  }

  /** Decrements by one, removing the line entirely when it reaches zero. */
  decrement(productId: string): void {
    this._lines.update((lines) =>
      lines
        .map((l) => (l.product.id === productId ? { ...l, quantity: l.quantity - 1 } : l))
        .filter((l) => l.quantity > 0),
    );
  }

  remove(productId: string): void {
    this._lines.update((lines) => lines.filter((l) => l.product.id !== productId));
  }

  clear(): void {
    this._lines.set([]);
  }

  /** Maps the cart to the shape PlaceOrderRequest expects. */
  toOrderItems(): { product_id: string; quantity: number }[] {
    return this._lines().map((l) => ({ product_id: l.product.id, quantity: l.quantity }));
  }
}
