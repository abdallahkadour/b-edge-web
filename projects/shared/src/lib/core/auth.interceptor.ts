import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthStore } from './auth.store';

/**
 * Functional HTTP interceptor (Angular's modern style).
 *
 * Responsibilities:
 *  - Attach the in-memory access token as a Bearer header on every request.
 *  - Set withCredentials so the httpOnly refresh cookie is sent on the
 *    /auth/refresh and /auth/logout calls (and any same-origin credentialed call).
 *
 * It deliberately does NOT attempt token refresh-on-401 here; that belongs in a
 * dedicated refresh interceptor so the concerns stay separate and testable.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const token = auth.accessToken();

  const authReq = req.clone({
    withCredentials: true,
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return next(authReq);
};
