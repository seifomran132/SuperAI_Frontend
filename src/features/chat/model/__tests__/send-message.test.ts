import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  chatCalls,
  chatMock,
  refusals,
  seedConversation,
  serverSeesDisconnect,
  type Refuse,
} from '~/mocks/chat';
import { getStream, isStreaming, stopStream } from '../active-streams';
import { isPendingMessage } from '../cache-updates';
import { NEW_CHAT, useChatStore } from '../chat-store';
import { getMessageCost } from '../message-costs';
import { messageState } from '../message-state';
import { sendMessage, type SendOutcome } from '../send-message';
import {
  cachedBalance,
  cachedConversations,
  cachedMessages,
  loadConversation,
  newQueryClient,
  tick,
  timerFrames,
  useChatTestSetup,
} from './helpers';

useChatTestSetup();

const deps = { scheduleFrame: timerFrames };
const store = () => useChatStore.getState();

async function existing(count = 2) {
  const qc = newQueryClient();
  const older = seedConversation(
    { title: 'أقدم', lastMessageAt: '2026-01-01T00:00:00.000Z' },
    0,
  );
  const conv = seedConversation(
    { title: 'محادثة', lastMessageAt: '2026-01-02T00:00:00.000Z' },
    count,
  );
  void older;
  await loadConversation(qc, conv.id);
  return { qc, conv };
}

