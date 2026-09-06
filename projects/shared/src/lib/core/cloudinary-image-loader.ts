import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { Provider } from '@angular/core';

/**
 * Serves every image through Cloudinary's transformation pipeline.
 *
 * WHY
 *
 * Portfolio photos and product images are the LCP element on Discover, the
 * artist profile and the shop - the three screens that matter most - and they
 * were served at whatever dimensions the artist happened to upload, in
 * whatever format their phone produced. A 4 MB portrait JPEG straight off an
 * iPhone is a slow LCP on a Lebanese mobile network and a layout shift when it
 * finally lands.
 *
 * Cloudinary already stores every one of these images and its transformation
 * API costs nothing extra. It was simply unused.
 *
 * WHY IT INJECTS RATHER THAN BUILDS
 *
 * The usual Cloudinary loader takes a public ID and constructs a URL. This API
 * hands the frontend a COMPLETE secure_url (`photo.url`, `product.image_url`),
 * so building from scratch would mean changing every response shape and every
 * model. Injecting the transformation segment after `/upload/` gets the same
 * result and touches nothing on the server:
 *
 *   https://res.cloudinary.com/x/image/upload/v123/folder/pic.jpg
 *   https://res.cloudinary.com/x/image/upload/f_auto,q_auto,w_640/v123/folder/pic.jpg
 *
 * WHAT THE TRANSFORMATIONS DO
 *
 *   f_auto  serves AVIF or WebP to browsers that accept them, JPEG otherwise.
 *           Typically the largest single win, and entirely automatic.
 *   q_auto  picks a quality level per image content - and, where the browser
 *           sends Save-Data or a slow effective connection type, drops it
 *           further. This is the one that matters on a Lebanese 3G tail.
 *   w_<n>   resizes to the width Angular actually asked for, rather than
 *           shipping a 3000px original into a 96px avatar.
 *   c_limit never upscales. A small original stays small rather than being
 *           blown up and re-encoded, which would be slower AND uglier.
 *
 * NON-CLOUDINARY URLS PASS THROUGH UNTOUCHED. Some avatars are external and
 * some tests use data URIs; rewriting those would break them, so the loader
 * recognises its own URLs and declines everything else.
 */

/** Marks the point in a Cloudinary delivery URL where transformations go. */
const UPLOAD_SEGMENT = '/image/upload/';

/**
 * Builds the transformation segment for a requested width.
 *
 * Width is optional: Angular omits it for an image with no `sizes` and no
 * fixed width, and asking Cloudinary for `w_undefined` would 400. In that case
 * format and quality still apply, which is most of the benefit.
 */
function transformations(width?: number): string {
  const base = 'f_auto,q_auto';
  return width ? `${base},c_limit,w_${width}` : base;
}

/**
 * Rewrites a Cloudinary delivery URL to include transformations.
 *
 * Exported for testing: the URL shape is the whole contract, and a silent
 * failure here degrades to "no optimisation" rather than a broken image, which
 * is exactly the kind of regression that never gets noticed.
 */
export function cloudinaryImageLoader(config: ImageLoaderConfig): string {
  const src = config.src;

  const at = src.indexOf(UPLOAD_SEGMENT);
  if (at === -1) {
    // Not a Cloudinary delivery URL - an external avatar, a data URI, a local
    // asset. Leave it exactly as it is.
    return src;
  }

  const head = src.slice(0, at + UPLOAD_SEGMENT.length);
  const tail = src.slice(at + UPLOAD_SEGMENT.length);

  // Already carries a transformation (someone hand-built a URL, or this ran
  // twice). Stacking a second one is legal in Cloudinary but produces a
  // confusing URL and can conflict, so leave it alone.
  if (/^[a-z]_[^/]*\//.test(tail)) {
    return src;
  }

  return `${head}${transformations(config.width)}/${tail}`;
}

/** Drop into an ApplicationConfig's providers to enable the loader. */
export function provideCloudinaryImageLoader(): Provider {
  return { provide: IMAGE_LOADER, useValue: cloudinaryImageLoader };
}
