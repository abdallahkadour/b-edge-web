import { describe, it, expect } from 'vitest';

import { isValidMoney, isBrokenMoney } from './money.util';

/**
 * The accepted and rejected lists here are deliberately the SAME cases as
 * internal/pkg/money/money_test.go on the API side.
 *
 * These two validators exist to agree. When they disagree the failure is
 * silent and one-directional — the form accepts a value the API then rejects,
 * and the artist sees a 400 about a field that looked fine. Keeping the tables
 * in step is what makes the drift visible here rather than in production.
 */
describe('money.util', () => {
  describe('isValidMoney', () => {
    it('accepts canonical amounts', () => {
      const inputs = ['0', '0.00', '5', '45.00', '10.99', '0.01', '99999999.99', '045', '5.0'];
      // Asserted as a map rather than in a loop so a failure names the exact
      // offending value in the diff instead of just the first bad iteration.
      const got = Object.fromEntries(inputs.map((r) => [r, isValidMoney(r)]));
      const want = Object.fromEntries(inputs.map((r) => [r, true]));
      expect(got).toEqual(want);
    });

    it('rejects the forms that used to be silently altered', () => {
      // Each of these reached a NUMERIC(10,2) column before 2026-09-05.
      const cases: Record<string, string> = {
        '10.999': 'was silently rounded to 11.00',
        '45.000': 'three decimals',
        '1e3': 'was silently stored as 1000.00',
        '1E3': 'was silently stored as 1000.00',
        '+5': 'sign was stripped silently',
        NaN: 'reached Postgres as NaN and broke every later read of the row',
        Infinity: 'surfaced as a 500 rather than a 400',
        '-1': 'negative money has no meaning here',
        '-0.01': 'negative',
        '100000000': 'one digit past the NUMERIC(10,2) ceiling',
        '999999999.99': 'overflow',
      };
      const got = Object.fromEntries(Object.keys(cases).map((r) => [r, isValidMoney(r)]));
      const want = Object.fromEntries(Object.keys(cases).map((r) => [r, false]));
      expect(got).toEqual(want);
    });

    it('rejects values that are not amounts at all', () => {
      const inputs = ['', ' ', '45.00 ', ' 45.00', 'abc', '45,00', '$45', '45.00.00', '0x10'];
      const got = Object.fromEntries(inputs.map((r) => [r, isValidMoney(r)]));
      const want = Object.fromEntries(inputs.map((r) => [r, false]));
      expect(got).toEqual(want);
    });
  });

  describe('isBrokenMoney', () => {
    // The point of this function: do not shout at someone mid-keystroke.
    it('stays quiet while a valid amount is being typed', () => {
      const inputs = ['', '1', '10', '10.', '10.5', '10.50'];
      const got = Object.fromEntries(inputs.map((r) => [r, isBrokenMoney(r)]));
      const want = Object.fromEntries(inputs.map((r) => [r, false]));
      expect(got).toEqual(want);
    });

    it('reports values that can no longer become valid', () => {
      const inputs = ['10.999', 'abc', '1e3', '-1', '45,00', '10..5'];
      const got = Object.fromEntries(inputs.map((r) => [r, isBrokenMoney(r)]));
      const want = Object.fromEntries(inputs.map((r) => [r, true]));
      expect(got).toEqual(want);
    });

    it('never reports an empty field — "required" is a separate rule', () => {
      expect(isBrokenMoney('')).toBe(false);
    });
  });
});