describe('sendMessage — stream into the cache', () => {
  it('writes started, deltas and done into the messages, list and balance caches', async () => {
    const { qc, conv } = await existing();
    chatMock.balanceUsd = '4.748530000';
    store().setDraft(conv.id, 'كيف تعمل الباقات؟');

    const outcome = await sendMessage(
      qc,
      { key: conv.id, content: 'كيف تعمل الباقات؟', modeKey: 'fast' },
      deps,
    );

    expect(outcome.kind).toBe('done');
    const [assistant, user, ...rest] = cachedMessages(qc, conv.id);
    expect(user).toMatchObject({ role: 'user', content: 'كيف تعمل الباقات؟' });
    expect(isPendingMessage(user!)).toBe(false);
    expect(assistant).toMatchObject({
      role: 'assistant',
      status: 'complete',
      content: 'تعمل الباقات هكذا.',
    });
    expect(rest).toHaveLength(2); // the older messages are kept
    // Money stays exact decimal strings.
    expect(cachedBalance(qc)).toBe('4.748530000');
    expect(getMessageCost(assistant!.id)).toBe('0.001470000');
    expect(cachedConversations(qc)[0]?.id).toBe(conv.id);
    expect(store().drafts[conv.id]).toBeUndefined();
    expect(isStreaming(conv.id)).toBe(false);
    expect(chatCalls('getBalance')).toHaveLength(0); // no extra balance request
  });

  it('shows the pending message, then the streaming answer growing delta by delta', async () => {
    const { qc, conv } = await existing(0);
    chatMock.send = {
      kind: 'normal',
      deltas: ['أ', 'ب', 'ج', 'د'],
      delayMs: 40,
    };
    const running = sendMessage(
      qc,
      { key: conv.id, content: 'سؤال', modeKey: 'fast' },
      deps,
    );

    await waitFor(() => expect(getStream(conv.id)?.status).toBe('streaming'));
    const [assistant, user] = cachedMessages(qc, conv.id);
    expect(user?.content).toBe('سؤال');
    expect(assistant?.status).toBe('streaming');
    await waitFor(() =>
      expect(cachedMessages(qc, conv.id)[0]?.content.length).toBeGreaterThan(1),
    );
    const partial = cachedMessages(qc, conv.id)[0]!.content;
    expect('أبجد'.startsWith(partial)).toBe(true);

    await running;
    expect(cachedMessages(qc, conv.id)[0]?.content).toBe('أبجد');
  });

  it('batches delta writes per frame', async () => {
    const { qc, conv } = await existing(0);
    chatMock.send = {
      kind: 'normal',
      deltas: Array.from({ length: 30 }, () => 'x'),
    };
    let scheduled = 0;
    const outcome = await sendMessage(
      qc,
      { key: conv.id, content: 'q', modeKey: 'fast' },
      {
        scheduleFrame: (write) => {
          scheduled += 1;
          const id = setTimeout(write, 1000);
          return () => clearTimeout(id);
        },
      },
    );
    expect(outcome.kind).toBe('done');
    expect(scheduled).toBe(1); // 30 deltas, one pending frame
    expect(cachedMessages(qc, conv.id)[0]?.content).toBe('x'.repeat(30));
  });

  it('applies an error event: final message, charged cost and balance', async () => {
    const { qc, conv } = await existing(0);
    chatMock.send = {
      kind: 'error-event',
      code: 'PROVIDER_TIMEOUT',
      deltas: ['بعض'],
    };
    chatMock.chargeUsd = '0.000000000';
    const outcome = await sendMessage(
      qc,
      { key: conv.id, content: 'q', modeKey: 'fast' },
      deps,
    );
    expect(outcome).toMatchObject({
      kind: 'failed',
      code: 'PROVIDER_TIMEOUT',
      chargeUsd: '0.000000000',
    });
    const [assistant] = cachedMessages(qc, conv.id);
    expect(assistant).toMatchObject({
      status: 'partial',
      errorCode: 'PROVIDER_TIMEOUT',
      content: 'بعض',
    });
    expect(messageState(assistant!)).toBe('partial');
    expect(getMessageCost(assistant!.id)).toBe('0.000000000');
    expect(cachedBalance(qc)).toBe(chatMock.balanceUsd);
  });

  it('marks a length-limited answer as cut', async () => {
    const { qc, conv } = await existing(0);
    chatMock.send = { kind: 'length' };
    const outcome = await sendMessage(
      qc,
      { key: conv.id, content: 'q', modeKey: 'fast' },
      deps,
    );
    expect(outcome.kind).toBe('done');
    const [assistant] = cachedMessages(qc, conv.id);
    expect(assistant).toMatchObject({
      status: 'partial',
      finishReason: 'length',
    });
    expect(messageState(assistant!)).toBe('cut');
  });

  it('uses a new clientRequestId for every send', async () => {
    const { qc, conv } = await existing(0);
    await sendMessage(
      qc,
      { key: conv.id, content: 'one', modeKey: 'fast' },
      deps,
    );
    await sendMessage(
      qc,
      { key: conv.id, content: 'two', modeKey: 'fast' },
      deps,
    );
    const ids = chatCalls('sendMessage').map(
      (c) => (c.body as { clientRequestId: string }).clientRequestId,
    );
    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });

  it('ignores a second send while one is running in the same conversation', async () => {
    const { qc, conv } = await existing(0);
    chatMock.send = { kind: 'normal', delayMs: 20 };
    const first = sendMessage(
      qc,
      { key: conv.id, content: 'a', modeKey: 'fast' },
      deps,
    );
    const second = await sendMessage(
      qc,
      { key: conv.id, content: 'b', modeKey: 'fast' },
      deps,
    );
    expect(second.kind).toBe('ignored');
    await first;
    expect(chatCalls('sendMessage')).toHaveLength(1);
  });
});

