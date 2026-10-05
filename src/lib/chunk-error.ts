// A deploy replaces hashed chunk files; a tab opened before it then fails to
// load lazy routes. One automatic reload usually fixes it; the sessionStorage
// stamp stops a reload loop when it does not.
const FLAG = 'bayan:chunk-reload-at';
const WINDOW_MS = 60_000;

const CHUNK_PATTERNS = [
  /failed to fetch dynamically imported module/i,
  /importing a module script failed/i,
  /error loading dynamically imported module/i,
  /loading (css )?chunk [\w-]+ failed/i,
];

export function isChunkLoadError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const { name, message } = error as { name?: unknown; message?: unknown };
  if (name === 'ChunkLoadError') return true;
  return (
    typeof message === 'string' && CHUNK_PATTERNS.some((p) => p.test(message))
  );
}

function readStamp(): number | null {
  try {
    const raw = globalThis.sessionStorage?.getItem(FLAG);
    const n = raw === null || raw === undefined ? NaN : Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** True when a chunk-triggered reload already happened in the last minute. */
export function chunkReloadAlreadyTried(now = Date.now()): boolean {
  const at = readStamp();
  return at !== null && now - at < WINDOW_MS;
}

/**
 * Reloads once for a stale chunk. Returns false (and does nothing) when it
 * already tried recently or storage is unavailable, so callers show the
 * "new version" screen instead.
 */
export function reloadOnceForChunkError(
  reload: () => void = () => globalThis.location.reload(),
  now = Date.now(),
): boolean {
  if (chunkReloadAlreadyTried(now)) return false;
  try {
    globalThis.sessionStorage.setItem(FLAG, String(now));
  } catch {
    // Without the guard a reload could loop, so do not reload.
    return false;
  }
  reload();
  return true;
}

/** Vite fires this when a preload of a dynamic import fails. Client only. */
export function installChunkErrorReload(): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadOnceForChunkError()) event.preventDefault();
  });
}
