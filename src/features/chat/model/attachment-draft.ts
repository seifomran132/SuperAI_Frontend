import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  ImageUploadError,
  type ImageErrorCode,
  type MessageAttachment,
  type UploadImage,
} from './image-input';
import { validateImageFile } from './image-validation';

/** Images per message (API_CONTRACT §8.2); a fourth is TOO_MANY_ATTACHMENTS. */
export const MAX_IMAGES = 3;

export type AttachmentDraft =
  | { status: 'empty' }
  | { status: 'validating'; file: File; previewUrl: string }
  | { status: 'uploading'; file: File; previewUrl: string; progress: number }
  | {
      status: 'ready';
      file: File;
      previewUrl: string;
      uploadId: string;
      attachment: MessageAttachment;
    }
  | {
      status: 'error';
      code: ImageErrorCode;
      retryable: boolean;
      /** Kept only when a retry can reuse it. */
      file?: File;
      previewUrl?: string;
    };

/** One image of the message, in the order the user added it. */
export interface DraftTile {
  key: string;
  draft: Exclude<AttachmentDraft, { status: 'empty' }>;
}

export interface AttachmentDraftState {
  tiles: DraftTile[];
  /** Images over the limit were refused; the ones already attached stay. */
  notice: 'TOO_MANY_ATTACHMENTS' | null;
}

export type AttachmentAction =
  | { type: 'add'; key: string; file: File; previewUrl: string }
  | { type: 'too-many' }
  | { type: 'invalid'; key: string; code: ImageErrorCode }
  | { type: 'upload-start'; key: string }
  | { type: 'progress'; key: string; percent: number }
  | {
      type: 'uploaded';
      key: string;
      uploadId: string;
      attachment: MessageAttachment;
    }
  | { type: 'failed'; key: string; code: ImageErrorCode; retryable: boolean }
  | { type: 'remove'; key: string }
  | { type: 'clear' }
  | { type: 'dismiss-notice' };

export const initialAttachmentState: AttachmentDraftState = {
  tiles: [],
  notice: null,
};

/** A tile counts against the limit unless it failed (it can be removed or retried). */
export const hasImage = (draft: AttachmentDraft) =>
  draft.status !== 'empty' && draft.status !== 'error';

/** Images still taking a place: everything except failed tiles. */
export const liveCount = (state: AttachmentDraftState) =>
  state.tiles.filter((tile) => hasImage(tile.draft)).length;

/** The uploads to send, in order, each once. */
export function readyAttachments(state: AttachmentDraftState) {
  const seen = new Set<string>();
  const out: { uploadId: string; file: File; attachment: MessageAttachment }[] =
    [];
  for (const { draft } of state.tiles) {
    if (draft.status !== 'ready' || seen.has(draft.uploadId)) continue;
    seen.add(draft.uploadId);
    out.push({
      uploadId: draft.uploadId,
      file: draft.file,
      attachment: draft.attachment,
    });
  }
  return out;
}

function update(
  state: AttachmentDraftState,
  key: string,
  next: (draft: DraftTile['draft']) => DraftTile['draft'] | null,
): AttachmentDraftState {
  let changed = false;
  const tiles = state.tiles.map((tile) => {
    if (tile.key !== key) return tile;
    const draft = next(tile.draft);
    if (!draft || draft === tile.draft) return tile;
    changed = true;
    return { key, draft };
  });
  return changed ? { ...state, tiles } : state;
}

export function attachmentReducer(
  state: AttachmentDraftState,
  action: AttachmentAction,
): AttachmentDraftState {
  switch (action.type) {
    case 'add':
      if (liveCount(state) >= MAX_IMAGES) {
        return { ...state, notice: 'TOO_MANY_ATTACHMENTS' };
      }
      return {
        tiles: [
          ...state.tiles,
          {
            key: action.key,
            draft: {
              status: 'validating',
              file: action.file,
              previewUrl: action.previewUrl,
            },
          },
        ],
        notice: null,
      };
    case 'too-many':
      return { ...state, notice: 'TOO_MANY_ATTACHMENTS' };
    case 'invalid':
      return {
        tiles: [
          ...state.tiles,
          {
            key: action.key,
            draft: { status: 'error', code: action.code, retryable: false },
          },
        ],
        notice: null,
      };
    case 'upload-start':
      return update(state, action.key, (draft) => {
        if (draft.status !== 'validating' && draft.status !== 'error') {
          return null;
        }
        if (!draft.file || !draft.previewUrl) return null;
        return {
          status: 'uploading',
          file: draft.file,
          previewUrl: draft.previewUrl,
          progress: 0,
        };
      });
    case 'progress':
      return update(state, action.key, (draft) =>
        draft.status === 'uploading'
          ? {
              ...draft,
              progress: Math.max(0, Math.min(100, Math.round(action.percent))),
            }
          : null,
      );
    case 'uploaded':
      return update(state, action.key, (draft) =>
        draft.status === 'uploading'
          ? {
              status: 'ready',
              file: draft.file,
              previewUrl: draft.previewUrl,
              uploadId: action.uploadId,
              attachment: action.attachment,
            }
          : null,
      );
    case 'failed':
      return update(state, action.key, (draft) =>
        draft.status === 'uploading'
          ? {
              status: 'error',
              code: action.code,
              retryable: action.retryable,
              file: draft.file,
              previewUrl: draft.previewUrl,
            }
          : null,
      );
    case 'remove': {
      const tiles = state.tiles.filter((tile) => tile.key !== action.key);
      return tiles.length === state.tiles.length
        ? state
        : // Room again for another image: the notice no longer applies.
          { tiles, notice: null };
    }
    case 'clear':
      return initialAttachmentState;
    case 'dismiss-notice':
      return { ...state, notice: null };
  }
}

