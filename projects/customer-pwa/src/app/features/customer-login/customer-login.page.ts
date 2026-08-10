import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { CustomerAuthStore, extractApiErrorMessage } from '@bedge/shared';

/** Lebanese mobile numbers run 7-8 digits after the +961 prefix, digits only.
 *  Same validation as guest-details-screen - deliberately kept identical. */
function isValidLocalPhone(digitsOnly: string): boolean {
  return /^\d{7,8}$/.test(digitsOnly);
}

/** How long the "Resend code" link stays disabled after a send. Purely a
 *  UI courtesy - the real 3-per-5-min limit is enforced server-side. */
const RESEND_COOLDOWN_SECONDS = 30;

/**
 * Customer login - phone + WhatsApp OTP, two steps in one screen rather
 * than two separate routes, so it reads as one continuous action.
 *
 * Deliberately submits BARE local digits, no "+961" prefix, matching the
 * exact convention guest-details-screen already established (confirmed
 * against real stored data - guest phones are saved as bare digits, e.g.
 * "70123456", not E.164 "+96170123456"). Getting this wrong would silently
 * break the entire point of the feature: a customer's account not
 * recognising their own past guest bookings because the phone strings
 * don't match character-for-character.
 */
@Component({
  selector: 'app-customer-login-page',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './customer-login.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerLoginPage implements OnDestroy {
  private readonly auth = inject(CustomerAuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly step = signal<'phone' | 'code'>('phone');
  readonly phoneDigits = signal('');
  readonly code = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly touched = signal(false);

  readonly resendCooldown = signal(0);
  private cooldownTimer: ReturnType<typeof setInterval> | null = null;

  protected readonly isPhoneValid = () => isValidLocalPhone(this.phoneDigits());
  protected readonly isCodeValid = () => /^\d{6}$/.test(this.code());

  ngOnDestroy(): void {
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
  }

  onPhoneInput(value: string): void {
    this.phoneDigits.set(value.replace(/\D/g, '').slice(0, 8));
  }

  onCodeInput(value: string): void {
    this.code.set(value.replace(/\D/g, '').slice(0, 6));
  }

  requestCode(): void {
    this.touched.set(true);
    if (!this.isPhoneValid() || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);

    this.auth.requestOtp({ phone: this.phoneDigits() }).subscribe({
      next: () => {
        this.loading.set(false);
        this.step.set('code');
        this.touched.set(false);
        this.startCooldown();
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(extractApiErrorMessage(err, 'Could not send a code. Please try again.'));
      },
    });
  }

  resendCode(): void {
    if (this.resendCooldown() > 0 || this.loading()) return;
    this.requestCode();
  }

  changePhone(): void {
    this.step.set('phone');
    this.code.set('');
    this.error.set(null);
    this.touched.set(false);
  }

  verifyCode(): void {
    this.touched.set(true);
    if (!this.isCodeValid() || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);

    this.auth.verifyOtp({ phone: this.phoneDigits(), code: this.code() }).subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl || '/my-bookings');
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(extractApiErrorMessage(err, 'Could not verify that code. Please try again.'));
      },
    });
  }

  private startCooldown(): void {
    this.resendCooldown.set(RESEND_COOLDOWN_SECONDS);
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    this.cooldownTimer = setInterval(() => {
      const next = this.resendCooldown() - 1;
      this.resendCooldown.set(next);
      if (next <= 0 && this.cooldownTimer) clearInterval(this.cooldownTimer);
    }, 1000);
  }
}
