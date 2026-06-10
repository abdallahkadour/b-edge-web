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