const previewOf = (draft: AttachmentDraft) =>
  draft.status === 'empty' ? undefined : draft.previewUrl;

/** Same file picked again (picker, paste or drop): name, size and date match. */
const sameFile = (a: File, b: File) =>
  a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

/**
 * The composer's images (up to MAX_IMAGES): validate, upload each through the
 * injected function, remove one (aborts its upload), retry one, clear all.
 * Owns the preview object URLs.
 */
export function useAttachmentDraft(upload: UploadImage) {
  const [state, dispatch] = useReducer(
    attachmentReducer,
    initialAttachmentState,
  );
  const uploadRef = useRef(upload);
  uploadRef.current = upload;
  const stateRef = useRef(state);
  stateRef.current = state;
  const controllers = useRef(new Map<string, AbortController>());
  const nextKey = useRef(0);

  const startUpload = useCallback((key: string, file: File) => {
    controllers.current.get(key)?.abort();
    const ctrl = new AbortController();
    controllers.current.set(key, ctrl);
    dispatch({ type: 'upload-start', key });
    uploadRef
      .current(
        file,
        (percent) => {
          if (!ctrl.signal.aborted) {
            dispatch({ type: 'progress', key, percent });
          }
        },
        ctrl.signal,
      )
      .then(
        (result) => {
          if (ctrl.signal.aborted) return;
          controllers.current.delete(key);
          dispatch({
            type: 'uploaded',
            key,
            uploadId: result.uploadId,
            attachment: result.attachment,
          });
        },
        (error: unknown) => {
          if (ctrl.signal.aborted) return;
          controllers.current.delete(key);
          dispatch(
            error instanceof ImageUploadError
              ? {
                  type: 'failed',
                  key,
                  code: error.code,
                  retryable: error.retryable,
                }
              : {
                  type: 'failed',
                  key,
                  code: 'UPLOAD_FAILED',
                  retryable: true,
                },
          );
        },
      );
  }, []);

  const addFiles = useCallback(
    (files: readonly File[]) => {
      const tiles = stateRef.current.tiles;
      // A file already attached (and not failed) is not added again.
      const fresh = files.filter(
        (file) =>
          !tiles.some(
            ({ draft }) =>
              hasImage(draft) && 'file' in draft && sameFile(draft.file, file),
          ),
      );
      let room = MAX_IMAGES - liveCount(stateRef.current);
      let refused = false;
      for (const file of fresh) {
        if (room <= 0) {
          refused = true;
          break;
        }
        const key = `img-${nextKey.current++}`;
        const code = validateImageFile(file);
        if (code) {
          dispatch({ type: 'invalid', key, code });
          continue;
        }
        dispatch({
          type: 'add',
          key,
          file,
          previewUrl: URL.createObjectURL(file),
        });
        room -= 1;
        startUpload(key, file);
      }
      if (refused) dispatch({ type: 'too-many' });
    },
    [startUpload],
  );

  const remove = useCallback((key: string) => {
    controllers.current.get(key)?.abort();
    controllers.current.delete(key);
    const tile = stateRef.current.tiles.find((t) => t.key === key);
    const url = tile && previewOf(tile.draft);
    if (url) URL.revokeObjectURL(url);
    dispatch({ type: 'remove', key });
  }, []);

  /** After the server accepted the message: every image went with it. */
  const clear = useCallback(() => {
    for (const ctrl of controllers.current.values()) ctrl.abort();
    controllers.current.clear();
    for (const { draft } of stateRef.current.tiles) {
      const url = previewOf(draft);
      if (url) URL.revokeObjectURL(url);
    }
    dispatch({ type: 'clear' });
  }, []);

  const retry = useCallback(
    (key: string) => {
      const tile = stateRef.current.tiles.find((t) => t.key === key);
      const draft = tile?.draft;
      if (draft?.status === 'error' && draft.retryable && draft.file) {
        startUpload(key, draft.file);
      }
    },
    [startUpload],
  );

  const dismissNotice = useCallback(
    () => dispatch({ type: 'dismiss-notice' }),
    [],
  );

  useEffect(
    () => () => {
      for (const ctrl of controllers.current.values()) ctrl.abort();
      for (const { draft } of stateRef.current.tiles) {
        const url = previewOf(draft);
        if (url) URL.revokeObjectURL(url);
      }
    },
    [],
  );

  return { state, addFiles, remove, clear, retry, dismissNotice };
}
