import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type {
  BalanceDto,
  ConversationDto,
  ConversationPageDto,
  MessageDto,
  MessagePageDto,
  ModeDto,
} from '~/api/generated/types.gen';
import {
  balanceKey,
  conversationKey,
  conversationListKey,
  messagesKey,
  messagesOptions,
  modesOptions,
} from './queries';

// Writes into the TanStack Query cache — the only copy of conversations,
// messages and the balance (F2_CHAT §3). Pages are newest first: pages[0] holds
// the latest messages, items[0] the newest one.

type MessagesData = InfiniteData<MessagePageDto, unknown>;
type ConversationsData = InfiniteData<ConversationPageDto, unknown>;

const PENDING_PREFIX = 'pending:';

/** The user's message shown while the send is preparing; replaced on `started`. */
export function pendingUserMessage(
  clientRequestId: string,
  content: string,
  modeKey: string,
  previous: MessageDto | undefined,
): MessageDto {
  const now = new Date().toISOString();
  return {
    id: `${PENDING_PREFIX}${clientRequestId}`,
    sequence: (previous?.sequence ?? 0) + 1,
    role: 'user',
    content,
    status: 'complete',
    modeKey,
    finishReason: 'stop',
    errorCode: null,
    createdAt: now,
    completedAt: now,
  };
}

export const isPendingMessage = (message: Pick<MessageDto, 'id'>) =>
  message.id.startsWith(PENDING_PREFIX);

export const pendingMessageId = (clientRequestId: string) =>
  `${PENDING_PREFIX}${clientRequestId}`;

export function getMessagesData(qc: QueryClient, conversationId: string) {
  return qc.getQueryData<MessagesData>(messagesKey(conversationId));
}

export function newestMessage(
  qc: QueryClient,
  conversationId: string,
): MessageDto | undefined {
  return getMessagesData(qc, conversationId)?.pages[0]?.items[0];
}

/**
 * Adds messages (newest first) at the newest end. Without cached data it seeds
 * a single page only when `seed` is set (a conversation known to be new);
 * otherwise it leaves the cache alone so older pages are not hidden.
 */
export function insertNewestMessages(
  qc: QueryClient,
  conversationId: string,
  messages: MessageDto[],
  { seed = false, replaceIds = [] as string[] } = {},
) {
  const drop = new Set([...replaceIds, ...messages.map((m) => m.id)]);
  qc.setQueryData<MessagesData>(messagesKey(conversationId), (old) => {
    if (!old || old.pages.length === 0) {
      return seed
        ? {
            pages: [{ items: messages, nextBefore: null }],
            pageParams: [{ path: { id: conversationId } }],
          }
        : old;
    }
    const pages = old.pages.map((page) => ({
      ...page,
      items: page.items.filter((m) => !drop.has(m.id)),
    }));
    const [first, ...rest] = pages;
    return {
      ...old,
      pages: [{ ...first!, items: [...messages, ...first!.items] }, ...rest],
    };
  });
}

export function updateMessage(
  qc: QueryClient,
  conversationId: string,
  messageId: string,
  update: (message: MessageDto) => MessageDto,
) {
  qc.setQueryData<MessagesData>(messagesKey(conversationId), (old) => {
    if (!old) return old;
    let changed = false;
    const pages = old.pages.map((page) => {
      if (!page.items.some((m) => m.id === messageId)) return page;
      changed = true;
      return {
        ...page,
        items: page.items.map((m) => (m.id === messageId ? update(m) : m)),
      };
    });
    return changed ? { ...old, pages } : old;
  });
}

export function removeMessage(
  qc: QueryClient,
  conversationId: string,
  messageId: string,
) {
  qc.setQueryData<MessagesData>(messagesKey(conversationId), (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.filter((m) => m.id !== messageId),
      })),
    };
  });
}

export function findConversation(
  qc: QueryClient,
  conversationId: string,
): ConversationDto | undefined {
  const single = qc.getQueryData<ConversationDto>(
    conversationKey(conversationId),
  );
  if (single) return single;
  const list = qc.getQueryData<ConversationsData>(conversationListKey());
  for (const page of list?.pages ?? []) {
    const found = page.items.find((c) => c.id === conversationId);
    if (found) return found;
  }
  return undefined;
}

/** Sets the conversation everywhere it is cached and moves it to the top of the list. */
export function upsertConversationAtTop(
  qc: QueryClient,
  conversation: ConversationDto,
) {
  qc.setQueryData<ConversationDto>(
    conversationKey(conversation.id),
    conversation,
  );
  qc.setQueryData<ConversationsData>(conversationListKey(), (old) => {
    if (!old || old.pages.length === 0) return old;
    const pages = old.pages.map((page) => ({
      ...page,
      items: page.items.filter((c) => c.id !== conversation.id),
    }));
    const [first, ...rest] = pages;
    return {
      ...old,
      pages: [{ ...first!, items: [conversation, ...first!.items] }, ...rest],
    };
  });
}

/** Balance from a `done`/`error` event: no extra request (API_CONTRACT §6.6). */
export function setBalance(qc: QueryClient, balanceUsd: string) {
  qc.setQueryData<BalanceDto>(balanceKey(), { balanceUsd });
}

/**
 * Rereads one conversation's messages even when no screen shows it: the user
 * may have switched away while its answer streamed, and the cache must not keep
 * a stale `streaming` message for when they come back. A shown conversation is
 * refetched by its observer; otherwise the full options are passed, because a
 * page seeded by a new chat has no queryFn of its own yet.
 */
export function refetchMessages(
  qc: QueryClient,
  conversationId: string,
): Promise<void> {
  const queryKey = messagesKey(conversationId);
  const query = qc.getQueryCache().find({ queryKey, exact: true });
  if (query && query.getObserversCount() > 0) {
    return qc.invalidateQueries({ queryKey, exact: true });
  }
  return qc
    .fetchInfiniteQuery({ ...messagesOptions(conversationId), staleTime: 0 })
    .then(
      () => undefined,
      () => undefined,
    );
}

export const refetchBalance = (qc: QueryClient) =>
  qc.invalidateQueries({ queryKey: balanceKey(), exact: true });

/** Reloads `/modes` (after MODE_NOT_AVAILABLE); undefined when it fails. */
export const refetchModes = (qc: QueryClient): Promise<ModeDto[] | undefined> =>
  qc.fetchQuery({ ...modesOptions(), staleTime: 0 }).catch(() => undefined);

/** Marks the list stale so the next visit reads the server's order and titles. */
export const markConversationListStale = (qc: QueryClient) =>
  qc.invalidateQueries({
    queryKey: conversationListKey(),
    refetchType: 'none',
  });
