import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import type { Artist, Service, MediaItem } from '@bedge/shared';

/**
 * Public artist profile - the screen a customer lands on from a shared link.
 * Mirrors ArtistProfileScreen.tsx from the AI Studio reference build.
 *
 * Presentational only. The funnel container owns the data and the step machine.
 */
@Component({
  selector: 'app-artist-profile-screen',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './artist-profile-screen.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtistProfileScreenComponent {
  readonly artist = input.required<Artist>();
  readonly services = input.required<Service[]>();
  readonly portfolio = input.required<MediaItem[]>();

  /**
   * Emits a service ID when a service row is tapped (skip ahead to
   * pick-datetime), or undefined when the bottom CTA is tapped (go to
   * select-service with nothing chosen).
   */
  readonly continueWith = output<string | undefined>();

  /** Emits when the "Shop" entry point is tapped. The container owns
   *  navigation to /shop/:artistId, matching how continueWith is handled
   *  rather than routing directly from this presentational component. */
  readonly openShop = output<void>();

  protected hasDeposit(service: Service): boolean {
    return Number(service.deposit_amount) > 0;
  }
}
