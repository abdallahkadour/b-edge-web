import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { CustomerAuthStore } from './customer-auth.store';

/**
 * Protects routes that require a logged-in customer (currently just
 * /my-bookings). Safe against the bootstrap timing race: as long as the
 * app registers a provideAppInitializer that awaits
 * CustomerAuthStore.refresh() before the router activates any route (see
 * customer-pwa's app.config.ts), this guard never runs before that restore
 * attempt has already resolved one way or the other.
 */
export const customerAuthGuard: CanActivateFn = (_route, state) => {
  const auth = inject(CustomerAuthStore);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
