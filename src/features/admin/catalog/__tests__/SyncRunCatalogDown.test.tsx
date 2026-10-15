import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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

describe('SyncRunCatalogDown', () => {
  it('says so when the catalog could not be reached', async () => {
    catalogMock.sync.nextSummary = syncSummary({ catalogAvailable: false });
    await renderApp('/admin/price-updates');
    await startRun();
    const summary = within(
      await screen.findByRole(
        'region',
        { name: u.summary.title },
        { timeout: 8000 },
      ),
    );
    expect(summary.getByText(u.summary.noCatalogTitle)).toBeInTheDocument();
    expect(summary.getByText(u.summary.noCatalogBody)).toBeInTheDocument();
  }, 15_000);
});
