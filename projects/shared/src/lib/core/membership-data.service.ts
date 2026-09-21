import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import type {
  SalonMember,
  SalonInvitation,
  InviteMemberRequest,
  InviteResult,
  InvitationPreview,
  TransferOwnershipRequest,
  AcceptInvitationRequest,
  ArtistSchedule,
  ArtistScheduleException,
  SetRotaRequest,
  CreateScheduleExceptionRequest,
} from '../models';

/**
 * Data access for salon membership and per-artist working hours.
 *
 * Thin wrappers, one method per endpoint. Collection reads use `getArray`,
 * which coalesces the API's null-for-empty into `[]`.
 *
 * Which of these a caller may successfully invoke depends on their salon
 * role - the server decides, and answers 403 SALON_ROLE_FORBIDDEN otherwise.
 * The dashboard hides what a member cannot do; it does not enforce it.
 */
@Injectable({ providedIn: 'root' })
export class MembershipDataService {
  private readonly api = inject(ApiService);

  // ── Roster ───────────────────────────────────────────────────────────────

  /** GET /artists/salon/members - visible to every member of the salon. */
  listMembers(): Observable<SalonMember[]> {
    return this.api.getArray<SalonMember>('/artists/salon/members');
  }

  /** POST /artists/salon/members/invite - owner only. */
  invite(body: InviteMemberRequest): Observable<InviteResult> {
    return this.api.post<InviteResult>('/artists/salon/members/invite', body);
  }

  /** DELETE /artists/salon/members/:artistId - owner only. */
  removeMember(artistId: string): Observable<void> {
    return this.api.delete(`/artists/salon/members/${artistId}`);
  }

  /** POST /artists/salon/members/leave - a member acting on themselves. */
  leaveSalon(): Observable<void> {
    return this.api.command('/artists/salon/members/leave', 'POST');
  }

  /** POST /artists/salon/owner/transfer - owner only. Invalidates both sessions. */
  transferOwnership(body: TransferOwnershipRequest): Observable<void> {
    return this.api.command('/artists/salon/owner/transfer', 'POST', body);
  }

  // ── Invitations ──────────────────────────────────────────────────────────

  /** GET /artists/salon/invitations - owner only. */
  listInvitations(): Observable<SalonInvitation[]> {
    return this.api.getArray<SalonInvitation>('/artists/salon/invitations');
  }

  /** DELETE /artists/salon/invitations/:id - owner only. */
  revokeInvitation(id: string): Observable<void> {
    return this.api.delete(`/artists/salon/invitations/${id}`);
  }

  /**
   * GET /invitations/:token - public, no auth.
   *
   * Unknown, expired, revoked and already-accepted tokens all answer with
   * the same 404, so the screen can only ever say "this link is not valid"
   * and must not try to explain which.
   */
  previewInvitation(token: string): Observable<InvitationPreview> {
    return this.api.get<InvitationPreview>(`/invitations/${token}`);
  }

  /** POST /invitations/:token/accept - requires a signed-in account. */
  acceptInvitation(
    token: string,
    body: AcceptInvitationRequest,
  ): Observable<{ artist_id: string; status: string; message: string }> {
    return this.api.post(`/invitations/${token}/accept`, body);
  }

  /** POST /invitations/:token/decline - public. */
  declineInvitation(token: string): Observable<void> {
    return this.api.command(`/invitations/${token}/decline`, 'POST');
  }

  // ── My working hours ─────────────────────────────────────────────────────

  /**
   * GET /artists/me/schedule.
   *
   * An empty array is the normal, healthy state: it means available for the
   * whole of each store's opening hours. Do not render it as "no hours set"
   * in a way that reads as a problem.
   */
  getMyRota(): Observable<ArtistSchedule[]> {
    return this.api.getArray<ArtistSchedule>('/artists/me/schedule');
  }

  /** PUT /artists/me/schedule - replaces the whole week at one store. */
  setMyRota(body: SetRotaRequest): Observable<ArtistSchedule[]> {
    return this.api.put<ArtistSchedule[]>('/artists/me/schedule', body);
  }

  getMyScheduleExceptions(): Observable<ArtistScheduleException[]> {
    return this.api.getArray<ArtistScheduleException>('/artists/me/schedule/exceptions');
  }

  setMyScheduleException(
    body: CreateScheduleExceptionRequest,
  ): Observable<ArtistScheduleException[]> {
    return this.api.post<ArtistScheduleException[]>('/artists/me/schedule/exceptions', body);
  }

  deleteMyScheduleException(id: string): Observable<void> {
    return this.api.delete(`/artists/me/schedule/exceptions/${id}`);
  }
}
