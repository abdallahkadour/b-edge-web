import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import type { Service } from '@bedge/shared';

/**
 * Step 2 of the guest funnel — pick one service.
 * Mirrors SelectServiceScreen.tsx from the AI Studio reference build.
 *
 * Services are passed in rather than fetched: the profile screen has already
 * loaded them, and refetching here would double the request count for no gain.
 */
@Component({
  selector: 'app-select-service-screen',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './select-service-screen.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectServiceScreenComponent {
  readonly artistName = input.required<string>();
  readonly services = input.required<Service[]>();
  readonly selectedServiceId = input<string | null>(null);

  readonly selectService = output<string>();
  readonly back = output<void>();
  readonly continue = output<void>();

  protected readonly canContinue = computed(() => this.selectedServiceId() !== null);

  /**
   * Renders a duration in minutes as human copy: "45 min", "1 Hour",
   * "1 Hour 30 min", "2 Hours". Services are not guaranteed to fall on
   * clean hour boundaries — the live catalogue has 53- and 65-minute
   * entries — so a naive min/60 would render "0.88 Hours".
   */
  protected formatDuration(min: number): string {
    if (min < 60) return `${min} min`;

    const hours = Math.floor(min / 60);
    const rest = min % 60;
    const hourLabel = hours === 1 ? '1 Hour' : `${hours} Hours`;

    return rest === 0 ? hourLabel : `${hourLabel} ${rest} min`;
  }

  protected hasDeposit(service: Service): boolean {
    return Number(service.deposit_amount) > 0;
  }
}
