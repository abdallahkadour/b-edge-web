import { Directive, computed, input } from '@angular/core';

/**
 * Text input styling, as a DIRECTIVE rather than a wrapper component.
 *
 * This is deliberate. A `<bedge-input>` wrapper would need
 * ControlValueAccessor to work with forms, and this codebase uses both
 * reactive forms (login) and template-driven ngModel (hours) - a wrapper
 * would have to support both, and would silently break the `[value]` /
 * `(input)` signal pattern used across the customer PWA. An attribute
 * directive applies the styling to a real native input and stays out of
 * the way of whichever forms API the component already uses.
 *
 * Usage: <input bedgeInput [invalid]="touched() && !isValid()" />
 */
@Directive({
  selector: 'input[bedgeInput], textarea[bedgeInput]',
  standalone: true,
  host: { '[class]': 'classes()' },
})
export class InputDirective {
  readonly invalid = input(false);

  protected readonly classes = computed(() =>
    [
      'w-full px-3.5 rounded-lg border text-[15px] outline-none transition-colors',
      'placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-400',
      // Chrome autofill paints its own background over the design system;
      // the shared stylesheet already neutralises this globally.
      this.invalid() ? 'border-danger' : 'border-gray-200 focus:border-ink',
    ].join(' '),
  );
}
