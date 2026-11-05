import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  attachmentReducer,
  initialAttachmentState,
  liveCount,
  MAX_IMAGES,
  readyAttachments,
  useAttachmentDraft,
  type AttachmentDraftState,
} from '../attachment-draft';
import { ImageUploadError, type UploadImage } from '../image-input';

const png = (name = 'a.png') => new File(['x'], name, { type: 'image/png' });
const att = (id: string) => ({
  id,
  mimeType: 'image/webp',
  width: 800,
  height: 600,
});
const readyTile = (key: string, uploadId = key) => ({
  key,
  draft: {
    status: 'ready' as const,
    file: png(`${key}.png`),
    previewUrl: `blob:${key}`,
    uploadId,
    attachment: att(uploadId),
  },
});

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
        resolve: (uploadId) => resolve({ uploadId, attachment: att(uploadId) }),
        reject,
      });
    });
  return { upload, calls };
}

describe('attachment reducer', () => {
  it('moves validating -> uploading -> ready for one tile', () => {
    let s = attachmentReducer(initialAttachmentState, {
      type: 'add',
      key: 'k1',
      file: png(),
      previewUrl: 'blob:1',
    });
    expect(s.tiles[0]!.draft.status).toBe('validating');
    s = attachmentReducer(s, { type: 'upload-start', key: 'k1' });
    s = attachmentReducer(s, { type: 'progress', key: 'k1', percent: 140 });
    expect(s.tiles[0]!.draft).toMatchObject({
      status: 'uploading',
      progress: 100,
    });
    s = attachmentReducer(s, {
      type: 'uploaded',
      key: 'k1',
      uploadId: 'u1',
      attachment: att('u1'),
    });
    expect(s.tiles[0]!.draft).toMatchObject({
      status: 'ready',
      uploadId: 'u1',
    });
  });

  it('remove drops only that tile', () => {
    const s: AttachmentDraftState = {
      tiles: [readyTile('a'), readyTile('b')],
      notice: null,
    };
    const next = attachmentReducer(s, { type: 'remove', key: 'a' });
    expect(next.tiles.map((t) => t.key)).toEqual(['b']);
  });

  it('a fourth image is refused with the notice and the three stay', () => {
    const full: AttachmentDraftState = {
      tiles: [readyTile('a'), readyTile('b'), readyTile('c')],
      notice: null,
    };
    const s = attachmentReducer(full, {
      type: 'add',
      key: 'd',
      file: png('d.png'),
      previewUrl: 'blob:d',
    });
    expect(s.tiles).toHaveLength(MAX_IMAGES);
    expect(s.notice).toBe('TOO_MANY_ATTACHMENTS');
  });

  it('failed tiles do not count against the limit', () => {
    const s: AttachmentDraftState = {
      tiles: [
        readyTile('a'),
        readyTile('b'),
        {
          key: 'c',
          draft: { status: 'error', code: 'UPLOAD_FAILED', retryable: true },
        },
      ],
      notice: null,
    };
    expect(liveCount(s)).toBe(2);
  });

  it('remove clears the notice, clear empties everything', () => {
    const s: AttachmentDraftState = {
      tiles: [readyTile('a'), readyTile('b')],
      notice: 'TOO_MANY_ATTACHMENTS',
    };
    expect(
      attachmentReducer(s, { type: 'remove', key: 'a' }).notice,
    ).toBeNull();
    expect(attachmentReducer(s, { type: 'clear' })).toEqual(
      initialAttachmentState,
    );
  });
});

describe('readyAttachments', () => {
  it('lists ready tiles in order, skipping others and duplicate uploadIds', () => {
    const s: AttachmentDraftState = {
      tiles: [
        readyTile('a', 'u1'),
        {
          key: 'x',
          draft: {
            status: 'uploading',
            file: png('x.png'),
            previewUrl: 'blob:x',
            progress: 3,
          },
        },
        readyTile('b', 'u2'),
        readyTile('c', 'u1'),
      ],
      notice: null,
    };
    expect(readyAttachments(s).map((r) => r.uploadId)).toEqual(['u1', 'u2']);
  });
});

