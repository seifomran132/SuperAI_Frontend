// Incremental Server-Sent Events parser (WHATWG "event stream interpretation").
// Text arrives in arbitrary chunks: a line, a CRLF pair or a multi-byte
// character can be split across chunks, so state is kept between pushes.

export interface SseMessage {
  /** `event:` field; "message" when absent. */
  event: string;
  /** All `data:` lines of the event joined with "\n". */
  data: string;
  id?: string;
}

export class SseParser {
  private buffer = '';
  /** The previous chunk ended in "\r": a "\n" starting the next chunk belongs to it. */
  private pendingCr = false;
  private atStart = true;
  private eventType = '';
  private dataLines: string[] = [];
  private hasData = false;
  private lastId: string | undefined;

  /** Feeds decoded text; returns the events completed by it. */
  push(chunk: string): SseMessage[] {
    let text = chunk;
    if (this.atStart && text.length > 0) {
      this.atStart = false;
      if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    }
    if (this.pendingCr && text.startsWith('\n')) text = text.slice(1);
    this.pendingCr = false;

    this.buffer += text;
    const out: SseMessage[] = [];
    let start = 0;
    for (let i = 0; i < this.buffer.length; i++) {
      const ch = this.buffer[i];
      if (ch !== '\n' && ch !== '\r') continue;
      const line = this.buffer.slice(start, i);
      if (ch === '\r') {
        if (i + 1 < this.buffer.length) {
          if (this.buffer[i + 1] === '\n') i++;
        } else {
          this.pendingCr = true;
        }
      }
      start = i + 1;
      const message = this.line(line);
      if (message) out.push(message);
    }
    this.buffer = this.buffer.slice(start);
    return out;
  }

  /**
   * End of stream. Per the spec an event not terminated by a blank line is
   * discarded; the API always terminates its events.
   */
  end(): void {
    this.buffer = '';
    this.reset();
  }

  private line(line: string): SseMessage | null {
    if (line === '') return this.dispatch();
    if (line.startsWith(':')) return null; // comment, e.g. ": keep-alive"
    const colon = line.indexOf(':');
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? '' : line.slice(colon + 1);
    if (value.startsWith(' ')) value = value.slice(1);
    switch (field) {
      case 'event':
        this.eventType = value;
        break;
      case 'data':
        this.dataLines.push(value);
        this.hasData = true;
        break;
      case 'id':
        if (!value.includes('\0')) this.lastId = value;
        break;
      default:
        // `retry` and unknown fields are ignored: we never reconnect.
        break;
    }
    return null;
  }

  private dispatch(): SseMessage | null {
    if (!this.hasData) {
      this.reset();
      return null;
    }
    const message: SseMessage = {
      event: this.eventType || 'message',
      data: this.dataLines.join('\n'),
      ...(this.lastId !== undefined ? { id: this.lastId } : {}),
    };
    this.reset();
    return message;
  }

  private reset() {
    this.eventType = '';
    this.dataLines = [];
    this.hasData = false;
  }
}

/** Reads a byte stream to the end and yields its events. Releases the stream if the consumer stops early. */
export async function* readSse(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<SseMessage> {
  const reader = body.getReader();
  const decoder = new TextDecoder('utf-8');
  const parser = new SseParser();
  let finished = false;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      yield* parser.push(decoder.decode(value, { stream: true }));
    }
    yield* parser.push(decoder.decode());
    parser.end();
    finished = true;
  } finally {
    if (!finished) await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
