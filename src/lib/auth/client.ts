import { GoTrueClient } from '@supabase/auth-js';
import { env } from '~/lib/env';
import { webStorage } from '~/platform/storage';
import { emptyLinkParams, parseLinkParams } from '~/lib/auth/link-params';

// Captured before the client is created: with detectSessionInUrl, auth-js
// consumes (and may clear) the URL hash while it initializes, and the callback
// page still needs to know whether the email link failed.
export const initialLink =
  typeof window === 'undefined'
    ? emptyLinkParams
    : parseLinkParams(window.location.href);

// Sign-up, sign-in, refresh and password reset go directly to GoTrue.
// The API only verifies the access token (API_CONTRACT §2).
export const auth = new GoTrueClient({
  url: env.gotrueUrl,
  storageKey: 'bayan.auth',
  storage: webStorage,
  autoRefreshToken: typeof window !== 'undefined',
  persistSession: true,
  detectSessionInUrl: typeof window !== 'undefined',
});

export async function getAccessToken(): Promise<string | undefined> {
  const { data } = await auth.getSession();
  return data.session?.access_token;
}

/** Sign-up must send the full name as user metadata `full_name` (API_CONTRACT §2). */
export function signUp(input: {
  email: string;
  password: string;
  fullName: string;
}) {
  return auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { full_name: input.fullName },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}
