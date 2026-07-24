import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';

import { ArtistDataService, MediaDataService } from '@bedge/shared';
import type { Artist, Service, Store, MediaItem } from '@bedge/shared';

import { ArtistProfileScreenComponent } from './screens/artist-profile-screen.component';
import { SelectServiceScreenComponent } from './screens/select-service-screen.component';
import { PickDatetimeScreenComponent } from './screens/pick-datetime-screen.component';

type FunnelStep = 'profile' | 'select-service' | 'pick-datetime' | 'details' | 'confirmed';

/**
 * Container for the guest booking funnel. Routed at /book/:artistId.
 *
 * Owns the artist data and the in-progress booking draft. The screens below
 * are presentational — they receive data and emit intent, they do not fetch.
 * Data lives here because more than one screen needs the same artist, service
 * list, and store list; fetching per-screen would duplicate requests and let
 * the screens drift out of sync.
 *
 * Deliberately NOT routed per-step: a live 10-minute slot hold should not be
 * addressable by URL, or browser back/forward lands the customer on a stale
 * step holding an expired booking ID.
 */
@Component({
  selector: 'app-booking-funnel-page',
  standalone: true,
  imports: [
    ArtistProfileScreenComponent,
    SelectServiceScreenComponent,
    PickDatetimeScreenComponent,
  ],
  templateUrl: './booking-funnel.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingFunnelPage implements OnInit {
  private readonly artistApi = inject(ArtistDataService);
  private readonly mediaApi = inject(MediaDataService);

  readonly artistId = input.required<string>();

  // ── Loaded data ────────────────────────────────────────────────────────────
  protected readonly artist = signal<Artist | null>(null);
  protected readonly services = signal<Service[]>([]);
  protected readonly stores = signal<Store[]>([]);
  protected readonly portfolio = signal<MediaItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);

  // ── Booking draft ──────────────────────────────────────────────────────────
  protected readonly step = signal<FunnelStep>('profile');
  protected readonly selectedServiceId = signal<string | null>(null);
  protected readonly selectedStoreId = signal<string | null>(null);
  protected readonly selectedStartTime = signal<string | null>(null);

  protected readonly selectedService = computed(
    () => this.services().find((s) => s.id === this.selectedServiceId()) ?? null,
  );

  /**
   * Loads in ngOnInit rather than a constructor effect.
   *
   * artistId is bound by the router via withComponentInputBinding(), and on a
   * lazily-loaded route an effect created in the constructor can run before
   * the router has written that input — which throws NG0950 on a required
   * input. ngOnInit is guaranteed to run after inputs are set. Nothing is
   * lost: the route parameter cannot change without a fresh navigation, so
   * there is no reactivity to preserve here.
   */
  ngOnInit(): void {
    const id = this.artistId();

    // The artist call gates the screen: without it there is nothing to show.
    // Services, stores, and portfolio degrade quietly — empty is a valid state.
    this.artistApi.getArtistById(id).subscribe({
      next: (artist) => {
        this.artist.set(artist);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });

    this.artistApi.getServicesByArtist(id).subscribe({
      next: (services) => this.services.set(services),
    });

    this.artistApi.getStoresByArtist(id).subscribe({
      next: (stores) => this.stores.set(stores),
    });

    this.mediaApi.getPortfolio(id).subscribe({
      next: (res) => this.portfolio.set(res.photos ?? []),
    });
  }

  /**
   * Tapping a specific service row on the profile skips select-service and
   * jumps straight to pick-datetime with that service chosen. Tapping the
   * bottom CTA instead lands on select-service with nothing pre-selected.
   */
  protected onProfileContinue(preSelectedServiceId?: string): void {
    if (preSelectedServiceId) {
      this.selectedServiceId.set(preSelectedServiceId);
      this.step.set('pick-datetime');
    } else {
      this.step.set('select-service');
    }
  }

  /** Records the chosen store and slot, then advances to the details form. */
  protected onSlotChosen(choice: { storeId: string; startTime: string }): void {
    this.selectedStoreId.set(choice.storeId);
    this.selectedStartTime.set(choice.startTime);
    this.step.set('details');
  }
}
