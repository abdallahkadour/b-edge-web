import { describe, it, expect, beforeEach } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LucideAngularModule, Star } from 'lucide-angular';

import { StarRatingComponent } from './star-rating.component';

/**
 * Host component: `input.required` cannot be set on a bare fixture, and
 * driving the component the way a template does is closer to how it is
 * actually used.
 */
@Component({
  standalone: true,
  imports: [StarRatingComponent],
  template: `
    <bedge-star-rating
      [value]="value()"
      [tone]="tone()"
      [interactive]="interactive()"
      [label]="label()"
      (pick)="picked = $event"
    />
  `,
})
class Host {
  readonly value = signal(3);
  readonly tone = signal<'primary' | 'muted'>('primary');
  readonly interactive = signal(false);
  readonly label = signal('Rating');
  picked: number | null = null;
}

describe('StarRatingComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<Host>>;
  let host: Host;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host, LucideAngularModule.pick({ Star })],
    }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  const el = () => fixture.nativeElement as HTMLElement;

  it('always renders exactly five stars', () => {
    expect(el().querySelectorAll('lucide-icon')).toHaveLength(5);
  });

  // The accessibility gap that motivated the component: six hand-rolled
  // copies rendered five identical icons and announced no value at all.
  it('announces the value when read-only', () => {
    host.label.set('Artist');
    host.value.set(4);
    fixture.detectChanges();

    const group = el().querySelector('[role="img"]');
    expect(group?.getAttribute('aria-label')).toBe('Artist: 4 of 5');
  });

  it('is a radiogroup when interactive, and announces only its purpose', () => {
    host.interactive.set(true);
    host.label.set('Rate the salon');
    fixture.detectChanges();

    const group = el().querySelector('[role="radiogroup"]');
    expect(group).not.toBeNull();
    // The VALUE comes from the checked radio, not the group label — repeating
    // it here would make a screen reader say it twice.
    expect(group?.getAttribute('aria-label')).toBe('Rate the salon');
    expect(el().querySelectorAll('[role="radio"]')).toHaveLength(5);
  });

  it('marks exactly one radio checked, matching the value', () => {
    host.interactive.set(true);
    host.value.set(2);
    fixture.detectChanges();

    const checked = el().querySelectorAll('[aria-checked="true"]');
    expect(checked).toHaveLength(1);
    expect(checked[0].getAttribute('aria-label')).toBe('2 stars');
  });

  it('emits the star that was clicked', () => {
    host.interactive.set(true);
    fixture.detectChanges();

    (el().querySelectorAll('[role="radio"]')[3] as HTMLButtonElement).click();

    expect(host.picked).toBe(4);
  });

  it('renders no buttons when read-only', () => {
    host.interactive.set(false);
    fixture.detectChanges();

    expect(el().querySelectorAll('button')).toHaveLength(0);
  });

  // Unrated must render as five empty stars, never as an error or a gap —
  // "not rated" and "rated badly" are different, and neither is broken.
  it('renders zero as five empty stars', () => {
    host.value.set(0);
    fixture.detectChanges();

    expect(el().querySelectorAll('lucide-icon')).toHaveLength(5);
    expect(el().querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('Rating: 0 of 5');
  });

  // The two tones must stay visually distinct: the specialist and venue
  // scores are independent and are allowed to disagree, so a reader has to be
  // able to tell which is which. See the attribution spec §2.2.
  it('uses a different fill for the muted tone', () => {
    host.value.set(5);
    fixture.detectChanges();
    const primary = el().innerHTML;

    host.tone.set('muted');
    fixture.detectChanges();
    const muted = el().innerHTML;

    expect(primary).not.toBe(muted);
    expect(primary).toContain('fill-ink');
    expect(muted).toContain('fill-gray-500');
  });
});
