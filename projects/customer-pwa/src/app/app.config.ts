import {
  provideZonelessChangeDetection,
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
  Share,
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
  rateLimitInterceptor,
  provideCloudinaryImageLoader,
} from '@bedge/shared';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    // Serves every Cloudinary image through f_auto,q_auto and a width
    // limit. These are the LCP element on the busiest screens and were
    // previously delivered at upload resolution in the uploader's format.
    // Explicit rather than implied. These apps run zoneless because zone.js
    // is simply not a dependency - which makes the single biggest performance
    // property of this frontend invisible, and one stray polyfills entry
    // enough to silently restore whole-tree change detection.
    provideZonelessChangeDetection(),
    provideCloudinaryImageLoader(),
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
    provideHttpClient(
      withInterceptors([customerAuthInterceptor, customerAuthErrorInterceptor, rateLimitInterceptor]),
    ),

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
        Share,
        Minus,
        Plus,
        ShoppingBag,
        BadgeCheck,
        Sparkles,
        User,
      }),
    ),

    // Start restoring the customer session, but do NOT block bootstrap on it.
    //
    // This used to return the observable, which made Angular wait for the
    // network before rendering anything. The overwhelming majority of
    // visitors are guests with no refresh cookie, so that was every one of
    // them staring at a blank page waiting for a request that was always
    // going to fail.
    //
    // customerAuthGuard was the only thing that depended on the wait, and it
    // now awaits CustomerAuthStore.whenRestored() itself - so the cost falls
    // on the two guarded routes instead of on Discover, the artist profile
    // and the entire booking funnel.
    //
    // Returning void rather than the promise is the whole point: fire it,
    // let the guard await it, render now.
    provideAppInitializer(() => {
      void inject(CustomerAuthStore).whenRestored();
    }),
  ],
};
