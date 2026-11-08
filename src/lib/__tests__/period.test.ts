import { describe, expect, it } from 'vitest';
import {
  addDays,
  formatDay,
  periodError,
  periodLength,
  periodToApi,
  validatePeriodSearch,
} from '../period';
import { customRangeSchema } from '~/components/reports/customRange';

const today = new Date('2026-11-06T12:00:00Z');

describe('periodError', () => {
  it('accepts a normal range and a single day', () => {
    expect(periodError('2026-10-08', '2026-11-06', today)).toBeNull();
    expect(periodError('2026-11-06', '2026-11-06', today)).toBeNull();
  });
  it('refuses start after end', () => {
    expect(periodError('2026-11-02', '2026-11-01', today)).toEqual({
      field: 'from',
      key: 'startAfterEnd',
    });
  });
  it('refuses more than 366 days but allows exactly 366', () => {
    expect(periodError('2025-11-05', '2026-11-06', today)).toEqual({
      field: 'to',
      key: 'tooLong',
    });
    expect(periodError('2025-11-06', '2026-11-06', today)).toBeNull();
  });
  it('refuses the future and impossible dates', () => {
    expect(periodError('2026-11-01', '2026-11-07', today)?.key).toBe('future');
    expect(periodError('2026-02-31', '2026-03-01', today)?.key).toBe('invalid');
    expect(periodError('2026-1-1', '2026-03-01', today)?.key).toBe('invalid');
  });
  it('reports the issue as an i18n key on the field', () => {
    const result = customRangeSchema(today).safeParse({
      from: '2026-11-02',
      to: '2026-11-01',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({
      path: ['from'],
      message: 'reports.period.errors.startAfterEnd',
    });
  });
});

describe('validatePeriodSearch', () => {
  it('keeps presets and valid ranges, drops everything else', () => {
    expect(validatePeriodSearch({ days: 7 }, today)).toEqual({ days: 7 });
    expect(validatePeriodSearch({ days: '90' }, today)).toEqual({ days: 90 });
    expect(validatePeriodSearch({ days: 15 }, today)).toEqual({});
    expect(
      validatePeriodSearch({ from: '2026-10-01', to: '2026-10-31' }, today),
    ).toEqual({ from: '2026-10-01', to: '2026-10-31' });
    expect(
      validatePeriodSearch({ from: '2026-10-31', to: '2026-10-01' }, today),
    ).toEqual({});
    expect(validatePeriodSearch({ from: '2026-10-01' }, today)).toEqual({});
  });
});

describe('periodToApi', () => {
  it('turns a preset into from/to ending today (UTC)', () => {
    expect(periodToApi({ days: 30 }, today)).toEqual({
      from: '2026-10-08',
      to: '2026-11-06',
    });
    expect(periodToApi({ days: 7 }, today)).toEqual({
      from: '2026-10-31',
      to: '2026-11-06',
    });
  });
  it('passes a custom range and leaves the default to the API', () => {
    expect(
      periodToApi({ from: '2026-10-01', to: '2026-10-05' }, today),
    ).toEqual({ from: '2026-10-01', to: '2026-10-05' });
    expect(periodToApi({}, today)).toEqual({});
  });
});

describe('day helpers', () => {
  it('counts days inclusively and adds across month ends', () => {
    expect(periodLength('2026-10-08', '2026-11-06')).toBe(30);
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
  });
  it('formats a UTC day with Western digits', () => {
    expect(formatDay('2026-10-08', 'ar')).toBe('8 أكتوبر 2026');
    expect(formatDay('2026-10-08', 'ar', 'short')).toBe('8 أكتوبر');
  });
});
