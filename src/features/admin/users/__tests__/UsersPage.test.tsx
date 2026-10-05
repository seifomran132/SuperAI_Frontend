import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import ar from '~/i18n/ar.json';
import { adminCalls, adminMock, resetAdminMock, sara } from '~/mocks/admin';
import { authMock, defaultProfile } from '~/mocks/auth';
import { resetChatMock } from '~/mocks/chat';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';

useAuthMocks();
beforeEach(async () => {
  resetChatMock();
  resetAdminMock();
  authMock.me = { kind: 'ok', profile: { ...defaultProfile, isAdmin: true } };
  await signInDirectly();
});

const users = ar.admin.users;

describe('users list', () => {
  it('debounces the search into the URL and the request', async () => {
    const { here } = await renderApp('/admin/users');
    await screen.findByText('sara@example.com');

    fireEvent.change(screen.getByLabelText(users.searchLabel), {
      target: { value: 'sar' },
    });
    fireEvent.change(screen.getByLabelText(users.searchLabel), {
      target: { value: 'sara' },
    });
    await waitFor(() => expect(here()).toBe('/admin/users?q=sara'));
    await waitFor(() =>
      expect(adminCalls('users:list').at(-1)?.query).toMatchObject({
        q: 'sara',
        page: '1',
        pageSize: '20',
      }),
    );
    // One request for the first load and one for the settled search.
    expect(
      adminCalls('users:list').filter((c) => c.query?.q === 'sar'),
    ).toHaveLength(0);
  });

  it('keeps status and role filters in the URL', async () => {
    const { here } = await renderApp('/admin/users');
    await screen.findByText('sara@example.com');

    fireEvent.change(screen.getByLabelText(users.statusFilter), {
      target: { value: 'suspended' },
    });
    await waitFor(() => expect(here()).toContain('status=suspended'));
    expect(await screen.findByText(users.emptyTitle)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(users.statusFilter), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText(users.roleFilter), {
      target: { value: 'admin' },
    });
    await waitFor(() => expect(here()).toContain('isAdmin=true'));
    expect(adminCalls('users:list').at(-1)?.query?.isAdmin).toBe('true');
  });

  it('pages with a range label and the page param', async () => {
    adminMock.users = Array.from({ length: 45 }, (_, i) => ({
      ...sara,
      id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
      email: `user${i}@example.com`,
    }));
    const { here } = await renderApp('/admin/users');
    expect(await screen.findByText('1–20')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: users.next }));
    expect(await screen.findByText('21–40')).toBeInTheDocument();
    expect(here()).toBe('/admin/users?page=2');
    expect(adminCalls('users:list').at(-1)?.query?.page).toBe('2');
  });

  it('moves focus to Previous when Next becomes disabled on the last page', async () => {
    adminMock.users = Array.from({ length: 45 }, (_, i) => ({
      ...sara,
      id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
      email: `user${i}@example.com`,
    }));
    await renderApp('/admin/users');
    await screen.findByText('1–20');

    const next = screen.getByRole('button', { name: users.next });
    next.focus();
    fireEvent.click(next);
    await screen.findByText('21–40');
    next.focus();
    fireEvent.click(next);
    await screen.findByText('41–45');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: users.prev })).toHaveFocus(),
    );
  });
});
