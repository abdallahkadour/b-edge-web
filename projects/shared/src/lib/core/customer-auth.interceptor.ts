import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { CustomerAuthStore } from './customer-auth.store';

/**
 * Functional HTTP interceptor for customer-pwa. Mirrors the artist
 * dashboard's authInterceptor exactly, injecting CustomerAuthStore instead
 * of AuthStore - kept as a parallel implementation rather than a shared,
 * parameterized one, so the already-working artist interceptor is never at
 * risk from a change made for the customer side.
 *
 * Attaches the in-memory access token as a Bearer header, and sets
 * withCredentials so the httpOnly customer refresh cookie is sent on
 * /customer-auth/refresh and /customer-auth/logout.
 */
export const customerAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(CustomerAuthStore);
  const token = auth.accessToken();

  const authReq = req.clone({
    withCredentials: true,
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return next(authReq);
};
