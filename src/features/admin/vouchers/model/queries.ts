import { useMemo } from 'react';
import {
  useInfiniteQuery,
  useQuery,
  type QueryClient,
} from '@tanstack/react-query';
import {
  adminPlansListOptions,
  adminVouchersGetOptions,
  adminVouchersListInfiniteOptions,
  adminVouchersRedemptionsInfiniteOptions,
} from '~/api/generated/@tanstack/react-query.gen';
import type { VoucherFilter } from './search';

export const VOUCHERS_PAGE_SIZE = 20;

/** `GET /admin/vouchers`, newest first, older pages with `cursor`. */
export function useVouchers(status: VoucherFilter | undefined) {
  const query = { status, limit: VOUCHERS_PAGE_SIZE };
  const result = useInfiniteQuery({
    ...adminVouchersListInfiniteOptions({ query }),
    initialPageParam: { query },
    getNextPageParam: (last: { nextCursor: string | null }) =>
      last.nextCursor ?? undefined,
  });
  const items = useMemo(
    () => result.data?.pages.flatMap((page) => page.items) ?? [],
    [result.data],
  );
  return { ...result, items };
}

export const useVoucher = (id: string) =>
  useQuery(adminVouchersGetOptions({ path: { id } }));

/** Redemptions of one code. `status` is not sent: the endpoint ignores it. */
export function useRedemptions(id: string) {
  const query = { limit: VOUCHERS_PAGE_SIZE };
  const result = useInfiniteQuery({
    ...adminVouchersRedemptionsInfiniteOptions({ path: { id }, query }),
    initialPageParam: { path: { id }, query },
    getNextPageParam: (last: { nextCursor: string | null }) =>
      last.nextCursor ?? undefined,
  });
  const items = useMemo(
    () => result.data?.pages.flatMap((page) => page.items) ?? [],
    [result.data],
  );
  return { ...result, items };
}

/** Active plans except the default one: what a trial code may start. */
export function useTrialPlans() {
  const query = useQuery(adminPlansListOptions());
  const plans = useMemo(
    () => query.data?.filter((plan) => plan.isActive && !plan.isDefault) ?? [],
    [query.data],
  );
  return { ...query, plans };
}

/** After a write: lists, details and redemptions of vouchers are stale. */
export function invalidateVouchers(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    predicate: (query) => {
      const first = query.queryKey[0] as { _id?: string } | undefined;
      return /^adminVouchers[A-Z]/.test(first?._id ?? '');
    },
  });
}
