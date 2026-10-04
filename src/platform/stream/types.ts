// Transport for the chat stream (API_CONTRACT §6). The web build reads the
// response with fetch + ReadableStream; a native build (Capacitor) can swap in
// its own implementation behind the same interface. See FRONTEND_PLAN.md §7b.

/** Body of `POST /api/v1/conversations/{conversationId}/messages`. */
export interface ChatSendRequest {
  conversationId: string;
  content: string;
  modeKey: string;
  /** New UUID per press of Send; reused only to retry the same send after a network failure. */
  clientRequestId: string;
}

/**
 * Sends one message and yields the stream's events in order. Throws
 * `StreamApiError` for a refusal before the stream (JSON body),
 * `StreamNetworkError` when the connection fails, and the signal's AbortError
 * when stopped. It never reconnects: the API has no resume, so a reconnect
 * would send the message again.
 *
 * Generic over the event type so this layer stays independent of the chat
 * feature, which supplies the decoder (SSE parsing + event typing).
 */
export interface ChatStreamTransport<TEvent> {
  send(request: ChatSendRequest, signal: AbortSignal): AsyncIterable<TEvent>;
}

/** Turns the response body of a successful send into events. */
export type StreamDecoder<TEvent> = (
  body: ReadableStream<Uint8Array>,
) => AsyncIterable<TEvent>;
