import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { catalogMock, lastRun, syncSummary } from '~/mocks/admin-catalog';
import { renderApp } from '~/test/render-app';
import { a, useCatalogSession } from './harness';

useCatalogSession();

const u = a.priceUpdates;
const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 3_600_000).toISOString();

describe('SyncNotices', () => {
  it('shows a run in progress on arrival (started by the schedule or another admin)', async () => {
    catalogMock.sync.running = {
      runId: 'run-9',
      startedAt: new Date().toISOString(),
      trigger: 'schedule',
    };
    await renderApp('/admin/price-updates');
    expect(
      await screen.findByRole('button', { name: u.running }),
    ).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText(u.startedAt, { exact: false })).toBeInTheDocument();
  });

  it('shows last run with its trigger and the next run, without warnings when fresh', async () => {
    await renderApp('/admin/price-updates');
    expect(
      await screen.findByText(u.lastRun, { exact: false }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`${u.trigger}: ${u.triggers.schedule}`)),
    ).toBeInTheDocument();
    expect(screen.getByText(u.nextRun, { exact: false })).toBeInTheDocument();
    expect(screen.queryByText(u.stale)).toBeNull();
    expect(screen.queryByText(u.failedTitle)).toBeNull();
  });

  it('warns when the last run ended more than 12 hours ago', async () => {
    catalogMock.sync.lastRun = lastRun({ finishedAt: hoursAgo(13) });
    await renderApp('/admin/price-updates');
    expect(await screen.findByText(u.stale)).toBeInTheDocument();
  });

  it('warns when the sync never ran', async () => {
    catalogMock.sync.lastRun = null;
    await renderApp('/admin/price-updates');
    expect(await screen.findByText(u.stale)).toBeInTheDocument();
    expect(screen.getByText(u.neverRun)).toBeInTheDocument();
  });

  it('shows a failed last run with its developer details, left to right', async () => {
    catalogMock.sync.lastRun = lastRun({
      summary: null,
      error: 'catalog download failed: ETIMEDOUT',
    });
    await renderApp('/admin/price-updates');
    expect(await screen.findByText(u.failedTitle)).toBeInTheDocument();
    const details = screen.getByText(u.failedDetails).closest('details')!;
    const text = within(details).getByText(
      'catalog download failed: ETIMEDOUT',
    );
    expect(text.closest('bdi')).toHaveAttribute('dir', 'ltr');
    // No result card for a failed run.
    expect(screen.queryByRole('region', { name: u.summary.title })).toBeNull();
  });

  it('a run seen in progress ends with the summary, which can be closed', async () => {
    catalogMock.sync.running = {
      runId: 'run-9',
      startedAt: new Date().toISOString(),
      trigger: 'schedule',
    };
    catalogMock.sync.nextSummary = syncSummary({ held: 4 });
    await renderApp('/admin/price-updates');
    const summary = within(
      await screen.findByRole(
        'region',
        { name: u.summary.title },
        { timeout: 8000 },
      ),
    );
    expect(summary.getByText('4')).toBeInTheDocument();
    fireEvent.click(summary.getByRole('button', { name: u.summary.close }));
    expect(screen.queryByRole('region', { name: u.summary.title })).toBeNull();
  }, 15_000);
});
