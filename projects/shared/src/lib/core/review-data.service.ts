import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import type {
  Review,
  EnrichedReview,
  CreateReviewRequest,
  ReviewBookingContext,
  SubmitReviewByTokenRequest,
} from '../models';

/**
 * Data-access service for the review domain.
 *
 * getBookingContextByToken / submitReviewByToken are the guest review-link
 * flow - no Bearer token, no customer account. The link's token is the only
 * credential, in place of what a login session would normally prove.
 */
@Injectable({ providedIn: 'root' })
export class ReviewDataService {
  private readonly api = inject(ApiService);

  /** POST /reviews - authenticated (artist-side / future customer-account use). */
  createReview(req: CreateReviewRequest): Observable<Review> {
    return this.api.post<Review>('/reviews', req);
  }

  /** GET /reviews/artist/:id - ALL of an artist's reviews, hidden included -
   *  this is the artist's own moderation view. Authed. (Distinct from
   *  getPublicReviewsByArtist below, which filters to visible-only and
   *  needs no login.) */
  getReviewsByArtist(artistId: string): Observable<Review[]> {
    return this.api.getArray<Review>(`/reviews/artist/${artistId}`);
  }

  /** PATCH /reviews/:id/hide - artist removes a review from their public
   *  profile without deleting it (reversible via showReview below). */
  hideReview(reviewId: string): Observable<void> {
    return this.api.command(`/reviews/${reviewId}/hide`, 'PATCH');
  }

  /** PATCH /reviews/:id/show - restores a previously hidden review. */
  showReview(reviewId: string): Observable<void> {
    return this.api.command(`/reviews/${reviewId}/show`, 'PATCH');
  }

  /**
   * GET /public/reviews/artist/:id - public, no account needed. This is
   * the one an anonymous visitor deciding whether to book actually uses -
   * gating reviews behind login would contradict the guest-first design
   * used everywhere else in this app. Enriched with a display name; see
   * EnrichedReview's doc comment for why it's not the full customer name.
   */
  getPublicReviewsByArtist(artistId: string): Observable<EnrichedReview[]> {
    return this.api.getArray<EnrichedReview>(`/public/reviews/artist/${artistId}`);
  }

  /**
   * GET /reviews/by-token/:token - public, no auth. Resolves the review
   * link to the booking summary shown before submission.
   */
  getBookingContextByToken(token: string): Observable<ReviewBookingContext> {
    return this.api.get<ReviewBookingContext>(`/reviews/by-token/${token}`);
  }

  /**
   * POST /reviews/by-token/:token - public, no auth. Submits the guest's
   * review using the link token as the sole credential.
   */
  submitReviewByToken(token: string, req: SubmitReviewByTokenRequest): Observable<Review> {
    return this.api.post<Review>(`/reviews/by-token/${token}`, req);
  }
}
