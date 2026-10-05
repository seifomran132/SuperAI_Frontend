// Public API of the auth feature. Code outside src/features/auth imports from
// here only; pages, components and model files are internal. Screens and form
// parts (zod, react-hook-form) are in ./ui so route guards don't load them.

export { redirectIfSignedIn, requireProfile } from './model/guards';
export { hasName, type UnavailableReason } from './model/me';
export { isInternalPath, safeRedirect } from './model/redirect';
export { installSessionSync } from './model/session';
export { signOut } from './model/actions';
export { updatePassword } from './model/actions';
export { ensureMe } from './model/me';
