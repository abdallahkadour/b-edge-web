import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import type { PendingArtist, DecisionRequest } from '../models';

/** Data-access for the admin review queue. Every endpoint here requires
 *  role='admin' server-side - there is no client-side enforcement to rely
 *  on, this service just wraps the calls. */
@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private readonly api = inject(ApiService);

  getPendingArtists(): Observable<PendingArtist[]> {
    return this.api.getArray<PendingArtist>('/admin/artists/pending');
  }

  /** POST /admin/artists/:id/approve - returns 204 No Content, hence
   *  `command()` rather than `post()`. post<T>() unwraps `res.data`, which
   *  would throw on a genuine empty-body 204: Angular's HttpClient returns
   *  `null` as the response body for 204s, and `null.data` is a runtime
   *  error, not an empty value. Caught before shipping by checking the
   *  Go handler's actual response (`response.NoContent` sends no body at
   *  all) rather than assuming post<void>() would degrade gracefully. */
  approveArtist(artistId: string): Observable<void> {
    return this.api.command(`/admin/artists/${artistId}/approve`, 'POST');
  }

  /**
   * PATCH /admin/artists/:id/verification - grant or remove the verified badge.
   *
   * The note is required by the API and is audited. It records what the
   * decision was based on, which is the part worth keeping for a signal that
   * ranks artists in discovery and influences a client's payment decision.
   */
  setArtistVerification(artistId: string, isVerified: boolean, note: string): Observable<void> {
    return this.api.command(`/admin/artists/${artistId}/verification`, 'PATCH', {
      is_verified: isVerified,
      note,
    });
  }

  rejectArtist(artistId: string, req: DecisionRequest = {}): Observable<void> {
    return this.api.command(`/admin/artists/${artistId}/reject`, 'POST', req);
  }
}
