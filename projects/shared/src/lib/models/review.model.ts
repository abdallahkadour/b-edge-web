/**
 * Review domain models. Mirror the Go review response/request structs.
 */

/** A review (Go review.ReviewResponse). */
export interface Review {
  readonly id: string;
  readonly booking_id: string;
  readonly customer_id: string;
  readonly artist_id: string;
  readonly rating: number; // 1–5
  readonly comment?: string;
  /** Irrelevant on the public endpoint (only visible reviews are ever
   *  returned there); load-bearing on the artist's own moderation view -
   *  it's what a hide/show toggle actually reflects. */
  readonly is_visible: boolean;
  readonly created_at: string;
}

/**
 * The PUBLIC-facing shape, from GET /public/reviews/artist/:id - adds a
 * display name. Deliberately not the customer's full name: reviewer_name
 * is formatted server-side as "first name + last initial" (e.g. "Sarah K."),
 * a privacy choice specific to this being visible to anonymous visitors,
 * not just the artist who already has a relationship with that customer.
 */
export interface EnrichedReview extends Review {
  readonly reviewer_name: string;
}

/** Request body for POST /reviews (Go review.CreateReviewRequest). */
export interface CreateReviewRequest {
  booking_id: string;
  rating: number;     // 1–5
  comment?: string;   // max 1000
}

// ── Guest review-link flow ──────────────────────────────────────────────────
// No account, no login - the token in the URL is the only credential.
// Used by the LeaveReviewScreen, reached via /review/:token.

/** GET /reviews/by-token/:token - booking summary for the landing screen. */
export interface ReviewBookingContext {
  readonly service_name: string;
  readonly artist_name: string;
  readonly store_name: string;
  readonly start_time: string; // ISO 8601 UTC
  readonly final_price: string; // decimal as string
  /** True if this booking already has a review. The link isn't single-use
   *  (review_token is never cleared), so the landing screen uses this to
   *  show its "submitted" state immediately rather than only after a
   *  second submit attempt bounces off the 409 the backend already returns
   *  for a duplicate. */
  readonly already_reviewed: boolean;
}

/** POST /reviews/by-token/:token request body (Go review.SubmitReviewByTokenRequest). */
export interface SubmitReviewByTokenRequest {
  rating: number;     // 1–5
  comment?: string;   // max 1000
}
