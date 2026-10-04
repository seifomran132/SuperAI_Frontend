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

export const signUpWithEmail = (input: {
  email: string;
  password: string;
  fullName: string;
}) => run(() => signUp(input));

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
