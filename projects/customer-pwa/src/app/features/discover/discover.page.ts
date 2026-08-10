import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { DiscoveryDataService, ARTIST_CATEGORIES } from '@bedge/shared';
import type { ArtistCard, ArtistCategory } from '@bedge/shared';

type CategoryFilter = ArtistCategory | 'all';

/** A city section: heading + the cards that belong to it. */
interface CitySection {
  city: string;
  artists: ArtistCard[];
}

/**
 * Discover / browse screen - rebuilt to match the Stitch reference design
 * (DiscoverArtistsScreen.tsx) rather than the flatter first pass.
 *
 * Two deliberate deviations from that reference, both because the backend
 * doesn't support them and shouldn't be bent to match a mockup generated
 * without that context:
 *
 * 1. No "Starts $X" price row. discovery.ArtistCard has no price field
 *    documented in the Go model as a deliberate choice, since an artist's
 *    services can span a huge range (Rania: $10 nails to $200 bridal
 *    makeup) and a single "starting price" on a browse card risks being
 *    actively misleading rather than just incomplete.
 *
 * 2. No bottom tab bar (Home/Bookings/Profile). The reference assumes
 *    customer accounts exist so "Bookings" and "Profile" have somewhere to
 *    go - there is no customer auth domain built yet (see CLAUDE.md tier 4).
 *    Building navigation to screens that don't exist is worse than not
 *    building the nav at all; add it back once that backend exists.
 */
@Component({
  selector: 'app-discover-page',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './discover.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscoverPage implements OnInit, OnDestroy {
  private readonly discoverySvc: DiscoveryDataService = inject(DiscoveryDataService);
  private readonly router: Router = inject(Router);

  protected readonly categories: readonly ArtistCategory[] = ARTIST_CATEGORIES;

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly results = signal<ArtistCard[]>([]);

  readonly searchQuery = signal('');
  readonly selectedCategory = signal<CategoryFilter>('all');

  private searchDebounceHandle: ReturnType<typeof setTimeout> | null = null;

  /**
   * Results grouped by city, city name sorted alphabetically so section
   * order is stable rather than depending on backend row order. Dynamic
   * not hardcoded to Beirut/Tripoli, so a third city just appears as its
   * own section the moment an artist exists there.
   */
  readonly citySections = computed((): CitySection[] => {
    const byCity = new Map<string, ArtistCard[]>();
    for (const artist of this.results()) {
      const list = byCity.get(artist.city) ?? [];
      list.push(artist);
      byCity.set(artist.city, list);
    }
    return [...byCity.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([city, artists]) => ({ city, artists }));
  });

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    if (this.searchDebounceHandle) clearTimeout(this.searchDebounceHandle);
  }

  selectCategory(category: CategoryFilter): void {
    this.selectedCategory.set(category);
    this.load();
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    if (this.searchDebounceHandle) clearTimeout(this.searchDebounceHandle);
    this.searchDebounceHandle = setTimeout(() => this.load(), 350);
  }

  /** Navigates using the artist's handle when set, falling back to the UUID. */
  openArtist(artist: ArtistCard): void {
    this.router.navigate(['/book', artist.handle || artist.id]);
  }

  /** The guard on /my-bookings handles the not-logged-in case automatically
   *  - redirects to /login?returnUrl=/my-bookings, then back here after. No
   *  conditional logic needed in the header itself for this link. */
  openMyBookings(): void {
    this.router.navigateByUrl('/my-bookings');
  }

  protected formatRating(rating: string): string {
    const n = parseFloat(rating);
    return Number.isFinite(n) ? n.toFixed(1) : '-';
  }

  /** "Rania J." -> "RJ", matching the reference design's avatar initials. */
  protected initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /**
   * Deterministic avatar background from a small ink/gray rotation
   * mirrors the reference design's varied avatarBg per card (which used
   * hardcoded per-artist values) without hardcoding to specific names.
   * Every option stays inside the brand palette - no blue, no gold.
   */
  protected avatarClass(artistId: string): string {
    const palette = [
      'bg-ink text-white',
      'bg-gray-100 text-ink border border-gray-200',
      'bg-gray-800 text-gray-100',
      'bg-gray-200 text-gray-800',
    ];
    let hash = 0;
    for (let i = 0; i < artistId.length; i++) hash = (hash + artistId.charCodeAt(i)) % palette.length;
    return palette[hash];
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    const category = this.selectedCategory();
    this.discoverySvc
      .listArtists({
        q: this.searchQuery() || undefined,
        category: category === 'all' ? undefined : category,
      })
      .subscribe({
        next: (data: ArtistCard[]) => {
          this.results.set(data);
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.errorMessage.set(
            err.status === 0 ? 'Cannot reach the server.' : 'Failed to load artists.',
          );
        },
      });
  }
}
