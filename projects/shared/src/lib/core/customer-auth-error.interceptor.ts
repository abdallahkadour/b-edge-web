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
 * GET /orders/:id (a single order-by-id lookup) - used only by
 * order-confirmed.page.ts to enrich the post-checkout screen, which is
 * reached by GUEST customers with no session ("no account needed to book").
 * That page's own getOrder() call is explicitly written to degrade
 * gracefully on failure, but this interceptor used to win the race and
 * force-navigate to /login before the page's own handling ran - hiding the
 * order confirmation and payment instructions behind a login wall for
 * every guest checkout. Matched by UUID suffix specifically so this never
 * also swallows a real 401 from GET /orders/me (My Orders), which DOES
 * require a session and should still redirect.
 */
const ORDER_BY_ID_PATTERN = /\/orders\/[0-9a-f-]{36}(\?|$)/i;

/**
 * Global 401 handler for customer-pwa. Mirrors the artist dashboard's
 * authErrorInterceptor exactly, redirecting to customer-pwa's own /login
 * instead. Fires on "My Bookings"/"My Orders" and any other route that
 * requires a real session - every guest-facing route (booking funnel,
 * discover, leave-review, guest order confirmation) either never calls an
 * authenticated endpoint or is explicitly exempted above, so a 401 here
 * specifically means "you need to log in to see this," not "something
 * broke."
 */
export const customerAuthErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(CustomerAuthStore);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthEndpoint =
        SKIP_REDIRECT_PATHS.some((p) => req.url.includes(p)) || ORDER_BY_ID_PATTERN.test(req.url);

      if (err.status === 401 && !isAuthEndpoint) {
        const returnUrl = router.url;
        auth.clearSession();
        router.navigate(['/login'], { queryParams: { returnUrl } });
      }

      return throwError(() => err);
    }),
  );
};
