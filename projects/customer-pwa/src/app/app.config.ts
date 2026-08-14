import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  importProvidersFrom,
  inject,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { catchError, of } from 'rxjs';
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
  Search,
  Info,
  Image,
  Download,
  WifiOff,
  Minus,
  Plus,
  ShoppingBag,
  BadgeCheck,
  Sparkles,
  User,
} from 'lucide-angular';

import {
  API_CONFIG,
  CustomerAuthStore,
  customerAuthInterceptor,
  customerAuthErrorInterceptor,
} from '@bedge/shared';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    // withComponentInputBinding() is what binds the :artistId route parameter
    // to the funnel page's artistId input. Without it the input is never
    // written and a required input throws NG0950.
    provideRouter(routes, withComponentInputBinding()),

    // Attaches the customer's Bearer token (when logged in) and handles
    // 401s. Most of this app is still guest-first with no session at all
    // the booking funnel, Discover, and the guest review link never touch
    // these interceptors' auth logic since they never send a token to
    // begin with. Only /my-bookings actually depends on this.
    provideHttpClient(withInterceptors([customerAuthInterceptor, customerAuthErrorInterceptor])),

    {
      provide: API_CONFIG,
      useValue: { baseUrl: environment.apiBaseUrl },
    },

    // Icons used across the customer PWA. Registered once here - never via
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
        Search,
        Info,
        Image,
        Download,
        WifiOff,
        Minus,
        Plus,
        ShoppingBag,
        BadgeCheck,
        Sparkles,
        User,
      }),
    ),

    // On startup, try to restore a customer session by exchanging the
    // httpOnly refresh cookie for a fresh access token - same pattern as
    // the artist dashboard. For the large majority of visitors (guests
    // with no account) this simply fails with no cookie present, which is
    // caught and treated as "not logged in," not an error.
    provideAppInitializer(() => {
      const auth = inject(CustomerAuthStore);
      return auth.refresh().pipe(catchError(() => of(null)));
    }),
  ],
};
