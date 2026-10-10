import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';

import { CustomerAuthStore, DiscoveryDataService } from '@bedge/shared';
import type { ArtistCard } from '@bedge/shared';

import { FavouritesStore } from './favourites.store';

// A customer's saved artists (2026-10-09): the heart on an artist's profile
// and the Favourites page share this store, so the two never disagree.

const card = (id: string, name: string): ArtistCard =>
  ({ id, name, city: 'Beirut', rating: '5', review_count: 1, is_verified: false, is_new: false }) as ArtistCard;

function setup(signedIn: boolean, api: Partial<DiscoveryDataService>) {
  TestBed.configureTestingModule({
    providers: [
      { provide: CustomerAuthStore, useValue: { isAuthenticated: signal(signedIn) } },
      { provide: DiscoveryDataService, useValue: api },
    ],
  });
  return TestBed.inject(FavouritesStore);
}

describe('FavouritesStore', () => {
  it('signed in: loads her saved artists', () => {
    const store = setup(true, { getFavourites: () => of([card('a1', 'Rania')]) });
    store.load();
    expect(store.has('a1')).toBe(true);
    expect(store.cards().map((c) => c.name)).toEqual(['Rania']);
  });

  it('signed out: asks for nothing and holds nothing', () => {
    let asked = 0;
    const store = setup(false, { getFavourites: () => { asked++; return of([]); } });
    store.load();
    expect(asked).toBe(0);
    expect(store.has('a1')).toBe(false);
  });

  it('saving shows at once, then is sent', () => {
    const sent: string[] = [];
    const store = setup(true, { addFavourite: (id: string) => { sent.push(id); return of(undefined); } });
    store.toggle('a1');
    expect(store.has('a1')).toBe(true);
    expect(sent).toEqual(['a1']);
  });

  it('removing drops it from the page list too', () => {
    const store = setup(true, {
      getFavourites: () => of([card('a1', 'Rania'), card('a2', 'Lina')]),
      removeFavourite: () => of(undefined),
    });
    store.load();
    store.toggle('a1');
    expect(store.has('a1')).toBe(false);
    expect(store.cards().map((c) => c.id)).toEqual(['a2']);
  });

  it('a save that fails is undone and says so', () => {
    const store = setup(true, {
      addFavourite: () => throwError(() => new HttpErrorResponse({ status: 500 })) as Observable<void>,
    });
    store.toggle('a1');
    expect(store.has('a1')).toBe(false);
    expect(store.error()).toContain('Could not');
  });
});
