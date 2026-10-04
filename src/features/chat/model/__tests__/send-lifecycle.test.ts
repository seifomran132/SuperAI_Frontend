import { waitFor } from '@testing-library/react';
import { http, HttpResponse, delay } from 'msw';
import { beforeAll, describe, expect, it } from 'vitest';
import type { ConversationDto } from '~/api/generated/types.gen';
import { auth } from '~/lib/auth/client';
import { authMock } from '~/mocks/auth';
import {
  chatCalls,
  chatMock,
  conversation,
  refusals,
  seedConversation,
  serverSeesDisconnect,
} from '~/mocks/chat';
import { server } from '~/mocks/server';
import { getStream, isStreaming, stopStream } from '../active-streams';
import { isPendingMessage } from '../cache-updates';
import { NEW_CHAT, useChatStore } from '../chat-store';
import { getMessageCost } from '../message-costs';
import { messagesKey } from '../queries';
import { sendMessage, type SendDeps } from '../send-message';
import { installChatSessionReset, onChatAuthChange } from '../session-reset';
import type { ChatTransport } from '../transport';
import {
  cachedMessages,
  loadConversation,
  newQueryClient,
  tick,
  timerFrames,
  useChatTestSetup,
} from './helpers';

useChatTestSetup();
beforeAll(() => installChatSessionReset());

const deps: SendDeps = { scheduleFrame: timerFrames };
const store = () => useChatStore.getState();
const API = 'http://localhost:3000/api/v1';

/** A transport that never answers until aborted (the "preparing" phase). */
const silentTransport: ChatTransport = {
  // eslint-disable-next-line require-yield
  async *send(_request, signal) {
    await new Promise((_, reject) => {
      signal.addEventListener('abort', () =>
        reject(new DOMException('stopped', 'AbortError')),
      );
    });
  },
};

/** Creation that takes a while and ignores aborts (the response is already on its way). */
function slowCreate(created: ConversationDto[]) {
  return async () => {
    await tick(60);
    const conv = conversation({ modeKey: 'fast' });
    chatMock.conversations.push(conv);
    chatMock.messages[conv.id] = [];
    created.push(conv);
    return conv;
  };
}

/** Signs out the way the app does: the auth event resets chat, auth sync clears the cache. */
async function signOutDuring(qc: ReturnType<typeof newQueryClient>) {
  await auth.signOut({ scope: 'local' });
  qc.clear();
}

function expectNothingLeft(qc: ReturnType<typeof newQueryClient>) {
  expect(qc.getQueryCache().getAll()).toHaveLength(0);
  expect(store().drafts).toEqual({});
  expect(store().refusals).toEqual({});
  expect(store().newChatConversationId).toBeNull();
  expect(store().modes).toEqual({});
}

