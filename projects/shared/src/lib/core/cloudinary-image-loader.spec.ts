import { describe, it, expect } from 'vitest';

import { cloudinaryImageLoader } from './cloudinary-image-loader';

const BASE = 'https://res.cloudinary.com/mlop5tfg/image/upload/v1712345/bedge/pic.jpg';

describe('cloudinaryImageLoader', () => {
  it('injects format and quality when no width is requested', () => {
    expect(cloudinaryImageLoader({ src: BASE })).toBe(
      'https://res.cloudinary.com/mlop5tfg/image/upload/f_auto,q_auto/v1712345/bedge/pic.jpg',
    );
  });

  it('adds a width-limited resize when Angular asks for one', () => {
    expect(cloudinaryImageLoader({ src: BASE, width: 640 })).toBe(
      'https://res.cloudinary.com/mlop5tfg/image/upload/f_auto,q_auto,c_limit,w_640/v1712345/bedge/pic.jpg',
    );
  });

  // c_limit rather than c_fill: a 200px original asked for at 640 must stay
  // 200px, not be upscaled and re-encoded into something bigger AND blurrier.
  it('uses c_limit so a small original is never upscaled', () => {
    expect(cloudinaryImageLoader({ src: BASE, width: 2000 })).toContain('c_limit');
  });

  // Silent pass-through is the designed failure mode: a URL this loader does
  // not recognise degrades to "not optimised", never to a broken image.
  it('leaves non-Cloudinary URLs untouched', () => {
    for (const src of [
      'https://example.com/avatar.png',
      'data:image/png;base64,iVBORw0KGgo=',
      '/assets/placeholder.svg',
      '',
    ]) {
      expect(cloudinaryImageLoader({ src })).toBe(src);
    }
  });

  it('does not stack a second transformation onto a URL that already has one', () => {
    const already =
      'https://res.cloudinary.com/mlop5tfg/image/upload/w_100,c_fill/v1/bedge/pic.jpg';
    expect(cloudinaryImageLoader({ src: already })).toBe(already);
  });

  // The version segment (v1712345) looks like a transformation to a careless
  // regex. It must NOT be mistaken for one, or every image loses optimisation.
  it('treats the version segment as part of the path, not a transformation', () => {
    expect(cloudinaryImageLoader({ src: BASE, width: 320 })).toContain('f_auto');
    expect(cloudinaryImageLoader({ src: BASE, width: 320 })).toContain('/v1712345/');
  });
});
