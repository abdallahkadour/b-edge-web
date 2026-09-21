import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthStore } from './auth.store';

/**
 * Blocks navigation to a screen that only a salon owner can use.
 *
 * Chain it after authGuard:
 *   { path: 'services', canActivate: [salonOwnerGuard()], ... }
 *
 * This is NOT the authorisation boundary. The server is: every owner-only
 * write sits behind middleware.RequireSalonCapability and answers 403
 * SALON_ROLE_FORBIDDEN, and a member who edits the URL, replays a request or
 * uses the API directly is refused there. What this guard does is stop the
 * dashboard rendering a screen whose every control would fail, which is a
 * worse experience than not offering it.
 *
 * Redirects to the bookings screen rather than to /login: the user is
 * correctly signed in, they simply do not run this salon.
 */
export function salonOwnerGuard(): CanActivateFn {
  return () => {
    const auth = inject(AuthStore);
    const router = inject(Router);

    if (auth.isSalonOwner()) return true;

    return router.createUrlTree(['/dashboard/bookings']);
  };
}
