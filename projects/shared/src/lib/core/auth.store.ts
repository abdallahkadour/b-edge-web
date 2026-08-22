import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { ApiService } from './api.service';
import type {
  LoginRequest,
  LoginResult,
  RegisterRequest,
  RegisterResult,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UserInfo,
} from '../models';

/**
 * Holds authentication state with signals and owns the access token.
 *
 * Token strategy:
 *  - The access token (short-lived JWT) lives in memory only - never in
 *    localStorage, which is readable by any XSS payload. In-memory means it
 *    is lost on full page reload, and we recover it via the refresh cookie.
 *  - The refresh token is an httpOnly cookie set by the server; JS never sees it.
 *  - On bootstrap, apps call `refresh()` once to exchange the cookie for a
 *    fresh access token and restore the session.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly api = inject(ApiService);

  private readonly _accessToken = signal<string | null>(null);
  private readonly _user = signal<UserInfo | null>(null);

  /** Current access token, or null when unauthenticated. Read by the interceptor. */
  readonly accessToken = this._accessToken.asReadonly();

  /** The authenticated user, or null. */
  readonly user = this._user.asReadonly();

  /** True when a user is authenticated. */
  readonly isAuthenticated = computed(() => this._user() !== null);

  /** The user's role, or null. */
  readonly role = computed(() => this._user()?.role ?? null);

  /** Log in with email + password. Server sets the refresh cookie. */
  login(body: LoginRequest): Observable<LoginResult> {
    return this.api
      .post<LoginResult>('/auth/login', body)
      .pipe(tap((result) => this.setSession(result.access_token, result.user)));
  }

  /** Register a new account. Server sets the refresh cookie. */
  register(body: RegisterRequest): Observable<RegisterResult> {
    return this.api
      .post<RegisterResult>('/auth/register', body)
      .pipe(tap((result) => this.setSession(result.access_token, result.user)));
  }

  /**
   * Exchange the httpOnly refresh cookie for a fresh access token.
   * Called once at app bootstrap to restore a session after reload.
   */
  refresh(): Observable<LoginResult> {
    return this.api
      .post<LoginResult>('/auth/refresh', {})
      .pipe(tap((result) => this.setSession(result.access_token, result.user)));
  }

  /** Log out: revoke the refresh token server-side and clear local state. */
  logout(): Observable<void> {
    return this.api
      .command('/auth/logout', 'POST')
      .pipe(tap(() => this.clearSession()));
  }

  /**
   * Request a password-reset link. Deliberately doesn't touch session
   * state and the backend always returns success regardless of whether
   * the email is registered - revealing that would turn this into an
   * account-enumeration oracle. Delivered over WhatsApp once
   * ARTIST_DASHBOARD_URL/WhatsApp credentials are live; in dev the
   * message (with the real reset link) lands in the `notifications`
   * table, same as every other not-yet-live WhatsApp flow in this app.
   */
  forgotPassword(body: ForgotPasswordRequest): Observable<void> {
    return this.api.command('/auth/forgot-password', 'POST', body);
  }

  /** Set a new password using a reset token from the emailed/WhatsApp'd
   *  link. Does not log the user in - they still go through /login
   *  afterward with the new password, same as any other password change. */
  resetPassword(body: ResetPasswordRequest): Observable<void> {
    return this.api.command('/auth/reset-password', 'POST', body);
  }

  /** Change password while already authenticated - requires the current
   *  password, verified server-side. */
  changePassword(body: ChangePasswordRequest): Observable<void> {
    return this.api.command('/auth/change-password', 'PATCH', body);
  }

  /**
   * Freeze the current account. Does NOT invalidate the current session -
   * middleware.RequireAuth() only checks the JWT, not live account status,
   * so the artist can still call unfreezeAccount() in the same session if
   * they change their mind. Only a future LOGIN attempt is blocked.
   */
  freezeAccount(): Observable<void> {
    return this.api.command('/auth/freeze-account', 'PATCH');
  }

  /** Restore a frozen account to active - only reachable while still
   *  holding a valid session from before freezing (see freezeAccount's
   *  doc comment); once logged out, a frozen account can no longer log
   *  back in to unfreeze itself. */
  unfreezeAccount(): Observable<void> {
    return this.api.command('/auth/unfreeze-account', 'PATCH');
  }

  /** Permanently delete the account (soft-delete server-side - deleted_at
   *  is stamped, the row isn't physically removed). The server clears the
   *  refresh cookie; callers should also call clearSession() immediately
   *  after, since this doesn't happen automatically via setSession. */
  deleteAccount(): Observable<void> {
    return this.api.delete('/auth/delete-account');
  }

  /** Clear local session without a server call (e.g. on unrecoverable 401). */
  clearSession(): void {
    this._accessToken.set(null);
    this._user.set(null);
  }

  private setSession(token: string, user: UserInfo): void {
    this._accessToken.set(token);
    this._user.set(user);
  }
}
