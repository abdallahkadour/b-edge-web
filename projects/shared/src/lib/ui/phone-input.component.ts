import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';

import {
  DEFAULT_PHONE_ISO,
  PHONE_COUNTRIES,
  isValidNationalPhone,
  phoneCountry,
  phoneHint,
  stripToDigits,
  toE164,
} from '../core/phone.util';

/**
 * A phone field with a country selector.
 *
 * Replaces four hand-rolled copies of `<span>+961</span>` beside an input —
 * which is what made the app Lebanon-only in practice even after the backend
 * could accept more.
 *
 * WHY A <select> AND NOT A CUSTOM DROPDOWN
 *
 * The native control gets a platform picker on both iOS and Android, is
 * keyboard-accessible and screen-reader-labelled for free, and cannot be
 * clipped by a parent's overflow. A custom listbox here would be work spent
 * reproducing what the platform already does better — and the codebase
 * already has twelve hand-rolled overlays it does not need a thirteenth of.
 *
 * TWO VALUES OUT, DELIBERATELY
 *
 * `digits` is what the person typed, which the parent needs for display and
 * for its own validity checks. `e164` is what goes to the API. Emitting only
 * the second would force every caller to re-derive the first.
 */
@Component({
  selector: 'bedge-phone-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-stretch rounded-lg border bg-white overflow-hidden transition-colors"
         [class.border-danger]="showError()"
         [class.border-gray-200]="!showError()">
      <!-- The label is visually hidden rather than absent: the select shows a
           flag and a dial code, which a screen reader would otherwise
           announce as an unlabelled combobox full of numbers. -->
      <label class="sr-only" [attr.for]="selectId">Country</label>
      <select
        [id]="selectId"
        class="min-h-11 pl-3 pr-1 text-sm font-medium text-ink bg-transparent border-0
               outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px]
               focus-visible:outline-ink"
        [value]="iso()"
        (change)="onCountry($any($event.target).value)"
      >
        @for (c of countries; track c.iso) {
          <option [value]="c.iso">{{ c.flag }} +{{ c.code }}</option>
        }
      </select>

      <input
        [id]="inputId"
        type="tel"
        inputmode="numeric"
        autocomplete="tel-national"
        [attr.aria-describedby]="showError() ? inputId + '-err' : null"
        [attr.aria-invalid]="showError() ? 'true' : null"
        class="flex-1 min-w-0 min-h-11 px-3 text-base text-ink bg-transparent border-0
               placeholder:text-gray-400
               outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px]
               focus-visible:outline-ink"
        [placeholder]="placeholder()"
        [value]="digits()"
        (input)="onDigits($any($event.target).value)"
        (blur)="touched.set(true)"
      />
    </div>

    @if (showError()) {
      <p [id]="inputId + '-err'" role="alert" class="text-xs text-danger-dark mt-1">
        {{ hint() }}
      </p>
    }
  `,
})
export class PhoneInputComponent {
  /** Two-way: the national digits, without country code or separators. */
  readonly digits = model<string>('');
  /** Two-way: the selected country. */
  readonly iso = model<string>(DEFAULT_PHONE_ISO);
  /** Suppresses the error until the field has been used at least once. */
  readonly forceTouched = input(false);

  protected readonly countries = PHONE_COUNTRIES;
  protected readonly touched = signal(false);

  // Generated per instance so a caller never has to invent unique ids — the
  // step that gets skipped, and the reason 93 controls in this codebase have
  // no working label.
  protected readonly inputId = `ph${Math.random().toString(36).slice(2, 9)}`;
  protected readonly selectId = this.inputId + '-cc';

  protected readonly valid = computed(() => isValidNationalPhone(this.digits(), this.iso()));
  protected readonly showError = computed(
    () => (this.touched() || this.forceTouched()) && this.digits().length > 0 && !this.valid(),
  );
  protected readonly hint = computed(() => phoneHint(this.iso()));
  protected readonly placeholder = computed(() =>
    phoneCountry(this.iso()).iso === 'LB' ? '71 900 001' : 'Mobile number',
  );

  /** The value to send to the API. */
  readonly e164 = computed(() => toE164(this.digits(), this.iso()));
  readonly isValid = computed(() => this.valid());

  protected onDigits(raw: string): void {
    this.digits.set(stripToDigits(raw));
  }

  protected onCountry(iso: string): void {
    this.iso.set(iso);
    // Re-run the cap: Egypt allows 10 digits, Qatar 8. Switching down must
    // not leave two orphan digits that silently fail validation.
    this.digits.set(stripToDigits(this.digits()));
  }
}
