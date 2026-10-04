import { http, HttpResponse } from 'msw';
import type {
  ConversationDto,
  MessageDto,
  ModeDto,
} from '~/api/generated/types.gen';
import { conversation, message, modeFast, modeProfessional } from './fixtures';

export * from './fixtures';

// Chat API handlers: conversations, messages, modes, balance and the SSE send
// stream (API_CONTRACT §5–§6). Behaviour is switched through `chatMock`
// (reset it in beforeEach) so a test states its scenario in one line. The mock
// keeps server state: a send saves messages, so a refetch shows the outcome.

const API = 'http://localhost:3000/api/v1';

export interface Refuse {
  kind: 'refuse';
  status: number;
  code: string;
  data?: Record<string, unknown>;
  details?: { field: string; errors: string[] }[];
  /** `Retry-After` header value. */
  retryAfter?: string;
}

export type SendScenario =
  /** started → deltas → done (complete/stop). */
  | { kind: 'normal'; deltas?: string[]; delayMs?: number }
  /** done with status partial, finishReason length. */
  | { kind: 'length'; deltas?: string[] }
  /** started → deltas → error event. */
  | { kind: 'error-event'; code?: string; deltas?: string[] }
  /** started → some deltas → connection breaks (no terminal event). */
  | { kind: 'drop'; deltas?: string[] }
  /** started → deltas, then waits until the client aborts. */
  | { kind: 'hang'; deltas?: string[] }
  /** The request never gets an answer (fetch rejects); nothing saved. */
  | { kind: 'network-error' }
  /** The server saved the message but the answer was lost (fetch rejects). */
  | { kind: 'lost-response' }
  /** A JSON error before the stream. */
  | Refuse
  /** 200 but not an event stream. */
  | { kind: 'wrong-content-type' }
  /** Nothing is saved or sent until `delayMs` passes (Stop before `started`); then a normal answer. */
  | { kind: 'slow-start'; delayMs?: number; deltas?: string[] };

export interface ChatMockState {
  modes: ModeDto[];
  balanceUsd: string;
  conversations: ConversationDto[];
  /** Per conversation, oldest first. */
  messages: Record<string, MessageDto[]>;
  send: SendScenario;
  /** `GET /me/subscription`: `none` = default plan, no subscription. */
  subscription: 'active' | 'none';
  /** Answer to `POST /conversations`. */
  create: { kind: 'ok' } | Refuse | { kind: 'network-error' };
  /** Split the stream into chunks of this many bytes (tests chunk boundaries). */
  chunkBytes: number | null;
  chargeUsd: string;
  /** clientRequestIds the server has seen (DUPLICATE_REQUEST on reuse). */
  seenRequestIds: Map<
    string,
    { userMessageId: string; assistantMessageId: string }
  >;
  /** Every request the handlers saw, for assertions. */
  calls: { name: string; body: unknown; authorization?: string | null }[];
}

const initial = (): ChatMockState => ({
  modes: [modeFast, modeProfessional],
  balanceUsd: '4.750000000',
  conversations: [],
  messages: {},
  send: { kind: 'normal' },
  subscription: 'active',
  create: { kind: 'ok' },
  chunkBytes: null,
  chargeUsd: '0.001470000',
  seenRequestIds: new Map(),
  calls: [],
});

export const chatMock: ChatMockState = initial();

export function resetChatMock() {
  Object.assign(chatMock, initial());
  openStreams.clear();
}

export const chatCalls = (name: string) =>
  chatMock.calls.filter((c) => c.name === name);

