const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

/** «الآن», «منذ 3 أيام», «أمس»… with Western digits. */
export function formatRelative(
  iso: string,
  language: string,
  now: number = Date.now(),
): string {
  const rtf = new Intl.RelativeTimeFormat(
    language === 'en' ? 'en' : 'ar-u-nu-latn',
    { numeric: 'auto', style: 'short' },
  );
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const abs = Math.abs(seconds);
  for (const [unit, size] of UNITS) {
    if (abs >= size) return rtf.format(Math.trunc(seconds / size), unit);
  }
  return rtf.format(0, 'second');
}
