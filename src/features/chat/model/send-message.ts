import type { QueryClient } from '@tanstack/react-query';
import { isApiError } from '~/api/errors';
import type { ConversationDto, MessageDto } from '~/api/generated/types.gen';
import {
  StreamApiError,
  StreamNetworkError,
  isAbortError,
} from '~/platform/stream';
import {
  SESSION_ENDED,
  getStream,
  moveStream,
  registerStream,
  unregisterStream,
  updateStream,
} from './active-streams';
import {
  findConversation,
  insertNewestMessages,
  markConversationListStale,
  newestMessage,
  pendingMessageId,
  pendingUserMessage,
  refetchBalance,
  refetchMessages,
  refetchModes,
  removeMessage,
  setBalance,
  updateMessage,
  upsertConversationAtTop,
} from './cache-updates';
import { NEW_CHAT, useChatStore, type ConversationKey } from './chat-store';
import { recordMessageCost } from './message-costs';
import { conversationKey, messagesKey } from './queries';
import { toRefusal, unknownRefusal, type Refusal } from './refusals';
import type { StartedEvent, TerminalEvent } from './stream-events';
import {
  createConversation as defaultCreateConversation,
  defaultChatTransport,
  type ChatTransport,
} from './transport';

// Runs one send (API_CONTRACT §6) outside React, so it keeps going when the
// user switches conversations. Every event is written into the Query cache:
//   started     → pending user message replaced by `userMessage`, streaming
//                 `assistantMessage` added, conversation moved to the top
//   delta       → answer text, written at most once per animation frame
//   done/error  → final `message`, cost remembered, balance from `balanceUsd`
// Stop (abort) and a dropped stream reload the messages; nothing reconnects.
//
// Sign-out aborts every send with SESSION_ENDED. From then on a send writes
// nothing at all (store, cache, refetches): its continuations run after the
// reset and would otherwise put the previous user's data back.

export interface SendMessageInput {
  /** Conversation id, or NEW_CHAT to create the conversation first. */
  key: ConversationKey;
  content: string;
  modeKey: string;
  /** Only to retry the same send after a network failure; otherwise a new UUID. */
  clientRequestId?: string;
  /**
   * When the conversation holds the message: after `started`, or after
   * DUPLICATE_REQUEST on a retry. A new chat navigates to its conversation here.
   */
  onStarted?: (conversationId: string) => void;
}

export type SendOutcome =
  | {
      kind: 'done';
      conversationId: string;
      message: MessageDto;
      chargeUsd: string;
      balanceUsd: string;
    }
  | {
      /** `error` event: the answer failed or is partial; `code` from the event. */
      kind: 'failed';
      conversationId: string;
      code: string;
      message: MessageDto;
      chargeUsd: string;
      balanceUsd: string;
    }
  | { kind: 'refused'; conversationId: string | null; refusal: Refusal }
  /** DUPLICATE_REQUEST: it was already sent; messages were reloaded. */
  | { kind: 'duplicate'; conversationId: string }
  | { kind: 'stopped'; conversationId: string | null }
  /** The stream broke after `started`; messages were reloaded. */
  | { kind: 'interrupted'; conversationId: string }
  /** Signed out during the send; nothing was written. */
  | { kind: 'ended' }
  /** Nothing sent: empty text, or a send already running here. */
  | { kind: 'ignored' };

export interface SendDeps {
  transport?: ChatTransport;
  createConversation?: (
    modeKey: string,
    signal: AbortSignal,
  ) => Promise<ConversationDto>;
  /** Schedules a cache write; returns a cancel function. */
  scheduleFrame?: (write: () => void) => () => void;
  now?: () => number;
}

/** Next animation frame; a timer while the tab is hidden (frames pause there). */
export function scheduleAnimationFrame(write: () => void): () => void {
  if (
    typeof requestAnimationFrame === 'function' &&
    (typeof document === 'undefined' || document.visibilityState !== 'hidden')
  ) {
    const handle = requestAnimationFrame(() => write());
    return () => cancelAnimationFrame(handle);
  }
  const handle = setTimeout(write, 16);
  return () => clearTimeout(handle);
}

function frameWriter(
  write: () => void,
  schedule: (write: () => void) => () => void,
) {
  let cancel: (() => void) | null = null;
  return {
    request() {
      if (cancel) return;
      cancel = schedule(() => {
        cancel = null;
        write();
      });
    },
    flush() {
      if (!cancel) return;
      cancel();
      cancel = null;
      write();
    },
    cancel() {
      cancel?.();
      cancel = null;
    },
  };
}

const store = () => useChatStore.getState();

