import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { AuthStore, MembershipDataService } from '@bedge/shared';
import type { SalonMember } from '@bedge/shared';

import { TeamFilterComponent } from './team-filter.component';

const member = (id: string, name: string, isOwner = false) =>
  ({ artist_id: id, user_id: 'u' + id, display_name: name, status: 'active', is_owner: isOwner, joined_at: '', future_bookings: 0 }) as SalonMember;

function render(owner: boolean, roster: SalonMember[]) {
  let asked = 0;
  TestBed.configureTestingModule({
    providers: [
      { provide: AuthStore, useValue: { isSalonOwner: signal(owner) } },
      { provide: MembershipDataService, useValue: { listMembers: () => { asked++; return of(roster); } } },
    ],
  });
  const fixture = TestBed.createComponent(TeamFilterComponent);
  const picked: string[] = [];
  fixture.componentInstance.changed.subscribe((v) => picked.push(v));
  fixture.detectChanges();
  return { el: fixture.nativeElement as HTMLElement, picked, asked: () => asked };
}

describe('TeamFilterComponent', () => {
  it('offers the owner her own, everyone, and each other artist', () => {
    const { el } = render(true, [member('a1', 'Rania', true), member('a2', 'Maya'), member('a3', 'Lina')]);
    const options = [...el.querySelectorAll('option')].map((o) => o.textContent?.trim());
    expect(options).toEqual(['My bookings', 'Everyone', 'Maya', 'Lina']);
  });

  it('says which artist was picked', () => {
    const { el, picked } = render(true, [member('a1', 'Rania', true), member('a2', 'Maya')]);
    const select = el.querySelector('select') as HTMLSelectElement;
    select.value = 'a2';
    select.dispatchEvent(new Event('change'));
    expect(picked).toEqual(['a2']);
  });

  it('is not there for an owner working alone', () => {
    const { el } = render(true, [member('a1', 'Rania', true)]);
    expect(el.querySelector('select')).toBeNull();
  });

  it('is not there for a member, who is never asked about the roster', () => {
    const { el, asked } = render(false, [member('a1', 'Rania', true), member('a2', 'Maya')]);
    expect(el.querySelector('select')).toBeNull();
    expect(asked()).toBe(0);
  });
});
