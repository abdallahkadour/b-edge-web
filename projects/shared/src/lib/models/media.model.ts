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
  /**
   * Services this photo depicts (migration 028). Always present and never
   * null — an untagged photo carries `[]` — so callers filter without a
   * nil check.
   *
   * Always empty for product-gallery photos: a product photo shows
   * merchandise, not a service being performed, so the API does not
   * consult the tag table for them.
   */
  readonly service_ids: string[];
}

/**
 * Body for PUT /media/:id/services.
 *
 * The FULL desired tag set, not a delta — send every service the photo
 * should be tagged to, and an empty list to clear them all.
 */
export interface SetMediaServicesRequest {
  service_ids: string[];
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
