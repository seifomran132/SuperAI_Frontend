import type { MessageDto } from '~/api/generated/types.gen';
import { StreamProtocolError } from '~/platform/stream';
import { readSse } from './sse-parser';

// Events of the chat stream (API_CONTRACT §6.3). Money fields are USD decimal
// strings and stay strings.

export interface StartedEvent {
  event: 'started';
  data: {
    requestId: string;
    conversation: { id: string; title: string | null };
    userMessage: MessageDto;
    /** `streaming` and empty. */
    assistantMessage: MessageDto;
    modeKey: string;
    reservedUsd: string;
  };
}

export interface DeltaEvent {
  event: 'delta';
  data: { text: string };
}

export interface DoneEvent {
  event: 'done';
  data: {
    /** `complete`, or `partial` when cut by the length limit. */
    status: MessageDto['status'];
    finishReason: MessageDto['finishReason'] | null;
    message: MessageDto;
    chargeUsd: string;
    balanceUsd: string;
  };
}

export interface ErrorEvent {
  event: 'error';
  data: {
    /** PROVIDER_UNAVAILABLE, PROVIDER_TIMEOUT, PROVIDER_ERROR, CONTENT_BLOCKED, … */
    code: string;
    /** `partial` if some text was kept, else `failed`. */
    status: MessageDto['status'];
    message: MessageDto;
    /** Only what was actually used, possibly "0.000000000". */
    chargeUsd: string;
    balanceUsd: string;
  };
}

export type ChatEvent = StartedEvent | DeltaEvent | DoneEvent | ErrorEvent;
export type TerminalEvent = DoneEvent | ErrorEvent;

const KNOWN = new Set<ChatEvent['event']>([
  'started',
  'delta',
  'done',
  'error',
]);

export const isTerminal = (event: ChatEvent): event is TerminalEvent =>
  event.event === 'done' || event.event === 'error';

/** Decoder for the transport: SSE → typed chat events. Unknown event names are skipped. */
export async function* decodeChatStream(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<ChatEvent> {
  for await (const message of readSse(body)) {
    if (!KNOWN.has(message.event as ChatEvent['event'])) continue;
    let data: unknown;
    try {
      data = JSON.parse(message.data);
    } catch {
      throw new StreamProtocolError(`Invalid JSON in "${message.event}" event`);
    }
    if (typeof data !== 'object' || data === null) {
      throw new StreamProtocolError(`Empty "${message.event}" event`);
    }
    yield { event: message.event, data } as ChatEvent;
  }
}
