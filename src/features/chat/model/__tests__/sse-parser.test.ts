import { describe, expect, it } from 'vitest';
import { SseParser, readSse, type SseMessage } from '../sse-parser';
import { decodeChatStream } from '../stream-events';
import { StreamProtocolError } from '~/platform/stream';

function parseAll(chunks: string[]): SseMessage[] {
  const parser = new SseParser();
  const out = chunks.flatMap((c) => parser.push(c));
  parser.end();
  return out;
}

function bytesStream(chunks: Uint8Array[]): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      chunks.forEach((c) => controller.enqueue(c));
      controller.close();
    },
  });
}

async function collect<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const out: T[] = [];
  for await (const item of iterable) out.push(item);
  return out;
}

const STREAM =
  'event: started\ndata: {"a":1}\n\n' +
  ': keep-alive\n\n' +
  'event: delta\ndata: {"text":"تعمل "}\n\n' +
  'event: delta\ndata: {"text":"الباقات"}\n\n' +
  'event: done\ndata: {"status":"complete"}\n\n';

describe('SseParser', () => {
  it('parses named events with one data line', () => {
    expect(parseAll([STREAM]).map((m) => m.event)).toEqual([
      'started',
      'delta',
      'delta',
      'done',
    ]);
  });

  it('gives the same result for every split point of the input', () => {
    const whole = parseAll([STREAM]);
    for (let i = 1; i < STREAM.length; i++) {
      expect(parseAll([STREAM.slice(0, i), STREAM.slice(i)])).toEqual(whole);
    }
  });

  it('handles one character per chunk', () => {
    expect(parseAll([...STREAM])).toEqual(parseAll([STREAM]));
  });

  it('accepts CRLF and lone CR line endings, including a CRLF split across chunks', () => {
    const crlf = STREAM.replace(/\n/g, '\r\n');
    const cr = STREAM.replace(/\n/g, '\r');
    const expected = parseAll([STREAM]);
    expect(parseAll([crlf])).toEqual(expected);
    expect(parseAll([cr])).toEqual(expected);
    // "\r" at the end of one chunk, "\n" at the start of the next.
    const at = crlf.indexOf('\r\n') + 1;
    expect(parseAll([crlf.slice(0, at), crlf.slice(at)])).toEqual(expected);
  });

  it('joins multiple data lines with a newline', () => {
    expect(
      parseAll(['event: delta\ndata: line one\ndata: line two\n\n']),
    ).toEqual([{ event: 'delta', data: 'line one\nline two' }]);
  });

  it('ignores comment lines and events without data', () => {
    expect(parseAll([': keep-alive\n\n', 'event: ping\n\n', ':\n\n'])).toEqual(
      [],
    );
  });

  it('strips one leading space only, and accepts a field without a value', () => {
    expect(parseAll(['data:  two spaces\n\n', 'data\n\n'])).toEqual([
      { event: 'message', data: ' two spaces' },
      { event: 'message', data: '' },
    ]);
  });

  it('discards an unterminated final event', () => {
    expect(parseAll(['event: done\ndata: {"x":1}\n'])).toEqual([]);
  });

  it('skips a byte order mark at the start', () => {
    expect(parseAll(['﻿data: x\n\n'])).toEqual([
      { event: 'message', data: 'x' },
    ]);
  });
});

describe('readSse', () => {
  it('decodes multi-byte characters split across byte chunks', async () => {
    const bytes = new TextEncoder().encode(
      'event: delta\ndata: {"text":"بيان"}\n\n',
    );
    // Split inside the two-byte Arabic letters.
    const chunks = Array.from({ length: bytes.length }, (_, i) =>
      bytes.slice(i, i + 1),
    );
    const out = await collect(readSse(bytesStream(chunks)));
    expect(out).toEqual([{ event: 'delta', data: '{"text":"بيان"}' }]);
  });
});

describe('decodeChatStream', () => {
  it('yields typed events, skips unknown ones, and concatenated deltas equal the text', async () => {
    const text = STREAM.replace(
      'event: done',
      'event: future-thing\ndata: {}\n\nevent: done',
    );
    const events = await collect(
      decodeChatStream(bytesStream([new TextEncoder().encode(text)])),
    );
    expect(events.map((e) => e.event)).toEqual([
      'started',
      'delta',
      'delta',
      'done',
    ]);
    const joined = events
      .flatMap((e) => (e.event === 'delta' ? [e.data.text] : []))
      .join('');
    expect(joined).toBe('تعمل الباقات');
  });

  it('rejects invalid JSON as a protocol error', async () => {
    const body = bytesStream([
      new TextEncoder().encode('event: delta\ndata: {oops\n\n'),
    ]);
    await expect(collect(decodeChatStream(body))).rejects.toBeInstanceOf(
      StreamProtocolError,
    );
  });
});
