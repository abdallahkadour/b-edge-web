import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthStore, ArtistDataService, BookingDataService } from '@bedge/shared';
import type { EnrichedBooking, BookingStatus } from '@bedge/shared';

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
  templateUrl: './bookings.component.html',
})
export class BookingsComponent implements OnInit {
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
  statusClass(status: BookingStatus | string): string {
    switch (status) {
      case 'pending':      return 'bg-amber-100 text-amber-800';
      case 'approved':     return 'bg-blue-100 text-blue-800';
      case 'deposit_paid': return 'bg-blue-100 text-blue-800';
      case 'confirmed':    return 'bg-green-100 text-green-800';
      case 'completed':    return 'bg-gray-100 text-gray-600';
      case 'cancelled':    return 'bg-red-100 text-red-700';
      case 'no_show':      return 'bg-red-100 text-red-700';
      case 'refund_due':   return 'bg-orange-100 text-orange-800';
      default:             return 'bg-gray-100 text-gray-500';
    }
  }

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

  /** Returns true if the complete action is valid. */
  canComplete(booking: EnrichedBooking): boolean {
    return booking.status === 'confirmed';
  }

  /** Returns true if no-show can be marked. */
  canMarkNoShow(booking: EnrichedBooking): boolean {
    return booking.status === 'confirmed';
  }
}
