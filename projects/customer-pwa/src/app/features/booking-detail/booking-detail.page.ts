import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { A11yModule } from '@angular/cdk/a11y';

import {
  BookingDataService,
  ButtonComponent,
  InputDirective,
  extractApiErrorMessage,
  formatStatusLabel,
} from '@bedge/shared';
import type { EnrichedBooking } from '@bedge/shared';

/** Statuses a customer can still act on - mirrors the backend's own
 *  CancelBooking check exactly (repository.go: everything except
 *  completed/cancelled/expired/no_show/refund_due/refunded). Kept in sync
 *  deliberately, not guessed - a mismatch here would show a Cancel button
 *  that then fails server-side, or hide one that would have worked. */
const CANCELLABLE_STATUSES = new Set(['pending', 'approved', 'confirmed']);

/** Mirrors the server's own >24h refund rule (service.go) - for display
 *  only, so the customer knows what to expect BEFORE confirming. The
 *  server's own check remains the actual source of truth; this is a
 *  best-effort preview, not a duplicate authority. */
const REFUND_WINDOW_HOURS = 24;

@Component({
  selector: 'app-booking-detail-page',
  standalone: true,
  imports: [LucideAngularModule, A11yModule, ButtonComponent, InputDirective],
  templateUrl: './booking-detail.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingDetailPage implements OnInit {
  private readonly bookingSvc = inject(BookingDataService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly booking = signal<EnrichedBooking | null>(null);

  readonly showCancelSheet = signal(false);
  readonly cancelReason = signal('');
  readonly cancelling = signal(false);
  readonly cancelError = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  goBack(): void {
    this.router.navigateByUrl('/my-bookings');
  }

  canCancel(b: EnrichedBooking): boolean {
    return CANCELLABLE_STATUSES.has(b.status);
  }

  /** Best-effort preview of whether a refund would apply - see the const's
   *  doc comment. Only meaningful when a real deposit exists at all. */
  wouldRefund(b: EnrichedBooking): boolean {
    if (!b.deposit_amount || parseFloat(b.deposit_amount) <= 0) return false;
    const hoursUntil = (new Date(b.start_time).getTime() - Date.now()) / 3_600_000;
    return hoursUntil > REFUND_WINDOW_HOURS;
  }

  protected readonly statusLabel = formatStatusLabel;

  formatDateTime(iso: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Beirut',
      weekday: 'long', day: 'numeric', month: 'long',
      hour: 'numeric', minute: '2-digit', hour12: true,
    }).format(new Date(iso));
  }

  openCancelSheet(): void {
    this.cancelReason.set('');
    this.cancelError.set(null);
    this.showCancelSheet.set(true);
  }

  closeCancelSheet(): void {
    if (this.cancelling()) return;
    this.showCancelSheet.set(false);
  }

  confirmCancel(): void {
    const b = this.booking();
    if (!b || this.cancelling()) return;

    this.cancelling.set(true);
    this.cancelError.set(null);

    this.bookingSvc.cancel(b.id, { reason: this.cancelReason().trim() || undefined }).subscribe({
      next: () => {
        this.cancelling.set(false);
        this.showCancelSheet.set(false);
        this.load(); // refetch - status is now cancelled/refund_due
      },
      error: (err: HttpErrorResponse) => {
        this.cancelling.set(false);
        this.cancelError.set(extractApiErrorMessage(err, 'Could not cancel this booking. Please try again.'));
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.bookingSvc.getBooking(this.id()).subscribe({
      next: (b) => {
        this.booking.set(b);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 404
            ? "This booking doesn't exist or you don't have access to it."
            : extractApiErrorMessage(err, 'Failed to load this booking.'),
        );
      },
    });
  }
}
