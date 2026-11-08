import { describe, expect, it } from 'vitest';
import { marginPercent, toChartNumber } from '../money';
import { formatCount } from '../numbers';

describe('marginPercent', () => {
  it('is margin over charged with one decimal', () => {
    expect(marginPercent('3.750000000', '10.000000000')).toBe('37.5');
    expect(marginPercent('1.000000000', '3.000000000')).toBe('33.3');
    expect(marginPercent('5.000000000', '10.000000000')).toBe('50');
  });
  it('keeps the sign of a negative margin', () => {
    expect(marginPercent('-1.250000000', '10.000000000')).toBe('-12.5');
  });
  it('is null when nothing was charged', () => {
    expect(marginPercent('0.000000000', '0.000000000')).toBeNull();
    expect(marginPercent('-2.000000000', '0')).toBeNull();
  });
  it('shows zero without a sign', () => {
    expect(marginPercent('0.000000000', '10.000000000')).toBe('0');
    expect(marginPercent('-0.000000001', '10.000000000')).toBe('0');
  });
});

describe('numbers', () => {
  it('groups thousands with Western digits', () => {
    expect(formatCount(1234567)).toBe('1,234,567');
    expect(formatCount(0)).toBe('0');
  });
  it('gives a plain number for plotting only', () => {
    expect(toChartNumber('0.012300000')).toBe(0.0123);
  });
});
