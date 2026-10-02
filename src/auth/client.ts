import { GoTrueClient } from '@supabase/auth-js';
import { env } from '~/lib/env';
import { webStorage } from '~/platform/storage';

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
export function signUp(input: { email: string; password: string; fullName: string }) {
  return auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { full_name: input.fullName } },
  });
}
