import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import {
  AuthStore,
  ArtistDataService,
  BookingDataService,
  BadgeComponent,
  ButtonComponent,
  InputDirective,
  bookingStatusTone,
  extractApiErrorMessage,
} from '@bedge/shared';
import type { EnrichedBooking, BookingStatus } from '@bedge/shared';

/** Statuses an artist can still cancel from - mirrors the backend's own
 *  CancelBooking check exactly (repository.go: everything except
 *  completed/cancelled/expired/no_show/refund_due/refunded). Kept in sync
 *  deliberately with customer-pwa's booking-detail.page.ts, which documents
 *  the same rule for the customer-facing side - a mismatch here would show
 *  a Cancel button that then fails server-side, or hide one that would
 *  have worked. Before this existed, there was no Cancel action anywhere
 *  in artist-dashboard at all - confirmed by checking both this list and
 *  Calendar's day-view popover, neither had one. */
const CANCELLABLE_STATUSES = new Set(['held', 'pending', 'approved', 'deposit_paid', 'confirmed']);

/** Status filter tab shown in the UI. '' means all statuses. */
interface StatusTab {
  label: string;
  value: string;
}

/**
 * Bookings screen for the artist dashboard.
 *
 * Flow:
 *  1. On init, fetch the artist's profile to get their artist_id.
 *  2. Fetch bookings for that artist_id (optionally filtered by status).
 *  3. The artist can switch status tabs to filter bookings.
 *
 * Uses OnPush change detection + signals throughout — no manual
 * change detection calls needed.
 */
@Component({
  selector: 'bedge-bookings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent, ButtonComponent, InputDirective],
  templateUrl: './bookings.component.html',
})
export class BookingsComponent implements OnInit {
  /** Shared across bookings, client-detail and waitlist so the same
   *  status can never render differently on different screens. */
  protected readonly statusTone = bookingStatusTone;

  private readonly auth = inject(AuthStore);
  private readonly artistSvc = inject(ArtistDataService);
  private readonly bookingSvc = inject(BookingDataService);

  // ── State ────────────────────────────────────────────────────────────────

  /** True while loading the initial artist profile or bookings. */
  readonly loading = signal(true);

  /** Error message to display, or null. */
  readonly errorMessage = signal<string | null>(null);

  /** The resolved artist UUID, fetched on init. */
  private readonly artistId = signal<string | null>(null);

  /** All bookings currently loaded. */
  readonly bookings = signal<EnrichedBooking[]>([]);

  /** Currently active status filter. '' = all. */
  readonly activeStatus = signal<string>('');

  /** True when there are more pages to load. */
  readonly hasMore = signal(false);

  /** Pagination cursor for the next page. */
  private nextCursor = signal<string | undefined>(undefined);

  /** Which single booking, if any, is showing its "are you sure?" cancel
   *  row - same inline-confirm pattern as my-orders.page.ts and
   *  portfolio.component.ts, not a bottom sheet: this screen is a grid of
   *  cards, not a single-item detail page. */
  readonly confirmingCancelId = signal<string | null>(null);
  readonly cancelReason = signal('');
  readonly cancellingId = signal<string | null>(null);
  readonly cancelError = signal<string | null>(null);

  // ── Computed ─────────────────────────────────────────────────────────────

  /** Count of bookings needing attention (pending). */
  readonly pendingCount = computed(
    () => this.bookings().filter((b) => b.status === 'pending').length,
  );

  // ── Status tabs ───────────────────────────────────────────────────────────

