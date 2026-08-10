/**
 * Product Store models (PRD §13). Mirror the Go product.* structs.
 *
 * Two things here are load-bearing and easy to get wrong:
 *
 * 1. Category values are LOWERCASE. The database enforces
 *    `CHECK (category IN ('makeup','hair','nails','lashes','skincare'))`,
 *    so sending "Makeup" is rejected by Postgres. Capitalise for display
 *    only - never in the model.
 *
 * 2. Money arrives as a STRING, not a number. The backend uses
 *    decimal.Decimal, which serialises as `"12.50"`. Parse for display if
 *    needed, but never do arithmetic on it client-side - the server
 *    computes every total authoritatively.
 */

/** The five product categories, exactly as the DB CHECK constraint spells them. */
export const PRODUCT_CATEGORIES = ['makeup', 'hair', 'nails', 'lashes', 'skincare'] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/** The six order statuses, exactly as the DB CHECK constraint spells them. */
export const ORDER_STATUSES = [
  'placed',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** A product in a salon's catalogue. */
export interface Product {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly category?: ProductCategory;
  readonly price: string;
  readonly image_url?: string;
  readonly is_active: boolean;
}

/** POST /artists/products */
export interface CreateProductRequest {
  name: string;
  description?: string;
  category?: ProductCategory;
  price: string;
  image_url?: string;
}

/**
 * PATCH /artists/products/:id - partial update. Only the fields present are
 * changed (COALESCE at the repository layer), so omitting a field leaves it
 * alone rather than nulling it.
 */
export interface UpdateProductRequest {
  name?: string;
  description?: string;
  category?: ProductCategory;
  price?: string;
  image_url?: string;
  is_active?: boolean;
}

/** One line on an order. Names and prices are SNAPSHOTS taken at order time
 *  deliberately not a live join, so a later catalogue edit can never rewrite
 *  what someone already paid. `subtotal` is computed server-side; never
 *  recalculate it. */
export interface OrderItem {
  readonly product_id: string;
  readonly product_name: string;
  readonly unit_price: string;
  readonly quantity: number;
  readonly subtotal: string;
}

/** Customer-facing order shape. Note: no customer name - see EnrichedOrder. */
export interface Order {
  readonly id: string;
  readonly status: OrderStatus;
  readonly total_amount: string;
  readonly payment_reference?: string;
  readonly delivery_notes?: string;
  readonly cancellation_reason?: string;
  readonly items: OrderItem[];
  readonly confirmed_at?: string;
  readonly shipped_at?: string;
  readonly delivered_at?: string;
  readonly cancelled_at?: string;
  readonly created_at: string;
}

/**
 * Artist-facing order shape - adds the customer's name and phone, which an
 * artist needs to actually fulfil an order. A genuinely different shape from
 * Order, not Order-with-optional-fields: the customer-facing endpoint never
 * returns these.
 */
export interface EnrichedOrder extends Order {
  readonly customer_name: string;
  readonly customer_phone?: string;
}

/** POST /orders - public, guest-friendly. */
export interface PlaceOrderRequest {
  salon_id: string;
  name: string;
  phone: string;
  delivery_notes?: string;
  items: { product_id: string; quantity: number }[];
}

/** PATCH /artists/orders/:id/confirm-payment */
export interface ConfirmOrderPaymentRequest {
  reference?: string;
}

/** PATCH /orders/:id/cancel */
export interface CancelOrderRequest {
  reason?: string;
}
