import { Injectable, signal } from '@angular/core';

/** How long the banner stays up after the most recent 429 - long enough to
 *  actually be read, short enough not to linger once requests are working
 *  again. Each new 429 restarts the timer rather than stacking banners. */
const BANNER_DURATION_MS = 8000;

/**
 * Tracks whether the backend's global per-IP rate limiter (429
 * RATE_LIMIT_EXCEEDED, see internal/middleware/register.go) was just hit.
 * Shared between rateLimitInterceptor (which sets it) and
 * RateLimitBannerComponent (which reads it) - the interceptor is the only
 * place a 429 is actually observed, but the banner needs to be mounted once
 * at the app root to render above every route, so a signal in a
 * root-provided service is the connective tissue between them, same
 * shape as every other *Store in this file.
 */
@Injectable({ providedIn: 'root' })
export class RateLimitStore {
  private readonly _active = signal(false);
  readonly active = this._active.asReadonly();

  private hideTimeout?: ReturnType<typeof setTimeout>;

  trigger(): void {
    this._active.set(true);
    clearTimeout(this.hideTimeout);
    this.hideTimeout = setTimeout(() => this._active.set(false), BANNER_DURATION_MS);
  }
}
