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

  it('cost kind keeps four decimals below 1 USD and two from 1 USD', () => {
    expect(formatUsd('0.012000000', 'ar', { kind: 'cost' })).toBe('0.0120$');
    expect(formatUsd('0.003000000', 'en', { kind: 'cost' })).toBe('$0.0030');
    expect(formatUsd('0.500000000', 'ar', { kind: 'cost' })).toBe('0.5000$');
    expect(formatUsd('1.000000000', 'ar', { kind: 'cost' })).toBe('1.00$');
    expect(formatUsd('0.012000000')).toBe('0.01$');
  });
});

describe('formatUsd exact', () => {
  it('keeps up to 9 decimals and trims trailing zeros', () => {
    expect(formatUsd('2.500000000', 'ar', { kind: 'exact' })).toBe('2.5$');
    expect(formatUsd('0.000092000', 'en', { kind: 'exact' })).toBe('$0.000092');
    expect(formatUsd('10.000000000', 'ar', { kind: 'exact' })).toBe('10$');
    expect(formatUsd('0.123456789', 'ar', { kind: 'exact' })).toBe(
      '0.123456789$',
    );
  });
});
