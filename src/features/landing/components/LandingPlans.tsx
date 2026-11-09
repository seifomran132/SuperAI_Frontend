import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { publicPlansListOptions } from '~/api/generated/@tanstack/react-query.gen';
import type { PublicPlanDto } from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { RetryAlert } from '~/components/RetryAlert';
import { Button } from '~/components/ui/button';
import { modeTone, useModeLabel } from '~/features/chat/mode-ui';
import { toDecimal } from '~/lib/money';
import { Container, SectionTitle } from './layout';

const grid = 'grid gap-5 md:grid-cols-2 xl:grid-cols-3';

function PlanCard({ plan }: { plan: PublicPlanDto }) {
  const { t, i18n } = useTranslation();
  const modeLabel = useModeLabel();
  const en = i18n.language === 'en';
  return (
    <li className="bg-surface border-border-subtle flex flex-col rounded-lg border p-6">
      <h3 className="text-fg text-xl font-semibold">
        {en ? plan.nameEn : plan.nameAr}
      </h3>
      <p className="text-fg-muted mt-1 text-sm">
        {en ? plan.descriptionEn : plan.descriptionAr}
      </p>
      <p className="text-fg mt-5 flex items-baseline gap-2 text-[2rem] leading-[2.75rem] font-bold">
        <Money value={plan.monthlyPriceUsd} />
        <span className="text-fg-muted text-sm font-normal">
          {t('plans.perMonth')}
        </span>
      </p>
      {toDecimal(plan.includedBalanceUsd).isZero() ? null : (
        <p className="text-fg-muted text-sm">
          {t('landing.plans.included')}{' '}
          <span className="text-fg font-semibold">
            <Money value={plan.includedBalanceUsd} />
          </span>
        </p>
      )}
      <ul className="border-border-subtle mt-5 flex flex-1 flex-wrap content-start gap-2 border-t pt-4">
        {plan.modes.map((mode, index) => (
          <li
            key={mode.key}
            className={`inline-flex min-h-7 items-center rounded-full border px-3 text-[13px] font-medium ${modeTone(index + 1).chip}`}
          >
            {modeLabel(mode)}
          </li>
        ))}
      </ul>
      <Button asChild variant="secondary" size="sm" className="mt-6">
        <a href="#how-to-get-a-plan">{t('plans.subscribe')}</a>
      </Button>
    </li>
  );
}

function Body() {
  const { t } = useTranslation();
  const plans = useQuery(publicPlansListOptions());
  if (plans.isError) {
    return (
      <RetryAlert onRetry={() => void plans.refetch()}>
        {t('plans.error')}
      </RetryAlert>
    );
  }
  if (!plans.data) {
    return (
      <ul
        role="status"
        aria-busy="true"
        aria-label={t('plans.loading')}
        className={grid}
      >
        {[0, 1].map((i) => (
          <li
            key={i}
            className="bg-surface-muted h-80 animate-pulse rounded-lg"
          />
        ))}
      </ul>
    );
  }
  // No free plan is offered: the default plan is what users have before subscribing.
  const paid = plans.data.filter(
    (plan) => !plan.isDefault && !toDecimal(plan.monthlyPriceUsd).isZero(),
  );
  if (paid.length === 0) {
    return <p className="text-fg-muted text-base">{t('plans.emptyBody')}</p>;
  }
  return (
    <ul className={grid}>
      {paid.map((plan) => (
        <PlanCard key={plan.key} plan={plan} />
      ))}
    </ul>
  );
}

export function LandingPlans() {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="landing-plans">
      <Container className="py-12 md:py-16">
        <SectionTitle id="landing-plans">
          {t('landing.plans.title')}
        </SectionTitle>
        <div className="mt-8">
          <Body />
        </div>
        <Link
          to="/plans"
          className="text-fg mt-6 inline-flex min-h-11 items-center gap-1.5 text-base font-semibold underline underline-offset-4"
        >
          {t('landing.plans.all')}
          <ChevronRight aria-hidden="true" className="size-4 rtl:rotate-180" />
        </Link>
      </Container>
    </section>
  );
}
