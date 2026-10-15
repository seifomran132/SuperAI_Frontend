import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { adminCalls } from '~/mocks/admin';
import { renderApp } from '~/test/render-app';
import { a, reasonField, useCatalogSession } from './harness';

useCatalogSession();

const u = a.priceUpdates;

describe('DismissFinding', () => {
  it('dismisses a price finding with the permanence notice', async () => {
    await renderApp('/admin/price-updates');
    fireEvent.click(
      within(
        await screen.findByRole('article', { name: 'نموذج f2' }),
      ).getByRole('button', {
        name: /^تجاهل/,
      }),
    );
    const dialog = within(await screen.findByRole('dialog'));
    expect(dialog.getByText(u.dialog.dismissNotice)).toBeInTheDocument();
    fireEvent.change(reasonField(), { target: { value: 'لا حاجة' } });
    fireEvent.click(
      dialog.getByRole('button', { name: u.dialog.dismissSubmit }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(adminCalls('sync:dismiss')[0]?.body).toEqual({ reason: 'لا حاجة' });
    expect(await screen.findByText(u.toast.dismissed)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole('article', { name: 'نموذج f2' })).toBeNull(),
    );
  });
});
