import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { catalogMock } from '~/mocks/admin-catalog';
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

describe('SyncRunConflict', () => {
  it('a run already going (409 CATALOG_SYNC_RUNNING) just switches to the running state', async () => {
    await renderApp('/admin/price-updates');
    await screen.findByRole('button', { name: u.runNow });
    // Another admin started one after this page loaded.
    catalogMock.sync.running = {
      runId: 'run-9',
      startedAt: new Date().toISOString(),
      trigger: 'admin',
    };
    await startRun();
    expect(
      await screen.findByRole('button', { name: u.running }),
    ).toHaveAttribute('aria-disabled', 'true');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.queryByText('dev message')).toBeNull();
  });
});
