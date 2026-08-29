import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { A11yModule } from '@angular/cdk/a11y';

import {
  BadgeComponent,
  BillingDataService,
  ButtonComponent,
  CardComponent,
  extractApiErrorMessage,
  invoiceStatusTone,
  subscriptionStatusLabel,
  subscriptionStatusTone,
} from '@bedge/shared';
import type { Invoice, Subscription } from '@bedge/shared';

/**
 * Billing screen for the artist dashboard - the artist-facing half of
 * B-Edge's own accounts-receivable system (no payment gateway, so this is
 * how an artist sees what they owe and tells B-Edge they paid it).
 *
 * Modelled directly on deposit-queue.component's verify-modal pattern
 * (transaction-reference input, optional, submitted via a small dialog) -
 * this is the same interaction with the money direction reversed: there,
 * the ARTIST confirms a CUSTOMER's deposit; here, the ARTIST submits proof
 * to an ADMIN, who then confirms it. See
 * B-Edge-Monetization-Implementation-Spec-v1.md section 7.2.
 *
 * Two states this screen must render sanely that a paying, current
 * subscriber never hits: no subscription row at all (plan selection at
 * signup is Phase 3, not built yet - every artist onboarded so far was
 * backfilled onto a 'comped' plan by migration 024, so this is mostly a
 * future-signup concern) and a comped plan (Rania, internal test accounts -
 * no invoices ever, nothing to pay).
 */
@Component({
  selector: 'bedge-billing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, ButtonComponent, CardComponent, BadgeComponent, A11yModule],
  templateUrl: './billing.component.html',
})
export class BillingComponent implements OnInit {
  private readonly billingSvc = inject(BillingDataService);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly noSubscription = signal(false);

  readonly subscription = signal<Subscription | null>(null);
  readonly invoices = signal<Invoice[]>([]);

  /** The one invoice that currently needs the artist's attention, if any -
   *  'issued' (nothing submitted yet) or 'submitted' (awaiting admin
   *  review). By construction (see the Go service's ensureInvoicesUpTo)
   *  there is never more than one of these at a time. */
  readonly outstandingInvoice = computed(() =>
    this.invoices().find((inv) => inv.status === 'issued' || inv.status === 'submitted') ?? null,
  );

  /** Past invoices for the history list - everything except the one still
   *  outstanding, newest first (already the API's own order). */
  readonly pastInvoices = computed(() => {
    const outstanding = this.outstandingInvoice();
    return this.invoices().filter((inv) => inv.id !== outstanding?.id);
  });

  readonly isComped = computed(() => this.subscription()?.plan_code === 'comped');

  // ── Submit-payment modal ─────────────────────────────────────────────────

  readonly submitting = signal(false);
  readonly showSubmitModal = signal(false);
  readonly paymentReference = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.noSubscription.set(false);

    this.billingSvc.getMySubscription().subscribe({
      next: (sub) => {
        this.subscription.set(sub);
        this.loadInvoices();
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 404) {
          // No subscription row yet - not an error state, a real (if
          // temporary, pre-Phase-3) product state. See the class doc comment.
          this.noSubscription.set(true);
          return;
        }
        this.errorMessage.set(
          extractApiErrorMessage(err, 'Something went wrong loading your billing details.'),
        );
      },
    });
  }

  private loadInvoices(): void {
    this.billingSvc.getMyInvoices().subscribe({
      next: (invoices) => {
        this.loading.set(false);
        this.invoices.set(invoices);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          extractApiErrorMessage(err, 'Loaded your plan, but could not load invoice history.'),
        );
      },
    });
  }

  openSubmitModal(): void {
    this.paymentReference.set('');
    this.showSubmitModal.set(true);
  }

  closeSubmitModal(): void {
    if (this.submitting()) return; // don't let a stray click cancel an in-flight submit
    this.showSubmitModal.set(false);
  }

  submitPayment(): void {
    const invoice = this.outstandingInvoice();
    if (!invoice || this.submitting()) return;

    this.submitting.set(true);
    this.billingSvc.submitInvoicePayment(invoice.id, this.paymentReference().trim()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showSubmitModal.set(false);
        this.load(); // re-fetch - invoice moves issued -> submitted
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.errorMessage.set(
          extractApiErrorMessage(err, 'Could not submit your payment reference. Please try again.'),
        );
      },
    });
  }

  // ── Display helpers ──────────────────────────────────────────────────────
  // Status→tone/label mapping lives in @bedge/shared's billing-status.util
  // so this screen and the admin billing overview can never render the
  // same status in two different colours - see that file's doc comment.

  protected readonly statusTone = subscriptionStatusTone;
  protected readonly statusLabel = subscriptionStatusLabel;
  protected readonly invoiceStatusTone = invoiceStatusTone;

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
