import type { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { UserUsageDto } from '~/api/generated/types.gen';
import { CHART_COLORS, DailyChart } from '~/components/charts';
import { Money } from '~/components/Money';
import { PeriodPicker } from '~/components/reports';
import { RetryAlert } from '~/components/RetryAlert';
import { moneyTick, toChartNumber } from '~/lib/money';
import { formatCount } from '~/lib/numbers';
import { formatDay, type PeriodSearch } from '~/lib/period';
import { useModeLabel } from '../../catalog/model/queries';
import { EmptyNote, Section } from '../../components/Section';
import { periodServerErrors } from '../model/overview';
import { useUserUsage } from '../model/userReports';
import { MarginValue } from './MarginValue';
import { RequestsPanel } from './RequestsPanel';
import { DesignsBlock } from './DesignsBlock';
import { UsageBreakdown } from './UsageBreakdown';

type Day = UserUsageDto['byDay'][number];

function Card({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-surface border-border-subtle rounded-lg border p-4">
      <p className="text-fg-muted text-sm">{label}</p>
      <p className="text-fg mt-1.5 text-2xl font-bold tabular-nums">
        {children}
      </p>
      {hint ? <p className="text-fg-subtle mt-1 text-xs">{hint}</p> : null}
    </div>
  );
}

function Totals({ usage }: { usage: UserUsageDto }) {
  const { t } = useTranslation();
  const { totals } = usage;
  const l = (key: string) => t(`admin.reports.usage.totals.${key}`);
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      <Card label={l('charged')}>
        <Money value={totals.chargedUsd} />
      </Card>
      <Card label={l('providerCost')}>
        <Money value={totals.providerCostUsd} />
      </Card>
      <Card label={l('margin')}>
        <MarginValue stats={totals} showPercent />
      </Card>
      <Card label={l('requests')}>{formatCount(totals.requests)}</Card>
      <Card label={l('flagged')}>{formatCount(totals.flaggedRequests)}</Card>
      <Card label={l('absorbed')} hint={l('absorbedHint')}>
        <Money value={totals.absorbedUsd} />
      </Card>
      <Card label={l('inputTokens')}>{formatCount(totals.inputTokens)}</Card>
      <Card label={l('cachedTokens')}>
        {formatCount(totals.cachedInputTokens)}
      </Card>
      <Card label={l('outputTokens')}>{formatCount(totals.outputTokens)}</Card>
    </div>
  );
}

function Breakdowns({ usage }: { usage: UserUsageDto }) {
  const { t } = useTranslation();
  const modeLabel = useModeLabel();
  const empty = (
    <EmptyNote
      title={t('admin.reports.usage.emptyTitle')}
      body={t('admin.reports.usage.emptyBody')}
    />
  );
  return (
    <>
      <Section title={t('admin.reports.usage.byMode')}>
        {usage.byMode.length === 0 ? (
          empty
        ) : (
          <UsageBreakdown
            label={t('admin.reports.usage.byMode')}
            nameHeader={t('admin.reports.usage.columns.mode')}
            rows={usage.byMode.map((row) => ({
              key: row.modeKey,
              title: modeLabel(row.modeKey),
              stats: row,
            }))}
          />
        )}
      </Section>
      <Section title={t('admin.reports.usage.byModel')}>
        {usage.byModel.length === 0 ? (
          empty
        ) : (
          <UsageBreakdown
            label={t('admin.reports.usage.byModel')}
            nameHeader={t('admin.reports.usage.columns.model')}
            rows={usage.byModel.map((row) => ({
              key: row.modelId,
              title: (
                <span className="grid gap-0.5">
                  <span>{row.displayName}</span>
                  <bdi dir="ltr" className="text-fg-muted text-start text-xs">
                    {row.providerCode}/{row.providerModelId}
                  </bdi>
                </span>
              ),
              stats: row,
            }))}
          />
        )}
      </Section>
    </>
  );
}

function Daily({ usage }: { usage: UserUsageDto }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en' : 'ar';
  return (
    <Section title={t('admin.reports.usage.daily')}>
      <DailyChart<Day>
        rows={usage.byDay}
        ariaLabel={t('admin.reports.usage.chartLabel')}
        emptyHint={t('admin.reports.usage.chartEmptyHint', {
          from: formatDay(usage.from, i18n.language),
          to: formatDay(usage.to, i18n.language),
        })}
        views={[
          {
            key: 'money',
            label: t('admin.reports.usage.views.money'),
            title: t('admin.reports.usage.views.moneyTitle'),
            tickFormat: (v) => moneyTick(v, locale),
            series: [
              {
                key: 'charged',
                label: t('admin.reports.usage.totals.charged'),
                color: CHART_COLORS.primary,
                value: (r) => toChartNumber(r.chargedUsd),
                format: (r) => <Money value={r.chargedUsd} kind="cost" />,
              },
              {
                key: 'providerCost',
                label: t('admin.reports.usage.totals.providerCost'),
                color: CHART_COLORS.secondary,
                value: (r) => toChartNumber(r.providerCostUsd),
                format: (r) => <Money value={r.providerCostUsd} kind="cost" />,
              },
            ],
          },
          {
            key: 'requests',
            label: t('admin.reports.usage.views.requests'),
            title: t('admin.reports.usage.views.requestsTitle'),
            series: [
              {
                key: 'requests',
                label: t('admin.reports.usage.totals.requests'),
                color: CHART_COLORS.primary,
                value: (r) => r.requests,
                format: (r) => formatCount(r.requests),
              },
            ],
          },
        ]}
      />
    </Section>
  );
}

/** S19 1a: the user's usage for a period (in the URL), then their recent requests. */
export function UsageTab({
  userId,
  period,
}: {
  userId: string;
  period: PeriodSearch;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const usage = useUserUsage(userId, period);
  const serverErrors = periodServerErrors(usage.error);
  const setPeriod = (next: PeriodSearch) =>
    void navigate({
      to: '/admin/users/$userId',
      params: { userId },
      search: { tab: 'usage', ...next },
      replace: true,
    });

  return (
    <div className="grid grid-cols-1 gap-6">
      <PeriodPicker
        value={period}
        onChange={setPeriod}
        effective={usage.data}
        serverErrors={serverErrors}
      />

      {usage.isPending ? (
        <p role="status" className="text-fg-muted p-10 text-center">
          {t('admin.reports.usage.loading')}
        </p>
      ) : usage.isError ? (
        <RetryAlert onRetry={() => void usage.refetch()}>
          {t('admin.reports.usage.error')}
        </RetryAlert>
      ) : (
        <>
          <Totals usage={usage.data} />
          <Breakdowns usage={usage.data} />
          <DesignsBlock designs={usage.data.designs} userId={userId} />
          <Daily usage={usage.data} />
        </>
      )}

      <Section title={t('admin.reports.usage.recent')}>
        <p className="text-fg-muted -mt-2 text-sm">
          {t('admin.reports.usage.recentNote')}
        </p>
        <div className="-mx-5 -mb-5">
          <RequestsPanel
            filter="all"
            userId={usage.data?.userId ?? userId}
            label={t('admin.reports.usage.recent')}
            emptyTitle={t('admin.reports.usage.recentEmpty')}
            errorText={t('admin.reports.usage.recentError')}
          />
        </div>
      </Section>
    </div>
  );
}
