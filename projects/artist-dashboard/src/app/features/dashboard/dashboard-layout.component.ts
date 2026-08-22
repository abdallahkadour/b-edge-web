import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { tap } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { A11yModule } from '@angular/cdk/a11y';

import { AuthStore, OnboardingDataService } from '@bedge/shared';

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
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule, A11yModule],
  templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent {
  private readonly auth: AuthStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly onboardingSvc = inject(OnboardingDataService);

  /** Authenticated user — null when unauthenticated (guard prevents this). */
  readonly user = this.auth.user;

  /** True while status is confirmed 'pending' (not just "not yet checked" -
   *  defaults false so the normal sidebar renders during the brief window
   *  before the status check resolves, rather than flashing a restricted
   *  state for every artist on every load). Drives both the nav
   *  restriction and the banner below. */
  readonly isPending = signal(false);

  /** Profile is allow-listed for a pending artist specifically so photos
   *  can be added while waiting for review, rather than the moment
   *  they're approved and already publicly visible with an empty
   *  gallery. Nothing on the backend needed to change for this - the
   *  "my own profile" media/artist lookups were never status-gated in
   *  the first place, only the PUBLIC ones (Discover, GetArtistByID)
   *  were. This was purely a frontend gate being more restrictive than
   *  it needed to be. */
  private static readonly PENDING_ALLOWED_PATH = '/dashboard/profile';

  constructor() {
    // Safety net for the case the login redirect doesn't cover: a pending
    // or not-yet-onboarded artist typing /dashboard/bookings directly, or
    // reopening a bookmarked/stale tab. Every OTHER dashboard screen
    // resolves its data by looking up the caller's artist_id in ways that
    // implicitly assume a fully-set-up, reviewed profile (bookings,
    // clients, earnings) - that lookup fails or returns nothing useful
    // everywhere except Profile, which would otherwise read as the app
    // being broken rather than as "you're not approved yet." Admins never
    // onboard, so this check only runs for the artist role.
    if (this.auth.role() === 'artist') {
      this.onboardingSvc.getStatus().subscribe({
        next: (status) => {
          if (status.status === 'pending') {
            this.isPending.set(true);
            if (!this.router.url.startsWith(DashboardLayoutComponent.PENDING_ALLOWED_PATH)) {
              this.router.navigateByUrl(DashboardLayoutComponent.PENDING_ALLOWED_PATH);
            }
          } else if (status.status !== 'active') {
            this.router.navigateByUrl('/onboarding');
          }
        },
        error: () => this.router.navigateByUrl('/onboarding'),
      });
    }
  }

  /** The full nav list, when a profile is reviewed and active. */
  private readonly allNavItems: NavItem[] = [
    { path: '/dashboard/bookings', label: 'Bookings', icon: 'calendar-days' },
    { path: '/dashboard/calendar', label: 'Calendar', icon: 'calendar' },
    { path: '/dashboard/waitlist', label: 'Waitlist', icon: 'bell' },
    { path: '/dashboard/reviews', label: 'Reviews', icon: 'star' },
    { path: '/dashboard/products', label: 'Products', icon: 'package' },
    { path: '/dashboard/orders', label: 'Orders', icon: 'shopping-bag' },
    { path: '/dashboard/deposits', label: 'Deposits', icon: 'wallet' },
    { path: '/dashboard/clients',  label: 'Clients',  icon: 'users' },
    { path: '/dashboard/earnings', label: 'Earnings', icon: 'banknote' },
    { path: '/dashboard/services', label: 'Services', icon: 'scissors' },
    { path: '/dashboard/hours',    label: 'Hours',    icon: 'clock' },
    { path: '/dashboard/profile',  label: 'Profile',  icon: 'user' },
  ];

  /** Navigation items shared between the sidebar and the mobile bottom bar.
   *  Collapsed to just Profile while pending - every other item points at
   *  a screen whose data lookup assumes a fully-reviewed profile, and
   *  offering navigation into a screen that's guaranteed to look broken
   *  is worse than not offering it at all. */
  readonly navItems = computed<NavItem[]>(() =>
    this.isPending()
      ? this.allNavItems.filter((item) => item.path === '/dashboard/profile')
      : this.allNavItems,
  );

  /**
   * The bottom bar (mobile only) cannot fit all 11 items - it used to try,
   * rendering as a 775px-wide row inside a 390px viewport with no scroll
   * affordance, so 6 of 11 sections (Deposits, Clients, Earnings, Services,
   * Hours, Profile) were simply unreachable on a phone. Split instead:
   * the 4 highest-frequency sections stay directly on the bar, everything
   * else moves into the "More" sheet below. Profile is deliberately left
   * out of both - it already has its own entry point via the avatar button
   * in the mobile header (see the template), so repeating it here would
   * just be a second path to the same screen with no navigation it adds.
   */
  private static readonly MOBILE_PRIMARY_PATHS = [
    '/dashboard/bookings',
    '/dashboard/calendar',
    '/dashboard/orders',
    '/dashboard/clients',
  ];

  readonly mobilePrimaryNavItems = computed<NavItem[]>(() =>
    this.navItems().filter((item) => DashboardLayoutComponent.MOBILE_PRIMARY_PATHS.includes(item.path)),
  );

  readonly mobileMoreNavItems = computed<NavItem[]>(() =>
    this.navItems().filter(
      (item) =>
        !DashboardLayoutComponent.MOBILE_PRIMARY_PATHS.includes(item.path) &&
        item.path !== '/dashboard/profile',
    ),
  );

  /** Whether the mobile "More" sheet is open. Closed on navigation (each
   *  link inside it clears this itself) and on backdrop tap/Escape. */
  readonly moreOpen = signal(false);

  toggleMore(): void {
    this.moreOpen.update((v) => !v);
  }

  closeMore(): void {
    this.moreOpen.set(false);
  }

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
