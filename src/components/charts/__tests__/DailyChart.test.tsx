import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '~/i18n';
import ar from '~/i18n/ar.json';
import { addDays } from '~/lib/period';
import { CHART_COLORS, DailyChart, type DailyChartView } from '..';
import { tickDates } from '../ticks';

interface Row {
  date: string;
  requests: number;
  charged: string;
}

function makeRows(count: number, value = (i: number) => i + 1): Row[] {
  return Array.from({ length: count }, (_, i) => ({
    date: addDays('2026-10-08', i),
    requests: value(i),
    charged: `${value(i)}.000000000`,
  }));
}

const views: DailyChartView<Row>[] = [
  {
    key: 'requests',
    label: 'الطلبات',
    title: 'الطلبات اليومية',
    series: [
      {
        key: 'requests',
        label: 'الطلبات',
        color: CHART_COLORS.primary,
        value: (r) => r.requests,
        format: (r) => String(r.requests),
      },
    ],
  },
  {
    key: 'money',
    label: 'المبالغ',
    title: 'المبالغ',
    series: [
      {
        key: 'charged',
        label: 'المحصَّل',
        color: CHART_COLORS.primary,
        value: (r) => r.requests,
        format: (r) => r.charged,
      },
      {
        key: 'cost',
        label: 'تكلفة المزوّد',
        color: CHART_COLORS.secondary,
        value: (r) => r.requests / 2,
        format: () => '0',
      },
    ],
  },
];

function setReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

const show = (rows: Row[]) =>
  render(
    <DailyChart rows={rows} views={views} ariaLabel="رسم" emptyHint="لا شيء" />,
  );

const plot = (container: HTMLElement) =>
  container.querySelector('[data-testid="daily-chart-plot"]') as HTMLElement;

beforeEach(() => setReducedMotion(true));
afterEach(() => {
  // @ts-expect-error jsdom has no matchMedia by default
  delete window.matchMedia;
});

describe('DailyChart', () => {
  it('puts the first day on the right and today on the left', () => {
    const { container } = show(makeRows(30));
    const labels = [
      ...plot(container).querySelectorAll(
        '.recharts-cartesian-axis-tick-value',
      ),
    ];
    const text = labels.map((l) => l.textContent);
    // First day (with its month), every 5th day, month change, today.
    expect(text[0]).toBe('8 أكتوبر');
    expect(text.at(-1)).toBe('6 نوفمبر');
    const xs = labels.map((l) => Number(l.getAttribute('x')));
    expect(xs[0]).toBeGreaterThan(xs.at(-1)!);
    expect([...xs].sort((p, q) => q - p)).toEqual(xs);
  });

  it('keeps the Y axis in a fixed column on the right of the scrolling plot', () => {
    const { container } = show(makeRows(30));
    const axis = container.querySelector('[data-testid="daily-chart-axis"]')!;
    const scroller = container.querySelector(
      '[data-testid="daily-chart-scroller"]',
    )!;
    // First in the DOM = right in RTL.
    expect(
      axis.compareDocumentPosition(scroller) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(axis.querySelector('.recharts-yAxis')).not.toBeNull();
    expect(
      axis.querySelector('.recharts-yAxis')!.getAttribute('class'),
    ).toBeTruthy();
  });

  it('labels the plot as an image and keeps the scroller a labelled region', () => {
    const { container } = show(makeRows(30));
    const scroller = container.querySelector(
      '[data-testid="daily-chart-scroller"]',
    ) as HTMLElement;
    expect(scroller).toHaveAttribute('role', 'region');
    expect(scroller).toHaveAttribute(
      'aria-label',
      ar.reports.chart.scrollRegion,
    );
    expect(scroller.closest('[role="img"]')).toBeNull();
    const img = screen.getByRole('img', { name: 'رسم' });
    expect(img).toBe(plot(container));
  });

  it('shows «اليوم» on the axis for the given day', () => {
    const rows = makeRows(30);
    const { container } = render(
      <DailyChart
        rows={rows}
        views={views}
        ariaLabel="رسم"
        emptyHint="لا شيء"
        todayDate={rows.at(-1)!.date}
      />,
    );
    const labels = [
      ...plot(container).querySelectorAll(
        '.recharts-cartesian-axis-tick-value',
      ),
    ].map((l) => l.textContent);
    expect(labels.at(-1)).toBe(ar.reports.chart.today);
  });

  it('shows the empty message when every value is zero', () => {
    show(makeRows(30, () => 0));
    expect(screen.getByText(ar.reports.chart.emptyTitle)).toBeInTheDocument();
    expect(screen.getByText('لا شيء')).toBeInTheDocument();
  });

  it('draws 366 bars and thins the labels', () => {
    const rows = makeRows(366);
    const { container } = show(rows);
    expect(
      plot(container).querySelectorAll('.recharts-bar-rectangle').length,
    ).toBe(366);
    expect(tickDates(rows.map((r) => r.date)).length).toBeLessThanOrEqual(14);
  });

  it('switches the series and shows a table version', () => {
    show(makeRows(5));
    fireEvent.click(screen.getByRole('button', { name: 'المبالغ' }));
    expect(
      screen.getByRole('heading', { name: 'المبالغ' }),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: ar.reports.chart.showTable }),
    );
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(6);
    // Oldest first.
    expect(within(table).getAllByRole('rowheader')[0]).toHaveTextContent('8');
  });

  it('draws the bars at once when the user prefers reduced motion', () => {
    const { container } = show(makeRows(5));
    expect(
      plot(container).querySelectorAll('.recharts-bar-rectangle path').length,
    ).toBe(5);
  });

  it('animates the bars otherwise', () => {
    setReducedMotion(false);
    const { container } = show(makeRows(5));
    expect(
      plot(container).querySelectorAll('.recharts-bar-rectangle path').length,
    ).toBe(0);
  });
});
