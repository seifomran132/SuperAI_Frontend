import { useTranslation } from 'react-i18next';
import type { MyUsageByDayDto } from '~/api/generated/types.gen';
import {
  CHART_COLORS,
  DailyChart,
  type DailyChartView,
  type DailySeries,
} from '~/components/charts';
import { Money } from '~/components/Money';
import { moneyTick, toChartNumber } from '~/lib/money';
import { currentMonth, formatMonth } from '~/lib/months';
import { formatCount } from '~/lib/numbers';

export function UsageChart({
  rows,
  month,
}: {
  rows: MyUsageByDayDto[];
  month: string;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en' : 'ar';
  const amount: DailySeries<MyUsageByDayDto> = {
    key: 'amount',
    label: t('usage.chart.amount'),
    color: CHART_COLORS.primary,
    value: (r) => toChartNumber(r.chargedUsd),
    format: (r) => <Money value={r.chargedUsd} />,
  };
  const messages: DailySeries<MyUsageByDayDto> = {
    key: 'messages',
    label: t('usage.messages'),
    color: CHART_COLORS.primary,
    value: (r) => r.messages,
    format: (r) => <bdi dir="ltr">{formatCount(r.messages)}</bdi>,
  };
  const views: DailyChartView<MyUsageByDayDto>[] = [
    {
      key: 'amount',
      label: t('usage.chart.amount'),
      title: t('usage.chart.title'),
      series: [amount],
      tickFormat: (v) => moneyTick(v, locale),
    },
    {
      key: 'messages',
      label: t('usage.messages'),
      title: t('usage.chart.title'),
      series: [messages],
    },
  ];
  // The current month stops at today, so its last day is «اليوم».
  const todayDate =
    month === currentMonth() ? rows[rows.length - 1]?.date : undefined;
  const monthName = formatMonth(month, i18n.language);
  return (
    <section className="border-border-subtle bg-surface rounded-lg border p-4 sm:p-6">
      <DailyChart
        rows={rows}
        views={views}
        ariaLabel={t('usage.chart.aria', { month: monthName })}
        todayDate={todayDate}
        emptyHint={t('usage.chart.emptyHint', { month: monthName })}
      />
    </section>
  );
}