describe('sendMessage — stop and drops', () => {
  it('Stop aborts and reloads messages; the server keeps a partial answer', async () => {
    const { qc, conv } = await existing(0);
    chatMock.send = { kind: 'hang', deltas: ['نص ', 'جزئي'] };
    const running = sendMessage(
      qc,
      { key: conv.id, content: 'q', modeKey: 'fast' },
      deps,
    );
    await waitFor(() => expect(getStream(conv.id)?.status).toBe('streaming'));
    const before = chatCalls('listMessages').length;

    expect(stopStream(conv.id)).toBe(true);
    serverSeesDisconnect();
    const outcome = await running;

    expect(outcome.kind).toBe('stopped');
    expect(isStreaming(conv.id)).toBe(false);
    await waitFor(() =>
      expect(chatCalls('listMessages').length).toBeGreaterThan(before),
    );
    await waitFor(() =>
      expect(cachedMessages(qc, conv.id)[0]).toMatchObject({
        status: 'partial',
        finishReason: 'aborted',
      }),
    );
    expect(messageState(cachedMessages(qc, conv.id)[0]!)).toBe('stopped');
  });

  it('a dropped stream is reported as interrupted and reloads messages and balance, without resending', async () => {
    const { qc, conv } = await existing(0);
    chatMock.send = { kind: 'drop' };
    const listBefore = chatCalls('listMessages').length;
    const outcome = await sendMessage(
      qc,
      { key: conv.id, content: 'q', modeKey: 'fast' },
      deps,
    );
    expect(outcome.kind).toBe('interrupted');
    await waitFor(() =>
      expect(chatCalls('listMessages').length).toBeGreaterThan(listBefore),
    );
    expect(chatCalls('sendMessage')).toHaveLength(1);
    expect(store().refusals[conv.id]).toBeUndefined();
  });
});

describe('sendMessage — new chat', () => {
  it('creates the conversation first, once, and reports started', async () => {
    const qc = newQueryClient();
    await qc.fetchInfiniteQuery(
      (await import('../queries')).conversationListOptions(),
    );
    const started: string[] = [];
    const outcome = await sendMessage(
      qc,
      {
        key: NEW_CHAT,
        content: 'مرحبا',
        modeKey: 'professional',
        onStarted: (id) => started.push(id),
      },
      deps,
    );
    expect(outcome.kind).toBe('done');
    const created = chatCalls('createConversation');
    expect(created).toHaveLength(1);
    expect(created[0]?.body).toEqual({ modeKey: 'professional' });
    const id = (outcome as Extract<SendOutcome, { kind: 'done' }>)
      .conversationId;
    expect(started).toEqual([id]);
    expect(cachedMessages(qc, id).map((m) => m.role)).toEqual([
      'assistant',
      'user',
    ]);
    expect(cachedConversations(qc)[0]).toMatchObject({
      id,
      title: 'مرحبا',
      modeKey: 'professional',
    });
    expect(store().newChatConversationId).toBeNull();
    expect(store().modes[id]).toBe('professional');
  });

  it('reuses the created conversation after a refusal instead of creating another', async () => {
    const qc = newQueryClient();
    chatMock.send = refusals.NO_ACTIVE_SUBSCRIPTION;
    const first = await sendMessage(
      qc,
      { key: NEW_CHAT, content: 'a', modeKey: 'fast' },
      deps,
    );
    expect(first.kind).toBe('refused');
    expect(store().newChatConversationId).not.toBeNull();
    expect(store().drafts[NEW_CHAT]).toBe('a');

    chatMock.send = { kind: 'normal' };
    const second = await sendMessage(
      qc,
      { key: NEW_CHAT, content: 'a', modeKey: 'fast' },
      deps,
    );
    expect(second.kind).toBe('done');
    expect(chatCalls('createConversation')).toHaveLength(1);
  });

  it('a refused create (MODE_NOT_AVAILABLE) keeps the draft and sends nothing', async () => {
    const qc = newQueryClient();
    chatMock.create = refusals.MODE_NOT_AVAILABLE;
    const outcome = await sendMessage(
      qc,
      { key: NEW_CHAT, content: 'a', modeKey: 'gone' },
      deps,
    );
    expect(outcome).toMatchObject({
      kind: 'refused',
      refusal: { code: 'MODE_NOT_AVAILABLE' },
    });
    expect(chatCalls('sendMessage')).toHaveLength(0);
    expect(store().drafts[NEW_CHAT]).toBe('a');
    expect(store().modes[NEW_CHAT]).toBe('fast'); // first available mode selected
  });
});

