import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import type { PortfolioResponse, AddMediaRequest, ReorderRequest } from '../models';

/**
 * Data-access service for the media/portfolio domain.
 * Thin wrappers over ApiService — one method per endpoint.
 */
@Injectable({ providedIn: 'root' })
export class MediaDataService {
  private readonly api = inject(ApiService);

  /** GET /media/my — the authenticated artist's own portfolio. */
  getMyPortfolio(): Observable<PortfolioResponse> {
    return this.api.get<PortfolioResponse>('/media/my');
  }

  /** GET /media/portfolio/:artist_id — public portfolio for any artist. */
  getPortfolio(artistId: string): Observable<PortfolioResponse> {
    return this.api.get<PortfolioResponse>(`/media/portfolio/${artistId}`);
  }

  /** POST /media — add a photo (URL must already be uploaded to Cloudinary). */
  addPhoto(req: AddMediaRequest): Observable<unknown> {
    return this.api.post('/media', req);
  }

  /** DELETE /media/:id — remove a photo. */
  deletePhoto(mediaId: string): Observable<void> {
    return this.api.delete(`/media/${mediaId}`);
  }

  /** PATCH /media/:id/cover — set a photo as the cover (first). */
  setCover(mediaId: string): Observable<void> {
    return this.api.command(`/media/${mediaId}/cover`, 'PATCH');
  }

  /** PATCH /media/reorder — reorder all photos. */
  reorder(req: ReorderRequest): Observable<void> {
    return this.api.command('/media/reorder', 'PATCH', req);
  }
}
