import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthStore, ButtonComponent, CardComponent, InputDirective } from '@bedge/shared';

/** Same pattern as login/register - loose enough to reject "not an email"
 *  without rejecting anything the backend's own `validator:"email"` tag
 *  would actually accept. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Request a password reset link - the login page already had a "Forgot
 * password?" link pointing here with nothing at the other end (see
 * project-docs/E2E-TEST-PLAN.md §4, Gap G2).
 *
 * Always shows the same success message regardless of whether the email
 * is actually registered, matching the backend's own deliberate
 * non-revealing behaviour (POST /auth/forgot-password always returns 200)
 * - a different message for "email exists" vs "email doesn't exist" would
 * turn this screen into an account-enumeration oracle.
 */
@Component({
  selector: 'bedge-forgot-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent, CardComponent, InputDirective],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  private readonly auth = inject(AuthStore);

  readonly email = signal('');
  readonly touched = signal(false);
  readonly loading = signal(false);

  /** True once a request has been sent - swaps the form for the generic
   *  confirmation message. Never set back to false; if they want to try a
   *  different email, "Sign in" and "Sign up" links are right there. */
  readonly submitted = signal(false);

  isEmailValid(): boolean {
    return EMAIL_PATTERN.test(this.email().trim());
  }

  submit(): void {
    this.touched.set(true);
    if (!this.isEmailValid() || this.loading()) return;

    this.loading.set(true);

    this.auth.forgotPassword({ email: this.email().trim() }).subscribe({
      // Same handler for success and error - the backend itself never
      // distinguishes "email sent" from "email not found" (both 200), and
      // a network-level failure here isn't worth a different message
      // either: retrying costs nothing, and a more specific error would
      // only invite probing for which emails exist.
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
    });
  }
}
