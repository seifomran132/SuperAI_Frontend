import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { catalogMock } from '~/mocks/admin-catalog';
import { renderApp } from '~/test/render-app';
import { a, reasonField, useCatalogSession } from './harness';

useCatalogSession();

const u = a.priceUpdates;

describe('FindingNotOpen', () => {
  it('a finding that is already closed refreshes the list and closes the dialog', async () => {
    const { default: errors } = await import('~/i18n/errors.ar.json');
    const { adminMock } = await import('~/mocks/admin');
    await renderApp('/admin/price-updates');
    fireEvent.click(
      within(
        await screen.findByRole('article', { name: 'نموذج f2' }),
      ).getByRole('button', {
        name: /^تجاهل/,
      }),
    );
    fireEvent.change(reasonField(), { target: { value: 'سبب' } });
    // Someone else closed it meanwhile.
    catalogMock.sync.findings[1]!.status = 'dismissed';
    adminMock.fail = null;
    fireEvent.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: u.dialog.dismissSubmit,
      }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(
      await screen.findByText(errors.CATALOG_FINDING_NOT_OPEN),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole('article', { name: 'نموذج f2' })).toBeNull(),
    );
  });
});
