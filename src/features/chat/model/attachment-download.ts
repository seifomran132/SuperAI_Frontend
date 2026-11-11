import { attachmentsDownload } from '~/api/generated/sdk.gen';
import { brand } from '~/brand';
import { filenameFromDisposition, saveBlob } from '~/lib/download';

// Saving a created image (API_CONTRACT §9.4), with the same authenticated call
// as `attachmentOptions`.

export { filenameFromDisposition };

/**
 * Downloads `GET /attachments/{id}?download=1` and saves it under the
 * server's filename (fallback `lam7a-<id>.webp`). Throws when the request
 * fails (the UI shows a toast).
 */
export async function downloadAttachment(id: string): Promise<void> {
  const { data, response } = await attachmentsDownload({
    path: { id },
    query: { download: '1' },
    parseAs: 'blob',
    throwOnError: true,
  });
  // Cross-origin, the header is readable only if the API exposes it (CORS
  // exposedHeaders); otherwise the fallback follows the server's pattern with
  // this build's brand (white-label: never a hard-coded brand name).
  const filename =
    filenameFromDisposition(response.headers.get('content-disposition')) ??
    `${brand.key}-${id}.webp`;
  saveBlob(data, filename);
}
