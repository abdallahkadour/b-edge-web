import { afterEach, describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { rateLimitInterceptor } from './rate-limit.interceptor';
import { RateLimitStore } from './rate-limit.store';

// The banner says "You're making requests too quickly". That is true of the
// general per-address limiter and of nothing else. A 429 that names its own
// reason - two holds with this artist, too many promo codes tried, too many
// sign-in codes - is shown by the screen that made the call, and the banner
// on top of it told her something false.

function run(status: number, body: unknown): RateLimitStore {
  TestBed.configureTestingModule({ providers: [RateLimitStore] });
  const store = TestBed.inject(RateLimitStore);
  const req = new HttpRequest('POST', '/api/v1/orders/discount-preview', {});
  const next = () =>
    status === 200
      ? of(new HttpResponse({ status: 200 }))
      : throwError(() => new HttpErrorResponse({ status, error: body }));
  TestBed.runInInjectionContext(() => rateLimitInterceptor(req, next)).subscribe({ error: () => {} });
  return store;
}

const envelope = (code: string) => ({ data: null, error: { code, message: '…' }, meta: null });

afterEach(() => TestBed.resetTestingModule());

describe('rateLimitInterceptor', () => {
  it('shows the banner for the general request limit', () => {
    expect(run(429, envelope('RATE_LIMIT_EXCEEDED')).active()).toBe(true);
  });

  it('shows the banner for a 429 that says nothing about why - an edge or proxy limit', () => {
    expect(run(429, '<html>Too Many Requests</html>').active()).toBe(true);
  });

  // Written out rather than it.each: scripts/doc-facts.sh counts it( calls,
  // and the documented test count should be the number that actually runs.
  it('leaves the 2-hold limit to the booking screen - it is not "too quickly"', () => {
    expect(run(429, envelope('TOO_MANY_HOLDS')).active()).toBe(false);
  });

  it('leaves the promo-code limit to the code field', () => {
    expect(run(429, envelope('TOO_MANY_CODE_ATTEMPTS')).active()).toBe(false);
  });

  it('leaves the sign-in code limit to the sign-in screen', () => {
    expect(run(429, envelope('RATE_LIMITED')).active()).toBe(false);
  });

  it('ignores a server error', () => {
    expect(run(500, envelope('INTERNAL')).active()).toBe(false);
  });

  it('ignores a success', () => {
    expect(run(200, null).active()).toBe(false);
  });
});
