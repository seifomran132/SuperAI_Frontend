export const VOUCHER_FILTERS = ['active', 'inactive'] as const;
export type VoucherFilter = (typeof VOUCHER_FILTERS)[number];

export interface VouchersSearch {
  tab?: 'batches';
  status?: VoucherFilter;
}

/** URL search params of /admin/vouchers; anything malformed is dropped. */
export function validateVouchersSearch(
  raw: Record<string, unknown>,
): VouchersSearch {
  return {
    ...(raw.tab === 'batches' ? { tab: 'batches' as const } : {}),
    ...(VOUCHER_FILTERS.includes(raw.status as VoucherFilter)
      ? { status: raw.status as VoucherFilter }
      : {}),
  };
}

export interface BatchSearch {
  created?: boolean;
}

/** `created` shows the live-codes notice right after a batch is made. */
export function validateBatchSearch(raw: Record<string, unknown>): BatchSearch {
  return raw.created === true || raw.created === 'true'
    ? { created: true }
    : {};
}
