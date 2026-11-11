import { useCallback, useEffect, useRef, useState } from 'react';
import type { UploadBrandAssetResultDto } from '~/api/generated/types.gen';
import { checkAssetFile, type AssetKind } from './rules';
import {
  BrandUploadError,
  uploadBrandAsset,
  type BrandUploadErrorCode,
  type UploadBrandAsset,
} from './upload';

/** A file on its way to the kit, or one that failed (kept until dismissed or retried). */
export interface PendingUpload {
  id: string;
  kind: AssetKind;
  file: File;
  progress: number;
  status: 'uploading' | 'failed';
  code: BrandUploadErrorCode | null;
  retryable: boolean;
}

let nextId = 0;

/**
 * Uploads for one kit, any kind, several at a time. Files that fail the first
 * check never leave the browser. Finished uploads leave the list and are
 * passed to `onUploaded`. Shared by the kit page and the chat's upload step.
 */
export function useAssetUploads({
  kitId,
  onUploaded,
  upload = uploadBrandAsset,
}: {
  kitId: string;
  onUploaded: (result: UploadBrandAssetResultDto, kind: AssetKind) => void;
  upload?: UploadBrandAsset;
}) {
  const [items, setItems] = useState<PendingUpload[]>([]);
  const controllers = useRef(new Map<string, AbortController>());
  const done = useRef(onUploaded);
  done.current = onUploaded;

  useEffect(() => {
    const running = controllers.current;
    return () => {
      for (const controller of running.values()) controller.abort();
      running.clear();
    };
  }, [kitId]);

  const patch = (id: string, change: Partial<PendingUpload>) =>
    setItems((list) =>
      list.map((item) => (item.id === id ? { ...item, ...change } : item)),
    );

  const start = useCallback(
    (item: PendingUpload) => {
      const controller = new AbortController();
      controllers.current.set(item.id, controller);
      upload(
        kitId,
        item.kind,
        item.file,
        (progress) => patch(item.id, { progress }),
        controller.signal,
      )
        .then((result) => {
          setItems((list) => list.filter((i) => i.id !== item.id));
          done.current(result, item.kind);
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          const known = error instanceof BrandUploadError;
          patch(item.id, {
            status: 'failed',
            code: known ? error.code : 'UPLOAD_FAILED',
            retryable: known ? error.retryable : true,
          });
        })
        .finally(() => controllers.current.delete(item.id));
    },
    [kitId, upload],
  );

  /** `room`: how many more files the kit can take (40 minus stored and uploading). */
  const add = useCallback(
    (kind: AssetKind, files: File[], room: number) => {
      let left = room;
      const added: PendingUpload[] = files.map((file) => {
        const check = checkAssetFile(file, kind);
        const full = check === null && left <= 0;
        if (check === null && !full) left -= 1;
        return {
          id: `upload-${++nextId}`,
          kind,
          file,
          progress: 0,
          status: check || full ? 'failed' : 'uploading',
          code: check ?? (full ? 'BRAND_ASSET_LIMIT_REACHED' : null),
          retryable: false,
        };
      });
      setItems((list) => [...list, ...added]);
      for (const item of added) if (item.status === 'uploading') start(item);
    },
    [start],
  );

  const retry = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item || item.status !== 'failed' || !item.retryable) return;
      const again = { ...item, status: 'uploading' as const, progress: 0 };
      patch(id, { status: 'uploading', progress: 0, code: null });
      start(again);
    },
    [items, start],
  );

  const dismiss = useCallback((id: string) => {
    controllers.current.get(id)?.abort();
    setItems((list) => list.filter((i) => i.id !== id));
  }, []);

  const uploading = items.filter((i) => i.status === 'uploading').length;
  return { items, uploading, add, retry, dismiss };
}
