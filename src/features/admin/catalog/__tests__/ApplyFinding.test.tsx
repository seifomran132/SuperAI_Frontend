import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { adminCalls } from '~/mocks/admin';
import { renderApp } from '~/test/render-app';
import { a, reasonField, useCatalogSession } from './harness';

useCatalogSession();

const u = a.priceUpdates;

describe('ApplyFinding', () => {
  it('applies with a reason, refreshes the list and the badge, and says so', async () => {
    await renderApp('/admin/price-updates');
    const link = await screen.findByRole('link', {
      name: /^تحديثات الأسعار، 3/,
    });
    fireEvent.click(
      within(
        await screen.findByRole('article', { name: 'نموذج f1' }),
      ).getByRole('button', {
        name: /^تطبيق السعر/,
      }),
    );
    const dialog = within(await screen.findByRole('dialog'));
    expect(dialog.getByText(u.dialog.applyBody)).toBeInTheDocument();
    // Empty reason: refused before any call.
    fireEvent.click(dialog.getByRole('button', { name: u.card.apply }));
    expect(
      await dialog.findByText(a.dialog.reasonRequired),
    ).toBeInTheDocument();
    expect(adminCalls('sync:apply')).toHaveLength(0);

    fireEvent.change(reasonField(), {
      target: { value: 'يطابق إعلان المزود' },
    });
    fireEvent.click(dialog.getByRole('button', { name: u.card.apply }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(adminCalls('sync:apply')[0]?.body).toEqual({
      reason: 'يطابق إعلان المزود',
    });
    expect(await screen.findByText(u.toast.applied)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole('article', { name: 'نموذج f1' })).toBeNull(),
    );
    // The sidebar badge shares the status query: 3 became 2.
    await waitFor(() =>
      expect(link).toHaveAccessibleName(/^تحديثات الأسعار، 2/),
    );
  });
});
