import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import errors from '~/i18n/errors.ar.json';
import { adminCalls, adminMock, ledgerEntry } from '~/mocks/admin';
import { renderApp } from '~/test/render-app';
import { useAdminSession, a, click, openUser } from './harness';

useAdminSession();

// One dialog flow per file: Radix dialogs reopened in the same jsdom document hang the run.
describe('UserDetailStates', () => {
  it('loads older ledger entries with the before cursor', async () => {
    adminMock.ledger = Array.from({ length: 35 }, (_, i) =>
      ledgerEntry(35 - i, 'usage_charge', '-0.001500000'),
    );
    await openUser('balance');
    const rows = () =>
      within(
        screen.getByRole('table', { name: a.balance.ledger }),
      ).getAllByRole('row');
    await waitFor(() => expect(rows()).toHaveLength(31)); // header + 30
    expect(screen.getByText('14.48$')).toBeInTheDocument();

    click(a.balance.loadMore);
    await waitFor(() => expect(rows()).toHaveLength(36));
    expect(adminCalls('ledger').at(-1)?.query).toMatchObject({ before: '6' });
    expect(
      screen.queryByRole('button', { name: a.balance.loadMore }),
    ).not.toBeInTheDocument();
  });

  it('shows the empty ledger state', async () => {
    await openUser('balance');
    expect(
      await screen.findByText(a.balance.ledgerEmptyTitle),
    ).toBeInTheDocument();
  });

  it('shows a not-found state for an unknown user', async () => {
    await renderApp('/admin/users/99999999-9999-4999-8999-999999999999');
    expect(await screen.findByText(a.detail.notFoundTitle)).toBeInTheDocument();
    expect(screen.getByText(errors.USER_NOT_FOUND)).toBeInTheDocument();
  });
});
