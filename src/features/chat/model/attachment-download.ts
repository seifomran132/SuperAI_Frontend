import { attachmentsDownload } from '~/api/generated/sdk.gen';
import { brand } from '~/brand';

// Saving a created image (API_CONTRACT §9.4). A plain link cannot carry the
// bearer token, so the file is fetched as a blob through the API client (the
// same authenticated call as `attachmentOptions`) and saved through a
// temporary object URL.

/** `filename` from a Content-Disposition header (RFC 6266, incl. `filename*`), or null. */
export function filenameFromDisposition(header: string | null): string | null {
  if (!header) return null;
  const extended = /filename\*\s*=\s*([^']*)'[^']*'([^;]+)/i.exec(header);
  if (extended?.[2]) {
    try {
      return sanitize(decodeURIComponent(extended[2].trim()));
    } catch {
      // Malformed percent-encoding: fall back to the plain parameter.
    }
  }
  const plain = /filename\s*=\s*(?:"((?:[^"\\]|\\.)*)"|([^;]+))/i.exec(header);
  const value = plain?.[1]?.replace(/\\(.)/g, '$1') ?? plain?.[2]?.trim();
  return value ? sanitize(value) : null;
}

/** Keeps only the last path segment; a header must not pick a directory. */
function sanitize(name: string): string | null {
  const base = name.split(/[\\/]/).pop()?.trim();
  return base ? base : null;
}

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

  const url = URL.createObjectURL(data);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.append(link);
    link.click();
    link.remove();
  } finally {
    // The click starts the download synchronously; revoking on the next task
    // keeps older browsers from cancelling it.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}
