/**
 * Shared image-upload validation and client-side resize, used by every
 * upload entry point (artist avatar, portfolio photos, product photos).
 * Previously each of those four components duplicated an identical
 * type/size check inline with slightly different wording - centralised
 * here so the limit and the message only need to change in one place.
 *
 * This is a UX convenience layer only, not a security boundary: the real
 * defense (content-type sniffing, decode/re-encode, size enforcement)
 * lives server-side in b-edge-api's internal/media/upload.go, since
 * anything checked only in the browser is trivially bypassable. The point
 * of validating here too is to fail fast and cheap, and to offer a resize
 * instead of a flat rejection when a file is too large.
 */

/** Mirrors media.MaxUploadBytes in the Go backend - keep the two in sync. */
export const MAX_IMAGE_UPLOAD_BYTES = 15 * 1024 * 1024;

export type ImageValidation =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: 'not-image'; readonly message: string }
  | { readonly ok: false; readonly reason: 'too-large'; readonly message: string; readonly sizeMB: number };

/** Browser-reported File.type is a string the client controls entirely -
 *  renaming any file to end in .jpg is enough to make most browsers
 *  report "image/jpeg". This check exists to fail fast on an honest
 *  mistake (picking a PDF, a video, ...), not to catch a deliberate
 *  attempt at deception - that's the backend's job. */
export function validateImageFile(file: File): ImageValidation {
  if (!file.type.startsWith('image/')) {
    return { ok: false, reason: 'not-image', message: 'Please select an image file.' };
  }
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return {
      ok: false,
      reason: 'too-large',
      message: `This image is ${(file.size / (1024 * 1024)).toFixed(1)}MB, over the 15MB limit.`,
      sizeMB: file.size / (1024 * 1024),
    };
  }
  return { ok: true };
}

/**
 * Re-encodes a File as JPEG, scaling down and/or lowering quality until it
 * fits under maxBytes (default: MAX_IMAGE_UPLOAD_BYTES). Only ever called
 * after the person has explicitly agreed to a resize offer - never
 * automatically, since it's a lossy operation and a silent one would be
 * surprising.
 *
 * Always outputs JPEG regardless of source format, same tradeoff the
 * backend's own re-encode makes: this only runs on files already over
 * 15MB, which in practice means a full-resolution photo, not a small
 * transparent PNG icon where losing the alpha channel would be visible.
 */
export async function resizeImageToFit(file: File, maxBytes = MAX_IMAGE_UPLOAD_BYTES): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const outputName = file.name.replace(/\.\w+$/, '') + '.jpg';

  // Quality ladder tried at each scale before shrinking dimensions further -
  // most oversized uploads are large in PIXELS (a 48MP phone photo), so
  // quality reduction alone often gets there without visibly softening
  // the image via downscaling too.
  const qualities = [0.85, 0.7, 0.55, 0.4];
  const scales = [1, 0.75, 0.5, 0.35, 0.25];

  let best: Blob | null = null;

  for (const scale of scales) {
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) break;
    ctx.drawImage(bitmap, 0, 0, w, h);

    for (const quality of qualities) {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', quality),
      );
      if (!blob) continue;

      // Keep the smallest-so-far even if nothing gets under the target -
      // a best-effort result beats refusing to try at all.
      if (!best || blob.size < best.size) {
        best = blob;
      }
      if (blob.size <= maxBytes) {
        bitmap.close();
        return new File([blob], outputName, { type: 'image/jpeg' });
      }
    }
  }

  bitmap.close();
  if (!best) {
    throw new Error('Could not resize this image.');
  }
  // Smallest we could get, even though it's still over maxBytes - the
  // caller re-checks size after this and surfaces that honestly rather
  // than uploading something over the limit anyway.
  return new File([best], outputName, { type: 'image/jpeg' });
}
