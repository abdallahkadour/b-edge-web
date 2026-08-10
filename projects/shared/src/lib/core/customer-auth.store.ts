import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { ApiService } from './api.service';
import type {
  RequestOtpRequest,
  VerifyOtpRequest,
  CustomerAuthResult,
  CustomerInfo,
} from '../models';

/**
 * Holds customer session state - same in-memory-access-token +
 * httpOnly-refresh-cookie strategy as AuthStore (artist sessions),
 * deliberately mirrored rather than shared, since phone+OTP is a genuinely
 * different auth mechanism from email+password, not a variant of it.
 *
 * Guest booking is completely unaffected by any of this - this store is
 * only ever touched by the optional "log in to see your booking history"
 * path, never by the booking funnel itself.
 */
@Injectable({ providedIn: 'root' })
export class CustomerAuthStore {
  private readonly api = inject(ApiService);

  private readonly _accessToken = signal<string | null>(null);
  private readonly _customer = signal<CustomerInfo | null>(null);

  /** Current access token, or null when unauthenticated. Read by the interceptor. */
  readonly accessToken = this._accessToken.asReadonly();

  /** The authenticated customer, or null. */
  readonly customer = this._customer.asReadonly();

  /** True when a customer is authenticated. */
  readonly isAuthenticated = computed(() => this._customer() !== null);

  /**
   * Request a WhatsApp login code. Deliberately does not touch session
   * state - nothing is "logged in" until verifyOtp succeeds.
   */
  requestOtp(body: RequestOtpRequest): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/customer-auth/request-otp', body);
  }

  /** Verify a code. Server sets the refresh cookie on success. */
  verifyOtp(body: VerifyOtpRequest): Observable<CustomerAuthResult> {
    return this.api
      .post<CustomerAuthResult>('/customer-auth/verify-otp', body)
      .pipe(tap((result) => this.setSession(result.access_token, result.customer)));
  }

  /**
   * Exchange the httpOnly refresh cookie for a fresh access token. Called
   * once at customer-pwa bootstrap to restore a session after reload - a
   * failure here (no cookie, e.g. every first-time guest) is expected and
   * harmless, not an error to surface.
   */
  refresh(): Observable<CustomerAuthResult> {
    return this.api
      .post<CustomerAuthResult>('/customer-auth/refresh', {})
      .pipe(tap((result) => this.setSession(result.access_token, result.customer)));
  }

  /** Log out: revoke the refresh token server-side and clear local state. */
  logout(): Observable<void> {
    return this.api
      .command('/customer-auth/logout', 'POST')
      .pipe(tap(() => this.clearSession()));
  }

  /** Clear local session without a server call (e.g. on unrecoverable 401). */
  clearSession(): void {
    this._accessToken.set(null);
    this._customer.set(null);
  }

  private setSession(token: string, customer: CustomerInfo): void {
    this._accessToken.set(token);
    this._customer.set(customer);
  }
}
