import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  importProvidersFrom,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import {
  LucideAngularModule,
  Calendar,
  CalendarDays,
  Users,
  Banknote,
  Scissors,
  Clock,
  User,
  Trash2,
  Camera,
  Wallet,
  AlertCircle,
  Check,
  Loader2,
  MessageSquare,
  Phone,
  Star,
  Bell,
  Package,
  Pencil,
  Plus,
  X,
  Image,
  FileText,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  MapPin,
  MoreHorizontal,
  Search,
} from 'lucide-angular';

import {
  API_CONFIG,
  authInterceptor,
  authErrorInterceptor,
  rateLimitInterceptor,
  AuthStore,
} from '@bedge/shared';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    // HttpClient with the auth interceptors.
    // Order matters: authInterceptor attaches the JWT on the way out,
    // authErrorInterceptor catches 401s on the way back in.
    provideHttpClient(withInterceptors([authInterceptor, authErrorInterceptor, rateLimitInterceptor])),

    // Provide the API base URL to the shared library
    {
      provide: API_CONFIG,
      useValue: { baseUrl: environment.apiBaseUrl },
    },

    // Register the Lucide icons used across the app once, here, so every
    // standalone component can reference them by string name (e.g.
    // <lucide-icon name="calendar-days">) without each component needing to
    // import and .pick() icons itself - that pattern breaks Angular's AOT
    // static analysis of the `imports` array.
    importProvidersFrom(
      LucideAngularModule.pick({
        Calendar,
        CalendarDays,
        Users,
        Banknote,
        Scissors,
        Clock,
        User,
        Trash2,
        Camera,
        Wallet,
        AlertCircle,
        Check,
        Loader2,
        MessageSquare,
        Phone,
        Star,
        Bell,
        Package,
        Pencil,
        Plus,
        X,
        Image,
        FileText,
        ShoppingBag,
        ChevronLeft,
        ChevronRight,
        ChevronUp,
        ChevronDown,
        MapPin,
        MoreHorizontal,
        Search,
      }),
    ),

    // On startup, try to restore the session by exchanging the httpOnly
    // refresh cookie for a fresh access token. If there is no valid cookie
    // the call fails and we boot unauthenticated - that is fine.
    provideAppInitializer(() => {
      const auth = inject(AuthStore);
      return auth.refresh().pipe(catchError(() => of(null)));
    }),
  ],
};
