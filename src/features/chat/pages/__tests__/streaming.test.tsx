import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ar from '~/i18n/ar.json';
import errorsAr from '~/i18n/errors.ar.json';
import {
  chatCalls,
  chatMock,
  seedConversation,
  serverSeesDisconnect,
} from '~/mocks/chat';
import { renderApp, useAuthMocks } from '~/test/render-app';
import { useChatStore } from '../../model/chat-store';
import {
  composer,
  readyComposer,
  sends,
  tick,
  type,
  typeAndSend,
  useChatTestState,
} from './support';

useAuthMocks();
useChatTestState();

const nav = () => screen.findByRole('navigation', { name: ar.shell.recent });

describe('new chat: first send', () => {
  it('creates the conversation, streams, then the URL is /chat/<id> and the sidebar lists it first', async () => {
    seedConversation({
      title: 'قديمة',
      lastMessageAt: '2026-01-01T00:00:00.000Z',
    });
    const { here } = await renderApp('/chat');
    await readyComposer();
    expect(chatCalls('createConversation')).toHaveLength(0);

    await typeAndSend('اكتب جملة قصيرة عن الطقس');

    await waitFor(() => expect(here()).toMatch(/^\/chat\/[\w-]+$/));
    expect(chatCalls('createConversation')).toHaveLength(1);
    expect(chatCalls('createConversation')[0]!.body).toEqual({
      modeKey: 'fast',
    });
    expect(sends()).toHaveLength(1);
    expect(await screen.findByText(/تعمل الباقات هكذا\./)).toBeInTheDocument();

    const list = within(await nav());
    await waitFor(() => {
      const links = list.getAllByRole('link');
      expect(links).toHaveLength(2);
      expect(links[0]).toHaveTextContent('اكتب جملة قصيرة عن الطقس');
      expect(links[1]).toHaveTextContent('قديمة');
    });
    expect(composer()).toHaveValue('');
  });
});

describe('streaming states', () => {
  it('preparing, then streaming with Stop, then done with the cost line and the balance chip updated without a request', async () => {
    chatMock.send = { kind: 'normal', delayMs: 150 };
    chatMock.balanceUsd = '4.750000000';
    await renderApp('/chat');
    await readyComposer();
    // No accessible handle for the chip: it is plain text in the header.
    const chip = () => document.querySelector('[data-slot=balance-chip]');
    await waitFor(() => expect(chip()).toHaveTextContent('4.75$'));
    const balanceRequests = chatCalls('getBalance').length;

    // What the server reports after the answer.
    chatMock.balanceUsd = '4.248530000';
    await typeAndSend('مرحبا');

    // The page remounts when a new chat gets its URL: query again, don't hold the node.
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: ar.chat.composer.stop }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: ar.chat.composer.send }),
      ).toBe(null);
    });
    await waitFor(() =>
      expect(document.querySelector('article[data-state=streaming]')).not.toBe(
        null,
      ),
    );

    const footer = await screen.findByText(/التكلفة/, undefined, {
      timeout: 4000,
    });
    expect(footer).toHaveTextContent('التكلفة 0.0015$ · الرصيد المتبقي 4.25$');
    // Money goes through <Money>: each amount sits in a <bdi>.
    expect(footer.querySelectorAll('bdi')).toHaveLength(2);
    expect(await screen.findByText(ar.chat.announce.done)).toHaveAttribute(
      'role',
      'status',
    );
    expect(
      screen.getByRole('button', { name: ar.chat.composer.send }),
    ).toBeInTheDocument();
    await waitFor(() => expect(chip()).toHaveTextContent('4.25$'));
    expect(chatCalls('getBalance')).toHaveLength(balanceRequests);
  });

  it('Stop during streaming leaves the partial answer with the cut note', async () => {
    chatMock.send = { kind: 'hang', deltas: ['بداية الإجابة'] };
    await renderApp('/chat');
    await readyComposer();
    await typeAndSend('سؤال طويل');
    expect(await screen.findByText(/بداية الإجابة/)).toBeInTheDocument();

    fireEvent.click(
      await screen.findByRole('button', { name: ar.chat.composer.stop }),
    );
    await act(async () => serverSeesDisconnect());

    expect(await screen.findByText(ar.chat.message.cut)).toBeInTheDocument();
    expect(screen.getByText(/بداية الإجابة/)).toBeInTheDocument();
    // Screen readers get a short result, never the streamed text.
    const announced = await screen.findByText(ar.chat.announce.stopped);
    expect(announced).toHaveAttribute('role', 'status');
    expect(
      await screen.findByRole('button', { name: ar.chat.composer.send }),
    ).toBeInTheDocument();
  });

  it('Stop before started puts the draft back and leaves no ghost message', async () => {
    chatMock.send = { kind: 'slow-start', delayMs: 400 };
    await renderApp('/chat');
    await readyComposer();
    await typeAndSend('لن تصل');

    expect(
      await screen.findByText(ar.chat.message.preparing),
    ).toBeInTheDocument();
    expect(composer()).toHaveValue('');
    fireEvent.click(
      await screen.findByRole('button', { name: ar.chat.composer.stop }),
    );

    await waitFor(() => expect(composer()).toHaveValue('لن تصل'));
    expect(screen.queryByText(ar.chat.message.preparing)).toBe(null);
    expect(
      await screen.findByRole('heading', { name: ar.chat.empty.title }),
    ).toBeInTheDocument();
    await act(async () => tick(500));
    // The user bubble is gone: the text exists only in the composer.
    expect(screen.getAllByText('لن تصل')).toHaveLength(1);
  });

  it('an error event shows the catalog text and Retry re-sends as a new message', async () => {
    chatMock.send = {
      kind: 'error-event',
      code: 'CONTENT_BLOCKED',
      deltas: [],
    };
    await renderApp('/chat');
    await readyComposer();
    await typeAndSend('سؤال');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(errorsAr.CONTENT_BLOCKED);
    expect(screen.queryByText(/CONTENT_BLOCKED/)).toBe(null);

    chatMock.send = { kind: 'normal' };
    fireEvent.click(
      screen.getByRole('button', { name: ar.chat.message.retry }),
    );
    expect(await screen.findByText(/تعمل الباقات هكذا\./)).toBeInTheDocument();
    expect(sends()).toHaveLength(2);
    const [first, second] = sends().map(
      (c) => c.body as { clientRequestId: string; content: string },
    );
    expect(second!.content).toBe(first!.content);
    expect(second!.clientRequestId).not.toBe(first!.clientRequestId);
  });

  it('a partial answer cut by length keeps the text and shows the note', async () => {
    chatMock.send = { kind: 'length', deltas: ['نص مقطوع'] };
    await renderApp('/chat');
    await readyComposer();
    await typeAndSend('اكتب كثيرًا');
    expect(await screen.findByText('نص مقطوع')).toBeInTheDocument();
    expect(await screen.findByText(ar.chat.message.cut)).toBeInTheDocument();
  });

  it('a partial answer from an error event keeps its text and shows the catalog reason', async () => {
    chatMock.send = {
      kind: 'error-event',
      code: 'PROVIDER_ERROR',
      deltas: ['بعض النص'],
    };
    await renderApp('/chat');
    await readyComposer();
    await typeAndSend('سؤال');
    expect(await screen.findByText('بعض النص')).toBeInTheDocument();
    expect(
      await screen.findByText(errorsAr.PROVIDER_ERROR),
    ).toBeInTheDocument();
  });
});

