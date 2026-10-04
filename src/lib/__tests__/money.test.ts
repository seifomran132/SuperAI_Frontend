import { formatUsd } from '~/lib/money';

describe('formatUsd', () => {
  it('formats API decimal strings with two decimals', () => {
    expect(formatUsd('14.480000000')).toBe('14.48$');
    expect(formatUsd('4.750000000', 'en')).toBe('$4.75');
  });

  it('keeps sub-cent costs visible with four decimals', () => {
    expect(formatUsd('0.001470000')).toBe('0.0015$');
    expect(formatUsd('0.004200000')).toBe('0.0042$');
  });

  it('shows zero as 0.00', () => {
    expect(formatUsd('0.000000000')).toBe('0.00$');
  });

  it('groups thousands and keeps the sign', () => {
    expect(formatUsd('10000.000000000')).toBe('10,000.00$');
    expect(formatUsd('-2.500000000')).toBe('-2.50$');
  });

  it('does not lose precision on large values', () => {
    expect(formatUsd('12345678901.995000000')).toBe('12,345,678,902.00$');
    expect(formatUsd('0.105000000')).toBe('0.11$');
  });
});
