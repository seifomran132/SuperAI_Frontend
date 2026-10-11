import type { ImageErrorCode } from './image-input';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';

const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);

/**
 * First-line check before uploading; the backend re-checks from the bytes.
 * Returns the API error code so the message comes from the same catalog.
 */
export function validateImageFile(
  file: Pick<File, 'type' | 'name' | 'size'>,
): Extract<
  ImageErrorCode,
  'ATTACHMENT_TOO_LARGE' | 'ATTACHMENT_TYPE_NOT_ALLOWED'
> | null {
  const ext = file.name.includes('.')
    ? file.name.split('.').pop()!.toLowerCase()
    : '';
  if (!TYPES.has(file.type.toLowerCase()) || !EXTENSIONS.has(ext)) {
    return 'ATTACHMENT_TYPE_NOT_ALLOWED';
  }
  if (file.size > MAX_IMAGE_BYTES) return 'ATTACHMENT_TOO_LARGE';
  return null;
}
