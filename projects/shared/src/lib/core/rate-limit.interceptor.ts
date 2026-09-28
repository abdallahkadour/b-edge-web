import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { RateLimitStore } from './rate-limit.store';

/**
 * Global 429 handler, shared by both apps. Before this existed, a request
 * hitting the backend's per-IP rate limiter (see maxRequestsPerWindow in
 * internal/middleware/register.go) failed with no visible feedback at
 * all - whatever screen made the call either showed its own generic
 * "failed to load" message (indistinguishable from a real outage) or,
 * for background/fire-and-forget calls, nothing whatsoever. This doesn't
 * replace a page's own error handling - it just guarantees a 429
 * specifically is never completely silent, by flipping a shared signal a
 * banner mounted at the app root reads.
 */
export const rateLimitInterceptor: HttpInterceptorFn = (req, next) => {
  const rateLimitStore = inject(RateLimitStore);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 429 && !namesItsOwnReason(err)) {
        rateLimitStore.trigger();
      }
      return throwError(() => err);
    }),
  );
};

/**
 * The banner says "You're making requests too quickly", which is true of the
 * general per-address limiter (RATE_LIMIT_EXCEEDED) and of nothing else. A
 * 429 carrying any other code - TOO_MANY_HOLDS, TOO_MANY_CODE_ATTEMPTS, the
 * sign-in RATE_LIMITED - has its own message, which the screen that made the
 * call shows; the banner on top of it told her something false (found
 * 2026-09-28: the 2-hold limit showed both). A 429 with no code at all - an
 * edge or proxy - still gets the banner, so no 429 is ever silent.
 */
function namesItsOwnReason(err: HttpErrorResponse): boolean {
  const code = (err.error as { error?: { code?: unknown } } | null)?.error?.code;
  return typeof code === 'string' && code !== 'RATE_LIMIT_EXCEEDED';
}
