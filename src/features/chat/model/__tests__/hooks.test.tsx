import type { ReactNode } from 'react';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  chatCalls,
  chatMock,
  refusals,
  seedConversation,
  serverSeesDisconnect,
} from '~/mocks/chat';
import { isStreaming } from '../active-streams';
import { NEW_CHAT, useChatStore } from '../chat-store';
import { useMessageCost } from '../message-costs';
import {
  SETTLE_POLL_MS,
  useBalance,
  useConversations,
  useMessages,
  useSelectedMode,
} from '../useChatQueries';
import { useResumeRefresh } from '../useResumeRefresh';
import { useSendMessage } from '../useSendMessage';
import { cachedMessages, newQueryClient, useChatTestSetup } from './helpers';

useChatTestSetup();

const wrapper =
  (qc: QueryClient) =>
  ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );

describe('useSendMessage', () => {
  it('reports status through the send and returns to idle', async () => {
    const qc = newQueryClient();
    const conv = seedConversation({}, 0);
    chatMock.send = { kind: 'normal', delayMs: 30 };
    const { result } = renderHook(() => useSendMessage(conv.id), {
      wrapper: wrapper(qc),
    });
    expect(result.current.status).toBe('idle');
    expect(result.current.canSend).toBe(true);

    let done!: Promise<unknown>;
    act(() => {
      done = result.current.send('سؤال', 'fast');
    });
    await waitFor(() => expect(result.current.status).toBe('streaming'));
    expect(result.current.canSend).toBe(false);
    await act(async () => {
      await done;
    });
    expect(result.current.status).toBe('idle');
  });

  it('switching to another conversation does not abort the stream', async () => {
    const qc = newQueryClient();
    const a = seedConversation({}, 0);
    const b = seedConversation({}, 0);
    await qc.fetchInfiniteQuery(
      (await import('../queries')).messagesOptions(a.id),
    );
    chatMock.send = {
      kind: 'normal',
      deltas: ['1', '2', '3', '4'],
      delayMs: 30,
    };
    const { result, rerender, unmount } = renderHook(
      ({ id }) => useSendMessage(id),
      { wrapper: wrapper(qc), initialProps: { id: a.id } },
    );
    let outcome!: Promise<{ kind: string }>;
    act(() => {
      outcome = result.current.send('q', 'fast');
    });
    await waitFor(() => expect(isStreaming(a.id)).toBe(true));

    rerender({ id: b.id });
    expect(result.current.status).toBe('idle'); // B has no send
    unmount(); // e.g. navigating to another page

    await expect(outcome).resolves.toMatchObject({ kind: 'done' });
    expect(cachedMessages(qc, a.id)[0]).toMatchObject({
      status: 'complete',
      content: '1234',
    });
  });

  it('stop() aborts the send of its conversation', async () => {
    const qc = newQueryClient();
    const conv = seedConversation({}, 0);
    chatMock.send = { kind: 'hang' };
    const { result } = renderHook(() => useSendMessage(conv.id), {
      wrapper: wrapper(qc),
    });
    let outcome!: Promise<{ kind: string }>;
    act(() => {
      outcome = result.current.send('q', 'fast');
    });
    await waitFor(() => expect(result.current.status).toBe('streaming'));
    act(() => result.current.stop());
    serverSeesDisconnect();
    await expect(outcome).resolves.toMatchObject({ kind: 'stopped' });
  });

  it('a new chat follows its conversation from creation to started', async () => {
    const qc = newQueryClient();
    chatMock.send = { kind: 'normal', delayMs: 30 };
    const started: string[] = [];
    const { result } = renderHook(
      () => useSendMessage(NEW_CHAT, { onStarted: (id) => started.push(id) }),
      { wrapper: wrapper(qc) },
    );
    let outcome!: Promise<{ kind: string }>;
    act(() => {
      outcome = result.current.send('مرحبا', 'fast');
    });
    expect(result.current.pending).toEqual({
      content: 'مرحبا',
      modeKey: 'fast',
    });
    await waitFor(() => expect(started).toHaveLength(1));
    await act(async () => {
      await outcome;
    });
    expect(chatCalls('createConversation')).toHaveLength(1);
  });

  it('an unmounted page is not called back when its send starts later (the send keeps running)', async () => {
    const qc = newQueryClient();
    chatMock.send = { kind: 'normal', delayMs: 200 };
    const onStarted = vi.fn();
    const { result, unmount } = renderHook(
      () => useSendMessage(NEW_CHAT, { onStarted }),
      { wrapper: wrapper(qc) },
    );
    let outcome!: Promise<{ kind: string }>;
    act(() => {
      outcome = result.current.send('مرحبا', 'fast');
    });
    // Unmount before `started` (the slow mock keeps the send in flight). The
    // exact intermediate status depends on runner speed, so it is not asserted.
    unmount(); // the user opened another conversation before `started`
    await expect(outcome).resolves.toMatchObject({ kind: 'done' });
    expect(onStarted).not.toHaveBeenCalled();
  });

  it('an unmounted page is not called back on DUPLICATE_REQUEST of a new chat either', async () => {
    const qc = newQueryClient();
    chatMock.send = { kind: 'lost-response' };
    const onStarted = vi.fn();
    const { result, unmount } = renderHook(
      () => useSendMessage(NEW_CHAT, { onStarted }),
      { wrapper: wrapper(qc) },
    );
    await act(async () => {
      await result.current.send('مرحبا', 'fast');
    });
    expect(result.current.refusal?.code).toBe('NETWORK');
    chatMock.send = { kind: 'normal' };
    let retry!: Promise<{ kind: string }>;
    act(() => {
      retry = result.current.retry();
    });
    unmount();
    await expect(retry).resolves.toMatchObject({ kind: 'duplicate' });
    expect(onStarted).not.toHaveBeenCalled();
  });

  it('RATE_LIMITED counts down, disables Send, then clears itself', async () => {
    const qc = newQueryClient();
    const conv = seedConversation({}, 0);
    chatMock.send = {
      ...refusals.RATE_LIMITED,
      retryAfter: '1',
      data: { retryAfterSeconds: 1 },
    };
    // Only the countdown's clock is faked; MSW keeps real timeouts.
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
    try {
      const { result } = renderHook(() => useSendMessage(conv.id), {
        wrapper: wrapper(qc),
      });
      await act(async () => {
        await result.current.send('q', 'fast');
      });
      expect(result.current.refusal?.code).toBe('RATE_LIMITED');
      expect(result.current.rateLimitSeconds).toBe(1);
      expect(result.current.canSend).toBe(false);
      expect(useChatStore.getState().drafts[conv.id]).toBe('q');

      act(() => vi.advanceTimersByTime(900));
      expect(result.current.rateLimitSeconds).toBe(1);
      expect(result.current.canSend).toBe(false);

      act(() => vi.advanceTimersByTime(200));
      expect(result.current.rateLimitSeconds).toBe(0);
      expect(result.current.refusal).toBeUndefined();
      expect(useChatStore.getState().rateLimitedUntil).toBeNull();
      expect(result.current.canSend).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('retry() resends a network failure with the same clientRequestId', async () => {
    const qc = newQueryClient();
    const conv = seedConversation({}, 0);
    chatMock.send = { kind: 'network-error' };
    const { result } = renderHook(() => useSendMessage(conv.id), {
      wrapper: wrapper(qc),
    });
    await act(async () => {
      await result.current.send('q', 'fast');
    });
    expect(result.current.refusal?.code).toBe('NETWORK');
    chatMock.send = { kind: 'normal' };
    await act(async () => {
      await result.current.retry();
    });
    const [first, second] = chatCalls('sendMessage').map(
      (c) => (c.body as { clientRequestId: string }).clientRequestId,
    );
    expect(second).toBe(first);
    expect(result.current.refusal).toBeUndefined();
  });

  it('exposes the cost of an answer sent in this session', async () => {
    const qc = newQueryClient();
    const conv = seedConversation({}, 0);
    await qc.fetchInfiniteQuery(
      (await import('../queries')).messagesOptions(conv.id),
    );
    const { result } = renderHook(() => useSendMessage(conv.id), {
      wrapper: wrapper(qc),
    });
    await act(async () => {
      await result.current.send('q', 'fast');
    });
    const answerId = cachedMessages(qc, conv.id)[0]!.id;
    const cost = renderHook(() => useMessageCost(answerId));
    expect(cost.result.current).toBe('0.001470000');
  });
});

describe('useSelectedMode', () => {
  it('falls back from the pick to the conversation mode to the first mode, and only selects', async () => {
    const qc = newQueryClient();
    const { result } = renderHook(() => useSelectedMode('c1', 'professional'), {
      wrapper: wrapper(qc),
    });
    await waitFor(() => expect(result.current.modeKey).toBe('professional'));
    act(() => result.current.setMode('fast'));
    expect(result.current.modeKey).toBe('fast');
    act(() => useChatStore.getState().setMode('c1', 'retired'));
    expect(result.current.modeKey).toBe('professional');
    expect(chatCalls('sendMessage')).toHaveLength(0);
  });
});

describe('useMessages / useConversations', () => {
  it('shows messages oldest → newest and loads older pages', async () => {
    const qc = newQueryClient();
    const conv = seedConversation({}, 60); // two pages of 50
    const { result } = renderHook(() => useMessages(conv.id), {
      wrapper: wrapper(qc),
    });
    await waitFor(() => expect(result.current.messages).toHaveLength(50));
    expect(result.current.messages[0]?.sequence).toBe(11);
    expect(result.current.messages[49]?.sequence).toBe(60);
    expect(result.current.hasOlder).toBe(true);
    await act(async () => {
      await result.current.fetchOlder();
    });
    await waitFor(() =>
      expect(result.current.messages.map((m) => m.sequence)).toEqual(
        Array.from({ length: 60 }, (_, i) => i + 1),
      ),
    );
    expect(result.current.hasOlder).toBe(false);
  });

  it('flags a missing conversation as notFound', async () => {
    const qc = newQueryClient();
    const { result } = renderHook(
      () => useMessages('01a0edbf-0000-7000-8000-000000000000'),
      {
        wrapper: wrapper(qc),
      },
    );
    await waitFor(() => expect(result.current.notFound).toBe(true));
  });

  it('polls a message left streaming by an earlier visit until it settles, then reloads the balance', async () => {
    const qc = newQueryClient();
    const conv = seedConversation({}, 2);
    const answer = chatMock.messages[conv.id]![1]!;
    answer.status = 'streaming';
    const { result } = renderHook(
      () => ({ ...useMessages(conv.id), balanceUsd: useBalance().balanceUsd }),
      {
        wrapper: wrapper(qc),
      },
    );
    await waitFor(() => expect(result.current.messages).toHaveLength(2));
    await waitFor(() => expect(result.current.balanceUsd).toBeDefined());
    const balanceCalls = chatCalls('getBalance').length;

    answer.status = 'complete';
    await waitFor(
      () => expect(result.current.messages[1]?.status).toBe('complete'),
      { timeout: SETTLE_POLL_MS + 1500 },
    );
    // Settled without a stream in this tab: the charge is in the balance now.
    await waitFor(() =>
      expect(chatCalls('getBalance').length).toBe(balanceCalls + 1),
    );
    expect(result.current.balanceUsd).toBe('4.750000000');
  });

  it('pages the conversation list with the cursor', async () => {
    const qc = newQueryClient();
    for (let i = 0; i < 25; i++) {
      seedConversation({
        lastMessageAt: new Date(2026, 0, i + 1).toISOString(),
      });
    }
    const { result } = renderHook(() => useConversations(), {
      wrapper: wrapper(qc),
    });
    await waitFor(() => expect(result.current.conversations).toHaveLength(20));
    await act(async () => {
      await result.current.fetchNextPage();
    });
    await waitFor(() => expect(result.current.conversations).toHaveLength(25));
    expect(result.current.hasNextPage).toBe(false);
  });
});

describe('useResumeRefresh', () => {
  it('reloads the open conversation and the balance when the tab is visible again or the network returns', async () => {
    const qc = newQueryClient();
    const conv = seedConversation({}, 1);
    renderHook(
      () => {
        useMessages(conv.id);
        useResumeRefresh(conv.id);
      },
      { wrapper: wrapper(qc) },
    );
    await waitFor(() => expect(chatCalls('listMessages')).toHaveLength(1));

    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await waitFor(() => expect(chatCalls('listMessages')).toHaveLength(2));

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    await waitFor(() => expect(chatCalls('listMessages')).toHaveLength(3));
  });
});