/** Ready-made refusals for every row of API_CONTRACT §6.2. */
export const refusals = {
  VALIDATION_FAILED: {
    kind: 'refuse',
    status: 400,
    code: 'VALIDATION_FAILED',
    details: [{ field: 'content', errors: ['content is empty or too long'] }],
  },
  CONTEXT_TOO_LONG: { kind: 'refuse', status: 400, code: 'CONTEXT_TOO_LONG' },
  PROFILE_INCOMPLETE: {
    kind: 'refuse',
    status: 403,
    code: 'PROFILE_INCOMPLETE',
  },
  CONVERSATION_NOT_FOUND: {
    kind: 'refuse',
    status: 404,
    code: 'CONVERSATION_NOT_FOUND',
  },
  MODE_NOT_AVAILABLE: {
    kind: 'refuse',
    status: 409,
    code: 'MODE_NOT_AVAILABLE',
  },
  NO_ACTIVE_SUBSCRIPTION: {
    kind: 'refuse',
    status: 409,
    code: 'NO_ACTIVE_SUBSCRIPTION',
  },
  INSUFFICIENT_BALANCE: {
    kind: 'refuse',
    status: 409,
    code: 'INSUFFICIENT_BALANCE',
    data: {
      estimatedCostUsd: '0.012000000',
      balanceUsd: '0.004000000',
      alternatives: [{ modeKey: 'fast', estimatedCostUsd: '0.003000000' }],
    },
  },
  CONVERSATION_BUSY: { kind: 'refuse', status: 409, code: 'CONVERSATION_BUSY' },
  DUPLICATE_REQUEST: {
    kind: 'refuse',
    status: 409,
    code: 'DUPLICATE_REQUEST',
    data: { userMessageId: 'u', assistantMessageId: 'a' },
  },
  RATE_LIMITED: {
    kind: 'refuse',
    status: 429,
    code: 'RATE_LIMITED',
    data: { retryAfterSeconds: 42 },
    retryAfter: '42',
  },
} satisfies Record<string, Refuse>;

function apiError(r: Refuse) {
  return HttpResponse.json(
    {
      statusCode: r.status,
      code: r.code,
      message: 'dev message',
      ...(r.details ? { details: r.details } : {}),
      ...(r.data ? { data: r.data } : {}),
    },
    {
      status: r.status,
      headers: r.retryAfter ? { 'Retry-After': r.retryAfter } : undefined,
    },
  );
}

const sseEvent = (event: string, data: unknown) =>
  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// MSW's Node interceptor does not tell the handler when the client aborts, so
// a test plays the server's side of Stop explicitly (see `serverSeesDisconnect`).
const openStreams = new Set<() => void>();

/** The server notices the client left: open answers are kept as `partial` / `aborted`. */
export function serverSeesDisconnect() {
  openStreams.forEach((gone) => gone());
  openStreams.clear();
}

function messagesOf(conversationId: string) {
  return (chatMock.messages[conversationId] ??= []);
}

function settle(m: MessageDto, patch: Partial<MessageDto>) {
  Object.assign(m, { completedAt: new Date().toISOString(), ...patch });
}

/** Saves the user + streaming assistant messages, as the server does before `started`. */
function saveTurn(conv: ConversationDto, content: string, modeKey: string) {
  const list = messagesOf(conv.id);
  const last = list[list.length - 1]?.sequence ?? 0;
  const user = message({ sequence: last + 1, role: 'user', content, modeKey });
  const assistant = message({
    sequence: last + 2,
    role: 'assistant',
    content: '',
    modeKey,
    status: 'streaming',
    completedAt: null,
  });
  list.push(user, assistant);
  conv.title ??= content.slice(0, 40);
  conv.modeKey = modeKey;
  conv.lastMessageAt = user.createdAt;
  return { user, assistant };
}

