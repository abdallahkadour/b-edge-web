import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import type { Invoice, Plan, Subscription, SubscriptionOverviewRow } from '../models';

/**
 * Data-access service for the billing domain.
 * Thin wrapper over ApiService - one method per endpoint.
 *
 * Covers the plan catalogue (pricing), an artist's own subscription and
 * invoices, and the admin billing actions - the full internal/billing Go
 * domain, built Aug 29, 2026. See
 * B-Edge-Monetization-Implementation-Spec-v1.md.
 */
@Injectable({ providedIn: 'root' })
export class BillingDataService {
  private readonly api = inject(ApiService);

  // ── Public ───────────────────────────────────────────────────────────────

  /** GET /billing/plans - public plan catalogue, no auth required. */
  getPublicPlans(): Observable<Plan[]> {
    return this.api.getArray<Plan>('/billing/plans');
  }

  // ── Artist: my subscription & invoices ──────────────────────────────────

  /** GET /billing/subscription - the authenticated artist's own subscription. */
  getMySubscription(): Observable<Subscription> {
    return this.api.get<Subscription>('/billing/subscription');
  }

  /** GET /billing/invoices - the authenticated artist's own invoice history. */
  getMyInvoices(): Observable<Invoice[]> {
    return this.api.getArray<Invoice>('/billing/invoices');
  }

  /**
   * POST /billing/invoices/:id/submit - submit an OMT/Whish payment
   * reference. A claim, not proof of payment - only an admin's confirm
   * action extends service. See SubmitInvoicePaymentRequest on the Go side.
   */
  submitInvoicePayment(invoiceId: string, paymentReference: string): Observable<Invoice> {
    return this.api.post<Invoice>(`/billing/invoices/${invoiceId}/submit`, {
      payment_reference: paymentReference,
    });
  }

  // ── Admin ────────────────────────────────────────────────────────────────

  /** GET /admin/plans - full plan catalogue including non-public plans. */
  getAllPlans(): Observable<Plan[]> {
    return this.api.getArray<Plan>('/admin/plans');
  }

  /** POST /admin/plans - create a new tier. */
  createPlan(plan: {
    code: string;
    name: string;
    monthly_price: string;
    currency?: string;
    seat_price?: string;
    included_seats?: number;
    description?: string;
    features?: string[];
    is_public?: boolean;
    sort_order?: number;
  }): Observable<Plan> {
    return this.api.post<Plan>('/admin/plans', plan);
  }

  /**
   * PATCH /admin/plans/:code - edit a plan. Affects new signups only, never
   * an existing subscriber's price - see spec section 6.4.
   */
  updatePlan(code: string, changes: Partial<Omit<Plan, 'code' | 'currency' | 'updated_at'>>): Observable<Plan> {
    return this.api.patch<Plan>(`/admin/plans/${code}`, changes);
  }

  /** GET /admin/billing/overview - every artist × plan × derived status × amount owed. */
  getBillingOverview(): Observable<SubscriptionOverviewRow[]> {
    return this.api.getArray<SubscriptionOverviewRow>('/admin/billing/overview');
  }

  /**
   * GET /admin/billing/invoices - all invoices, or filtered by status.
   * status='submitted' is the confirmation queue - the actual daily work.
   */
  getInvoices(status?: string): Observable<Invoice[]> {
    return this.api.getArray<Invoice>('/admin/billing/invoices', status ? { status } : undefined);
  }

  /**
   * POST /admin/billing/invoices/:id/confirm - the single most consequential
   * action in the billing domain: treats a submitted reference as real
   * money received and extends the subscription's period. Rejects with a
   * 409 if the invoice isn't currently 'submitted' (already paid, etc.).
   */
  confirmInvoice(invoiceId: string): Observable<Invoice> {
    return this.api.post<Invoice>(`/admin/billing/invoices/${invoiceId}/confirm`, {});
  }

  /** POST /admin/billing/invoices/:id/void - write off or correct an invoice. */
  voidInvoice(invoiceId: string, reason: string): Observable<void> {
    return this.api.command(`/admin/billing/invoices/${invoiceId}/void`, 'POST', { reason });
  }

  /**
   * PATCH /admin/billing/subscriptions/:id - change plan, seats, trial/
   * period dates, or cancel. Addressed by SUBSCRIPTION id, not artist id.
   */
  updateSubscription(
    subscriptionId: string,
    changes: {
      plan_code?: string;
      seats?: number;
      trial_ends_at?: string;
      current_period_end?: string;
      cancel?: boolean;
    },
  ): Observable<Subscription> {
    return this.api.patch<Subscription>(`/admin/billing/subscriptions/${subscriptionId}`, changes);
  }
}
