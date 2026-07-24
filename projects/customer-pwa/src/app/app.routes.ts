import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'book/:artistId',
    loadComponent: () =>
      import('./features/booking-funnel/booking-funnel.page').then((m) => m.BookingFunnelPage),
  },
];