describe('useAttachmentDraft', () => {
  it('uploads, reports progress and becomes ready', async () => {
    const { upload, calls } = controllable();
    const { result } = renderHook(() => useAttachmentDraft(upload));
    act(() => result.current.addFiles([png()]));
    expect(result.current.state.tiles[0]!.draft).toMatchObject({
      status: 'uploading',
      progress: 0,
      previewUrl: 'blob:1',
    });
    act(() => calls[0]!.progress(40));
    expect(result.current.state.tiles[0]!.draft).toMatchObject({
      progress: 40,
    });
    await act(async () => calls[0]!.resolve('up-1'));
    expect(result.current.state.tiles[0]!.draft).toMatchObject({
      status: 'ready',
      uploadId: 'up-1',
      attachment: att('up-1'),
    });
  });

  it('three tiles each keep their own progress, result and error', async () => {
    const { upload, calls } = controllable();
    const { result } = renderHook(() => useAttachmentDraft(upload));
    act(() =>
      result.current.addFiles([png('a.png'), png('b.png'), png('c.png')]),
    );
    expect(calls).toHaveLength(3);
    act(() => calls[0]!.progress(10));
    act(() => calls[1]!.progress(50));
    act(() => calls[2]!.progress(90));
    expect(
      result.current.state.tiles.map((t) =>
        t.draft.status === 'uploading' ? t.draft.progress : -1,
      ),
    ).toEqual([10, 50, 90]);
    await act(async () => calls[1]!.resolve('u-b'));
    await act(async () => calls[2]!.reject(new Error('offline')));
    const drafts = result.current.state.tiles.map((t) => t.draft);
    expect(drafts[0]).toMatchObject({ status: 'uploading', progress: 10 });
    expect(drafts[1]).toMatchObject({ status: 'ready', uploadId: 'u-b' });
    expect(drafts[2]).toMatchObject({ status: 'error', code: 'UPLOAD_FAILED' });
    // Removing the middle one leaves the others, in order.
    act(() => result.current.remove(result.current.state.tiles[1]!.key));
    expect(result.current.state.tiles.map((t) => t.draft.status)).toEqual([
      'uploading',
      'error',
    ]);
    expect(calls[0]!.signal.aborted).toBe(false);
  });

  it('a picker with four files keeps the first three and shows the notice', () => {
    const { upload, calls } = controllable();
    const { result } = renderHook(() => useAttachmentDraft(upload));
    act(() =>
      result.current.addFiles([
        png('a.png'),
        png('b.png'),
        png('c.png'),
        png('d.png'),
      ]),
    );
    expect(
      result.current.state.tiles.map((t) =>
        'file' in t.draft ? t.draft.file?.name : undefined,
      ),
    ).toEqual(['a.png', 'b.png', 'c.png']);
    expect(result.current.state.notice).toBe('TOO_MANY_ATTACHMENTS');
    expect(calls).toHaveLength(3);
  });

  it('adding one more when three are attached gives the notice', () => {
    const { upload, calls } = controllable();
    const { result } = renderHook(() => useAttachmentDraft(upload));
    act(() =>
      result.current.addFiles([png('a.png'), png('b.png'), png('c.png')]),
    );
    act(() => result.current.addFiles([png('d.png')]));
    expect(result.current.state.tiles).toHaveLength(3);
    expect(result.current.state.notice).toBe('TOO_MANY_ATTACHMENTS');
    expect(calls).toHaveLength(3);
    act(() => result.current.dismissNotice());
    expect(result.current.state.notice).toBeNull();
  });

  it('removing one then adding works and the notice is gone', () => {
    const { upload, calls } = controllable();
    const { result } = renderHook(() => useAttachmentDraft(upload));
    act(() =>
      result.current.addFiles([
        png('a.png'),
        png('b.png'),
        png('c.png'),
        png('d.png'),
      ]),
    );
    expect(result.current.state.notice).not.toBeNull();
    act(() => result.current.remove(result.current.state.tiles[0]!.key));
    expect(result.current.state.notice).toBeNull();
    expect(revoke).toHaveBeenCalledWith('blob:1');
    expect(calls[0]!.signal.aborted).toBe(true);
    act(() => result.current.addFiles([png('d.png')]));
    expect(result.current.state.tiles).toHaveLength(3);
    expect(result.current.state.notice).toBeNull();
    expect(calls).toHaveLength(4);
  });

  it('the same file picked twice is attached once', () => {
    const { upload, calls } = controllable();
    const { result } = renderHook(() => useAttachmentDraft(upload));
    const f = png('a.png');
    act(() => result.current.addFiles([f]));
    act(() => result.current.addFiles([f]));
    expect(result.current.state.tiles).toHaveLength(1);
    expect(calls).toHaveLength(1);
    expect(result.current.state.notice).toBeNull();
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
    expect(result.current.state.tiles[0]!.draft).toMatchObject({
      status: 'error',
      code: 'ATTACHMENT_TYPE_NOT_ALLOWED',
      retryable: false,
    });
  });

  it('remove aborts the upload and revokes the preview', () => {
    const { upload, calls } = controllable();
    const { result } = renderHook(() => useAttachmentDraft(upload));
    act(() => result.current.addFiles([png()]));
    act(() => result.current.remove(result.current.state.tiles[0]!.key));
    expect(calls[0]!.signal.aborted).toBe(true);
    expect(revoke).toHaveBeenCalledWith('blob:1');
    expect(result.current.state.tiles).toHaveLength(0);
  });

  it('a late result after remove is ignored', async () => {
    const { upload, calls } = controllable();
    const { result } = renderHook(() => useAttachmentDraft(upload));
    act(() => result.current.addFiles([png()]));
    act(() => result.current.remove(result.current.state.tiles[0]!.key));
    await act(async () => calls[0]!.resolve('late'));
    expect(result.current.state.tiles).toHaveLength(0);
  });

  it('clear aborts every upload, revokes every preview and empties', () => {
    const { upload, calls } = controllable();
    const { result } = renderHook(() => useAttachmentDraft(upload));
    act(() => result.current.addFiles([png('a.png'), png('b.png')]));
    act(() => result.current.clear());
    expect(calls.every((c) => c.signal.aborted)).toBe(true);
    expect(revoke).toHaveBeenCalledWith('blob:1');
    expect(revoke).toHaveBeenCalledWith('blob:2');
    expect(result.current.state).toEqual(initialAttachmentState);
  });

  it('retries a failed tile with the same file, leaving the others', async () => {
    const { upload, calls } = controllable();
    const { result } = renderHook(() => useAttachmentDraft(upload));
    act(() => result.current.addFiles([png('a.png'), png('b.png')]));
    await act(async () => calls[1]!.reject(new Error('offline')));
    const failed = result.current.state.tiles[1]!;
    expect(failed.draft).toMatchObject({
      status: 'error',
      code: 'UPLOAD_FAILED',
      retryable: true,
    });
    act(() => result.current.retry(failed.key));
    expect(result.current.state.tiles[1]!.draft.status).toBe('uploading');
    expect(result.current.state.tiles[0]!.draft.status).toBe('uploading');
    expect(calls).toHaveLength(3);
    expect(revoke).not.toHaveBeenCalled();
  });

  it('a failed tile can be removed and revokes its preview', async () => {
    const { upload, calls } = controllable();
    const { result } = renderHook(() => useAttachmentDraft(upload));
    act(() => result.current.addFiles([png('a.png')]));
    await act(async () => calls[0]!.reject(new Error('x')));
    act(() => result.current.remove(result.current.state.tiles[0]!.key));
    expect(result.current.state.tiles).toHaveLength(0);
    expect(revoke).toHaveBeenCalledWith('blob:1');
  });

  it('keeps the code of an ImageUploadError and does not retry when not retryable', async () => {
    const { upload, calls } = controllable();
    const { result } = renderHook(() => useAttachmentDraft(upload));
    act(() => result.current.addFiles([png()]));
    await act(async () =>
      calls[0]!.reject(new ImageUploadError('ATTACHMENT_TOO_LARGE')),
    );
    const tile = result.current.state.tiles[0]!;
    expect(tile.draft).toMatchObject({
      code: 'ATTACHMENT_TOO_LARGE',
      retryable: false,
    });
    act(() => result.current.retry(tile.key));
    expect(calls).toHaveLength(1);
  });

  it('a failed tile frees its place for a new image', async () => {
    const { upload, calls } = controllable();
    const { result } = renderHook(() => useAttachmentDraft(upload));
    act(() =>
      result.current.addFiles([png('a.png'), png('b.png'), png('c.png')]),
    );
    await act(async () => calls[0]!.reject(new Error('x')));
    act(() => result.current.addFiles([png('d.png')]));
    expect(result.current.state.tiles).toHaveLength(4);
    expect(result.current.state.notice).toBeNull();
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
