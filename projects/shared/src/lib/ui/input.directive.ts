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
      'w-full px-3.5 rounded-lg border text-base transition-colors',
      'placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-400',
      // KEYBOARD FOCUS — WCAG 2.2 SC 2.4.11 Focus Appearance.
      //
      // This previously carried `outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink` with no replacement, so the
      // only focus indicator anywhere in the app was the 1px border colour
      // change below. SC 2.4.11 requires an indicator at least as large as a
      // 2px perimeter with 3:1 contrast against what is adjacent; a 1px border
      // does not meet it, and 28 controls across the workspace inherited that.
      //
      // `focus-visible`, not `focus`: the ring should appear for keyboard
      // users and not on every mouse click. Styling `focus` is why people
      // reach for `outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink` in the first place.
      //
      // `outline`, not `ring`: a ring is a box-shadow and is clipped by
      // `overflow-hidden` on a parent, which is exactly what surrounds most of
      // these inputs. An outline is not.
      'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
      // Chrome autofill paints its own background over the design system;
      // the shared stylesheet already neutralises this globally.
      this.invalid() ? 'border-danger' : 'border-gray-200 focus:border-ink',
    ].join(' '),
  );
}
