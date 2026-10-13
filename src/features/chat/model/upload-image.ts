import { isApiError } from '~/api/errors';
import type { UploadResponseDto } from '~/api/generated/types.gen';
import { auth, getAccessToken } from '~/lib/auth/client';
import { env } from '~/lib/env';
import { uploadFile, type UploadResponse } from '~/platform/upload';
import { ImageUploadError, type UploadImage } from './image-input';

// `POST /api/v1/uploads` (API_CONTRACT §8.1). The generated SDK has this call
// too, but it cannot report upload progress, so the upload goes through the
// platform adapter with the same session handling as the API client.

const isUploadResponse = (body: unknown): body is UploadResponseDto =>
  typeof body === 'object' &&
  body !== null &&
  typeof (body as UploadResponseDto).id === 'string';

function toUploadError(response: UploadResponse): ImageUploadError {
  const code = isApiError(response.body) ? response.body.code : null;
  switch (code) {
    case 'ATTACHMENT_TOO_LARGE':
    case 'ATTACHMENT_TYPE_NOT_ALLOWED':
      return new ImageUploadError(code, false);
    case 'RATE_LIMITED':
      return new ImageUploadError('RATE_LIMITED', true);
    default:
      // A proxy's own 413 has no API body; the server limit is the same 5 MB.
      if (response.status === 413) {
        return new ImageUploadError('ATTACHMENT_TOO_LARGE', false);
      }
      return new ImageUploadError('UPLOAD_FAILED', true);
  }
}

export const uploadImage: UploadImage = async (file, onProgress, signal) => {
  const send = async () =>
    uploadFile({
      url: `${env.apiOrigin}/api/v1/uploads`,
      field: 'file',
      file,
      token: await getAccessToken(),
      onProgress,
      signal,
    });

  let response = await send();
  if (response.status === 401) {
    // Expired between auto-refreshes: refresh once and repeat, as the API client does.
    const { data } = await auth.refreshSession();
    if (!data.session) {
      await auth.signOut({ scope: 'local' });
      throw new ImageUploadError('UPLOAD_FAILED', false);
    }
    response = await send();
  }
  if (response.status === 403) {
    const code = isApiError(response.body) ? response.body.code : null;
    if (code === 'ACCOUNT_SUSPENDED' || code === 'ACCOUNT_DELETED') {
      await auth.signOut({ scope: 'local' });
    }
  }
  if (response.status === 201 && isUploadResponse(response.body)) {
    const { id, mimeType, width, height } = response.body;
    return { uploadId: id, attachment: { id, mimeType, width, height } };
  }
  throw toUploadError(response);
};
