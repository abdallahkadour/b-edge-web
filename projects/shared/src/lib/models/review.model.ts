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
  readonly created_at: string;
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
}

/** POST /reviews/by-token/:token request body (Go review.SubmitReviewByTokenRequest). */
export interface SubmitReviewByTokenRequest {
  rating: number;     // 1–5
  comment?: string;   // max 1000
}
