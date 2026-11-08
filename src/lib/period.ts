// Report periods are UTC calendar days (F9 decision 4). The period lives in the URL:
// `?days=7|30|90` or `?from=YYYY-MM-DD&to=YYYY-MM-DD`. No period means the API default.

export const PERIOD_PRESETS = [7, 30, 90] as const;
export type PeriodPreset = (typeof PERIOD_PRESETS)[number];
export const MAX_PERIOD_DAYS = 366;

const DAY_MS = 86_400_000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface PeriodSearch {
  days?: PeriodPreset;
  from?: string;
  to?: string;
}

export interface ApiPeriod {
  from?: string;
  to?: string;
}

/** Message keys are i18n keys under `reports.period.errors`. */
export type PeriodErrorKey = 'invalid' | 'startAfterEnd' | 'tooLong' | 'future';

/** `YYYY-MM-DD` of the UTC day of `date`. */
export function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Parses a strict calendar date (rejects 2026-02-31); null when invalid. */
export function parseDay(value: string): number | null {
  if (!DATE_RE.test(value)) return null;
  const ms = Date.parse(`${value}T00:00:00.000Z`);
  if (Number.isNaN(ms)) return null;
  return utcDay(new Date(ms)) === value ? ms : null;
}

export function addDays(day: string, delta: number): string {
  const ms = parseDay(day);
  if (ms === null) throw new Error(`Invalid day: ${day}`);
  return utcDay(new Date(ms + delta * DAY_MS));
}

/** Number of days in the period, both ends included. */
export function periodLength(from: string, to: string): number {
  const a = parseDay(from);
  const b = parseDay(to);
  if (a === null || b === null) return 0;
  return Math.round((b - a) / DAY_MS) + 1;
}

/** Why a custom range is refused, or null when it is fine. */
export function periodError(
  from: string,
  to: string,
  today: Date = new Date(),
): { field: 'from' | 'to'; key: PeriodErrorKey } | null {
  const a = parseDay(from);
  const b = parseDay(to);
  if (a === null) return { field: 'from', key: 'invalid' };
  if (b === null) return { field: 'to', key: 'invalid' };
  const now = parseDay(utcDay(today)) as number;
  if (a > now) return { field: 'from', key: 'future' };
  if (b > now) return { field: 'to', key: 'future' };
  if (a > b) return { field: 'from', key: 'startAfterEnd' };
  if (periodLength(from, to) > MAX_PERIOD_DAYS)
    return { field: 'to', key: 'tooLong' };
  return null;
}

/**
 * Dates are typed in a masked text field (`YYYY-MM-DD`): native date inputs follow
 * the browser's locale and can show Arabic-Indic digits.
 */
export function maskDate(raw: string): string {
  const digits = westernDigits(raw).slice(0, 8);
  return [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)]
    .filter(Boolean)
    .join('-');
}

/** Only the digits of `raw`, with Arabic and Persian digits converted to Western. */
export function westernDigits(raw: string): string {
  return raw
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/\D/g, '');
}

/**
 * Router `validateSearch`: keeps a valid preset or a valid range, drops anything
 * else (the page then uses the API default instead of showing an error).
 */
export function validatePeriodSearch(
  search: Record<string, unknown>,
  today: Date = new Date(),
): PeriodSearch {
  const days = Number(search.days);
  if (
    search.days !== undefined &&
    PERIOD_PRESETS.includes(days as PeriodPreset)
  )
    return { days: days as PeriodPreset };
  const { from, to } = search;
  if (
    typeof from === 'string' &&
    typeof to === 'string' &&
    periodError(from, to, today) === null
  )
    return { from, to };
  return {};
}

/** The API `from`/`to` for a period; empty when the API default applies. */
export function periodToApi(
  period: PeriodSearch,
  today: Date = new Date(),
): ApiPeriod {
  if (period.days) {
    const to = utcDay(today);
    return { from: addDays(to, -(period.days - 1)), to };
  }
  if (period.from && period.to) return { from: period.from, to: period.to };
  return {};
}

/** A UTC day for display («8 أكتوبر 2026»), Western digits. Never shifted by the viewer's time zone. */
export function formatDay(
  day: string,
  language: string,
  style: 'long' | 'short' | 'number' = 'long',
): string {
  const ms = parseDay(day);
  if (ms === null) return day;
  const options: Intl.DateTimeFormatOptions =
    style === 'number'
      ? { day: 'numeric' }
      : style === 'short'
        ? { day: 'numeric', month: 'short' }
        : { day: 'numeric', month: 'long', year: 'numeric' };
  return new Intl.DateTimeFormat(
    language === 'en' ? 'en-u-nu-latn' : 'ar-u-nu-latn-ca-gregory',
    { ...options, timeZone: 'UTC' },
  ).format(new Date(ms));
}
