import type { VoucherDto } from '~/api/generated/types.gen';

export type VoucherStatus =
  'inactive' | 'usedUp' | 'expired' | 'notStarted' | 'active';

/** Display status (decision 10): stopped, then used up, then the time window. */
export function voucherStatus(
  v: Pick<
    VoucherDto,
    'isActive' | 'redemptionCount' | 'maxRedemptions' | 'startsAt' | 'endsAt'
  >,
  now: Date = new Date(),
): VoucherStatus {
  if (!v.isActive) return 'inactive';
  if (v.redemptionCount >= v.maxRedemptions) return 'usedUp';
  if (v.endsAt && new Date(v.endsAt) <= now) return 'expired';
  if (v.startsAt && new Date(v.startsAt) > now) return 'notStarted';
  return 'active';
}
