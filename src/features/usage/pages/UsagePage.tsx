import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Money } from '~/components/Money';
import { PageScroll } from '~/components/PageScroll';
import { MonthPicker } from '~/components/reports';
import { RetryAlert } from '~/components/RetryAlert';
import { Button } from '~/components/ui/button';
import { currentMonth, formatMonth, validateMonthSearch } from '~/lib/months';
import { formatCount } from '~/lib/numbers';
import { ByDesigns } from '../components/ByDesigns';
import { ByMode } from '../components/ByMode';
import { UsageChart } from '../components/UsageChart';
import { useFirstMonth, useMyUsage } from '../model/queries';

function Totals({ messages, charged }: { messages: number; charged: string }) {
  const { t } = useTranslation();
  const card =
    'border-border-subtle bg-surface grid gap-1 rounded-lg border p-5';
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      <div className={card}>
        <dt className="text-fg-muted text-sm">{t('usage.messages')}</dt>
        <dd className="text-fg text-3xl font-bold tabular-nums">
          <bdi dir="ltr">{formatCount(messages)}</bdi>
        </dd>
      </div>
      <div className={card}>
        <dt className="text-fg-muted text-sm">{t('usage.charged')}</dt>
        <dd className="text-fg text-3xl font-bold">
          <Money value={charged} />
        </dd>
      </div>
    </dl>
  );
}

function Loading() {
  const { t } = useTranslation();
  const block = 'bg-surface-muted animate-pulse rounded-lg';
  return (
    <div role="status" aria-busy="true" className="grid gap-4">
      <span className="sr-only">{t('usage.loading')}</span>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={`${block} h-24`} />
        <div className={`${block} h-24`} />
      </div>
      <div className={`${block} h-40`} />
      <div className={`${block} h-72`} />
    </div>
  );
}

export function UsagePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { month: searched } = useSearch({ strict: false }) as {
    month?: string;
  };
  const now = currentMonth();
  const month = validateMonthSearch({ month: searched }).month ?? now;
  const isCurrent = month === now;
  const firstMonth = useFirstMonth(now);
  const usage = useMyUsage(month);
  const monthName = formatMonth(month, i18n.language);

  const setMonth = (next: string) =>
    void navigate({
      to: '/usage',
      search: next === now ? {} : { month: next },
    });

  const data = usage.data;
  const designs = data?.designs ?? [];
  const noMessages = data?.totals.messages === 0;
  // The empty card only when there were neither messages nor designs (S28).
  const isEmpty = noMessages && designs.length === 0;

  return (
    <PageScroll>
      <h1 className="text-fg text-3xl font-bold">{t('usage.title')}</h1>
      <div className="grid gap-2">
        <MonthPicker
          month={month}
          firstMonth={firstMonth}
          onChange={setMonth}
          className="self-start"
        />
        <p className="text-fg-subtle text-sm">{t('usage.utcNote')}</p>
      </div>

      {usage.isPending ? (
        <Loading />
      ) : usage.isError || !data ? (
        <RetryAlert onRetry={() => void usage.refetch()}>
          {t('usage.error')}
        </RetryAlert>
      ) : (
        <>
          <Totals
            messages={data.totals.messages}
            charged={data.totals.chargedUsd}
          />
          {isEmpty ? (
            <section className="border-border-subtle bg-surface grid justify-items-center gap-3 rounded-lg border px-6 py-12 text-center">
              <BarChart3 aria-hidden className="text-fg-subtle size-8" />
              <h2 className="text-fg text-lg font-medium">
                {t('usage.empty.title')}
              </h2>
              <p className="text-fg-muted max-w-md text-sm">
                {t(isCurrent ? 'usage.empty.bodyCurrent' : 'usage.empty.body', {
                  month: monthName,
                })}
              </p>
              {isCurrent ? (
                <Button asChild>
                  <Link to="/chat">{t('shell.newChat')}</Link>
                </Button>
              ) : null}
            </section>
          ) : (
            <>
              {noMessages ? null : (
                <>
                  <ByMode
                    rows={data.byMode}
                    totalCharged={data.totals.chargedUsd}
                  />
                  <UsageChart rows={data.byDay} month={month} />
                </>
              )}
              {designs.length > 0 ? <ByDesigns rows={designs} /> : null}
            </>
          )}
        </>
      )}
    </PageScroll>
  );
}
