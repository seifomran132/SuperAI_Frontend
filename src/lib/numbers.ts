/** Counts and token totals: Western digits with thousands separators in both languages. */
const formatter = new Intl.NumberFormat('en');

export function formatCount(value: number): string {
  return formatter.format(value);
}
