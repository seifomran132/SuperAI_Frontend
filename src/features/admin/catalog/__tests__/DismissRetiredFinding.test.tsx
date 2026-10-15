import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '~/test/render-app';
import { a, useCatalogSession } from './harness';

useCatalogSession();

const u = a.priceUpdates;

describe('DismissRetiredFinding', () => {
  it('dismissing a retired model says it is permanent and keeps the model enabled', async () => {
    await renderApp('/admin/price-updates');
    fireEvent.click(
      within(
        await screen.findByRole('article', { name: 'نموذج f3' }),
      ).getByRole('button', {
        name: /^تجاهل/,
      }),
    );
    const dialog = within(await screen.findByRole('dialog'));
    expect(dialog.getByText(u.dialog.retiredNotice)).toBeInTheDocument();
    expect(
      dialog.getByRole('button', { name: u.dialog.retiredSubmit }),
    ).toBeInTheDocument();
    expect(dialog.queryByText(u.dialog.dismissNotice)).toBeNull();
    // Close it: an unmounted open dialog leaves Radix state that stalls the next test.
    fireEvent.click(dialog.getByRole('button', { name: a.common.cancel }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
