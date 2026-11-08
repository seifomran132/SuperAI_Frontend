export const VOUCHER_FILTERS = ['active', 'inactive'] as const;
export type VoucherFilter = (typeof VOUCHER_FILTERS)[number];

export interface VouchersSearch {
  status?: VoucherFilter;
}

/** URL search params of /admin/vouchers; anything malformed is dropped. */
export function validateVouchersSearch(
  raw: Record<string, unknown>,
): VouchersSearch {
  return VOUCHER_FILTERS.includes(raw.status as VoucherFilter)
    ? { status: raw.status as VoucherFilter }
    : {};
}
