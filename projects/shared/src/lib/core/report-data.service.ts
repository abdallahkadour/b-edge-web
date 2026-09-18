import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import type {
  AdminReport,
  CreateReportRequest,
  Report,
  ReportCategoryOption,
  ReportStatus,
} from '../models';

/**
 * Raising a problem, and handling one.
 *
 * Creating a report requires a signed-in account and the reporter must be
 * party to the booking. That is not friction for its own sake: an
 * unauthenticated endpoint here would be a spam cannon, and a client already
 * signs in with the phone they booked with in order to see the booking at all.
 */
@Injectable({ providedIn: 'root' })
export class ReportDataService {
  private readonly api = inject(ApiService);

  /** GET /reports/categories - public, so the form can render before sign-in. */
  listCategories(): Observable<ReportCategoryOption[]> {
    return this.api.getArray<ReportCategoryOption>('/reports/categories');
  }

  /** POST /reports */
  create(req: CreateReportRequest): Observable<Report> {
    return this.api.post<Report>('/reports', req);
  }

  /** GET /reports/me - what I raised, and what happened to it. */
  listMine(): Observable<Report[]> {
    return this.api.getArray<Report>('/reports/me');
  }

  /** GET /admin/reports - the queue, oldest first. */
  listQueue(includeResolved = false): Observable<AdminReport[]> {
    return this.api.getArray<AdminReport>('/admin/reports', {
      include_resolved: String(includeResolved),
    });
  }

  /**
   * PATCH /admin/reports/:id - move one along.
   *
   * The API requires a note when closing, because a report closed with no
   * record of what was done leaves the next person looking at the pattern
   * with nothing.
   */
  resolve(id: string, status: ReportStatus, note?: string): Observable<void> {
    return this.api.command(`/admin/reports/${id}`, 'PATCH', { status, note });
  }
}
