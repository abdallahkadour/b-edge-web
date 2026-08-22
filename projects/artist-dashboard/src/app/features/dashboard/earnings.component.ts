import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { CardComponent, EarningsDataService } from '@bedge/shared';
import type { EarningsSummary, DailyEarnings } from '@bedge/shared';

/** A bar in the 7-day chart. */
interface ChartBar {
  day: string;
  revenue: string;
  heightPct: number;
  isToday: boolean;
}

/**
 * Earnings screen for the artist dashboard.
 */
@Component({
  selector: 'bedge-earnings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent],
  templateUrl: './earnings.component.html',
})
export class EarningsComponent implements OnInit {
  private readonly earningsSvc: EarningsDataService = inject(EarningsDataService);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly summary = signal<EarningsSummary | null>(null);

  readonly monthLabel = computed((): string => {
    const s = this.summary();
    if (!s) return '';
    return new Date(s.period.from).toLocaleDateString('en-GB', {
      month: 'long', year: 'numeric',
    });
  });

  readonly chartBars = computed((): ChartBar[] => {
    const s = this.summary();
    if (!s || s.daily_breakdown.length === 0) return [];
    const days: DailyEarnings[] = s.daily_breakdown;
    const max = Math.max(...days.map((d: DailyEarnings) => parseFloat(d.revenue) || 0));
    return days.map((d: DailyEarnings): ChartBar => ({
      day: new Date(d.day).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
      revenue: d.revenue,
      heightPct: max > 0 ? Math.round((parseFloat(d.revenue) / max) * 100) : 0,
      isToday: this.isToday(d.day),
    }));
  });

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.earningsSvc.getSummary().subscribe({
      next: (data: EarningsSummary) => {
        this.summary.set(this.normalise(data));
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 0 ? 'Cannot reach the server.' : 'Failed to load earnings.',
        );
      },
    });
  }

  /**
   * Coalesce the arrays nested inside the summary object.
   *
   * `getArray` on ApiService only guards top-level list responses. This
   * endpoint returns a single object whose `by_service` and `daily_breakdown`
   * fields are Go slices, so an artist with no completed bookings gets `null`
   * on both — the exact state the "No completed bookings yet" empty state was
   * written for, and the one that used to throw before rendering it.
   *
   * The `?? []` reads as redundant against the declared types. It is not: the
   * types describe the contract, and the contract is what is being violated.
   */
  private normalise(data: EarningsSummary): EarningsSummary {
    return {
      ...data,
      by_service: data.by_service ?? [],
      daily_breakdown: data.daily_breakdown ?? [],
    };
  }

  formatMoney(value: string): string {
    const n = parseFloat(value) || 0;
    return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  private isToday(iso: string): boolean {
    const d = new Date(iso);
    const now = new Date();
    return d.getUTCFullYear() === now.getUTCFullYear() &&
      d.getUTCMonth() === now.getUTCMonth() &&
      d.getUTCDate() === now.getUTCDate();
  }
}
