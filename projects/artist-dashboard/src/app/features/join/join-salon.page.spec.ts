import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { AuthStore, MembershipDataService } from '@bedge/shared';
import type { InvitationPreview } from '@bedge/shared';

import { JoinSalonPage } from './join-salon.page';

// Since 2026-09-29 only the person an invitation was sent to may accept OR
// decline it, and declining needs her account (API: INVITATION_NOT_FOR_YOU,
// security AUTH-16 / FRAUD-11). The page used to offer Decline to anyone
// holding the link, logged in or not.

const preview: InvitationPreview = {
  salon_name: 'Rania Studio', invited_by: 'Rania',
  expires_at: new Date(Date.now() + 86_400_000).toISOString(), needs_signup: false,
} as InvitationPreview;

function setup(loggedIn: boolean, decline: () => Observable<void> = () => of(undefined)) {
  const went: unknown[][] = [];
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'tok-1' } } } },
      { provide: MembershipDataService, useValue: { previewInvitation: () => of(preview), declineInvitation: decline } },
      { provide: AuthStore, useValue: { isAuthenticated: signal(loggedIn) } },
    ],
  });
  const router = TestBed.inject(Router);
  router.navigate = ((...args: unknown[]) => { went.push(args); return Promise.resolve(true); }) as Router['navigate'];
  const fixture = TestBed.createComponent(JoinSalonPage);
  fixture.detectChanges();
  return { fixture, went, page: fixture.componentInstance as unknown as Record<string, () => unknown> };
}

const buttons = (el: HTMLElement) =>
  Array.from(el.querySelectorAll('button')).map((b) => (b.textContent ?? '').trim());

describe('JoinSalonPage - only the invitee answers an invitation', () => {
  it('logged out: offers signing in, and no Decline that could only fail', () => {
    const { fixture } = setup(false);
    const el = fixture.nativeElement as HTMLElement;

    expect(buttons(el)).not.toContain('Decline');
    expect(el.textContent).toContain('accept or decline');
  });

  it('logged in: offers Decline next to joining', () => {
    const { fixture } = setup(true);

    expect(buttons(fixture.nativeElement)).toContain('Decline');
  });

  it('a refused decline says why and stays on the page', () => {
    // Before: any error navigated to /login, so "this was sent to someone
    // else" was never shown.
    const { page, went, fixture } = setup(true, () => throwError(() => new HttpErrorResponse({
      status: 403,
      error: { data: null, meta: null, error: { code: 'INVITATION_NOT_FOR_YOU',
        message: 'This invitation was sent to someone else. Sign in with the account it was sent to' } },
    })));

    page['decline']();
    fixture.detectChanges();

    expect(page['error']()).toContain('sent to someone else');
    expect(went).toEqual([]);
  });

  it('a decline that went through leaves the page', () => {
    const { page, went } = setup(true);

    page['decline']();

    expect(went).toHaveLength(1);
  });
});
