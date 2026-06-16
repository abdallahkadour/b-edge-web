import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ArtistDataService } from '@bedge/shared';
import type { ArtistProfile, UpdateProfileRequest } from '@bedge/shared';

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Profile screen for the artist dashboard.
 *
 * Displays read-only identity fields (name, email, phone) fetched from the
 * artist's own profile, and editable fields (bio, Instagram handle) that map
 * to PATCH /artists/:id.
 *
 * The form auto-populates with current values on load. The Save button is
 * disabled until the artist actually changes something, preventing unnecessary
 * API calls. A success banner confirms the save and auto-dismisses after 3s.
 */
@Component({
  selector: 'bedge-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private readonly artistService = inject(ArtistDataService);

  // ── Profile data ──────────────────────────────────────────────────────────

  /** Loaded profile. Null until the API responds. */
  readonly profile = signal<ArtistProfile | null>(null);

  /** True while the profile is loading on init. */
  readonly loading = signal(true);

  /** Top-level load error. */
  readonly loadError = signal<string | null>(null);

  // ── Editable form fields ──────────────────────────────────────────────────

  /** Current value of the bio textarea. */
  readonly bio = signal('');

  /** Current value of the Instagram field. */
  readonly instagram = signal('');

  // ── Snapshot for dirty detection ──────────────────────────────────────────

  /** Bio value as loaded from the API — used to detect unsaved changes. */
  private savedBio = '';

  /** Instagram value as loaded from the API — used to detect unsaved changes. */
  private savedInstagram = '';

  // ── Save state ────────────────────────────────────────────────────────────

  /** True while the PATCH request is in flight. */
  readonly saving = signal(false);

  /** Save error message, or null. */
  readonly saveError = signal<string | null>(null);

  /** True for 3 seconds after a successful save — shows the success banner. */
  readonly saved = signal(false);

  // ── Derived ───────────────────────────────────────────────────────────────

  /**
   * True when the artist has changed at least one field from its saved value.
   * Keeps the Save button disabled when nothing has changed.
   */
  get isDirty(): boolean {
    return (
      this.bio() !== this.savedBio ||
      this.instagram() !== this.savedInstagram
    );
  }

  /** Initials derived from the artist's name, used for the avatar circle. */
  get initials(): string {
    const name = this.profile()?.name ?? '';
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.artistService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        // Populate editable fields from the loaded profile.
        this.bio.set(profile.bio ?? '');
        this.instagram.set(profile.instagram ?? '');
        // Snapshot for dirty detection.
        this.savedBio = profile.bio ?? '';
        this.savedInstagram = profile.instagram ?? '';
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('Could not load your profile. Please refresh.');
        this.loading.set(false);
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Save
  // ─────────────────────────────────────────────────────────────────────────

  /** Submit the editable fields to PATCH /artists/:id. */
  save(): void {
    const profile = this.profile();
    if (!profile || !this.isDirty || this.saving()) return;

    this.saving.set(true);
    this.saveError.set(null);

    const req: UpdateProfileRequest = {
      bio: this.bio().trim() || undefined,
      instagram: this.instagram().trim() || undefined,
    };

    this.artistService.updateProfile(profile.id, req).subscribe({
      next: (updated) => {
        // Update snapshot so dirty detection resets correctly.
        this.savedBio = updated.bio ?? '';
        this.savedInstagram = updated.instagram ?? '';
        // Reflect the server's trimmed values back into the form.
        this.bio.set(updated.bio ?? '');
        this.instagram.set(updated.instagram ?? '');
        this.saving.set(false);
        this.showSavedBanner();
      },
      error: () => {
        this.saving.set(false);
        this.saveError.set('Could not save changes. Please try again.');
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────────────

  /** Show the success banner for 3 seconds then dismiss it automatically. */
  private showSavedBanner(): void {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 3000);
  }
}