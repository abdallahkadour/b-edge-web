import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthStore, ButtonComponent, CardComponent, InputDirective, extractApiErrorMessage } from '@bedge/shared';

const MIN_PASSWORD_LENGTH = 8;

/**
 * Set a new password using the token from a WhatsApp'd reset link
 * (?token=... in the URL). Second half of Gap G2's forgot/reset pair -
 * see forgot-password.component.ts's doc comment for the first half.
 *
 * Does not log the user in on success - PATCH /auth/reset-password
 * doesn't return a session (unlike login/register), so this sends them to
 * /login with the new password rather than fabricating a session client-
 * side.
 */
@Component({
  selector: 'bedge-reset-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent, CardComponent, InputDirective],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Missing/empty only if someone opens this URL with no token at all -
   *  a real but expired/invalid token still reaches submit() and gets the
   *  backend's own "invalid or expired" message, not this. */
  readonly hasToken = signal(!!this.route.snapshot.queryParamMap.get('token'));

  readonly password = signal('');
  readonly confirmPassword = signal('');
  readonly touched = signal(false);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly succeeded = signal(false);

  isPasswordValid(): boolean {
    return this.password().length >= MIN_PASSWORD_LENGTH;
  }

  isConfirmValid(): boolean {
    return this.confirmPassword() === this.password() && this.password().length > 0;
  }

  submit(): void {
    this.touched.set(true);
    this.errorMessage.set(null);

    if (!this.isPasswordValid() || !this.isConfirmValid() || this.loading()) return;

    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) return;

    this.loading.set(true);

    this.auth.resetPassword({ token, new_password: this.password() }).subscribe({
      next: () => {
        this.loading.set(false);
        this.succeeded.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          extractApiErrorMessage(err, 'Could not reset your password. Please try again.'),
        );
      },
    });
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
