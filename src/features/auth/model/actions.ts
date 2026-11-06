import { auth, signUp } from '~/lib/auth/client';
import { authErrorKey } from './gotrue-errors';

/** Result of a GoTrue call: `errorKey` is an i18n key, or null on success. */
export interface AuthResult {
  errorKey: string | null;
}

const ok: AuthResult = { errorKey: null };

async function run(
  call: () => Promise<{ error: unknown }>,
): Promise<AuthResult> {
  try {
    const { error } = await call();
    return error ? { errorKey: authErrorKey(error) } : ok;
  } catch (error) {
    return { errorKey: authErrorKey(error) };
  }
}

const callbackUrl = () => `${window.location.origin}/auth/callback`;
const resetUrl = () => `${window.location.origin}/reset-password`;

export const signInWithPassword = (email: string, password: string) =>
  run(() => auth.signInWithPassword({ email, password }));

export const EMAIL_EXISTS_KEY = 'authErrors.emailExists';

export async function signUpWithEmail(input: {
  email: string;
  password: string;
  fullName: string;
}): Promise<AuthResult> {
  try {
    const { data, error } = await signUp(input);
    if (error) return { errorKey: authErrorKey(error) };
    // With email confirmation on, GoTrue answers an address that is already
    // registered with a stand-in user that has no identities instead of an
    // error. We tell the user (product decision 2026-11-06, AU-07).
    if (data.user?.identities?.length === 0)
      return { errorKey: EMAIL_EXISTS_KEY };
    return ok;
  } catch (error) {
    return { errorKey: authErrorKey(error) };
  }
}

export const resendSignupEmail = (email: string) =>
  run(() =>
    auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: callbackUrl() },
    }),
  );

export const requestPasswordReset = (email: string) =>
  run(() => auth.resetPasswordForEmail(email, { redirectTo: resetUrl() }));

export const updatePassword = (password: string) =>
  run(() => auth.updateUser({ password }));

export const signOut = () => run(() => auth.signOut());
