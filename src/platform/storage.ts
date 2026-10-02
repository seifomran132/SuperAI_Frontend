// Session storage behind an interface so the mobile build (Capacitor) can swap in
// @capacitor/preferences without touching auth code. See FRONTEND_PLAN.md §7b.
export interface KeyValueStorage {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

const memory = new Map<string, string>();

// localStorage can be missing or throw (private mode, prerender); fall back to memory.
export const webStorage: KeyValueStorage = {
  getItem(key) {
    try {
      return globalThis.localStorage?.getItem(key) ?? memory.get(key) ?? null;
    } catch {
      return memory.get(key) ?? null;
    }
  },
  setItem(key, value) {
    memory.set(key, value);
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // keep the in-memory copy
    }
  },
  removeItem(key) {
    memory.delete(key);
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      // nothing to remove
    }
  },
};
