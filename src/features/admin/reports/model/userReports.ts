import { useMemo } from 'react';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import {
  adminReportsAuditInfiniteOptions,
  adminReportsChatRequestsInfiniteOptions,
  adminReportsUserUsageOptions,
} from '~/api/generated/@tanstack/react-query.gen';
import { periodToApi, type PeriodSearch } from '~/lib/period';
import type { AuditSearch, RequestsFilter } from './search';

export const REQUESTS_PAGE_SIZE = 20;
export const AUDIT_PAGE_SIZE = 30;

export function useUserUsage(userId: string, period: PeriodSearch) {
  return useQuery({
    ...adminReportsUserUsageOptions({
      path: { id: userId },
      query: periodToApi(period),
    }),
    placeholderData: keepPreviousData,
  });
}

/** `GET /admin/chat-requests`, newest first, older pages with `cursor`. */
export function useChatRequests(filter: {
  userId?: string;
  status: RequestsFilter;
}) {
  const query = {
    userId: filter.userId,
    status: filter.status === 'all' ? undefined : filter.status,
    limit: REQUESTS_PAGE_SIZE,
  };
  const result = useInfiniteQuery({
    ...adminReportsChatRequestsInfiniteOptions({ query }),
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

/** `GET /admin/audit`, newest first, older pages with `before`. */
export function useAuditLog(filters: AuditSearch) {
  const query = { ...filters, limit: AUDIT_PAGE_SIZE };
  const result = useInfiniteQuery({
    ...adminReportsAuditInfiniteOptions({ query }),
    initialPageParam: { query },
    getNextPageParam: (last: { nextBefore: number | null }) =>
      last.nextBefore ?? undefined,
  });
  const entries = useMemo(
    () => result.data?.pages.flatMap((page) => page.items) ?? [],
    [result.data],
  );
  return { ...result, entries };
}
