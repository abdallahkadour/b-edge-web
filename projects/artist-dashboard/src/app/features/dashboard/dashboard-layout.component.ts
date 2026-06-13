import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';

import { AuthStore } from '@bedge/shared';

/**
 * Dashboard shell for the artist app.
 *
 * Responsive navigation: a left sidebar on desktop (>= md) and a bottom tab
 * bar on mobile. The header shows the B-Edge wordmark, the signed-in user's
 * name, and a sign-out action. The <router-outlet> renders the active section.
 */
@Component({
  selector: 'bedge-dashboard-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  /** The signed-in user, for the header greeting. */
  readonly user = this.auth.user;

  /** Navigation items shown in both the sidebar and the bottom bar. */
  readonly navItems = [
    { path: 'bookings', label: 'Bookings', icon: 'calendar' },
    { path: 'services', label: 'Services', icon: 'sparkles' },
    { path: 'hours', label: 'Hours', icon: 'clock' },
    { path: 'profile', label: 'Profile', icon: 'user' },
  ] as const;

  /** Sign out: revoke the refresh token, clear state, return to login. */
  signOut(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      // Even if the server call fails, the local session is cleared by the
      // store; send the user to login regardless.
      error: () => this.router.navigateByUrl('/login'),
    });
  }
}
