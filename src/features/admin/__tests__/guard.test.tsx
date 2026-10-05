import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import ar from '~/i18n/ar.json';
import { server } from '~/mocks/server';
import { resetAdminMock } from '~/mocks/admin';
import { authMock, defaultProfile } from '~/mocks/auth';
import { resetChatMock } from '~/mocks/chat';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';

useAuthMocks();
beforeEach(async () => {
  resetChatMock();
  resetAdminMock();
  await signInDirectly();
});

const asAdmin = (isAdmin: boolean) => {
  authMock.me = { kind: 'ok', profile: { ...defaultProfile, isAdmin } };
};

describe('admin guard', () => {
  it('shows not-found to a signed-in non-admin', async () => {
    asAdmin(false);
    const adminRequests: string[] = [];
    const onRequest = ({ request }: { request: Request }) => {
      if (new URL(request.url).pathname.includes('/admin/'))
        adminRequests.push(request.url);
    };
    server.events.on('request:start', onRequest);
    await renderApp('/admin/users');
    expect(await screen.findByText(ar.common.notFound)).toBeInTheDocument();
    expect(screen.queryByText(ar.admin.nav.panel)).not.toBeInTheDocument();
    server.events.removeListener('request:start', onRequest);
    expect(adminRequests).toEqual([]);
  });

  it('opens the users list for an admin and /admin goes there', async () => {
    asAdmin(true);
    const { here } = await renderApp('/admin');
    expect(await screen.findByText('sara@example.com')).toBeInTheDocument();
    expect(here()).toBe('/admin/users');
    expect(
      screen.getByRole('link', { name: ar.admin.nav.backToApp }),
    ).toHaveAttribute('href', '/chat');
  });
});
