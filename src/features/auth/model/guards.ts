import type { QueryClient } from '@tanstack/react-query';
import { redirect } from '@tanstack/react-router';
import { auth } from '~/lib/auth/client';
import { ensureMe, hasName } from './me';
import { defaultAfterAuthPath, isInternalPath } from './redirect';

// SPA mode renders the shell without a browser; guards need the session store.
const inBrowser = () => typeof window !== 'undefined';

/** `_guest`: signed-in users have no business on sign-in/up pages. */
export async function redirectIfSignedIn() {
  if (!inBrowser()) return;
  const { data } = await auth.getSession();
  if (data.session) throw redirect({ to: defaultAfterAuthPath });
}

/** `_authed`: session required, then a profile with a name (unless on that page). */
export async function requireProfile(
  queryClient: QueryClient,
  location: { href: string; pathname: string },
) {
  if (!inBrowser()) return { me: null };
  const { data } = await auth.getSession();
  if (!data.session) {
    throw redirect({
      to: '/sign-in',
      search: { redirect: location.href },
    });
  }
  const me = await ensureMe(queryClient, location.href);
  if (!hasName(me) && location.pathname !== '/complete-profile') {
    // Keep where the user was going; /complete-profile continues there.
    const keep =
      isInternalPath(location.href) && location.href !== defaultAfterAuthPath;
    throw redirect({
      to: '/complete-profile',
      search: keep ? { redirect: location.href } : {},
    });
  }
  return { me };
}
