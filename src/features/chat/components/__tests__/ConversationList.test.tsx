import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ar from '~/i18n/ar.json';
import { chatCalls, chatMock, conversation, resetChatMock } from '~/mocks/chat';
import { server } from '~/mocks/server';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';
import { stopAllStreams } from '../../model/active-streams';
import { useChatStore } from '../../model/chat-store';

useAuthMocks();

// jsdom has no IntersectionObserver: capture the callbacks so a test can scroll "to the end".
type Callback = (entries: { isIntersecting: boolean }[]) => void;
let observers: Callback[] = [];
const scrollToEnd = () =>
  observers.forEach((cb) => cb([{ isIntersecting: true }]));

beforeEach(async () => {
  observers = [];
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(cb: Callback) {
        observers.push(cb);
      }
      observe() {}
      disconnect() {}
    },
  );
  resetChatMock();
  useChatStore.getState().reset();
  await signInDirectly();
});
afterEach(() => {
  vi.unstubAllGlobals();
  stopAllStreams();
  useChatStore.getState().reset();
});

const API = 'http://localhost:3000/api/v1';
const nav = () => screen.findByRole('navigation', { name: ar.shell.recent });
const titled = (n: number) =>
  Array.from({ length: n }, (_, i) =>
    conversation({
      title: `محادثة ${i + 1}`,
      // Newest first: index 0 is the most recent.
      lastMessageAt: new Date(2026, 0, 1, 12, 0, 60 - i).toISOString(),
    }),
  );

describe('conversation list states', () => {
  it('shows a loading skeleton until the list arrives', async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    server.use(
      http.get(`${API}/conversations`, async () => {
        await gate;
        return HttpResponse.json({ items: [], nextCursor: null });
      }),
    );
    await renderApp('/chat');
    expect(
      await screen.findByRole('status', { name: ar.shell.list.loading }),
    ).toBeInTheDocument();
    release();
    expect(
      await screen.findByText(ar.shell.list.emptyTitle),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('status', { name: ar.shell.list.loading }),
    ).toBeNull();
  });

  it('shows the empty state with its hint', async () => {
    await renderApp('/chat');
    expect(
      await screen.findByText(ar.shell.list.emptyTitle),
    ).toBeInTheDocument();
    expect(screen.getByText(ar.shell.list.emptyBody)).toBeInTheDocument();
  });

  it('shows an error with retry that recovers', async () => {
    chatMock.conversations = [conversation({ title: 'خطة تسويق' })];
    server.use(
      http.get(
        `${API}/conversations`,
        () =>
          HttpResponse.json(
            { statusCode: 500, code: 'INTERNAL_ERROR', message: 'dev' },
            { status: 500 },
          ),
        { once: true },
      ),
    );
    await renderApp('/chat');
    expect(await screen.findByText(ar.shell.list.error)).toBeInTheDocument();

    const list = await nav();
    fireEvent.click(
      within(list).getByRole('button', { name: ar.common.retry }),
    );
    expect(await within(list).findByText('خطة تسويق')).toBeInTheDocument();
    expect(screen.queryByText(ar.shell.list.error)).toBeNull();
  });

  it('highlights only the open conversation', async () => {
    chatMock.conversations = titled(3);
    const open = chatMock.conversations[1]!;
    await renderApp(`/chat/${open.id}`);
    const list = await nav();
    const link = await within(list).findByRole('link', { name: /محادثة 2/ });
    await waitFor(() => expect(link).toHaveAttribute('aria-current', 'page'));
    expect(
      within(list)
        .getAllByRole('link')
        .filter((l) => l.getAttribute('aria-current') === 'page'),
    ).toHaveLength(1);
  });
});

describe('conversation list paging', () => {
  it('loads the next page by cursor when the end is reached', async () => {
    chatMock.conversations = titled(25);
    await renderApp('/chat');
    const list = await nav();
    await within(list).findByText('محادثة 1');
    expect(within(list).getAllByRole('link')).toHaveLength(20);
    expect(within(list).queryByText('محادثة 21')).toBeNull();

    await waitFor(() => expect(observers.length).toBeGreaterThan(0));
    scrollToEnd();

    expect(await within(list).findByText('محادثة 25')).toBeInTheDocument();
    expect(within(list).getAllByRole('link')).toHaveLength(25);
    expect(chatCalls('listConversations').map((c) => c.body)).toEqual([
      { limit: 20, offset: 0 },
      { limit: 20, offset: 20 },
    ]);

    // Last page: nothing left to observe or fetch.
    scrollToEnd();
    await new Promise((r) => setTimeout(r, 50));
    expect(chatCalls('listConversations')).toHaveLength(2);
  });

  it('keeps the loaded rows when the next page fails and retries it', async () => {
    chatMock.conversations = titled(25);
    await renderApp('/chat');
    const list = await nav();
    await within(list).findByText('محادثة 1');

    server.use(
      http.get(
        `${API}/conversations`,
        () =>
          HttpResponse.json(
            { statusCode: 500, code: 'INTERNAL_ERROR', message: 'dev' },
            { status: 500 },
          ),
        { once: true },
      ),
    );
    await waitFor(() => expect(observers.length).toBeGreaterThan(0));
    scrollToEnd();
    expect(
      await within(list).findByText(ar.shell.list.moreError),
    ).toBeVisible();
    expect(within(list).getAllByRole('link')).toHaveLength(20);

    fireEvent.click(
      within(list).getByRole('button', { name: ar.common.retry }),
    );
    expect(await within(list).findByText('محادثة 25')).toBeInTheDocument();
    expect(within(list).queryByText(ar.shell.list.moreError)).toBeNull();
  });
});
