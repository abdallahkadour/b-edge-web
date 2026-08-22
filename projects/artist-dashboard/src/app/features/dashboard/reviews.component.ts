import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';

import { ArtistDataService, ReviewDataService, extractApiErrorMessage } from '@bedge/shared';
import type { Review } from '@bedge/shared';

/**
 * Reviews screen - the artist's own moderation view. Lists every review
 * (visible and hidden alike - see ReviewDataService.getReviewsByArtist's
 * doc comment for why that's the correct behaviour here, unlike the public
 * endpoint) with a hide/show toggle per row.
 *
 * Closes a real gap: POST/GET/DELETE /reviews and PATCH .../hide|show had
 * no UI trigger anywhere in this app at all (project-docs/E2E-TEST-PLAN.md
 * §4, Gap G4) - not even a shared-service wrapper for hide/show existed
 * before this. Scoped deliberately to hide/show only: DELETE /reviews/:id
 * is customer-owned (only the review's author or an admin may call it, per
 * review/service.go), not an artist action, so it's not here.
 */
@Component({
  selector: 'bedge-reviews',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  templateUrl: './reviews.component.html',
})
export class ReviewsComponent implements OnInit {
  private readonly artistSvc = inject(ArtistDataService);
  private readonly reviewSvc = inject(ReviewDataService);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly reviews = signal<Review[]>([]);

  /** ID of the review currently being hidden/shown, for per-row loading state. */
  readonly togglingId = signal<string | null>(null);

  protected readonly stars = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.load();
  }

  formatDate(iso: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Beirut',
      day: 'numeric', month: 'short', year: 'numeric',
    }).format(new Date(iso));
  }

  toggleVisibility(review: Review): void {
    if (this.togglingId()) return;

    this.togglingId.set(review.id);
    this.errorMessage.set(null);

    const call = review.is_visible
      ? this.reviewSvc.hideReview(review.id)
      : this.reviewSvc.showReview(review.id);

    call.subscribe({
      next: () => {
        this.togglingId.set(null);
        this.reviews.update((list) =>
          list.map((r) => (r.id === review.id ? { ...r, is_visible: !r.is_visible } : r)),
        );
      },
      error: (err: HttpErrorResponse) => {
        this.togglingId.set(null);
        this.errorMessage.set(
          extractApiErrorMessage(err, 'Could not update this review. Please try again.'),
        );
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.artistSvc.getMyProfile().subscribe({
      next: (profile) => {
        this.reviewSvc.getReviewsByArtist(profile.id).subscribe({
          next: (reviews) => {
            this.reviews.set(reviews);
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
            this.errorMessage.set('Failed to load reviews. Please try again.');
          },
        });
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Failed to load your profile. Please try again.');
      },
    });
  }
}
