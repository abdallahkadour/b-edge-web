import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';

import { ArtistDataService, CloudinaryUploadService } from '@bedge/shared';
import type { ArtistProfile } from '@bedge/shared';

import { PortfolioComponent } from './portfolio.component';

/**
 * Profile screen — edit bio + instagram handle, upload/remove avatar photo,
 * manage portfolio photos.
 *
 * Avatar upload flow:
 *  1. User picks a photo.
 *  2. Uploads directly to Cloudinary (unsigned preset).
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
  imports: [FormsModule, PortfolioComponent, LucideAngularModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private readonly artistSvc: ArtistDataService = inject(ArtistDataService);
  private readonly cloudinary: CloudinaryUploadService = inject(CloudinaryUploadService);

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
      error: () => {
        this.saving.set(false);
        this.saveError.set('Failed to save profile. Please try again.');
      },
    });
  }

  /** Triggered by the avatar file input. */
  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';

    if (!file.type.startsWith('image/')) {
      this.avatarError.set('Please select an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.avatarError.set('Image must be smaller than 10MB.');
      return;
    }

    this.uploadAvatar(file);
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
      error: () => {
        this.avatarBusy.set(false);
        this.avatarError.set('Failed to remove photo. Please try again.');
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
          error: () => {
            this.avatarBusy.set(false);
            this.avatarError.set('Photo uploaded but failed to save. Please try again.');
          },
        });
      },
      error: () => {
        this.avatarBusy.set(false);
        this.avatarError.set('Upload failed. Check your connection and try again.');
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
