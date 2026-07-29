import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  importProvidersFrom,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  LucideAngularModule,
  ArrowLeft,
  Check,
  ChevronRight,
  Star,
  Zap,
  MapPin,
  Loader2,
  MessageSquare,
  X,
} from 'lucide-angular';

import { API_CONFIG } from '@bedge/shared';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    // withComponentInputBinding() is what binds the :artistId route parameter
    // to the funnel page's artistId input. Without it the input is never
    // written and a required input throws NG0950.
    provideRouter(routes, withComponentInputBinding()),

    // HttpClient with NO interceptors. Unlike the artist dashboard, the
    // booking funnel is guest-first — there is no JWT to attach and no 401
    // to recover from, and no session to restore at startup.
    provideHttpClient(),

    {
      provide: API_CONFIG,
      useValue: { baseUrl: environment.apiBaseUrl },
    },

    // Icons used across the customer PWA. Registered once here — never via
    // LucideAngularModule.pick() inside a component's own imports array,
    // which breaks AOT static analysis.
    importProvidersFrom(
      LucideAngularModule.pick({
        ArrowLeft,
        Check,
        ChevronRight,
        Star,
        Zap,
        MapPin,
        Loader2,
        MessageSquare,
        X,
      }),
    ),
  ],
};
