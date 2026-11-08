import { toDecimal } from '~/lib/money';
import { fromLocalInput } from './dates';

/** i18n keys are under `admin.`; `null` = valid. */
const AMOUNT = /^\d+(\.\d{1,9})?$/;
const DIGITS = /^\d+$/;
const CODE = /^[A-Za-z0-9-]{4,40}$/;
export const MAX_AMOUNT = 1000;
export const MAX_DAYS = 365;
export const MAX_REDEMPTIONS = 1_000_000;

export function amountError(value: string): string | null {
  const text = value.trim();
  if (!AMOUNT.test(text)) return 'vouchers.errors.amountInvalid';
  const amount = toDecimal(text);
  if (amount.lte(0)) return 'vouchers.errors.amountInvalid';
  return amount.gt(MAX_AMOUNT) ? 'vouchers.errors.amountTooLarge' : null;
}

export function daysError(value: string): string | null {
  const text = value.trim();
  if (!DIGITS.test(text)) return 'vouchers.errors.daysInvalid';
  const n = Number(text);
  return n >= 1 && n <= MAX_DAYS ? null : 'vouchers.errors.daysInvalid';
}

/** `min` is the redemptions already made (edit) or 1 (create). */
export function limitError(value: string, min = 1): string | null {
  const text = value.trim();
  if (!DIGITS.test(text) || text.length > 9) {
    return 'vouchers.errors.limitInvalid';
  }
  const n = Number(text);
  if (n < 1 || n > MAX_REDEMPTIONS) return 'vouchers.errors.limitInvalid';
  return n < min ? 'vouchers.errors.limitBelowUsed' : null;
}

export function codeError(value: string): string | null {
  const text = value.trim();
  return text === '' || CODE.test(text) ? null : 'vouchers.errors.codeInvalid';
}

export function dateError(value: string): string | null {
  return value.trim() !== '' && fromLocalInput(value) === null
    ? 'vouchers.errors.dateInvalid'
    : null;
}

/**
 * The end must come after the start, or after now when there is no start (then the
 * message does not mention a start date).
 */
export function windowError(
  startsAt: string,
  endsAt: string,
  now: Date = new Date(),
): string | null {
  const end = fromLocalInput(endsAt);
  if (!end) return null;
  const start = fromLocalInput(startsAt);
  if (start) {
    return new Date(end) <= new Date(start)
      ? 'vouchers.errors.endBeforeStart'
      : null;
  }
  return new Date(end) <= now ? 'vouchers.errors.endInPast' : null;
}
