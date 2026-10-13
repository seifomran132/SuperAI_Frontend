import { useMemo } from 'react';
import {
  useInfiniteQuery,
  useQuery,
  type QueryClient,
} from '@tanstack/react-query';
import {
  adminLedgerBalanceOptions,
  meBalanceActivityInfiniteQueryKey,
  meBalanceBalanceQueryKey,
  meGetQueryKey,
  meSubscriptionGetQueryKey,
  adminLedgerBalanceQueryKey,
  adminLedgerEntriesInfiniteOptions,
  adminLedgerEntriesInfiniteQueryKey,
  adminPlansListOptions,
  adminSubscriptionsHistoryOptions,
  adminSubscriptionsHistoryQueryKey,
  adminUsersGetOptions,
  adminUsersGetQueryKey,
  adminUsersListOptions,
  adminUsersListQueryKey,
} from '~/api/generated/@tanstack/react-query.gen';
import { USERS_PAGE_SIZE, type UsersSearch } from './search';

export const LEDGER_PAGE_SIZE = 30;

export function useUsers(search: UsersSearch) {
  return useQuery({
    ...adminUsersListOptions({
      query: {
        q: search.q,
        status: search.status,
        isAdmin: search.isAdmin,
        page: search.page ?? 1,
        pageSize: USERS_PAGE_SIZE,
      },
    }),
    placeholderData: (previous) => previous,
  });
}

export const useUser = (id: string) =>
  useQuery(adminUsersGetOptions({ path: { id } }));

export const useSubscriptions = (id: string) =>
  useQuery(adminSubscriptionsHistoryOptions({ path: { id } }));

export const useUserBalance = (id: string) =>
  useQuery(adminLedgerBalanceOptions({ path: { id } }));

/** Active plans an admin can assign. */
export function useActivePlans() {
  const query = useQuery(adminPlansListOptions());
  const plans = useMemo(
    () => query.data?.filter((plan) => plan.isActive) ?? [],
    [query.data],
  );
  return { ...query, plans };
}

/** `GET …/ledger`, newest first, older pages with `before`. */
export function useLedger(id: string) {
  const query = useInfiniteQuery({
    ...adminLedgerEntriesInfiniteOptions({
      path: { id },
      query: { limit: LEDGER_PAGE_SIZE },
    }),
    initialPageParam: { path: { id }, query: { limit: LEDGER_PAGE_SIZE } },
    getNextPageParam: (last: { nextBefore: number | null }) =>
      last.nextBefore ?? undefined,
  });
  const entries = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  return { ...query, entries };
}

/** After a write: everything shown about this user (and the list rows) is stale. */
export function invalidateUser(queryClient: QueryClient, id: string) {
  const path = { path: { id } };
  // An admin changing their own account also changes what the customer screens show.
  const me = queryClient.getQueryData<{ id: string }>(meGetQueryKey());
  const own =
    me?.id === id
      ? [
          meGetQueryKey(),
          meBalanceBalanceQueryKey(),
          meBalanceActivityInfiniteQueryKey(),
          meSubscriptionGetQueryKey(),
        ].map((queryKey) => queryClient.invalidateQueries({ queryKey }))
      : [];
  return Promise.all([
    ...own,
    queryClient.invalidateQueries({
      queryKey: adminUsersGetQueryKey(path),
    }),
    queryClient.invalidateQueries({
      queryKey: adminSubscriptionsHistoryQueryKey(path),
    }),
    queryClient.invalidateQueries({
      queryKey: adminLedgerBalanceQueryKey(path),
    }),
    // Prefix match: covers the infinite query whatever its page size.
    queryClient.invalidateQueries({
      queryKey: adminLedgerEntriesInfiniteQueryKey(path),
    }),
    queryClient.invalidateQueries({
      queryKey: adminUsersListQueryKey(),
    }),
  ]);
}