describe('sendMessage — refusals before the stream (API_CONTRACT §6.2)', () => {
  const rows: [keyof typeof refusals, string][] = [
    ['VALIDATION_FAILED', 'VALIDATION_FAILED'],
    ['CONTEXT_TOO_LONG', 'CONTEXT_TOO_LONG'],
    ['PROFILE_INCOMPLETE', 'PROFILE_INCOMPLETE'],
    ['CONVERSATION_NOT_FOUND', 'CONVERSATION_NOT_FOUND'],
    ['MODE_NOT_AVAILABLE', 'MODE_NOT_AVAILABLE'],
    ['NO_ACTIVE_SUBSCRIPTION', 'NO_ACTIVE_SUBSCRIPTION'],
    ['INSUFFICIENT_BALANCE', 'INSUFFICIENT_BALANCE'],
    ['CONVERSATION_BUSY', 'CONVERSATION_BUSY'],
    ['RATE_LIMITED', 'RATE_LIMITED'],
  ];

  it.each(rows)(
    '%s → typed refusal, draft kept, nothing left in the cache',
    async (name, code) => {
      const { qc, conv } = await existing(2);
      chatMock.send = refusals[name] as Refuse;
      const outcome = await sendMessage(
        qc,
        { key: conv.id, content: 'نصّي', modeKey: 'fast' },
        deps,
      );
      expect(outcome).toMatchObject({ kind: 'refused', refusal: { code } });
      expect(store().refusals[conv.id]?.code).toBe(code);
      expect(store().drafts[conv.id]).toBe('نصّي');
      expect(cachedMessages(qc, conv.id).some(isPendingMessage)).toBe(false);
      expect(isStreaming(conv.id)).toBe(false);
      expect(chatCalls('sendMessage')).toHaveLength(1); // never resent automatically
    },
  );

  it('INSUFFICIENT_BALANCE exposes estimate, balance and alternatives as strings, and never switches or sends', async () => {
    const { qc, conv } = await existing(0);
    store().setMode(conv.id, 'professional');
    chatMock.send = refusals.INSUFFICIENT_BALANCE;
    const outcome = await sendMessage(
      qc,
      { key: conv.id, content: 'q', modeKey: 'professional' },
      deps,
    );
    expect(outcome).toMatchObject({
      kind: 'refused',
      refusal: {
        code: 'INSUFFICIENT_BALANCE',
        // The requested mode, so the notice can name it after a switch.
        modeKey: 'professional',
        estimatedCostUsd: '0.012000000',
        balanceUsd: '0.004000000',
        alternatives: [{ modeKey: 'fast', estimatedCostUsd: '0.003000000' }],
      },
    });
    await tick(20);
    expect(store().modes[conv.id]).toBe('professional');
    expect(chatCalls('sendMessage')).toHaveLength(1);
    expect(cachedBalance(qc)).toBe('0.004000000');
  });

  it('INSUFFICIENT_BALANCE with no alternatives → empty list (request-balance path)', async () => {
    const { qc, conv } = await existing(0);
    chatMock.send = {
      ...refusals.INSUFFICIENT_BALANCE,
      data: {
        estimatedCostUsd: '0.003000000',
        balanceUsd: '0.000000000',
        alternatives: [],
      },
    };
    const outcome = await sendMessage(
      qc,
      { key: conv.id, content: 'q', modeKey: 'fast' },
      deps,
    );
    expect(outcome).toMatchObject({
      refusal: { code: 'INSUFFICIENT_BALANCE', alternatives: [] },
    });
  });

  it('RATE_LIMITED takes the seconds from Retry-After and blocks sending until then', async () => {
    const { qc, conv } = await existing(0);
    chatMock.send = {
      ...refusals.RATE_LIMITED,
      retryAfter: '17',
      data: { retryAfterSeconds: 99 },
    };
    const before = Date.now();
    const outcome = await sendMessage(
      qc,
      { key: conv.id, content: 'q', modeKey: 'fast' },
      deps,
    );
    expect(outcome).toMatchObject({
      refusal: { code: 'RATE_LIMITED', retryAfterSeconds: 17 },
    });
    const until = store().rateLimitedUntil!;
    expect(until - before).toBeGreaterThanOrEqual(17_000);
    expect(until - before).toBeLessThan(18_000);
  });

  it('MODE_NOT_AVAILABLE reloads modes and selects the first available one', async () => {
    const { qc, conv } = await existing(0);
    store().setMode(conv.id, 'retired');
    chatMock.send = refusals.MODE_NOT_AVAILABLE;
    await sendMessage(
      qc,
      { key: conv.id, content: 'q', modeKey: 'retired' },
      deps,
    );
    expect(chatCalls('listModes')).toHaveLength(1);
    expect(store().modes[conv.id]).toBe('fast');
  });

  it('CONVERSATION_BUSY reloads the messages', async () => {
    const { qc, conv } = await existing(0);
    const before = chatCalls('listMessages').length;
    chatMock.send = refusals.CONVERSATION_BUSY;
    await sendMessage(
      qc,
      { key: conv.id, content: 'q', modeKey: 'fast' },
      deps,
    );
    await waitFor(() =>
      expect(chatCalls('listMessages').length).toBe(before + 1),
    );
  });

  it('VALIDATION_FAILED keeps the field details', async () => {
    const { qc, conv } = await existing(0);
    chatMock.send = refusals.VALIDATION_FAILED;
    const outcome = await sendMessage(
      qc,
      { key: conv.id, content: 'q', modeKey: 'fast' },
      deps,
    );
    expect(outcome).toMatchObject({
      refusal: { code: 'VALIDATION_FAILED', details: [{ field: 'content' }] },
    });
  });

  it('DUPLICATE_REQUEST reloads messages silently and does not resend', async () => {
    const { qc, conv } = await existing(0);
    chatMock.send = refusals.DUPLICATE_REQUEST;
    const before = chatCalls('listMessages').length;
    const outcome = await sendMessage(
      qc,
      { key: conv.id, content: 'q', modeKey: 'fast' },
      deps,
    );
    expect(outcome.kind).toBe('duplicate');
    expect(store().refusals[conv.id]).toBeUndefined();
    expect(store().drafts[conv.id]).toBeUndefined();
    await waitFor(() =>
      expect(chatCalls('listMessages').length).toBe(before + 1),
    );
    expect(chatCalls('sendMessage')).toHaveLength(1);
  });
});

