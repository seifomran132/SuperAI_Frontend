import { useEffect, useState } from 'react';
import { auth } from '~/lib/auth/client';

/**
 * Whether a session exists. `null` until the browser has checked: the page is
 * prerendered, so the first render (and the static HTML) is the signed-out one
 * and the session is only read after mount.
 */
export function useSignedIn(): boolean | null {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    let cancelled = false;
    void auth.getSession().then(({ data }) => {
      if (!cancelled) setSignedIn(Boolean(data.session));
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return signedIn;
}
