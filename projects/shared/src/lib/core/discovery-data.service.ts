import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import type { ArtistCard, PublicArtistProfile } from '../models';

/**
 * Data-access service for the discovery domain - the public, unauthenticated
 * browse/search surface customers use to find an artist before entering the
 * booking funnel. Distinct from ArtistDataService, which is the authenticated
 * artist's own profile management.
 */
@Injectable({ providedIn: 'root' })
export class DiscoveryDataService {
  private readonly api = inject(ApiService);

  /**
   * GET /discovery/artists?city=&category=&q=&limit=
   * All filters are optional - omit a param entirely rather than sending an
   * empty string, so the backend's own "no filter" behavior applies.
   */
  listArtists(filters: {
    city?: string;
    category?: string;
    q?: string;
    limit?: number;
  } = {}): Observable<ArtistCard[]> {
    const params: Record<string, string | number> = {};
    if (filters.city) params['city'] = filters.city;
    if (filters.category) params['category'] = filters.category;
    if (filters.q) params['q'] = filters.q;
    if (filters.limit) params['limit'] = filters.limit;
    return this.api.getArray<ArtistCard>('/discovery/artists', params);
  }

  /** GET /discovery/artists/:id - full public profile aggregate. */
  getArtistProfile(id: string): Observable<PublicArtistProfile> {
    return this.api.get<PublicArtistProfile>(`/discovery/artists/${id}`);
  }
}
