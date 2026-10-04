import { useEffect, useMemo, useRef } from 'react';
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { isApiError } from '~/api/errors';
import type { MessageDto, ModeDto } from '~/api/generated/types.gen';
import { isStreaming, useIsStreaming } from './active-streams';
import { refetchBalance } from './cache-updates';
import { NEW_CHAT, useChatStore, type ConversationKey } from './chat-store';
import {
  balanceOptions,
  conversationListOptions,
  conversationOptions,
  messagesOptions,
  modesOptions,
} from './queries';

/** How often a message left `streaming` by an earlier visit (or a stopped send) is re-read. */
export const SETTLE_POLL_MS = 2_000;

const isNotFound = (error: unknown) =>
  isApiError(error) && error.code === 'CONVERSATION_NOT_FOUND';

/** Retry once on 401/network (as the default), never on 404. */
const retryUnlessNotFound = (failureCount: number, error: unknown) => {
  if (failureCount >= 1 || isNotFound(error)) return false;
  return isApiError(error) ? error.statusCode === 401 : true;
};

/** Sidebar list: newest activity first; `fetchNextPage` loads older conversations. */
export function useConversations() {
  const query = useInfiniteQuery(conversationListOptions());
  const conversations = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  return { ...query, conversations };
}

/** One conversation; `notFound` for CONVERSATION_NOT_FOUND (show "not available", back to new chat). */
export function useConversation(id: string | null | undefined) {
  const query = useQuery({
    ...conversationOptions(id ?? ''),
    enabled: Boolean(id),
    retry: retryUnlessNotFound,
  });
  return { ...query, notFound: isNotFound(query.error) };
}

const hasStreamingMessage = (pages: { items: MessageDto[] }[] | undefined) =>
  pages?.some((page) => page.items.some((m) => m.status === 'streaming')) ??
  false;

/**
 * Messages of a conversation, `messages` oldest → newest for display;
 * `fetchNextPage` loads older ones (scroll up). A message left `streaming`
 * without a send in this tab is polled until it settles, then the balance is
 * reloaded once.
 */
export function useMessages(id: string | null | undefined) {
  const qc = useQueryClient();
  const localStream = useIsStreaming(id);
  const query = useInfiniteQuery({
    ...messagesOptions(id ?? ''),
    enabled: Boolean(id),
    retry: retryUnlessNotFound,
    // While this tab streams into the cache, a refetch would only race it.
    refetchOnWindowFocus: () => !(id && isStreaming(id)),
    // Coming back to a conversation mid-stream: the cache is already live.
    refetchOnMount: () => !(id && isStreaming(id)),
    refetchInterval: (q) =>
      id && !isStreaming(id) && hasStreamingMessage(q.state.data?.pages)
        ? SETTLE_POLL_MS
        : false,
  });

  const messages = useMemo(() => {
    const pages = query.data?.pages ?? [];
    const out: MessageDto[] = [];
    for (let p = pages.length - 1; p >= 0; p--) {
      const items = pages[p]!.items;
      for (let i = items.length - 1; i >= 0; i--) out.push(items[i]!);
    }
    return out;
  }, [query.data]);

  const polling = !localStream && hasStreamingMessage(query.data?.pages);
  const wasPolling = useRef(false);
  useEffect(() => {
    if (wasPolling.current && !polling && !localStream) {
      // An answer settled on the server without our stream: its charge is in the balance now.
      void refetchBalance(qc);
    }
    wasPolling.current = polling;
  }, [polling, localStream, qc]);

  return {
    ...query,
    messages,
    hasOlder: query.hasNextPage,
    fetchOlder: query.fetchNextPage,
    isFetchingOlder: query.isFetchingNextPage,
    notFound: isNotFound(query.error),
  };
}

/** Modes on the user's plan, with labels. Colour by position: `mode-{modePosition}`. */
export function useModes() {
  const query = useQuery(modesOptions());
  return { ...query, modes: query.data ?? [] };
}

/** 1-based position of a mode for the `mode-1`, `mode-2`, … palette; 0 when unknown. */
export const modePosition = (modes: ModeDto[], modeKey: string | null) =>
  modeKey ? modes.findIndex((m) => m.key === modeKey) + 1 : 0;

/** Spendable balance (decimal string). Updated from `done`/`error` without a refetch. */
export function useBalance() {
  const query = useQuery(balanceOptions());
  return { ...query, balanceUsd: query.data?.balanceUsd };
}

/**
 * The mode to send with: the one picked here, else the conversation's last
 * mode, else the new chat's choice, else the first available — always one the
 * plan offers. `setMode` only selects; it never sends.
 */
export function useSelectedMode(
  key: ConversationKey,
  conversationModeKey?: string | null,
) {
  const { modes } = useModes();
  const picked = useChatStore((s) => s.modes[key]);
  const newChatPick = useChatStore((s) => s.modes[NEW_CHAT]);
  const setStoreMode = useChatStore((s) => s.setMode);
  const offered = (k: string | null | undefined): k is string =>
    Boolean(k) && modes.some((m) => m.key === k);
  const modeKey =
    [picked, conversationModeKey, newChatPick].find(offered) ??
    modes[0]?.key ??
    null;
  return {
    modeKey,
    modes,
    setMode: (next: string) => setStoreMode(key, next),
  };
}
