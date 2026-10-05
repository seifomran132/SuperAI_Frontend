import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect } from 'vitest';
import ar from '~/i18n/ar.json';
import { chatCalls, resetChatMock } from '~/mocks/chat';
import { signInDirectly } from '~/test/render-app';
import { stopAllStreams } from '../../model/active-streams';
import { useChatStore } from '../../model/chat-store';
import { clearMessageCosts } from '../../model/message-costs';

/** Clean mock server, store and registry around every test; signs in first. */
export function useChatTestState() {
  beforeEach(async () => {
    resetChatMock();
    useChatStore.getState().reset();
    clearMessageCosts();
    await signInDirectly();
  });
  afterEach(() => {
    stopAllStreams();
    useChatStore.getState().reset();
    clearMessageCosts();
  });
}

export const composer = () => screen.getByLabelText(ar.chat.composer.label);

/** Waits until the composer is usable (modes loaded, so a mode is selected). */
export async function readyComposer() {
  const box = await screen.findByLabelText(ar.chat.composer.label);
  await waitFor(() =>
    expect(
      screen.getByRole('button', {
        name: new RegExp(ar.chat.composer.modeMenu),
      }),
    ).toHaveTextContent('سريع'),
  );
  return box;
}

export function type(text: string) {
  fireEvent.change(composer(), { target: { value: text } });
}

export const sendButton = () =>
  screen.getByRole('button', { name: ar.chat.composer.send });

export async function typeAndSend(text: string) {
  type(text);
  await waitFor(() => expect(sendButton()).toBeEnabled());
  fireEvent.click(sendButton());
}

export const sends = () => chatCalls('sendMessage');

export const tick = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * A mouse click moves focus to the button first; fireEvent does not. With the
 * composer still focused, jsdom spins forever when a Radix dialog opens, so
 * take focus away the way a real click does.
 */
export function clickLikeUser(element: HTMLElement) {
  (document.activeElement as HTMLElement | null)?.blur();
  fireEvent.click(element);
}
