import { attachmentsDownload } from '~/api/generated/sdk.gen';
import {
  attachmentsDownloadQueryKey,
  conversationsGetOptions,
  conversationsGetQueryKey,
  conversationsListInfiniteOptions,
  conversationsListInfiniteQueryKey,
  conversationsMessagesInfiniteOptions,
  conversationsMessagesInfiniteQueryKey,
  meBalanceBalanceOptions,
  meBalanceBalanceQueryKey,
  modesListOptions,
  modesListQueryKey,
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
  conversationsListInfiniteQueryKey(listParams);
export const conversationKey = (id: string) =>
  conversationsGetQueryKey({ path: { id } });
export const messagesKey = (id: string) =>
  conversationsMessagesInfiniteQueryKey(messagesParams(id));
export const balanceKey = () => meBalanceBalanceQueryKey();
export const modesKey = () => modesListQueryKey();

/** `GET /conversations`, newest activity first, paged with `cursor`. */
export const conversationListOptions = () => ({
  ...conversationsListInfiniteOptions(listParams),
  initialPageParam: {},
  getNextPageParam: (last: { nextCursor: string | null }) =>
    last.nextCursor ?? undefined,
});

/** `GET /conversations/{id}/messages`, newest first, older pages with `before`. */
export const messagesOptions = (id: string) => ({
  ...conversationsMessagesInfiniteOptions(messagesParams(id)),
  initialPageParam: { path: { id } },
  getNextPageParam: (last: { nextBefore: number | null }) =>
    last.nextBefore ?? undefined,
});

export const conversationOptions = (id: string) =>
  conversationsGetOptions({ path: { id } });

export const modesOptions = () => ({
  ...modesListOptions(),
  // Mode availability changes rarely; refusals refetch it explicitly.
  staleTime: 5 * 60_000,
});

export const balanceOptions = () => meBalanceBalanceOptions();

export const attachmentKey = (id: string) =>
  attachmentsDownloadQueryKey({ path: { id } });

/**
 * `GET /attachments/{id}` as a Blob. An `<img>` cannot send the bearer token,
 * so the image is fetched here and shown through an object URL (§8.3).
 * Images never change, so a cached one is never refetched.
 */
export const attachmentOptions = (id: string) => ({
  queryKey: attachmentKey(id),
  queryFn: async ({ signal }: { signal: AbortSignal }) =>
    (
      await attachmentsDownload({
        path: { id },
        parseAs: 'blob',
        signal,
        throwOnError: true,
      })
    ).data as Blob,
  staleTime: Infinity,
  gcTime: 10 * 60 * 1000,
});
