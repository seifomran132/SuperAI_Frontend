import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import ar from '~/i18n/ar.json';
import { adminCalls, adminMock, ledgerEntry } from '~/mocks/admin';
import { server } from '~/mocks/server';
import { a, openUser, useAdminSession } from './harness';

useAdminSession();

const LEDGER = 'http://localhost:3000/api/v1/admin/users/:id/ledger';
const serverError = () =>
  HttpResponse.json(
    { statusCode: 500, code: 'INTERNAL_ERROR', message: 'dev' },
    { status: 500 },
  );
const rows = () =>
  within(screen.getByRole('table', { name: a.balance.ledger })).getAllByRole(
    'row',
  );

describe('admin ledger states', () => {
  it('shows loading, then the error, and recovers with retry', async () => {
    adminMock.ledger = Array.from({ length: 3 }, (_, i) =>
      ledgerEntry(3 - i, 'usage_charge', '-0.001500000'),
    );
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    server.use(
      http.get(
        LEDGER,
        async () => {
          await gate;
          return serverError();
        },
        { once: true },
      ),
    );
    await openUser('balance');
    expect(await screen.findByText(a.common.loading)).toBeInTheDocument();
    release();
    expect(await screen.findByText(a.balance.ledgerError)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: ar.common.retry }));
    await waitFor(() => expect(rows()).toHaveLength(4)); // header + 3
    expect(screen.queryByText(a.balance.ledgerError)).toBeNull();
  });

  it('keeps loaded rows when the next page fails and retries it with the same cursor', async () => {
    adminMock.ledger = Array.from({ length: 35 }, (_, i) =>
      ledgerEntry(35 - i, 'usage_charge', '-0.001500000'),
    );
    await openUser('balance');
    await waitFor(() => expect(rows()).toHaveLength(31));

    server.use(http.get(LEDGER, serverError, { once: true }));
    fireEvent.click(screen.getByRole('button', { name: a.balance.loadMore }));
    expect(
      await screen.findByText(a.balance.loadMoreError),
    ).toBeInTheDocument();
    expect(rows()).toHaveLength(31);

    fireEvent.click(screen.getByRole('button', { name: ar.common.retry }));
    await waitFor(() => expect(rows()).toHaveLength(36));
    expect(
      adminCalls('ledger')
        .map((c) => c.query?.before)
        .filter(Boolean),
    ).toEqual(['6']);
  });
});
