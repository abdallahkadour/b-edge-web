import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import type { Observable } from 'rxjs';

import { BookingDataService, SkeletonComponent, extractApiErrorMessage } from '@bedge/shared';
import type { EnrichedBooking, TimeSlot } from '@bedge/shared';

import { PickDatetimeScreenComponent } from '../booking-funnel/screens/pick-datetime-screen.component';

const STORE_TIMEZONE = 'Asia/Beirut';

/**
 * Change the time of a booking she already has (/my-bookings/:id/move).
 *
 * E2E 28.10, 2026-10-08: the API could always move a booking - at most twice,
 * to a time the artist offers, keeping its price, deposit and status - but no
 * screen called it, so a customer who could not make it could only cancel.
 *
 * The time picker is the booking funnel's own, in 'move' mode. Its times come
 * from GET /bookings/:id/reschedule-slots, not the public slots endpoint: the
 * public one counts this booking as busy and so hides every time overlapping
 * it, which the move itself allows.
 */
@Component({
  selector: 'app-move-booking-page',
  standalone: true,
  imports: [PickDatetimeScreenComponent, SkeletonComponent, RouterLink],
  template: `
    @if (loading()) {
      <div class="px-5 py-5"><bedge-skeleton height="16rem" rounded="xl" /></div>
    } @else if (booking(); as b) {
      @if (movable()) {
        <app-pick-datetime-screen
          mode="move"
          [artistId]="b.artist_id"
          [serviceId]="b.service_id"
          [stores]="stores()"
          [initialDate]="initialDate()"
          [loadSlots]="loadSlots()"
          [note]="note()"
          [problem]="problem()"
          [holding]="moving()"
          (back)="goBack()"
          (continueWith)="move($event.startTime)"
        />
      } @else {
        <div class="px-5 py-8 flex flex-col gap-4">
          <p class="text-sm text-gray-600 leading-relaxed">
            This booking can't be moved any more. It has already been moved twice, or it is no longer upcoming.
            To change it, cancel it and book again.
          </p>
          <a [routerLink]="['/my-bookings', b.id]" class="text-sm font-medium text-ink underline">Back to your booking</a>
        </div>
      }
    } @else {
      <div class="px-5 py-8 flex flex-col gap-4">
        <p role="alert" class="text-sm text-danger-dark">{{ problem() }}</p>
        <a routerLink="/my-bookings" class="text-sm font-medium text-ink underline">Your bookings</a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveBookingPage implements OnInit {
  private readonly bookingSvc = inject(BookingDataService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  readonly loading = signal(true);
  readonly booking = signal<EnrichedBooking | null>(null);
  readonly moving = signal(false);
  readonly problem = signal<string | null>(null);

  /** The server decides (EnrichedBooking.can_reschedule); the page only reads it. */
  readonly movable = computed(() => this.booking()?.can_reschedule === true);

  readonly stores = computed(() => {
    const b = this.booking();
    return b ? [{ id: b.store_id, name: b.store_name }] : [];
  });

  /** The picker opens on the day the booking is on, on the salon's calendar. */
  readonly initialDate = computed(() => {
    const b = this.booking();
    return b ? beirutIsoDate(b.start_time) : null;
  });

  readonly note = computed(() => {
    const b = this.booking();
    if (!b) return null;
    const left = b.reschedules_left ?? 0;
    return `Now: ${formatWhen(b.start_time)}. You can move it ${left} more ${left === 1 ? 'time' : 'times'}; ` +
      'the price and deposit stay the same.';
  });

  /**
   * The slot source handed to the picker. A new function instance makes the
   * picker fetch again - which is how a time that was taken a moment ago
   * disappears from the list after the move is refused.
   */
  readonly loadSlots = signal(this.slotSource());

  ngOnInit(): void {
    this.bookingSvc.getBooking(this.id()).subscribe({
      next: (b) => {
        this.booking.set(b);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.problem.set(err.status === 404
          ? "This booking doesn't exist or you don't have access to it."
          : extractApiErrorMessage(err, 'Could not load this booking.'));
      },
    });
  }

  goBack(): void {
    const b = this.booking();
    this.router.navigate(b ? ['/my-bookings', b.id] : ['/my-bookings']);
  }

  move(startTime: string): void {
    const b = this.booking();
    if (!b || this.moving()) return;
    this.moving.set(true);
    this.problem.set(null);

    this.bookingSvc.reschedule(b.id, startTime).subscribe({
      next: () => {
        this.moving.set(false);
        this.router.navigate(['/my-bookings', b.id], { queryParams: { moved: '1' } });
      },
      error: (err: HttpErrorResponse) => {
        this.moving.set(false);
        this.problem.set(extractApiErrorMessage(err, 'Could not move this booking. Please try again.'));
        this.loadSlots.set(this.slotSource());
      },
    });
  }

  private slotSource(): (storeId: string, date: string) => Observable<TimeSlot[]> {
    return (_storeId: string, date: string) => this.bookingSvc.getRescheduleSlots(this.booking()!.id, date);
  }
}

function beirutIsoDate(iso: string): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: STORE_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(iso));
}

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: STORE_TIMEZONE, weekday: 'short', day: 'numeric', month: 'short',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(iso));
}