describe('Stop before the answer started', () => {
  it('while preparing: draft restored, no pending message, outcome stopped', async () => {
    const qc = newQueryClient();
    const conv = seedConversation({}, 0);
    await loadConversation(qc, conv.id);
    store().setDraft(conv.id, 'سؤال');
    const running = sendMessage(
      qc,
      { key: conv.id, content: 'سؤال', modeKey: 'fast' },
      { ...deps, transport: silentTransport },
    );
    await waitFor(() =>
      expect(cachedMessages(qc, conv.id).some(isPendingMessage)).toBe(true),
    );
    expect(store().drafts[conv.id]).toBeUndefined();

    stopStream(conv.id);
    expect(await running).toEqual({ kind: 'stopped', conversationId: conv.id });
    expect(cachedMessages(qc, conv.id).some(isPendingMessage)).toBe(false);
    expect(store().drafts[conv.id]).toBe('سؤال');
  });

  it('while preparing a new chat: the seeded conversation reloads without an observer', async () => {
    const qc = newQueryClient();
    store().setDraft(NEW_CHAT, 'مرحبا');
    const running = sendMessage(
      qc,
      { key: NEW_CHAT, content: 'مرحبا', modeKey: 'fast' },
      { ...deps, transport: silentTransport },
    );
    await waitFor(() =>
      expect(getStream(store().newChatConversationId ?? '-')).toBeDefined(),
    );
    const id = store().newChatConversationId!;
    const before = chatCalls('listMessages').length;
    stopStream(id);
    expect(await running).toEqual({ kind: 'stopped', conversationId: id });
    // The reload works even though the seeded page had no queryFn.
    await waitFor(() =>
      expect(chatCalls('listMessages').length).toBe(before + 1),
    );
    expect(qc.getQueryState(messagesKey(id))?.status).toBe('success');
    expect(cachedMessages(qc, id).some(isPendingMessage)).toBe(false);
    expect(store().drafts[NEW_CHAT]).toBe('مرحبا');
    expect(store().newChatConversationId).toBe(id);
  });

  it('while creating a new chat: the conversation is kept for the next Send, nothing is sent', async () => {
    const qc = newQueryClient();
    const created: ConversationDto[] = [];
    store().setDraft(NEW_CHAT, 'مرحبا');
    const running = sendMessage(
      qc,
      { key: NEW_CHAT, content: 'مرحبا', modeKey: 'fast' },
      { ...deps, createConversation: slowCreate(created) },
    );
    expect(getStream(NEW_CHAT)?.status).toBe('creating');
    stopStream(NEW_CHAT);
    const outcome = await running;

    expect(created).toHaveLength(1);
    expect(outcome).toEqual({
      kind: 'stopped',
      conversationId: created[0]!.id,
    });
    expect(store().newChatConversationId).toBe(created[0]!.id);
    expect(store().drafts[NEW_CHAT]).toBe('مرحبا');
    expect(chatCalls('sendMessage')).toHaveLength(0);
    expect(isStreaming(created[0]!.id)).toBe(false);
  });
});

