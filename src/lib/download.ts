// Saving files the API serves with a bearer token: a plain link cannot carry
// it, so the file is fetched as a blob and saved through a temporary object URL.

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

/** Saves a blob under `filename`. */
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
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
