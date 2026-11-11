import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import type { OverviewDto } from '~/api/generated/types.gen';
import ar from '~/test/ar';
import { resetCatalogMock } from '~/mocks/admin-catalog';
import { reportsMock, resetReportsMock } from '~/mocks/reports';
import { server } from '~/mocks/server';
import { renderApp } from '~/test/render-app';
import { useAdminSession } from '../../users/__tests__/harness';

useAdminSession();
beforeEach(() => {
  resetReportsMock();
  resetCatalogMock();
});

const o = ar.admin.reports.overview;
const URL_OVERVIEW = 'http://localhost:3000/api/v1/admin/overview';

const overviewCalls = () =>
  reportsMock.calls.filter((c) => c.name === 'overview');

function dto(patch: Partial<OverviewDto> = {}): OverviewDto {
  const zero = '0.000000000';
  return {
    from: '2026-10-08',
    to: '2026-11-06',
    users: { total: 10, new: 1, active: 2 },
    subscriptions: [],
    money: {
      purchasesUsd: zero,
      subscriptionCreditsUsd: zero,
      voucherCreditsUsd: zero,
      adjustmentsUsd: zero,
      expiredUsd: zero,
    },
    usage: {
      requests: 5,
      flaggedRequests: 0,
      inputTokens: 0,
      cachedInputTokens: 0,
      outputTokens: 0,
      chargedUsd: '100.000000000',
      providerCostUsd: '148.500000000',
      marginUsd: '-48.500000000',
      absorbedUsd: zero,
    },
    imagesCreated: 0,
    imagesUploaded: 0,
    designs: {
      runs: 0,
      designs: 0,
      flaggedRuns: 0,
      chargedUsd: zero,
      providerCostUsd: zero,
      marginUsd: zero,
      absorbedUsd: zero,
    },
    designRunsToReview: 0,
    openCatalogFindings: 0,
    requestsToReview: 0,
    topModes: [],
    topModels: [],
    byDay: [],
    ...patch,
  };
}

describe('Admin overview', () => {
  it('shows the cards, attention links, chart and top lists', async () => {
    await renderApp('/admin/overview');
    expect(
      await screen.findByRole('heading', { name: o.attention.title }),
    ).toBeInTheDocument();
    // Users: total, new and active with their definitions.
    expect(screen.getByText('1,284')).toBeInTheDocument();
    expect(screen.getByText(o.users.activeHelp)).toBeInTheDocument();
    // Plans by name in the UI language, plus the total (150 + 61).
    expect(screen.getByText('بلس')).toBeInTheDocument();
    expect(screen.getByText('211')).toBeInTheDocument();
    // Attention: counts and links.
    const flagged = screen.getByRole('link', {
      name: new RegExp(o.attention.flagged),
    });
    expect(flagged).toHaveAttribute('href', '/admin/requests');
    expect(within(flagged).getByText('5')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: new RegExp(o.attention.findings) }),
    ).toHaveAttribute('href', '/admin/price-updates');
    // Positive margin: percent shown, no danger colour.
    expect(
      screen.getByText(
        (_, el) =>
          el?.tagName === 'P' && /^نسبة الهامش: \d/.test(el.textContent ?? ''),
      ),
    ).toBeInTheDocument();
    // Chart with its views.
    expect(
      screen.getByRole('button', { name: o.chart.views.requests }),
    ).toBeInTheDocument();
    // Models are shown by key, LTR.
    expect(screen.getByText('google/gemini-2.5-flash')).toBeInTheDocument();
    expect(overviewCalls()).toHaveLength(1);
    expect(overviewCalls()[0]!.query).toEqual({});
  });

  it('shows zeros, the empty chart message and empty lists for a quiet period', async () => {
    reportsMock.scenario = 'zeros';
    await renderApp('/admin/overview');
    expect(
      await screen.findByText(ar.reports.chart.emptyTitle),
    ).toBeInTheDocument();
    expect(screen.getAllByText('0.00$').length).toBeGreaterThanOrEqual(4);
    expect(screen.getAllByText(o.tops.empty)).toHaveLength(2);
    expect(screen.getByText(o.attention.flaggedZero)).toBeInTheDocument();
    expect(screen.getByText(o.attention.findingsZero)).toBeInTheDocument();
    // Charged is zero: no margin percent.
    expect(screen.queryByText(/نسبة الهامش/)).not.toBeInTheDocument();
  });

  it('shows a recoverable error and loads again on retry', async () => {
    reportsMock.scenario = 'error';
    await renderApp('/admin/overview');
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(ar.reports.state.errorTitle);
    reportsMock.scenario = 'normal';
    fireEvent.click(screen.getByRole('button', { name: ar.common.retry }));
    expect(
      await screen.findByRole('heading', { name: o.attention.title }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a negative margin with the minus sign and the danger colour', async () => {
    server.use(http.get(URL_OVERVIEW, () => HttpResponse.json(dto())));
    await renderApp('/admin/overview');
    const amount = await screen.findByText('−48.50$');
    expect(amount.closest('p')).toHaveClass('text-danger');
    expect(screen.getByText(o.money.marginNegativeHelp)).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, el) =>
          el?.tagName === 'P' && el.textContent === 'نسبة الهامش: −48.5%',
      ),
    ).toBeInTheDocument();
  });

  it('writes the period to the URL and fetches the new period', async () => {
    const { here } = await renderApp('/admin/overview');
    await screen.findByRole('heading', { name: o.attention.title });
    fireEvent.click(
      screen.getByRole('button', { name: ar.reports.period.last7 }),
    );
    await waitFor(() => expect(here()).toBe('/admin/overview?days=7'));
    await waitFor(() => expect(overviewCalls()).toHaveLength(2));
    const { from, to } = overviewCalls()[1]!.query;
    expect(from).toBeDefined();
    expect(to).toBeDefined();
    expect(
      screen.getByRole('button', { name: ar.reports.period.last7 }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('reads the period from the URL', async () => {
    await renderApp('/admin/overview?from=2026-10-01&to=2026-10-10');
    await screen.findByRole('heading', { name: o.attention.title });
    expect(overviewCalls()[0]!.query).toEqual({
      from: '2026-10-01',
      to: '2026-10-10',
    });
  });

  it('labels top modes from the admin modes list and falls back to the key', async () => {
    await renderApp('/admin/overview');
    const table = await screen.findByRole('table', { name: o.tops.modes });
    // `fast` is in the catalog, `professional` is not.
    await within(table).findByText('وضع fast');
    expect(within(table).getByText('professional')).toBeInTheDocument();
  });
});
