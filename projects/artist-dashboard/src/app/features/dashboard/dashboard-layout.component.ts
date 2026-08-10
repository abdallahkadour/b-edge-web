import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { tap } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

import { AuthStore } from '@bedge/shared';

/** A single navigation item in the dashboard sidebar / bottom bar. */
interface NavItem {
  path: string;
  label: string;
  /** Lucide icon name (kebab-case), registered globally in app.config.ts. */
  icon: string;
}

/**
 * Dashboard shell layout.
 *
 * Renders a fixed sidebar on desktop and a bottom tab bar on mobile.
 * All dashboard child routes are rendered inside the <router-outlet>.
 *
 * Auth state is read from AuthStore signals — no subscriptions needed.
 *
 * Nav icons use Lucide (flat-line, 2px stroke) per the B-Edge icon system —
 * no emoji, no 3D icons outside the app launcher/landing hero. Icons are
 * registered once in app.config.ts and referenced here by name.
 */
@Component({
  selector: 'bedge-dashboard-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent {
  private readonly auth: AuthStore = inject(AuthStore);
  private readonly router = inject(Router);

  /** Authenticated user — null when unauthenticated (guard prevents this). */
  readonly user = this.auth.user;

  /** Navigation items shared between the sidebar and the mobile bottom bar. */
  readonly navItems: NavItem[] = [
    { path: '/dashboard/bookings', label: 'Bookings', icon: 'calendar-days' },
    { path: '/dashboard/calendar', label: 'Calendar', icon: 'calendar' },
    { path: '/dashboard/waitlist', label: 'Waitlist', icon: 'bell' },
    { path: '/dashboard/products', label: 'Products', icon: 'package' },
    { path: '/dashboard/orders', label: 'Orders', icon: 'shopping-bag' },
    { path: '/dashboard/deposits', label: 'Deposits', icon: 'wallet' },
    { path: '/dashboard/clients',  label: 'Clients',  icon: 'users' },
    { path: '/dashboard/earnings', label: 'Earnings', icon: 'banknote' },
    { path: '/dashboard/services', label: 'Services', icon: 'scissors' },
    { path: '/dashboard/hours',    label: 'Hours',    icon: 'clock' },
    { path: '/dashboard/profile',  label: 'Profile',  icon: 'user' },
  ];

  /**
   * Returns up to two uppercase initials from a display name.
   * "Rania Khoury" → "RK". Fallback to "?" for empty strings.
   */
  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /** Sign out and navigate to /login. */
  logout(): void {
    this.auth
      .logout()
      .pipe(tap(() => this.router.navigateByUrl('/login')))
      .subscribe({
        error: () => {
          // Even if the server call fails, clear the local session
          // so the user is not stuck in a broken authenticated state.
          this.auth.clearSession();
          this.router.navigateByUrl('/login');
        },
      });
  }
}
