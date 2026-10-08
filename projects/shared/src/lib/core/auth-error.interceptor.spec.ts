import { afterEach, describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';

import { authErrorInterceptor } from './auth-error.interceptor';
import { customerAuthErrorInterceptor } from './customer-auth-error.interceptor';
import { AuthStore } from './auth.store';
import { CustomerAuthStore } from './customer-auth.store';

// Since 2026-10-08 the API re-reads the account on every request (security
// AUTH-22). A suspended account's requests answer 403 ACCOUNT_SUSPENDED, not
// 401 - and these interceptors only ended the session on 401, so a suspended
// artist would have sat on a dashboard where every call failed. Any other
// 403 (NO_SALON, a role the caller lacks) is about one action, not the
// session, and must not sign anyone out.

const envelope = (code: string) => ({ data: null, error: { code, message: '…' }, meta: null });

function run(
  interceptor: typeof authErrorInterceptor,
  store: typeof AuthStore | typeof CustomerAuthStore,
  url: string,
  status: number,
  body: unknown,
) {
  const calls = { cleared: 0, went: [] as unknown[] };
  TestBed.configureTestingModule({
    providers: [
      { provide: store, useValue: { clearSession: () => calls.cleared++ } },
      { provide: Router, useValue: { url: '/dashboard/orders', navigate: (...a: unknown[]) => calls.went.push(a) } },
    ],
  });
  const next = () => throwError(() => new HttpErrorResponse({ status, error: body }));
  TestBed.runInInjectionContext(() => interceptor(new HttpRequest('GET', url), next)).subscribe({ error: () => {} });
  return calls;
}

afterEach(() => TestBed.resetTestingModule());

describe('authErrorInterceptor (artist dashboard)', () => {
  it('an expired session signs her out', () => {
    const c = run(authErrorInterceptor, AuthStore, '/api/v1/artists/salon/orders', 401, envelope('TOKEN_INVALID'));
    expect(c.cleared).toBe(1);
    expect(c.went).toHaveLength(1);
  });

  it('a suspended account is signed out, not left on a dashboard that fails every call', () => {
    const c = run(authErrorInterceptor, AuthStore, '/api/v1/artists/salon/orders', 403, envelope('ACCOUNT_SUSPENDED'));
    expect(c.cleared).toBe(1);
    expect(c.went).toHaveLength(1);
  });

  it('any other refusal is about the action, not the session', () => {
    const c = run(authErrorInterceptor, AuthStore, '/api/v1/artists/salon/orders', 403, envelope('NO_SALON'));
    expect(c.cleared).toBe(0);
    expect(c.went).toHaveLength(0);
  });

  it('a refused refresh at startup is not a redirect - the guards handle a signed-out app', () => {
    const c = run(authErrorInterceptor, AuthStore, '/api/v1/auth/refresh', 403, envelope('ACCOUNT_SUSPENDED'));
    expect(c.cleared).toBe(0);
  });
});

describe('customerAuthErrorInterceptor (customer app)', () => {
  it('a suspended customer is signed out too', () => {
    const c = run(customerAuthErrorInterceptor, CustomerAuthStore, '/api/v1/bookings/customer/me', 403,
      envelope('ACCOUNT_SUSPENDED'));
    expect(c.cleared).toBe(1);
  });

  it('any other refusal leaves the customer signed in', () => {
    const c = run(customerAuthErrorInterceptor, CustomerAuthStore, '/api/v1/bookings/customer/me', 403,
      envelope('FORBIDDEN'));
    expect(c.cleared).toBe(0);
  });
});
