import { Injectable, inject, signal } from '@angular/core';

import { CustomerAuthStore, DiscoveryDataService } from '@bedge/shared';
import type { ArtistCard } from '@bedge/shared';

/**
 * The signed-in customer's saved artists (2026-10-09, migration 056).
 *
 * One store for the heart on an artist's profile and the Favourites page, so
 * the two never disagree. A change shows at once and is undone if the server
 * refuses it. Signed out there is nothing to hold: the heart sends her to
 * sign in instead.
 */
@Injectable({ providedIn: 'root' })
export class FavouritesStore {
  private readonly api = inject(DiscoveryDataService);
  private readonly auth = inject(CustomerAuthStore);

  private readonly ids = signal<ReadonlySet<string>>(new Set());
  readonly cards = signal<ArtistCard[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  has(artistId: string): boolean {
    return this.ids().has(artistId);
  }

  load(): void {
    if (!this.auth.isAuthenticated()) {
      this.ids.set(new Set());
      this.cards.set([]);
      return;
    }
    this.loading.set(true);
    this.api.getFavourites().subscribe({
      next: (cards) => {
        this.cards.set(cards);
        this.ids.set(new Set(cards.map((c) => c.id)));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Could not load your favourites.');
      },
    });
  }

  toggle(artistId: string): void {
    const saving = !this.has(artistId);
    const before = this.ids();
    const beforeCards = this.cards();
    const next = new Set(before);
    if (saving) next.add(artistId);
    else next.delete(artistId);
    this.ids.set(next);
    if (!saving) this.cards.set(beforeCards.filter((c) => c.id !== artistId));
    this.error.set(null);

    const call = saving ? this.api.addFavourite(artistId) : this.api.removeFavourite(artistId);
    call.subscribe({
      error: () => {
        this.ids.set(before);
        this.cards.set(beforeCards);
        this.error.set(saving ? 'Could not save this artist. Please try again.' : 'Could not remove this artist. Please try again.');
      },
    });
  }
}
