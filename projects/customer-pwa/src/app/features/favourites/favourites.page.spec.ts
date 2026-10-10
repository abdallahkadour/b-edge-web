import { describe, it, expect } from 'vitest';
import { importProvidersFrom, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LucideAngularModule, icons } from 'lucide-angular';

import type { ArtistCard } from '@bedge/shared';

import { FavouritesPage } from './favourites.page';
import { FavouritesStore } from '../../shared/favourites.store';

// The customer's saved artists (2026-10-09): her list, a way back to each
// artist's page, and a way to forget one.

const card = (id: string, name: string, handle?: string): ArtistCard =>
  ({ id, name, handle, city: 'Beirut', category: 'makeup', rating: '4.8', review_count: 3, is_verified: false, is_new: false }) as ArtistCard;

function render(cards: ArtistCard[]) {
  const toggled: string[] = [];
  let loads = 0;
  const store = {
    cards: signal(cards), loading: signal(false), error: signal<string | null>(null),
    load: () => { loads++; }, toggle: (id: string) => toggled.push(id), has: () => true,
  };
  TestBed.configureTestingModule({
    providers: [
      importProvidersFrom(LucideAngularModule.pick(icons)),
      provideRouter([]),
      { provide: FavouritesStore, useValue: store },
    ],
  });
  const fixture = TestBed.createComponent(FavouritesPage);
  fixture.detectChanges();
  return { el: fixture.nativeElement as HTMLElement, toggled, loads: () => loads };
}

describe('FavouritesPage', () => {
  it('loads and lists her saved artists, each linking to the artist\'s page', () => {
    const { el, loads } = render([card('a1', 'Rania', 'rania'), card('a2', 'Lina')]);
    expect(loads()).toBe(1);
    expect(el.textContent).toContain('Rania');
    const hrefs = Array.from(el.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/book/rania');
    expect(hrefs).toContain('/book/a2');
  });

  it('with none saved, says how to save one', () => {
    const { el } = render([]);
    expect(el.textContent).toContain('Tap the heart');
  });

  it('the heart on a card forgets that artist', () => {
    const { el, toggled } = render([card('a1', 'Rania', 'rania')]);
    (el.querySelector('button[aria-label="Remove Rania from favourites"]') as HTMLButtonElement).click();
    expect(toggled).toEqual(['a1']);
  });
});
