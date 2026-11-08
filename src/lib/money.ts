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
  kind?: 'balance' | 'cost' | 'exact';
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
  // `exact` (rates, provider costs): every significant decimal up to 9, trailing zeros trimmed.
  const fixed =
    options.kind === 'exact'
      ? abs.toDecimalPlaces(9, Decimal.ROUND_HALF_UP).toFixed()
      : abs.toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP).toFixed(decimals);
  const [whole = '0', fraction] = fixed.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const number = fraction ? `${grouped}.${fraction}` : grouped;
  const sign = amount.isNegative() && !abs.isZero() ? '-' : '';
  return locale === 'ar' ? `${sign}${number}$` : `${sign}$${number}`;
}

/**
 * Y-axis tick for a money chart: the plotted number goes through formatUsd, so float
 * noise (0.15000000000000002) is rounded and small values keep 4 decimals ("0.0005$").
 */
export function moneyTick(value: number, locale: 'ar' | 'en' = 'ar'): string {
  return formatUsd(String(value), locale);
}

/**
 * Margin as a percent of what users were charged, one decimal, trailing zero
 * trimmed ("37.5", "-12", "0"). Null when charged is zero (no meaningful ratio).
 * The caller adds the "%" sign.
 */
export function marginPercent(
  margin: MoneyString,
  charged: MoneyString,
): string | null {
  const base = toDecimal(charged);
  if (base.isZero()) return null;
  const percent = toDecimal(margin)
    .div(base)
    .times(100)
    .toDecimalPlaces(1, Decimal.ROUND_HALF_UP);
  return percent.isZero() ? '0' : percent.toFixed();
}

/**
 * A plain number for plotting only (bar heights). Never for display or
 * arithmetic: show the original string with <Money>.
 */
export function toChartNumber(value: MoneyString): number {
  return toDecimal(value).toNumber();
}

/**
 * `part` as a whole percent (0-100) of `total`, for bar widths only.
 * 0 when total is zero.
 */
export function sharePercent(part: MoneyString, total: MoneyString): number {
  const base = toDecimal(total);
  if (base.isZero()) return 0;
  const percent = toDecimal(part).div(base).times(100);
  return Math.min(100, Math.max(0, percent.toDecimalPlaces(0).toNumber()));
}
