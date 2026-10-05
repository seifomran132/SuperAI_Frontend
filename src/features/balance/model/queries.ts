import { useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  meBalanceControllerActivityInfiniteOptions,
  meSubscriptionControllerGetOptions,
} from '~/api/generated/@tanstack/react-query.gen';

export const ACTIVITY_PAGE_SIZE = 30;

/** `GET /me/balance/activity`, newest first, older pages with `before`. */
export const activityOptions = () => ({
  ...meBalanceControllerActivityInfiniteOptions({
    query: { limit: ACTIVITY_PAGE_SIZE },
  }),
  initialPageParam: {},
  getNextPageParam: (last: { nextBefore: number | null }) =>
    last.nextBefore ?? undefined,
});

export function useActivity() {
  const query = useInfiniteQuery(activityOptions());
  const entries = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  return { ...query, entries };
}

/** Plan and (when there is one) subscription dates. */
export function useSubscription() {
  return useQuery(meSubscriptionControllerGetOptions());
}
