import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MessageDto } from '~/api/generated/types.gen';
import {
  getStream,
  isStreaming,
  moveStream,
  registerStream,
  stopStream,
  subscribeStreams,
  unregisterStream,
  updateStream,
} from '../active-streams';
import { pendingMessageId } from '../cache-updates';
import { useChatStore } from '../chat-store';
import { messageState } from '../message-state';

const entry = (controller = new AbortController()) => ({
  status: 'preparing' as const,
  abortController: controller,
  clientRequestId: 'r',
  content: 'c',
  modeKey: 'fast',
});

describe('active-streams registry', () => {
  afterEach(() => {
    ['a', 'b', 'new'].forEach((k) => {
      const s = getStream(k);
      if (s) unregisterStream(k, s.abortController);
    });
  });

  it('registers, updates, notifies and stops', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeStreams(listener);
    const e = entry();
    registerStream('a', e);
    updateStream('a', e.abortController, { status: 'streaming' });
    expect(getStream('a')?.status).toBe('streaming');
    expect(listener).toHaveBeenCalledTimes(2);
    expect(stopStream('a')).toBe(true);
    expect(e.abortController.signal.aborted).toBe(true);
    expect(stopStream('b')).toBe(false);
    unsubscribe();
  });

  it('ignores updates and removal from a different send', () => {
    const current = entry();
    registerStream('a', current);
    const stale = new AbortController();
    updateStream('a', stale, { status: 'streaming' });
    unregisterStream('a', stale);
    expect(getStream('a')?.status).toBe('preparing');
  });

  it('moves a new chat to its conversation id', () => {
    const e = entry();
    registerStream('new', e);
    moveStream('new', 'b', e.abortController);
    expect(isStreaming('new')).toBe(false);
    expect(isStreaming('b')).toBe(true);
  });
});

describe('chat store drafts', () => {
  afterEach(() => useChatStore.getState().reset());

  it('restores a draft without losing what was typed meanwhile', () => {
    const s = useChatStore.getState();
    s.restoreDraft('a', 'first');
    expect(useChatStore.getState().drafts.a).toBe('first');
    s.restoreDraft('a', 'first'); // no duplicate
    expect(useChatStore.getState().drafts.a).toBe('first');
    s.setDraft('b', 'typed later');
    s.restoreDraft('b', 'sent text');
    expect(useChatStore.getState().drafts.b).toBe('sent text\ntyped later');
  });
});

describe('messageState', () => {
  const base: MessageDto = {
    id: 'm',
    sequence: 2,
    role: 'assistant',
    content: 'x',
    status: 'complete',
    modeKey: 'fast',
    finishReason: 'stop',
    errorCode: null,
    createdAt: '2026-10-04T00:00:00.000Z',
    completedAt: null,
  };

  it.each([
    [{ status: 'streaming' }, 'streaming'],
    [{ status: 'complete' }, 'complete'],
    [{ status: 'partial', finishReason: 'length' }, 'cut'],
    [{ status: 'partial', finishReason: 'aborted' }, 'stopped'],
    [
      { status: 'partial', finishReason: 'other', errorCode: 'PROVIDER_ERROR' },
      'partial',
    ],
    [{ status: 'failed', errorCode: 'CONTENT_BLOCKED' }, 'failed'],
    [{ id: pendingMessageId('r'), role: 'user' }, 'pending'],
  ] as const)('%o → %s', (patch, state) => {
    expect(messageState({ ...base, ...patch } as MessageDto)).toBe(state);
  });
});
