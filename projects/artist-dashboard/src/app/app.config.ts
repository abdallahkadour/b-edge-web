import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { catchError, of } from 'rxjs';

import { API_CONFIG, authInterceptor, AuthStore } from '@bedge/shared';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    // HttpClient with the auth interceptor (attaches JWT + credentials)
    provideHttpClient(withInterceptors([authInterceptor])),

    // Provide the API base URL to the shared library
    {
      provide: API_CONFIG,
      useValue: { baseUrl: environment.apiBaseUrl },
    },

    // On startup, try to restore the session by exchanging the httpOnly
    // refresh cookie for a fresh access token. If there is no valid cookie
    // the call fails and we boot unauthenticated — that is fine.
    provideAppInitializer(() => {
      const auth = inject(AuthStore);
      return auth.refresh().pipe(catchError(() => of(null)));
    }),
  ],
};
