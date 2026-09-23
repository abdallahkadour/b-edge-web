import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import {
  AuthStore,
  ButtonComponent,
  CardComponent,
  InputDirective,
  extractApiErrorMessage,
} from '@bedge/shared';

/** Loose enough to reject "not an email" without rejecting anything the
 *  backend's own `validator:"email"` tag would actually accept. Same
 *  pattern as login.component.ts. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mirrors the backend's own `validate:"required,min=8"` on
 *  RegisterRequest.Password - the point is to fail fast on the client with
 *  the same rule the server enforces anyway, not to invent a stricter
 *  policy the backend doesn't actually require. */
const MIN_PASSWORD_LENGTH = 8;

/**
 * Sign-up screen for the artist dashboard - the missing first step before
 * onboarding. POST /auth/register existed with no UI path to it at all
 * (confirmed by reading the frontend source, not assumed - see
 * project-docs/E2E-TEST-PLAN.md §4, Gap G1); this closes it.
 *
 * Name, email, password, confirm - and a PHONE NUMBER.
 *
 * The phone was deliberately left out when this screen was written, on the
 * same "time-to-first-listing" reasoning onboarding.page.ts argues for. That
 * reasoning no longer holds: since migration 051 a salon may only invite a
 * registered artist, and the invitation is addressed to a verified phone
 * number. An artist who signs up without one cannot be invited to a salon at
 * all, and would have to come back and add it before any owner could reach
 * them - which is worse friction, later, at a moment nobody is expecting it.
 *
 * Local format is fine: "70 555 123" is how a Lebanese artist writes their
 * number, and the API normalises to E.164. The check here is deliberately
 * loose - enough digits to be a real attempt - because the server owns the
 * real rule and duplicating it in the client is how the two drift apart.
 *
 * On success, register() sets the session exactly like login() does (same
 * refresh cookie), so this can navigate straight into /onboarding rather
 * than bouncing through /login again.
 */
@Component({
  selector: 'bedge-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent, CardComponent, InputDirective],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  readonly name = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');

  /** Set true on the first submit attempt - field errors stay hidden until then. */
  readonly touched = signal(false);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  isNameValid(): boolean {
    return this.name().trim().length >= 2;
  }

  isEmailValid(): boolean {
    return EMAIL_PATTERN.test(this.email().trim());
  }

  /**
   * Loose on purpose. internal/pkg/phone owns the real rule - which prefixes
   * are valid Lebanese mobiles, what lengths are allowed - and re-implementing
   * that here would give two rules that drift. This only catches an obviously
   * empty or too-short entry so the user is not bounced by the server for
   * something the form could have said immediately.
   */
  isPhoneValid(): boolean {
    return this.phone().replace(/\D/g, '').length >= 7;
  }

  isPasswordValid(): boolean {
    return this.password().length >= MIN_PASSWORD_LENGTH;
  }

  isConfirmValid(): boolean {
    return this.confirmPassword() === this.password() && this.password().length > 0;
  }

  submit(): void {
    this.touched.set(true);
    this.errorMessage.set(null);

    if (
      !this.isNameValid() ||
      !this.isEmailValid() ||
      !this.isPhoneValid() ||
      !this.isPasswordValid() ||
      !this.isConfirmValid()
    ) {
      return;
    }

    this.loading.set(true);

    this.auth
      .register({
        name: this.name().trim(),
        email: this.email().trim(),
        phone: this.phone().trim(),
        password: this.password(),
        role: 'artist',
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigateByUrl('/onboarding');
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.errorMessage.set(
            extractApiErrorMessage(
              err,
              err.status === 0
                ? 'Cannot reach the server. Check your connection and try again.'
                : 'Something went wrong while creating your account. Please try again.',
            ),
          );
        },
      });
  }
}
