import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  attachmentsDownloadQueryKey,
  meDesignsListInfiniteOptions,
} from '~/api/generated/@tanstack/react-query.gen';
import { attachmentsDownload, meDesignsExport } from '~/api/generated/sdk.gen';
import type { DesignDto } from '~/api/generated/types.gen';
import { brand } from '~/brand';
import { filenameFromDisposition, saveBlob } from '~/lib/download';

export const DESIGNS_PAGE_SIZE = 24;

/** `GET /me/designs`, newest first, optionally one brand's (API_CONTRACT §11.4). */
export function useDesigns(brandKitId: string | null) {
  const query = useInfiniteQuery({
    ...meDesignsListInfiniteOptions({
      query: {
        limit: DESIGNS_PAGE_SIZE,
        ...(brandKitId ? { brandKitId } : {}),
      },
    }),
    initialPageParam: {},
    getNextPageParam: (last: { nextCursor: string | null }) =>
      last.nextCursor ?? undefined,
  });
  const designs = useMemo<DesignDto[]>(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  return { ...query, designs };
}

/**
 * A delivered design as an object URL. Designs are private: fetched with the
 * bearer token under the same key the chat uses for created images, kept in
 * memory only (cleared on sign-out) and never refetched.
 */
export function useDesignImage(attachmentId: string) {
  const query = useQuery({
    queryKey: attachmentsDownloadQueryKey({ path: { id: attachmentId } }),
    queryFn: async ({ signal }) =>
      (
        await attachmentsDownload({
          path: { id: attachmentId },
          parseAs: 'blob',
          signal,
          throwOnError: true,
        })
      ).data as Blob,
    staleTime: Infinity,
    gcTime: 10 * 60 * 1000,
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

export type ExportFormat = 'png' | 'jpg' | 'webp';
export type ExportSize = 'original' | 'standard';
export type AspectRatio = DesignDto['aspectRatio'];

/** The social media size of each shape (§11.4); the shape never changes. */
export const STANDARD_SIZE: Record<AspectRatio, string> = {
  '1:1': '1080×1080',
  '3:4': '1080×1440',
  '4:3': '1440×1080',
  '9:16': '1080×1920',
  '16:9': '1920×1080',
};

/** The shape of a design from its pixels, for results that don't carry it. */
export function aspectOf(width: number, height: number): AspectRatio {
  const ratio = width / height;
  const shapes: [AspectRatio, number][] = [
    ['1:1', 1],
    ['3:4', 3 / 4],
    ['4:3', 4 / 3],
    ['9:16', 9 / 16],
    ['16:9', 16 / 9],
  ];
  return shapes.reduce((best, shape) =>
    Math.abs(shape[1] - ratio) < Math.abs(best[1] - ratio) ? shape : best,
  )[0];
}

/**
 * `GET /me/designs/{id}/export`: converted on the server (no charge), saved
 * under the server's filename. Throws on failure (the UI shows a toast).
 */
export async function downloadDesign(
  id: string,
  format: ExportFormat,
  size: ExportSize,
) {
  const { data, response } = await meDesignsExport({
    path: { id },
    query: { format, size },
    parseAs: 'blob',
    throwOnError: true,
  });
  const filename =
    filenameFromDisposition(response.headers.get('content-disposition')) ??
    `${brand.key}-design-${id}.${format}`;
  saveBlob(data as Blob, filename);
}