describe('sign-out during a send writes nothing back', () => {
  it('while preparing', async () => {
    const qc = newQueryClient();
    const conv = seedConversation({}, 1);
    await loadConversation(qc, conv.id);
    store().setDraft(conv.id, 'سر');
    const running = sendMessage(
      qc,
      { key: conv.id, content: 'سر', modeKey: 'fast' },
      { ...deps, transport: silentTransport },
    );
    await waitFor(() =>
      expect(cachedMessages(qc, conv.id).some(isPendingMessage)).toBe(true),
    );
    await signOutDuring(qc);
    expect(await running).toEqual({ kind: 'ended' });
    await tick(30);
    expectNothingLeft(qc);
  });

  it('while creating the conversation (creation resolves after the reset)', async () => {
    const qc = newQueryClient();
    const created: ConversationDto[] = [];
    store().setDraft(NEW_CHAT, 'سر');
    const running = sendMessage(
      qc,
      { key: NEW_CHAT, content: 'سر', modeKey: 'fast' },
      { ...deps, createConversation: slowCreate(created) },
    );
    await signOutDuring(qc);
    expect(await running).toEqual({ kind: 'ended' });
    expect(created).toHaveLength(1);
    await tick(30);
    expectNothingLeft(qc);
    expect(chatCalls('sendMessage')).toHaveLength(0);
  });

  it('passes the end of the session to the creation request', async () => {
    const qc = newQueryClient();
    let seen: AbortSignal | undefined;
    const running = sendMessage(
      qc,
      { key: NEW_CHAT, content: 'x', modeKey: 'fast' },
      {
        ...deps,
        createConversation: (_mode, signal) => {
          seen = signal;
          return new Promise((_, reject) =>
            signal.addEventListener('abort', () =>
              reject(new DOMException('aborted', 'AbortError')),
            ),
          );
        },
      },
    );
    await signOutDuring(qc);
    expect(await running).toEqual({ kind: 'ended' });
    expect(seen?.aborted).toBe(true);
  });

  it('while streaming', async () => {
    const qc = newQueryClient();
    const conv = seedConversation({}, 0);
    await loadConversation(qc, conv.id);
    chatMock.send = { kind: 'hang', deltas: ['نص'] };
    const running = sendMessage(
      qc,
      { key: conv.id, content: 'q', modeKey: 'fast' },
      deps,
    );
    await waitFor(() => expect(getStream(conv.id)?.status).toBe('streaming'));
    await signOutDuring(qc);
    serverSeesDisconnect();
    expect(await running).toEqual({ kind: 'ended' });
    await tick(30);
    expectNothingLeft(qc);
  });

  it('when the transport itself signs out (401 and the refresh fails)', async () => {
    const qc = newQueryClient();
    const conv = seedConversation({}, 0);
    await loadConversation(qc, conv.id);
    authMock.refresh = 'fail';
    server.use(
      http.post(`${API}/conversations/:id/messages`, () =>
        HttpResponse.json(
          { statusCode: 401, code: 'INVALID_TOKEN', message: 'expired' },
          { status: 401 },
        ),
      ),
    );
    store().setDraft(conv.id, 'q');
    const running = sendMessage(
      qc,
      { key: conv.id, content: 'q', modeKey: 'fast' },
      deps,
    );
    // Auth sync clears the cache on the same SIGNED_OUT event.
    const unsubscribe = auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') qc.clear();
    });
    expect(await running).toEqual({ kind: 'ended' });
    unsubscribe.data.subscription.unsubscribe();
    await tick(30);
    expectNothingLeft(qc);
  });

  it('a different user in another tab resets chat state; a token refresh does not', async () => {
    const qc = newQueryClient();
    const conv = seedConversation({}, 0);
    await loadConversation(qc, conv.id);
    chatMock.send = { kind: 'hang' };
    onChatAuthChange('SIGNED_IN', 'user-a');
    store().setDraft('c1', 'draft of user A');
    const running = sendMessage(
      qc,
      { key: conv.id, content: 'q', modeKey: 'fast' },
      deps,
    );
    await waitFor(() => expect(getStream(conv.id)?.status).toBe('streaming'));

    expect(onChatAuthChange('TOKEN_REFRESHED', 'user-a')).toBe(false);
    expect(store().drafts.c1).toBe('draft of user A');

    expect(onChatAuthChange('SIGNED_IN', 'user-b')).toBe(true);
    qc.clear();
    serverSeesDisconnect();
    expect(await running).toEqual({ kind: 'ended' });
    await tick(30);
    expectNothingLeft(qc);
  });
});

describe('DUPLICATE_REQUEST on a new chat', () => {
  it('a retry that already landed finishes the new chat: navigates and frees the new-chat slot', async () => {
    const qc = newQueryClient();
    chatMock.send = { kind: 'lost-response' };
    const started: string[] = [];
    const first = await sendMessage(
      qc,
      { key: NEW_CHAT, content: 'مرحبا', modeKey: 'fast' },
      deps,
    );
    expect(first).toMatchObject({
      kind: 'refused',
      refusal: { code: 'NETWORK' },
    });
    const id = store().newChatConversationId!;
    const refusal = store().refusals[NEW_CHAT];
    if (refusal?.code !== 'NETWORK') throw new Error('expected NETWORK');

    chatMock.send = { kind: 'normal' };
    const retry = await sendMessage(
      qc,
      { key: NEW_CHAT, ...refusal.retry, onStarted: (c) => started.push(c) },
      deps,
    );
    expect(retry).toEqual({ kind: 'duplicate', conversationId: id });
    expect(started).toEqual([id]);
    expect(store().newChatConversationId).toBeNull();
    await waitFor(() =>
      expect(cachedMessages(qc, id).map((m) => m.content)).toEqual([
        'answer',
        'مرحبا',
      ]),
    );
  });
});

