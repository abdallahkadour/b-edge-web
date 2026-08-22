import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import {
  MediaDataService,
  CloudinaryUploadService,
  extractApiErrorMessage,
  validateImageFile,
  resizeImageToFit,
} from '@bedge/shared';
import type { MediaItem } from '@bedge/shared';

/**
 * Additional-photos gallery manager for ONE product — embedded in the
 * product edit modal, shown only once a product exists (it needs a real
 * product ID to attach photos to).
 *
 * Deliberately separate from the product's own primary photo (image_url,
 * managed above this component in products.component.html) — that stays
 * the cover shown on the shop grid and everywhere else a single image was
 * already shown. This manages the EXTRA angles/views on the product-detail
 * gallery, up to 8 (enforced by the API).
 *
 * Mirrors PortfolioComponent's upload/delete pattern almost exactly
 * (Cloudinary upload → register URL with our API → reload), with one real
 * difference: there is no "set cover" action here (image_url already is
 * the cover), replaced with left/right move buttons so the artist can
 * still control gallery order without a drag-and-drop library this
 * codebase doesn't otherwise use anywhere.
 */
@Component({
  selector: 'bedge-product-photo-gallery',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-photo-gallery.component.html',
})
export class ProductPhotoGalleryComponent implements OnInit {
  private readonly mediaSvc = inject(MediaDataService);
  private readonly cloudinary = inject(CloudinaryUploadService);

  readonly productId = input.required<string>();

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly photos = signal<MediaItem[]>([]);
  readonly maxAllowed = signal(8);

  readonly uploading = signal(false);
  readonly uploadError = signal<string | null>(null);

  /** Set when a picked file is over the 15MB limit - see PortfolioComponent's
   *  identical fields for why this holds the file rather than just erroring. */
  readonly pendingOversizedFile = signal<File | null>(null);
  readonly pendingOversizedSizeMB = signal(0);

  readonly deletingId = signal<string | null>(null);
  /** Same two-tap confirm pattern as the portfolio manager - destructive
   *  and irreversible needs a deliberate second action. */
  readonly confirmingDeleteId = signal<string | null>(null);

  /** ID of the photo currently being moved, or null - disables both arrow
   *  buttons on that tile while the reorder call is in flight. */
  readonly movingId = signal<string | null>(null);

  get canAddMore(): boolean {
    return this.photos().length < this.maxAllowed();
  }

  ngOnInit(): void {
    this.load();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

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

  askToDelete(photo: MediaItem): void {
    this.error.set(null);
    this.confirmingDeleteId.set(photo.id);
  }

  cancelDelete(): void {
    this.confirmingDeleteId.set(null);
  }

  deletePhoto(photo: MediaItem): void {
    this.confirmingDeleteId.set(null);
    this.deletingId.set(photo.id);
    this.mediaSvc.deleteProductPhoto(photo.id).subscribe({
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

  /** Swaps this photo with its left/right neighbour and persists the new
   *  full order - the reorder endpoint always takes the complete list. */
  move(photo: MediaItem, direction: -1 | 1): void {
    const current = this.photos();
    const index = current.findIndex((p) => p.id === photo.id);
    const swapWith = index + direction;
    if (index === -1 || swapWith < 0 || swapWith >= current.length) return;

    const reordered = [...current];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];

    this.movingId.set(photo.id);
    this.mediaSvc
      .reorderProductPhotos(this.productId(), { ids: reordered.map((p) => p.id) })
      .subscribe({
        next: () => {
          this.photos.set(reordered);
          this.movingId.set(null);
        },
        error: () => {
          this.movingId.set(null);
          this.error.set('Failed to reorder photos. Please try again.');
        },
      });
  }

  private uploadFile(file: File): void {
    this.uploading.set(true);
    this.uploadError.set(null);

    this.cloudinary.upload(file).subscribe({
      next: (result) => {
        this.mediaSvc
          .addProductPhoto(this.productId(), { url: result.url, cloudinary_id: result.cloudinaryId })
          .subscribe({
            next: () => {
              this.uploading.set(false);
              this.load();
            },
            error: (err: HttpErrorResponse) => {
              this.uploading.set(false);
              this.uploadError.set(
                err.status === 409
                  ? `Gallery is full — maximum ${this.maxAllowed()} additional photos allowed.`
                  : 'Photo uploaded but failed to save. Please try again.',
              );
            },
          });
      },
      error: (err: HttpErrorResponse) => {
        this.uploading.set(false);
        this.uploadError.set(extractApiErrorMessage(err, 'Upload failed. Check your connection and try again.'));
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.mediaSvc.getProductPhotos(this.productId()).subscribe({
      next: (data) => {
        this.photos.set(data.photos ?? []);
        this.maxAllowed.set(data.max_allowed);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load photos. Please try again.');
      },
    });
  }
}
