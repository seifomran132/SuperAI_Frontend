import {
  conversationsControllerGetOptions,
  conversationsControllerGetQueryKey,
  conversationsControllerListInfiniteOptions,
  conversationsControllerListInfiniteQueryKey,
  conversationsControllerMessagesInfiniteOptions,
  conversationsControllerMessagesInfiniteQueryKey,
  meBalanceControllerBalanceOptions,
  meBalanceControllerBalanceQueryKey,
  modesControllerListOptions,
  modesControllerListQueryKey,
} from '~/api/generated/@tanstack/react-query.gen';

// One place for the query options and keys of chat data, so the hooks that
// read the cache and the stream that writes it always use the same keys.

export const CONVERSATIONS_PAGE_SIZE = 20;
export const MESSAGES_PAGE_SIZE = 50;

const listParams = { query: { limit: CONVERSATIONS_PAGE_SIZE } };
const messagesParams = (id: string) => ({
  path: { id },
  query: { limit: MESSAGES_PAGE_SIZE },
});

export const conversationListKey = () =>
  conversationsControllerListInfiniteQueryKey(listParams);
export const conversationKey = (id: string) =>
  conversationsControllerGetQueryKey({ path: { id } });
export const messagesKey = (id: string) =>
  conversationsControllerMessagesInfiniteQueryKey(messagesParams(id));
export const balanceKey = () => meBalanceControllerBalanceQueryKey();
export const modesKey = () => modesControllerListQueryKey();

/** `GET /conversations`, newest activity first, paged with `cursor`. */
export const conversationListOptions = () => ({
  ...conversationsControllerListInfiniteOptions(listParams),
  initialPageParam: {},
  getNextPageParam: (last: { nextCursor: string | null }) =>
    last.nextCursor ?? undefined,
});

/** `GET /conversations/{id}/messages`, newest first, older pages with `before`. */
export const messagesOptions = (id: string) => ({
  ...conversationsControllerMessagesInfiniteOptions(messagesParams(id)),
  initialPageParam: { path: { id } },
  getNextPageParam: (last: { nextBefore: number | null }) =>
    last.nextBefore ?? undefined,
});

export const conversationOptions = (id: string) =>
  conversationsControllerGetOptions({ path: { id } });

export const modesOptions = () => ({
  ...modesControllerListOptions(),
  // Mode availability changes rarely; refusals refetch it explicitly.
  staleTime: 5 * 60_000,
});

export const balanceOptions = () => meBalanceControllerBalanceOptions();
