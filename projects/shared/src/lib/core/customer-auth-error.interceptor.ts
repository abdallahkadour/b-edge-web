import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { CustomerAuthStore } from './customer-auth.store';

/**
 * Paths where a 401 is expected and must NOT trigger a redirect: bootstrap
 * refresh (no cookie yet for a guest who's never logged in - the normal
 * case for most visitors) and the OTP request/verify calls themselves
 * (a wrong code is a form error, not an expired session).
 */
const SKIP_REDIRECT_PATHS = [
  '/customer-auth/refresh',
  '/customer-auth/request-otp',
  '/customer-auth/verify-otp',
];

/**
 * Global 401 handler for customer-pwa. Mirrors the artist dashboard's
 * authErrorInterceptor exactly, redirecting to customer-pwa's own /login
 * instead. Only ever fires in practice on the "My Bookings" screen - every
 * other route in this app (booking funnel, discover, leave-review) works
 * for a guest with no session at all, so a 401 here specifically means
 * "you need to log in to see this," not "something broke."
 */
export const customerAuthErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(CustomerAuthStore);
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
