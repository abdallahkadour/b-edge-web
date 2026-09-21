import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  AuthStore,
  ButtonComponent,
  InputDirective,
  MembershipDataService,
  SkeletonComponent,
  extractApiErrorMessage,
} from '@bedge/shared';
import type { InvitationPreview } from '@bedge/shared';

/**
 * Accepting an invitation to join a salon. Reached from the link an owner
 * sends: /join/:token
 *
 * WHY THIS SCREEN NEVER EXPLAINS WHY A LINK FAILED
 *
 * The API answers unknown, expired, revoked and already-accepted tokens
 * identically, on purpose: this route is public, so telling a stranger
 * which of those applied would tell them which tokens once existed. The
 * screen says the link is not valid and offers the only useful next step,
 * which is asking the salon for a new one.
 *
 * WHAT ACCEPTING DOES AND DOES NOT DO
 *
 * It attaches you to the salon and creates your artist profile as 'pending'.
 * It does NOT make you bookable - an admin reviews every new artist, and an
 * invitation is not a way around that. The confirmation says so rather than
 * leaving someone to discover it when no bookings arrive.
 */
@Component({
  selector: 'bedge-join-salon',
  standalone: true,
  imports: [RouterLink, ButtonComponent, InputDirective, SkeletonComponent],
  templateUrl: './join-salon.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinSalonPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(MembershipDataService);
  private readonly auth = inject(AuthStore);

  protected readonly token = signal('');
  protected readonly preview = signal<InvitationPreview | null>(null);
  protected readonly loading = signal(true);
  protected readonly invalid = signal(false);

  protected readonly handle = signal('');
  protected readonly category = signal('makeup');
  protected readonly bio = signal('');
  protected readonly instagram = signal('');

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly joined = signal(false);

  protected readonly isAuthenticated = this.auth.isAuthenticated;

  protected readonly categories = ['makeup', 'hair', 'nails', 'lashes', 'skincare'];

  /**
   * Handles are lowercase, digits and hyphens, not starting or ending with
   * a hyphen - the same pattern the artists table enforces. Checked here so
   * the person finds out while typing rather than on submit.
   */
  protected readonly handleValid = computed(() =>
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(this.handle()) && this.handle().length >= 3,
  );

  protected readonly canSubmit = computed(
    () => this.handleValid() && !this.submitting(),
  );

  ngOnInit(): void {
    // Read the param in ngOnInit, not the constructor. A signal input is not
    // bound until after construction, and a constructor read would leave the
    // token empty - the bug that silently disabled four inputs in
    // guest-details-screen.component.ts.
    const token = this.route.snapshot.paramMap.get('token') ?? '';
    this.token.set(token);

    if (!token) {
      this.loading.set(false);
      this.invalid.set(true);
      return;
    }

    this.api.previewInvitation(token).subscribe({
      next: (p) => {
        this.preview.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.invalid.set(true);
      },
    });
  }

  /** Sends the person to sign in, returning them here afterwards. */
  protected signIn(): void {
    void this.router.navigate(['/login'], {
      queryParams: { returnUrl: `/join/${this.token()}` },
    });
  }

  protected accept(): void {
    if (!this.canSubmit()) return;

    this.submitting.set(true);
    this.error.set(null);

    this.api
      .acceptInvitation(this.token(), {
        handle: this.handle().trim(),
        category: this.category(),
        bio: this.bio().trim() || undefined,
        instagram: this.instagram().trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.joined.set(true);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(
            extractApiErrorMessage(err, 'Could not join that salon.'),
          );
        },
      });
  }

  protected decline(): void {
    this.api.declineInvitation(this.token()).subscribe({
      next: () => void this.router.navigate(['/login']),
      error: () => void this.router.navigate(['/login']),
    });
  }
}
