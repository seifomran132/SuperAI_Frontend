import { describe, expect, it } from 'vitest';
import type { AttachmentDraft } from '../attachment-draft';
import { canSend, modeBlocksImage } from '../can-send';

const file = new File(['x'], 'a.png', { type: 'image/png' });
const drafts = {
  empty: { status: 'empty' },
  uploading: { status: 'uploading', file, previewUrl: 'blob:1', progress: 10 },
  ready: { status: 'ready', file, previewUrl: 'blob:1', uploadId: 'u1' },
  error: { status: 'error', code: 'UPLOAD_FAILED', retryable: true },
} satisfies Record<string, AttachmentDraft>;

describe('canSend', () => {
  it('needs text when there is no image', () => {
    expect(
      canSend({ draft: drafts.empty, text: ' ', modeSupportsImages: true }),
    ).toBe(false);
    expect(
      canSend({ draft: drafts.empty, text: 'hi', modeSupportsImages: false }),
    ).toBe(true);
  });

  it('is blocked while uploading and on an upload error, even with text', () => {
    expect(
      canSend({
        draft: drafts.uploading,
        text: 'hi',
        modeSupportsImages: true,
      }),
    ).toBe(false);
    expect(
      canSend({ draft: drafts.error, text: 'hi', modeSupportsImages: true }),
    ).toBe(false);
  });

  it('allows an empty text when the image is ready', () => {
    expect(
      canSend({ draft: drafts.ready, text: '', modeSupportsImages: true }),
    ).toBe(true);
  });

  it('is blocked when the mode cannot read images', () => {
    expect(
      canSend({ draft: drafts.ready, text: 'hi', modeSupportsImages: false }),
    ).toBe(false);
    expect(modeBlocksImage(drafts.ready, false)).toBe(true);
    expect(modeBlocksImage(drafts.uploading, false)).toBe(true);
    expect(modeBlocksImage(drafts.empty, false)).toBe(false);
    expect(modeBlocksImage(drafts.ready, true)).toBe(false);
  });
});
