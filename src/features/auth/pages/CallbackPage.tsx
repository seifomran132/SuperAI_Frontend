import { useEffect, useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { hasLinkError, parseLinkParams } from '~/lib/auth/link-params';
import { auth, initialLink } from '~/lib/auth/client';
import { AuthLayout } from '../components/AuthLayout';
import { LinkExpired } from '../components/LinkExpired';
import { defaultAfterAuthPath } from '../model/redirect';

/**
 * Landing page of the confirmation email. auth-js reads the tokens from the
 * URL on startup; we wait for it, then continue to the app (the `_authed`
 * guard decides between /chat and /complete-profile).
 */
export function CallbackPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function finish() {
      const failed =
        hasLinkError(initialLink) ||
        hasLinkError(parseLinkParams(window.location.href));
      if (failed) {
        setExpired(true);
        return;
      }
      await auth.initialize();
      const { data } = await auth.getSession();
      if (cancelled) return;
      if (data.session) router.history.replace(defaultAfterAuthPath);
      else setExpired(true);
    }
    void finish();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (expired) return <LinkExpired kind="signup" />;
  return (
    <AuthLayout>
      <p
        role="status"
        className="text-fg-muted flex items-center justify-center gap-3 py-6 text-base"
      >
        <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
        {t('auth.callback.checking')}
      </p>
    </AuthLayout>
  );
}