describe('concurrency and races', () => {
  it('two conversations stream at the same time without mixing', async () => {
    const qc = newQueryClient();
    const a = seedConversation({}, 0);
    const b = seedConversation({}, 0);
    await loadConversation(qc, a.id);
    await qc.fetchInfiniteQuery(
      (await import('../queries')).messagesOptions(b.id),
    );
    chatMock.send = { kind: 'normal', deltas: ['1', '2', '3'], delayMs: 25 };
    const ra = sendMessage(
      qc,
      { key: a.id, content: 'A', modeKey: 'fast' },
      deps,
    );
    const rb = sendMessage(
      qc,
      { key: b.id, content: 'B', modeKey: 'fast' },
      deps,
    );
    await waitFor(() => {
      expect(isStreaming(a.id)).toBe(true);
      expect(isStreaming(b.id)).toBe(true);
    });
    const [oa, ob] = await Promise.all([ra, rb]);
    expect(oa.kind).toBe('done');
    expect(ob.kind).toBe('done');
    expect(cachedMessages(qc, a.id).map((m) => m.content)).toEqual([
      '123',
      'A',
    ]);
    expect(cachedMessages(qc, b.id).map((m) => m.content)).toEqual([
      '123',
      'B',
    ]);
    const [ansA] = cachedMessages(qc, a.id);
    const [ansB] = cachedMessages(qc, b.id);
    expect(getMessageCost(ansA!.id)).toBe('0.001470000');
    expect(getMessageCost(ansB!.id)).toBe('0.001470000');
  });

  it('a slow refetch started mid-stream does not overwrite the final answer', async () => {
    const qc = newQueryClient();
    const conv = seedConversation({}, 0);
    await loadConversation(qc, conv.id);
    chatMock.send = { kind: 'normal', deltas: ['أ', 'ب', 'ج'], delayMs: 25 };
    const running = sendMessage(
      qc,
      { key: conv.id, content: 'q', modeKey: 'fast' },
      deps,
    );
    await waitFor(() => expect(getStream(conv.id)?.status).toBe('streaming'));

    // The server snapshot is taken now (answer still streaming) but arrives late.
    server.use(
      http.get(`${API}/conversations/:id/messages`, async () => {
        const snapshot = [...chatMock.messages[conv.id]!]
          .reverse()
          .map((m) => ({ ...m }));
        await delay(200);
        return HttpResponse.json({ items: snapshot, nextBefore: null });
      }),
    );
    void qc.refetchQueries({ queryKey: messagesKey(conv.id) });

    expect((await running).kind).toBe('done');
    await tick(300);
    expect(cachedMessages(qc, conv.id)[0]).toMatchObject({
      status: 'complete',
      content: 'أبج',
    });
  });
});

describe('drafts and the send lock', () => {
  it('a retry does not erase a draft the user edited meanwhile', async () => {
    const qc = newQueryClient();
    const conv = seedConversation({}, 0);
    await loadConversation(qc, conv.id);
    chatMock.send = { kind: 'network-error' };
    store().setDraft(conv.id, 'q');
    await sendMessage(
      qc,
      { key: conv.id, content: 'q', modeKey: 'fast' },
      deps,
    );
    const refusal = store().refusals[conv.id];
    if (refusal?.code !== 'NETWORK') throw new Error('expected NETWORK');

    store().setDraft(conv.id, 'q, edited');
    await sendMessage(qc, { key: conv.id, ...refusal.retry }, deps); // fails again
    expect(store().drafts[conv.id]).toBe('q, edited');

    chatMock.send = { kind: 'normal' };
    await sendMessage(qc, { key: conv.id, ...refusal.retry }, deps);
    expect(store().drafts[conv.id]).toBe('q, edited');
  });

  it('Send is free again as soon as a refusal is known, before its effects finish', async () => {
    const qc = newQueryClient();
    const conv = seedConversation({}, 0);
    await loadConversation(qc, conv.id);
    chatMock.send = refusals.MODE_NOT_AVAILABLE;
    server.use(
      http.get(`${API}/modes`, async () => {
        await delay(150);
        return HttpResponse.json(chatMock.modes);
      }),
    );
    const running = sendMessage(
      qc,
      { key: conv.id, content: 'q', modeKey: 'x' },
      deps,
    );
    await waitFor(() =>
      expect(store().refusals[conv.id]?.code).toBe('MODE_NOT_AVAILABLE'),
    );
    expect(isStreaming(conv.id)).toBe(false);
    await running;
  });
});
