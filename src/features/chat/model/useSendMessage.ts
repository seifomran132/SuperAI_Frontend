import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getStreamsSnapshot,
  stopStream,
  subscribeStreams,
  type StreamStatus,
} from './active-streams';
import { NEW_CHAT, useChatStore, type ConversationKey } from './chat-store';
import type { Refusal } from './refusals';
import { sendMessage, type SendOutcome } from './send-message';

export type SendStatus = 'idle' | StreamStatus;

/** Whole seconds left until `deadline` (epoch ms), ticking once a second; 0 when passed or null. */
export function useSecondsUntil(deadline: number | null): number {
  const compute = useCallback(
    () =>
      deadline === null
        ? 0
        : Math.max(0, Math.ceil((deadline - Date.now()) / 1000)),
    [deadline],
  );
  const [seconds, setSeconds] = useState(compute);
  useEffect(() => {
    setSeconds(compute());
    if (deadline === null) return;
    // Counts against the deadline, so a throttled background tab stays right.
    const id = setInterval(() => {
      const left = compute();
      setSeconds(left);
      if (left === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [deadline, compute]);
  return seconds;
}

function registryKeyFor(key: ConversationKey) {
  return key === NEW_CHAT
    ? (useChatStore.getState().newChatConversationId ?? NEW_CHAT)
    : key;
}

/**
 * Sending in one conversation (or NEW_CHAT). A thin view over the
 * active-streams registry and the chat store: the send itself runs outside
 * React, so unmounting or switching conversations does not stop it.
 */
export function useSendMessage(
  key: ConversationKey,
  options: { onStarted?: (conversationId: string) => void } = {},
) {
  const qc = useQueryClient();
  const streams = useSyncExternalStore(
    subscribeStreams,
    getStreamsSnapshot,
    getStreamsSnapshot,
  );
  const newChatId = useChatStore((s) => s.newChatConversationId);
  const refusal: Refusal | undefined = useChatStore((s) => s.refusals[key]);
  const rateLimitedUntil = useChatStore((s) => s.rateLimitedUntil);
  const rateLimitSeconds = useSecondsUntil(rateLimitedUntil);

  const registryKey = key === NEW_CHAT ? (newChatId ?? NEW_CHAT) : key;
  const active =
    streams.get(registryKey) ??
    (key === NEW_CHAT ? streams.get(NEW_CHAT) : undefined);

  const onStarted = useRef(options.onStarted);
  useEffect(() => {
    onStarted.current = options.onStarted;
  });
  // An unmounted page must not navigate when its send starts later (the user
  // may have opened another conversation); the send itself keeps running.
  useEffect(
    () => () => {
      onStarted.current = undefined;
    },
    [],
  );

  // The countdown ended: the notice goes, Send is enabled again.
  useEffect(() => {
    if (rateLimitSeconds > 0) return;
    const store = useChatStore.getState();
    if (store.rateLimitedUntil !== null) store.setRateLimitedUntil(null);
    if (store.refusals[key]?.code === 'RATE_LIMITED') store.clearRefusal(key);
  }, [rateLimitSeconds, key]);

  const send = useCallback(
    (content: string, modeKey: string): Promise<SendOutcome> =>
      sendMessage(qc, {
        key,
        content,
        modeKey,
        onStarted: (id) => onStarted.current?.(id),
      }),
    [qc, key],
  );

  /** Resends after a network failure with the same clientRequestId (no double send). */
  const retry = useCallback((): Promise<SendOutcome> => {
    const last = useChatStore.getState().refusals[key];
    if (last?.code !== 'NETWORK') return Promise.resolve({ kind: 'ignored' });
    return sendMessage(qc, {
      key,
      ...last.retry,
      onStarted: (id) => onStarted.current?.(id),
    });
  }, [qc, key]);

  const stop = useCallback(() => {
    if (!stopStream(registryKeyFor(key)) && key === NEW_CHAT) {
      stopStream(NEW_CHAT);
    }
  }, [key]);

  const dismissRefusal = useCallback(
    () => useChatStore.getState().clearRefusal(key),
    [key],
  );

  const status: SendStatus = active?.status ?? 'idle';
  return {
    send,
    retry,
    stop,
    dismissRefusal,
    status,
    isBusy: active !== undefined,
    /** Text and mode of the send in progress (shown before `started` on a new chat). */
    pending: active
      ? { content: active.content, modeKey: active.modeKey }
      : null,
    refusal,
    /** Seconds until RATE_LIMITED ends; Send stays disabled while > 0. */
    rateLimitSeconds,
    canSend: active === undefined && rateLimitSeconds === 0,
    /** The conversation this key sends into (for NEW_CHAT: once created). */
    conversationId: key === NEW_CHAT ? newChatId : key,
  };
}