async function applyRefusalEffects(
  qc: QueryClient,
  key: ConversationKey,
  conversationId: string | null,
  refusal: Refusal,
  requestedMode: string,
  alive: () => boolean,
) {
  switch (refusal.code) {
    case 'MODE_NOT_AVAILABLE': {
      // Select the first available mode; the user still presses Send.
      const modes = await refetchModes(qc);
      if (!alive()) return;
      const selected = store().modes[key] ?? requestedMode;
      const first = modes?.[0];
      if (first && !modes.some((m) => m.key === selected)) {
        store().setMode(key, first.key);
      }
      break;
    }
    case 'CONVERSATION_BUSY':
      if (conversationId) void refetchMessages(qc, conversationId);
      break;
    case 'RATE_LIMITED':
      store().setRateLimitedUntil(refusal.retryAt);
      break;
    case 'INSUFFICIENT_BALANCE':
      // Same "spendable balance" as GET /me/balance; keeps the chip honest.
      if (refusal.balanceUsd !== null) setBalance(qc, refusal.balanceUsd);
      break;
    case 'CONVERSATION_NOT_FOUND':
      if (key === NEW_CHAT) store().setNewChatConversationId(null);
      break;
    default:
      break;
  }
}

export async function sendMessage(
  qc: QueryClient,
  input: SendMessageInput,
  deps: SendDeps = {},
): Promise<SendOutcome> {
  const {
    transport = defaultChatTransport,
    createConversation = defaultCreateConversation,
    scheduleFrame = scheduleAnimationFrame,
    now = Date.now,
  } = deps;
  const { key, content, modeKey } = input;
  const isNew = key === NEW_CHAT;

  if (content.trim() === '') return { kind: 'ignored' };
  let conversationId: string | null = isNew
    ? store().newChatConversationId
    : key;
  if (getStream(conversationId ?? NEW_CHAT) || (isNew && getStream(NEW_CHAT))) {
    return { kind: 'ignored' };
  }

  const clientRequestId = input.clientRequestId ?? crypto.randomUUID();
  const controller = new AbortController();
  /** False once the session ended: no write of any kind after that. */
  const alive = () => controller.signal.reason !== SESSION_ENDED;
  const ended = (): SendOutcome => ({ kind: 'ended' });

  let registryKey = conversationId ?? NEW_CHAT;
  registerStream(registryKey, {
    status: conversationId ? 'preparing' : 'creating',
    abortController: controller,
    clientRequestId,
    content,
    modeKey,
  });
  store().clearRefusal(key);
  // A retry may run while the user edits the restored draft: only clear the
  // draft if it is exactly what is being sent.
  const tookDraft = (store().drafts[key] ?? '') === content;
  if (tookDraft) store().clearDraft(key);
  const restoreDraft = () => {
    if (!alive()) return;
    // Put the text back if we took it, or if the composer is empty anyway;
    // never into a draft the user has changed since.
    if (tookDraft || (store().drafts[key] ?? '').trim() === '') {
      store().restoreDraft(key, content);
    }
  };

  const refuse = async (refusal: Refusal): Promise<SendOutcome> => {
    if (!alive()) return ended();
    restoreDraft();
    store().setRefusal(key, refusal);
    // The send is over: Send must not stay disabled while effects run.
    unregisterStream(registryKey, controller);
    await applyRefusalEffects(qc, key, conversationId, refusal, modeKey, alive);
    return { kind: 'refused', conversationId, refusal };
  };
  const networkRefusal = (): Refusal => ({
    code: 'NETWORK',
    retry: { content, modeKey, clientRequestId },
  });

  try {
    // 1. A new chat gets its conversation on the first Send only.
    if (!conversationId) {
      // Stop does not cancel the creation (so the conversation is not
      // orphaned on the server); only the end of the session does.
      const createAbort = new AbortController();
      controller.signal.addEventListener('abort', () => {
        if (!alive()) createAbort.abort();
      });
      let created: ConversationDto;
      try {
        created = await createConversation(modeKey, createAbort.signal);
      } catch (error) {
        if (!alive()) return ended();
        if (controller.signal.aborted) {
          restoreDraft();
          return { kind: 'stopped', conversationId: null };
        }
        if (isApiError(error)) {
          return await refuse(
            toRefusal(error, now(), modeKey) ?? unknownRefusal(error),
          );
        }
        return await refuse(networkRefusal());
      }
      if (!alive()) return ended();
      conversationId = created.id;
      store().setNewChatConversationId(created.id);
      qc.setQueryData(conversationKey(created.id), created);
      moveStream(NEW_CHAT, created.id, controller);
      registryKey = created.id;
      if (controller.signal.aborted) {
        // Stopped while creating: keep the conversation for the next Send.
        restoreDraft();
        return { kind: 'stopped', conversationId };
      }
      updateStream(registryKey, controller, { status: 'preparing' });
    }
    const id: string = conversationId;

    // 2. Show the user's message while the request is prepared.
    await qc.cancelQueries({ queryKey: messagesKey(id), exact: true });
    if (!alive()) return ended();
    const pendingId = pendingMessageId(clientRequestId);
    insertNewestMessages(
      qc,
      id,
      [
        pendingUserMessage(
          clientRequestId,
          content,
          modeKey,
          newestMessage(qc, id),
        ),
      ],
      { seed: isNew },
    );

    // 3. Stream.
    let started: StartedEvent['data'] | null = null;
    let terminal: TerminalEvent | null = null;
    let text = '';
    const frame = frameWriter(() => {
      if (!started || !alive()) return;
      updateMessage(qc, id, started.assistantMessage.id, (m) => ({
        ...m,
        content: text,
      }));
    }, scheduleFrame);

    try {
      for await (const event of transport.send(
        { conversationId: id, content, modeKey, clientRequestId },
        controller.signal,
      )) {
        if (!alive()) return ended();
        if (event.event === 'started') {
          if (started) continue; // exactly once by contract
          started = event.data;
          // Only a new conversation may be seeded from nothing; seeding an
          // uncached existing one would hide its older messages.
          if (!(await onStarted(qc, id, started, pendingId, isNew, alive))) {
            return ended();
          }
          updateStream(registryKey, controller, { status: 'streaming' });
          if (isNew) store().setNewChatConversationId(null);
          input.onStarted?.(id);
        } else if (event.event === 'delta') {
          if (!started) continue;
          text += event.data.text;
          frame.request();
        } else {
          frame.cancel();
          terminal = event;
          if (!(await onTerminal(qc, id, started, event, alive))) {
            return ended();
          }
          break; // the server closes the stream after the terminal event
        }
      }
    } catch (error) {
      if (!alive()) {
        frame.cancel();
        return ended();
      }
      frame.flush();
      if (controller.signal.aborted || isAbortError(error)) {
        // Stop: the server keeps a `partial` answer; read its final state.
        if (!started) {
          removeMessage(qc, id, pendingId);
          restoreDraft();
        }
        void refetchMessages(qc, id);
        void refetchBalance(qc);
        return { kind: 'stopped', conversationId: id };
      }
      if (!started) {
        removeMessage(qc, id, pendingId);
        if (error instanceof StreamApiError) {
          const refusal = toRefusal(error, now(), modeKey);
          if (!refusal) {
            // DUPLICATE_REQUEST: the first attempt reached the server, so the
            // conversation holds the message — as after `started`.
            void refetchMessages(qc, id);
            if (isNew) store().setNewChatConversationId(null);
            input.onStarted?.(id);
            return { kind: 'duplicate', conversationId: id };
          }
          return await refuse(refusal);
        }
        if (error instanceof StreamNetworkError) {
          // It may have reached the server; a retry with the same
          // clientRequestId is safe, and reloading shows if it landed.
          void refetchMessages(qc, id);
          return await refuse(networkRefusal());
        }
        return await refuse(unknownRefusal(error));
      }
      // Dropped mid-stream: no resume. Reload; the server settles the answer.
      void refetchMessages(qc, id);
      void refetchBalance(qc);
      return { kind: 'interrupted', conversationId: id };
    }

    if (!terminal) {
      if (!alive()) return ended();
      frame.flush();
      if (!started) {
        removeMessage(qc, id, pendingId);
        void refetchMessages(qc, id);
        return await refuse(networkRefusal());
      }
      void refetchMessages(qc, id);
      void refetchBalance(qc);
      return { kind: 'interrupted', conversationId: id };
    }
    return terminal.event === 'done'
      ? {
          kind: 'done',
          conversationId: id,
          message: terminal.data.message,
          chargeUsd: terminal.data.chargeUsd,
          balanceUsd: terminal.data.balanceUsd,
        }
      : {
          kind: 'failed',
          conversationId: id,
          code: terminal.data.code,
          message: terminal.data.message,
          chargeUsd: terminal.data.chargeUsd,
          balanceUsd: terminal.data.balanceUsd,
        };
  } finally {
    unregisterStream(registryKey, controller);
  }
}

