import { within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ar from '~/i18n/ar.json';
import { authMock, defaultProfile } from '~/mocks/auth';
import { renderApp } from '~/test/render-app';
import { openDrawer, useDrawerState } from './drawer-harness';

useDrawerState();

// Below 1024px the header has no account menu, so the drawer carries the admin link.
describe('mobile drawer: admin link', () => {
  it('offers the admin panel to an admin', async () => {
    authMock.me = { kind: 'ok', profile: { ...defaultProfile, isAdmin: true } };
    await renderApp('/chat');
    const { dialog } = await openDrawer();
    expect(
      await within(dialog).findByRole('link', { name: ar.admin.entry }),
    ).toHaveAttribute('href', '/admin');
  });
});
