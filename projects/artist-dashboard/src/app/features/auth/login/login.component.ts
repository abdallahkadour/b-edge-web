import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import {
  AuthStore,
  ButtonComponent,
  CardComponent,
  InputDirective,
  extractApiErrorMessage,
} from '@bedge/shared';

/** Loose enough to reject "not an email" without rejecting anything the
 *  backend's own `validator:"email"` tag would actually accept. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Login screen for the artist dashboard.
 *
 * Plain signals with `[value]`/`(input)` bindings, not Angular forms - this
 * used to be a typed ReactiveFormsModule form, the one outlier against
 * every other form in this codebase (onboarding, hours, services,
 * client-detail, profile, clients all use this same signal pattern).
 * Converted to match on Aug 15, 2026 rather than converting the other five.
 */
@Component({
  selector: 'bedge-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent, CardComponent, InputDirective],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly email = signal('');
  readonly password = signal('');

  /** Set true on the first submit attempt - field errors stay hidden until then. */
  readonly touched = signal(false);

  /** True while the login request is in flight. Disables the form + button. */
  readonly loading = signal(false);

  /** A human-readable error message, or null when there is none. */
  readonly errorMessage = signal<string | null>(null);

  isEmailValid(): boolean {
    return EMAIL_PATTERN.test(this.email().trim());
  }

  isPasswordValid(): boolean {
    return this.password().length > 0;
  }

  /** Submit the form: validate, call the API, handle success and failure. */
  submit(): void {
    this.touched.set(true);
    this.errorMessage.set(null);

    if (!this.isEmailValid() || !this.isPasswordValid()) return;

    this.loading.set(true);

    this.auth.login({ email: this.email().trim(), password: this.password() }).subscribe({
      next: () => {
        // Reset loading before navigating so the button is never left stuck
        // if navigation is cancelled or loops.
        this.loading.set(false);

        // Admin ALWAYS goes to /admin, ignoring returnUrl entirely - an
        // admin account has no legitimate onboarded artist profile behind
        // it, so a returnUrl pointing into /dashboard (from an old
        // bookmark, or a link shared before this role existed) would land
        // them on a shell with nothing real to show. Artists keep the
        // normal returnUrl-or-/dashboard behaviour; DashboardLayoutComponent
        // has its own check that redirects to /onboarding if their
        // profile isn't active yet, so that case doesn't need duplicating
        // here too.
        if (this.auth.role() === 'admin') {
          this.router.navigateByUrl('/admin');
          return;
        }

        const returnUrl =
          this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          extractApiErrorMessage(
            err,
            err.status === 0
              ? 'Cannot reach the server. Check your connection and try again.'
              : 'Something went wrong while signing in. Please try again.',
          ),
        );
      },
    });
  }
}
