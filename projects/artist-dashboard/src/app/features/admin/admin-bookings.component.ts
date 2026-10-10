import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { AdminDataService, extractApiErrorMessage, formatStatusLabel } from '@bedge/shared';
import type { AdminBooking, AdminBookingSummary } from '@bedge/shared';

const PAGE = 20;

/** The filters, in the order an admin reads them: what is owed or waiting
 *  first, then the live and the finished. */
const FILTERS: { status: string; label: string }[] = [
  { status: '', label: 'All' },
  { status: 'refund_due', label: 'Refund due' },
  { status: 'pending', label: 'Pending' },
  { status: 'approved', label: 'Approved' },
  { status: 'deposit_paid', label: 'Deposit paid' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'completed', label: 'Completed' },
  { status: 'cancelled', label: 'Cancelled' },
];

/**
 * Admin -> Bookings: every salon's bookings, read-only (2026-10-09).
 *
 * The PRD's launch list asked for an admin who "sees all stores, staff,
 * bookings, refund queue"; the admin page had approvals, artists, plans,
 * billing and reports, but no bookings. It leads with what is waiting on
 * someone - above all the deposits salons owe back to customers, money
 * B-Edge never holds and can only see and chase. Read-only on purpose: the
 * admin sees, the artist acts.
 */
@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  template: `
    <div class="max-w-2xl mx-auto px-4 py-6">
      @if (summary(); as s) {
        <div class="grid grid-cols-3 gap-2 mb-5">
          <button type="button" (click)="select('refund_due')"
            class="text-left rounded-xl border p-3 transition-colors"
            [class]="s.refunds_owed > 0 ? 'border-danger/40 bg-danger-light' : 'border-gray-200 bg-white'">
            <span class="block text-lg font-bold text-ink tabular-nums">\${{ s.refunds_owed_amount }}</span>
            <span class="block text-xs text-gray-500">{{ s.refunds_owed }} {{ s.refunds_owed === 1 ? 'refund' : 'refunds' }} owed</span>
          </button>
          <button type="button" (click)="select('pending')" class="text-left rounded-xl border border-gray-200 bg-white p-3">
            <span class="block text-lg font-bold text-ink tabular-nums">{{ s.awaiting_approval }}</span>
            <span class="block text-xs text-gray-500">awaiting approval</span>
          </button>
          <button type="button" (click)="select('approved')" class="text-left rounded-xl border border-gray-200 bg-white p-3">
            <span class="block text-lg font-bold text-ink tabular-nums">{{ s.awaiting_deposit }}</span>
            <span class="block text-xs text-gray-500">deposits to check</span>
          </button>
        </div>
      }

      <div class="flex gap-1.5 overflow-x-auto pb-2 mb-3" role="tablist" aria-label="Filter by status">
        @for (f of filters; track f.status) {
          <button type="button" role="tab" [attr.aria-selected]="status() === f.status" (click)="select(f.status)"
            class="shrink-0 h-8 px-3 rounded-full text-xs font-semibold border transition-colors"
            [class]="status() === f.status ? 'bg-ink border-ink text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'">{{ f.label }}</button>
        }
      </div>

      @if (error(); as e) {
        <div role="alert" class="mb-4 rounded-lg bg-danger-light border border-danger/30 px-4 py-3 text-sm text-danger-dark">{{ e }}</div>
      }

      @if (loading()) {
        <p class="text-sm text-gray-400 py-8 text-center">Loading bookings…</p>
      } @else if (rows().length === 0) {
        <p class="text-sm text-gray-400 py-8 text-center">No bookings{{ status() ? ' with this status' : '' }}.</p>
      } @else {
        <ul class="space-y-2">
          @for (b of rows(); track b.id) {
            <li class="rounded-xl border border-gray-200 bg-white p-4">
              <div class="flex justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-sm font-bold text-ink truncate">{{ b.service_name }} · {{ b.artist_name }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ b.salon_name }} · {{ b.store_name }}, {{ b.store_city }}</p>
                </div>
                <span class="shrink-0 self-start text-2xs font-bold uppercase px-2 py-1 rounded-full bg-gray-100 text-gray-600">{{ label(b.status) }}</span>
              </div>
              <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                <span>{{ when(b.start_time) }}</span>
                <span>{{ b.customer_name }}@if (b.customer_phone) { · {{ b.customer_phone }}}</span>
                <span class="tabular-nums">\${{ b.final_price }}@if (b.deposit_amount !== '0') { · deposit \${{ b.deposit_amount }}}</span>
              </div>
            </li>
          }
        </ul>
        @if (nextCursor()) {
          <button type="button" (click)="loadMore()" [disabled]="loadingMore()"
            class="mt-3 w-full h-10 rounded-lg border border-gray-200 bg-white text-sm font-medium text-ink disabled:opacity-60">
            {{ loadingMore() ? 'Loading…' : 'Load more' }}
          </button>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminBookingsComponent implements OnInit {
  private readonly api = inject(AdminDataService);

  protected readonly filters = FILTERS;
  readonly summary = signal<AdminBookingSummary | null>(null);
  readonly rows = signal<AdminBooking[]>([]);
  readonly status = signal('');
  readonly nextCursor = signal<string | null>(null);
  readonly loading = signal(true);
  readonly loadingMore = signal(false);
  readonly error = signal<string | null>(null);

  protected readonly label = formatStatusLabel;

  ngOnInit(): void {
    this.api.getBookingSummary().subscribe({
      next: (s) => this.summary.set(s),
      error: () => this.summary.set(null),
    });
    this.load();
  }

  select(status: string): void {
    this.status.set(status);
    this.load();
  }

  loadMore(): void {
    const cursor = this.nextCursor();
    if (!cursor || this.loadingMore()) return;
    this.loadingMore.set(true);
    this.api.listBookings(this.params(cursor)).subscribe({
      next: (page) => {
        this.rows.update((r) => [...r, ...page.items]);
        this.nextCursor.set(page.meta?.has_more ? page.meta.next_cursor ?? null : null);
        this.loadingMore.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loadingMore.set(false);
        this.error.set(extractApiErrorMessage(err, 'Could not load more bookings.'));
      },
    });
  }

  /** "Mon 20 Oct, 10:00" on the salon's calendar - every store today is in Beirut. */
  when(iso: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Beirut', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso));
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.listBookings(this.params()).subscribe({
      next: (page) => {
        this.rows.set(page.items);
        this.nextCursor.set(page.meta?.has_more ? page.meta.next_cursor ?? null : null);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.rows.set([]);
        this.error.set(extractApiErrorMessage(err, 'Could not load bookings.'));
      },
    });
  }

  private params(cursor?: string): { status?: string; cursor?: string; limit: number } {
    const p: { status?: string; cursor?: string; limit: number } = { limit: PAGE };
    if (this.status()) p.status = this.status();
    if (cursor) p.cursor = cursor;
    return p;
  }
}
