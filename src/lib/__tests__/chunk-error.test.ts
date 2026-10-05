import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  chunkReloadAlreadyTried,
  installChunkErrorReload,
  isChunkLoadError,
  reloadOnceForChunkError,
} from '../chunk-error';

describe('isChunkLoadError', () => {
  it.each([
    new TypeError('Failed to fetch dynamically imported module: /a.js'),
    new TypeError('Importing a module script failed.'),
    Object.assign(new Error('x'), { name: 'ChunkLoadError' }),
  ])('detects %s', (e) => expect(isChunkLoadError(e)).toBe(true));

  it.each([new Error('boom'), new TypeError('Failed to fetch'), null, 'str'])(
    'ignores %s',
    (e) => expect(isChunkLoadError(e)).toBe(false),
  );
});

describe('reloadOnceForChunkError', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('reloads the first time and not again within the window', () => {
    const reload = vi.fn();
    expect(reloadOnceForChunkError(reload, 1_000)).toBe(true);
    expect(reloadOnceForChunkError(reload, 5_000)).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(chunkReloadAlreadyTried(5_000)).toBe(true);
  });

  it('allows another reload after the window', () => {
    const reload = vi.fn();
    reloadOnceForChunkError(reload, 1_000);
    expect(reloadOnceForChunkError(reload, 1_000 + 61_000)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it('does not reload when storage throws (no loop guard possible)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const reload = vi.fn();
    expect(reloadOnceForChunkError(reload)).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it('treats unreadable storage as untried', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(chunkReloadAlreadyTried()).toBe(false);
  });
});

describe('installChunkErrorReload', () => {
  it('stamps the guard on a preload error', () => {
    sessionStorage.clear();
    installChunkErrorReload();
    // jsdom's location.reload is a no-op "not implemented" log; the stamp proves the path ran.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    window.dispatchEvent(new Event('vite:preloadError', { cancelable: true }));
    expect(chunkReloadAlreadyTried()).toBe(true);
  });
});
