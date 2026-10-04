import { Link } from '@tanstack/react-router';
import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { AuthLayout } from './AuthLayout';

/**
 * Shown when an email link failed or was used. `reset` sends the user to ask
 * for a new reset link; `signup` to sign in, where "email not confirmed"
 * offers a new confirmation link.
 */
export function LinkExpired({ kind }: { kind: 'signup' | 'reset' }) {
  const { t } = useTranslation();
  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-3 text-center">
        <span
          aria-hidden="true"
          className="bg-warning-container text-warning mb-3 flex size-14 items-center justify-center rounded-full"
        >
          <Clock className="size-7" />
        </span>
        <h1 className="text-fg text-2xl leading-9 font-bold">
          {t('auth.linkExpired.title')}
        </h1>
        <p className="text-fg-muted text-base leading-7">
          {t('authErrors.otpExpired')}
        </p>
        {kind === 'signup' ? (
          <p className="text-fg-muted text-base leading-7">
            {t('auth.linkExpired.signupHint')}
          </p>
        ) : null}
        <Button asChild className="mt-3 w-full">
          <Link to={kind === 'reset' ? '/forgot-password' : '/sign-in'}>
            {t('auth.linkExpired.newLink')}
          </Link>
        </Button>
      </div>
    </AuthLayout>
  );
}
