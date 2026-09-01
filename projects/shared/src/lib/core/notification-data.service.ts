import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import type { NotificationFeed, UnreadCountResponse } from '../models';

/**
 * Data-access service for the in-app notification centre.
 *
 * Every endpoint is scoped to the caller's own user_id server-side, so
 * there is no user or artist parameter anywhere here - and deliberately no
 * way to add one. A notification belonging to someone else returns 404, not
 * 403, so a caller cannot probe IDs by watching the status code.
 */
@Injectable({ providedIn: 'root' })
export class NotificationDataService {
  private readonly api = inject(ApiService);

  /**
   * GET /notifications - newest first, archived excluded.
   *
   * Returns the unread count alongside the list on purpose: fetching the
   * badge and the panel separately lets a read landing between the two
   * calls show an empty list under a non-zero badge, which reads as a bug.
   */
  getFeed(opts?: { unreadOnly?: boolean; limit?: number }): Observable<NotificationFeed> {
    const params: Record<string, string | number> = {};
    if (opts?.unreadOnly) params['unread'] = 'true';
    if (opts?.limit) params['limit'] = opts.limit;
    return this.api.get<NotificationFeed>('/notifications', params);
  }

  /**
   * GET /notifications/unread-count - the badge on its own.
   *
   * Separate from the feed because it is polled far more often; fetching
   * twenty rows to render a number would be wasteful at that interval.
   */
  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.api.get<UnreadCountResponse>('/notifications/unread-count');
  }

  /** PATCH /notifications/:id/read. Idempotent - re-reading is a no-op,
   *  not an error, so a double-tap on a feed row cannot fail visibly. */
  markRead(id: string): Observable<void> {
    return this.api.command(`/notifications/${id}/read`, 'PATCH');
  }

  /** POST /notifications/read-all - clears the badge in one call. */
  markAllRead(): Observable<void> {
    return this.api.command('/notifications/read-all', 'POST');
  }

  /** PATCH /notifications/:id/archive - removes it from the feed without
   *  deleting it. Also marks it read server-side, so dismissing something
   *  cannot leave the badge permanently stuck. */
  archive(id: string): Observable<void> {
    return this.api.command(`/notifications/${id}/archive`, 'PATCH');
  }
}
