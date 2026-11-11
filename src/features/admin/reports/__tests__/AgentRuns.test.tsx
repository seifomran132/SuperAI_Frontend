import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { designsMock, run } from '~/mocks/designs';
import { renderApp } from '~/test/render-app';
import { a, useAdminSession } from '../../users/__tests__/harness';

useAdminSession();

const r = a.reports.runs;
const USER = '11111111-1111-4111-8111-111111111111';

describe('AgentRunsPage', () => {
  it('opens on runs that need review, and filters by status', async () => {
    designsMock.runs = [
      run('r1', { status: 'reconciliation_required' }),
      run('r2', { status: 'settled' }),
    ];
    await renderApp('/admin/agent-runs');
    const table = await screen.findByRole('table', { name: r.tableLabel });
    expect(within(table).getAllByRole('row')).toHaveLength(2);
    expect(
      within(table).getByText(r.status.reconciliation_required),
    ).toBeInTheDocument();
    expect(designsMock.runCalls[0]).toMatchObject({
      status: 'reconciliation_required',
    });
    fireEvent.click(screen.getByRole('button', { name: r.chips.all }));
    await waitFor(() =>
      expect(
        within(screen.getByRole('table', { name: r.tableLabel })).getAllByRole(
          'row',
        ),
      ).toHaveLength(3),
    );
  });

  it("lists one user's runs from the URL", async () => {
    designsMock.runs = [run('r1', { status: 'settled' })];
    await renderApp(`/admin/agent-runs?status=all&userId=${USER}`);
    expect(
      await screen.findByText(
        r.forUser.replace('{{email}}', 'sara@example.com'),
      ),
    ).toBeInTheDocument();
    expect(designsMock.runCalls.at(-1)).toMatchObject({ userId: USER });
  });

  it('shows the money, facts and every model call of a run', async () => {
    designsMock.detail = {
      ...run('r1'),
      stepList: [
        {
          sequence: 1,
          kind: 'prompt',
          variant: null,
          modelId: 'm1',
          modelDisplayName: 'نموذج نص',
          providerCode: 'acme',
          status: 'done',
          usageSource: 'provider',
          inputTokens: 1240,
          outputTokens: 310,
          providerCostUsd: '0.000900000',
          chargeUsd: '0.001100000',
          errorCode: null,
          startedAt: '2026-11-11T14:32:08.000Z',
          finishedAt: '2026-11-11T14:32:10.000Z',
        },
        {
          sequence: 2,
          kind: 'image',
          variant: 1,
          modelId: 'm2',
          modelDisplayName: 'نموذج صور',
          providerCode: 'acme',
          status: 'failed',
          usageSource: 'estimate',
          inputTokens: null,
          outputTokens: null,
          providerCostUsd: null,
          chargeUsd: null,
          errorCode: 'PROVIDER_TIMEOUT',
          startedAt: '2026-11-11T14:32:10.000Z',
          finishedAt: null,
        },
        {
          sequence: 3,
          kind: 'image',
          variant: 1,
          modelId: 'm2',
          modelDisplayName: 'نموذج صور',
          providerCode: 'acme',
          status: 'done',
          usageSource: 'provider',
          inputTokens: 412,
          outputTokens: 1056,
          providerCostUsd: '0.084000000',
          chargeUsd: '0.105000000',
          errorCode: null,
          startedAt: '2026-11-11T14:32:20.000Z',
          finishedAt: '2026-11-11T14:32:34.000Z',
        },
      ],
    };
    await renderApp('/admin/agent-runs/r1');
    const steps = await screen.findByRole('table', { name: r.steps });
    expect(within(steps).getAllByRole('row')).toHaveLength(4);
    expect(within(steps).getByText(r.stepKind.prompt)).toBeInTheDocument();
    expect(within(steps).getByText('PROVIDER_TIMEOUT')).toBeInTheDocument();
    expect(within(steps).getByText(r.estimated)).toBeInTheDocument();
    expect(within(steps).getByText(new RegExp(r.retry))).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'sara@example.com' }),
    ).toHaveAttribute('href', `/admin/users/${USER}`);
  });

  it('says when a run does not exist', async () => {
    await renderApp('/admin/agent-runs/missing');
    expect(await screen.findByText(r.notFound)).toBeInTheDocument();
  });
});
