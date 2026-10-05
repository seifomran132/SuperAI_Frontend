import { useState } from 'react';
import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { requestPasswordReset, resendSignupEmail } from '../model/actions';
import { AuthLayout } from '../components/AuthLayout';
import { BackToSignIn } from '../components/BackToSignIn';
import { getPendingEmail } from '../model/pending-email';
import { useCooldown } from '../model/useCooldown';

export const RESEND_COOLDOWN_SECONDS = 60;

export type CheckEmailReason = 'signup' | 'reset';

export function CheckEmailPage({ reason }: { reason: CheckEmailReason }) {
  const { t } = useTranslation();
  // Read once: the address lives in memory only, so after a reload it is gone
  // and the page shows the generic copy without a resend button.
  const [email] = useState(getPendingEmail);
  const cooldown = useCooldown(RESEND_COOLDOWN_SECONDS, email !== null);
  const [resending, setResending] = useState(false);
  const [sentAgain, setSentAgain] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  async function resend() {
    if (!email) return;
    setResending(true);
    setErrorKey(null);
    setSentAgain(false);
    const result =
      reason === 'reset'
        ? await requestPasswordReset(email)
        : await resendSignupEmail(email);
    setResending(false);
    if (result.errorKey) {
      setErrorKey(result.errorKey);
      return;
    }
    setSentAgain(true);
    cooldown.start();
  }

  const sentTo = t(
    reason === 'reset'
      ? 'auth.checkEmail.resetSentTo'
      : 'auth.checkEmail.signupSentTo',
  );
  const sentGeneric = t(
    reason === 'reset'
      ? 'auth.checkEmail.resetSent'
      : 'auth.checkEmail.signupSent',
  );

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-3 text-center">
        <span
          aria-hidden="true"
          className="bg-surface-muted text-brand mb-3 flex size-14 items-center justify-center rounded-full"
        >
          <Mail className="size-7" />
        </span>
        <h1 className="text-fg text-2xl leading-9 font-bold">
          {t('auth.checkEmail.title')}
        </h1>
        <div className="text-fg-muted text-base leading-7">
          {email ? (
            <>
              <p>{sentTo}</p>
              <p className="text-fg font-semibold">
                <bdi dir="ltr" className="break-all">
                  {email}
                </bdi>
              </p>
            </>
          ) : (
            <p>{sentGeneric}</p>
          )}
        </div>
        <p className="text-fg-muted text-base leading-7">
          {t(
            reason === 'reset'
              ? 'auth.checkEmail.resetNext'
              : 'auth.checkEmail.signupNext',
          )}
        </p>

        <div className="mt-3 grid w-full gap-3" aria-live="polite">
          {errorKey ? <Alert variant="danger">{t(errorKey)}</Alert> : null}
          {sentAgain && !errorKey ? (
            <Alert variant="success">{t('auth.checkEmail.resent')}</Alert>
          ) : null}
        </div>

        {email ? (
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            loading={resending}
            disabled={cooldown.active}
            onClick={() => void resend()}
          >
            {cooldown.active ? (
              <span className="tabular-nums">
                {t('auth.checkEmail.resendIn', { seconds: cooldown.remaining })}
              </span>
            ) : (
              t('auth.checkEmail.resend')
            )}
          </Button>
        ) : null}
      </div>
      <BackToSignIn />
    </AuthLayout>
  );
}
