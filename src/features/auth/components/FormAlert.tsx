import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { NETWORK_ERROR_KEY } from '../model/gotrue-errors';

interface FormAlertProps {
  /** i18n key of the error; null renders nothing. */
  errorKey: string | null;
  /** Network errors offer a retry that re-runs the same submit. */
  onRetry?: () => void;
  tone?: 'danger' | 'warning';
  /** Replaces the retry action (e.g. resend confirmation). */
  action?: ReactNode;
}

/** Form-level error above the fields. Typed values stay in the form. */
export function FormAlert({ errorKey, onRetry, tone, action }: FormAlertProps) {
  const { t } = useTranslation();
  if (!errorKey) return null;
  const retry =
    errorKey === NETWORK_ERROR_KEY && onRetry ? (
      <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
        {t('common.retry')}
      </Button>
    ) : null;
  return (
    <Alert
      variant={
        tone ?? (errorKey === 'authErrors.rateLimited' ? 'warning' : 'danger')
      }
      action={action ?? retry}
    >
      {t(errorKey)}
    </Alert>
  );
}
