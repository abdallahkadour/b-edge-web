import { Injectable, inject } from '@angular/core';
import { Observable, from, firstValueFrom } from 'rxjs';

import { ApiService } from './api.service';

/** Result of a successful Cloudinary upload. */
export interface CloudinaryUploadResult {
  url: string;
  cloudinaryId: string;
}

/** What GET /media/signature returns. Deliberately contains no secret. */
interface UploadSignature {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
}

/**
 * Uploads images from the browser to Cloudinary using a SIGNED upload.
 *
 * Previously this used an unsigned upload preset, with the cloud name and
 * preset hardcoded in this file. Both shipped in the JS bundle, and an
 * unsigned preset needs nothing else - so anyone who opened devtools could
 * push unlimited content into the Cloudinary account with no
 * authentication at all. That is a billing and content-moderation
 * exposure, and it was the single hard blocker on going live.
 *
 * Now: the browser first asks our own backend for a short-lived signature
 * (an authenticated, artist-only endpoint), then attaches it to the
 * upload. Cloudinary rejects anything without a valid signature. The API
 * secret stays on the server and is never sent to the client.
 *
 * The file bytes still travel browser -> Cloudinary directly, which is the
 * point: authorisation control without proxying large uploads through Go.
 */
@Injectable({ providedIn: 'root' })
export class CloudinaryUploadService {
  private readonly api = inject(ApiService);

  upload(file: File): Observable<CloudinaryUploadResult> {
    return from(this.uploadFile(file));
  }

  private async uploadFile(file: File): Promise<CloudinaryUploadResult> {
    // Fetch a fresh signature per upload. Signatures are timestamped and
    // single-purpose; caching one would only widen the window in which a
    // leaked signature stays usable, for no real gain.
    const sig = await firstValueFrom(
      this.api.get<UploadSignature>('/media/signature'),
    );

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', sig.api_key);
    formData.append('timestamp', String(sig.timestamp));
    formData.append('signature', sig.signature);
    // Must exactly match the folder the backend signed, or Cloudinary
    // rejects the upload as a signature mismatch.
    formData.append('folder', sig.folder);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`;

    const response = await fetch(uploadUrl, { method: 'POST', body: formData });

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
