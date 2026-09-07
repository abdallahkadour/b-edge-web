import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { ThemeStore, type ThemePreference } from '../core/theme.store';

interface ThemeOption {
  readonly value: ThemePreference;
  readonly label: string;
}

/**
 * Three-way theme control: Light / Dark / System.
 *
 * A SEGMENTED CONTROL, NOT A SWITCH
 *
 * The preference has three states, and a two-position switch can only show
 * two. The missing one is always `system`, which is the DEFAULT - so a
 * switch forces every user who opens this screen to abandon OS following
 * just by looking at it, with no way back short of clearing site data.
 *
 * WHY INLINE SVG RATHER THAN <lucide-icon>
 *
 * Both apps register their lucide icons individually via
 * LucideAngularModule.pick(). A shared component that named icons would
 * render nothing in whichever app had not added them, and would do so
 * silently, on a settings screen nobody visits during development. Three
 * small paths are cheaper than that failure mode.
 *
 * The colours here come from the same tokens as everything else, so this
 * control re-themes along with the app it is changing.
 *
 * `compact` drops the text labels for placements with no room for them - the
 * customer app's only account surface is the My Bookings header, which
 * already carries two actions. The buttons keep an aria-label in that mode,
 * so what a screen reader announces does not depend on how much space the
 * design had.
 */
@Component({
  selector: 'bedge-theme-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="inline-flex items-center gap-1 p-1 bg-gray-100 rounded-full"
      role="radiogroup"
      aria-label="Colour theme"
    >
      @for (option of options; track option.value) {
        <button
          type="button"
          role="radio"
          [attr.aria-checked]="theme.preference() === option.value"
          [attr.aria-label]="compact() ? option.label : null"
          [class]="buttonClasses(option.value)"
          (click)="theme.set(option.value)"
        >
          <!-- aria-hidden throughout: in the full variant the adjacent text
               already names the option, and in the compact one the button
               carries an aria-label. Either way the glyph is decorative. -->
          <svg
            class="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            @switch (option.value) {
              @case ('light') {
                <circle cx="12" cy="12" r="4" />
                <path
                  d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
                />
              }
              @case ('dark') {
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              }
              @case ('system') {
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              }
            }
          </svg>
          @if (!compact()) {
            {{ option.label }}
          }
        </button>
      }
    </div>
  `,
})
export class ThemeToggleComponent {
  /** Icon-only, for headers and toolbars with no room for three labels. */
  readonly compact = input(false);

  protected readonly theme = inject(ThemeStore);

  protected buttonClasses(value: ThemePreference): string {
    const base = 'flex items-center rounded-full text-xs font-bold transition-colors';
    // Square-ish padding when there is no label, so the pill does not end up
    // wider than it is tall around a 14px glyph.
    const size = this.compact() ? 'p-1.5' : 'gap-1.5 px-3 py-1.5';
    const state =
      this.theme.preference() === value
        ? 'bg-white text-ink shadow-sm'
        : 'text-gray-500 hover:text-ink';
    return `${base} ${size} ${state}`;
  }

  protected readonly options: readonly ThemeOption[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];
}
