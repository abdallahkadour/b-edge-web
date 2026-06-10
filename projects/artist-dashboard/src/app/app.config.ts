import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { API_CONFIG, authInterceptor } from '@bedge/shared';

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
  ],
};