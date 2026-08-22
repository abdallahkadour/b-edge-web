/**
 * Media/portfolio domain models. Mirror the Go media response/request structs.
 */

/** A single photo item (Go media.MediaResponse). */
export interface MediaItem {
  readonly id: string;
  readonly url: string;
  readonly cloudinary_id?: string;
  readonly type: string;
  readonly display_order: number;
  readonly created_at: string;
}

/** Full portfolio response (Go media.PortfolioResponse). */
export interface PortfolioResponse {
  readonly artist_id: string;
  readonly photos: MediaItem[];
  readonly total_count: number;
  readonly max_allowed: number;
}

/** Request body for POST /media (Go media.AddMediaRequest). */
export interface AddMediaRequest {
  url: string;
  cloudinary_id?: string;
}

/** Request body for PATCH /media/reorder (Go media.ReorderRequest). */
export interface ReorderRequest {
  ids: string[];
}

/**
 * A product's ADDITIONAL photo gallery (Go media.ProductGalleryResponse).
 * The product's own `image_url` is untouched and always the primary/first
 * photo shown everywhere - these are extra angles/views on top of it.
 */
export interface ProductGalleryResponse {
  readonly product_id: string;
  readonly photos: MediaItem[];
  readonly total_count: number;
  readonly max_allowed: number;
}
