import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Surface container.
 *
 * The card shell (`bg-white border border-gray-* rounded-* p-*`) appeared
 * with four different border shades and three different radii across the
 * two apps. One of those, `border-gray-150`, is not a real Tailwind class
 * and never was - it silently rendered with no border at all. That is the
 * failure mode this component exists to prevent: a typo in a class string
 * produces no error, no warning, and a slightly wrong screen nobody
 * notices for months.
 */
@Component({
  selector: 'bedge-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [class]="classes()"><ng-content /></div>`,
})
export class CardComponent {
  /** `padded` is the default; `flush` is for cards owning their own layout. */
  readonly padding = input<'padded' | 'flush'>('padded');
  readonly interactive = input(false);

  protected readonly classes = computed(() =>
    [
      'bg-white border border-gray-200 rounded-xl',
      this.padding() === 'padded' ? 'p-4' : '',
      this.interactive() ? 'hover:border-gray-300 transition-colors cursor-pointer' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );
}
