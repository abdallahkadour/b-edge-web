import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiService } from './api.service';

/** Result of a successful image upload. */
export interface CloudinaryUploadResult {
  url: string;
  cloudinaryId: string;
}

/** What POST /media/upload returns. */
interface UploadImageResponse {
  url: string;
  cloudinary_id: string;
}

/**
 * Uploads an image via B-Edge's own backend, which validates and
 * re-encodes it before forwarding a clean copy to Cloudinary.
 *
 * History here matters. This started as an UNSIGNED Cloudinary upload
 * preset, with the cloud name and preset hardcoded in the shipped JS
 * bundle - anyone with devtools could push unlimited content with no
 * authentication at all. That was fixed by switching to a SIGNED upload:
 * the browser asked our backend for a short-lived signature, then
 * uploaded directly to Cloudinary with it. That closed the auth hole, but
 * the file bytes still went straight from the browser to Cloudinary,
 * completely unexamined by our own server - a renamed executable, a
 * polyglot file, or anything else disguised as an image would upload
 * exactly as successfully as a real photo.
 *
 * Now: the file goes to OUR backend first. It sniffs the real content
 * type from the bytes (not the client-supplied, trivially-spoofed
 * File.type), decodes the image, and re-encodes a brand new file from the
 * decoded pixel data before uploading THAT to Cloudinary - never the
 * client's original bytes. A disguised non-image file simply fails to
 * decode and is rejected before it ever reaches storage. See
 * b-edge-api's internal/media/upload.go for the full pipeline.
 */
@Injectable({ providedIn: 'root' })
export class CloudinaryUploadService {
  private readonly api = inject(ApiService);

  upload(file: File): Observable<CloudinaryUploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    // FormData as the body makes HttpClient skip JSON serialisation and
    // let the browser set its own `multipart/form-data; boundary=...`
    // header - no special-casing needed here, same post() every other
    // authenticated call in this app uses.
    return this.api.post<UploadImageResponse>('/media/upload', formData).pipe(
      map((res) => ({ url: res.url, cloudinaryId: res.cloudinary_id })),
    );
  }
}
