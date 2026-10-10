import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import { EarningsDataService, SkeletonComponent, extractApiErrorMessage } from '@bedge/shared';
import type { SalonOverview, SalonTotals } from '@bedge/shared';

/** Every store today is in Lebanon; the API's reporting calendar is the same. */
const SALON_TZ = 'Asia/Beirut';

export type Preset = 'today' | 'week' | 'month' | 'last-month';

const PRESETS: { id: Preset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'last-month', label: 'Last month' },
];

/** YYYY-MM-DD of a calendar date. Date.UTC is used as plain date arithmetic. */
function ymd(y: number, m: number, d: number): string {
  return new Date(Date.UTC(y, m, d)).toISOString().slice(0, 10);
}

/**
 * The from/to (inclusive) the API is asked for, on the salon's calendar.
 * "Today" at 00:30 in Beirut is already tomorrow in Beirut while UTC still
 * says yesterday; asking by the browser's or UTC's date would be off by a day.
 */
export function periodRange(preset: Preset, now: Date = new Date()): { from: string; to: string } {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: SALON_TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(now).split('-').map(Number);
  const [y, m, d] = [parts[0], parts[1] - 1, parts[2]];
  switch (preset) {
    case 'today':
      return { from: ymd(y, m, d), to: ymd(y, m, d) };
    case 'week': {
      const back = (new Date(Date.UTC(y, m, d)).getUTCDay() + 6) % 7; // Monday = 0
      return { from: ymd(y, m, d - back), to: ymd(y, m, d - back + 6) };
    }
    case 'month':
      return { from: ymd(y, m, 1), to: ymd(y, m + 1, 0) };
    case 'last-month':
      return { from: ymd(y, m - 1, 1), to: ymd(y, m, 0) };
  }
}

/** The rise or fall against the previous period, or null when the previous
 *  period had nothing - "up from nothing" is not a percentage. */
export function change(current: string, previous: string): { up: boolean; pct: number } | null {
  const c = parseFloat(current) || 0;
  const p = parseFloat(previous) || 0;
  if (p === 0) return null;
  return { up: c >= p, pct: Math.round((Math.abs(c - p) / p) * 100) };
}

/** No-shows as a share of the appointments that were due (completed + no-show). */
export function noShowRate(t: SalonTotals): number | null {
  const due = t.completed + t.no_shows;
  return due === 0 ? null : Math.round((t.no_shows / due) * 100);
}

/**
 * Salon: the owner's one screen for the whole salon (2026-10-10).
 *
 * Owner only - the route has salonOwnerGuard and the API refuses a member
 * with 403 SALON_ROLE_FORBIDDEN (capability earnings:salon:read). A member
 * keeps Earnings, which is her own work and nobody else's.
 *
 * The money words are deliberate. B-Edge never holds a payment: what it
 * knows is what was booked and marked done. So the headline is "Earned" with
 * the rule spelled out underneath - the same rule as each artist's Earnings
 * page, so the salon figure is the sum of theirs - and never "revenue
 * received".
 */
