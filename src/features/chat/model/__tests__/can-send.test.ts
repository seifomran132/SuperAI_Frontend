import { describe, expect, it } from 'vitest';
import type {
  AttachmentDraft,
  AttachmentDraftState,
} from '../attachment-draft';
import { canSend, modeBlocksImage } from '../can-send';

const file = new File(['x'], 'a.png', { type: 'image/png' });
type Real = Exclude<AttachmentDraft, { status: 'empty' }>;
const drafts = {
  uploading: { status: 'uploading', file, previewUrl: 'blob:1', progress: 10 },
  ready: {
    status: 'ready',
    file,
    previewUrl: 'blob:1',
    uploadId: 'u1',
    attachment: { id: 'u1', mimeType: 'image/webp', width: 800, height: 600 },
  },
  error: { status: 'error', code: 'UPLOAD_FAILED', retryable: true },
} satisfies Record<string, Real>;

const state = (...list: Real[]): AttachmentDraftState => ({
  tiles: list.map((draft, i) => ({ key: `k${i}`, draft })),
  notice: null,
});
const none = state();

describe('canSend', () => {
  it('needs text when there is no image', () => {
    expect(canSend({ images: none, text: ' ', modeSupportsImages: true })).toBe(
      false,
    );
    expect(
      canSend({ images: none, text: 'hi', modeSupportsImages: false }),
    ).toBe(true);
  });

  it('is blocked while any tile uploads or has failed, even with text', () => {
    const ok = [drafts.ready, drafts.ready];
    for (const bad of [drafts.uploading, drafts.error]) {
      expect(
        canSend({
          images: state(...ok, bad),
          text: 'hi',
          modeSupportsImages: true,
        }),
      ).toBe(false);
      expect(
        canSend({
          images: state(bad, ...ok),
          text: 'hi',
          modeSupportsImages: true,
        }),
      ).toBe(false);
    }
  });

  it('allows an empty text when all tiles are ready', () => {
    for (const n of [1, 2, 3]) {
      expect(
        canSend({
          images: state(...Array<Real>(n).fill(drafts.ready)),
          text: '',
          modeSupportsImages: true,
        }),
      ).toBe(true);
    }
  });

  it('is blocked when the mode cannot read images', () => {
    const three = state(drafts.ready, drafts.ready, drafts.ready);
    expect(
      canSend({ images: three, text: 'hi', modeSupportsImages: false }),
    ).toBe(false);
    expect(modeBlocksImage(three, false)).toBe(true);
    expect(modeBlocksImage(state(drafts.ready, drafts.uploading), false)).toBe(
      true,
    );
    expect(modeBlocksImage(none, false)).toBe(false);
    expect(modeBlocksImage(state(drafts.error), false)).toBe(false);
    expect(modeBlocksImage(three, true)).toBe(false);
  });
});
