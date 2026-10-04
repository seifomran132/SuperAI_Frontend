import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { auth } from '~/lib/auth/client';
import { authMock, callsTo } from '~/mocks/auth';
import {
  chatCalls,
  chatMock,
  refusals,
  resetChatMock,
  seedConversation,
  serverSeesDisconnect,
} from '~/mocks/chat';
import { server } from '~/mocks/server';
import { signInDirectly, useAuthMocks } from '~/test/render-app';
import {
  StreamApiError,
  StreamNetworkError,
  StreamProtocolError,
  createFetchChatTransport,
  type ChatSendRequest,
} from '..';

useAuthMocks();

const SEND_URL = 'http://localhost:3000/api/v1/conversations/:id/messages';

// A decoder independent of the chat feature: the raw text, chunk by chunk.
const transport = createFetchChatTransport<string>({
  async *decode(body) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return;
      yield decoder.decode(value, { stream: true });
    }
  },
});

async function run(
  request: ChatSendRequest,
  signal = new AbortController().signal,
) {
  let text = '';
  for await (const chunk of transport.send(request, signal)) text += chunk;
  return text;
}

let request: ChatSendRequest;

beforeEach(async () => {
  resetChatMock();
  await signInDirectly();
  const conv = seedConversation();
  request = {
    conversationId: conv.id,
    content: 'مرحبا',
    modeKey: 'fast',
    clientRequestId: crypto.randomUUID(),
  };
});

