import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import ar from '~/test/ar';
import { reportsMock, resetReportsMock } from '~/mocks/reports';
import { server } from '~/mocks/server';
import { renderApp } from '~/test/render-app';
import { useAdminSession } from '../../users/__tests__/harness';

useAdminSession();
beforeEach(() => resetReportsMock());

const r = ar.admin.reports.requests;
const rows = () =>
  within(screen.getByRole('table', { name: r.title })).getAllByRole('row');
const lastCall = () =>
  reportsMock.calls.filter((c) => c.name === 'chat-requests').at(-1)!.query;

describe('requests page', () => {
  it('opens on the flagged ones with the note and pages with the cursor', async () => {
    await renderApp('/admin/requests');
    expect(await screen.findByText(r.note)).toBeInTheDocument();
    await waitFor(() => expect(rows()).toHaveLength(6)); // header + 5
    expect(lastCall()).toMatchObject({ status: 'reconciliation_required' });
    expect(
      screen.getByRole('button', { name: r.chips.reconciliation_required }),
    ).toHaveAttribute('aria-pressed', 'true');

    const first = within(rows()[1]!);
    expect(
      first.getByRole('link', { name: 'sara@example.com' }),
    ).toHaveAttribute('href', expect.stringContaining('/admin/users/'));
    expect(first.getByText(r.source.estimated)).toBeInTheDocument();
    expect(first.getByText('0.0310$')).toBeInTheDocument(); // 4 decimals per request

    fireEvent.click(screen.getByRole('button', { name: r.loadMore }));
    await waitFor(() => expect(rows()).toHaveLength(9));
    expect(lastCall()).toMatchObject({ cursor: '5' });
    expect(screen.queryByRole('button', { name: r.loadMore })).toBeNull();
  });

  it('«الكل» sends no status and the status is in the URL', async () => {
    await renderApp('/admin/requests?status=all');
    await waitFor(() => expect(rows()).toHaveLength(6));
    expect(lastCall()).not.toHaveProperty('status');
    expect(screen.getByRole('button', { name: r.chips.all })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    fireEvent.click(screen.getByRole('button', { name: r.chips.settled }));
    await waitFor(() =>
      expect(lastCall()).toMatchObject({ status: 'settled' }),
    );
    expect(
      screen.getByRole('button', { name: r.chips.settled }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows nulls as a dash for a held request', async () => {
    server.use(
      http.get('http://localhost:3000/api/v1/admin/chat-requests', () =>
        HttpResponse.json({
          items: [
            {
              requestId: '00000000-0000-4000-8000-000000000001',
              createdAt: '2026-10-20T10:00:00.000Z',
              settledAt: null,
              userId: '22222222-2222-4222-8222-222222222222',
              userEmail: null,
              conversationId: '44444444-4444-4444-8444-444444444444',
              modeKey: 'fast',
              modelId: '33333333-3333-4333-8333-333333333333',
              modelDisplayName: null,
              providerCode: null,
              providerModelId: null,
              status: 'reserved',
              usageSource: 'provider',
              inputTokens: null,
              cachedInputTokens: null,
              outputTokens: null,
              reservedUsd: '0.050000000',
              chargedUsd: null,
              providerCostUsd: null,
              absorbedUsd: null,
            },
          ],
          nextCursor: null,
        }),
      ),
    );
    await renderApp('/admin/requests?status=reserved');
    await waitFor(() => expect(rows()).toHaveLength(2));
    const cells = within(rows()[1]!).getAllByRole('cell');
    expect(cells.filter((c) => c.textContent === '—').length).toBeGreaterThan(
      3,
    );
    expect(within(rows()[1]!).getByText('0.0500$')).toBeInTheDocument();
    expect(within(rows()[1]!).getByText(r.source.provider)).toBeInTheDocument();
  });

  it('shows the empty state for flagged and for another status', async () => {
    reportsMock.scenario = 'zeros';
    await renderApp('/admin/requests');
    expect(await screen.findByText(r.emptyFlagged)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: r.chips.released }));
    expect(await screen.findByText(r.emptyOther)).toBeInTheDocument();
  });

  it('shows an error with retry', async () => {
    reportsMock.scenario = 'error';
    await renderApp('/admin/requests');
    expect(await screen.findByText(r.error)).toBeInTheDocument();
    reportsMock.scenario = 'normal';
    fireEvent.click(screen.getByRole('button', { name: ar.common.retry }));
    await waitFor(() => expect(rows()).toHaveLength(6));
  });

  it('keeps loaded rows when the next page fails', async () => {
    await renderApp('/admin/requests');
    await waitFor(() => expect(rows()).toHaveLength(6));
    reportsMock.scenario = 'error';
    fireEvent.click(screen.getByRole('button', { name: r.loadMore }));
    expect(await screen.findByText(r.loadMoreError)).toBeInTheDocument();
    expect(rows()).toHaveLength(6);
  });
});