  /** Tabs shown at the top of the bookings list. */
  readonly tabs: StatusTab[] = [
    { label: 'All', value: '' },
    { label: 'Held', value: 'held' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Completed', value: 'completed' },
    { label: 'No show', value: 'no_show' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadArtistThenBookings();
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Switch the status filter tab and reload bookings. */
  selectTab(status: string): void {
    if (this.activeStatus() === status) return;
    this.activeStatus.set(status);
    this.nextCursor.set(undefined);
    this.loadBookings();
  }

  /** Load the next page of bookings (infinite scroll). */
  loadMore(): void {
    if (!this.hasMore() || this.loading()) return;
    this.loadBookings(true);
  }

  /** Approve a booking (pending → approved). */
  approve(bookingId: string): void {
    this.bookingSvc.approve(bookingId).subscribe({
      next: () => this.loadBookings(),
      error: () => this.errorMessage.set('Failed to approve booking.'),
    });
  }

  /** Mark a booking complete. */
  complete(bookingId: string): void {
    this.bookingSvc.complete(bookingId).subscribe({
      next: () => this.loadBookings(),
      error: () => this.errorMessage.set('Failed to mark booking as completed.'),
    });
  }

  /** Mark no-show. */
  markNoShow(bookingId: string): void {
    this.bookingSvc.markNoShow(bookingId).subscribe({
      next: () => this.loadBookings(),
      error: () => this.errorMessage.set('Failed to mark no-show.'),
    });
  }

  /** First tap: arm the inline "are you sure?" row for this card. */
  askToCancel(bookingId: string): void {
    this.cancelReason.set('');
    this.cancelError.set(null);
    this.confirmingCancelId.set(bookingId);
  }

  dismissCancel(): void {
    this.confirmingCancelId.set(null);
  }

  /** Second tap: actually cancel. Unlike a customer cancelling (refund
   *  only outside the 24h window), an artist cancelling always refunds a
   *  positive deposit - see CancelBooking's own doc comment in
   *  internal/booking/service.go for why; nothing to preview here, the
   *  server's behaviour is unconditional. */
  confirmCancel(booking: EnrichedBooking): void {
    if (this.cancellingId()) return;

    this.cancellingId.set(booking.id);
    this.cancelError.set(null);

    this.bookingSvc.cancel(booking.id, { reason: this.cancelReason().trim() || undefined }).subscribe({
      next: () => {
        this.cancellingId.set(null);
        this.confirmingCancelId.set(null);
        this.loadBookings();
      },
      error: (err: HttpErrorResponse) => {
        this.cancellingId.set(null);
        this.cancelError.set(extractApiErrorMessage(err, 'Could not cancel this booking. Please try again.'));
      },
    });
  }

  canCancel(booking: EnrichedBooking): boolean {
    return CANCELLABLE_STATUSES.has(booking.status);
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  /** Step 1: fetch artist profile to resolve artist_id, then load bookings. */
  private loadArtistThenBookings(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.artistSvc.getMyProfile().subscribe({
      next: (profile) => {
        this.artistId.set(profile.id);
        this.loadBookings();
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(this.readableError(err));
      },
    });
  }

  /** Step 2: fetch bookings for the resolved artist, filtered by active status. */
  private loadBookings(append = false): void {
    const id = this.artistId();
    if (!id) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    const cursor = append ? this.nextCursor() : undefined;
    const status = this.activeStatus() || undefined;

    this.bookingSvc.getArtistBookings(id, cursor, 20, status).subscribe({
      next: (result) => {
        const incoming = result.items as unknown as EnrichedBooking[];
        this.bookings.update((prev) =>
          append ? [...prev, ...incoming] : incoming,
        );
        this.hasMore.set(result.meta?.has_more ?? false);
        this.nextCursor.set(result.meta?.next_cursor ?? undefined);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(this.readableError(err));
      },
    });
  }

  /** Format a date string for display. */
  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  /** Format a time string for display. */
  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /** Map an HTTP error to a message the artist can act on. */
  private readableError(err: HttpErrorResponse): string {
    if (err.status === 0) return 'Cannot reach the server. Check your connection.';
    if (err.status === 401) return 'Your session expired. Please sign in again.';
    return 'Something went wrong. Please try again.';
  }

  /** Returns a Tailwind colour class for a booking status badge. */

  /** Human-readable label for a booking status. */
  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      held:          'Held',
      pending:       'Pending',
      approved:      'Approved',
      deposit_paid:  'Deposit paid',
      confirmed:     'Confirmed',
      completed:     'Completed',
      cancelled:     'Cancelled',
      no_show:       'No show',
      refund_due:    'Refund due',
      refunded:      'Refunded',
      expired:       'Expired',
    };
    return labels[status] ?? status;
  }

  /** Returns true if the approve action is valid for this booking. */
  canApprove(booking: EnrichedBooking): boolean {
    return booking.status === 'pending';
  }

  /** Returns true if the complete action is valid. Mirrors the backend's
   *  own start_time guard (booking/service.go's CompleteBooking) - a
   *  service can't be completed before it has even started. */
  canComplete(booking: EnrichedBooking): boolean {
    return booking.status === 'confirmed' && new Date(booking.start_time) <= new Date();
  }

  /** Returns true if no-show can be marked. Mirrors the backend's own
   *  start_time guard (booking/service.go's MarkNoShow) - a customer can't
   *  be a no-show for an appointment that hasn't happened yet. */
  canMarkNoShow(booking: EnrichedBooking): boolean {
    return booking.status === 'confirmed' && new Date(booking.start_time) <= new Date();
  }
}