describe('fetch chat transport', () => {
  it('POSTs with the bearer token and Accept: text/event-stream, and reads the stream', async () => {
    let accept: string | null = null;
    server.events.on('request:start', ({ request: r }) => {
      if (r.method === 'POST' && r.url.endsWith('/messages'))
        accept = r.headers.get('accept');
    });
    const text = await run(request);
    expect(text).toContain('event: started');
    expect(text).toContain('event: done');
    const [call] = chatCalls('sendMessage');
    const { data } = await auth.getSession();
    expect(call?.authorization).toBe(`Bearer ${data.session?.access_token}`);
    expect(call?.body).toEqual({
      content: 'مرحبا',
      modeKey: 'fast',
      clientRequestId: request.clientRequestId,
    });
    expect(accept).toBe('text/event-stream');
    server.events.removeAllListeners();
  });

  it('throws a typed API error for a JSON refusal, keeping data and Retry-After', async () => {
    chatMock.send = refusals.RATE_LIMITED;
    const error = await run(request).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(StreamApiError);
    const apiError = error as StreamApiError;
    expect(apiError.statusCode).toBe(429);
    expect(apiError.code).toBe('RATE_LIMITED');
    expect(apiError.data).toEqual({ retryAfterSeconds: 42 });
    expect(apiError.retryAfter).toBe('42');
  });

  it('keeps INSUFFICIENT_BALANCE money as strings', async () => {
    chatMock.send = refusals.INSUFFICIENT_BALANCE;
    const error = (await run(request).catch(
      (e: unknown) => e,
    )) as StreamApiError;
    expect(error.data).toEqual(refusals.INSUFFICIENT_BALANCE.data);
    expect(typeof (error.data as { balanceUsd: unknown }).balanceUsd).toBe(
      'string',
    );
  });

  it('refreshes the token once on 401 and sends again with the new token', async () => {
    server.use(
      http.post(
        SEND_URL,
        () =>
          HttpResponse.json(
            { statusCode: 401, code: 'INVALID_TOKEN', message: 'expired' },
            { status: 401 },
          ),
        { once: true },
      ),
    );
    const text = await run(request);
    expect(text).toContain('event: done');
    expect(callsTo('token:refresh_token')).toHaveLength(1);
    expect(chatCalls('sendMessage')).toHaveLength(1); // the 401 hit the override
  });

  it('signs out when the refresh fails after a 401', async () => {
    authMock.refresh = 'fail';
    server.use(
      http.post(SEND_URL, () =>
        HttpResponse.json(
          { statusCode: 401, code: 'INVALID_TOKEN', message: 'expired' },
          { status: 401 },
        ),
      ),
    );
    const error = (await run(request).catch(
      (e: unknown) => e,
    )) as StreamApiError;
    expect(error).toBeInstanceOf(StreamApiError);
    expect(error.statusCode).toBe(401);
    expect((await auth.getSession()).data.session).toBeNull();
  });

  it('rejects a 200 that is not an event stream', async () => {
    chatMock.send = { kind: 'wrong-content-type' };
    await expect(run(request)).rejects.toBeInstanceOf(StreamProtocolError);
  });

  it('reports a failed request as a network error before the stream', async () => {
    chatMock.send = { kind: 'network-error' };
    const error = (await run(request).catch(
      (e: unknown) => e,
    )) as StreamNetworkError;
    expect(error).toBeInstanceOf(StreamNetworkError);
    expect(error.phase).toBe('request');
  });

  it('ends a dropped stream without a terminal event and never reconnects', async () => {
    chatMock.send = { kind: 'drop' };
    // Depending on the network stack a drop ends the body or errors it.
    const outcome = await run(request).then(
      (text) => ({ text, error: null }),
      (error: unknown) => ({ text: '', error }),
    );
    if (outcome.error) {
      expect(outcome.error).toBeInstanceOf(StreamNetworkError);
    } else {
      expect(outcome.text).toContain('event: started');
      expect(outcome.text).not.toContain('event: done');
    }
    await new Promise((r) => setTimeout(r, 50));
    expect(chatCalls('sendMessage')).toHaveLength(1);
  });

  it('reports a body that errors mid-stream as a stream-phase network error', async () => {
    let calls = 0;
    const broken = createFetchChatTransport<string>({
      baseUrl: 'http://api.test',
      getToken: async () => 'token',
      fetch: async () => {
        calls += 1;
        const body = new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('event: started\n'));
            controller.error(new TypeError('network connection lost'));
          },
        });
        return new Response(body, {
          headers: { 'Content-Type': 'text/event-stream' },
        });
      },
      async *decode(body) {
        const reader = body.getReader();
        for (;;) {
          const { done } = await reader.read();
          if (done) return;
          yield 'chunk';
        }
      },
    });
    const error = await (async () => {
      for await (const chunk of broken.send(
        request,
        new AbortController().signal,
      ))
        void chunk;
    })().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(StreamNetworkError);
    expect((error as StreamNetworkError).phase).toBe('stream');
    expect(calls).toBe(1);
  });

  it('stops with an AbortError when the signal aborts', async () => {
    chatMock.send = { kind: 'hang' };
    const controller = new AbortController();
    const pending = run(request, controller.signal);
    await new Promise((r) => setTimeout(r, 30));
    controller.abort();
    serverSeesDisconnect();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    expect(chatCalls('sendMessage')).toHaveLength(1);
  });

  it.each(['ACCOUNT_SUSPENDED', 'ACCOUNT_DELETED'])(
    'signs out on 403 %s and throws the typed error',
    async (code) => {
      server.use(
        http.post(SEND_URL, () =>
          HttpResponse.json(
            { statusCode: 403, code, message: 'blocked' },
            { status: 403 },
          ),
        ),
      );
      const error = (await run(request).catch(
        (e: unknown) => e,
      )) as StreamApiError;
      expect(error).toBeInstanceOf(StreamApiError);
      expect(error.code).toBe(code);
      expect((await auth.getSession()).data.session).toBeNull();
    },
  );

  it('keeps the session on other 403 refusals (PROFILE_INCOMPLETE)', async () => {
    chatMock.send = refusals.PROFILE_INCOMPLETE;
    const error = (await run(request).catch(
      (e: unknown) => e,
    )) as StreamApiError;
    expect(error.code).toBe('PROFILE_INCOMPLETE');
    expect((await auth.getSession()).data.session).not.toBeNull();
  });
});
