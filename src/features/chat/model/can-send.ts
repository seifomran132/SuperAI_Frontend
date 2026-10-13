import type { AttachmentDraft } from './attachment-draft';

/** The selected mode can't read the image that is attached (or being uploaded). */
export const modeBlocksImage = (
  draft: AttachmentDraft,
  modeSupportsImages: boolean,
) =>
  (draft.status === 'uploading' || draft.status === 'ready') &&
  !modeSupportsImages;

/**
 * Whether the message can go out, from the image's point of view plus the text.
 * Blocked while uploading or failed, and when the mode can't read the image;
 * the text may be empty only when an image is ready.
 */
export function canSend({
  draft,
  text,
  modeSupportsImages,
}: {
  draft: AttachmentDraft;
  text: string;
  modeSupportsImages: boolean;
}): boolean {
  switch (draft.status) {
    case 'validating':
    case 'uploading':
    case 'error':
      return false;
    case 'ready':
      return modeSupportsImages;
    case 'empty':
      return text.trim() !== '';
  }
}
