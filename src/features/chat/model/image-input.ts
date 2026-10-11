import type { AttachmentDraftState } from './attachment-draft';

// Local types for image input. They mirror API_CONTRACT §8 so the wiring step can
// map the generated types onto them (the generated SDK has no attachments yet).

/** An image attached to a stored message (§8): `{ id, mimeType, width, height }`. */
export interface MessageAttachment {
  id: string;
  mimeType: string;
  width: number;
  height: number;
}

/** Codes the image flow can show. The first three are API error codes. */
export type ImageErrorCode =
  | 'ATTACHMENT_TOO_LARGE'
  | 'ATTACHMENT_TYPE_NOT_ALLOWED'
  | 'TOO_MANY_ATTACHMENTS'
  // Network or server failure while uploading (no API code; retryable).
  | 'UPLOAD_FAILED';

/** What the real upload returns once the server has the image. */
export interface UploadResult {
  uploadId: string;
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
