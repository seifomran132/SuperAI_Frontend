import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  ImageUploadError,
  type ImageErrorCode,
  type UploadImage,
} from './image-input';
import { validateImageFile } from './image-validation';

export type AttachmentDraft =
  | { status: 'empty' }
  | { status: 'validating'; file: File; previewUrl: string }
  | { status: 'uploading'; file: File; previewUrl: string; progress: number }
  | { status: 'ready'; file: File; previewUrl: string; uploadId: string }
  | {
      status: 'error';
      code: ImageErrorCode;
      retryable: boolean;
      /** Kept only when a retry can reuse it. */
      file?: File;
      previewUrl?: string;
    };

export interface AttachmentDraftState {
  draft: AttachmentDraft;
  /** A rejected extra image: the first one stays, the notice is shown. */
  notice: 'TOO_MANY_ATTACHMENTS' | null;
}

export type AttachmentAction =
  | { type: 'add'; file: File; previewUrl: string }
  | { type: 'too-many' }
  | { type: 'invalid'; code: ImageErrorCode }
  | { type: 'upload-start' }
  | { type: 'progress'; percent: number }
  | { type: 'uploaded'; uploadId: string }
  | { type: 'failed'; code: ImageErrorCode; retryable: boolean }
  | { type: 'remove' }
  | { type: 'dismiss-notice' };

export const initialAttachmentState: AttachmentDraftState = {
  draft: { status: 'empty' },
  notice: null,
};

/** An image occupies the slot unless it is gone or already failed. */
export const hasImage = (draft: AttachmentDraft) =>
  draft.status !== 'empty' && draft.status !== 'error';

export function attachmentReducer(
  state: AttachmentDraftState,
  action: AttachmentAction,
): AttachmentDraftState {
  const { draft } = state;
  switch (action.type) {
    case 'add':
      // Only one image: a failed tile is replaced, a live image stays.
      if (hasImage(draft)) return { ...state, notice: 'TOO_MANY_ATTACHMENTS' };
      return {
        draft: {
          status: 'validating',
          file: action.file,
          previewUrl: action.previewUrl,
        },
        notice: null,
      };
    case 'too-many':
      return { ...state, notice: 'TOO_MANY_ATTACHMENTS' };
    case 'invalid':
      return {
        draft: { status: 'error', code: action.code, retryable: false },
        notice: null,
      };
    case 'upload-start':
      if (draft.status !== 'validating' && draft.status !== 'error') {
        return state;
      }
      if (!draft.file || !draft.previewUrl) return state;
      return {
        ...state,
        draft: {
          status: 'uploading',
          file: draft.file,
          previewUrl: draft.previewUrl,
          progress: 0,
        },
      };
    case 'progress':
      if (draft.status !== 'uploading') return state;
      return {
        ...state,
        draft: {
          ...draft,
          progress: Math.max(0, Math.min(100, Math.round(action.percent))),
        },
      };
    case 'uploaded':
      if (draft.status !== 'uploading') return state;
      return {
        ...state,
        draft: {
          status: 'ready',
          file: draft.file,
          previewUrl: draft.previewUrl,
          uploadId: action.uploadId,
        },
      };
    case 'failed':
      if (draft.status !== 'uploading') return state;
      return {
        ...state,
        draft: {
          status: 'error',
          code: action.code,
          retryable: action.retryable,
          file: draft.file,
          previewUrl: draft.previewUrl,
        },
      };
    case 'remove':
      return initialAttachmentState;
    case 'dismiss-notice':
      return { ...state, notice: null };
  }
}

const previewOf = (draft: AttachmentDraft) =>
  draft.status === 'empty' ? undefined : draft.previewUrl;

/**
 * The composer's single image: validate, upload through the injected function,
 * remove (aborts the upload) and retry. Owns the preview object URL.
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
  const controller = useRef<AbortController | null>(null);

  const startUpload = useCallback((file: File) => {
    controller.current?.abort();
    const ctrl = new AbortController();
    controller.current = ctrl;
    dispatch({ type: 'upload-start' });
    uploadRef
      .current(
        file,
        (percent) => {
          if (!ctrl.signal.aborted) dispatch({ type: 'progress', percent });
        },
        ctrl.signal,
      )
      .then(
        (result) => {
          if (!ctrl.signal.aborted) {
            dispatch({ type: 'uploaded', uploadId: result.uploadId });
          }
        },
        (error: unknown) => {
          if (ctrl.signal.aborted) return;
          dispatch(
            error instanceof ImageUploadError
              ? {
                  type: 'failed',
                  code: error.code,
                  retryable: error.retryable,
                }
              : { type: 'failed', code: 'UPLOAD_FAILED', retryable: true },
          );
        },
      );
  }, []);

  const addFiles = useCallback(
    (files: readonly File[]) => {
      const [file] = files;
      if (!file) return;
      const current = stateRef.current.draft;
      if (hasImage(current)) {
        dispatch({ type: 'too-many' });
        return;
      }
      const code = validateImageFile(file);
      // A replaced failed tile gives up its preview.
      const old = previewOf(current);
      if (old) URL.revokeObjectURL(old);
      if (code) {
        dispatch({ type: 'invalid', code });
        return;
      }
      dispatch({
        type: 'add',
        file,
        previewUrl: URL.createObjectURL(file),
      });
      startUpload(file);
      if (files.length > 1) dispatch({ type: 'too-many' });
    },
    [startUpload],
  );

  const remove = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
    const url = previewOf(stateRef.current.draft);
    if (url) URL.revokeObjectURL(url);
    dispatch({ type: 'remove' });
  }, []);

  const retry = useCallback(() => {
    const draft = stateRef.current.draft;
    if (draft.status === 'error' && draft.retryable && draft.file) {
      startUpload(draft.file);
    }
  }, [startUpload]);

  const dismissNotice = useCallback(
    () => dispatch({ type: 'dismiss-notice' }),
    [],
  );

  useEffect(
    () => () => {
      controller.current?.abort();
      const url = previewOf(stateRef.current.draft);
      if (url) URL.revokeObjectURL(url);
    },
    [],
  );

  return { state, addFiles, remove, retry, dismissNotice };
}
