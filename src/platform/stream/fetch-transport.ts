import type { ApiErrorResponseDto } from '~/api/generated/types.gen';
import { isApiError } from '~/api/errors';
import { auth, getAccessToken } from '~/lib/auth/client';
import { env } from '~/lib/env';
import {
  StreamApiError,
  StreamNetworkError,
  StreamProtocolError,
  isAbortError,
} from './errors';
import type {
  ChatSendRequest,
  ChatStreamTransport,
  StreamDecoder,
} from './types';

export interface FetchTransportOptions<TEvent> {
  decode: StreamDecoder<TEvent>;
  /** API origin without `/api/v1`. Defaults to `env.apiOrigin`. */
  baseUrl?: string;
  /** Same token source as the generated API client. */
  getToken?: () => Promise<string | undefined>;
  /** Refreshes the session after a 401; returns the new token, or undefined when the session is gone. */
  refreshToken?: () => Promise<string | undefined>;
  /** Called when the session cannot continue (refresh failed, account blocked). */
  signOut?: () => Promise<void>;
  fetch?: typeof fetch;
}

async function defaultRefresh(): Promise<string | undefined> {
  const { data } = await auth.refreshSession();
  return data.session?.access_token;
}

async function defaultSignOut(): Promise<void> {
  await auth.signOut({ scope: 'local' });
}

function abortError(signal: AbortSignal): unknown {
  return isAbortError(signal.reason)
    ? signal.reason
    : new DOMException('The send was stopped.', 'AbortError');
}

const isEventStream = (response: Response) =>
  (response.headers.get('content-type') ?? '')
    .toLowerCase()
    .startsWith('text/event-stream');

async function readApiError(response: Response): Promise<StreamApiError> {
  const body: unknown = await response.json().catch(() => null);
  if (!isApiError(body)) {
    throw new StreamProtocolError(
      `Unexpected ${response.status} response without an API error body`,
      response.status,
    );
  }
  return new StreamApiError(
    body as ApiErrorResponseDto,
    response.headers.get('retry-after'),
  );
}

/** Default web transport: `fetch` POST, response body read as a stream. */
export function createFetchChatTransport<TEvent>(
  options: FetchTransportOptions<TEvent>,
): ChatStreamTransport<TEvent> {
  const {
    decode,
    getToken = getAccessToken,
    refreshToken = defaultRefresh,
    signOut = defaultSignOut,
  } = options;

  async function post(
    request: ChatSendRequest,
    token: string | undefined,
    signal: AbortSignal,
  ): Promise<Response> {
    const doFetch = options.fetch ?? globalThis.fetch;
    const base = options.baseUrl ?? env.apiOrigin;
    const { conversationId, ...body } = request;
    try {
      return await doFetch(
        `${base}/api/v1/conversations/${encodeURIComponent(conversationId)}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
          signal,
          // Never served from or stored in a cache; each send is unique.
          cache: 'no-store',
        },
      );
    } catch (error) {
      if (signal.aborted) throw abortError(signal);
      throw new StreamNetworkError('request', error);
    }
  }

  /** Opens the stream; refreshes the token once on 401 before anything was streamed. */
  async function open(
    request: ChatSendRequest,
    signal: AbortSignal,
  ): Promise<Response> {
    let response = await post(request, await getToken(), signal);
    if (response.status === 401) {
      // A 401 is refused before the server reads the message, so sending it
      // again with the same clientRequestId is safe.
      const fresh = await refreshToken();
      if (!fresh) {
        await signOut();
        throw await readApiError(response);
      }
      response = await post(request, fresh, signal);
    }
    if (!response.ok) {
      const error = await readApiError(response);
      if (
        error.statusCode === 403 &&
        (error.code === 'ACCOUNT_SUSPENDED' || error.code === 'ACCOUNT_DELETED')
      ) {
        await signOut();
      }
      throw error;
    }
    if (!isEventStream(response) || !response.body) {
      await response.body?.cancel().catch(() => undefined);
      throw new StreamProtocolError(
        `Expected text/event-stream, got ${response.headers.get('content-type') ?? 'nothing'}`,
        response.status,
      );
    }
    return response;
  }

  return {
    async *send(request, signal) {
      if (signal.aborted) throw abortError(signal);
      const response = await open(request, signal);
      try {
        // Exactly one request per send: if the stream breaks, the caller
        // reloads the conversation instead of reconnecting.
        for await (const event of decode(response.body!)) {
          yield event;
        }
      } catch (error) {
        if (signal.aborted) throw abortError(signal);
        if (error instanceof StreamProtocolError) throw error;
        throw new StreamNetworkError('stream', error);
      }
    },
  };
}
