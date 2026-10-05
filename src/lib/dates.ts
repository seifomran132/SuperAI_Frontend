// Dates use Western digits in both languages (CLAUDE.md), Gregorian calendar.
const locale = (language: string) =>
  language === 'en' ? 'en-u-nu-latn' : 'ar-u-nu-latn-ca-gregory';

/** «2 أكتوبر 2026». */
export function formatDate(iso: string, language: string): string {
  return new Intl.DateTimeFormat(locale(language), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

const time = (date: Date, language: string) =>
  new Intl.DateTimeFormat(locale(language), {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);

const dayStart = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "today"/"yesterday" with a time, older dates as «2 أكتوبر 2026 · 18:30». */
export function formatActivityDate(
  iso: string,
  language: string,
  labels: { today: string; yesterday: string },
  now: Date = new Date(),
): string {
  const date = new Date(iso);
  const days = Math.round((dayStart(now) - dayStart(date)) / 86_400_000);
  const clock = time(date, language);
  if (days === 0) return `${labels.today} ${clock}`;
  if (days === 1) return `${labels.yesterday} ${clock}`;
  return `${formatDate(iso, language)} · ${clock}`;
}
