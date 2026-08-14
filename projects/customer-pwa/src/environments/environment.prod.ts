/**
 * Production environment for the customer PWA.
 *
 * Swapped in for environment.ts by the `fileReplacements` block in
 * angular.json under the production configuration. Without that block this
 * file is dead code and `ng build --configuration production` would ship
 * the development config, including whatever local IP was last used for
 * device testing.
 */
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.b-edge.com/api/v1',
};
