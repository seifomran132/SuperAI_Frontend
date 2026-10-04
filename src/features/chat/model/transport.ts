import { isApiError } from '~/api/errors';
import { conversationsControllerCreate } from '~/api/generated/sdk.gen';
import type { ConversationDto } from '~/api/generated/types.gen';
import { getAccessToken } from '~/lib/auth/client';
import {
  createFetchChatTransport,
  type ChatStreamTransport,
} from '~/platform/stream';
import { decodeChatStream, type ChatEvent } from './stream-events';

export type ChatTransport = ChatStreamTransport<ChatEvent>;

/** The web transport: fetch + ReadableStream, decoded into chat events. */
export const defaultChatTransport: ChatTransport = createFetchChatTransport({
  decode: decodeChatStream,
});

/**
 * `POST /conversations { modeKey }`. The API client refreshes the token on a
 * 401 but does not repeat the request, so one more try follows a refresh.
 */
export async function createConversation(
  modeKey: string,
  signal?: AbortSignal,
): Promise<ConversationDto> {
  const create = async () =>
    (
      await conversationsControllerCreate({
        body: { modeKey },
        signal,
        throwOnError: true,
      })
    ).data;
  try {
    return await create();
  } catch (error) {
    if (
      isApiError(error) &&
      error.statusCode === 401 &&
      !signal?.aborted &&
      (await getAccessToken())
    ) {
      return create();
    }
    throw error;
  }
}
