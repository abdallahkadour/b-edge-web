import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import type { Booking, Service } from '@bedge/shared';

const STORE_TIMEZONE = 'Asia/Beirut';

/**
 * Step 5 — the terminal success state. Reads the actual booking returned by
 * SubmitGuestBooking, not a re-derived lookup from mock data, so what's shown
 * here can never drift from what was actually created server-side.
 */
@Component({
  selector: 'app-booking-confirmed-screen',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './booking-confirmed-screen.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingConfirmedScreenComponent {
  readonly booking = input.required<Booking>();
  readonly service = input.required<Service>();
  readonly storeName = input.required<string>();
  readonly artistName = input.required<string>();

  readonly backToProfile = output<void>();

  protected readonly dateLabel = computed(() => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: STORE_TIMEZONE,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).formatToParts(new Date(this.booking().start_time));
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
    return `${get('weekday')}, ${get('day')} ${get('month')}`;
  });

  protected readonly timeLabel = computed(() => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: STORE_TIMEZONE,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).formatToParts(new Date(this.booking().start_time));
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
    return `${get('hour')}:${get('minute')} ${get('dayPeriod')}`;
  });

  /**
   * A fresh guest submission always returns status "pending" — the copy
   * below is written for that case specifically. This mapper exists so a
   * different status returned unexpectedly renders as something sane
   * instead of the wrong hardcoded label.
   */
  protected readonly statusLabel = computed(() => {
    switch (this.booking().status) {
      case 'pending':
        return 'Pending approval';
      case 'approved':
        return 'Approved';
      case 'confirmed':
        return 'Confirmed';
      default:
        return this.booking().status;
    }
  });
}
