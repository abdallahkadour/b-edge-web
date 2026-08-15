import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { MediaDataService, CloudinaryUploadService } from '@bedge/shared';
import type { MediaItem } from '@bedge/shared';

/**
 * Portfolio photo manager — embedded in the Profile screen.
 *
 * Flow for adding a photo:
 *  1. User picks a file from their device.
 *  2. File uploads directly to Cloudinary (browser → Cloudinary, unsigned preset).
 *  3. The returned Cloudinary URL + public_id are POSTed to our Go API.
 *  4. The portfolio grid refreshes.
 *
 * Supports: upload, delete, and set-cover. Max 20 photos (enforced by API).
 */
@Component({
  selector: 'bedge-portfolio',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './portfolio.component.html',
})
export class PortfolioComponent implements OnInit {
  private readonly mediaSvc: MediaDataService = inject(MediaDataService);
  private readonly cloudinary: CloudinaryUploadService = inject(CloudinaryUploadService);

  // ── State ─────────────────────────────────────────────────────────────────

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly photos = signal<MediaItem[]>([]);
  readonly maxAllowed = signal(20);

  /** True while a file is uploading (Cloudinary + API call). */
  readonly uploading = signal(false);
  readonly uploadError = signal<string | null>(null);

  /** ID of the photo currently being deleted, or null. */
  readonly deletingId = signal<string | null>(null);

  /**
   * Which photo, if any, is currently asking "are you sure?".
   *
   * Deletion was previously a single tap that fired the HTTP call
   * immediately - on a touch grid of small overlay buttons, one mis-tap
   * permanently destroyed an artist's portfolio photo with no undo and no
   * way to recover the original file. Destructive and irreversible needs a
   * deliberate second action.
   */
  readonly confirmingDeleteId = signal<string | null>(null);

  /** ID of the photo currently being set as cover, or null. */
  readonly settingCoverId = signal<string | null>(null);

  /** True when the portfolio has room for more photos. */
  get canAddMore(): boolean {
    return this.photos().length < this.maxAllowed();
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.load();
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Triggered by the hidden file input's (change) event. */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Reset the input so selecting the same file again re-triggers change.
    input.value = '';

    if (!file.type.startsWith('image/')) {
      this.uploadError.set('Please select an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.uploadError.set('Image must be smaller than 10MB.');
      return;
    }

    this.uploadFile(file);
  }

  /** Delete a photo from the portfolio. */
  /** First tap: arm the confirmation for this tile. */
  askToDelete(photo: MediaItem): void {
    this.error.set(null);
    this.confirmingDeleteId.set(photo.id);
  }

  /** Backing out of a confirmation. */
  cancelDelete(): void {
    this.confirmingDeleteId.set(null);
  }

  /** Second tap: actually delete. */
  deletePhoto(photo: MediaItem): void {
    this.confirmingDeleteId.set(null);
    this.deletingId.set(photo.id);
    this.mediaSvc.deletePhoto(photo.id).subscribe({
      next: () => {
        this.photos.update((list) => list.filter((p) => p.id !== photo.id));
        this.deletingId.set(null);
      },
      error: () => {
        this.deletingId.set(null);
        this.error.set('Failed to delete photo. Please try again.');
      },
    });
  }

  /** Promote a photo to be the cover (first in the grid). */
  setCover(photo: MediaItem): void {
    if (photo.display_order === 0) return; // already the cover

    this.settingCoverId.set(photo.id);
    this.mediaSvc.setCover(photo.id).subscribe({
      next: () => {
        this.settingCoverId.set(null);
        this.load(); // reload to get fresh display_order values
      },
      error: () => {
        this.settingCoverId.set(null);
        this.error.set('Failed to set cover photo. Please try again.');
      },
    });
  }

  /** Returns true if this photo is currently the cover (first). */
  isCover(photo: MediaItem): boolean {
    return photo.display_order === 0;
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private uploadFile(file: File): void {
    this.uploading.set(true);
    this.uploadError.set(null);

    this.cloudinary.upload(file).subscribe({
      next: (result) => {
        // Cloudinary upload succeeded — now register it with our API.
        this.mediaSvc
          .addPhoto({ url: result.url, cloudinary_id: result.cloudinaryId })
          .subscribe({
            next: () => {
              this.uploading.set(false);
              this.load(); // reload the full portfolio
            },
            error: (err: HttpErrorResponse) => {
              this.uploading.set(false);
              this.uploadError.set(
                err.status === 409
                  ? 'Portfolio is full — maximum 20 photos allowed.'
                  : 'Photo uploaded but failed to save. Please try again.',
              );
            },
          });
      },
      error: () => {
        this.uploading.set(false);
        this.uploadError.set('Upload failed. Check your connection and try again.');
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.mediaSvc.getMyPortfolio().subscribe({
      next: (data) => {
        this.photos.set(data.photos ?? []);
        this.maxAllowed.set(data.max_allowed);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load portfolio. Please try again.');
      },
    });
  }
}
