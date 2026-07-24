import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

/** Result of a successful Cloudinary unsigned upload. */
export interface CloudinaryUploadResult {
  url: string;
  cloudinaryId: string;
}

/**
 * Uploads images directly from the browser to Cloudinary using an unsigned
 * upload preset. This bypasses the Go backend entirely for the file bytes —
 * only the resulting URL is later sent to POST /api/v1/media.
 *
 * Cloud name and upload preset come from environment config. The upload
 * preset MUST have "Signing Mode" set to "Unsigned" in the Cloudinary
 * dashboard, or every upload will fail with a 401.
 */
@Injectable({ providedIn: 'root' })
export class CloudinaryUploadService {
  /** Cloudinary cloud name — see environment.ts. */
  private readonly cloudName = 'mlop5tfg';

  /** Unsigned upload preset name — created in the Cloudinary dashboard. */
  private readonly uploadPreset = 'bedge-media';

  private get uploadUrl(): string {
    return `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
  }

  /**
   * Upload a single image file directly to Cloudinary.
   * Returns the public URL and the Cloudinary public_id (for later deletion).
   */
  upload(file: File): Observable<CloudinaryUploadResult> {
    return from(this.uploadFile(file));
  }

  private async uploadFile(file: File): Promise<CloudinaryUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    const response = await fetch(this.uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Cloudinary upload failed (${response.status}): ${body}`);
    }

    const data = await response.json();
    return {
      url: data.secure_url as string,
      cloudinaryId: data.public_id as string,
    };
  }
}
