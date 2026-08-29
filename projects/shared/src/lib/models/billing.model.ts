/** A subscription plan, as returned by GET /billing/plans and /admin/plans (Go billing.Plan). */
export interface Plan {
  readonly code: string;
  readonly name: string;
  readonly monthly_price: string; // decimal as string
  readonly currency: string;
  readonly seat_price: string; // decimal as string
  readonly included_seats: number;
  readonly description: string;
  readonly features: string[];
  readonly is_public: boolean;
  readonly sort_order: number;
  readonly updated_at: string;
}

/** Derived subscription lifecycle state (Go billing.Status) - never stored,
 *  computed from dates at read time. See DeriveStatus in the Go domain. */
export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'grace'
  | 'past_due'
  | 'suspended'
  | 'cancelled';

/** An artist's subscription, as returned by GET /billing/subscription and
 *  PATCH /admin/billing/subscriptions/:id (Go billing.Subscription /
 *  SubscriptionResponse). plan_name/status are only present on the
 *  SubscriptionResponse shape (GET /billing/subscription) - the bare
 *  Subscription returned by the admin PATCH endpoint omits them, which is
 *  why both are optional here rather than two separate interfaces. */
export interface Subscription {
  readonly id: string;
  readonly artist_id: string;
  readonly plan_code: string;
  readonly seats: number;
  readonly monthly_price: string; // decimal as string
  readonly currency: string;
  readonly trial_ends_at: string | null;
  readonly current_period_end: string | null;
  readonly cancelled_at: string | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly status?: SubscriptionStatus;
  readonly plan_name?: string;
}

/** Invoice status values (Go billing.Invoice* constants). Only
 *  issued→submitted→paid and (issued|submitted)→void are legal transitions;
 *  paid and void are both terminal. */
export type InvoiceStatus = 'issued' | 'submitted' | 'paid' | 'void';

/** One billing period for one subscription (Go billing.Invoice). */
export interface Invoice {
  readonly id: string;
  readonly subscription_id: string;
  readonly artist_id: string;
  readonly invoice_number: number;
  readonly period_start: string;
  readonly period_end: string;
  readonly due_date: string;
  readonly amount: string; // decimal as string
  readonly currency: string;
  readonly seats_billed: number;
  readonly plan_code: string;
  readonly status: InvoiceStatus;
  readonly payment_reference: string | null;
  readonly submitted_at: string | null;
  readonly confirmed_by: string | null;
  readonly paid_at: string | null;
  readonly void_reason: string | null;
  readonly created_at: string;
}

/** One row of the admin billing overview (Go billing.SubscriptionOverviewRow).
 *  seats/trial_ends_at/cancelled_at exist so the Artists tab can prefill an
 *  edit form with real current values rather than asking an admin to
 *  blindly overwrite fields the Billing tab's roster never needed to show. */
export interface SubscriptionOverviewRow {
  readonly artist_id: string;
  readonly artist_name: string;
  readonly subscription_id: string;
  readonly plan_code: string;
  readonly plan_name: string;
  readonly status: SubscriptionStatus;
  readonly seats: number;
  readonly monthly_price: string;
  readonly currency: string;
  readonly trial_ends_at: string | null;
  readonly current_period_end: string | null;
  readonly cancelled_at: string | null;
  readonly outstanding_amount: string;
}
