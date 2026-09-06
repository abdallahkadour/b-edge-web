import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';

import {
  BadgeComponent,
  ButtonComponent,
  DiscountDataService,
  EmptyStateComponent,
  InputDirective,
  SkeletonComponent,
  extractApiErrorMessage,
  isBrokenMoney,
  isValidMoney,
  MONEY_HINT,
} from '@bedge/shared';
import type { CreateDiscountRequest, Discount, DiscountKind } from '@bedge/shared';

interface DraftDiscount {
  code: string;
  description: string;
  kind: DiscountKind;
  value: string;
  maxRedemptions: string;
  firstTimeOnly: boolean;
  endsAt: string;
}

function emptyDraft(): DraftDiscount {
  return {
    code: '',
    description: '',
    kind: 'percentage',
    value: '',
    maxRedemptions: '',
    firstTimeOnly: false,
    endsAt: '',
  };
}

/**
 * Promo codes an artist hands out.
 *
 * WHAT THIS SCREEN DELIBERATELY DOES NOT OFFER
 *
 * Editing the code itself. Customers have it written down - on a poster, in a
 * story, in a message - and renaming it in place would silently break every
 * one of those without any signal that it had. Deactivating and creating a
 * new one is the honest operation, and the API refuses the rename anyway.
 *
 * Deleting. A code that has been redeemed is part of the record of what a
 * customer was charged; removing it would leave bookings whose discount has
 * no explanation. Deactivating stops it being usable and keeps the history.
 */
@Component({
  selector: 'bedge-discounts',
  standalone: true,
  imports: [
    LucideAngularModule,
    ButtonComponent,
    BadgeComponent,
    InputDirective,
    EmptyStateComponent,
    SkeletonComponent,
  ],
  templateUrl: './discounts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscountsComponent implements OnInit {
  private readonly api = inject(DiscountDataService);

  protected readonly discounts = signal<Discount[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly showAddForm = signal(false);
  protected readonly draft = signal<DraftDiscount>(emptyDraft());
  protected readonly creating = signal(false);
  protected readonly addError = signal<string | null>(null);

  /** Per-row error, so one failing toggle does not blank the whole screen. */
  protected readonly rowErrors = signal<Record<string, string>>({});
  protected readonly togglingId = signal<string | null>(null);

  protected readonly moneyHint = MONEY_HINT;

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.listMyDiscounts().subscribe({
      next: (list) => {
        this.discounts.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Could not load your promo codes. Please try again.');
      },
    });
  }

  // ── The form ───────────────────────────────────────────────────────────────

  /**
   * A percentage and a fixed amount are both money-shaped for validation:
   * two decimal places, no exponent, no NaN. The 0-100 ceiling for
   * percentages is enforced by the database, and the API surfaces it as a
   * 400 - repeating that rule here would be a second place to keep it right.
   */
  protected readonly valueIsBroken = computed(() => isBrokenMoney(this.draft().value));

  protected readonly canCreate = computed(() => {
    const d = this.draft();
    return (
      d.code.trim().length >= 3 &&
      isValidMoney(d.value) &&
      (d.maxRedemptions === '' || Number(d.maxRedemptions) >= 1)
    );
  });

  protected openAddForm(): void {
    this.draft.set(emptyDraft());
    this.addError.set(null);
    this.showAddForm.set(true);
  }

  protected closeAddForm(): void {
    this.showAddForm.set(false);
    this.addError.set(null);
  }

  protected patchDraft(patch: Partial<DraftDiscount>): void {
    this.draft.update((d) => ({ ...d, ...patch }));
  }

  protected create(): void {
    if (!this.canCreate() || this.creating()) return;
    const d = this.draft();

    const req: CreateDiscountRequest = {
      code: d.code.trim().toUpperCase(),
      description: d.description.trim() || undefined,
      kind: d.kind,
      value: d.value,
      max_redemptions: d.maxRedemptions ? Number(d.maxRedemptions) : undefined,
      first_time_only: d.firstTimeOnly,
      // A date input gives a local calendar day; the API wants an instant.
      // End of that day, so "ends 30 September" includes the 30th - the
      // expiry check itself is exclusive.
      ends_at: d.endsAt ? new Date(`${d.endsAt}T23:59:59`).toISOString() : undefined,
    };

    this.creating.set(true);
    this.addError.set(null);
    this.api.createDiscount(req).subscribe({
      next: (created) => {
        this.creating.set(false);
        this.showAddForm.set(false);
        this.discounts.update((list) => [created, ...list]);
      },
      error: (err: HttpErrorResponse) => {
        this.creating.set(false);
        this.addError.set(
          extractApiErrorMessage(err, 'Could not create that code. Check the values and try again.'),
        );
      },
    });
  }

  // ── Rows ───────────────────────────────────────────────────────────────────

  protected toggleActive(d: Discount): void {
    if (this.togglingId()) return;
    this.togglingId.set(d.id);
    this.rowErrors.update((e) => ({ ...e, [d.id]: '' }));

    this.api.updateDiscount(d.id, { is_active: !d.is_active }).subscribe({
      next: (updated) => {
        this.togglingId.set(null);
        this.discounts.update((list) => list.map((x) => (x.id === updated.id ? updated : x)));
      },
      error: (err: HttpErrorResponse) => {
        this.togglingId.set(null);
        this.rowErrors.update((e) => ({
          ...e,
          [d.id]: extractApiErrorMessage(err, 'Could not update that code.'),
        }));
      },
    });
  }

  protected valueLabel(d: Discount): string {
    return d.kind === 'percentage' ? `${Number(d.value)}% off` : `$${d.value} off`;
  }

  /**
   * "3 used" or "3 of 50 used". Counts CONSUMED redemptions only - a code
   * released by a cancelled booking is back in circulation and must not read
   * as spent.
   */
  protected usageLabel(d: Discount): string {
    return d.max_redemptions
      ? `${d.redemption_count} of ${d.max_redemptions} used`
      : `${d.redemption_count} used`;
  }

  protected expiryLabel(d: Discount): string | null {
    if (!d.ends_at) return null;
    const end = new Date(d.ends_at);
    const expired = end.getTime() < Date.now();
    const date = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return expired ? `Expired ${date}` : `Until ${date}`;
  }

  protected isExpired(d: Discount): boolean {
    return !!d.ends_at && new Date(d.ends_at).getTime() < Date.now();
  }
}
