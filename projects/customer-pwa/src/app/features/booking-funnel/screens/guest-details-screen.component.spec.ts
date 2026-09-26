import { describe, it, expect, beforeEach } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ArrowLeft, Check, Loader2, LucideAngularModule, MapPin } from 'lucide-angular';

import type { HoldGuestSlotResponse, PublicService } from '@bedge/shared';

import { GuestDetailsScreenComponent } from './guest-details-screen.component';

const service: PublicService = {
  id: 'svc-1', name: 'Bridal', duration_min: 90, price: '150', deposit_amount: '30', deposit_deadline_hours: 48,
};

const quoteWith = (early_bird_fee: string, final_price: string): HoldGuestSlotResponse => ({
  booking_id: 'bk-1',
  held_until: new Date(Date.now() + 5 * 60_000).toISOString(),
  start_time: new Date(Date.now() + 86_400_000).toISOString(),
  end_time: new Date(Date.now() + 86_400_000 + 90 * 60_000).toISOString(),
  original_price: '150',
  early_bird_fee,
  final_price,
  deposit_amount: '30',
});

/** input.required cannot be set on a bare fixture; drive it as a template does. */
@Component({
  standalone: true,
  imports: [GuestDetailsScreenComponent],
  template: `
    <app-guest-details-screen
      [service]="service"
      storeName="Beirut Downtown"
      [startTime]="quote().start_time"
      [heldUntil]="quote().held_until"
      [quote]="quote()"
    />
  `,
})
class Host {
  readonly service = service;
  readonly quote = signal(quoteWith('0', '150'));
}

describe('GuestDetailsScreenComponent - early-bird line', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<Host>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host, LucideAngularModule.pick({ ArrowLeft, Check, Loader2, MapPin })],
    }).compileComponents();
    fixture = TestBed.createComponent(Host);
  });

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

  async function show(fee: string, final: string): Promise<void> {
    fixture.componentInstance.quote.set(quoteWith(fee, final));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  // Final review, Minor: the line was hidden by comparing the fee string to
  // '0' and '0.00'. Any other spelling of zero ("0.0", "0.000") would have
  // told a customer her price "includes $0.0 early-bird fee". A number is
  // either above zero or it is not.
  it('hides the early-bird line for a zero fee however it is spelled', async () => {
    for (const zero of ['0', '0.00', '0.0', '0.000']) {
      await show(zero, '150');
      expect(text(), `fee "${zero}"`).not.toContain('early-bird fee');
    }
  });

  it('shows the early-bird line when a fee applies', async () => {
    await show('15', '165');
    expect(text()).toContain('includes $15 early-bird fee');
  });
});
