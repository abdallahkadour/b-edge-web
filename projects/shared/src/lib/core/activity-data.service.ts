import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService, type ListResult } from './api.service';
import type { ActivityEntry, ActivityKind } from '../models';

/** The salon activity log. Owner only - a member gets 403 SALON_ROLE_FORBIDDEN. */
@Injectable({ providedIn: 'root' })
export class ActivityDataService {
  private readonly api = inject(ApiService);

  /** GET /salon/activity - newest first; `actor` is a users.id. */
  list(opts: { kind?: ActivityKind; actor?: string; cursor?: string; limit?: number } = {}): Observable<ListResult<ActivityEntry>> {
    const params: Record<string, string | number> = { limit: opts.limit ?? 30 };
    if (opts.kind) params['kind'] = opts.kind;
    if (opts.actor) params['actor'] = opts.actor;
    if (opts.cursor) params['cursor'] = opts.cursor;
    return this.api.getList<ActivityEntry>('/salon/activity', params);
  }
}
