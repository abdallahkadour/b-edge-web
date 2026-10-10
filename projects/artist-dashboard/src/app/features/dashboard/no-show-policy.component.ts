import { ChangeDetectionStrategy, Component, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { InputDirective, PayoutDataService, extractApiErrorMessage } from '@bedge/shared';

/**
 * The salon's no-show deposit rule (decision D29), on the payment details
 * screen because it is a deposit setting: after how many missed appointments
 * at this salon in the last 12 months a customer pays half the price as a
 * deposit to book a service that takes none. Saved the moment it changes;
 * only the owner may change it (the API refuses a member, and that refusal is
 * shown rather than hidden).
 */
@Component({
  selector: 'bedge-no-show-policy',
  standalone: true,
  imports: [InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mt-8 rounded-xl border border-gray-200 bg-white p-4">
      <h2 class="text-sm font-bold text-ink">Missed appointments</h2>
      <p class="text-xs text-gray-500 mt-1 leading-relaxed">
        A customer who has missed this many appointments at your salon in the last 12 months pays a deposit of
        half the price to book a service that has no deposit. Services that already take a deposit are not changed.
      </p>
      <label for="no-show-after" class="block text-xs font-medium text-gray-500 mt-3 mb-1">Ask for a deposit after</label>
      <!-- [selected] on each option, not [value] on the select: the select's
           value is bound before @for has rendered its options, so the browser
           fell back to the first one and showed "Never (off)" for a salon
           whose rule was on - caught by this component's spec. -->
      <select #sel id="no-show-after" bedgeInput class="h-9 text-sm w-full max-w-60"
        [disabled]="saving()" (change)="change($any($event.target).value)">
        @for (o of options; track o.value) {
          <option [value]="o.value.toString()" [selected]="o.value === after()">{{ o.label }}</option>
        }
      </select>
      @if (saved()) {
        <p role="status" class="text-xs text-success-dark mt-2">Saved.</p>
      }
      @if (error(); as e) {
        <p role="alert" class="text-xs text-danger-dark mt-2">{{ e }}</p>
      }
    </section>
  `,
})
export class NoShowPolicyComponent implements OnInit {
  private readonly api = inject(PayoutDataService);

  protected readonly options = [
    { value: 0, label: 'Never (off)' },
    { value: 1, label: '1 missed appointment' },
    { value: 2, label: '2 missed appointments' },
    { value: 3, label: '3 missed appointments' },
    { value: 4, label: '4 missed appointments' },
    { value: 5, label: '5 missed appointments' },
  ];

  readonly after = signal(2);
  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly error = signal<string | null>(null);
  private readonly sel = viewChild<ElementRef<HTMLSelectElement>>('sel');

  ngOnInit(): void {
    this.api.getNoShowPolicy().subscribe({
      next: (p) => this.after.set(p.after),
      error: () => this.error.set('Could not load this setting.'),
    });
  }

  change(raw: string): void {
    const next = Number(raw);
    const previous = this.after();
    if (next === previous || this.saving()) return;
    this.after.set(next);
    this.saving.set(true);
    this.saved.set(false);
    this.error.set(null);
    this.api.setNoShowPolicy(next).subscribe({
      next: (p) => {
        this.after.set(p.after);
        this.saving.set(false);
        this.saved.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.after.set(previous);
        // The DOM holds her choice; when the value goes back to what was last
        // rendered, Angular sees no change to apply, so put it back by hand.
        const el = this.sel()?.nativeElement;
        if (el) el.value = previous.toString();
        this.saving.set(false);
        this.error.set(extractApiErrorMessage(err, 'Could not save this setting.'));
      },
    });
  }
}
