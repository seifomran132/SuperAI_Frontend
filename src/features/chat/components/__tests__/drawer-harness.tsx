import { fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import ar from '~/i18n/ar.json';
import { chatMock, conversation, resetChatMock } from '~/mocks/chat';
import { signInDirectly, useAuthMocks } from '~/test/render-app';
import { stopAllStreams } from '../../model/active-streams';
import { useChatStore } from '../../model/chat-store';

/** Mocks, a signed-in user with two conversations, clean chat state. One call per file. */
export function useDrawerState() {
  useAuthMocks();
  beforeEach(async () => {
    resetChatMock();
    useChatStore.getState().reset();
    chatMock.conversations = [
      conversation({ title: 'خطة تسويق' }),
      conversation({ title: 'عقد الإيجار' }),
    ];
    await signInDirectly();
  });
  afterEach(() => {
    stopAllStreams();
    useChatStore.getState().reset();
  });
}

export const drawerQuery = () =>
  screen.queryByRole('dialog', { name: ar.shell.sidebarTitle });

/**
 * Clicks the menu button. The composer autofocuses and a Radix dialog opening
 * over it spins jsdom forever, so focus is dropped first, as a click would.
 * Giving the real menu button focus again on close also spins jsdom (the
 * Radix focus trap and jsdom fight over it), so `focus` is spied on instead:
 * `focusCalls()` says whether close handed focus back to the button.
 */
export async function openDrawer() {
  const trigger = await screen.findByRole('button', {
    name: ar.shell.openMenu,
  });
  (document.activeElement as HTMLElement | null)?.blur();
  fireEvent.click(trigger);
  const dialog = await screen.findByRole('dialog', {
    name: ar.shell.sidebarTitle,
  });
  const spy = vi.spyOn(trigger, 'focus').mockImplementation(() => {});
  return { trigger, dialog, focusCalls: () => spy.mock.calls.length };
}