describe('switching conversation mid-stream', () => {
  it('keeps writing: the sidebar shows «يكتب…» and the full answer is there on return', async () => {
    const other = seedConversation({ title: 'أخرى' }, 2);
    chatMock.send = { kind: 'normal', delayMs: 250, deltas: ['أ', 'ب', 'ج'] };
    const first = seedConversation({ title: 'الأولى' }, 2);
    const { router } = await renderApp(`/chat/${first.id}`);
    await readyComposer();
    await screen.findByText('رسالة 1');

    await typeAndSend('سؤال جديد');
    await screen.findByRole('button', { name: ar.chat.composer.stop });

    await act(async () => {
      await router.navigate({
        to: '/chat/$conversationId',
        params: { conversationId: other.id },
      });
    });
    const list = within(await nav());
    expect(await list.findByText(ar.shell.writing)).toBeInTheDocument();
    // The other conversation is free to use.
    expect(
      screen.getByRole('button', {
        name: new RegExp(ar.chat.composer.modeMenu),
      }),
    ).toBeInTheDocument();

    await waitFor(() => expect(list.queryByText(ar.shell.writing)).toBe(null), {
      timeout: 4000,
    });
    await act(async () => {
      await router.navigate({
        to: '/chat/$conversationId',
        params: { conversationId: first.id },
      });
    });
    expect(await screen.findByText('أبج')).toBeInTheDocument();
    expect(screen.queryByText(ar.chat.message.cut)).toBe(null);
  });
});

describe('no plan', () => {
  it('shows the notice, keeps Send disabled and Enter creates no conversation', async () => {
    chatMock.subscription = 'none';
    await renderApp('/chat');
    expect(
      await screen.findByText(errorsAr.NO_ACTIVE_SUBSCRIPTION),
    ).toBeInTheDocument();
    await readyComposer();
    type('مرحبا');
    expect(
      screen.getByRole('button', { name: ar.chat.composer.send }),
    ).toBeDisabled();
    fireEvent.keyDown(composer(), { key: 'Enter' });
    await act(async () => tick(50));
    expect(chatCalls('createConversation')).toHaveLength(0);
    expect(sends()).toHaveLength(0);
    expect(composer()).toHaveValue('مرحبا');
    expect(useChatStore.getState().drafts.new).toBe('مرحبا');
  });
});
