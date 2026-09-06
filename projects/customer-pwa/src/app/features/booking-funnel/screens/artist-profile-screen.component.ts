import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

import { BadgeComponent, LocationMapComponent } from '@bedge/shared';
import type { BadgeTone } from '@bedge/shared';
import type { Artist, PublicService, MediaItem, DiscoveryStoreCard } from '@bedge/shared';

/**
 * Public artist profile - the screen a customer lands on from a shared link.
 * Mirrors ArtistProfileScreen.tsx from the AI Studio reference build.
 *
 * Presentational only. The funnel container owns the data and the step machine.
 */
@Component({
  selector: 'app-artist-profile-screen',
  standalone: true,
  imports: [LucideAngularModule, BadgeComponent, LocationMapComponent, NgOptimizedImage],
  templateUrl: './artist-profile-screen.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtistProfileScreenComponent {
  readonly artist = input.required<Artist>();
  readonly services = input.required<PublicService[]>();
  readonly portfolio = input.required<MediaItem[]>();
  /**
   * Display-only store cards from the public discovery profile. Optional,
   * and empty is a valid state - the container loads them separately from
   * the artist, and a failure there must degrade to no location section
   * rather than blocking the profile.
   */
  readonly stores = input<DiscoveryStoreCard[]>([]);

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

  // ── Portfolio filtering ────────────────────────────────────────────────────
  //
  // "Browse the look, book the look": a customer who likes a photo can tap
  // it and land in the funnel on the service that produced it, instead of
  // scrolling back up and guessing which menu item matches.
  //
  // No new data plumbing was needed — this screen already receives both
  // services and portfolio, and already emits continueWith(serviceId).

  /** Currently selected filter chip, or null for "All". */
  protected readonly activeFilter = signal<string | null>(null);

  /**
   * Only services that actually have a tagged photo get a chip. A filter
   * that leads to an empty gallery is worse than no filter — it reads as a
   * broken page rather than an empty category.
   */
  protected readonly filterableServices = computed(() => {
    const tagged = new Set<string>();
    for (const photo of this.portfolio()) {
      for (const id of photo.service_ids ?? []) tagged.add(id);
    }
    return this.services().filter((s) => tagged.has(s.id));
  });

  protected readonly visiblePortfolio = computed(() => {
    const active = this.activeFilter();
    if (!active) return this.portfolio();
    return this.portfolio().filter((p) => (p.service_ids ?? []).includes(active));
  });

  protected setFilter(serviceId: string | null): void {
    // Tapping the active chip again clears it, so the filter is always
    // escapable without hunting for the "All" chip.
    this.activeFilter.set(this.activeFilter() === serviceId ? null : serviceId);
  }

  /**
   * Tapping a photo enters the funnel on the service it depicts.
   *
   * With a filter active that service is unambiguous. Without one, a photo
   * tagged to exactly one service is still unambiguous; a photo tagged to
   * several is not, so it does nothing rather than guessing wrong and
   * sending someone into a booking for the wrong treatment.
   */
  protected onPhotoTap(photo: MediaItem): void {
    const active = this.activeFilter();
    if (active) {
      this.continueWith.emit(active);
      return;
    }
    const ids = photo.service_ids ?? [];
    if (ids.length === 1) this.continueWith.emit(ids[0]);
  }

  protected isPhotoTappable(photo: MediaItem): boolean {
    return !!this.activeFilter() || (photo.service_ids ?? []).length === 1;
  }

  protected hasDeposit(service: PublicService): boolean {
    return Number(service.deposit_amount) > 0;
  }

  /**
   * Whether to show an open/closed badge at all.
   *
   * `unknown` deliberately shows nothing. It means the hours could not be
   * resolved — usually that the artist never filled them in — and a
   * "Closed" pill in that case would tell a customer the salon is shut
   * when nobody actually said so, costing the artist the booking.
   */
  protected showsOpenBadge(store: DiscoveryStoreCard): boolean {
    return store.open_status.reason !== 'unknown';
  }

  protected openTone(store: DiscoveryStoreCard): BadgeTone {
    return store.open_status.is_open ? 'success' : 'muted';
  }

  /**
   * Short label for the badge itself. The detail (when it opens or closes)
   * goes in the line underneath, so the pill stays scannable.
   */
  protected openLabel(store: DiscoveryStoreCard): string {
    return store.open_status.is_open ? 'Open now' : 'Closed';
  }

  /**
   * The supporting line under the badge, or null when there is nothing
   * useful to add.
   *
   * Times are formatted in the STORE's timezone, not the device's. A
   * customer browsing from abroad — which, given Instagram reach and the
   * Lebanese diaspora, is a real case — must see the salon's local opening
   * time, not that time shifted into wherever their phone happens to be.
   */
  protected openDetail(store: DiscoveryStoreCard): string | null {
    const s = store.open_status;
    if (s.reason === 'holiday') return 'Closed today for a holiday';
    if (s.is_open && s.closes_at) return `Closes ${this.storeTime(s.closes_at)}`;
    if (!s.is_open && s.opens_at) return `Opens ${this.storeTime(s.opens_at)}`;
    if (s.reason === 'closed_today') return 'Closed today';
    return null;
  }

  /**
   * Formats an ISO instant as a wall-clock time in the offset the API
   * returned it with.
   *
   * The backend emits these already carrying the store's own UTC offset
   * (e.g. "+03:00" for Beirut in summer), so reading the offset off the
   * string and applying it is what keeps the displayed time the salon's
   * local time. Passing the string to toLocaleTimeString() without this
   * would silently convert it to the device's zone.
   */
  private storeTime(iso: string): string {
    const match = /([+-])(\d{2}):(\d{2})$/.exec(iso);
    const d = new Date(iso);
    if (!match) {
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    const sign = match[1] === '-' ? -1 : 1;
    const offsetMin = sign * (Number(match[2]) * 60 + Number(match[3]));
    const shifted = new Date(d.getTime() + (offsetMin + d.getTimezoneOffset()) * 60_000);
    return shifted.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  protected hasPin(store: DiscoveryStoreCard): boolean {
    return store.latitude != null && store.longitude != null;
  }
}
