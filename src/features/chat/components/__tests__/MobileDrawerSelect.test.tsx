import { act, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '~/test/render-app';
import { useChatStore } from '../../model/chat-store';
import { drawerQuery, openDrawer, useDrawerState } from './drawer-harness';

useDrawerState();

describe('mobile drawer: choosing a conversation', () => {
  it('navigates to it, closes the drawer and returns focus to the menu button', async () => {
    const { here } = await renderApp('/chat');
    const { dialog, focusCalls } = await openDrawer();
    const link = await within(dialog).findByRole('link', {
      name: /عقد الإيجار/,
    });
    await act(async () => {
      fireEvent.click(link);
    });
    await waitFor(() => expect(here()).toMatch(/^\/chat\/.+/));
    await waitFor(() => expect(drawerQuery()).toBeNull());
    expect(useChatStore.getState().drawerOpen).toBe(false);
    expect(focusCalls()).toBe(1);
  });
});
