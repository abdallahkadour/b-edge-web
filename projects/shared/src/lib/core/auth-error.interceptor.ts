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
 * Whether an error means the session is over, rather than one action refused.
 *
 * 401 always has. Since 2026-10-08 so does 403 ACCOUNT_SUSPENDED: the API
 * re-reads the account on every request (security AUTH-22), so a suspended
 * account's requests answer 403 with that code, and treating it like any
 * other 403 left her on a screen where every call failed. Every other 403 -
 * NO_SALON, a role she lacks - is about the action, not the session.
 */
export function endsTheSession(err: HttpErrorResponse): boolean {
  return err.status === 401 || (err.status === 403 && err.error?.error?.code === 'ACCOUNT_SUSPENDED');
}

/**
 * Global session-end handler: a 401, or a 403 ACCOUNT_SUSPENDED (endsTheSession).
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

      if (endsTheSession(err) && !isAuthEndpoint) {
        const returnUrl = router.url;
        auth.clearSession();
        router.navigate(['/login'], { queryParams: { returnUrl } });
      }

      return throwError(() => err);
    }),
  );
};
