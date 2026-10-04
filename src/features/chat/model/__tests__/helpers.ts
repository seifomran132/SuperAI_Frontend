import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import { afterEach } from 'vitest';
import type {
  BalanceDto,
  ConversationPageDto,
  MessagePageDto,
} from '~/api/generated/types.gen';
import { setupApiClient } from '~/api/client';
import { createQueryClient } from '~/api/query-client';
import { resetChatMock } from '~/mocks/chat';
import { signInDirectly, useAuthMocks } from '~/test/render-app';
import { stopAllStreams } from '../active-streams';
import { useChatStore } from '../chat-store';
import { clearMessageCosts } from '../message-costs';
import {
  balanceKey,
  conversationListKey,
  conversationListOptions,
  messagesKey,
  messagesOptions,
} from '../queries';
import { beforeEach } from 'vitest';

/** MSW + signed-in session + clean chat state for every test of the file. */
export function useChatTestSetup() {
  useAuthMocks();
  beforeEach(async () => {
    resetChatMock();
    await signInDirectly();
  });
  afterEach(() => {
    stopAllStreams();
    useChatStore.getState().reset();
    clearMessageCosts();
  });
}

export function newQueryClient(): QueryClient {
  setupApiClient();
  return createQueryClient();
}

export async function loadConversation(qc: QueryClient, id: string) {
  await qc.fetchInfiniteQuery(conversationListOptions());
  await qc.fetchInfiniteQuery(messagesOptions(id));
}

export const cachedMessages = (qc: QueryClient, id: string) =>
  qc.getQueryData<InfiniteData<MessagePageDto>>(messagesKey(id))?.pages[0]
    ?.items ?? [];

export const cachedConversations = (qc: QueryClient) =>
  qc
    .getQueryData<InfiniteData<ConversationPageDto>>(conversationListKey())
    ?.pages.flatMap((p) => p.items) ?? [];

export const cachedBalance = (qc: QueryClient) =>
  qc.getQueryData<BalanceDto>(balanceKey())?.balanceUsd;

/** Writes cache updates on a timer instead of animation frames. */
export const timerFrames = (write: () => void) => {
  const id = setTimeout(write, 0);
  return () => clearTimeout(id);
};

export const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));
