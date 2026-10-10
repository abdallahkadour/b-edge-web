import { describe, it, expect } from 'vitest';

import { assignLanes } from './calendar.component';

// An owner looking at the whole team's day sees two artists' 10:00
// appointments side by side, not one painted over the other.

const h = (x: number) => x * 3_600_000;

describe('assignLanes', () => {
  it('a day without overlaps is one lane each - every artist\'s own day', () => {
    expect(assignLanes([{ start: h(9), end: h(10) }, { start: h(10), end: h(11) }]))
      .toEqual([{ lane: 0, lanes: 1 }, { lane: 0, lanes: 1 }]);
  });

  it('two at the same time share the width', () => {
    expect(assignLanes([{ start: h(10), end: h(11) }, { start: h(10), end: h(12) }]))
      .toEqual([{ lane: 0, lanes: 2 }, { lane: 1, lanes: 2 }]);
  });

  it('a chain of overlaps is one group, and a freed lane is reused', () => {
    // A 9-11, B 10-12, C 11-13: C starts when A ends, so it takes A's lane.
    expect(assignLanes([{ start: h(9), end: h(11) }, { start: h(10), end: h(12) }, { start: h(11), end: h(13) }]))
      .toEqual([{ lane: 0, lanes: 2 }, { lane: 1, lanes: 2 }, { lane: 0, lanes: 2 }]);
  });

  it('a later appointment clear of the group is full width again', () => {
    const out = assignLanes([{ start: h(10), end: h(11) }, { start: h(10), end: h(11) }, { start: h(15), end: h(16) }]);
    expect(out[2]).toEqual({ lane: 0, lanes: 1 });
  });

  it('keeps each answer at its input\'s index, whatever the order', () => {
    const out = assignLanes([{ start: h(14), end: h(15) }, { start: h(9), end: h(10) }]);
    expect(out).toEqual([{ lane: 0, lanes: 1 }, { lane: 0, lanes: 1 }]);
  });
});
