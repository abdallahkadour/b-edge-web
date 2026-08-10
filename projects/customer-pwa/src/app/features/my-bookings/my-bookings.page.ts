import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { BookingDataService, CustomerAuthStore } from '@bedge/shared';
import type { EnrichedBooking } from '@bedge/shared';

type FilterTab = 'upcoming' | 'past' | 'cancelled';

const UPCOMING_STATUSES = new Set(['pending', 'approved', 'confirmed']);
const CANCELLED_STATUSES = new Set(['cancelled', 'refund_due', 'expired']);
const PAST_STATUSES = new Set(['completed', 'no_show']);

/**
 * My Bookings - a logged-in customer's booking history. The one screen
 * this whole OTP-login feature exists for.
 */
@Component({
  selector: 'app-my-bookings-page',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './my-bookings.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyBookingsPage implements OnInit {
  private readonly bookingSvc = inject(BookingDataService);
  protected readonly auth = inject(CustomerAuthStore);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly bookings = signal<EnrichedBooking[]>([]);
  readonly activeTab = signal<FilterTab>('upcoming');

  ngOnInit(): void {
    this.load();
  }

  selectTab(tab: FilterTab): void {
    this.activeTab.set(tab);
  }

  filteredBookings(): EnrichedBooking[] {
    const tab = this.activeTab();
    const set = tab === 'upcoming' ? UPCOMING_STATUSES : tab === 'past' ? PAST_STATUSES : CANCELLED_STATUSES;
    return this.bookings().filter((b) => set.has(b.status));
  }

  countFor(tab: FilterTab): number {
    const set = tab === 'upcoming' ? UPCOMING_STATUSES : tab === 'past' ? PAST_STATUSES : CANCELLED_STATUSES;
    return this.bookings().filter((b) => set.has(b.status)).length;
  }

  statusLabel(status: string): string {
    return status.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
  }

  formatDateTime(iso: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Beirut',
      weekday: 'short', day: 'numeric', month: 'short',
      hour: 'numeric', minute: '2-digit', hour12: true,
    }).format(new Date(iso));
  }

  // No "Message artist" WhatsApp link here - the artist's phone number
  // isn't exposed on this response, deliberately. Every customer who ever
  // booked with an artist could otherwise pull their personal number,
  // which is a real privacy decision, not something to add silently as a
  // side effect of building this screen. Revisit as its own decision.

  openBooking(id: string): void {
    this.router.navigate(['/my-bookings', id]);
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: () => this.router.navigateByUrl('/'), // clear-and-redirect either way
    });
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.bookingSvc.getCustomerBookings().subscribe({
      next: (result) => {
        this.bookings.set(result.items ?? []);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 0 ? 'Cannot reach the server.' : 'Failed to load your bookings.',
        );
      },
    });
  }
}
