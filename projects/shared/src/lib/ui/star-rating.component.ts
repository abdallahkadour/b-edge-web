import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

export type StarTone = 'primary' | 'muted';

/**
 * A 1–5 star rating, readable or pickable.
 *
 * WHY IT EXISTS
 *
 * The star loop was written six times — discover, artist profile, the review
 * list, the review form, the artist's calendar and the artist's review
 * moderation view — each with its own size, stroke width and fill classes.
 * Sprint 8 made it worse rather than better: dual-layer reviews added a SECOND
 * loop to two of those templates, so one file now had two near-identical
 * copies differing only in size and colour.
 *
 * They had already drifted. Read-only stars used `[strokeWidth]="0"` with
 * `fill-gray-200` for empties; interactive ones used `[strokeWidth]="2"` with
 * `stroke-gray-300 fill-none`. Both are defensible; having both, unlabelled,
 * on screens a customer sees minutes apart is not.
 *
 * ACCESSIBILITY WAS THE REAL GAP
 *
 * None of the six copies exposed a role or an accessible value. A screen
 * reader encountered five identical icons and no rating. This component
 * announces "Artist rating: 4 of 5" when read-only, and behaves as a
 * radiogroup when interactive.
 *
 * TONE IS NOT DECORATION
 *
 * `primary` rates the specialist, `muted` rates the venue. Those two scores
 * are independent and are ALLOWED to disagree — a great stylist in a tired
 * room is real and useful information — so they must stay visually distinct
 * or the disagreement reads as a bug. See
 * B-Edge-Review-Attribution-Spec-v1.md §2.2.
 */
@Component({
  selector: 'bedge-star-rating',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex items-center"
      [class.gap-0.5]="!interactive()"
      [class.gap-2]="interactive()"
      [attr.role]="interactive() ? 'radiogroup' : 'img'"
      [attr.aria-label]="ariaLabel()"
    >
      @for (star of stars; track star) {
        @if (interactive()) {
          <button
            type="button"
            class="p-1 active:scale-125 transition-transform"
            role="radio"
            [attr.aria-checked]="value() === star"
            [attr.aria-label]="star + ' star' + (star > 1 ? 's' : '')"
            (click)="pick.emit(star)"
          >
            <lucide-icon
              name="star"
              [size]="size()"
              [strokeWidth]="2"
              [class]="value() >= star ? onClass() : 'stroke-gray-300 fill-none'"
            />
          </button>
        } @else {
          <lucide-icon
            name="star"
            [size]="size()"
            [strokeWidth]="0"
            [class]="value() >= star ? onClass() : 'text-gray-200 fill-gray-200'"
          />
        }
      }
    </div>
  `,
})
export class StarRatingComponent {
  /** 0 means unrated. Renders as five empty stars, never as an error. */
  readonly value = input.required<number>();
  readonly size = input(14);
  readonly tone = input<StarTone>('primary');
  /**
   * `booleanAttribute` so the bare attribute works — `<bedge-star-rating
   * interactive />` reads far better at a call site than
   * `[interactive]="true"`, and without the transform Angular passes the
   * empty string and TypeScript rejects it.
   */
  readonly interactive = input(false, { transform: booleanAttribute });

  /**
   * What this rating is OF — "Artist", "Salon". Used in the accessible name,
   * so it should read naturally in "Artist rating: 4 of 5".
   */
  readonly label = input('Rating');

  readonly pick = output<number>();

  protected readonly stars = [1, 2, 3, 4, 5] as const;

  protected readonly onClass = computed(() =>
    this.tone() === 'primary' ? 'text-ink fill-ink' : 'text-gray-500 fill-gray-500',
  );

  /**
   * Interactive stars are a control and announce only their purpose; the
   * current value comes from the checked radio. Read-only stars are an image
   * and must announce the value itself, because there is nothing else to read.
   */
  protected readonly ariaLabel = computed(() =>
    this.interactive() ? this.label() : `${this.label()}: ${this.value()} of 5`,
  );
}
