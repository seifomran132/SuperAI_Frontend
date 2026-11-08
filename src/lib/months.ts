// "My usage" months are UTC `YYYY-MM`. Arabic month names, Western digits.

const MONTH_RE = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function isMonth(value: unknown): value is string {
  return typeof value === 'string' && MONTH_RE.test(value);
}

export function currentMonth(now: Date = new Date()): string {
  return now.toISOString().slice(0, 7);
}

function index(month: string): number {
  const [, y, m] = MONTH_RE.exec(month) as RegExpExecArray;
  return Number(y) * 12 + Number(m) - 1;
}

function fromIndex(i: number): string {
  const year = Math.floor(i / 12);
  return `${String(year).padStart(4, '0')}-${String((i % 12) + 1).padStart(2, '0')}`;
}

export function addMonths(month: string, delta: number): string {
  return fromIndex(index(month) + delta);
}

/** Months from `first` to `last` inclusive, newest first. Empty if `first` is after `last`. */
export function monthRange(first: string, last: string): string[] {
  const out: string[] = [];
  for (let i = index(last); i >= index(first); i--) out.push(fromIndex(i));
  return out;
}

/** «أكتوبر 2026». */
export function formatMonth(month: string, language: string): string {
  const [y, m] = month.split('-').map(Number) as [number, number];
  return new Intl.DateTimeFormat(
    language === 'en' ? 'en-u-nu-latn' : 'ar-u-nu-latn-ca-gregory',
    { month: 'long', year: 'numeric', timeZone: 'UTC' },
  ).format(new Date(Date.UTC(y, m - 1, 1)));
}

export interface MonthSearch {
  month?: string;
}

/** Router `validateSearch`: a malformed or future month falls back to the current one. */
export function validateMonthSearch(
  search: Record<string, unknown>,
  now: Date = new Date(),
): MonthSearch {
  const { month } = search;
  if (isMonth(month) && month <= currentMonth(now)) return { month };
  return {};
}
