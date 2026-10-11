import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  attachmentReducer,
  initialAttachmentState,
  useAttachmentDraft,
} from '../attachment-draft';
import { ImageUploadError, type UploadImage } from '../image-input';

const png = (name = 'a.png') => new File(['x'], name, { type: 'image/png' });

let counter = 0;
const revoke = vi.fn();
beforeEach(() => {
  counter = 0;
  revoke.mockClear();
  URL.createObjectURL = vi.fn(() => `blob:${++counter}`);
  URL.revokeObjectURL = revoke;
});
afterEach(() => vi.restoreAllMocks());

interface Pending {
  progress: (n: number) => void;
  resolve: (id: string) => void;
  reject: (e: unknown) => void;
  signal: AbortSignal;
}

function controllable() {
  const calls: Pending[] = [];
  const upload: UploadImage = (_file, progress, signal) =>
    new Promise((resolve, reject) => {
      calls.push({
        progress,
        signal,
        resolve: (uploadId) => resolve({ uploadId }),
        reject,
      });
    });
  return { upload, calls };
}

describe('attachment reducer', () => {
  it('moves empty -> validating -> uploading -> ready', () => {
    const f = png();
    let s = attachmentReducer(initialAttachmentState, {
      type: 'add',
      file: f,
      previewUrl: 'blob:1',
    });
    expect(s.draft.status).toBe('validating');
    s = attachmentReducer(s, { type: 'upload-start' });
    s = attachmentReducer(s, { type: 'progress', percent: 140 });
    expect(s.draft).toMatchObject({ status: 'uploading', progress: 100 });
    s = attachmentReducer(s, { type: 'uploaded', uploadId: 'u1' });
    expect(s.draft).toMatchObject({ status: 'ready', uploadId: 'u1' });
  });

  it('a second image keeps the first and sets the notice', () => {
    const s = attachmentReducer(
      {
        draft: {
          status: 'ready',
          file: png(),
          previewUrl: 'blob:1',
          uploadId: 'u',
        },
        notice: null,
      },
      { type: 'add', file: png('b.png'), previewUrl: 'blob:2' },
    );
    expect(s.draft.status).toBe('ready');
    expect(s.notice).toBe('TOO_MANY_ATTACHMENTS');
  });
});

describe('useAttachmentDraft', () => {
  it('uploads, reports progress and becomes ready', async () => {
    const { upload, calls } = controllable();
    const { result } = renderHook(() => useAttachmentDraft(upload));
    act(() => result.current.addFiles([png()]));
    expect(result.current.state.draft).toMatchObject({
      status: 'uploading',
      progress: 0,
      previewUrl: 'blob:1',
    });
    act(() => calls[0]!.progress(40));
    expect(result.current.state.draft).toMatchObject({ progress: 40 });
    await act(async () => calls[0]!.resolve('up-1'));
    expect(result.current.state.draft).toMatchObject({
      status: 'ready',
      uploadId: 'up-1',
    });
  });

  it('invalid files never reach the upload', () => {
    const upload = vi.fn();
    const { result } = renderHook(() => useAttachmentDraft(upload));
    act(() =>
      result.current.addFiles([
        new File(['x'], 'a.gif', { type: 'image/gif' }),
      ]),
    );
    expect(upload).not.toHaveBeenCalled();
    expect(result.current.state.draft).toMatchObject({
      status: 'error',
      code: 'ATTACHMENT_TYPE_NOT_ALLOWED',
      retryable: false,
    });
  });

  it('remove aborts the upload and revokes the preview', () => {
    const { upload, calls } = controllable();
    const { result } = renderHook(() => useAttachmentDraft(upload));
    act(() => result.current.addFiles([png()]));
    act(() => result.current.remove());
    expect(calls[0]!.signal.aborted).toBe(true);
    expect(revoke).toHaveBeenCalledWith('blob:1');
    expect(result.current.state.draft.status).toBe('empty');
  });

  it('a late result after remove is ignored', async () => {
    const { upload, calls } = controllable();
    const { result } = renderHook(() => useAttachmentDraft(upload));
    act(() => result.current.addFiles([png()]));
    act(() => result.current.remove());
    await act(async () => calls[0]!.resolve('late'));
    expect(result.current.state.draft.status).toBe('empty');
  });

  it('a second image gives TOO_MANY_ATTACHMENTS and the first stays', () => {
    const { upload, calls } = controllable();
    const { result } = renderHook(() => useAttachmentDraft(upload));
    act(() => result.current.addFiles([png()]));
    act(() => result.current.addFiles([png('b.png')]));
    expect(result.current.state.notice).toBe('TOO_MANY_ATTACHMENTS');
    expect(result.current.state.draft).toMatchObject({ previewUrl: 'blob:1' });
    expect(calls).toHaveLength(1);
    act(() => result.current.dismissNotice());
    expect(result.current.state.notice).toBeNull();
  });

  it('retries a network failure with the same file', async () => {
    const { upload, calls } = controllable();
    const { result } = renderHook(() => useAttachmentDraft(upload));
    act(() => result.current.addFiles([png()]));
    await act(async () => calls[0]!.reject(new Error('offline')));
    expect(result.current.state.draft).toMatchObject({
      status: 'error',
      code: 'UPLOAD_FAILED',
      retryable: true,
    });
    act(() => result.current.retry());
    expect(result.current.state.draft.status).toBe('uploading');
    expect(calls).toHaveLength(2);
    expect(revoke).not.toHaveBeenCalled();
  });

  it('keeps the code of an ImageUploadError and does not retry when not retryable', async () => {
    const { upload, calls } = controllable();
    const { result } = renderHook(() => useAttachmentDraft(upload));
    act(() => result.current.addFiles([png()]));
    await act(async () =>
      calls[0]!.reject(new ImageUploadError('ATTACHMENT_TOO_LARGE')),
    );
    expect(result.current.state.draft).toMatchObject({
      code: 'ATTACHMENT_TOO_LARGE',
      retryable: false,
    });
    act(() => result.current.retry());
    expect(calls).toHaveLength(1);
  });

  it('replaces a failed tile with a new image and revokes the old preview', async () => {
    const { upload, calls } = controllable();
    const { result } = renderHook(() => useAttachmentDraft(upload));
    act(() => result.current.addFiles([png()]));
    await act(async () => calls[0]!.reject(new Error('x')));
    act(() => result.current.addFiles([png('b.png')]));
    expect(revoke).toHaveBeenCalledWith('blob:1');
    expect(result.current.state.draft).toMatchObject({ previewUrl: 'blob:2' });
  });

  it('aborts and revokes on unmount', () => {
    const { upload, calls } = controllable();
    const { result, unmount } = renderHook(() => useAttachmentDraft(upload));
    act(() => result.current.addFiles([png()]));
    unmount();
    expect(calls[0]!.signal.aborted).toBe(true);
    expect(revoke).toHaveBeenCalledWith('blob:1');
  });
});
