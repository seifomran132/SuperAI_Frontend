import Decimal from 'decimal.js';

// Money from the API is a USD decimal string with 9 decimals ("4.750000000").
// Never convert it to a JS number. Arithmetic, if ever needed, goes through Decimal.

export type MoneyString = string;

export function toDecimal(value: MoneyString): Decimal {
  return new Decimal(value);
}

/**
 * Formats a USD amount for display with Western digits, e.g. "14.48$" (ar) or "$14.48" (en).
 * Amounts below one cent show up to 4 decimals so per-message costs stay visible ("0.0015$").
 */
export interface FormatUsdOptions {
  /** `cost`: per-answer costs and estimates, 4 decimals below 1 USD. Default: balances. */
  kind?: 'balance' | 'cost';
}

export function formatUsd(
  value: MoneyString,
  locale: 'ar' | 'en' = 'ar',
  options: FormatUsdOptions = {},
): string {
  const amount = toDecimal(value);
  const abs = amount.abs();
  const decimals =
    options.kind === 'cost'
      ? abs.gte(1)
        ? 2
        : 4
      : abs.isZero() || abs.gte('0.01')
        ? 2
        : 4;
  const fixed = abs
    .toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP)
    .toFixed(decimals);
  const [whole = '0', fraction] = fixed.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const number = fraction ? `${grouped}.${fraction}` : grouped;
  const sign = amount.isNegative() && !abs.isZero() ? '-' : '';
  return locale === 'ar' ? `${sign}${number}$` : `${sign}$${number}`;
}
