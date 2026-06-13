import { Routes } from '@angular/router';
import { authGuard } from '@bedge/shared';

/**
 * Application routes.
 *
 * /login           — public, the sign-in screen
 * /dashboard       — protected (artist or admin), the shell with child sections
 *   /bookings, /services, /hours, /profile
 *
 * Everything else redirects to /dashboard; the guard bounces unauthenticated
 * users to /login with a returnUrl.
 */
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard(['artist', 'admin'])],
    loadComponent: () =>
      import('./features/dashboard/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent,
      ),
    children: [
      { path: '', redirectTo: 'bookings', pathMatch: 'full' },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/dashboard/bookings.component').then(
            (m) => m.BookingsComponent,
          ),
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./features/dashboard/services.component').then(
            (m) => m.ServicesComponent,
          ),
      },
      {
        path: 'hours',
        loadComponent: () =>
          import('./features/dashboard/hours.component').then(
            (m) => m.HoursComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/dashboard/profile.component').then(
            (m) => m.ProfileComponent,
          ),
      },
    ],
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
