import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from '~/components/ui/chart';
import { formatCount } from '~/lib/numbers';
import { formatDay } from '~/lib/period';
import { cn } from '~/lib/utils';
import { ChartTable, type ChartTableColumn } from './ChartTable';
import { axisTicks, niceMax, tickDates, tickLabel } from './ticks';
import { useReducedMotion } from './useReducedMotion';

/** Series colours are tokens: a first series in brand, a second in the lighter brand-soft. */
export const CHART_COLORS = {
  primary: 'var(--color-brand)',
  secondary: 'var(--color-brand-soft)',
  mode1: 'var(--color-mode-1)',
  mode2: 'var(--color-mode-2)',
  mode3: 'var(--color-mode-3)',
  mode4: 'var(--color-mode-4)',
} as const;

export interface DailySeries<T> {
  key: string;
  label: string;
  /** A token reference, see CHART_COLORS. */
  color: string;
  /** `bar` by default. */
  kind?: 'bar' | 'line';
  /**
   * The height to plot. For money use `toChartNumber` from `~/lib/money`: it is for
   * plotting only; the tooltip and table show `format` (with <Money>).
   */
  value: (row: T) => number;
  /** What the tooltip and table show for this series on a day. */
  format: (row: T) => ReactNode;
}

export interface DailyChartView<T> {
  key: string;
  /** Short label of the switch button. */
  label: string;
  /** Heading above the chart. */
  title: string;
  series: DailySeries<T>[];
  /** Y axis tick text; defaults to a count with thousands separators. */
  tickFormat?: (value: number) => string;
}

const HEIGHT = 'h-64';
const X_AXIS_HEIGHT = 28;
// One pixel under the column's 56: Recharts draws no axis when the plot area is 0 wide.
const Y_AXIS_WIDTH = 55;
const MARGIN = { top: 8, right: 0, bottom: 0, left: 0 };
// Room for half a date label at each end, or the first and last ticks are clipped.
const PLOT_MARGIN = { ...MARGIN, right: 28, left: 28 };
const BORDER = 'var(--color-border-subtle)';

/** Minimum plot width: 30 days stay readable on a phone, a year gets thin bars. */
function plotMinWidth(days: number): number {
  return Math.max(560, days > 35 ? days * 3 : 0);
}

