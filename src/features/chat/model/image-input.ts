import type { AttachmentDto } from '~/api/generated/types.gen';
import type { AttachmentDraftState } from './attachment-draft';

// Types for image input (API_CONTRACT §8).

/** An image attached to a stored message (§8): `{ id, mimeType, width, height }`. */
export type MessageAttachment = AttachmentDto;

/** Codes the image flow can show. The first three are API error codes. */
export type ImageErrorCode =
  | 'ATTACHMENT_TOO_LARGE'
  | 'ATTACHMENT_TYPE_NOT_ALLOWED'
  | 'TOO_MANY_ATTACHMENTS'
  // Uploads share the chat rate limit (§8.1); retryable once it passes.
  | 'RATE_LIMITED'
  // Network or server failure while uploading (no API code; retryable).
  | 'UPLOAD_FAILED';

/** What the real upload returns once the server has the image. */
export interface UploadResult {
  uploadId: string;
  /** The processed image as stored (§8.1), shown in the message before it reloads. */
  attachment: MessageAttachment;
}

/**
 * Seam for the real upload call. Report progress as a percentage (0-100) and
 * reject on `signal` abort. Reject with `ImageUploadError` to choose the code
 * and whether retry makes sense; any other rejection is a retryable
 * `UPLOAD_FAILED`.
 */
export type UploadImage = (
  file: File,
  onProgress: (percent: number) => void,
  signal: AbortSignal,
) => Promise<UploadResult>;

export class ImageUploadError extends Error {
  constructor(
    readonly code: ImageErrorCode,
    readonly retryable = false,
  ) {
    super(code);
  }
}

/** Result of the loader for a stored image (the future `useAttachmentImage`). */
export interface AttachmentImageResult {
  /** Object URL of the fetched image. */
  url: string | undefined;
  isPending: boolean;
  isError: boolean;
  refetch: () => void;
}

/** Hook that loads one stored image; passed down so the API wiring stays outside. */
export type UseAttachmentImage = (id: string) => AttachmentImageResult;

/**
 * What the composer needs for image input. The wiring step builds it from
 * `useAttachmentDraft(upload)` plus the modes' `supportsImages` flags.
 */
export interface ComposerImageInput {
  draft: AttachmentDraftState;
  addFiles: (files: readonly File[]) => void;
  remove: () => void;
  retry: () => void;
  dismissNotice: () => void;
  /** `supportsImages` of a mode from `GET /modes`. */
  modeSupportsImages: (modeKey: string) => boolean;
}
