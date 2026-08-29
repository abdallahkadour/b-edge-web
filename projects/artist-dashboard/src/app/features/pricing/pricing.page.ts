import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import {
  BadgeComponent,
  BillingDataService,
  ButtonComponent,
  CardComponent,
  extractApiErrorMessage,
} from '@bedge/shared';
import type { Plan } from '@bedge/shared';

/**
 * Public pricing page - no auth guard, reachable by anyone.
 *
 * Lives here in artist-dashboard rather than a dedicated marketing app: the
 * codebase has exactly three Angular projects (artist-dashboard,
 * customer-pwa, shared) and none of them is a marketing site. Putting
 * pricing next to /register - where signup already lives - needs no new
 * build target or deploy config. Revisit a standalone marketing app once
 * SEO or a real content site starts mattering; not needed to go online.
 * See B-Edge-Monetization-Implementation-Spec-v1.md section 7.1.
 *
 * Renders entirely from GET /billing/plans rather than hardcoding tiers -
 * prices are editable from the (future) admin Plans tab without a
 * frontend deploy, so this page must never duplicate them.
 */
@Component({
  selector: 'bedge-pricing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent, CardComponent, BadgeComponent],
  templateUrl: './pricing.page.html',
})
export class PricingPage implements OnInit {
  private readonly billingSvc = inject(BillingDataService);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly plans = signal<Plan[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.billingSvc.getPublicPlans().subscribe({
      next: (plans) => {
        this.loading.set(false);
        this.plans.set(plans);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          extractApiErrorMessage(
            err,
            err.status === 0
              ? 'Cannot reach the server. Check your connection and try again.'
              : 'Something went wrong loading pricing. Please try again.',
          ),
        );
      },
    });
  }

  /**
   * Growth is the recommended tier for the typical solo bridal/event
   * artist B-Edge is launching with - not the cheapest, not the most
   * expensive. Matched by code rather than array position so re-ordering
   * plans server-side can never silently move the "Recommended" badge onto
   * the wrong card.
   */
  isRecommended(plan: Plan): boolean {
    return plan.code === 'growth';
  }

  hasSeatPrice(plan: Plan): boolean {
    return parseFloat(plan.seat_price) > 0;
  }
}
