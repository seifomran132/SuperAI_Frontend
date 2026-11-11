import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { isApiError } from '~/api/errors';
import {
  meBrandKitsDownloadQueryKey,
  meBrandKitsGetOptions,
  meBrandKitsGetQueryKey,
  meBrandKitsListInfiniteOptions,
} from '~/api/generated/@tanstack/react-query.gen';
import { meBrandKitsDownload } from '~/api/generated/sdk.gen';
import type { BrandKitDetailDto } from '~/api/generated/types.gen';

export const KITS_PAGE_SIZE = 20;
const listParams = { query: { limit: KITS_PAGE_SIZE } };

/** `GET /me/brand-kits`, newest first, paged with `cursor`; `limit` is the plan's. */
export function useBrandKits() {
  const query = useInfiniteQuery({
    ...meBrandKitsListInfiniteOptions(listParams),
    initialPageParam: {},
    getNextPageParam: (last: { nextCursor: string | null }) =>
      last.nextCursor ?? undefined,
  });
  const kits = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  const limit = query.data?.pages[0]?.limit ?? null;
  return { ...query, kits, limit };
}

export const kitKey = (id: string) => meBrandKitsGetQueryKey({ path: { id } });

const isKitNotFound = (error: unknown) =>
  isApiError(error) && error.code === 'BRAND_KIT_NOT_FOUND';

/** `GET /me/brand-kits/{id}` with its assets. */
export function useBrandKit(id: string) {
  const query = useQuery({
    ...meBrandKitsGetOptions({ path: { id } }),
    retry: (count, error) => count < 1 && !isKitNotFound(error),
  });
  return { ...query, notFound: isKitNotFound(query.error) };
}

/** After any change: the kit page and every list page read fresh data. */
export function refreshKits(qc: QueryClient, kit?: BrandKitDetailDto) {
  if (kit) qc.setQueryData(kitKey(kit.id), kit);
  void qc.invalidateQueries({
    predicate: (q) => {
      const first = q.queryKey[0] as { _id?: string } | undefined;
      return first?._id === 'meBrandKitsList';
    },
  });
}

export type AssetVariant = 'original' | 'preview';

/**
 * A kit file as an object URL. The download needs the bearer token, so it is
 * fetched as a blob, kept in memory only (the Query cache, cleared on sign-out)
 * and never in a shared cache. Files never change, so they are not refetched.
 */
export function useBrandAssetImage(
  kitId: string,
  assetId: string | null,
  variant: AssetVariant = 'preview',
) {
  const params = {
    path: { id: kitId, assetId: assetId ?? '' },
    query: { variant },
  };
  const query = useQuery({
    queryKey: meBrandKitsDownloadQueryKey(params),
    queryFn: async ({ signal }) =>
      (
        await meBrandKitsDownload({
          ...params,
          parseAs: 'blob',
          signal,
          throwOnError: true,
        })
      ).data as Blob,
    enabled: Boolean(assetId),
    staleTime: Infinity,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
  const blob = query.data;
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!blob) return;
    const next = URL.createObjectURL(blob);
    setUrl(next);
    return () => {
      URL.revokeObjectURL(next);
      setUrl(undefined);
    };
  }, [blob]);
  return {
    url,
    isPending: query.isPending || (blob !== undefined && url === undefined),
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

export { useQueryClient };
