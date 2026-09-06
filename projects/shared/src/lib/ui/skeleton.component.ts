import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * A loading placeholder.
 *
 * WHY IT EXISTS
 *
 * `animate-pulse` appears 50 times across 19 templates, each with its own
 * height, rounding and background shade. That is not a design decision
 * repeated; it is the same decision re-made 50 times, and the shades had
 * drifted between gray-100 and gray-200.
 *
 * WHY IT TAKES A HEIGHT RATHER THAN CLASSES
 *
 * A skeleton exists to reserve the space its real content will occupy. Making
 * height the required input rather than something the caller styles in makes
 * that its job rather than an afterthought — a skeleton shorter than its
 * content is a layout shift wearing a disguise.
 */
@Component({
  selector: 'bedge-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [class]="classes()" [style.height]="height()" aria-hidden="true"></div>`,
})
export class SkeletonComponent {
  /** Any CSS length. Required: see the class doc for why. */
  readonly height = input.required<string>();
  readonly rounded = input<'sm' | 'lg' | 'xl' | 'full'>('lg');
  readonly width = input('100%');

  protected readonly classes = computed(
    () => `bg-gray-100 animate-pulse rounded-${this.rounded()} w-full`,
  );
}
