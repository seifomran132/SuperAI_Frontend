import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { auth } from '~/lib/auth/client';
import { authMock, defaultProfile } from '~/mocks/auth';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';

useAuthMocks();

const withoutName = () => {
  authMock.me = { kind: 'ok', profile: { ...defaultProfile, fullName: null } };
};
const meError = (status: number, code: string) => {
  authMock.me = { kind: 'error', status, code };
};
const hasSession = async () => (await auth.getSession()).data.session !== null;

describe('route guards', () => {
  it('sends a visitor without a session to /sign-in with the redirect', async () => {
    const { here } = await renderApp('/chat');
    await waitFor(() => expect(here()).toBe('/sign-in?redirect=%2Fchat'));
  });

  it('guards /complete-profile too', async () => {
    const { here } = await renderApp('/complete-profile');
    await waitFor(() =>
      expect(here()).toBe('/sign-in?redirect=%2Fcomplete-profile'),
    );
  });

  it('lets a signed-in user with a name reach /chat', async () => {
    await signInDirectly();
    const { here } = await renderApp('/chat');
    await waitFor(() =>
      expect(authMock.calls.some((c) => c.name === 'getMe')).toBe(true),
    );
    expect(here()).toBe('/chat');
  });

  it('sends a signed-in user without a name to /complete-profile', async () => {
    await signInDirectly();
    withoutName();
    const { here } = await renderApp('/chat');
    await waitFor(() => expect(here()).toBe('/complete-profile'));
  });

  it('sends a whitespace-only name to /complete-profile', async () => {
    await signInDirectly();
    authMock.me = {
      kind: 'ok',
      profile: { ...defaultProfile, fullName: '   ' },
    };
    const { here } = await renderApp('/chat');
    await waitFor(() => expect(here()).toBe('/complete-profile'));
  });

  it('leaves /complete-profile for /chat when the name already exists', async () => {
    await signInDirectly();
    const { here } = await renderApp('/complete-profile');
    await waitFor(() => expect(here()).toBe('/chat'));
  });

  it.each([
    ['ACCOUNT_SUSPENDED', 'suspended'],
    ['ACCOUNT_DELETED', 'deleted'],
  ])(
    '%s on /me signs the user out and shows /account-unavailable (%s)',
    async (code, reason) => {
      await signInDirectly();
      meError(403, code);
      const { here } = await renderApp('/chat');
      await waitFor(() =>
        expect(here()).toBe(`/account-unavailable?reason=${reason}`),
      );
      expect(await hasSession()).toBe(false);
    },
  );

  it('a dead session (401 and failed refresh) goes to /sign-in with the redirect', async () => {
    await signInDirectly();
    meError(401, 'INVALID_TOKEN');
    authMock.refresh = 'fail';
    const { here } = await renderApp('/chat');
    await waitFor(() => expect(here()).toMatch(/^\/sign-in\?redirect=/));
    expect(await hasSession()).toBe(false);
  });

  it('sends a signed-in user away from /sign-in', async () => {
    await signInDirectly();
    const { here } = await renderApp('/sign-in');
    await waitFor(() => expect(here()).toBe('/chat'));
  });

  it.each(['/sign-up', '/forgot-password'])(
    'sends a signed-in user away from %s',
    async (path) => {
      await signInDirectly();
      const { here } = await renderApp(path);
      await waitFor(() => expect(here()).toBe('/chat'));
    },
  );
});
