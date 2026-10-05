import { fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '~/test/render-app';
import { useChatStore } from '../../model/chat-store';
import { drawerQuery, openDrawer, useDrawerState } from './drawer-harness';

useDrawerState();

describe('mobile drawer: backdrop', () => {
  it('closes when the backdrop is pressed', async () => {
    await renderApp('/chat');
    const { focusCalls } = await openDrawer();
    // The overlay is the dialog's sibling; Radix dismisses on a pointer down outside the content.
    // No accessible handle: the overlay is a decorative div next to the dialog.
    const overlay = document.querySelector<HTMLElement>('div.fixed.inset-0')!;
    fireEvent.pointerDown(overlay, { button: 0, pointerType: 'mouse' });
    fireEvent.click(overlay);
    await waitFor(() => expect(drawerQuery()).toBeNull());
    expect(useChatStore.getState().drawerOpen).toBe(false);
    expect(focusCalls()).toBe(1);
  });
});
