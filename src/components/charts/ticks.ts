import { formatDay } from '~/lib/period';

/** Every how many days a label is shown, for a period of `count` days (up to 366). */
export function labelStep(count: number): number {
  if (count <= 10) return 1;
  if (count <= 35) return 5;
  if (count <= 100) return 10;
  if (count <= 200) return 15;
  return 30;
}

/**
 * Dates that get an X label: the first day, every `step`-th day and the last day
 * (today). A step label too close to the last day is dropped so they never overlap.
 */
export function tickDates(dates: readonly string[]): string[] {
  const step = labelStep(dates.length);
  const last = dates.length - 1;
  const out: string[] = [];
  for (let i = 0; i <= last; i += step) {
    if (i !== last && last - i < Math.ceil(step / 2) && i !== 0) continue;
    out.push(dates[i] as string);
  }
  const lastDate = dates[last];
  if (lastDate !== undefined && out[out.length - 1] !== lastDate)
    out.push(lastDate);
  return out;
}

/** Day number, plus the short month name on the first label, on a month change and on the last. */
export function tickLabel(
  date: string,
  shown: readonly string[],
  language: string,
): string {
  const at = shown.indexOf(date);
  const previous = at > 0 ? shown[at - 1] : undefined;
  const withMonth =
    at <= 0 ||
    at === shown.length - 1 ||
    (previous !== undefined && previous.slice(0, 7) !== date.slice(0, 7));
  return formatDay(date, language, withMonth ? 'short' : 'number');
}

/** A rounded-up axis maximum (1, 2, 2.5, 5, 10 × 10ⁿ) so both Y axes share one scale. */
export function niceMax(max: number): number {
  if (!(max > 0)) return 1;
  const exponent = Math.floor(Math.log10(max));
  const base = 10 ** exponent;
  const fraction = max / base;
  const step = [1, 2, 2.5, 5, 10].find((s) => fraction <= s + 1e-9) ?? 10;
  return step * base;
}

/** Five evenly spaced ticks from 0 to `top`. */
export function axisTicks(top: number): number[] {
  return [0, 1, 2, 3, 4].map((i) => (top * i) / 4);
}
