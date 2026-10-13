// File upload with progress. `fetch` cannot report upload progress, so the web
// build uses XMLHttpRequest; a native build (Capacitor) can swap in its own
// implementation behind the same function. See FRONTEND_PLAN.md §7b.

export interface UploadRequest {
  url: string;
  /** Multipart field name. */
  field: string;
  file: File;
  token: string | undefined;
  onProgress: (percent: number) => void;
  signal: AbortSignal;
}

export interface UploadResponse {
  status: number;
  /** Parsed JSON body, or null when the body is not JSON (e.g. a proxy error page). */
  body: unknown;
}

/** Rejects with the signal's AbortError when stopped, and a TypeError on network failure. */
export function uploadFile(request: UploadRequest): Promise<UploadResponse> {
  const { url, field, file, token, onProgress, signal } = request;
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('The upload was stopped.', 'AbortError'));
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable)
        onProgress((event.loaded / event.total) * 100);
    };
    xhr.onload = () => {
      let body: unknown = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // Not JSON: the caller treats it as a failed upload.
      }
      resolve({ status: xhr.status, body });
    };
    xhr.onerror = () => reject(new TypeError('Network error during upload'));
    const onAbort = () => {
      xhr.abort();
      reject(new DOMException('The upload was stopped.', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
    xhr.onloadend = () => signal.removeEventListener('abort', onAbort);

    const form = new FormData();
    form.append(field, file);
    xhr.send(form);
  });
}
