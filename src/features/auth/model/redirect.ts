export const defaultAfterAuthPath = '/chat';

const BACKSLASH = String.fromCharCode(92);

function hasControlCharacter(value: string): boolean {
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code <= 0x1f || code === 0x7f) return true;
  }
  return false;
}

/**
 * `?redirect=` is attacker-controllable, so only same-origin paths pass:
 * a single leading slash (not `//host` or a backslash variant that browsers
 * treat as `//`), and no control characters.
 */
export function isInternalPath(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (!value.startsWith('/')) return false;
  if (value.startsWith('//') || value.startsWith(`/${BACKSLASH}`)) return false;
  return !hasControlCharacter(value);
}

export function safeRedirect(
  value: unknown,
  fallback: string = defaultAfterAuthPath,
): string {
  return isInternalPath(value) ? value : fallback;
}
