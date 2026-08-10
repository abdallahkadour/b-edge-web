import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import type {
  Review,
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

  /** GET /reviews/artist/:id - visible reviews for an artist. */
  getReviewsByArtist(artistId: string): Observable<Review[]> {
    return this.api.getArray<Review>(`/reviews/artist/${artistId}`);
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
