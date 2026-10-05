import { fireEvent, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ar from '~/i18n/ar.json';
import { renderApp } from '~/test/render-app';
import { useChatStore } from '../../model/chat-store';
import { drawerQuery, openDrawer, useDrawerState } from './drawer-harness';

useDrawerState();

describe('mobile drawer: close button', () => {
  it('closes from its labelled close button', async () => {
    await renderApp('/chat');
    const { dialog, focusCalls } = await openDrawer();
    fireEvent.click(
      within(dialog).getByRole('button', { name: ar.shell.closeMenu }),
    );
    await waitFor(() => expect(drawerQuery()).toBeNull());
    expect(useChatStore.getState().drawerOpen).toBe(false);
    expect(focusCalls()).toBe(1);
  });
});
