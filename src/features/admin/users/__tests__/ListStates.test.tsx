import { fireEvent, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import ar from '~/i18n/ar.json';
import { server } from '~/mocks/server';
import { renderApp } from '~/test/render-app';
import { useAdminSession } from './harness';

useAdminSession();

const users = ar.admin.users;
const USERS = 'http://localhost:3000/api/v1/admin/users';

describe('admin users list states', () => {
  it('shows a loading state until the list arrives', async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    server.use(
      http.get(USERS, async () => {
        await gate;
        return HttpResponse.json({
          items: [],
          page: 1,
          pageSize: 20,
          total: 0,
        });
      }),
    );
    await renderApp('/admin/users');
    expect(await screen.findByRole('status')).toHaveTextContent(
      ar.admin.common.loading,
    );
    release();
    expect(await screen.findByText(users.emptyTitle)).toBeInTheDocument();
    expect(screen.queryByText(ar.admin.common.loading)).toBeNull();
  });

  it('shows the error and recovers with retry', async () => {
    server.use(
      http.get(
        USERS,
        () =>
          HttpResponse.json(
            { statusCode: 500, code: 'INTERNAL_ERROR', message: 'dev' },
            { status: 500 },
          ),
        { once: true },
      ),
    );
    await renderApp('/admin/users');
    expect(await screen.findByText(users.error)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: ar.common.retry }));
    expect(await screen.findByText('sara@example.com')).toBeInTheDocument();
    expect(screen.queryByText(users.error)).toBeNull();
  });
});
