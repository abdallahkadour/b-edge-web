import { Routes } from '@angular/router';
import { authGuard } from '@bedge/shared';

/**
 * Application routes.
 *
 * /login           — public, the sign-in screen
 * /register        — public, artist sign-up (POST /auth/register)
 * /forgot-password — public, request a reset link
 * /reset-password  — public, ?token=... from the reset link
 * /dashboard       — protected (artist or admin), the shell with child sections
 *   /bookings      — upcoming and past bookings
 *   /clients       — CRM client list
 *   /clients/:id   — single client detail + notes
 *   /earnings      — revenue summary
 *   /deposits      — deposit verification queue
 *   /calendar      — weekly appointment calendar
 *   /waitlist      — customers waiting for a fully-booked date
 *   /services      — service catalogue management
 *   /hours         — business hours + block dates
 *   /profile       — artist profile + portfolio
 */
export const routes: Routes = [
  {
    path: 'onboarding',
    canActivate: [authGuard(['artist'])],
    loadComponent: () =>
      import('./features/onboarding/onboarding.page').then((m) => m.OnboardingPage),
  },
  {
    // Admin gets its OWN top-level route, not a child of /dashboard - at
    // most two admin accounts will ever exist (cmd/seedadmin), and their
    // whole job is one screen: the pending-review queue. The 13-item
    // artist dashboard sidebar is chrome built for a different actor.
    path: 'admin',
    canActivate: [authGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/admin.page').then((m) => m.AdminPage),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent,
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
        path: 'clients',
        loadComponent: () =>
          import('./features/dashboard/clients.component').then(
            (m) => m.ClientsComponent,
          ),
      },
      {
        path: 'clients/:id',
        loadComponent: () =>
          import('./features/dashboard/client-detail.component').then(
            (m) => m.ClientDetailComponent,
          ),
      },
      {
        path: 'earnings',
        loadComponent: () =>
          import('./features/dashboard/earnings.component').then(
            (m) => m.EarningsComponent,
          ),
      },
      {
        path: 'deposits',
        loadComponent: () =>
          import('./features/dashboard/deposit-queue.component').then(
            (m) => m.DepositQueueComponent,
          ),
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./features/dashboard/calendar.component').then(
            (m) => m.CalendarComponent,
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/dashboard/products.component').then(
            (m) => m.ProductsComponent,
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/dashboard/orders.component').then(
            (m) => m.OrdersComponent,
          ),
      },
      {
        path: 'waitlist',
        loadComponent: () =>
          import('./features/dashboard/waitlist.component').then(
            (m) => m.WaitlistComponent,
          ),
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./features/dashboard/reviews.component').then(
            (m) => m.ReviewsComponent,
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
  {
    // Must stay last - Angular matches routes in declared order. Used to be
    // `redirectTo: 'dashboard'`, which silently dropped a mistyped/stale
    // URL onto the bookings list with no indication anything was wrong.
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
