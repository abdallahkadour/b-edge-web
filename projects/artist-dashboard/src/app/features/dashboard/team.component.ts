import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

import {
  AuthStore,
  BadgeComponent,
  ButtonComponent,
  EmptyStateComponent,
  InputDirective,
  MembershipDataService,
  SkeletonComponent,
  extractApiErrorMessage,
} from '@bedge/shared';
import type { SalonInvitation, SalonMember } from '@bedge/shared';

/**
 * The salon roster: who works here, and who has been asked to.
 *
 * WHY MOST ARTISTS WILL NEVER SEE THIS SCREEN
 *
 * Every artist on B-Edge today is the sole member of their own salon. For
 * them the roster is one row - themselves - and the nav entry is hidden,
 * because a "Team" screen listing one person invites a question the product
 * has no reason to raise. It appears when a salon has someone to manage.
 *
 * WHAT THIS SCREEN DELIBERATELY DOES NOT DO
 *
 * Remove a member who has upcoming bookings. Those appointments belong to
 * customers who have paid deposits, and a staffing change must never be the
 * reason one disappears. The API refuses it; this screen shows the count on
 * the row so the obstacle is visible before it is hit.
 *
 * Explain why an invitation link did not work. Unknown, expired and revoked
 * tokens answer identically on purpose - distinguishing them would tell
 * anyone holding a URL which tokens once existed.
 */
@Component({
  selector: 'bedge-team',
  standalone: true,
  imports: [
    DatePipe,
    LucideAngularModule,
    ButtonComponent,
    BadgeComponent,
    InputDirective,
    EmptyStateComponent,
    SkeletonComponent,
  ],
  templateUrl: './team.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamComponent implements OnInit {
  private readonly api = inject(MembershipDataService);
  private readonly auth = inject(AuthStore);

  protected readonly members = signal<SalonMember[]>([]);
  protected readonly invitations = signal<SalonInvitation[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly isOwner = this.auth.isSalonOwner;

  protected readonly showInviteForm = signal(false);
  protected readonly invitePhone = signal('');
  protected readonly inviting = signal(false);
  protected readonly inviteError = signal<string | null>(null);

  /**
   * The link for the invitation just created.
   *
   * Shown, not merely sent. WhatsApp delivery is blocked on Meta business
   * verification and every notification this platform has queued is dead, so
   * copying this link into a message is the only way an invitation currently
   * reaches anyone. Once delivery works this stays useful anyway - an owner
   * standing next to the person can just hand it over.
   */
  protected readonly lastInviteLink = signal<string | null>(null);
  protected readonly linkCopied = signal(false);

  protected readonly rowErrors = signal<Record<string, string>>({});
  protected readonly busyId = signal<string | null>(null);

  /** Only invitations still awaiting an answer are actionable. */
  protected readonly pendingInvitations = computed(() =>
    this.invitations().filter((i) => i.status === 'pending'),
  );

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.listMembers().subscribe({
      next: (list) => {
        this.members.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Could not load your team. Please try again.');
      },
    });

    // Invitations are owner-only; a member asking for them would get a 403
    // and see a spurious error on a screen that is otherwise fine for them.
    if (this.isOwner()) {
      this.api.listInvitations().subscribe({
        next: (list) => this.invitations.set(list),
        error: () => {
          /* the roster is the point of this screen; a failed invitation
             list is not worth blanking it */
        },
      });
    }
  }

  // ── Inviting ─────────────────────────────────────────────────────────────

  protected readonly canInvite = computed(() => this.invitePhone().trim().length >= 6);

  protected openInviteForm(): void {
    this.invitePhone.set('');
    this.inviteError.set(null);
    this.lastInviteLink.set(null);
    this.showInviteForm.set(true);
  }

  protected closeInviteForm(): void {
    this.showInviteForm.set(false);
    this.lastInviteLink.set(null);
  }

  protected submitInvite(): void {
    if (!this.canInvite() || this.inviting()) return;

    this.inviting.set(true);
    this.inviteError.set(null);

    this.api.invite({ phone: this.invitePhone().trim() }).subscribe({
      next: (res) => {
        this.inviting.set(false);
        this.lastInviteLink.set(res.link);
        this.invitePhone.set('');
        this.invitations.update((list) => [res.invitation, ...list]);
      },
      error: (err) => {
        this.inviting.set(false);
        this.inviteError.set(
          extractApiErrorMessage(err, 'Could not send that invitation.'),
        );
      },
    });
  }

  protected async copyLink(): Promise<void> {
    const link = this.lastInviteLink();
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      this.linkCopied.set(true);
      setTimeout(() => this.linkCopied.set(false), 2000);
    } catch {
      // Clipboard access can be refused outright. The link is on screen and
      // selectable, so this is not worth an error message.
    }
  }

  protected revoke(inv: SalonInvitation): void {
    this.busyId.set(inv.id);
    this.api.revokeInvitation(inv.id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.invitations.update((list) => list.filter((i) => i.id !== inv.id));
      },
      error: (err) => {
        this.busyId.set(null);
        this.setRowError(inv.id, extractApiErrorMessage(err, 'Could not revoke that.'));
      },
    });
  }

  // ── Removing ─────────────────────────────────────────────────────────────

  /**
   * Whether the Remove control should be offered at all.
   *
   * The owner cannot be removed and neither can anyone holding upcoming
   * bookings. Both are refused by the API; hiding the control means the
   * owner is not invited to attempt something that will fail.
   */
  protected canRemove(m: SalonMember): boolean {
    return this.isOwner() && !m.is_owner && m.future_bookings === 0;
  }

  protected removeMember(m: SalonMember): void {
    this.busyId.set(m.artist_id);
    this.api.removeMember(m.artist_id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.members.update((list) => list.filter((x) => x.artist_id !== m.artist_id));
      },
      error: (err) => {
        this.busyId.set(null);
        this.setRowError(
          m.artist_id,
          extractApiErrorMessage(err, 'Could not remove that member.'),
        );
      },
    });
  }

  private setRowError(id: string, message: string): void {
    this.rowErrors.update((e) => ({ ...e, [id]: message }));
  }

  protected rowError(id: string): string | null {
    return this.rowErrors()[id] ?? null;
  }

  protected statusLabel(m: SalonMember): string {
    if (m.is_owner) return 'Owner';
    // 'pending' here is platform approval, not the invitation - an invited
    // artist joins the salon immediately and waits for an admin to review
    // their profile before they can take bookings.
    if (m.status === 'pending') return 'Awaiting approval';
    if (m.status === 'rejected') return 'Not approved';
    return 'Member';
  }
}
