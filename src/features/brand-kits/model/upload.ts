import { isApiError } from '~/api/errors';
import type { UploadBrandAssetResultDto } from '~/api/generated/types.gen';
import { auth, getAccessToken } from '~/lib/auth/client';
import { env } from '~/lib/env';
import { uploadFile, type UploadResponse } from '~/platform/upload';
import type { AssetKind } from './rules';

// `POST /me/brand-kits/{id}/assets?kind=` (API_CONTRACT §10). Through the
// platform adapter, as chat images are, because the generated SDK cannot
// report upload progress. Same session handling as the API client.

export type BrandUploadErrorCode =
  | 'BRAND_ASSET_TOO_LARGE'
  | 'BRAND_ASSET_TYPE_NOT_ALLOWED'
  | 'BRAND_ASSET_LIMIT_REACHED'
  | 'BRAND_KIT_NOT_FOUND'
  | 'RATE_LIMITED'
  | 'UPLOAD_FAILED';

export class BrandUploadError extends Error {
  constructor(
    readonly code: BrandUploadErrorCode,
    readonly retryable: boolean,
  ) {
    super(code);
  }
}

const isResult = (body: unknown): body is UploadBrandAssetResultDto =>
  typeof body === 'object' &&
  body !== null &&
  typeof (body as UploadBrandAssetResultDto).asset?.id === 'string';

function toError(response: UploadResponse): BrandUploadError {
  const code = isApiError(response.body) ? response.body.code : null;
  switch (code) {
    case 'BRAND_ASSET_TOO_LARGE':
    case 'BRAND_ASSET_TYPE_NOT_ALLOWED':
    case 'BRAND_ASSET_LIMIT_REACHED':
    case 'BRAND_KIT_NOT_FOUND':
      return new BrandUploadError(code, false);
    case 'RATE_LIMITED':
      return new BrandUploadError('RATE_LIMITED', true);
    default:
      // A proxy's own 413 has no API body.
      if (response.status === 413) {
        return new BrandUploadError('BRAND_ASSET_TOO_LARGE', false);
      }
      return new BrandUploadError('UPLOAD_FAILED', true);
  }
}

export type UploadBrandAsset = (
  kitId: string,
  kind: AssetKind,
  file: File,
  onProgress: (percent: number) => void,
  signal: AbortSignal,
) => Promise<UploadBrandAssetResultDto>;

export const uploadBrandAsset: UploadBrandAsset = async (
  kitId,
  kind,
  file,
  onProgress,
  signal,
) => {
  const send = async () =>
    uploadFile({
      url: `${env.apiOrigin}/api/v1/me/brand-kits/${encodeURIComponent(kitId)}/assets?kind=${kind}`,
      field: 'file',
      file,
      token: await getAccessToken(),
      onProgress,
      signal,
    });

  let response: UploadResponse;
  try {
    response = await send();
    if (response.status === 401) {
      // Expired between auto-refreshes: refresh once and repeat, as the API client does.
      const { data } = await auth.refreshSession();
      if (!data.session) {
        await auth.signOut({ scope: 'local' });
        throw new BrandUploadError('UPLOAD_FAILED', false);
      }
      response = await send();
    }
  } catch (error) {
    if (error instanceof BrandUploadError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw new BrandUploadError('UPLOAD_FAILED', true);
  }
  if (response.status === 403) {
    const code = isApiError(response.body) ? response.body.code : null;
    if (code === 'ACCOUNT_SUSPENDED' || code === 'ACCOUNT_DELETED') {
      await auth.signOut({ scope: 'local' });
    }
  }
  if (response.status === 201 && isResult(response.body)) return response.body;
  throw toError(response);
};