function streamResponse(
  conv: ConversationDto,
  turn: { user: MessageDto; assistant: MessageDto },
  modeKey: string,
  scenario: Exclude<
    SendScenario,
    | Refuse
    | {
        kind:
          | 'network-error'
          | 'lost-response'
          | 'wrong-content-type'
          | 'slow-start';
      }
  >,
  clientSignal: AbortSignal,
) {
  const encoder = new TextEncoder();
  const deltas = scenario.deltas ?? ['تعمل ', 'الباقات ', 'هكذا.'];
  const delayMs = scenario.kind === 'normal' ? (scenario.delayMs ?? 0) : 0;
  const { assistant } = turn;
  let cancelled = false;
  // The server side of Stop / a lost connection: keep the text as `partial`.
  const onClientGone = () => {
    cancelled = true;
    if (assistant.status === 'streaming') {
      settle(assistant, { status: 'partial', finishReason: 'aborted' });
    }
  };
  clientSignal.addEventListener('abort', onClientGone);
  openStreams.add(onClientGone);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const write = (text: string) => {
        if (cancelled) return;
        const bytes = encoder.encode(text);
        const size = chatMock.chunkBytes;
        if (!size) return controller.enqueue(bytes);
        for (let i = 0; i < bytes.length; i += size) {
          controller.enqueue(bytes.slice(i, i + size));
        }
      };
      try {
        write(
          sseEvent('started', {
            requestId: 'req-1',
            conversation: { id: conv.id, title: conv.title },
            userMessage: { ...turn.user },
            assistantMessage: { ...assistant },
            modeKey,
            reservedUsd: '0.004200000',
          }),
        );
        write(': keep-alive\n\n');
        for (const text of deltas) {
          if (delayMs) await sleep(delayMs);
          if (cancelled) return;
          assistant.content += text;
          write(sseEvent('delta', { text }));
        }
        switch (scenario.kind) {
          case 'normal':
          case 'length': {
            const partial = scenario.kind === 'length';
            settle(assistant, {
              status: partial ? 'partial' : 'complete',
              finishReason: partial ? 'length' : 'stop',
            });
            write(
              sseEvent('done', {
                status: assistant.status,
                finishReason: assistant.finishReason,
                message: { ...assistant },
                chargeUsd: chatMock.chargeUsd,
                balanceUsd: chatMock.balanceUsd,
              }),
            );
            break;
          }
          case 'error-event': {
            const code = scenario.code ?? 'PROVIDER_ERROR';
            settle(assistant, {
              status: assistant.content ? 'partial' : 'failed',
              finishReason: 'other',
              errorCode: code,
            });
            write(
              sseEvent('error', {
                code,
                status: assistant.status,
                message: { ...assistant },
                chargeUsd: chatMock.chargeUsd,
                balanceUsd: chatMock.balanceUsd,
              }),
            );
            break;
          }
          case 'drop':
            await sleep(5);
            settle(assistant, { status: 'partial', finishReason: 'aborted' });
            controller.error(new TypeError('network connection lost'));
            return;
          case 'hang':
            // Until the client aborts (Stop); the server then keeps a partial answer.
            // Ends (closes) as soon as the client is gone, at most after 5 s.
            for (let i = 0; i < 500 && !cancelled; i++) await sleep(10);
            break;
        }
        controller.close();
      } catch {
        // The client went away while writing.
      } finally {
        openStreams.delete(onClientGone);
      }
    },
    cancel: onClientGone,
  });

  return new HttpResponse(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}

function sortedConversations() {
  return [...chatMock.conversations].sort((a, b) =>
    b.lastMessageAt.localeCompare(a.lastMessageAt),
  );
}

