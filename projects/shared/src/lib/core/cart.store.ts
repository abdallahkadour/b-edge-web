import { Injectable, computed, signal } from '@angular/core';

import type { Product } from '../models';

/** One line in the cart: a product plus how many of it. */
export interface CartLine {
  readonly product: Product;
  readonly quantity: number;
}

/** What actually persists to localStorage - never a full Product. */
interface PersistedLine {
  productId: string;
  quantity: number;
}

/** Hard cap per line, matching the backend's own `max=50` validation on
 *  OrderItemRequest.Quantity. Enforced here purely so the UI can't offer
 *  something the server would reject. */
const MAX_QUANTITY_PER_LINE = 50;

const STORAGE_KEY = 'bedge_cart';

/**
 * Holds the shopping cart while a customer moves between the catalogue,
 * the cart, and checkout - and now survives an accidental refresh or the
 * browser backgrounding the tab, which on mobile happens constantly.
 *
 * The earlier version was deliberately in-memory only, reasoning that a
 * stale cart (holding a product that has since been deactivated or
 * repriced) is worse than an empty one. That reasoning was correct but
 * incomplete - it treated "persist" and "trust what was persisted" as the
 * same decision, when they don't have to be.
 *
 * What persists to localStorage is only `{productId, quantity}` pairs,
 * never a full Product. On reload, those pairs sit in `_pending` - inert,
 * not yet shown as cart lines - until `reconcile()` is called with a
 * FRESH product list from the server. Reconcile rebuilds each line from
 * current data and silently drops anything no longer active. The
 * customer's line-item selections survive a refresh; stale prices and
 * dead products never do.
 */
@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly _lines = signal<CartLine[]>([]);

  /** Persisted IDs not yet matched against a fresh product list. Once
   *  reconcile() runs for the first time, this is empty for the rest of
   *  the session. */
  private _pending: PersistedLine[] = [];

  constructor() {
    this._pending = this.readPersisted();
  }

  /** Current cart contents. Lines restored from a previous session are
   *  NOT included here until reconcile() has run. */
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

  /** Quantity of a given product currently in the cart, or 0. Checks
   *  pending (not-yet-reconciled) lines too, so a product tile can show
   *  the right stepper state even before reconcile() has run. */
  quantityOf(productId: string): number {
    const active = this._lines().find((l) => l.product.id === productId);
    if (active) return active.quantity;
    return this._pending.find((p) => p.productId === productId)?.quantity ?? 0;
  }

  /**
   * The real enforcement is always server-side (PlaceOrder's atomic
   * decrement) - a stock count can change between browsing and checkout no
   * matter what the client caps at. This only stops the UI from offering a
   * quantity the server would reject outright.
   */
  add(product: Product): void {
    const ceiling = Math.min(MAX_QUANTITY_PER_LINE, product.stock_quantity ?? Infinity);

    this._lines.update((lines) => {
      const existing = lines.find((l) => l.product.id === product.id);
      if (!existing) {
        return ceiling < 1 ? lines : [...lines, { product, quantity: 1 }];
      }
      return lines.map((l) =>
        l.product.id === product.id ? { ...l, quantity: Math.min(l.quantity + 1, ceiling) } : l,
      );
    });
    this.persist();
  }

  /** Decrements by one, removing the line entirely when it reaches zero. */
  decrement(productId: string): void {
    this._lines.update((lines) =>
      lines
        .map((l) => (l.product.id === productId ? { ...l, quantity: l.quantity - 1 } : l))
        .filter((l) => l.quantity > 0),
    );
    this.persist();
  }

  remove(productId: string): void {
    this._lines.update((lines) => lines.filter((l) => l.product.id !== productId));
    this.persist();
  }

  clear(): void {
    this._lines.set([]);
    this._pending = [];
    this.persist();
  }

  /**
   * Rebuilds cart lines from a freshly-fetched product list - the ONLY
   * path by which a persisted, previous-session cart becomes visible
   * again. Call this once the current screen has its own product data
   * (the shop catalogue and the cart page both already fetch it).
   *
   * Every field on the resulting line comes from `products`, not from
   * whatever was in localStorage - price and availability are always
   * today's, never a stale snapshot. A persisted line whose product is
   * missing (deactivated, or belongs to a different salon's catalogue
   * entirely) is dropped without comment; there is nothing useful to tell
   * the customer about a product that no longer exists for them.
   */
  reconcile(products: readonly Product[]): void {
    if (this._pending.length === 0) return;

    const byId = new Map(products.map((p) => [p.id, p]));
    const restored: CartLine[] = [];

    for (const line of this._pending) {
      const product = byId.get(line.productId);
      if (!product || !product.is_active) continue;
      const ceiling = Math.min(MAX_QUANTITY_PER_LINE, product.stock_quantity ?? Infinity);
      if (ceiling < 1) continue; // sold out since this line was persisted
      restored.push({ product, quantity: Math.min(line.quantity, ceiling) });
    }

    this._pending = [];
    if (restored.length > 0) {
      this._lines.set(restored);
    }
  }

  /** Maps the cart to the shape PlaceOrderRequest expects. */
  toOrderItems(): { product_id: string; quantity: number }[] {
    return this._lines().map((l) => ({ product_id: l.product.id, quantity: l.quantity }));
  }

  private persist(): void {
    const payload: PersistedLine[] = this._lines().map((l) => ({
      productId: l.product.id,
      quantity: l.quantity,
    }));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Private browsing, storage quota, or storage disabled entirely -
      // the cart still works for the current session, it just won't
      // survive a reload. Not worth surfacing to the customer.
    }
  }

  private readPersisted(): PersistedLine[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (p): p is PersistedLine =>
          typeof p?.productId === 'string' && typeof p?.quantity === 'number' && p.quantity > 0,
      );
    } catch {
      // Corrupt JSON from a previous version of this schema, or storage
      // access denied - either way, starting empty is the safe default.
      return [];
    }
  }
}
