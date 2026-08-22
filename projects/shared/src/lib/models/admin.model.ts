/** Admin review-queue models. Mirror the Go admin.* structs. */

export interface PendingArtist {
  artist_id: string;
  name: string;
  email: string;
  handle: string | null;
  category: string | null;
  bio: string | null;
  salon_name: string;
  store_name: string;
  city: string;
  service_name: string;
  submitted_at: string;
}

export interface DecisionRequest {
  reason?: string;
}
