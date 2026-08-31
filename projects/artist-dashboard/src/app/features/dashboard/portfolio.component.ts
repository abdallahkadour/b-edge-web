import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import {
  ArtistDataService,
  MediaDataService,
  CloudinaryUploadService,
  extractApiErrorMessage,
  validateImageFile,
  resizeImageToFit,
} from '@bedge/shared';
import type { MediaItem, Service } from '@bedge/shared';

/**
 * Portfolio photo manager — embedded in the Profile screen.
 *
 * Flow for adding a photo:
 *  1. User picks a file; validateImageFile() checks type and the 15MB
 *     limit, offering a resize instead of a flat rejection when over it.
 *  2. File uploads to our own backend (CloudinaryUploadService), which
 *     validates/re-encodes it before forwarding a clean copy to Cloudinary.
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
  private readonly artistSvc: ArtistDataService = inject(ArtistDataService);

  // ── State ─────────────────────────────────────────────────────────────────

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly photos = signal<MediaItem[]>([]);
  readonly maxAllowed = signal(20);

  /** True while a file is uploading (Cloudinary + API call). */
  readonly uploading = signal(false);
  readonly uploadError = signal<string | null>(null);

  /** Set when a picked file is over the 15MB limit - see profile.component.ts's
   *  identical fields for why this holds the file rather than just erroring. */
  readonly pendingOversizedFile = signal<File | null>(null);
  readonly pendingOversizedSizeMB = signal(0);

  /** ID of the photo currently being deleted, or null. */
  readonly deletingId = signal<string | null>(null);

  // ── Service tagging ───────────────────────────────────────────────────────
  //
  // Tagging a photo to the services it shows turns the customer-side
  // gallery into a booking entry point ("browse the look, book the look").
  // The menu is loaded once here rather than per photo.

  /** The salon's service menu, for the tag picker. */
  readonly services = signal<Service[]>([]);
  /** ID of the photo whose tag editor is open, or null. */
  readonly taggingId = signal<string | null>(null);
  /** Working set of selected service IDs while the editor is open. */
  readonly tagDraft = signal<Set<string>>(new Set());
  readonly savingTags = signal(false);
  readonly tagError = signal<string | null>(null);

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
    this.loadServices();
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Triggered by the hidden file input's (change) event. */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Reset the input so selecting the same file again re-triggers change.
    input.value = '';

    this.uploadError.set(null);
    this.pendingOversizedFile.set(null);

    const result = validateImageFile(file);
    if (result.ok) {
      this.uploadFile(file);
      return;
    }

    if (result.reason === 'too-large') {
      this.pendingOversizedFile.set(file);
      this.pendingOversizedSizeMB.set(result.sizeMB);
      return;
    }

    this.uploadError.set(result.message);
  }

  /** Person accepted the resize offer. */
  confirmResize(): void {
    const file = this.pendingOversizedFile();
    if (!file) return;

    this.pendingOversizedFile.set(null);
    this.uploading.set(true);
    this.uploadError.set(null);

    resizeImageToFit(file)
      .then((resized) => this.uploadFile(resized))
      .catch(() => {
        this.uploading.set(false);
        this.uploadError.set('Could not resize that image. Please try a smaller photo.');
      });
  }

  dismissOversized(): void {
    this.pendingOversizedFile.set(null);
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
      error: (err: HttpErrorResponse) => {
        // A real backend error now (upload goes through our own API, see
        // CloudinaryUploadService's doc comment) - surfaces the actual
        // reason instead of a generic fallback.
        this.uploading.set(false);
        this.uploadError.set(extractApiErrorMessage(err, 'Upload failed. Check your connection and try again.'));
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

  // ── Service tagging ───────────────────────────────────────────────────────

  /**
   * Loads the salon's service menu for the tag picker.
   *
   * Failure is silent and non-blocking: without the menu the tag button is
   * simply hidden, and the rest of the portfolio manager keeps working.
   * Losing the ability to upload a photo because a service list failed to
   * load would be a far worse trade.
   */
  private loadServices(): void {
    this.artistSvc.getServicesBySalon().subscribe({
      next: (services) => this.services.set(services.filter((s) => s.is_active)),
    });
  }

  /** Names of the services a photo is tagged to, for the tile caption. */
  tagNames(photo: MediaItem): string[] {
    const byId = new Map(this.services().map((s) => [s.id, s.name]));
    return (photo.service_ids ?? [])
      .map((id) => byId.get(id))
      .filter((n): n is string => !!n);
  }

  /** Resolves the id held by the open editor back to its photo. */
  photoById(id: string): MediaItem | undefined {
    return this.photos().find((p) => p.id === id);
  }

  openTagEditor(photo: MediaItem): void {
    this.tagError.set(null);
    this.tagDraft.set(new Set(photo.service_ids ?? []));
    this.taggingId.set(photo.id);
  }

  closeTagEditor(): void {
    this.taggingId.set(null);
    this.tagDraft.set(new Set());
    this.tagError.set(null);
  }

  isTagSelected(serviceId: string): boolean {
    return this.tagDraft().has(serviceId);
  }

  toggleTag(serviceId: string): void {
    // Replace the Set rather than mutating it - a signal holding the same
    // object reference does not notify, so an in-place add/delete would
    // leave the checkboxes visually stale.
    const next = new Set(this.tagDraft());
    if (next.has(serviceId)) {
      next.delete(serviceId);
    } else {
      next.add(serviceId);
    }
    this.tagDraft.set(next);
  }

  saveTags(photo: MediaItem): void {
    this.savingTags.set(true);
    this.tagError.set(null);

    const ids = [...this.tagDraft()];

    this.mediaSvc.setMediaServices(photo.id, { service_ids: ids }).subscribe({
      next: (updated) => {
        // Patch the one row in place rather than refetching the whole
        // portfolio - the response already carries the authoritative tag
        // set, and a reload would flash the grid.
        this.photos.update((list) =>
          list.map((p) => (p.id === photo.id ? { ...p, service_ids: updated.service_ids } : p)),
        );
        this.savingTags.set(false);
        this.closeTagEditor();
      },
      error: (err: HttpErrorResponse) => {
        this.savingTags.set(false);
        this.tagError.set(extractApiErrorMessage(err, 'Could not save tags. Please try again.'));
      },
    });
  }
}
