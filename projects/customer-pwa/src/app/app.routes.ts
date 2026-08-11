import { Routes } from '@angular/router';
import { customerAuthGuard } from '@bedge/shared';

export const routes: Routes = [
  {
    // The discover/browse screen - the customer's front door to B-Edge.
    // Previously the app had NO root route at all: the booking funnel below
    // was the only page that existed, reachable only via a specific artist's
    // shared link. That's fine for a single-artist launch but does not scale
    // to the actual product (a marketplace of many artists) - documented as
    // an MVP requirement in the BRD ("Home" is step 1 of the customer flow)
    // and the Product Roadmap ("Browse artist profiles", "Search and filter
    // artists" - both MVP, not Phase 2).
    path: '',
    loadComponent: () =>
      import('./features/discover/discover.page').then((m) => m.DiscoverPage),
  },
  {
    path: 'book/:artistId',
    loadComponent: () =>
      import('./features/booking-funnel/booking-funnel.page').then((m) => m.BookingFunnelPage),
  },
  {
    // Guest review link - reached via a token sent after a booking
    // completes, no account, no login. See leave-review.page.ts for why
    // this exists instead of the standard authenticated /reviews endpoint.
    path: 'review/:token',
    loadComponent: () =>
      import('./features/leave-review/leave-review.page').then((m) => m.LeaveReviewPage),
  },
  {
    // Customer login - phone + WhatsApp OTP. Entirely optional; guest
    // booking works with no account at all. Only real reason to visit
    // this route is to reach /my-bookings.
    path: 'login',
    loadComponent: () =>
      import('./features/customer-login/customer-login.page').then((m) => m.CustomerLoginPage),
  },
  {
    // Product shop. Nested under the artist so the catalogue, cart and
    // confirmation all keep the artist context in the URL - a customer can
    // share or reopen any of them and still land in the right shop.
    path: 'shop/:artistId',
    loadComponent: () =>
      import('./features/shop/shop.page').then((m) => m.ShopPage),
  },
  {
    path: 'shop/:artistId/cart',
    loadComponent: () =>
      import('./features/shop/cart.page').then((m) => m.CartPage),
  },
  {
    path: 'shop/:artistId/confirmed/:orderId',
    loadComponent: () =>
      import('./features/shop/order-confirmed.page').then((m) => m.OrderConfirmedPage),
  },
  {
    path: 'my-bookings',
    canActivate: [customerAuthGuard],
    loadComponent: () =>
      import('./features/my-bookings/my-bookings.page').then((m) => m.MyBookingsPage),
  },
  {
    path: 'my-orders',
    canActivate: [customerAuthGuard],
    loadComponent: () =>
      import('./features/my-orders/my-orders.page').then((m) => m.MyOrdersPage),
  },
  {
    path: 'my-bookings/:id',
    canActivate: [customerAuthGuard],
    loadComponent: () =>
      import('./features/booking-detail/booking-detail.page').then((m) => m.BookingDetailPage),
  },
];