import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ar from '~/i18n/ar.json';
import { renderApp } from '~/test/render-app';
import { useChatStore } from '../../model/chat-store';
import { drawerQuery, openDrawer, useDrawerState } from './drawer-harness';

useDrawerState();

// One Radix dialog flow per file: reopening dialogs in one jsdom document hangs the run.
describe('mobile drawer: open and Escape', () => {
  it('opens with dialog semantics, then Escape closes it and focus returns to the menu button', async () => {
    await renderApp('/chat');
    expect(drawerQuery()).toBeNull();
    const { dialog, focusCalls } = await openDrawer();

    expect(dialog).toHaveAttribute('role', 'dialog');
    expect(dialog).toHaveAttribute('data-state', 'open');
    expect(useChatStore.getState().drawerOpen).toBe(true);
    expect(
      within(dialog).getByRole('button', { name: ar.shell.closeMenu }),
    ).toBeInTheDocument();
    expect(await within(dialog).findByText('خطة تسويق')).toBeInTheDocument();
    // No account menu on small screens, so sign-out is in the drawer.
    expect(
      within(dialog).getByRole('button', { name: ar.shell.signOut }),
    ).toBeInTheDocument();
    // The page behind a modal is hidden from assistive tech.
    expect(
      screen.queryByRole('button', { name: ar.shell.openMenu }),
    ).toBeNull();

    fireEvent.keyDown(dialog, { key: 'Escape' });
    await waitFor(() => expect(drawerQuery()).toBeNull());
    expect(useChatStore.getState().drawerOpen).toBe(false);
    expect(focusCalls()).toBe(1);
  });
});
