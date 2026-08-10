import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import type { EarningsSummary } from '../models';

/**
 * Data-access service for the earnings domain.
 * Thin wrapper over ApiService - one method per endpoint.
 */
@Injectable({ providedIn: 'root' })
export class EarningsDataService {
  private readonly api = inject(ApiService);

  /**
   * GET /earnings/summary - revenue summary for the authenticated artist.
   * If from/to are omitted, the API defaults to the current calendar month.
   */
  getSummary(from?: string, to?: string): Observable<EarningsSummary> {
    const params: Record<string, string> = {};
    if (from) params['from'] = from;
    if (to) params['to'] = to;
    return this.api.get<EarningsSummary>('/earnings/summary', params);
  }
}
