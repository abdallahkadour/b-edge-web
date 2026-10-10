import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LucideAngularModule, X } from 'lucide-angular';
import { importProvidersFrom } from '@angular/core';

import { SlotUnavailableScreenComponent } from './slot-unavailable-screen.component';

// The screen says what actually happened (2026-10-10). It used to say
// "someone else booked this time while you were filling in your details"
// for every failure, including her own 10 minutes running out.

function render(reason: 'taken' | 'expired', detailsSaved: boolean) {
  TestBed.configureTestingModule({ providers: [importProvidersFrom(LucideAngularModule.pick({ X }))] });
  const fixture = TestBed.createComponent(SlotUnavailableScreenComponent);
  fixture.componentRef.setInput('reason', reason);
  fixture.componentRef.setInput('detailsSaved', detailsSaved);
  fixture.detectChanges();
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

describe('SlotUnavailableScreenComponent', () => {
  it('a time that is gone says so, without inventing who took it', () => {
    const text = render('taken', false);
    expect(text).toContain('That time is no longer available');
    expect(text).not.toContain('while you were filling in your details');
    expect(text).not.toContain('details have been saved');
  });

  it('a hold that ran out says that, and that the time may still be free', () => {
    const text = render('expired', true);
    expect(text).toContain('Your hold ran out');
    expect(text).toContain('may still be free');
    expect(text).toContain('details have been saved');
  });
});
