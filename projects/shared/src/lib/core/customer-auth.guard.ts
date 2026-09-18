import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { CustomerAuthStore } from './customer-auth.store';

/**
 * Protects routes that require a signed-in customer.
 *
 * WHY THIS AWAITS INSTEAD OF THE APP INITIALIZER
 *
 * The startup session restore used to be awaited by provideAppInitializer, so
 * Angular did not bootstrap at all until that network call returned. On a slow
 * connection the first thing a visitor saw was a blank white page - and the
 * overwhelming majority of visitors are guests with no refresh cookie, being
 * made to wait for a request that was always going to fail.
 *
 * This guard was the only thing that needed the wait: without it, a signed-in
 * customer opening /my-bookings directly would be bounced to /login because
 * the store had not been populated yet. Awaiting here moves the cost from
 * every route onto the two that are actually guarded, so Discover, an artist
 * profile and the whole booking funnel now paint immediately.
 *
 * whenRestored() is idempotent, so this can run on several routes without
 * triggering several refreshes.
 */
export const customerAuthGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(CustomerAuthStore);
  const router = inject(Router);

  await auth.whenRestored();

  if (auth.isAuthenticated()) return true;

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
