import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import {
  ArtistDataService,
  AuthStore,
  BadgeComponent,
  ButtonComponent,
  CloudinaryUploadService,
  InputDirective,
  extractApiErrorMessage,
  validateImageFile,
  resizeImageToFit,
} from '@bedge/shared';
import type { ArtistProfile } from '@bedge/shared';

import { PortfolioComponent } from './portfolio.component';

/**
 * Profile screen — edit bio + instagram handle, upload/remove avatar photo,
 * manage portfolio photos.
 *
 * Avatar upload flow:
 *  1. User picks a photo; validateImageFile() checks type and the 15MB
 *     limit. Over the limit offers a resize instead of a flat rejection.
 *  2. Uploads to our own backend (CloudinaryUploadService), which
 *     validates and re-encodes the image before forwarding a clean copy
 *     to Cloudinary - see that service's doc comment for why.
 *  3. The returned URL is saved via PATCH /artists/:id (avatar_url field).
 *
 * Avatar removal sends an empty string rather than null: the Go repository
 * uses COALESCE($4, avatar_url), so null would preserve the existing value.
 * An empty string clears it, and the template treats it as "no avatar".
 */
@Component({
  selector: 'bedge-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PortfolioComponent,
    LucideAngularModule,
    ButtonComponent,
    BadgeComponent,
    InputDirective,
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private readonly artistSvc: ArtistDataService = inject(ArtistDataService);
  private readonly cloudinary: CloudinaryUploadService = inject(CloudinaryUploadService);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  // ── State ─────────────────────────────────────────────────────────────────

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);
  readonly saved = signal(false);
  readonly profile = signal<ArtistProfile | null>(null);

  readonly bio = signal('');
  readonly instagram = signal('');

  /** True while the avatar photo is uploading or being removed. */
  readonly avatarBusy = signal(false);
  readonly avatarError = signal<string | null>(null);

  /** Set when a picked file is over the 15MB limit - holds the file so
   *  confirmResizeAvatar() can act on it if the person accepts the offer
   *  to resize instead of just being told no. */
  readonly pendingOversizedAvatarFile = signal<File | null>(null);
  readonly pendingOversizedAvatarSizeMB = signal(0);

  // ── Change password ──────────────────────────────────────────────────────

  readonly currentPassword = signal('');
  readonly newPassword = signal('');
  readonly confirmNewPassword = signal('');
  readonly changePasswordTouched = signal(false);
  readonly changingPassword = signal(false);
  readonly changePasswordError = signal<string | null>(null);
  readonly changePasswordSuccess = signal(false);

  // ── Freeze account ───────────────────────────────────────────────────────

  /** Local only - not fetched from the server. Correct anyway: reaching
   *  this page at all means the account was active at login time (Login
   *  itself rejects a frozen account), and freezing doesn't invalidate
   *  the current session (see AuthStore.freezeAccount's doc comment), so
   *  this signal and the real server state can never actually drift apart
   *  within one session. */
  readonly isFrozen = signal(false);
  readonly freezing = signal(false);
  readonly freezeError = signal<string | null>(null);

  // ── Delete account ───────────────────────────────────────────────────────

  readonly confirmingDelete = signal(false);
  readonly deleteConfirmEmail = signal('');
  readonly deleting = signal(false);
  readonly deleteError = signal<string | null>(null);

  /** True when the artist has an avatar photo set. */
  get hasAvatar(): boolean {
    const url = this.profile()?.avatar_url;
    return !!url && url.trim().length > 0;
  }

  get isDirty(): boolean {
    const p = this.profile();
    if (!p) return false;
    return this.bio() !== (p.bio ?? '') || this.instagram() !== (p.instagram ?? '');
  }

  get initials(): string {
    const name = this.profile()?.name ?? '';
    const parts = name.trim().split(/\s+/);
    if (!parts[0]) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.load();
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  save(): void {
    const p = this.profile();
    if (!p || !this.isDirty) return;

    this.saving.set(true);
    this.saveError.set(null);
    this.saved.set(false);

    const bio = this.bio().trim() || undefined;
    const instagram = this.instagram().trim() || undefined;

    this.artistSvc.updateProfile(p.id, { bio, instagram }).subscribe({
      next: () => {
        this.profile.update((prev) => (prev ? { ...prev, bio, instagram } : prev));
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.saveError.set(extractApiErrorMessage(err, 'Failed to save profile. Please try again.'));
      },
    });
  }

  /** Triggered by the avatar file input. */
  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';

    this.avatarError.set(null);
    this.pendingOversizedAvatarFile.set(null);

    const result = validateImageFile(file);
    if (result.ok) {
      this.uploadAvatar(file);
      return;
    }

    if (result.reason === 'too-large') {
      // Offer a resize instead of a flat rejection - most oversized
      // avatars are just a full-resolution phone photo, not something
      // the person actually wants to go find a smaller version of.
      this.pendingOversizedAvatarFile.set(file);
      this.pendingOversizedAvatarSizeMB.set(result.sizeMB);
      return;
    }

    this.avatarError.set(result.message);
  }

  /** Person accepted the resize offer - shrink the pending file client-side
   *  and upload the result. */
  confirmResizeAvatar(): void {
    const file = this.pendingOversizedAvatarFile();
    if (!file) return;

    this.pendingOversizedAvatarFile.set(null);
    this.avatarBusy.set(true);
    this.avatarError.set(null);

    resizeImageToFit(file)
      .then((resized) => this.uploadAvatar(resized))
      .catch(() => {
        this.avatarBusy.set(false);
        this.avatarError.set('Could not resize that image. Please try a smaller photo.');
      });
  }

  dismissOversizedAvatar(): void {
    this.pendingOversizedAvatarFile.set(null);
  }

  /** Remove the current avatar photo, falling back to the default placeholder. */
  removeAvatar(): void {
    const p = this.profile();
    if (!p || !this.hasAvatar) return;

    this.avatarBusy.set(true);
    this.avatarError.set(null);

    // Empty string (not null) — see the class doc comment for why.
    this.artistSvc.updateProfile(p.id, { avatar_url: '' }).subscribe({
      next: () => {
        this.profile.update((prev) => (prev ? { ...prev, avatar_url: '' } : prev));
        this.avatarBusy.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.avatarBusy.set(false);
        this.avatarError.set(extractApiErrorMessage(err, 'Failed to remove photo. Please try again.'));
      },
    });
  }

  // ── Change password ──────────────────────────────────────────────────────

  isNewPasswordValid(): boolean {
    return this.newPassword().length >= 8;
  }

  isConfirmNewPasswordValid(): boolean {
    return this.confirmNewPassword() === this.newPassword() && this.newPassword().length > 0;
  }

  changePassword(): void {
    this.changePasswordTouched.set(true);
    this.changePasswordError.set(null);
    this.changePasswordSuccess.set(false);

    if (
      this.currentPassword().length === 0 ||
      !this.isNewPasswordValid() ||
      !this.isConfirmNewPasswordValid() ||
      this.changingPassword()
    ) {
      return;
    }

    this.changingPassword.set(true);

    this.auth
      .changePassword({
        current_password: this.currentPassword(),
        new_password: this.newPassword(),
      })
      .subscribe({
        next: () => {
          this.changingPassword.set(false);
          this.changePasswordSuccess.set(true);
          this.changePasswordTouched.set(false);
          this.currentPassword.set('');
          this.newPassword.set('');
          this.confirmNewPassword.set('');
          setTimeout(() => this.changePasswordSuccess.set(false), 3000);
        },
        error: (err: HttpErrorResponse) => {
          this.changingPassword.set(false);
          this.changePasswordError.set(
            extractApiErrorMessage(err, 'Could not change your password. Please try again.'),
          );
        },
      });
  }

  // ── Freeze account ───────────────────────────────────────────────────────

  toggleFreeze(): void {
    if (this.freezing()) return;

    this.freezing.set(true);
    this.freezeError.set(null);

    const call = this.isFrozen()
      ? this.auth.unfreezeAccount()
      : this.auth.freezeAccount();

    call.subscribe({
      next: () => {
        this.freezing.set(false);
        this.isFrozen.update((v) => !v);
      },
      error: (err: HttpErrorResponse) => {
        this.freezing.set(false);
        this.freezeError.set(
          extractApiErrorMessage(err, 'Could not update your account. Please try again.'),
        );
      },
    });
  }

  // ── Delete account ───────────────────────────────────────────────────────

  askDeleteAccount(): void {
    this.deleteConfirmEmail.set('');
    this.deleteError.set(null);
    this.confirmingDelete.set(true);
  }

  cancelDeleteAccount(): void {
    if (this.deleting()) return;
    this.confirmingDelete.set(false);
  }

  /** Requires typing the account's own email back, matching the weight of
   *  an irreversible action - not just a second click on the same button. */
  canConfirmDelete(): boolean {
    return this.deleteConfirmEmail().trim().toLowerCase() === (this.profile()?.email ?? '').toLowerCase();
  }

  confirmDeleteAccount(): void {
    if (!this.canConfirmDelete() || this.deleting()) return;

    this.deleting.set(true);
    this.deleteError.set(null);

    this.auth.deleteAccount().subscribe({
      next: () => {
        // The server clears the refresh cookie; clearSession() clears our
        // own in-memory state to match, then out to /login - deleteAccount()
        // itself doesn't touch local session state automatically (unlike
        // login/register's tap(setSession)), so this is the frontend's own
        // responsibility, not a step the store already does for us.
        this.auth.clearSession();
        this.deleting.set(false);
        this.router.navigateByUrl('/login');
      },
      error: (err: HttpErrorResponse) => {
        this.deleting.set(false);
        this.deleteError.set(
          extractApiErrorMessage(err, 'Could not delete your account. Please try again.'),
        );
      },
    });
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private uploadAvatar(file: File): void {
    const p = this.profile();
    if (!p) return;

    this.avatarBusy.set(true);
    this.avatarError.set(null);

    this.cloudinary.upload(file).subscribe({
      next: (result) => {
        this.artistSvc.updateProfile(p.id, { avatar_url: result.url }).subscribe({
          next: () => {
            this.profile.update((prev) =>
              prev ? { ...prev, avatar_url: result.url } : prev,
            );
            this.avatarBusy.set(false);
          },
          error: (err: HttpErrorResponse) => {
            this.avatarBusy.set(false);
            this.avatarError.set(
              extractApiErrorMessage(err, 'Photo uploaded but failed to save. Please try again.'),
            );
          },
        });
      },
      error: (err: HttpErrorResponse) => {
        // A real backend error now (upload goes through our own API, see
        // CloudinaryUploadService's doc comment) - extractApiErrorMessage
        // surfaces the actual reason (e.g. "That file doesn't look like a
        // valid image") instead of a generic fallback.
        this.avatarBusy.set(false);
        this.avatarError.set(extractApiErrorMessage(err, 'Upload failed. Check your connection and try again.'));
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.artistSvc.getMyProfile().subscribe({
      next: (data: ArtistProfile) => {
        this.profile.set(data);
        this.bio.set(data.bio ?? '');
        this.instagram.set(data.instagram ?? '');
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.loadError.set('Failed to load profile. Please try again.');
      },
    });
  }
}