describe('sendMessage — network failure before the stream', () => {
  it('offers a retry with the same clientRequestId; a landed first attempt comes back as DUPLICATE_REQUEST', async () => {
    const { qc, conv } = await existing(0);
    chatMock.send = { kind: 'lost-response' };
    const first = await sendMessage(
      qc,
      { key: conv.id, content: 'q', modeKey: 'fast' },
      deps,
    );
    expect(first).toMatchObject({
      kind: 'refused',
      refusal: { code: 'NETWORK' },
    });
    expect(store().drafts[conv.id]).toBe('q');
    const refusal = store().refusals[conv.id];
    if (refusal?.code !== 'NETWORK') throw new Error('expected NETWORK');

    chatMock.send = { kind: 'normal' };
    const retry = await sendMessage(
      qc,
      { key: conv.id, ...refusal.retry },
      deps,
    );
    expect(retry.kind).toBe('duplicate');
    const ids = chatCalls('sendMessage').map(
      (c) => (c.body as { clientRequestId: string }).clientRequestId,
    );
    expect(ids[0]).toBe(ids[1]);
    await waitFor(() =>
      expect(cachedMessages(qc, conv.id).map((m) => m.content)).toEqual([
        'answer',
        'q',
      ]),
    );
  });

  it('keeps the draft when the request fails outright', async () => {
    const { qc, conv } = await existing(0);
    chatMock.send = { kind: 'network-error' };
    const outcome = await sendMessage(
      qc,
      { key: conv.id, content: 'q', modeKey: 'fast' },
      deps,
    );
    expect(outcome).toMatchObject({
      kind: 'refused',
      refusal: { code: 'NETWORK' },
    });
    expect(store().drafts[conv.id]).toBe('q');
  });
});
