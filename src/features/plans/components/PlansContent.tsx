import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  meSubscriptionControllerGetOptions,
  publicPlansControllerListOptions,
} from '~/api/generated/@tanstack/react-query.gen';
import { RequestBalanceDialog } from '~/components/RequestBalanceDialog';
import { RetryAlert } from '~/components/RetryAlert';
import { PlanCard } from './PlanCard';

function Skeleton() {
  const { t } = useTranslation();
  return (
    <ul
      role="status"
      aria-busy="true"
      aria-label={t('plans.loading')}
      className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
    >
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="bg-surface-muted h-96 animate-pulse rounded-lg"
        />
      ))}
    </ul>
  );
}

/** Heading, intro and the plan cards. The page around it (shell or public header) is the page's choice. */
export function PlansContent({ signedIn }: { signedIn: boolean }) {
  const { t } = useTranslation();
  const plans = useQuery(publicPlansControllerListOptions());
  // Only a signed-in visitor has a plan to mark; failure here just means no mark.
  const mine = useQuery({
    ...meSubscriptionControllerGetOptions(),
    enabled: signedIn,
  });
  const [dialog, setDialog] = useState(false);
  // A user without a subscription is on the default plan: nothing to mark.
  const currentKey = mine.data?.subscription ? mine.data.plan.key : undefined;

  let body;
  if (plans.isError) {
    body = (
      <RetryAlert onRetry={() => void plans.refetch()}>
        {t('plans.error')}
      </RetryAlert>
    );
  } else if (!plans.data) {
    body = <Skeleton />;
  } else if (plans.data.length === 0) {
    body = (
      <div className="text-fg-muted flex flex-col gap-1 py-12 text-center">
        <p className="text-fg text-lg font-semibold">{t('plans.emptyTitle')}</p>
        <p className="text-base">{t('plans.emptyBody')}</p>
      </div>
    );
  } else {
    body = (
      <ul className="grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
        {plans.data.map((plan) => (
          <PlanCard
            key={plan.key}
            plan={plan}
            current={plan.key === currentKey}
            onSubscribe={() => setDialog(true)}
          />
        ))}
      </ul>
    );
  }

  return (
    <>
      <div className="grid gap-2">
        <h1 className="text-fg text-3xl font-bold">{t('plans.title')}</h1>
        <p className="text-fg-muted max-w-[720px] text-base leading-7">
          {t('plans.intro')}
        </p>
      </div>
      {body}
      <RequestBalanceDialog open={dialog} onOpenChange={setDialog} />
    </>
  );
}
