import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import type {
  PortfolioResponse,
  AddMediaRequest,
  ReorderRequest,
  ProductGalleryResponse,
  MediaItem,
} from '../models';

/**
 * Data-access service for the media/portfolio domain.
 * Thin wrappers over ApiService - one method per endpoint.
 */
@Injectable({ providedIn: 'root' })
export class MediaDataService {
  private readonly api = inject(ApiService);

  /** GET /media/my - the authenticated artist's own portfolio. */
  getMyPortfolio(): Observable<PortfolioResponse> {
    return this.api.get<PortfolioResponse>('/media/my');
  }

  /** GET /media/portfolio/:artist_id - public portfolio for any artist. */
  getPortfolio(artistId: string): Observable<PortfolioResponse> {
    return this.api.get<PortfolioResponse>(`/media/portfolio/${artistId}`);
  }

  /** POST /media - add a photo (URL must already be uploaded to Cloudinary). */
  addPhoto(req: AddMediaRequest): Observable<unknown> {
    return this.api.post('/media', req);
  }

  /** DELETE /media/:id - remove a photo. */
  deletePhoto(mediaId: string): Observable<void> {
    return this.api.delete(`/media/${mediaId}`);
  }

  /** PATCH /media/:id/cover - set a photo as the cover (first). */
  setCover(mediaId: string): Observable<void> {
    return this.api.command(`/media/${mediaId}/cover`, 'PATCH');
  }

  /** PATCH /media/reorder - reorder all photos. */
  reorder(req: ReorderRequest): Observable<void> {
    return this.api.command('/media/reorder', 'PATCH', req);
  }

  // ── Product gallery ───────────────────────────────────────────────────────
  // Additional photos beyond a product's own `image_url`, which stays the
  // primary/first photo everywhere it already is. No "set cover" here -
  // image_url already is the cover.

  /** GET /media/products/:id/photos - public gallery for any product. */
  getProductPhotos(productId: string): Observable<ProductGalleryResponse> {
    return this.api.get<ProductGalleryResponse>(`/media/products/${productId}/photos`);
  }

  /** POST /media/products/:id/photos - add a gallery photo (up to 8). */
  addProductPhoto(productId: string, req: AddMediaRequest): Observable<MediaItem> {
    return this.api.post<MediaItem>(`/media/products/${productId}/photos`, req);
  }

  /** DELETE /media/product-photos/:id - remove a gallery photo. */
  deleteProductPhoto(mediaId: string): Observable<void> {
    return this.api.delete(`/media/product-photos/${mediaId}`);
  }

  /** PATCH /media/products/:id/photos/reorder - reorder a product's gallery. */
  reorderProductPhotos(productId: string, req: ReorderRequest): Observable<void> {
    return this.api.command(`/media/products/${productId}/photos/reorder`, 'PATCH', req);
  }
}
