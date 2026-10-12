import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { BookingDataService, ButtonComponent, extractApiErrorMessage } from '@bedge/shared';
import type { EnrichedBooking, ReassignCandidate } from '@bedge/shared';

/** The API's reasons, in the owner's words. */
const WHY: Record<string, string> = {
  NOT_OFFERED: "doesn't offer this service",
  NOT_AT_STORE: "doesn't work at this location",
  NOT_ACCEPTING: "isn't taking bookings right now",
  NOT_FREE: 'is not free at this time',
};

/**
 * Move to another artist (2026-10-10).
 *
 * The salon owner hands an upcoming booking to someone else in the salon -
 * an artist off sick, a swap. Every other artist is listed: the ones who can
 * take it can be picked, the others say why not (she doesn't offer the
 * service, doesn't work at this location, isn't free) - an artist silently
 * missing from the list reads as a bug. The client keeps the price she agreed
 * whatever the new artist charges, and the sheet says so. A refusal (someone
 * took the time since the list loaded) reloads the list rather than leave a
 * stale "can take it".
 */
@Component({
  selector: 'bedge-reassign-sheet',
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div role="dialog" aria-modal="true" aria-labelledby="reassign-title" class="p-5">
      <h2 id="reassign-title" class="text-base font-bold text-ink">Move to another artist</h2>
      <p class="text-sm text-gray-500 mt-1">
        {{ booking().customer_name }} · {{ booking().service_name }} · now with {{ booking().artist_name }}
      </p>

      @if (loading()) {
        <p class="text-sm text-gray-400 py-6">Checking who is free…</p>
      } @else {
        <ul class="mt-4 divide-y divide-gray-100 rounded-lg border border-gray-200" role="radiogroup" aria-labelledby="reassign-title">
          @for (c of candidates(); track c.artist_id) {
            <li>
              <label class="flex items-center gap-3 px-4 py-3" [class.opacity-60]="!c.eligible"
                [class.cursor-pointer]="c.eligible">
                <input type="radio" name="reassign-to" [value]="c.artist_id" [disabled]="!c.eligible"
                  [checked]="picked() === c.artist_id" (change)="picked.set(c.artist_id)" />
                <span class="flex-1 text-sm">
                  <span class="font-semibold text-ink">{{ c.name }}</span>
                  @if (!c.eligible) {
                    <span class="text-gray-500"> — {{ why(c.reason) }}</span>
                  }
                </span>
                @if (c.eligible && differs(c.price)) {
                  <span class="text-xs text-gray-500 tabular-nums">her price \${{ c.price }}</span>
                }
              </label>
            </li>
          } @empty {
            <li class="px-4 py-6 text-sm text-gray-400">Nobody else in the salon can take this booking.</li>
          }
        </ul>
        <p class="text-xs text-gray-500 mt-3 max-w-prose">
          The client keeps her price of \${{ booking().final_price }}, and any deposit stays where it was paid.
          She and both artists are sent a message; it's worth calling her too.
        </p>
      }

      @if (error(); as e) {
        <p role="alert" class="mt-3 text-sm text-danger-dark">{{ e }}</p>
      }

      <div class="mt-4 flex gap-2 justify-end">
        <bedge-button variant="ghost" size="sm" (click)="closed.emit()">Keep it</bedge-button>
        <bedge-button size="sm" [disabled]="!picked() || saving()" [loading]="saving()" (click)="move()">Move booking</bedge-button>
      </div>
    </div>
  `,
})
export class ReassignSheetComponent implements OnInit {
  private readonly bookings = inject(BookingDataService);

  readonly booking = input.required<EnrichedBooking>();
  /** The name of the artist it went to, for the screen's confirmation. */
  readonly moved = output<string>();
  readonly closed = output<void>();

  readonly candidates = signal<ReassignCandidate[]>([]);
  readonly picked = signal<string | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected why(reason?: string): string {
    return (reason && WHY[reason]) || 'is not available';
  }

  protected differs(price: string): boolean {
    return (parseFloat(price) || 0) !== (parseFloat(this.booking().final_price) || 0);
  }

  move(): void {
    const to = this.picked();
    if (!to || this.saving()) return;
    const name = this.candidates().find((c) => c.artist_id === to)?.name ?? '';
    this.saving.set(true);
    this.error.set(null);
    this.bookings.reassign(this.booking().id, to).subscribe({
      next: () => {
        this.saving.set(false);
        this.moved.emit(name);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.error.set(extractApiErrorMessage(err, 'Could not move the booking.'));
        this.picked.set(null);
        this.load();
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.bookings.getReassignCandidates(this.booking().id).subscribe({
      next: (list) => {
        this.candidates.set(list);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(extractApiErrorMessage(err, 'Could not check who is free.'));
      },
    });
  }
}
