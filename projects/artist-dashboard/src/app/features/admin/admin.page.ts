import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import {
  AdminDataService,
  AuthStore,
  BadgeComponent,
  BillingDataService,
  ButtonComponent,
  InputDirective,
  extractApiErrorMessage,
  invoiceStatusTone,
  subscriptionStatusLabel,
  subscriptionStatusTone,
} from '@bedge/shared';
import type { Invoice, PendingArtist, Plan, SubscriptionOverviewRow } from '@bedge/shared';

type AdminTab = 'approvals' | 'billing' | 'plans' | 'artists';

/**
 * Admin console - the only screens an admin account sees.
 *
 * Deliberately tabs on one flat page, not a dashboard shell with a
 * sidebar. At most two admin accounts will ever exist (see cmd/seedadmin),
 * and monetization landing (Aug 29, 2026) turned their one job (does this
 * application go live) into several (that, plus does this payment go
 * through, plus what does this tier cost) - tabs keep them all without
 * inheriting the 13-item sidebar built for artists running their own
 * business, which would be wrong chrome for either. See
 * B-Edge-Monetization-Implementation-Spec-v1.md section 7.2 for the full
 * tab rationale - Billing (the confirmation queue, the actual daily work)
 * came before Plans on purpose.
 */
@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [LucideAngularModule, ButtonComponent, InputDirective, BadgeComponent],
  templateUrl: './admin.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPage implements OnInit {
  private readonly adminSvc = inject(AdminDataService);
  private readonly billingSvc = inject(BillingDataService);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  readonly activeTab = signal<AdminTab>('approvals');

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly pending = signal<PendingArtist[]>([]);

  /** Per-artist in-flight flag, so approving one card doesn't disable the
   *  whole list. */
  readonly busyId = signal<string | null>(null);

  // Reject confirmation, inline on the card - matching the pattern used
  // for order and portfolio-photo cancellation elsewhere in this app,
  // rather than a native confirm() dialog.
  readonly confirmingRejectId = signal<string | null>(null);
  readonly rejectReason = signal('');

  // ── Billing tab ──────────────────────────────────────────────────────────

  readonly billingLoading = signal(true);
  readonly billingError = signal<string | null>(null);
  readonly confirmationQueue = signal<Invoice[]>([]);
  readonly overview = signal<SubscriptionOverviewRow[]>([]);

  /** Per-invoice in-flight flag for confirm/void, so acting on one row
   *  doesn't disable the whole queue. */
  readonly billingBusyId = signal<string | null>(null);

  readonly confirmingVoidId = signal<string | null>(null);
  readonly voidReason = signal('');

  protected readonly statusTone = subscriptionStatusTone;
  protected readonly statusLabel = subscriptionStatusLabel;
  protected readonly invoiceStatusTone = invoiceStatusTone;

  // ── Plans tab ────────────────────────────────────────────────────────────

  readonly plansLoading = signal(true);
  readonly plansError = signal<string | null>(null);
  readonly plans = signal<Plan[]>([]);

  /** Which plan's save is in flight, keyed by code - '' means the create
   *  form, matching the pattern of billingBusyId/busyId elsewhere on this
   *  page (a signal per section so one save doesn't disable the others). */
  readonly plansBusyCode = signal<string | null>(null);

  readonly editingPlanCode = signal<string | null>(null);
  readonly creatingPlan = signal(false);

  // Shared by both the create form and whichever plan is being edited -
  // only one of the two is ever open at once (see startEditPlan/
  // startCreatePlan), so one set of fields is enough.
  readonly planCode = signal('');
  readonly planName = signal('');
  readonly planMonthlyPrice = signal('');
  readonly planSeatPrice = signal('');
  readonly planIncludedSeats = signal('1');
  readonly planDescription = signal('');
  /** One feature per line - joined/split on '\n', matching the reject/void
   *  reason textareas elsewhere on this page rather than a chip-input
   *  widget this codebase has no precedent for. */
  readonly planFeaturesText = signal('');
  readonly planIsPublic = signal(true);
  readonly planSortOrder = signal('0');

  // ── Artists tab ──────────────────────────────────────────────────────────
  //
  // Reuses the same `overview` signal the Billing tab already loads (every
  // artist × plan × derived status) rather than a second GET - it is
  // already the full roster this tab searches and edits, just presented
  // with different actions.

  readonly artistSearch = signal('');

  readonly filteredArtists = computed(() => {
    const q = this.artistSearch().trim().toLowerCase();
    if (!q) return this.overview();
    return this.overview().filter((row) => row.artist_name.toLowerCase().includes(q));
  });

  /** Per-subscription in-flight flag, so acting on one artist doesn't
   *  disable the whole list. */
  readonly artistBusyId = signal<string | null>(null);
  readonly artistsError = signal<string | null>(null);

  readonly editingSubscriptionId = signal<string | null>(null);
  readonly artistPlanCode = signal('');
  readonly artistSeats = signal('1');
  /** Date-input values (yyyy-mm-dd) or '' for "leave unchanged" - unlike the
   *  Plans form, these fields are genuinely optional per PATCH's tri-state
   *  design (UpdateSubscriptionRequest), so blank must mean "don't touch
   *  this field", never "clear it". */
  readonly artistTrialEndsAt = signal('');
  readonly artistPeriodEndsAt = signal('');

  readonly confirmingCancelSubId = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
    this.loadBilling();
    this.loadPlans();
  }

  selectTab(tab: AdminTab): void {
    this.activeTab.set(tab);
  }

  /** Shared by both tabs - the billing tab's dates (invoice due_date,
   *  subscription current_period_end) are nullable, unlike an approval's
   *  submitted_at, so this accepts null rather than each tab needing its
   *  own formatter. */
  formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Beirut',
      day: 'numeric', month: 'short', year: 'numeric',
    }).format(new Date(iso));
  }

  approve(artist: PendingArtist): void {
    if (this.busyId()) return;
    this.busyId.set(artist.artist_id);
    this.errorMessage.set(null);

    this.adminSvc.approveArtist(artist.artist_id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.busyId.set(null);
        this.errorMessage.set(extractApiErrorMessage(err, 'Could not approve this artist.'));
      },
    });
  }

  askToReject(artistId: string): void {
    this.rejectReason.set('');
    this.confirmingRejectId.set(artistId);
  }

  cancelReject(): void {
    this.confirmingRejectId.set(null);
  }

  confirmReject(artist: PendingArtist): void {
    if (this.busyId()) return;
    this.busyId.set(artist.artist_id);
    this.errorMessage.set(null);

    const reason = this.rejectReason().trim();
    this.adminSvc.rejectArtist(artist.artist_id, reason ? { reason } : {}).subscribe({
      next: () => {
        this.busyId.set(null);
        this.confirmingRejectId.set(null);
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.busyId.set(null);
        this.errorMessage.set(extractApiErrorMessage(err, 'Could not reject this artist.'));
      },
    });
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login'),
    });
  }

  // ── Billing tab ──────────────────────────────────────────────────────────

  /**
   * Confirm an invoice as paid - the single most consequential action in
   * this tab, per B-Edge-Monetization-Implementation-Spec-v1.md section 5:
   * it takes an artist's submitted OMT/Whish reference as real money
   * received and extends their subscription's period accordingly. The
   * backend rejects (409) re-confirming an already-paid invoice rather
   * than silently no-op'ing, so a double-click here surfaces as a visible
   * error, not a second period extension.
   */
  confirmInvoice(invoice: Invoice): void {
    if (this.billingBusyId()) return;
    this.billingBusyId.set(invoice.id);
    this.billingError.set(null);

    this.billingSvc.confirmInvoice(invoice.id).subscribe({
      next: () => {
        this.billingBusyId.set(null);
        this.loadBilling();
      },
      error: (err: HttpErrorResponse) => {
        this.billingBusyId.set(null);
        this.billingError.set(extractApiErrorMessage(err, 'Could not confirm this invoice.'));
      },
    });
  }

  askToVoid(invoiceId: string): void {
    this.voidReason.set('');
    this.confirmingVoidId.set(invoiceId);
  }

  cancelVoid(): void {
    this.confirmingVoidId.set(null);
  }

  /** Voiding is a correction to a financial record, not a routine action -
   *  the reason is required (unlike an artist rejection's optional one),
   *  matching VoidInvoiceRequest's validation on the Go side. */
  confirmVoid(invoice: Invoice): void {
    if (this.billingBusyId()) return;
    const reason = this.voidReason().trim();
    if (!reason) return;

    this.billingBusyId.set(invoice.id);
    this.billingError.set(null);

    this.billingSvc.voidInvoice(invoice.id, reason).subscribe({
      next: () => {
        this.billingBusyId.set(null);
        this.confirmingVoidId.set(null);
        this.loadBilling();
      },
      error: (err: HttpErrorResponse) => {
        this.billingBusyId.set(null);
        this.billingError.set(extractApiErrorMessage(err, 'Could not void this invoice.'));
      },
    });
  }

  // ── Plans tab ────────────────────────────────────────────────────────────

  startCreatePlan(): void {
    this.editingPlanCode.set(null);
    this.creatingPlan.set(true);
    this.planCode.set('');
    this.planName.set('');
    this.planMonthlyPrice.set('');
    this.planSeatPrice.set('0');
    this.planIncludedSeats.set('1');
    this.planDescription.set('');
    this.planFeaturesText.set('');
    this.planIsPublic.set(true);
    this.planSortOrder.set(String(this.plans().length));
  }

  startEditPlan(plan: Plan): void {
    this.creatingPlan.set(false);
    this.editingPlanCode.set(plan.code);
    this.planName.set(plan.name);
    this.planMonthlyPrice.set(plan.monthly_price);
    this.planSeatPrice.set(plan.seat_price);
    this.planIncludedSeats.set(String(plan.included_seats));
    this.planDescription.set(plan.description);
    this.planFeaturesText.set(plan.features.join('\n'));
    this.planIsPublic.set(plan.is_public);
    this.planSortOrder.set(String(plan.sort_order));
  }

  cancelPlanForm(): void {
    this.creatingPlan.set(false);
    this.editingPlanCode.set(null);
  }

  /**
   * Create a new tier. Unlike editing, code is set here and immutable
   * afterward - PATCH /admin/plans/:code has no way to rename a code, by
   * design (it would orphan any subscription/invoice already snapshotting
   * the old one - see Plan's doc comment on why those never join to plans).
   */
  saveNewPlan(): void {
    if (this.plansBusyCode() !== null) return;

    const code = this.planCode().trim();
    const name = this.planName().trim();
    const monthlyPrice = this.planMonthlyPrice().trim();
    if (!code || !name || !monthlyPrice) return;

    this.plansBusyCode.set('');
    this.plansError.set(null);

    this.billingSvc
      .createPlan({
        code,
        name,
        monthly_price: monthlyPrice,
        seat_price: this.planSeatPrice().trim() || undefined,
        included_seats: Number(this.planIncludedSeats()) || undefined,
        description: this.planDescription().trim() || undefined,
        features: this.parsePlanFeatures(),
        is_public: this.planIsPublic(),
        sort_order: Number(this.planSortOrder()) || 0,
      })
      .subscribe({
        next: () => {
          this.plansBusyCode.set(null);
          this.creatingPlan.set(false);
          this.loadPlans();
        },
        error: (err: HttpErrorResponse) => {
          this.plansBusyCode.set(null);
          this.plansError.set(extractApiErrorMessage(err, 'Could not create this plan.'));
        },
      });
  }

  /**
   * Save changes to an existing tier. Per spec section 6.4: this only ever
   * changes what NEW signups see and pay - existing subscribers keep
   * MonthlyPrice/Currency as snapshotted on their own subscription row at
   * signup time, completely unaffected by this call.
   */
  saveEditedPlan(plan: Plan): void {
    if (this.plansBusyCode() !== null) return;

    const name = this.planName().trim();
    const monthlyPrice = this.planMonthlyPrice().trim();
    if (!name || !monthlyPrice) return;

    this.plansBusyCode.set(plan.code);
    this.plansError.set(null);

    this.billingSvc
      .updatePlan(plan.code, {
        name,
        monthly_price: monthlyPrice,
        seat_price: this.planSeatPrice().trim(),
        included_seats: Number(this.planIncludedSeats()) || undefined,
        description: this.planDescription().trim(),
        features: this.parsePlanFeatures(),
        is_public: this.planIsPublic(),
        sort_order: Number(this.planSortOrder()) || 0,
      })
      .subscribe({
        next: () => {
          this.plansBusyCode.set(null);
          this.editingPlanCode.set(null);
          this.loadPlans();
        },
        error: (err: HttpErrorResponse) => {
          this.plansBusyCode.set(null);
          this.plansError.set(extractApiErrorMessage(err, 'Could not save changes to this plan.'));
        },
      });
  }

  private parsePlanFeatures(): string[] {
    return this.planFeaturesText()
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);
  }

  private loadPlans(): void {
    this.plansLoading.set(true);
    this.plansError.set(null);

    this.billingSvc.getAllPlans().subscribe({
      next: (plans) => {
        this.plansLoading.set(false);
        this.plans.set([...plans].sort((a, b) => a.sort_order - b.sort_order));
      },
      error: (err: HttpErrorResponse) => {
        this.plansLoading.set(false);
        this.plansError.set(err.status === 0 ? 'Cannot reach the server.' : 'Failed to load plans.');
      },
    });
  }

  // ── Artists tab ──────────────────────────────────────────────────────────

  startEditArtist(row: SubscriptionOverviewRow): void {
    this.confirmingCancelSubId.set(null);
    this.editingSubscriptionId.set(row.subscription_id);
    this.artistPlanCode.set(row.plan_code);
    this.artistSeats.set(String(row.seats));
    this.artistTrialEndsAt.set(this.toDateInputValue(row.trial_ends_at));
    this.artistPeriodEndsAt.set(this.toDateInputValue(row.current_period_end));
  }

  cancelArtistEdit(): void {
    this.editingSubscriptionId.set(null);
  }

  /**
   * Save plan/seats/trial/period changes. Deliberately never touches
   * cancellation - that is askToCancelSub/reinstateSub's job below, kept as
   * separate one-click actions rather than a field in this form, since
   * "change the plan" and "cancel the subscription" are different enough in
   * consequence that folding them into one Save button risks an admin
   * cancelling an artist by accident while only meaning to bump their seats.
   */
  saveArtistEdit(row: SubscriptionOverviewRow): void {
    if (this.artistBusyId()) return;

    const seats = Number(this.artistSeats());
    if (!this.artistPlanCode() || !seats || seats < 1) return;

    this.artistBusyId.set(row.subscription_id);
    this.artistsError.set(null);

    this.billingSvc
      .updateSubscription(row.subscription_id, {
        plan_code: this.artistPlanCode(),
        seats,
        trial_ends_at: this.fromDateInputValue(this.artistTrialEndsAt()),
        current_period_end: this.fromDateInputValue(this.artistPeriodEndsAt()),
      })
      .subscribe({
        next: () => {
          this.artistBusyId.set(null);
          this.editingSubscriptionId.set(null);
          this.loadOverview();
        },
        error: (err: HttpErrorResponse) => {
          this.artistBusyId.set(null);
          this.artistsError.set(extractApiErrorMessage(err, 'Could not save changes for this artist.'));
        },
      });
  }

  askToCancelSub(subscriptionId: string): void {
    this.editingSubscriptionId.set(null);
    this.confirmingCancelSubId.set(subscriptionId);
  }

  cancelCancelConfirm(): void {
    this.confirmingCancelSubId.set(null);
  }

  /** Cancels a subscription - read-only per DeriveStatus's CancelledAt
   *  check, which short-circuits ahead of every other state including
   *  comped. Reversible any time via reinstateSub below. */
  confirmCancelSub(row: SubscriptionOverviewRow): void {
    if (this.artistBusyId()) return;
    this.artistBusyId.set(row.subscription_id);
    this.artistsError.set(null);

    this.billingSvc.updateSubscription(row.subscription_id, { cancel: true }).subscribe({
      next: () => {
        this.artistBusyId.set(null);
        this.confirmingCancelSubId.set(null);
        this.loadOverview();
      },
      error: (err: HttpErrorResponse) => {
        this.artistBusyId.set(null);
        this.artistsError.set(extractApiErrorMessage(err, 'Could not cancel this subscription.'));
      },
    });
  }

  /** Reinstates a cancelled subscription. Its own action rather than a
   *  Save-form field for the same reason as confirmCancelSub - restoring
   *  access is corrective and one-directional in effect, like Approve
   *  elsewhere on this page, so it does not need a confirmation step. */
  reinstateSub(row: SubscriptionOverviewRow): void {
    if (this.artistBusyId()) return;
    this.artistBusyId.set(row.subscription_id);
    this.artistsError.set(null);

    this.billingSvc.updateSubscription(row.subscription_id, { cancel: false }).subscribe({
      next: () => {
        this.artistBusyId.set(null);
        this.loadOverview();
      },
      error: (err: HttpErrorResponse) => {
        this.artistBusyId.set(null);
        this.artistsError.set(extractApiErrorMessage(err, 'Could not reinstate this subscription.'));
      },
    });
  }

  /** ISO timestamp -> yyyy-mm-dd for a native date input, or '' for null -
   *  the Beirut-timezone display formatting formatDate() does is wrong here
   *  since a date input needs the plain machine-readable value, not copy. */
  private toDateInputValue(iso: string | null): string {
    if (!iso) return '';
    return iso.slice(0, 10);
  }

  /** yyyy-mm-dd from a date input -> RFC3339, or undefined for '' -
   *  undefined (field omitted from the request body) is load bearing here,
   *  not equivalent to sending an empty string: see
   *  UpdateSubscriptionRequest's tri-state doc comment on the Go side,
   *  where a present-but-unparseable value is a 400, but an absent field is
   *  "leave this alone".
   *
   *  Noon UTC, not midnight or end-of-day - same fix as calendar.component
   *  and waitlist.component's identical `dateStr + 'T12:00:00Z'` pattern.
   *  formatDate() (this file) displays in Asia/Beirut (UTC+2/+3); anchoring
   *  at midnight or 23:59:59 UTC crosses into an adjacent Beirut calendar
   *  day, so an admin picking Dec 31 would see it echoed back as Jan 1.
   *  Noon UTC has enough clearance on both sides that it always redisplays
   *  as the same date the admin picked. */
  private fromDateInputValue(dateStr: string): string | undefined {
    if (!dateStr) return undefined;
    return `${dateStr}T12:00:00Z`;
  }

  private loadBilling(): void {
    this.billingLoading.set(true);
    this.billingError.set(null);

    this.billingSvc.getInvoices('submitted').subscribe({
      next: (invoices) => {
        this.confirmationQueue.set(invoices);
        this.loadOverview();
      },
      error: (err: HttpErrorResponse) => {
        this.billingLoading.set(false);
        this.billingError.set(
          err.status === 0 ? 'Cannot reach the server.' : 'Failed to load the confirmation queue.',
        );
      },
    });
  }

  private loadOverview(): void {
    this.billingSvc.getBillingOverview().subscribe({
      next: (rows) => {
        this.billingLoading.set(false);
        // Artists actually owing money surface first - an empty
        // outstanding_amount buried among 40 comped/current rows would
        // defeat the point of a queue.
        this.overview.set(
          [...rows].sort((a, b) => parseFloat(b.outstanding_amount) - parseFloat(a.outstanding_amount)),
        );
      },
      error: (err: HttpErrorResponse) => {
        this.billingLoading.set(false);
        this.billingError.set(
          err.status === 0 ? 'Cannot reach the server.' : 'Failed to load the billing overview.',
        );
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.adminSvc.getPendingArtists().subscribe({
      next: (items) => {
        this.pending.set(items ?? []);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 0 ? 'Cannot reach the server.' : 'Failed to load pending artists.',
        );
      },
    });
  }
}