export const chatHandlers = [
  http.get(`${API}/modes`, () => {
    chatMock.calls.push({ name: 'listModes', body: null });
    return HttpResponse.json(chatMock.modes);
  }),

  http.get(`${API}/me/subscription`, () => {
    chatMock.calls.push({ name: 'getSubscription', body: null });
    const plan = {
      key: chatMock.subscription === 'active' ? 'basic' : 'free',
      nameAr: 'باقة',
      nameEn: 'Plan',
      descriptionAr: '',
      descriptionEn: '',
      isDefault: chatMock.subscription === 'none',
    };
    return HttpResponse.json({
      plan,
      subscription:
        chatMock.subscription === 'active'
          ? {
              id: 'sub-1',
              source: 'admin',
              priceUsd: '10.000000000',
              startedAt: new Date().toISOString(),
              currentPeriodEnd: null,
            }
          : null,
      modeKeys: chatMock.modes.map((m) => m.key),
    });
  }),

  http.get(`${API}/me/balance`, () => {
    chatMock.calls.push({ name: 'getBalance', body: null });
    return HttpResponse.json({ balanceUsd: chatMock.balanceUsd });
  }),

  http.get(`${API}/conversations`, ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? 20);
    const offset = Number(url.searchParams.get('cursor') ?? 0);
    chatMock.calls.push({ name: 'listConversations', body: { limit, offset } });
    const all = sortedConversations();
    const items = all.slice(offset, offset + limit);
    const more = offset + limit < all.length;
    return HttpResponse.json({
      items,
      nextCursor: more ? String(offset + limit) : null,
    });
  }),

  http.post(`${API}/conversations`, async ({ request }) => {
    const body = (await request.json()) as { modeKey?: string };
    chatMock.calls.push({ name: 'createConversation', body });
    const outcome = chatMock.create;
    if (outcome.kind === 'network-error') return HttpResponse.error();
    if (outcome.kind === 'refuse') return apiError(outcome);
    const created = conversation({ modeKey: body.modeKey ?? null });
    chatMock.conversations.push(created);
    chatMock.messages[created.id] = [];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.get(`${API}/conversations/:id`, ({ params }) => {
    const found = chatMock.conversations.find((c) => c.id === params.id);
    chatMock.calls.push({ name: 'getConversation', body: params.id });
    if (!found) return apiError(refusals.CONVERSATION_NOT_FOUND);
    return HttpResponse.json(found);
  }),

  http.get(`${API}/conversations/:id/messages`, ({ params, request }) => {
    const id = params.id as string;
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? 50);
    const before = url.searchParams.get('before');
    chatMock.calls.push({ name: 'listMessages', body: { id, before } });
    if (!chatMock.conversations.some((c) => c.id === id)) {
      return apiError(refusals.CONVERSATION_NOT_FOUND);
    }
    const newestFirst = [...messagesOf(id)]
      .reverse()
      .filter((m) => before === null || m.sequence < Number(before));
    const items = newestFirst.slice(0, limit).map((m) => ({ ...m }));
    const more = newestFirst.length > limit;
    return HttpResponse.json({
      items,
      nextBefore: more ? items[items.length - 1]!.sequence : null,
    });
  }),

  http.post(
    `${API}/conversations/:id/messages`,
    async ({ params, request }) => {
      const id = params.id as string;
      const body = (await request.json()) as {
        content: string;
        modeKey: string;
        clientRequestId: string;
      };
      chatMock.calls.push({
        name: 'sendMessage',
        body,
        authorization: request.headers.get('authorization'),
      });
      const conv = chatMock.conversations.find((c) => c.id === id);
      if (!conv) return apiError(refusals.CONVERSATION_NOT_FOUND);
      const seen = chatMock.seenRequestIds.get(body.clientRequestId);
      if (seen) {
        return apiError({ ...refusals.DUPLICATE_REQUEST, data: seen });
      }
      let scenario = chatMock.send;
      if (scenario.kind === 'slow-start') {
        const { delayMs = 3000, deltas } = scenario;
        const aborted = await new Promise<boolean>((resolve) => {
          const timer = setTimeout(() => resolve(false), delayMs);
          request.signal.addEventListener('abort', () => {
            clearTimeout(timer);
            resolve(true);
          });
        });
        if (aborted) return HttpResponse.error();
        scenario = { kind: 'normal', deltas };
      }
      switch (scenario.kind) {
        case 'refuse':
          return apiError(scenario);
        case 'network-error':
          return HttpResponse.error();
        case 'wrong-content-type':
          return HttpResponse.text('<html>proxy</html>', {
            headers: { 'Content-Type': 'text/html' },
          });
        case 'lost-response': {
          const turn = saveTurn(conv, body.content, body.modeKey);
          settle(turn.assistant, { status: 'complete', content: 'answer' });
          chatMock.seenRequestIds.set(body.clientRequestId, {
            userMessageId: turn.user.id,
            assistantMessageId: turn.assistant.id,
          });
          return HttpResponse.error();
        }
        default: {
          const turn = saveTurn(conv, body.content, body.modeKey);
          chatMock.seenRequestIds.set(body.clientRequestId, {
            userMessageId: turn.user.id,
            assistantMessageId: turn.assistant.id,
          });
          return streamResponse(
            conv,
            turn,
            body.modeKey,
            scenario,
            request.signal,
          );
        }
      }
    },
  ),
];

/** Adds a conversation with messages (oldest first) to the mock server. */
export function seedConversation(
  overrides: Partial<ConversationDto> = {},
  count = 0,
): ConversationDto {
  const conv = conversation({ title: 'محادثة', ...overrides });
  chatMock.conversations.push(conv);
  chatMock.messages[conv.id] = Array.from({ length: count }, (_, i) =>
    message({
      sequence: i + 1,
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `رسالة ${i + 1}`,
    }),
  );
  return conv;
}
