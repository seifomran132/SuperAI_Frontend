import { isApiError } from '~/api/errors';
import { toDecimal } from '~/lib/money';

/** Field → i18n key under `admin.`; empty = valid. */
export type Errors = Record<string, string>;

/** Field errors the API reported in `details` (the text is ours, never the API's). */
export function serverFieldErrors(error: unknown): Errors | null {
  if (!isApiError(error) || error.code !== 'VALIDATION_FAILED') return null;
  const fields = (error.details ?? []).map((d) => d.field);
  return fields.length === 0
    ? null
    : Object.fromEntries(fields.map((f) => [f, 'dialog.fieldInvalid']));
}

/** Stable identifier: 2–32 of lowercase letters, digits, "-", "_" (starts with a letter or digit). */
export const KEY_PATTERN = /^[a-z0-9][a-z0-9_-]{1,31}$/;
const DECIMAL = /^\d+(\.\d{1,9})?$/;
const PERCENT = /^\d+(\.\d{1,4})?$/;
const INTEGER = /^\d{1,9}$/;

/** `new` is taken by the /new routes. */
export const keyError = (v: string) =>
  !KEY_PATTERN.test(v.trim())
    ? 'catalog.keyInvalid'
    : v.trim() === 'new'
      ? 'catalog.keyReserved'
      : null;
export const requiredError = (v: string) =>
  v.trim() === '' ? 'catalog.required' : null;
/** USD amount as text; never converted to a JS number. */
export const decimalError = (v: string) =>
  DECIMAL.test(v.trim()) ? null : 'catalog.decimalInvalid';
export const integerError = (v: string, max = 10_000_000) =>
  INTEGER.test(v.trim()) && /[1-9]/.test(v) && parseInt(v, 10) <= max
    ? null
    : 'catalog.integerInvalid';
export const sortError = (v: string) =>
  INTEGER.test(v.trim()) && parseInt(v, 10) <= 1000
    ? null
    : 'catalog.sortInvalid';
/** Margin % between 0 and 500. */
export function percentError(v: string) {
  const text = v.trim();
  if (!PERCENT.test(text) || toDecimal(text).greaterThan(500)) {
    return 'catalog.percentInvalid';
  }
  return null;
}

/** Collects the first problem per field; `null` checks are skipped. */
export function collect(
  checks: Record<string, string | null | undefined>,
): Errors {
  return Object.fromEntries(
    Object.entries(checks).filter((entry): entry is [string, string] =>
      Boolean(entry[1]),
    ),
  );
}
