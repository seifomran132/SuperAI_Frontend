import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import ar from '~/test/ar';
import { reportsMock, resetReportsMock } from '~/mocks/reports';
import { sara } from '~/mocks/admin';
import { server } from '~/mocks/server';
import { renderApp } from '~/test/render-app';
import { useAdminSession } from '../../users/__tests__/harness';

useAdminSession();
beforeEach(() => resetReportsMock());

const u = ar.admin.reports.usage;
const openUsage = async (query = '') => {
  await renderApp(`/admin/users/${sara.id}?tab=usage${query}`);
  await screen.findByRole('heading', { name: sara.fullName! });
};

describe('user Usage tab', () => {
  it('shows the nine totals, by mode, by model and the recent requests', async () => {
    await openUsage();
    expect(
      (await screen.findAllByText(u.totals.charged)).length,
    ).toBeGreaterThan(0);
    for (const key of [
      'providerCost',
      'margin',
      'requests',
      'flagged',
      'absorbed',
      'inputTokens',
      'cachedTokens',
      'outputTokens',
    ] as const) {
      expect(screen.getAllByText(u.totals[key]).length).toBeGreaterThan(0);
    }
    expect(screen.getByText(u.totals.absorbedHint)).toBeInTheDocument();
    // Tokens are «توكنات», never «رموز».
    expect(screen.getByText('توكنات الإدخال')).toBeInTheDocument();

    const byModel = within(screen.getByRole('table', { name: u.byModel }));
    expect(byModel.getByText('Gemini 2.5 Flash')).toBeInTheDocument();
    expect(byModel.getByText('google/gemini-2.5-flash')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: u.byMode })).toBeInTheDocument();

    // The user's own requests, not filtered by the period (the note says so).
    expect(screen.getByText(u.recentNote)).toBeInTheDocument();
    await waitFor(() =>
      expect(
        reportsMock.calls.find((c) => c.name === 'chat-requests')?.query,
      ).toMatchObject({ userId: sara.id }),
    );
    expect(
      await screen.findByRole('table', { name: u.recent }),
    ).toBeInTheDocument();
    expect(
      reportsMock.calls.find((c) => c.name === 'chat-requests')?.query,
    ).not.toHaveProperty('from');
  });

  it('sends the period from the URL', async () => {
    await openUsage('&from=2026-10-01&to=2026-10-10');
    await screen.findAllByText(u.totals.charged);
    expect(
      reportsMock.calls.find((c) => c.name === 'user-usage')?.query,
    ).toMatchObject({ from: '2026-10-01', to: '2026-10-10' });
  });

  it('keeps the totals empty-state for a period with no use', async () => {
    reportsMock.scenario = 'zeros';
    await openUsage();
    expect((await screen.findAllByText(u.emptyTitle)).length).toBe(2);
    expect(await screen.findByText(u.recentEmpty)).toBeInTheDocument();
  });

  it('shows an error with retry and keeps the picker', async () => {
    reportsMock.scenario = 'error';
    await openUsage();
    expect(await screen.findByText(u.error)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: ar.reports.period.last7 }),
    ).toBeInTheDocument();

    reportsMock.scenario = 'normal';
    fireEvent.click(
      screen.getAllByRole('button', { name: ar.common.retry })[0]!,
    );
    expect(
      (await screen.findAllByText(u.totals.charged)).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(u.error)).toBeNull();
  });

  it('keeps the totals when only the recent requests fail', async () => {
    server.use(
      http.get('http://localhost:3000/api/v1/admin/chat-requests', () =>
        HttpResponse.json(
          { statusCode: 500, code: 'INTERNAL_ERROR', message: 'dev' },
          { status: 500 },
        ),
      ),
    );
    await openUsage();
    expect(await screen.findByText(u.recentError)).toBeInTheDocument();
    expect(screen.getAllByText(u.totals.charged).length).toBeGreaterThan(0);
  });

  it('does not offer the period on the other tabs', async () => {
    await renderApp(`/admin/users/${sara.id}?tab=balance&days=7`);
    await screen.findByRole('heading', { name: sara.fullName! });
    expect(
      screen.queryByRole('button', { name: ar.reports.period.last7 }),
    ).toBeNull();
  });
});
