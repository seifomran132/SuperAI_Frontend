import { useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type Decimal from 'decimal.js';
import { adminVoucherBatchesExport } from '~/api/generated';
import {
  adminVoucherBatchesCodesInfiniteOptions,
  adminVoucherBatchesGetOptions,
  adminVoucherBatchesListInfiniteOptions,
} from '~/api/generated/@tanstack/react-query.gen';
import type {
  VoucherBatchCodeDto,
  VoucherBatchDto,
} from '~/api/generated/types.gen';
import { toDecimal } from '~/lib/money';
import { amountError } from './form';
import { VOUCHERS_PAGE_SIZE } from './queries';
import type { VoucherFilter } from './search';
import type { VoucherStatus } from './status';

export const MIN_QUANTITY = 3;
export const MAX_QUANTITY = 100;
export const DEFAULT_QUANTITY = 10;
export const MAX_BATCH_TOTAL = '10000';
export const DEFAULT_PREFIX = 'LAM7A';

const DIGITS = /^\d+$/;
const PREFIX = /^[A-Za-z0-9]{2,12}$/;

/** i18n keys are under `admin.`; `null` = valid. */
export function quantityError(value: string): string | null {
  const text = value.trim();
  const n = Number(text);
  return DIGITS.test(text) && n >= MIN_QUANTITY && n <= MAX_QUANTITY
    ? null
    : 'vouchers.batches.errors.quantityInvalid';
}

export function prefixError(value: string): string | null {
  const text = value.trim();
  return text === '' || PREFIX.test(text)
    ? null
    : 'vouchers.batches.errors.prefixInvalid';
}

/** quantity × amount; `null` until both are valid. */
export function batchTotal(quantity: string, amount: string): Decimal | null {
  if (quantityError(quantity) || amountError(amount)) return null;
  return toDecimal(amount.trim()).times(quantity.trim());
}

export const overBatchLimit = (total: Decimal | null) =>
  total !== null && total.gt(MAX_BATCH_TOTAL);

/** What one code will look like; a prefix still being typed shows the default. */
export function exampleCode(prefix: string): string {
  const text = prefix.trim();
  const shown = text && PREFIX.test(text) ? text.toUpperCase() : DEFAULT_PREFIX;
  return `${shown}-7KQ2-XH9M`;
}

/** Stopped, then fully redeemed, then the time window, as for single codes. */
export function batchStatus(
  b: Pick<
    VoucherBatchDto,
    'isActive' | 'redeemedCount' | 'quantity' | 'startsAt' | 'endsAt'
  >,
  now: Date = new Date(),
): VoucherStatus {
  if (!b.isActive) return 'inactive';
  if (b.redeemedCount >= b.quantity) return 'usedUp';
  if (b.endsAt && new Date(b.endsAt) <= now) return 'expired';
  if (b.startsAt && new Date(b.startsAt) > now) return 'notStarted';
  return 'active';
}

export type BatchCodeStatus = 'used' | 'off' | 'unused';

export function batchCodeStatus(
  code: Pick<VoucherBatchCodeDto, 'isActive' | 'redeemedAt'>,
): BatchCodeStatus {
  if (code.redeemedAt) return 'used';
  return code.isActive ? 'unused' : 'off';
}

/** Share of a bar, 0-100. Only for drawing, never shown as money. */
export function percentOf(part: string | number, whole: string | number) {
  const total = toDecimal(String(whole));
  if (total.lte(0)) return 0;
  return Math.min(
    100,
    toDecimal(String(part)).div(total).times(100).toNumber(),
  );
}

/** Characters Windows and browsers refuse in a file name become dashes. */
export function csvFileName(name: string): string {
  const safe = name
    // eslint-disable-next-line no-control-regex
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-')
    .trim();
  return `${safe || 'codes'}.csv`;
}

/** The export needs the bearer token, so a plain link cannot download it. */
export async function downloadBatchCsv(batch: { id: string; name: string }) {
  const { data } = await adminVoucherBatchesExport({
    path: { id: batch.id },
    parseAs: 'blob',
    throwOnError: true,
  });
  const blob =
    (data as unknown) instanceof Blob
      ? (data as unknown as Blob)
      : new Blob([String(data)], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = csvFileName(batch.name);
  link.click();
  URL.revokeObjectURL(url);
}

const nextCursor = (last: { nextCursor: string | null }) =>
  last.nextCursor ?? undefined;

/** `GET /admin/voucher-batches`, newest first. */
export function useBatches(status: VoucherFilter | undefined) {
  const query = { status, limit: VOUCHERS_PAGE_SIZE };
  const result = useInfiniteQuery({
    ...adminVoucherBatchesListInfiniteOptions({ query }),
    initialPageParam: { query },
    getNextPageParam: nextCursor,
  });
  const items = useMemo(
    () => result.data?.pages.flatMap((page) => page.items) ?? [],
    [result.data],
  );
  return { ...result, items };
}

export const useBatch = (id: string) =>
  useQuery(adminVoucherBatchesGetOptions({ path: { id } }));

export function useBatchCodes(id: string, status?: 'used' | 'unused') {
  const query = { status, limit: VOUCHERS_PAGE_SIZE };
  const result = useInfiniteQuery({
    ...adminVoucherBatchesCodesInfiniteOptions({ path: { id }, query }),
    initialPageParam: { path: { id }, query },
    getNextPageParam: nextCursor,
  });
  const items = useMemo(
    () => result.data?.pages.flatMap((page) => page.items) ?? [],
    [result.data],
  );
  return { ...result, items };
}
