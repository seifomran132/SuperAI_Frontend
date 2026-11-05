import type { AttachmentDraftState } from './attachment-draft';

/** The selected mode can't read the images attached (or being uploaded). */
export const modeBlocksImage = (
  state: AttachmentDraftState,
  modeSupportsImages: boolean,
) =>
  !modeSupportsImages &&
  state.tiles.some(
    ({ draft }) => draft.status === 'uploading' || draft.status === 'ready',
  );

/**
 * Whether the message can go out, from the images' point of view plus the
 * text. Blocked while any image is still uploading or has failed (retry or
 * remove it first), and when the mode can't read images; the text may be
 * empty only when at least one image is ready.
 */
export function canSend({
  images,
  text,
  modeSupportsImages,
}: {
  images: AttachmentDraftState;
  text: string;
  modeSupportsImages: boolean;
}): boolean {
  const { tiles } = images;
  if (tiles.length === 0) return text.trim() !== '';
  if (tiles.some(({ draft }) => draft.status !== 'ready')) return false;
  return modeSupportsImages;
}
