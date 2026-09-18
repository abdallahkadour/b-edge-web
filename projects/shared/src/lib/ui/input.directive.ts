import {
  Directive,
  ElementRef,
  computed,
  inject,
  input,
} from '@angular/core';

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

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Associates this control with its visible label.
   *
   * WHY THE DIRECTIVE DOES THIS AND NOT THE TEMPLATES
   *
   * An audit found 99 of 120 form controls with no programmatic label. The
   * markup was almost always this shape:
   *
   *     <label class="block text-xs ...">Account name</label>
   *     <input bedgeInput ... />
   *
   * Visually labelled, programmatically invisible: a screen reader announces
   * "edit text, blank", and tapping the label does not focus the field -
   * which is a loss for everyone, not only assistive-tech users.
   *
   * Fixing it in the templates means 99 edits, and 63 of those sit inside
   * `@for` blocks where a hand-written id would be duplicated across every
   * iteration - an id collision is its own accessibility bug. Doing it here
   * gives every instance a genuinely unique id for free.
   *
   * Deliberately conservative. It only acts when the control has NO id and NO
   * aria-label, and it only claims a label that has no `for` of its own, so
   * it can never override an association someone wrote on purpose. If it
   * finds nothing, it leaves the DOM alone rather than inventing a label -
   * a wrong label is worse than a missing one.
   */
  constructor() {
    const el = this.host.nativeElement;
    if (el.id || el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby')) return;

    const label = this.findLabel(el);
    if (!label) return;

    const id = `bi${Math.random().toString(36).slice(2, 9)}`;
    el.id = id;
    label.setAttribute('for', id);
  }

  /**
   * Finds the label this control belongs to.
   *
   * Two shapes, in order of confidence: the immediately preceding sibling,
   * which is how nearly every form in this codebase is written; then a lone
   * unclaimed label inside the same parent, which covers the cases where a
   * wrapper div sits between them.
   *
   * "Lone" matters - if a parent holds two unclaimed labels there is no way
   * to know which is ours, and guessing would attach the wrong text to the
   * wrong field. Better to leave it.
   */
  private findLabel(el: HTMLElement): HTMLLabelElement | null {
    const prev = el.previousElementSibling;
    if (prev instanceof HTMLLabelElement && !prev.hasAttribute('for')) return prev;

    const parent = el.parentElement;
    if (!parent) return null;
    const free = Array.from(parent.querySelectorAll('label')).filter(
      (l) => !l.hasAttribute('for') && !l.querySelector('input, select, textarea'),
    );
    return free.length === 1 ? (free[0] as HTMLLabelElement) : null;
  }

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
