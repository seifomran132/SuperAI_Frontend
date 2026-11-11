import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { isApiError } from '~/api/errors';
import {
  adminReportsAgentRunOptions,
  adminReportsAgentRunsInfiniteOptions,
} from '~/api/generated/@tanstack/react-query.gen';
import type { AdminAgentRunDto } from '~/api/generated/types.gen';
import type { RequestsFilter } from './search';

/** `GET /admin/agent-runs`, newest first, older pages with `cursor` (§11.4). */
export function useAgentRuns(filter: {
  status: RequestsFilter;
  userId?: string;
}) {
  const query = useInfiniteQuery({
    ...adminReportsAgentRunsInfiniteOptions({
      query: {
        limit: 25,
        ...(filter.status === 'all' ? {} : { status: filter.status }),
        ...(filter.userId ? { userId: filter.userId } : {}),
      },
    }),
    initialPageParam: {},
    getNextPageParam: (last: { nextCursor: string | null }) =>
      last.nextCursor ?? undefined,
  });
  const runs = useMemo<AdminAgentRunDto[]>(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  return { ...query, runs };
}

/** `GET /admin/agent-runs/{id}` with every model call. */
export function useAgentRun(id: string) {
  const query = useQuery({
    ...adminReportsAgentRunOptions({ path: { id } }),
    retry: (count, error) =>
      count < 1 && !(isApiError(error) && error.code === 'AGENT_RUN_NOT_FOUND'),
  });
  return {
    ...query,
    notFound:
      isApiError(query.error) && query.error.code === 'AGENT_RUN_NOT_FOUND',
  };
}
