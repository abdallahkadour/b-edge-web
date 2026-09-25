import { Routes } from '@angular/router';
import { authGuard, salonOwnerGuard } from '@bedge/shared';

/**
 * Application routes.
 *
 * /pricing         — public, subscription plans (reads GET /billing/plans)
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
 *   /billing       — subscription plan, invoices, submit OMT/Whish payment
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
    // Public - unlike every other route here except login/register, this
    // has no canActivate guard on purpose. Someone deciding whether to
    // sign up has no account yet, so gating pricing behind auth would mean
    // gating it behind the very decision it's meant to inform.
    path: 'pricing',
    loadComponent: () =>
      import('./features/pricing/pricing.page').then((m) => m.PricingPage),
  },
  {
    // Public: the invitee may have no account yet, and gating this behind
    // auth would hide the salon's name behind a sign-in wall for someone
    // who has not yet decided whether to accept.
    path: 'join/:token',
    loadComponent: () =>
      import('./features/join/join-salon.page').then((m) => m.JoinSalonPage),
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
        path: 'billing',
        loadComponent: () =>
          import('./features/dashboard/billing.component').then(
            (m) => m.BillingComponent,
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
        // Owner only - the salon's product catalogue are shared by the whole
        // salon. The server refuses a member's writes with 403
        // SALON_ROLE_FORBIDDEN regardless; this stops the screen rendering.
        canActivate: [salonOwnerGuard()],
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
        path: 'discounts',
        // Owner only - the salon's discount codes are shared by the whole
        // salon. The server refuses a member's writes with 403
        // SALON_ROLE_FORBIDDEN regardless; this stops the screen rendering.
        canActivate: [salonOwnerGuard()],
        loadComponent: () =>
          import('./features/dashboard/discounts.component').then(
            (m) => m.DiscountsComponent,
          ),
      },
      {
        path: 'services',
        // Owner only - the salon's menu and prices are shared by the whole
        // salon. The server refuses a member's writes with 403
        // SALON_ROLE_FORBIDDEN regardless; this stops the screen rendering.
        canActivate: [salonOwnerGuard()],
        loadComponent: () =>
          import('./features/dashboard/services.component').then(
            (m) => m.ServicesComponent,
          ),
      },
      {
        // The salon roster. Owner-only: a member has nobody to manage, and
        // the API refuses every write on this screen for them anyway.
        path: 'team',
        canActivate: [salonOwnerGuard()],
        loadComponent: () =>
          import('./features/dashboard/team.component').then(
            (m) => m.TeamComponent,
          ),
      },
      {
        // The owner setting a specific member's prices. Owner-only for the
        // same reason as /team - the API refuses a member's writes here too.
        path: 'team/:artistId/services',
        canActivate: [salonOwnerGuard()],
        loadComponent: () =>
          import('./features/dashboard/member-services.page').then(
            (m) => m.MemberServicesPage,
          ),
      },
      {
        // An artist's OWN working hours. Deliberately not owner-guarded -
        // this is the screen a salon member needs most, and store hours
        // (the owner's) live at /dashboard/hours.
        path: 'my-hours',
        loadComponent: () =>
          import('./features/dashboard/my-schedule.component').then(
            (m) => m.MyScheduleComponent,
          ),
      },
      {
        // An artist's OWN services and prices. Not owner-guarded (PP-3).
        path: 'my-services',
        loadComponent: () =>
          import('./features/dashboard/my-services.page').then(
            (m) => m.MyServicesPage,
          ),
      },
      {
        path: 'hours',
        // Owner only - the stores' opening hours are shared by the whole
        // salon. The server refuses a member's writes with 403
        // SALON_ROLE_FORBIDDEN regardless; this stops the screen rendering.
        canActivate: [salonOwnerGuard()],
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
      {
        path: 'help',
        loadComponent: () =>
          import('./features/dashboard/help/help.component').then(
            (m) => m.HelpComponent,
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
