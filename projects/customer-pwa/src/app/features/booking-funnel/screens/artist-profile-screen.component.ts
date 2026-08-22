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

  /** Emits when the rating badge is tapped - same pattern as openShop. */
  readonly openReviews = output<void>();

  /**
   * Emits when the back/home button is tapped. This screen is the primary
   * entry point for a shared link (Instagram bio, WhatsApp) - most
   * visitors land here directly, with no Discover page anywhere in their
   * browser history for the back button to return to. Without an in-app
   * way home, a customer who wants to browse other artists has no path
   * but manually editing the URL. The container owns navigation, same
   * pattern as openShop/openReviews.
   */
  readonly goHome = output<void>();

  protected hasDeposit(service: Service): boolean {
    return Number(service.deposit_amount) > 0;
  }
}
