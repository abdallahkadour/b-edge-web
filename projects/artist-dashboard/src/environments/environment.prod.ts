/**
 * Production environment for the artist-dashboard app.
 * apiBaseUrl is replaced at deploy time with the real API domain.
 * customerPwaUrl is used to build review-link/booking-link URLs to share
 * with a customer - update at deploy time alongside apiBaseUrl.
 */
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.b-edge.com/api/v1', // placeholder - update at deploy
  customerPwaUrl: 'https://app.b-edge.com', // placeholder - update at deploy
};
