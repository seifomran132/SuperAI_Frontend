import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { defaultAfterAuthPath } from '~/features/auth';
import { auth } from '~/lib/auth/client';

/**
 * Signed-in visitors go to the app. Runs after mount: the page is prerendered,
 * so the session cannot be read while rendering.
 */
export function useHomeRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    let cancelled = false;
    void auth.getSession().then(({ data }) => {
      if (!cancelled && data.session) {
        void navigate({ to: defaultAfterAuthPath, replace: true });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);
}
