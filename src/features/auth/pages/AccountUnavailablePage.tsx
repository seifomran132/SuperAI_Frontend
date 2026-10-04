import { Link } from '@tanstack/react-router';
import { Pause, UserX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ContactChannels } from '~/components/ContactChannels';
import { Button } from '~/components/ui/button';
import { AuthLayout } from '../components/AuthLayout';
import type { UnavailableReason } from '../model/me';

export function AccountUnavailablePage({
  reason,
}: {
  reason: UnavailableReason;
}) {
  const { t } = useTranslation();
  const suspended = reason === 'suspended';
  const Icon = suspended ? Pause : UserX;
  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-3 text-center">
        {/* Suspended is a warning; deleted is final, so it stays neutral. */}
        <span
          aria-hidden="true"
          className={
            suspended
              ? 'bg-warning-container text-warning mb-3 flex size-14 items-center justify-center rounded-full'
              : 'bg-surface-muted text-fg-muted mb-3 flex size-14 items-center justify-center rounded-full'
          }
        >
          <Icon className="size-6" />
        </span>
        <h1 className="text-fg text-2xl leading-9 font-bold">
          {t(
            suspended
              ? 'auth.accountUnavailable.suspendedTitle'
              : 'auth.accountUnavailable.deletedTitle',
          )}
        </h1>
        <p className="text-fg-muted mb-3 text-base leading-7">
          {t(
            suspended
              ? 'auth.accountUnavailable.suspendedBody'
              : 'auth.accountUnavailable.deletedBody',
          )}
        </p>
        <ContactChannels />
        <Button asChild className="mt-3 w-full">
          <Link to="/sign-in">{t('auth.accountUnavailable.back')}</Link>
        </Button>
      </div>
    </AuthLayout>
  );
}
