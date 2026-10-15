import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { adminCalls } from '~/mocks/admin';
import { catalogMock, syncSummary } from '~/mocks/admin-catalog';
import { renderApp } from '~/test/render-app';
import { a, reasonField, useCatalogSession } from './harness';

useCatalogSession();

const u = a.priceUpdates;

async function startRun() {
  fireEvent.click(await screen.findByRole('button', { name: u.runNow }));
  const dialog = within(await screen.findByRole('dialog'));
  fireEvent.change(reasonField(), { target: { value: 'تحقق يدوي' } });
  fireEvent.click(dialog.getByRole('button', { name: u.dialog.runSubmit }));
}

describe('SyncRunSummary', () => {
  it('runs, shows the running state, then the summary and refreshed findings', async () => {
    await renderApp('/admin/price-updates');
    await startRun();
    await waitFor(() => expect(adminCalls('sync:run')).toHaveLength(1));
    expect(adminCalls('sync:run')[0]?.body).toEqual({ reason: 'تحقق يدوي' });

    // 202: the button is busy and disabled while the status says running.
    const busy = await screen.findByRole('button', { name: u.running });
    expect(busy).toHaveAttribute('aria-disabled', 'true');
    expect(busy).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('region', { name: u.summary.title })).toBeNull();

    // A new finding appears while it runs; the summary arrives on the 3 s poll.
    catalogMock.sync.nextSummary = syncSummary({
      applied: 7,
      skipped: 0,
      ignored: 0,
    });
    const summary = within(
      await screen.findByRole(
        'region',
        { name: u.summary.title },
        { timeout: 8000 },
      ),
    );
    expect(summary.getByText('7')).toBeInTheDocument();
    expect(summary.getByText(u.summary.checked)).toBeInTheDocument();
    expect(summary.getByText(u.summary.notInCatalog)).toBeInTheDocument();
    // Small counts at zero are hidden; others stay.
    expect(summary.queryByText(`${u.summary.skipped}:`)).toBeNull();
    expect(summary.queryByText(`${u.summary.ignored}:`)).toBeNull();
    expect(summary.getByText(`${u.summary.failed}:`)).toBeInTheDocument();
    // Retired models still used by enabled modes.
    expect(
      summary.getByText(u.summary.retiredInUse.replace('{{n}}', '1')),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: u.runNow })).toBeEnabled();
  }, 15_000);
});
