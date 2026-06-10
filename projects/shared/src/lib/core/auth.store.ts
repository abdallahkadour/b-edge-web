import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { ApiService } from './api.service';
import type {
  LoginRequest,
  LoginResult,
  RegisterRequest,
  RegisterResult,
  UserInfo,
} from '../models';

/**
 * Holds authentication state with signals and owns the access token.
 *
 * Token strategy:
 *  - The access token (short-lived JWT) lives in memory only — never in
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
