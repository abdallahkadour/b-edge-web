/**
 * Salon membership: the roster, and how people get on and off it.
 *
 * Mirrors internal/membership in the API. Every artist on B-Edge today is
 * the sole member of their own salon and therefore its owner, so most of
 * this is invisible until a salon gains a second artist.
 */

/** Lifecycle of an invitation. `expired` is computed on read, never by a job. */
export type InvitationStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'revoked'
  | 'expired';

/** One artist in a salon, as the roster screen shows them. */
export interface SalonMember {
  artist_id: string;
  user_id: string;
  display_name: string;
  handle?: string;
  avatar_url?: string;
  category?: string;
  /** artists.status - an invited artist is 'pending' until an admin approves. */
  status: 'pending' | 'active' | 'rejected';
  is_owner: boolean;
  joined_at: string;
  /**
   * Why a member cannot always be removed: a customer must never find their
   * appointment evaporated because of an internal staffing change. Shown on
   * the roster so the owner sees the obstacle before they hit it.
   */
  future_bookings: number;
}

export interface SalonInvitation {
  id: string;
  salon_id: string;
  invited_by: string;
  phone?: string;
  email?: string;
  status: InvitationStatus;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

export interface InviteMemberRequest {
  phone?: string;
  email?: string;
  /** Acknowledges a seat charge. Accepted and ignored until seat billing ships. */
  accept_seat_charge?: boolean;
}

/**
 * The invitation and the link to it.
 *
 * The link is shown to the owner to copy, not merely sent. WhatsApp delivery
 * is blocked on Meta business verification and every notification queued so
 * far is dead, so the copyable link is the channel that actually works.
 */
export interface InviteResult {
  invitation: SalonInvitation;
  link: string;
}

/**
 * What the public token endpoint returns. Deliberately minimal - anyone
 * holding a link can read it.
 */
export interface InvitationPreview {
  salon_name: string;
  invited_by: string;
  expires_at: string;
  needs_signup: boolean;
}

export interface TransferOwnershipRequest {
  artist_id: string;
}

/** The profile an invitee supplies when accepting. */
export interface AcceptInvitationRequest {
  handle: string;
  category: string;
  bio?: string;
  instagram?: string;
}

// ── Per-artist working hours ───────────────────────────────────────────────

/**
 * One weekday's working hours at one store.
 *
 * NO ROWS AT ALL means available for the whole of that store's opening
 * hours. Absence is not unavailability - the API's slot generation treats an
 * empty rota as "no personal restriction", which is what keeps the schedule
 * feature invisible to artists working alone.
 */
export interface ArtistSchedule {
  id: string;
  artist_id: string;
  store_id: string;
  /** 0 = Sunday. */
  day_of_week: number;
  /** 'HH:mm'. */
  start_time: string;
  end_time: string;
  is_working: boolean;
}

/** A one-off override: a holiday, illness, or a different shift. */
export interface ArtistScheduleException {
  id: string;
  artist_id: string;
  /** Absent means every store. */
  store_id?: string;
  exception_date: string;
  is_unavailable: boolean;
  start_time?: string;
  end_time?: string;
  reason?: string;
}

/** The whole week for one store. Days omitted are removed. */
export interface SetRotaRequest {
  store_id: string;
  days: RotaDayItem[];
}

export interface RotaDayItem {
  day_of_week: number;
  start_time: string;
  end_time: string;
  /** A day you do not work is sent false, not omitted - omission means something else. */
  is_working: boolean;
}

export interface CreateScheduleExceptionRequest {
  exception_date: string;
  store_id?: string;
  is_unavailable: boolean;
  start_time?: string;
  end_time?: string;
  reason?: string;
}
