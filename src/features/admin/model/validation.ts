import { toDecimal } from '~/lib/money';

// Money is validated as text and sent as the same string; never converted to a
// JS number. Up to 9 decimals, like the API's decimal strings.
const UNSIGNED = /^\d+(\.\d{1,9})?$/;
const SIGNED = /^-?\d+(\.\d{1,9})?$/;
const MAX_USD = 10_000;

export type AmountError =
  | 'balance.amountInvalid'
  | 'balance.amountInvalidSigned'
  | 'balance.amountZero'
  | 'balance.amountTooLarge';

/** i18n key (under `admin.`) of the problem with an amount, or null when valid. */
export function amountError(
  value: string,
  { signed }: { signed: boolean },
): AmountError | null {
  const text = value.trim();
  if (!(signed ? SIGNED : UNSIGNED).test(text)) {
    return signed ? 'balance.amountInvalidSigned' : 'balance.amountInvalid';
  }
  if (!/[1-9]/.test(text)) return 'balance.amountZero';
  if (toDecimal(text).abs().greaterThan(MAX_USD)) {
    return 'balance.amountTooLarge';
  }
  return null;
}

export type ReasonError =
  'dialog.reasonRequired' | 'dialog.reasonShort' | 'dialog.reasonLong';

/** The audit-log reason is 3–500 characters. */
export function reasonError(value: string): ReasonError | null {
  const length = value.trim().length;
  if (length === 0) return 'dialog.reasonRequired';
  if (length < 3) return 'dialog.reasonShort';
  if (length > 500) return 'dialog.reasonLong';
  return null;
}

/** End of the chosen local day as an ISO instant, or null when it is not in the future. */
export function periodEndIso(date: string, now = new Date()): string | null {
  const end = new Date(`${date}T23:59:59`);
  if (Number.isNaN(end.getTime()) || end <= now) return null;
  return end.toISOString();
}
