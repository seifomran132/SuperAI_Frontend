import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import ar from '~/i18n/ar.json';
import errorsAr from '~/i18n/errors.ar.json';
import { chatMock, conversation, resetChatMock } from '~/mocks/chat';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';
import { stopAllStreams } from '../../model/active-streams';
import { useChatStore } from '../../model/chat-store';

useAuthMocks();

beforeEach(async () => {
  resetChatMock();
  useChatStore.getState().reset();
  await signInDirectly();
});
afterEach(() => {
  stopAllStreams();
  useChatStore.getState().reset();
});

describe('chat shell', () => {
  it('lists titled conversations and hides the ones without a title', async () => {
    chatMock.conversations = [
      conversation({ title: 'ملخص عقد الإيجار' }),
      conversation({ title: null }),
      conversation({ title: 'خطة تسويق' }),
    ];
    await renderApp('/chat');
    const nav = await screen.findByRole('navigation', {
      name: ar.shell.recent,
    });
    expect(
      await within(nav).findByText('ملخص عقد الإيجار'),
    ).toBeInTheDocument();
    expect(within(nav).getByText('خطة تسويق')).toBeInTheDocument();
    expect(within(nav).getAllByRole('link')).toHaveLength(2);
  });

  it('shows the empty list state', async () => {
    await renderApp('/chat');
    expect(
      await screen.findByText(ar.shell.list.emptyTitle),
    ).toBeInTheDocument();
  });

  it('puts the sidebar first in the DOM (right side in RTL)', async () => {
    await renderApp('/chat');
    const aside = await screen.findByRole('complementary', {
      name: ar.shell.sidebarTitle,
    });
    expect(aside.nextElementSibling?.tagName).not.toBe('ASIDE');
    expect(aside.parentElement?.firstElementChild).toBe(aside);
  });
});

describe('new chat', () => {
  it('shows the headline and chips that fill the composer without sending', async () => {
    await renderApp('/chat');
    expect(
      await screen.findByRole('heading', { name: ar.chat.empty.title }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: ar.chat.empty.chip1 }));
    expect(screen.getByLabelText(ar.chat.composer.label)).toHaveValue(
      ar.chat.empty.chip1,
    );
    expect(chatMock.calls.filter((c) => c.name === 'sendMessage')).toHaveLength(
      0,
    );
  });

  it('with an active plan, Send is enabled once there is text', async () => {
    await renderApp('/chat');
    const box = await screen.findByLabelText(ar.chat.composer.label);
    await screen.findByText(/سريع/);
    fireEvent.change(box, { target: { value: 'مرحبا' } });
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: ar.chat.composer.send }),
      ).toBeEnabled(),
    );
    expect(
      screen.queryByText(errorsAr.NO_ACTIVE_SUBSCRIPTION),
    ).not.toBeInTheDocument();
  });

  it('without a plan: shows the notice up front and disables Send', async () => {
    chatMock.subscription = 'none';
    await renderApp('/chat');
    expect(
      await screen.findByText(errorsAr.NO_ACTIVE_SUBSCRIPTION),
    ).toBeInTheDocument();
    const box = screen.getByLabelText(ar.chat.composer.label);
    fireEvent.change(box, { target: { value: 'مرحبا' } });
    expect(
      screen.getByRole('button', { name: ar.chat.composer.send }),
    ).toBeDisabled();
    fireEvent.click(
      screen.getByRole('button', { name: ar.chat.notice.contactUs }),
    );
    expect(
      await screen.findByRole('dialog', { name: ar.chat.requestBalance.title }),
    ).toBeInTheDocument();
    expect(
      chatMock.calls.filter((c) => c.name === 'createConversation'),
    ).toHaveLength(0);
  });
});

describe('open conversation', () => {
  it('shows the not-available state with a link to a new chat', async () => {
    await renderApp('/chat/does-not-exist');
    expect(
      await screen.findByText(errorsAr.CONVERSATION_NOT_FOUND),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: ar.chat.notFound.action }),
    ).toHaveAttribute('href', '/chat');
  });
});
