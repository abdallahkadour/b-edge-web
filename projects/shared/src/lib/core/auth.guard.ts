import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthStore } from './auth.store';
import type { UserRole } from '../models';

/**
 * Route guard factory. Blocks navigation unless the user is authenticated
 * and (optionally) holds one of the allowed roles. Redirects to /login,
 * preserving the attempted URL as a returnUrl query param.
 *
 * Usage in a routes file:
 *   { path: 'dashboard', canActivate: [authGuard()], ... }
 *   { path: 'admin', canActivate: [authGuard(['admin'])], ... }
 */
export function authGuard(allowedRoles?: readonly UserRole[]): CanActivateFn {
  return (_route, state) => {
    const auth = inject(AuthStore);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url },
      });
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const role = auth.role();
      if (!role || !allowedRoles.includes(role)) {
        // Authenticated but wrong role — send somewhere safe.
        return router.createUrlTree(['/']);
      }
    }

    return true;
  };
}
