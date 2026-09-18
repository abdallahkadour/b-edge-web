import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { ReportDataService, extractApiErrorMessage } from '@bedge/shared';
import type { ReportCategory, ReportCategoryOption } from '@bedge/shared';

/**
 * Raising a problem about a booking.
 *
 * WHY THIS IS NOT A SUPPORT FORM
 *
 * B-Edge has no card rails. There is no chargeback and no escrow, so when a
 * deposit reaches the wrong person this is the only recourse a client has. The
 * reasons offered are the threat model rather than generic support topics, and
 * the first one - being asked to pay details other than the ones in the app -
 * is the tripwire for the attack the payment destination exists to prevent.
 *
 * Collapsed until asked for. Most people opening a booking are not in trouble,
 * and a permanently expanded complaint form on an appointment they are looking
 * forward to reads as an expectation that something will go wrong.
 */
@Component({
  selector: 'app-report-problem',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!open()) {
      <button
        type="button"
        class="text-[13px] text-gray-400 font-medium underline"
        (click)="openForm()"
      >Report a problem</button>
    } @else if (submitted()) {
      <div class="rounded-lg border border-gray-200 bg-white p-4">
        <p class="text-sm font-semibold text-ink">Thanks — we have this.</p>
        <p class="text-[13px] text-gray-500 mt-1 leading-[18px]">
          Someone from B-Edge will look into it. You can see the status of anything you
          have reported from this screen.
        </p>
      </div>
    } @else {
      <div class="rounded-lg border border-gray-200 bg-white p-4">
        <p class="text-sm font-semibold text-ink mb-1">Report a problem</p>
        <p class="text-xs text-gray-500 mb-3 leading-[18px]">
          Tell us what happened. If money is involved, include the reference from your
          transfer.
        </p>

        <label class="block text-xs text-gray-400 mb-1" for="report-reason">Reason</label>
        <select
          id="report-reason"
          class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-ink mb-3"
          [value]="category() ?? ''"
          (change)="category.set($any($event.target).value)"
        >
          <option value="" disabled>Choose a reason</option>
          @for (c of categories(); track c.id) {
            <option [value]="c.id">{{ c.label }}</option>
          }
        </select>

        <label class="block text-xs text-gray-400 mb-1" for="report-detail">
          What happened?
        </label>
        <textarea
          id="report-detail"
          rows="4"
          class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-ink mb-1"
          placeholder="Include dates, amounts and any reference numbers."
          [value]="description()"
          (input)="description.set($any($event.target).value)"
        ></textarea>
        <p class="text-xs text-gray-400 mb-3">At least a sentence, so we can act on it.</p>

        @if (error(); as e) {
          <p class="text-[13px] text-danger-dark mb-3">{{ e }}</p>
        }

        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 h-11 rounded-lg bg-ink text-white text-sm font-bold disabled:opacity-40"
            [disabled]="!canSubmit() || submitting()"
            (click)="submit()"
          >{{ submitting() ? 'Sending…' : 'Send report' }}</button>
          <button
            type="button"
            class="h-11 px-4 rounded-lg border border-gray-200 text-sm text-ink"
            (click)="cancel()"
          >Cancel</button>
        </div>
      </div>
    }
  `,
})
export class ReportProblemComponent {
  private readonly api = inject(ReportDataService);

  readonly bookingId = input.required<string>();

  protected readonly open = signal(false);
  protected readonly submitted = signal(false);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly categories = signal<ReportCategoryOption[]>([]);
  protected readonly category = signal<ReportCategory | null>(null);
  protected readonly description = signal('');

  /** Mirrors the API's minimum so Send is not offered for a request the
   *  server will refuse. The server remains the guarantee. */
  protected readonly canSubmit = computed(
    () => !!this.category() && this.description().trim().length >= 10,
  );

  protected openForm(): void {
    this.open.set(true);
    this.error.set(null);
    // Fetched on open rather than on load: most people never open this, and
    // the booking screen should not pay for a request it usually does not need.
    if (this.categories().length === 0) {
      this.api.listCategories().subscribe({
        next: (list) => this.categories.set(list),
        error: () => this.error.set('Could not load the list of reasons. Please try again.'),
      });
    }
  }

  protected cancel(): void {
    this.open.set(false);
    this.error.set(null);
  }

  protected submit(): void {
    const category = this.category();
    if (!category || !this.canSubmit() || this.submitting()) return;

    this.submitting.set(true);
    this.error.set(null);
    this.api
      .create({
        booking_id: this.bookingId(),
        category,
        description: this.description().trim(),
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.submitted.set(true);
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          this.error.set(
            extractApiErrorMessage(err, 'Could not send that report. Please try again.'),
          );
        },
      });
  }
}
