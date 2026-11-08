import { maskDate, westernDigits } from '~/lib/period';

const pad = (n: number) => String(n).padStart(2, '0');
const LOCAL = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/;

/** ISO instant → field text `YYYY-MM-DD HH:mm` in the device's time zone. */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Local date-time text → ISO UTC; null when empty, incomplete or not a real time. */
export function fromLocalInput(value: string): string | null {
  const match = LOCAL.exec(value.trim());
  if (!match) return null;
  const [year, month, day, hour, minute] = match.slice(1).map(Number) as [
    number,
    number,
    number,
    number,
    number,
  ];
  const d = new Date(year, month - 1, day, hour, minute);
  // Date rolls 31 February over to March; a changed part means the input was not real.
  const real =
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day &&
    d.getHours() === hour &&
    d.getMinutes() === minute;
  return real ? d.toISOString() : null;
}

/** Shapes typing into `YYYY-MM-DD HH:mm`, always with Western digits. */
export function maskDateTime(raw: string): string {
  const digits = westernDigits(raw).slice(0, 12);
  const date = maskDate(digits);
  const time = [digits.slice(8, 10), digits.slice(10, 12)]
    .filter(Boolean)
    .join(':');
  return time ? `${date} ${time}` : date;
}
