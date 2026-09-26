import { afterEach, describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { DiscountDataService } from '@bedge/shared';
import type { CreateDiscountRequest, Discount } from '@bedge/shared';

import { DiscountsComponent } from './discounts.component';

// Node re-reads TZ when it is assigned, so a test can put the "device" in a
// timezone of its choosing and prove the screen does not depend on it.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = (globalThis as any).process.env as Record<string, string | undefined>;
const deviceTz = env['TZ'];
afterEach(() => {
  if (deviceTz === undefined) delete env['TZ'];
  else env['TZ'] = deviceTz;
});

// ngOnInit is never run, so nothing loads - only create() reaches the stub.
function screen() {
  const sent: CreateDiscountRequest[] = [];
  TestBed.configureTestingModule({
    providers: [
      {
        provide: DiscountDataService,
        useValue: {
          createDiscount: (req: CreateDiscountRequest) => {
            sent.push(req);
            return of({ id: 'd-1', code: req.code } as Discount);
          },
        },
      },
    ],
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cmp = TestBed.runInInjectionContext(() => new DiscountsComponent()) as any;
  return { cmp, sent };
}

describe('DiscountsComponent - the end date is a day on the salon calendar', () => {
  it('sends the day she picked, not an instant worked out on her device', () => {
    // Before: new Date('2026-12-01T23:59:59') in the device's timezone, so a
    // laptop on UTC made a code that ran until 01:59 on the 2nd in Beirut.
    env['TZ'] = 'UTC';
    const { cmp, sent } = screen();
    cmp.patchDraft({ code: 'WINTER', value: '10', endsAt: '2026-12-01' });

    cmp.create();

    expect(sent).toHaveLength(1);
    expect(sent[0].ends_on).toBe('2026-12-01');
    expect(sent[0].ends_at).toBeUndefined();
  });

  it('sends no end at all when she leaves the date empty', () => {
    const { cmp, sent } = screen();
    cmp.patchDraft({ code: 'WINTER', value: '10', endsAt: '' });

    cmp.create();

    expect(sent[0].ends_on).toBeUndefined();
    expect(sent[0].ends_at).toBeUndefined();
  });

  it('shows the last day from the salon calendar on any device', () => {
    // Ends at midnight Beirut going into the 2nd: 22:00 UTC on the 1st. A
    // device in Beirut read that instant as the 2nd; the salon's last day
    // is the 1st, whatever the device says.
    const code = {
      ends_at: '2099-12-01T22:00:00Z', ends_on: '2099-12-01',
    } as Discount;
    const { cmp } = screen();

    for (const tz of ['Asia/Beirut', 'UTC', 'America/Los_Angeles', 'Pacific/Kiritimati']) {
      env['TZ'] = tz;
      expect(cmp.expiryLabel(code), tz).toBe('Until 1 Dec 2099');
    }
  });

  it('marks a code that has ended as expired', () => {
    const { cmp } = screen();

    expect(cmp.expiryLabel({ ends_at: '2020-03-01T22:00:00Z', ends_on: '2020-03-01' } as Discount))
      .toBe('Expired 1 Mar 2020');
  });
});
