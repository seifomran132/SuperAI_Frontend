import { useMemo } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { OverviewDayDto, OverviewDto } from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { RetryAlert } from '~/components/RetryAlert';
import {
  CHART_COLORS,
  DailyChart,
  type DailyChartView,
} from '~/components/charts';
import { PeriodPicker } from '~/components/reports';
import { moneyTick, toChartNumber } from '~/lib/money';
import { formatCount } from '~/lib/numbers';
import {
  formatDay,
  validatePeriodSearch,
  type PeriodSearch,
} from '~/lib/period';
import {
  AttentionCard,
  CountRow,
  MarginCard,
  MoneyCard,
  StatCard,
} from '../components/OverviewCards';
import { OverviewSkeleton } from '../components/OverviewSkeleton';
import { TopLists } from '../components/TopLists';
import {
  periodServerErrors,
  totalActive,
  useOverview,
} from '../model/overview';

const P = 'admin.reports.overview';

function useChartViews(): DailyChartView<OverviewDayDto>[] {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en' : 'ar';
  return useMemo(
    () => [
      {
        key: 'money',
        label: t(`${P}.chart.views.money`),
        title: t(`${P}.chart.titles.money`),
        tickFormat: (v: number) => moneyTick(v, locale),
        series: [
          {
            key: 'charged',
            label: t(`${P}.chart.series.charged`),
            color: CHART_COLORS.primary,
            value: (r) => toChartNumber(r.chargedUsd),
            format: (r) => <Money value={r.chargedUsd} />,
          },
          {
            key: 'cost',
            label: t(`${P}.chart.series.cost`),
            color: CHART_COLORS.secondary,
            value: (r) => toChartNumber(r.providerCostUsd),
            format: (r) => <Money value={r.providerCostUsd} />,
          },
        ],
      },
      {
        key: 'requests',
        label: t(`${P}.chart.views.requests`),
        title: t(`${P}.chart.titles.requests`),
        series: [
          {
            key: 'requests',
            label: t(`${P}.chart.series.requests`),
            color: CHART_COLORS.mode1,
            value: (r) => r.requests,
            format: (r) => formatCount(r.requests),
          },
        ],
      },
      {
        key: 'users',
        label: t(`${P}.chart.views.users`),
        title: t(`${P}.chart.titles.users`),
        series: [
          {
            key: 'users',
            label: t(`${P}.chart.series.users`),
            color: CHART_COLORS.mode2,
            value: (r) => r.newUsers,
            format: (r) => formatCount(r.newUsers),
          },
        ],
      },
    ],
    [t, locale],
  );
}

function Report({ data }: { data: OverviewDto }) {
  const { t, i18n } = useTranslation();
  const views = useChartViews();
  const { usage, users } = data;
  return (
    <div className="grid gap-6">
      <section aria-labelledby="attention-title" className="grid gap-3">
        <h2 id="attention-title" className="text-fg text-lg font-semibold">
          {t(`${P}.attention.title`)}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <AttentionCard
            to="/admin/requests"
            title={t(`${P}.attention.flagged`)}
            help={t(`${P}.attention.flaggedHelp`)}
            count={data.requestsToReview}
            zero={t(`${P}.attention.flaggedZero`)}
            link={t(`${P}.attention.flaggedLink`)}
          />
          <AttentionCard
            to="/admin/price-updates"
            title={t(`${P}.attention.findings`)}
            help={t(`${P}.attention.findingsHelp`)}
            count={data.openCatalogFindings}
            zero={t(`${P}.attention.findingsZero`)}
            link={t(`${P}.attention.findingsLink`)}
          />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MoneyCard
          title={t(`${P}.money.charged`)}
          help={t(`${P}.money.chargedHelp`)}
          value={usage.chargedUsd}
        />
        <MoneyCard
          title={t(`${P}.money.cost`)}
          help={t(`${P}.money.costHelp`)}
          value={usage.providerCostUsd}
        />
        <MarginCard margin={usage.marginUsd} charged={usage.chargedUsd} />
        <MoneyCard
          title={t(`${P}.money.absorbed`)}
          help={t(`${P}.money.absorbedHelp`)}
          value={usage.absorbedUsd}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title={t(`${P}.users.title`)}>
          <dl className="grid gap-2">
            <CountRow
              label={t(`${P}.users.total`)}
              help={t(`${P}.users.totalHelp`)}
              value={users.total}
            />
            <CountRow
              label={t(`${P}.users.new`)}
              help={t(`${P}.users.newHelp`)}
              value={users.new}
            />
            <CountRow
              label={t(`${P}.users.active`)}
              help={t(`${P}.users.activeHelp`)}
              value={users.active}
            />
          </dl>
        </StatCard>
        <StatCard title={t(`${P}.plans.title`)} help={t(`${P}.plans.help`)}>
          {data.subscriptions.length === 0 ? (
            <p className="text-fg-muted text-sm">{t(`${P}.plans.empty`)}</p>
          ) : (
            <dl className="grid gap-2">
              <CountRow
                label={t(`${P}.plans.total`)}
                value={totalActive(data.subscriptions)}
              />
              {data.subscriptions.map((plan) => (
                <CountRow
                  key={plan.planKey}
                  label={i18n.language === 'en' ? plan.nameEn : plan.nameAr}
                  value={plan.active}
                />
              ))}
            </dl>
          )}
        </StatCard>
        <StatCard title={t(`${P}.images.title`)}>
          <dl className="grid gap-2">
            <CountRow
              label={t(`${P}.images.created`)}
              value={data.imagesCreated}
            />
            <CountRow
              label={t(`${P}.images.uploaded`)}
              value={data.imagesUploaded}
            />
          </dl>
        </StatCard>
      </div>

      <section className="bg-surface border-border-subtle min-w-0 rounded-lg border p-4">
        <DailyChart
          rows={data.byDay}
          views={views}
          ariaLabel={t(`${P}.chart.aria`)}
          emptyHint={t(`${P}.chart.emptyHint`, {
            from: formatDay(data.from, i18n.language),
            to: formatDay(data.to, i18n.language),
          })}
        />
      </section>

      <TopLists modes={data.topModes} models={data.topModels} />
    </div>
  );
}

/** S18 admin dashboard: the period lives in the URL, the report follows it. */
export function OverviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate({ from: '/admin/overview' });
  const period = validatePeriodSearch(useSearch({ strict: false }));
  const query = useOverview(period);
  const setPeriod = (next: PeriodSearch) =>
    void navigate({ to: '/admin/overview', search: next, replace: true });

  const serverErrors = periodServerErrors(query.error);
  const data = query.data;

  return (
    <>
      <PeriodPicker
        value={period}
        onChange={setPeriod}
        effective={data ? { from: data.from, to: data.to } : undefined}
        serverErrors={serverErrors}
      />
      <div aria-busy={query.isFetching || undefined} className="grid gap-6">
        {data ? (
          <Report data={data} />
        ) : query.isPending ? (
          <OverviewSkeleton />
        ) : serverErrors.length > 0 ? null : (
          <RetryAlert onRetry={() => void query.refetch()}>
            {`${t('reports.state.errorTitle')}. ${t('reports.state.errorBody')}`}
          </RetryAlert>
        )}
      </div>
    </>
  );
}
