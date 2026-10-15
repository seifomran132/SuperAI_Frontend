import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '~/test/render-app';
import { a, reasonField, useCatalogSession } from './harness';

useCatalogSession();

const u = a.priceUpdates;

describe('FindingOutdated', () => {
  it('keeps the dialog and the reason on CATALOG_FINDING_OUTDATED, and offers the sync', async () => {
    const { default: errors } = await import('~/i18n/errors.ar.json');
    const { adminMock } = await import('~/mocks/admin');
    await renderApp('/admin/price-updates');
    fireEvent.click(
      within(
        await screen.findByRole('article', { name: 'نموذج f1' }),
      ).getByRole('button', {
        name: /^تطبيق السعر/,
      }),
    );
    const dialog = within(await screen.findByRole('dialog'));
    fireEvent.change(reasonField(), { target: { value: 'سبب محفوظ' } });
    adminMock.fail = { status: 409, code: 'CATALOG_FINDING_OUTDATED' };
    fireEvent.click(dialog.getByRole('button', { name: u.card.apply }));

    expect(
      await dialog.findByText(errors.CATALOG_FINDING_OUTDATED),
    ).toBeInTheDocument();
    expect(reasonField()).toHaveValue('سبب محفوظ');
    // The same request cannot succeed now.
    expect(dialog.getByRole('button', { name: u.card.apply })).toBeDisabled();

    adminMock.fail = null;
    fireEvent.click(dialog.getByRole('button', { name: u.runNow }));
    expect(
      await screen.findByRole('heading', { name: u.dialog.runTitle }),
    ).toBeInTheDocument();
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: a.common.cancel,
      }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
