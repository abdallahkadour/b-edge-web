import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

/**
 * "There is nothing here yet."
 *
 * WHY IT EXISTS
 *
 * Ten screens hand-rolled this: my-orders, my-bookings, reviews, clients,
 * client-detail, services, products, earnings, portfolio and the artist's
 * review list. Each had its own icon size, heading weight, hint colour and
 * vertical padding, so the same moment — a new artist opening a screen for the
 * first time — looked different on every one of them.
 *
 * An empty state is the FIRST thing a new user sees on most of these screens,
 * which makes consistency here worth more than on a screen full of data.
 *
 * WHY THE ACTION IS PROJECTED, NOT AN INPUT
 *
 * Some empty states offer a next step ("Add your first service") and some
 * genuinely have none ("No reviews yet" — the artist cannot make one appear).
 * Projecting the action means a screen with nothing useful to offer simply
 * omits it, rather than passing an empty string to a button input.
 */
@Component({
  selector: 'bedge-empty-state',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center text-center px-6 py-12">
      @if (icon()) {
        <div
          class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-400"
        >
          <lucide-icon [name]="icon()!" [size]="22" [strokeWidth]="1.5" />
        </div>
      }

      <p class="text-sm font-semibold text-ink">{{ title() }}</p>

      @if (hint()) {
        <p class="text-xs text-gray-400 mt-1 max-w-[260px] leading-relaxed">{{ hint() }}</p>
      }

      <div class="mt-5 empty:hidden"><ng-content /></div>
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  /** One line explaining what would put something here. Optional. */
  readonly hint = input<string>();
  /** A lucide icon name. Omitted entirely rather than defaulted — a wrong
   *  icon is worse than none. */
  readonly icon = input<string>();
}
