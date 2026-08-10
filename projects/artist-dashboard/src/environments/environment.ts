/**
 * Development environment for the artist-dashboard app.
 * apiBaseUrl points at the local Go server, including /api/v1.
 * customerPwaUrl is used to build review-link/booking-link URLs to share
 * with a customer - the artist-dashboard app has no route of its own on
 * that domain, it just needs to know where to point.
 */
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api/v1',
  customerPwaUrl: 'http://localhost:4200',
};
