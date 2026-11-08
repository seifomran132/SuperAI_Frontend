import { describe, expect, it } from 'vitest';
import {
  addMonths,
  currentMonth,
  formatMonth,
  monthRange,
  validateMonthSearch,
} from '../months';

const now = new Date('2026-11-06T12:00:00Z');

describe('months', () => {
  it('lists months newest first, from the first month to the current one', () => {
    expect(monthRange('2026-08', '2026-11')).toEqual([
      '2026-11',
      '2026-10',
      '2026-09',
      '2026-08',
    ]);
    expect(monthRange('2025-12', '2026-01')).toEqual(['2026-01', '2025-12']);
    expect(monthRange('2026-12', '2026-11')).toEqual([]);
  });
  it('moves across years', () => {
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(addMonths('2026-12', 1)).toBe('2027-01');
  });
  it('uses the UTC month as the current one', () => {
    expect(currentMonth(new Date('2026-10-31T23:30:00Z'))).toBe('2026-10');
  });
  it('names the month in Arabic with a Western-digit year', () => {
    expect(formatMonth('2026-10', 'ar')).toBe('أكتوبر 2026');
  });
  it('falls back to the current month for malformed or future months', () => {
    expect(validateMonthSearch({ month: '2026-10' }, now)).toEqual({
      month: '2026-10',
    });
    expect(validateMonthSearch({ month: '2026-11' }, now)).toEqual({
      month: '2026-11',
    });
    expect(validateMonthSearch({ month: '2026-12' }, now)).toEqual({});
    expect(validateMonthSearch({ month: '2026-13' }, now)).toEqual({});
    expect(validateMonthSearch({ month: 'abc' }, now)).toEqual({});
    expect(validateMonthSearch({}, now)).toEqual({});
  });
});
