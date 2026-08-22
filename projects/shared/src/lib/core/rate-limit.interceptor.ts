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
      if (err.status === 429) {
        rateLimitStore.trigger();
      }
      return throwError(() => err);
    }),
  );
};
