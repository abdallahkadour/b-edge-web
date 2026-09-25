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

import { AuthStore, BillingDataService, MembershipDataService, OnboardingDataService } from '@bedge/shared';
import type { SubscriptionStatus } from '@bedge/shared';

import { NotificationBellComponent } from './notification-bell.component';

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
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideAngularModule,
    A11yModule,
    NotificationBellComponent,
  ],
  templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent {
  private readonly auth: AuthStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly onboardingSvc = inject(OnboardingDataService);
  private readonly billingSvc = inject(BillingDataService);
  private readonly membershipSvc = inject(MembershipDataService);

  /** Authenticated user — null when unauthenticated (guard prevents this). */
  readonly user = this.auth.user;

  /** Subscription status for the billing enforcement banners, or null while
   *  loading or if the fetch fails. Only ever set for artist accounts — admins
   *  have no subscription. The banner is informational; a missing status just
   *  means no banner is shown (fail open, same as the backend middleware). */
  readonly subscriptionStatus = signal<SubscriptionStatus | null>(null);

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
   *  it needed to be.
   *
   *  My services joins it for the same reason: a pending artist should be
   *  able to choose what she offers while she waits for approval, rather
   *  than discover the switch only exists once she's already reviewed -
   *  see join-salon.page.ts, which shows this same screen at the join
   *  step for exactly that reason. [0] is the redirect target; the
   *  "is this URL allowed" check below tests membership in the whole list. */
  private static readonly PENDING_ALLOWED_PATHS = [
    '/dashboard/profile',
    '/dashboard/my-services',
  ];

  /** Salon headcount, once known - see the constructor guard below for why
   *  this is only ever fetched for a salon owner. Null until that resolves
   *  (or forever, for anyone the fetch was skipped for or that it failed
   *  for); navItems() reads a null the same as "solo salon". */
  private readonly artistCount = signal<number | null>(null);

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
            if (!DashboardLayoutComponent.PENDING_ALLOWED_PATHS.some((p) => this.router.url.startsWith(p))) {
              this.router.navigateByUrl(DashboardLayoutComponent.PENDING_ALLOWED_PATHS[0]);
            }
          } else if (status.status !== 'active') {
            this.router.navigateByUrl('/onboarding');
          }
        },
        error: () => this.router.navigateByUrl('/onboarding'),
      });

      // Fire-and-forget — the banner appears once the fetch resolves.
      // Errors are swallowed: the banner is informational, and a missing
      // status should not prevent the dashboard from rendering.
      this.billingSvc.getMySubscription().subscribe({
        next: (sub) => this.subscriptionStatus.set(sub.status ?? null),
        error: () => {},
      });
    }

    // PP-8: only an owner's nav is ever gated on headcount (see navItems()
    // below), so this only fires for one. That also keeps it from running
    // for an admin (role !== 'artist', and listMembers is an artist-salon
    // endpoint) or for an artist whose token predates joining any salon
    // (salonRole 'none' - isSalonOwner() is false there too, see
    // salon-role.util.ts), where the call would have nothing to answer.
    if (this.auth.role() === 'artist' && this.auth.isSalonOwner()) {
      this.membershipSvc.listMembers().subscribe({
        next: (members) => this.artistCount.set(members.length),
        error: () => {
          // Left null. navItems() treats null the same as a solo salon and
          // hides "My services" - the safe default when headcount couldn't
          // be confirmed, rather than assuming a team exists.
        },
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
    { path: '/dashboard/billing',  label: 'Billing',  icon: 'credit-card' },
    { path: '/dashboard/clients',  label: 'Clients',  icon: 'users' },
    { path: '/dashboard/earnings', label: 'Earnings', icon: 'banknote' },
    { path: '/dashboard/services', label: 'Services', icon: 'scissors' },
    { path: '/dashboard/discounts', label: 'Promos', icon: 'tag' },
    { path: '/dashboard/my-hours', label: 'My hours', icon: 'clock' },
    { path: '/dashboard/my-services', label: 'My services', icon: 'scissors' },
    { path: '/dashboard/hours',    label: 'Store hours', icon: 'calendar-clock' },
    { path: '/dashboard/team',     label: 'Team',     icon: 'users-round' },
    { path: '/dashboard/profile',  label: 'Profile',  icon: 'user' },
    { path: '/dashboard/help',     label: 'Help',     icon: 'circle-help' },
  ];

  /** Navigation items shared between the sidebar and the mobile bottom bar.
   *  Collapsed to just Profile while pending - every other item points at
   *  a screen whose data lookup assumes a fully-reviewed profile, and
   *  offering navigation into a screen that's guaranteed to look broken
   *  is worse than not offering it at all. */
  /**
   * Screens that manage something the whole salon shares, and so belong to
   * the salon owner. A member sees no link to them and salonOwnerGuard turns
   * them back if they type the URL; the server refuses the writes either way
   * with 403 SALON_ROLE_FORBIDDEN.
   *
   * Billing is deliberately NOT here. Subscriptions are still keyed on
   * artists.id, so /dashboard/billing shows the signed-in artist their own
   * subscription. It moves to the salon in Phase 3 and joins this list then.
   *
   * Every artist on B-Edge today owns their own one-member salon, so this
   * filter removes nothing from anyone currently using the product.
   */
  private static readonly OWNER_ONLY_PATHS = [
    '/dashboard/team',
    '/dashboard/services',
    '/dashboard/hours',
    '/dashboard/discounts',
    '/dashboard/products',
  ];

  readonly navItems = computed<NavItem[]>(() => {
    if (this.isPending()) {
      return this.allNavItems.filter(
        (item) =>
          DashboardLayoutComponent.PENDING_ALLOWED_PATHS.includes(item.path) ||
          item.path === '/dashboard/help',
      );
    }
    const items = this.auth.isSalonOwner()
      ? this.allNavItems
      : this.allNavItems.filter(
          (item) => !DashboardLayoutComponent.OWNER_ONLY_PATHS.includes(item.path),
        );
    // PP-8: a solo salon has nobody else to price differently, so the
    // screen would just mirror the salon's own menu back at her with
    // nothing to do on it. (artistCount() ?? 1) treats "not yet known" the
    // same as "solo" - see the constructor's load and its doc comment.
    if (this.auth.isSalonOwner() && (this.artistCount() ?? 1) <= 1) {
      return items.filter((item) => item.path !== '/dashboard/my-services');
    }
    return items;
  });

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
        item.path !== '/dashboard/profile' &&
        item.path !== '/dashboard/help',
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
