import { describe, it, expect } from 'vitest';

import type { ActivityEntry } from '@bedge/shared';

import { describeEntry, whoDidIt } from './activity-text';

// One sentence per change, in the owner's words. The API records codes and
// values; this is the only place they become language.

function entry(action: string, extra: Partial<ActivityEntry> = {}): ActivityEntry {
  return {
    id: 'e1', at: '2026-10-10T09:30:00Z', entity_type: 'booking', entity_id: 'b1', action,
    actor: { id: 'u2', name: 'Maya', role: 'artist', is_you: false },
    subject: { service_name: 'Bridal makeup', customer_name: 'Sara', artist_name: 'Maya', start_time: '2026-10-18T07:00:00Z' },
    ...extra,
  };
}

describe('whoDidIt', () => {
  it('names the person, says You for the owner, and B-Edge for the system', () => {
    expect(whoDidIt(entry('booking.approve'))).toBe('Maya');
    expect(whoDidIt(entry('booking.approve', { actor: { id: 'u1', name: 'Rania', role: 'artist', is_you: true } }))).toBe('You');
    expect(whoDidIt(entry('booking.cancel', { actor: { name: '', role: 'system', is_you: false } }))).toBe('B-Edge');
    expect(whoDidIt(entry('booking.cancel', { actor: { id: 'c', name: 'Sara', role: 'customer', is_you: false } }))).toBe('Sara (client)');
  });
});

describe('describeEntry - bookings', () => {
  it('an approval names the client, the service, whose and when', () => {
    const d = describeEntry(entry('booking.approve'));
    expect(d.text).toBe("approved Sara's Bridal makeup");
    expect(d.detail).toContain('Maya');
    expect(d.detail).toContain('Sun 18 Oct');
  });

  it('a cancellation with a deposit says one is owed back', () => {
    const d = describeEntry(entry('booking.cancel', { new: { status: 'refund_due', deposit_amount: '30' } }));
    expect(d.text).toBe("cancelled Sara's Bridal makeup");
    expect(d.detail).toContain('$30 deposit to send back');
  });

  it('a refund says how much went back', () => {
    expect(describeEntry(entry('booking.refunded', { new: { deposit_amount: '30' } })).text).toBe("sent back Sara's $30 deposit");
  });

  it('a move says from when to when', () => {
    const d = describeEntry(entry('booking.reschedule', { old: { start_time: '2026-10-18T07:00:00Z' }, new: { start_time: '2026-10-19T08:00:00Z' } }));
    expect(d.text).toBe("moved Sara's Bridal makeup");
    expect(d.detail).toBe('Sun 18 Oct, 10:00 → Mon 19 Oct, 11:00');
  });

  it('a day shift is one line', () => {
    const d = describeEntry(entry('booking.shift_day', { entity_type: 'artist', subject: { artist_name: 'Maya' }, new: { date: '2026-10-18', minutes: 30, moved: 3 } }));
    expect(d.text).toBe("shifted Maya's day by 30 min later");
    expect(d.detail).toBe('Sun 18 Oct · 3 appointments moved');
  });
});

describe('describeEntry - money and the menu', () => {
  it('a payment account changed shows what it was and what it became', () => {
    const d = describeEntry(entry('payment_method.save', {
      entity_type: 'payment_method',
      old: { method: 'whish', account_name: 'Rania', account_ref: '71900001' },
      new: { method: 'whish', account_name: 'Someone', account_ref: '70111222' },
    }));
    expect(d.text).toBe('changed the Whish account');
    expect(d.detail).toBe('Rania 71900001 → Someone 70111222');
    expect(d.alert).toBe(true);
  });

  it('a first payment account is added, not changed', () => {
    const d = describeEntry(entry('payment_method.save', { entity_type: 'payment_method', new: { method: 'omt', account_name: 'Rania', account_ref: '71900001' } }));
    expect(d.text).toBe('added an OMT account');
  });

  it('the no-show rule says off or after how many', () => {
    const d = describeEntry(entry('salon.no_show_policy', { entity_type: 'salon', old: { after: 0 }, new: { after: 2 } }));
    expect(d.text).toBe('changed the no-show deposit rule');
    expect(d.detail).toBe('off → after 2 no-shows');
  });

  it('a menu price change lists only what changed', () => {
    const d = describeEntry(entry('service.update', {
      entity_type: 'service', old: { name: 'Bridal makeup', price: '200.00' }, new: { name: 'Bridal makeup', price: '250.00' },
    }));
    expect(d.text).toBe('changed Bridal makeup');
    expect(d.detail).toBe('price $200 → $250');
  });

  it('a discount code turned off', () => {
    const d = describeEntry(entry('discount.update', { entity_type: 'discount', old: { code: 'EID20', is_active: true }, new: { code: 'EID20', is_active: false } }));
    expect(d.text).toBe('changed code EID20');
    expect(d.detail).toBe('on → off');
  });

  it('store hours for a day', () => {
    const d = describeEntry(entry('store.hours', {
      entity_type: 'store', subject: { store_name: 'Hamra' }, new: { day_of_week: 5, is_open: true, open_time: '10:00:00', close_time: '16:00:00' },
    }));
    expect(d.text).toBe("changed Hamra's Friday hours");
    expect(d.detail).toBe('10:00–16:00');
  });
});

describe('describeEntry - shop and team, and anything unknown', () => {
  it('an order shipped', () => {
    const d = describeEntry(entry('order.shipped', { entity_type: 'order', subject: { customer_name: 'Sara' }, new: { status: 'shipped', total_amount: '45.50' } }));
    expect(d.text).toBe("shipped Sara's order");
    expect(d.detail).toBe('$45.50');
  });

  it('the older team spellings read as sentences too', () => {
    expect(describeEntry(entry('remove_member', { entity_type: 'artist', subject: { artist_name: 'Lina' } })).text).toBe('removed Lina from the salon');
    expect(describeEntry(entry('accept', { entity_type: 'salon_invitation', subject: {} })).text).toBe('joined the salon');
  });

  it('an action it does not know is shown as recorded, not hidden', () => {
    expect(describeEntry(entry('something.new')).text).toBe('something.new');
  });
});
