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
  /** Any CSS length. Required unless `square` is set, in which case the
   *  aspect ratio defines the box. */
  readonly height = input<string>();
  readonly rounded = input<'sm' | 'lg' | 'xl' | 'full'>('lg');
  readonly width = input('100%');
  /** Fills a square rather than taking an explicit height - product photo and
   *  portfolio grids, where the tile is defined by its aspect ratio. */
  readonly square = input(false);

  /**
   * Static lookup, NOT `rounded-${this.rounded()}`.
   *
   * Tailwind's JIT scans source files for literal class strings. An
   * interpolated name is invisible to it, so the class is only ever emitted by
   * coincidence - if some unrelated template happens to use the same value.
   * `rounded-sm` appears literally nowhere in this workspace, so
   * `rounded="sm"` produced a class that was never generated and silently did
   * nothing. It went unnoticed because this component had almost no callers.
   *
   * Spelling every option out puts all four in front of the scanner.
   */
  private static readonly RADIUS: Record<'sm' | 'lg' | 'xl' | 'full', string> = {
    sm: 'rounded-sm',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  protected readonly classes = computed(() =>
    [
      'bg-gray-100 animate-pulse w-full',
      SkeletonComponent.RADIUS[this.rounded()],
      // A skeleton is decorative and must be suppressed for anyone who has
      // asked for less motion; the shape still communicates the layout.
      'motion-reduce:animate-none',
      this.square() ? 'aspect-square' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );
}
