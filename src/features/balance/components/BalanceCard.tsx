import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Money } from '~/components/Money';
import { RequestBalanceDialog } from '~/components/RequestBalanceDialog';
import { RetryAlert } from '~/components/RetryAlert';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { useBalance } from '~/features/chat';
import { formatDate } from '~/lib/dates';
import { useSubscription } from '../model/queries';

function PlanLine({ onContact }: { onContact: () => void }) {
  const { t, i18n } = useTranslation();
  const { data } = useSubscription();
  if (!data) return null;
  if (!data.subscription) {
    return (
      <Alert
        variant="warning"
        action={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onContact}
          >
            {t('balance.contactUs')}
          </Button>
        }
      >
        {t('balance.noPlan')}
      </Alert>
    );
  }
  const name = i18n.language === 'en' ? data.plan.nameEn : data.plan.nameAr;
  const end = data.subscription.currentPeriodEnd;
  return (
    <div className="text-fg-muted grid gap-1 text-base">
      <p>{t('balance.plan', { name })}</p>
      {end ? (
        <p className="text-sm">
          {t('balance.expiry', { date: formatDate(end, i18n.language) })}
        </p>
      ) : null}
    </div>
  );
}

/** Spendable balance, the plan line and «طلب رصيد». Shares the header chip's cache. */
export function BalanceCard() {
  const { t } = useTranslation();
  const { balanceUsd, isPending, isError, refetch } = useBalance();
  const [dialog, setDialog] = useState(false);

  if (isError && balanceUsd === undefined) {
    return (
      <RetryAlert onRetry={() => void refetch()}>
        {t('balance.balanceError')}
      </RetryAlert>
    );
  }
  return (
    <section
      aria-busy={isPending}
      aria-labelledby="balance-label"
      className="bg-surface border-border-subtle grid gap-5 rounded-lg border p-5 sm:p-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1">
          <h2 id="balance-label" className="text-fg-muted text-base">
            {t('balance.available')}
          </h2>
          {isPending ? (
            <span
              role="status"
              aria-label={t('common.loading')}
              className="bg-surface-muted h-12 w-48 animate-pulse rounded-md"
            />
          ) : (
            <p className="text-fg text-5xl leading-tight font-bold">
              <Money value={balanceUsd ?? '0'} />
            </p>
          )}
          <p className="text-fg-muted text-sm">{t('balance.note')}</p>
        </div>
        <Button
          type="button"
          onClick={() => setDialog(true)}
          className="w-full sm:w-auto"
        >
          {t('balance.request')}
        </Button>
      </div>
      <PlanLine onContact={() => setDialog(true)} />
      <RequestBalanceDialog open={dialog} onOpenChange={setDialog} />
    </section>
  );
}