/** Writes `started`; false when the session ended meanwhile (nothing written). */
async function onStarted(
  qc: QueryClient,
  id: string,
  data: StartedEvent['data'],
  pendingId: string,
  seed: boolean,
  alive: () => boolean,
): Promise<boolean> {
  // A refetch finishing now would overwrite the messages written below.
  await qc.cancelQueries({ queryKey: messagesKey(id), exact: true });
  if (!alive()) return false;
  insertNewestMessages(qc, id, [data.assistantMessage, data.userMessage], {
    seed,
    replaceIds: [pendingId],
  });
  const known = findConversation(qc, id);
  upsertConversationAtTop(qc, {
    id,
    title: data.conversation.title ?? known?.title ?? null,
    modeKey: data.modeKey,
    lastMessageAt: data.userMessage.createdAt,
    createdAt: known?.createdAt ?? data.userMessage.createdAt,
  });
  // The conversation remembers the last mode; so does the selector.
  useChatStore.getState().setMode(id, data.modeKey);
  return true;
}

/** Writes `done`/`error`; false when the session ended meanwhile (nothing written). */
async function onTerminal(
  qc: QueryClient,
  id: string,
  started: StartedEvent['data'] | null,
  event: TerminalEvent,
  alive: () => boolean,
): Promise<boolean> {
  const { message, chargeUsd, balanceUsd } = event.data;
  await qc.cancelQueries({ queryKey: messagesKey(id), exact: true });
  if (!alive()) return false;
  let found = false;
  updateMessage(qc, id, message.id, () => {
    found = true;
    return message;
  });
  if (!found || !started) void refetchMessages(qc, id);
  recordMessageCost(message.id, chargeUsd);
  setBalance(qc, balanceUsd);
  markConversationListStale(qc);
  return true;
}
