import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { meSubscriptionControllerGetOptions } from '~/api/generated/@tanstack/react-query.gen';
import type { MeSubscriptionDto } from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { RequestBalanceDialog } from '~/components/RequestBalanceDialog';
import { RetryAlert } from '~/components/RetryAlert';
import { TextLink } from '~/components/TextLink';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { useModes } from '~/features/chat';
import { ModeIcon, modeTone, useModeLabel } from '~/features/chat/mode-ui';
import { formatDate } from '~/lib/dates';
import { toDecimal } from '~/lib/money';
import { cn } from '~/lib/utils';
import { Card } from './Card';

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-fg-muted text-sm">{label}</dt>
      <dd className="text-fg text-base font-medium">{children}</dd>
    </div>
  );
}

function PlanDetails({ data }: { data: MeSubscriptionDto }) {
  const { t, i18n } = useTranslation();
  const { modes } = useModes();
  const modeLabel = useModeLabel();
  const [dialog, setDialog] = useState(false);
  const en = i18n.language === 'en';
  const { plan, subscription } = data;
  const offered = modes
    .map((mode, index) => ({ mode, position: index + 1 }))
    .filter(({ mode }) => data.modeKeys.includes(mode.key));

  return (
    <>
      <div className="grid gap-1">
        <p className="text-fg text-lg font-semibold">
          {en ? plan.nameEn : plan.nameAr}
        </p>
        <p className="text-fg-muted text-base">
          {en ? plan.descriptionEn : plan.descriptionAr}
        </p>
      </div>
      {subscription ? (
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Detail label={t('account.plan.start')}>
            {formatDate(subscription.startedAt, i18n.language)}
          </Detail>
          {subscription.currentPeriodEnd ? (
            <Detail label={t('account.plan.end')}>
              {formatDate(subscription.currentPeriodEnd, i18n.language)}
            </Detail>
          ) : null}
          <Detail label={t('account.plan.price')}>
            {toDecimal(subscription.priceUsd).isZero() ? (
              t('account.plan.free')
            ) : (
              <>
                <Money value={subscription.priceUsd} />{' '}
                <span className="text-fg-muted text-sm font-normal">
                  {t('account.plan.perMonth')}
                </span>
              </>
            )}
          </Detail>
        </dl>
      ) : (
        <Alert variant="warning">{t('account.plan.noPlan')}</Alert>
      )}
      {offered.length > 0 ? (
        <div className="grid gap-2">
          <h3 className="text-fg-muted text-sm">{t('account.plan.modes')}</h3>
          <ul className="flex flex-wrap gap-2">
            {offered.map(({ mode, position }) => (
              <li
                key={mode.key}
                data-mode-position={position}
                className={cn(
                  'inline-flex h-7 items-center gap-1 rounded-full border px-3 text-sm font-semibold',
                  modeTone(position).chip,
                )}
              >
                <ModeIcon position={position} />
                {modeLabel(mode)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {subscription ? (
        <p className="text-fg-muted text-sm">{t('account.plan.expiryNote')}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setDialog(true)}
        >
          {t('account.plan.contact')}
        </Button>
        <TextLink to="/plans" className="gap-1">
          {t('account.plan.viewPlans')}
          <ChevronRight
            aria-hidden="true"
            className="size-4 rtl:-scale-x-100"
          />
        </TextLink>
      </div>
      <RequestBalanceDialog open={dialog} onOpenChange={setDialog} />
    </>
  );
}

export function PlanCard() {
  const { t } = useTranslation();
  const { data, isError, refetch, isPending } = useQuery(
    meSubscriptionControllerGetOptions(),
  );
  let body;
  if (data) {
    body = <PlanDetails data={data} />;
  } else if (isError) {
    body = (
      <RetryAlert onRetry={() => void refetch()}>
        {t('account.plan.error')}
      </RetryAlert>
    );
  } else {
    body = (
      <div
        role="status"
        aria-busy={isPending}
        aria-label={t('common.loading')}
        className="grid gap-4"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="bg-surface-muted h-10 animate-pulse rounded-md"
          />
        ))}
      </div>
    );
  }
  return <Card title={t('account.plan.title')}>{body}</Card>;
}
