/**
 * Discount codes.
 *
 * Two audiences with almost no overlap. An ARTIST manages codes - creates
 * them, watches redemptions, switches them off. A CUSTOMER only ever types
 * one they were given and sees what it did to their price; there is
 * deliberately no endpoint that lists a salon's codes publicly, because a
 * code is worth something precisely because not everyone has it.
 */

/** A code as its owner sees it (Go promo.DiscountResponse). */
export interface Discount {
  readonly id: string;
  readonly code: string;
  readonly description?: string;
  readonly kind: DiscountKind;
  /** Decimal as string - an amount for 'fixed', 0-100 for 'percentage'. */
  readonly value: string;
  readonly starts_at?: string;
  readonly ends_at?: string;
  readonly max_redemptions?: number;
  /** Counts CONSUMED redemptions only, matching what max_redemptions is
   *  checked against - a released code (cancelled booking) is not counted. */
  readonly redemption_count: number;
  readonly first_time_only: boolean;
  readonly is_active: boolean;
  readonly created_at: string;
}

export type DiscountKind = 'fixed' | 'percentage';

/** POST /artists/salon/discounts. */
export interface CreateDiscountRequest {
  code: string;
  description?: string;
  kind: DiscountKind;
  value: string;
  starts_at?: string;
  ends_at?: string;
  max_redemptions?: number;
  first_time_only?: boolean;
}

/**
 * PATCH /artists/salon/discounts/:id.
 *
 * The CODE ITSELF is absent on purpose: customers have it written down, and
 * renaming it in place would silently break every poster and link carrying
 * the old one. Deactivate and create a new one instead.
 */
export interface UpdateDiscountRequest {
  description?: string;
  value?: string;
  starts_at?: string;
  ends_at?: string;
  max_redemptions?: number;
  is_active?: boolean;
}

/**
 * POST /bookings/:id/discount-preview (Go promo.PreviewResponse).
 *
 * `valid: false` is a NORMAL 200 response, not an error - a refused code is an
 * ordinary thing to tell someone at checkout. Render `reason` and let them
 * continue; do not treat it as a failed request.
 *
 * The price fields are absent when the code was refused.
 *
 * KNOWN LIMITATION, and it is inherent rather than a bug: a held GUEST booking
 * has no real customer yet, so the per-customer checks (already used,
 * first-time-only) cannot run here. They run for real at submit. A guest can
 * therefore see `valid: true` and still be refused when they confirm.
 */
export interface DiscountPreview {
  readonly code: string;
  readonly valid: boolean;
  readonly reason?: string;
  readonly subtotal?: string;
  readonly discount_total?: string;
  readonly final?: string;
  readonly deposit?: string;
  readonly balance?: string;
}
