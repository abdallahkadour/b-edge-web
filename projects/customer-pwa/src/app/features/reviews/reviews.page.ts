import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { ReviewDataService, ArtistDataService } from '@bedge/shared';
import type { EnrichedReview } from '@bedge/shared';

/**
 * Reviews - what a prospective customer sees when they tap the rating
 * badge on an artist's profile. Public, no account needed - the whole
 * point is being readable before someone has any reason to have an
 * account, matching the same guest-first philosophy as the booking funnel.
 */
@Component({
  selector: 'app-reviews-page',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './reviews.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewsPage implements OnInit {
  private readonly reviewSvc = inject(ReviewDataService);
  private readonly artistSvc = inject(ArtistDataService);
  private readonly router = inject(Router);

  readonly artistId = input.required<string>();

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly reviews = signal<EnrichedReview[]>([]);
  readonly artistName = signal<string | null>(null);

  readonly averageRating = computed(() => {
    const list = this.reviews();
    if (list.length === 0) return null;
    return (list.reduce((sum, r) => sum + r.rating, 0) / list.length).toFixed(1);
  });

  ngOnInit(): void {
    this.load();
  }

  goBack(): void {
    this.router.navigate(['/book', this.artistId()]);
  }

  formatDate(iso: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Beirut',
      day: 'numeric', month: 'short', year: 'numeric',
    }).format(new Date(iso));
  }

  /** For rendering N filled + (5-N) empty stars per review. */
  starsFor(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < rating);
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    // The route param can be a UUID or a handle (e.g. /book/rania/reviews).
    // GetPublicReviewsByArtist only accepts a genuine UUID - unlike
    // /artists/:id and its siblings, it has no handle-resolution fallback -
    // so the raw param must be resolved here first, the same pattern
    // already required for guest slot holds and the media portfolio call.
    // Reaching this screen via a handle 400'd every time before this fix.
    this.artistSvc.getArtistById(this.artistId()).subscribe({
      next: (artist) => {
        this.artistName.set(artist.name);
        this.loadReviews(artist.id);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 0 ? 'Cannot reach the server.' : 'Failed to load reviews.',
        );
      },
    });
  }

  private loadReviews(resolvedArtistId: string): void {
    this.reviewSvc.getPublicReviewsByArtist(resolvedArtistId).subscribe({
      next: (items) => {
        this.reviews.set(items ?? []);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 0 ? 'Cannot reach the server.' : 'Failed to load reviews.',
        );
      },
    });
  }
}
