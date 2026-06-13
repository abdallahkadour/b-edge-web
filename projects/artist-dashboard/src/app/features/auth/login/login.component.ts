import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthStore } from '@bedge/shared';

/**
 * Login screen for the artist dashboard.
 *
 * Typed reactive form, signal-driven loading/error state, OnPush change
 * detection. On success it navigates to the returnUrl (set by the auth guard)
 * or falls back to /dashboard.
 */
@Component({
  selector: 'bedge-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** True while the login request is in flight. Disables the form + button. */
  readonly loading = signal(false);

  /** A human-readable error message, or null when there is none. */
  readonly errorMessage = signal<string | null>(null);

  /** Typed login form. Non-nullable so values are always strings. */
  readonly form = this.fb.group({
    email: this.fb.control('', {
      validators: [Validators.required, Validators.email],
    }),
    password: this.fb.control('', {
      validators: [Validators.required],
    }),
  });

  constructor() {
    // Sync form enabled/disabled state with the loading signal.
    effect(() => {
      if (this.loading()) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });
  }

  /** Submit the form: validate, call the API, handle success and failure. */
  submit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { email, password } = this.form.getRawValue();

    this.auth.login({ email, password }).subscribe({
      next: () => {
        const returnUrl =
          this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
        // Reset loading before navigating so the button is never left stuck
        // if navigation is cancelled or loops.
        this.loading.set(false);
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(this.readableError(err));
      },
    });
  }

  /** Translate an HTTP error into a message a person can act on. */
  private readableError(err: HttpErrorResponse): string {
    if (err.status === 401) {
      return 'Incorrect email or password. Please try again.';
    }
    if (err.status === 403) {
      return 'This account has been frozen. Contact support to reactivate it.';
    }
    if (err.status === 0) {
      return 'Cannot reach the server. Check your connection and try again.';
    }
    return 'Something went wrong while signing in. Please try again.';
  }
}