function DayTooltip<T extends { date: string }>({
  active,
  payload,
  series,
}: {
  active?: boolean;
  payload?: { payload?: T }[];
  series: DailySeries<T>[];
}) {
  const { i18n } = useTranslation();
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div
      dir={i18n.dir()}
      className="border-border bg-surface text-fg grid min-w-40 gap-1.5 rounded-lg border px-3 py-2 text-start text-xs shadow-md"
    >
      <div className="font-medium">{formatDay(row.date, i18n.language)}</div>
      {series.map((s) => (
        <div key={s.key} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-fg-muted">{s.label}</span>
          </span>
          <span className="font-medium tabular-nums">{s.format(row)}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Daily bars (optionally a line) for a period of up to 366 days, right-to-left:
 * the first day is on the right, today on the left, the Y axis on the right. The
 * Y axis is a separate fixed column so the plot can scroll sideways on a phone; it
 * opens scrolled to today (the left end). Import it only from lazily loaded screens.
 */
export function DailyChart<T extends { date: string }>({
  rows,
  views,
  ariaLabel,
  emptyHint,
  todayDate,
  className,
}: {
  /** Every day of the period, oldest first (zeros included); the axis does the reversing. */
  rows: readonly T[];
  views: DailyChartView<T>[];
  /** Describes the chart for screen readers; the table has the exact values. */
  ariaLabel: string;
  /** Second line of the "no activity" message, e.g. «لم تُسجَّل أي رسائل بين … و…». */
  emptyHint: string;
  /** A day shown as «اليوم» on the X axis (the current month's last day). */
  todayDate?: string;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const reduced = useReducedMotion();
  const [viewKey, setViewKey] = useState(views[0]?.key);
  const [asTable, setAsTable] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const view =
    views.find((v) => v.key === viewKey) ?? (views[0] as DailyChartView<T>);
  const dates = useMemo(() => rows.map((r) => r.date), [rows]);
  const shown = useMemo(() => tickDates(dates), [dates]);

  const data = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        ...Object.fromEntries(view.series.map((s) => [s.key, s.value(row)])),
      })),
    [rows, view],
  );
  const peak = Math.max(
    0,
    ...data.flatMap((d) =>
      view.series.map((s) => (d as Record<string, number>)[s.key] ?? 0),
    ),
  );
  const top = niceMax(peak);
  const ticks = axisTicks(top);
  const tickFormat = view.tickFormat ?? formatCount;
  const isEmpty = peak === 0;

  const config: ChartConfig = Object.fromEntries(
    view.series.map((s) => [s.key, { label: s.label, color: s.color }]),
  );

  // RTL scrollers start at 0 on the right (the first day); negative values go left.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = -(el.scrollWidth - el.clientWidth);
  }, [rows.length, asTable, isEmpty, viewKey]);

  const columns: ChartTableColumn<T>[] = [];
  for (const v of views)
    for (const s of v.series)
      if (!columns.some((c) => c.key === s.key))
        columns.push({ key: s.key, header: s.label, cell: s.format });

  const xAxisProps = {
    dataKey: 'date',
    reversed: true,
    interval: 0,
    ticks: shown,
    tickLine: false,
    height: X_AXIS_HEIGHT,
  } as const;
  const yAxisProps = {
    orientation: 'right',
    domain: [0, top],
    ticks,
    tickLine: false,
    axisLine: false,
  } as const;

  return (
    // grid-cols-1: an auto column would grow to the plot's min width and widen the page.
    <div className={cn('grid grid-cols-1 gap-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-fg text-base font-medium">{view.title}</h3>
        <div className="flex flex-wrap items-center gap-2">
          {views.length > 1 && (
            <div
              role="group"
              aria-label={t('reports.chart.views')}
              className="bg-surface-muted flex gap-1 rounded-md p-1"
            >
              {views.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  aria-pressed={v.key === view.key}
                  onClick={() => setViewKey(v.key)}
                  className={cn(
                    'min-h-11 rounded-sm px-3 text-sm',
                    v.key === view.key
                      ? 'bg-surface text-fg font-medium shadow-sm'
                      : 'text-fg-muted',
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            aria-pressed={asTable}
            onClick={() => setAsTable((v) => !v)}
            className="border-border-control text-fg min-h-11 rounded-md border px-3 text-sm"
          >
            {asTable
              ? t('reports.chart.showChart')
              : t('reports.chart.showTable')}
          </button>
        </div>
      </div>

      {asTable ? (
        <ChartTable rows={rows} columns={columns} caption={view.title} />
      ) : isEmpty ? (
        <div className="bg-surface-muted grid min-h-40 place-content-center gap-1 rounded-md px-4 py-8 text-center">
          <p className="text-fg font-medium">{t('reports.chart.emptyTitle')}</p>
          <p className="text-fg-muted text-sm">{emptyHint}</p>
        </div>
      ) : (
        <>
          <ul
            aria-hidden
            className="text-fg-muted flex flex-wrap gap-4 text-sm"
          >
            {view.series.map((s) => (
              <li key={s.key} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-[2px]"
                  style={{ backgroundColor: s.color }}
                />
                {s.label}
              </li>
            ))}
          </ul>
          <div className="flex">
            {/* First in the DOM = right side in RTL: the fixed Y axis. */}
            <ChartContainer
              config={config}
              className={cn(HEIGHT, 'w-14 shrink-0')}
              data-testid="daily-chart-axis"
              aria-hidden
              // In RTL the tick text would grow leftwards, out of this narrow column.
              dir="ltr"
            >
              {/* This copy is aria-hidden, so it must not take keyboard focus. */}
              <ComposedChart
                data={data}
                margin={MARGIN}
                accessibilityLayer={false}
              >
                <XAxis {...xAxisProps} tick={false} axisLine={false} />
                <YAxis
                  {...yAxisProps}
                  width={Y_AXIS_WIDTH}
                  tickFormatter={tickFormat}
                />
                {/* Recharts draws no ticks on an axis with no series. */}
                <Line
                  dataKey={view.series[0]?.key}
                  stroke="transparent"
                  dot={false}
                  activeDot={false}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ChartContainer>
            <div
              ref={scroller}
              tabIndex={0}
              role="region"
              aria-label={t('reports.chart.scrollRegion')}
              data-testid="daily-chart-scroller"
              className="min-w-0 flex-1 overflow-x-auto"
            >
              <ChartContainer
                config={config}
                className={cn(HEIGHT, 'w-full')}
                data-testid="daily-chart-plot"
                role="img"
                aria-label={ariaLabel}
                style={{ minWidth: plotMinWidth(rows.length) }}
              >
                <ComposedChart data={data} margin={PLOT_MARGIN}>
                  <CartesianGrid vertical={false} stroke={BORDER} />
                  <XAxis
                    {...xAxisProps}
                    axisLine={{ stroke: BORDER }}
                    tickFormatter={(d: string) =>
                      d === todayDate
                        ? t('reports.chart.today')
                        : tickLabel(d, shown, i18n.language)
                    }
                  />
                  <YAxis {...yAxisProps} hide />
                  <ChartTooltip
                    cursor
                    content={<DayTooltip<T> series={view.series} />}
                  />
                  {view.series.map((s) =>
                    s.kind === 'line' ? (
                      <Line
                        key={s.key}
                        dataKey={s.key}
                        type="monotone"
                        stroke={s.color}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={!reduced}
                      />
                    ) : (
                      <Bar
                        key={s.key}
                        dataKey={s.key}
                        fill={s.color}
                        radius={[2, 2, 0, 0]}
                        maxBarSize={24}
                        isAnimationActive={!reduced}
                      />
                    ),
                  )}
                </ComposedChart>
              </ChartContainer>
            </div>
          </div>
          <p className="text-fg-subtle text-sm lg:hidden">
            {t('reports.chart.scrollHint')}
          </p>
        </>
      )}
    </div>
  );
}
