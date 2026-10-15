import { within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ar from '~/i18n/ar.json';
import { renderApp } from '~/test/render-app';
import { openDrawer, useDrawerState } from './drawer-harness';

useDrawerState();

describe('mobile drawer: admin link', () => {
  it('has no admin link for a regular user', async () => {
    await renderApp('/chat');
    const { dialog } = await openDrawer();
    await within(dialog).findByRole('link', { name: ar.shell.account });
    expect(
      within(dialog).queryByRole('link', { name: ar.admin.entry }),
    ).not.toBeInTheDocument();
  });
});