@Component({
  selector: 'bedge-salon-overview',
  standalone: true,
  imports: [RouterLink, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="mb-5">
        <h1 class="text-xl font-semibold text-ink">Salon</h1>
        <p class="text-sm text-gray-500 mt-0.5">Everyone's appointments and money, in one place.</p>
      </div>

      <div class="flex gap-1.5 overflow-x-auto pb-2 mb-4" role="tablist" aria-label="Period">
        @for (p of presets; track p.id) {
          <button type="button" role="tab" [attr.aria-selected]="preset() === p.id" (click)="select(p.id)"
            class="shrink-0 h-8 px-3 rounded-full text-xs font-semibold border transition-colors"
            [class]="preset() === p.id ? 'bg-ink border-ink text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'">{{ p.label }}</button>
        }
      </div>

      @if (error(); as e) {
        <div role="alert" class="mb-4 rounded-lg bg-danger-light border border-danger/30 px-4 py-3 text-sm text-danger-dark">{{ e }}</div>
      }

      @if (loading() && !data()) {
        <div class="space-y-3">
          <bedge-skeleton height="4rem" />
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <bedge-skeleton height="6rem" /><bedge-skeleton height="6rem" /><bedge-skeleton height="6rem" /><bedge-skeleton height="6rem" />
          </div>
          <bedge-skeleton height="12rem" />
        </div>
      }

      @if (data(); as d) {
        <section data-waiting aria-label="Waiting now" class="grid grid-cols-3 gap-2 mb-5">
          <a routerLink="/dashboard/bookings" [queryParams]="{ status: 'pending', team: 'all' }"
            class="rounded-xl border p-3 bg-white" [class]="d.waiting.awaiting_approval > 0 ? 'border-warning/50' : 'border-gray-200'">
            <span class="block text-lg font-bold text-ink tabular-nums">{{ d.waiting.awaiting_approval }}</span>
            <span class="block text-xs text-gray-500">{{ d.waiting.awaiting_approval === 1 ? 'request' : 'requests' }} to approve</span>
          </a>
          <a routerLink="/dashboard/deposits"
            class="rounded-xl border p-3 bg-white" [class]="d.waiting.deposits_to_check > 0 ? 'border-warning/50' : 'border-gray-200'">
            <span class="block text-lg font-bold text-ink tabular-nums">{{ d.waiting.deposits_to_check }}</span>
            <span class="block text-xs text-gray-500">{{ d.waiting.deposits_to_check === 1 ? 'deposit' : 'deposits' }} to check</span>
          </a>
          <a routerLink="/dashboard/bookings" [queryParams]="{ status: 'refund_due', team: 'all' }"
            class="rounded-xl border p-3" [class]="d.waiting.refunds_owed > 0 ? 'border-danger/40 bg-danger-light' : 'border-gray-200 bg-white'">
            <span class="block text-lg font-bold text-ink tabular-nums">\${{ money(d.waiting.refunds_owed_amount) }}</span>
            <span class="block text-xs text-gray-500">{{ d.waiting.refunds_owed }} {{ d.waiting.refunds_owed === 1 ? 'refund' : 'refunds' }} owed</span>
          </a>
        </section>

        <section aria-label="Figures for the period" class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2" [class.opacity-60]="loading()">
          <div class="col-span-2 sm:col-span-1 rounded-xl bg-ink text-white p-4">
            <p class="text-2xs uppercase tracking-wide text-white/60">Earned</p>
            <p class="text-2xl font-bold tabular-nums">\${{ money(d.totals.earned) }}</p>
            <p class="text-xs text-white/70">{{ d.totals.earned_bookings }} {{ d.totals.earned_bookings === 1 ? 'appointment' : 'appointments' }}</p>
            @if (earnedChange(); as c) {
              <p class="text-xs mt-1 text-white/80">{{ c.up ? '▲' : '▼' }} {{ c.pct }}% vs {{ previousLabel() }}</p>
            } @else {
              <p class="text-xs mt-1 text-white/50">Nothing to compare with yet</p>
            }
          </div>
          <div class="rounded-xl border border-gray-200 bg-white p-4">
            <p class="text-2xs uppercase tracking-wide text-gray-400">Deposits</p>
            <p class="text-xl font-bold text-ink tabular-nums">\${{ money(d.totals.deposits) }}</p>
            <p class="text-xs text-gray-500">on those appointments</p>
          </div>
          <div class="rounded-xl border border-gray-200 bg-white p-4">
            <p class="text-2xs uppercase tracking-wide text-gray-400">No-shows</p>
            <p class="text-xl font-bold text-ink tabular-nums">{{ rate() === null ? '–' : rate() + '%' }}</p>
            <p class="text-xs text-gray-500">{{ d.totals.no_shows }} of {{ d.totals.completed + d.totals.no_shows }} due · {{ d.totals.cancelled }} cancelled</p>
          </div>
          <div class="col-span-2 sm:col-span-1 rounded-xl border border-gray-200 bg-white p-4">
            <p class="text-2xs uppercase tracking-wide text-gray-400">Shop</p>
            <p class="text-xl font-bold text-ink tabular-nums">\${{ money(d.totals.orders_value, 2) }}</p>
            <p class="text-xs text-gray-500">{{ d.totals.orders_delivered }} {{ d.totals.orders_delivered === 1 ? 'order' : 'orders' }} delivered</p>
          </div>
        </section>
        <p class="text-xs text-gray-400 mb-6 max-w-prose">
          Earned is the booked price of completed and no-show appointments - the same figure each artist sees on their own
          Earnings page. B-Edge doesn't hold payments, so these are the amounts recorded, not money in the bank.
        </p>

        <h2 class="text-sm font-semibold text-ink mb-2">Team</h2>
        <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-2xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <th class="px-4 py-2 font-semibold">Artist</th>
                <th class="px-3 py-2 font-semibold text-right">Earned</th>
                <th class="px-3 py-2 font-semibold text-right">Done</th>
                <th class="px-3 py-2 font-semibold text-right">No-shows</th>
                <th class="px-3 py-2 font-semibold text-right">Cancelled</th>
                <th class="px-4 py-2 font-semibold text-right">Rating</th>
              </tr>
            </thead>
            <tbody>
              @for (a of d.by_artist; track a.artist_id) {
                <tr data-artist class="border-b border-gray-50 last:border-0">
                  <td class="px-4 py-2.5">
                    <span class="font-medium text-ink">{{ a.name }}</span>
                    @if (a.is_you) { <span class="ml-1.5 text-2xs font-bold uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">You</span> }
                    @if (!a.is_member) { <span class="ml-1.5 text-2xs font-bold uppercase px-1.5 py-0.5 rounded bg-warning-light text-warning-dark">Left the salon</span> }
                  </td>
                  <td class="px-3 py-2.5 text-right tabular-nums font-semibold text-ink">\${{ money(a.earned) }}</td>
                  <td class="px-3 py-2.5 text-right tabular-nums">{{ a.completed }}</td>
                  <td class="px-3 py-2.5 text-right tabular-nums" [class.text-danger-dark]="a.no_shows > 0">{{ a.no_shows }}</td>
                  <td class="px-3 py-2.5 text-right tabular-nums">{{ a.cancelled }}</td>
                  <td class="px-4 py-2.5 text-right tabular-nums text-gray-600">{{ a.review_count > 0 ? (+a.rating).toFixed(1) + ' (' + a.review_count + ')' : '–' }}</td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="px-4 py-6 text-center text-gray-400">Nobody in the salon yet.</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class SalonOverviewPage implements OnInit {
  private readonly earnings = inject(EarningsDataService);

  protected readonly presets = PRESETS;
  readonly preset = signal<Preset>('month');
  readonly data = signal<SalonOverview | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly earnedChange = computed(() => {
    const d = this.data();
    return d ? change(d.totals.earned, d.previous.earned) : null;
  });

  readonly rate = computed(() => {
    const d = this.data();
    return d ? noShowRate(d.totals) : null;
  });

  /** "1–10 Sep" - the window the comparison actually covers. */
  readonly previousLabel = computed(() => {
    const d = this.data();
    if (!d) return '';
    const from = new Date(d.previous_period.from);
    // The API's `to` is exclusive; the last moment inside is one ms before.
    const to = new Date(new Date(d.previous_period.to).getTime() - 1);
    const day = (x: Date) => new Intl.DateTimeFormat('en-GB', { timeZone: SALON_TZ, day: 'numeric' }).format(x);
    const dayMonth = (x: Date) => new Intl.DateTimeFormat('en-GB', { timeZone: SALON_TZ, day: 'numeric', month: 'short' }).format(x);
    const sameMonth = dayMonth(from).split(' ')[1] === dayMonth(to).split(' ')[1];
    if (dayMonth(from) === dayMonth(to)) return dayMonth(to);
    return sameMonth ? `${day(from)}–${dayMonth(to)}` : `${dayMonth(from)} – ${dayMonth(to)}`;
  });

  ngOnInit(): void {
    this.load();
  }

  select(p: Preset): void {
    if (p === this.preset()) return;
    this.preset.set(p);
    this.load();
  }

  money(value: string, decimals = 0): string {
    const n = parseFloat(value) || 0;
    const places = decimals > 0 && !Number.isInteger(n) ? decimals : 0;
    return n.toLocaleString('en-US', { minimumFractionDigits: places, maximumFractionDigits: places });
  }

  private load(): void {
    const { from, to } = periodRange(this.preset());
    this.loading.set(true);
    this.error.set(null);
    this.earnings.getSalonOverview(from, to).subscribe({
      next: (d) => {
        this.data.set({ ...d, by_artist: d.by_artist ?? [] });
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(extractApiErrorMessage(err, 'Could not load the salon overview.'));
      },
    });
  }
}
