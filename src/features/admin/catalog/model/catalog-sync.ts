import { useEffect, useMemo, useState } from 'react';
import {
  useInfiniteQuery,
  useQuery,
  type QueryClient,
} from '@tanstack/react-query';
import {
  adminCatalogSyncListInfiniteOptions,
  adminCatalogSyncStatusOptions,
} from '~/api/generated/@tanstack/react-query.gen';
import type {
  CatalogFindingPageDto,
  CatalogSyncStatusDto,
  LastSyncRunDto,
} from '~/api/generated/types.gen';
import type { FindingKind, FindingStatus } from './search';

export const FINDINGS_PAGE_SIZE = 20;
/** While a run is going. */
export const RUNNING_POLL_MS = 3_000;
/** Otherwise: also covers a scheduled run that starts while the page is open. */
export const IDLE_POLL_MS = 10 * 60_000;
/** Two missed 6-hour runs. */
export const STALE_AFTER_MS = 12 * 60 * 60_000;

/** Page → the `cursor` of the next one (the generated options have no mapping). */
export const getNextFindingsPage = (page: CatalogFindingPageDto) =>
  page.nextCursor ?? undefined;

/**
 * The sync status: badge count, header and run state. One cache entry shared by
 * the sidebar and the page; polls fast while a run is going.
 */
export function useSyncStatus() {
  return useQuery({
    ...adminCatalogSyncStatusOptions(),
    refetchInterval: (query) =>
      query.state.data?.running ? RUNNING_POLL_MS : IDLE_POLL_MS,
    refetchOnWindowFocus: true,
  });
}

/** Findings of one status (and kind), newest first, older pages by cursor. */
export function useFindings(status: FindingStatus, kind?: FindingKind) {
  const query = {
    status,
    limit: FINDINGS_PAGE_SIZE,
    ...(kind ? { kind } : {}),
  };
  const result = useInfiniteQuery({
    ...adminCatalogSyncListInfiniteOptions({ query }),
    initialPageParam: {},
    getNextPageParam: getNextFindingsPage,
  });
  const items = useMemo(
    () => result.data?.pages.flatMap((page) => page.items) ?? [],
    [result.data],
  );
  return { ...result, items };
}

/** The sync never ran, or its last run ended more than 12 hours ago. */
export function isSyncStale(
  status: Pick<CatalogSyncStatusDto, 'lastRun'>,
  now = Date.now(),
): boolean {
  if (!status.lastRun) return true;
  return now - new Date(status.lastRun.finishedAt).getTime() > STALE_AFTER_MS;
}

/**
 * After a finding is closed or a run ends: the findings, the badge (status)
 * and the model pages that show prices are stale.
 */
export function invalidateFindings(queryClient: QueryClient) {
  const stale =
    /^(adminCatalogSync(List|Status)|adminModels(Get|Prices|List))$/;
  return queryClient.invalidateQueries({
    predicate: (query) => {
      const first = query.queryKey[0] as { _id?: string } | undefined;
      return stale.test(first?._id ?? '');
    },
  });
}

/**
 * Follows a sync run to its end. A run is followed once it was started here
 * (`watch`) or seen in the status; when the status says nothing runs and the
 * last run is that run, its result is kept for the summary card.
 */
export function useRunResult(
  status: CatalogSyncStatusDto | undefined,
  queryClient: QueryClient,
) {
  const [watched, setWatched] = useState<string | null>(null);
  const [result, setResult] = useState<LastSyncRunDto | null>(null);
  const runningId = status?.running?.runId ?? null;

  useEffect(() => {
    if (runningId) setWatched(runningId);
  }, [runningId]);

  useEffect(() => {
    if (!status || status.running || !watched) return;
    if (status.lastRun?.runId !== watched) return;
    setWatched(null);
    setResult(status.lastRun);
    void invalidateFindings(queryClient);
  }, [status, watched, queryClient]);

  return { result, watch: setWatched, close: () => setResult(null) };
}
