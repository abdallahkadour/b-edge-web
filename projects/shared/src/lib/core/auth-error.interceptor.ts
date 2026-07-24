import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthStore } from './auth.store';

/**
 * Paths where a 401 is an expected, non-fatal outcome and must NOT trigger a
 * redirect: bootstrap refresh (no cookie yet) and the login/register attempts
 * themselves (wrong password is a form error, not an expired session).
 */
const SKIP_REDIRECT_PATHS = ['/auth/refresh', '/auth/login', '/auth/register'];

/**
 * Global 401 handler.
 *
 * When the access token expires mid-session, every subsequent request fails
 * with 401 and the user is left staring at "Your session expired" with no way
 * to act. This interceptor clears the stale session and sends them straight to
 * /login, preserving where they were as a returnUrl so they land back there
 * after signing in.
 */
export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthEndpoint = SKIP_REDIRECT_PATHS.some((p) => req.url.includes(p));

      if (err.status === 401 && !isAuthEndpoint) {
        const returnUrl = router.url;
        auth.clearSession();
        router.navigate(['/login'], { queryParams: { returnUrl } });
      }

      return throwError(() => err);
    }),
  );
};
