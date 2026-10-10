import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import type { ArtistCard } from '@bedge/shared';

import { FavouritesStore } from '../../shared/favourites.store';

/**
 * The customer's saved artists (/favourites, 2026-10-09). The PRD's launch
 * list asked for customer profiles with "history, favourites, refund
 * status"; favourites never shipped. An artist Discover would hide is
 * hidden here too - the API reads through Discover's own query.
 */
@Component({
  selector: 'app-favourites-page',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="h-14 px-4 flex items-center border-b border-gray-100 bg-white sticky top-0 z-10">
        <a routerLink="/my-bookings" aria-label="Back to My Bookings" class="min-h-11 min-w-11 -ml-2 flex items-center justify-center text-gray-600">
          <lucide-icon name="arrow-left" [size]="20" [strokeWidth]="2" />
        </a>
        <h1 class="text-sm font-bold text-ink mx-auto -translate-x-3">Favourites</h1>
      </div>

      <div class="px-5 py-5">
        @if (store.error(); as e) {
          <p role="alert" class="mb-4 rounded-lg bg-danger-light border border-danger/30 px-4 py-3 text-sm text-danger-dark">{{ e }}</p>
        }
        @if (store.loading() && store.cards().length === 0) {
          <p class="text-sm text-gray-400 py-8 text-center">Loading…</p>
        } @else if (store.cards().length === 0) {
          <div class="py-12 text-center">
            <p class="text-sm text-gray-600">No favourites yet.</p>
            <p class="text-xs text-gray-400 mt-1">Tap the heart on an artist's page to save her here.</p>
            <a routerLink="/" class="inline-block mt-4 text-sm font-medium text-ink underline">Find an artist</a>
          </div>
        } @else {
          <ul class="space-y-2">
            @for (a of store.cards(); track a.id) {
              <li class="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
                <a [routerLink]="['/book', a.handle || a.id]" class="flex items-center gap-3 min-w-0 flex-1">
                  @if (a.avatar_url) {
                    <img [src]="a.avatar_url" [alt]="a.name" class="w-12 h-12 rounded-full object-cover shrink-0" referrerpolicy="no-referrer" />
                  } @else {
                    <span class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">{{ initials(a) }}</span>
                  }
                  <span class="min-w-0">
                    <span class="block text-sm font-bold text-ink truncate">{{ a.name }}</span>
                    <span class="block text-xs text-gray-500 truncate">{{ a.category ? a.category + ' · ' : '' }}{{ a.city }}</span>
                  </span>
                </a>
                <button type="button" (click)="store.toggle(a.id)" [attr.aria-label]="'Remove ' + a.name + ' from favourites'"
                  class="min-h-11 min-w-11 flex items-center justify-center text-ink shrink-0">
                  <lucide-icon name="heart" [size]="20" [strokeWidth]="2" class="fill-ink" />
                </button>
              </li>
            }
          </ul>
        }
      </div>
    </div>
  `,
})
export class FavouritesPage implements OnInit {
  protected readonly store = inject(FavouritesStore);

  ngOnInit(): void {
    this.store.load();
  }

  protected initials(a: ArtistCard): string {
    return a.name.split(/\s+/).map((p) => p[0] ?? '').join('').slice(0, 2).toUpperCase();
  }
}
