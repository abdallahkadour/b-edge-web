import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Observable } from 'rxjs';

import {
  ArtistDataService,
  BookingDataService,
} from '@bedge/shared';
import type { Booking, BookingStatus } from '@bedge/shared';

/** The four filter tabs shown above the booking list. */
type FilterTab = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

/**
 * Bookings screen for the artist dashboard.
 *
 * On init it fetches the artist's own profile (for the artist ID), then loads
 * all bookings. Client-side filtering is used for the tab bar — the full list
 * is loaded once and filtered in memory so switching tabs is instant.
 *
 * Each booking card shows the relevant action buttons based on the current
 * status, mirroring the state machine in the Go service layer.
 */
@Component({
  selector: 'bedge-bookings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bookings.component.html',
})
export class BookingsComponent implements OnInit {
  private readonly artistService = inject(ArtistDataService);
  private readonly bookingService = inject(BookingDataService);

  /** True while the initial bookings list is loading. */
  readonly loading = signal(true);

  /** A top-level error message, or null. */
  readonly error = signal<string | null>(null);

  /** The ID of the booking currently being actioned (to show per-card loading). */
  readonly actionLoading = signal<string | null>(null);

  /** Full unfiltered list from the API. */
  private readonly allBookings = signal<Booking[]>([]);

  /** Active filter tab. */
  readonly activeFilter = signal<FilterTab>('all');

  /** Filtered view shown in the template. */
  readonly bookings = computed(() => {
    const filter = this.activeFilter();
    const all = this.allBookings();
    switch (filter) {
      case 'pending':
        return all.filter((b) =>
          ['pending', 'approved', 'deposit_pending', 'deposit_paid'].includes(b.status),
        );
      case 'confirmed':
        return all.filter((b) => b.status === 'confirmed');
      case 'completed':
        return all.filter((b) => b.status === 'completed');
      case 'cancelled':
        return all.filter((b) =>
          ['cancelled', 'expired', 'no_show', 'refund_due', 'refunded'].includes(b.status),
        );
      default:
        return all;
    }
  });

  readonly filterTabs: { label: string; value: FilterTab }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  ngOnInit(): void {
    // First get the artist profile to obtain the artist ID.
    this.artistService.getMyProfile().subscribe({
      next: (profile) => this.loadBookings(profile.id),
      error: () => {
        this.error.set('Could not load your artist profile. Please refresh.');
        this.loading.set(false);
      },
    });
  }

  setFilter(tab: FilterTab): void {
    this.activeFilter.set(tab);
  }

  approve(booking: Booking): void {
    this.runAction(booking.id, () => this.bookingService.approve(booking.id));
  }

  confirmDeposit(booking: Booking): void {
    this.runAction(booking.id, () => this.bookingService.confirmDeposit(booking.id));
  }

  complete(booking: Booking): void {
    this.runAction(booking.id, () => this.bookingService.complete(booking.id));
  }

  markNoShow(booking: Booking): void {
    this.runAction(booking.id, () => this.bookingService.markNoShow(booking.id));
  }

  cancel(booking: Booking): void {
    this.runAction(booking.id, () => this.bookingService.cancel(booking.id));
  }

  /** Human-readable label for each status. */
  statusLabel(status: BookingStatus): string {
    const labels: Record<BookingStatus, string> = {
      held:            'Held',
      pending:         'Pending',
      approved:        'Approved',
      deposit_pending: 'Deposit Pending',
      deposit_paid:    'Deposit Paid',
      confirmed:       'Confirmed',
      completed:       'Completed',
      cancelled:       'Cancelled',
      expired:         'Expired',
      no_show:         'No Show',
      refund_due:      'Refund Due',
      refunded:        'Refunded',
    };
    return labels[status] ?? status;
  }

  /** Tailwind classes for the status badge, using the B-Edge design tokens. */
  statusClasses(status: BookingStatus): string {
    switch (status) {
      case 'pending':
      case 'approved':
      case 'deposit_pending':
      case 'refund_due':
        return 'bg-warning-light text-warning-dark';
      case 'deposit_paid':
      case 'confirmed':
        return 'bg-success-light text-success-dark';
      case 'completed':
        return 'bg-gray-100 text-gray-600';
      case 'cancelled':
      case 'no_show':
        return 'bg-danger-light text-danger-dark';
      case 'held':
      case 'expired':
      case 'refunded':
      default:
        return 'bg-gray-100 text-gray-500';
    }
  }

  /** Format an ISO timestamp for display: "Sat 14 Jun · 10:00 AM". */
  formatDate(isoString: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(isoString));
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private loadBookings(artistId: string): void {
    this.loading.set(true);
    this.bookingService.getArtistBookings(artistId).subscribe({
      next: (result) => {
        this.allBookings.set(result.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load bookings. Please refresh.');
        this.loading.set(false);
      },
    });
  }

  /**
   * Runs a single booking action, shows per-card loading, and updates the
   * booking in place when the server responds — no full list reload needed.
   */
  private runAction(
    bookingId: string,
    action: () => Observable<Booking>,
  ): void {
    this.actionLoading.set(bookingId);
    action().subscribe({
      next: (updated) => {
        this.allBookings.update((list) =>
          list.map((b) => (b.id === updated.id ? updated : b)),
        );
        this.actionLoading.set(null);
      },
      error: () => {
        // On error just clear the loading state — the booking stays unchanged.
        this.actionLoading.set(null);
      },
    });
  }
}
