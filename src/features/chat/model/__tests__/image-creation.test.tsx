import type { ReactNode } from 'react';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { chatCalls, chatMock, modeImage, seedConversation } from '~/mocks/chat';
import {
  downloadAttachment,
  filenameFromDisposition,
} from '../attachment-download';
import { NEW_CHAT, useChatStore } from '../chat-store';
import { resetChatState } from '../session-reset';
import { sendMessage } from '../send-message';
import { decodeChatStream, type ChatEvent } from '../stream-events';
import type { ChatTransport } from '../transport';
import type { MessageDto } from '~/api/generated';
import { useSendMessage } from '../useSendMessage';
import {
  cachedMessages,
  loadConversation,
  newQueryClient,
  tick,
  timerFrames,
  useChatTestSetup,
} from './helpers';

// F8 slice 1: image modes (API_CONTRACT §9) in the chat data layer.

useChatTestSetup();

const deps = { scheduleFrame: timerFrames };
const store = () => useChatStore.getState();
const ATTACHMENT = {
  id: 'img-1',
  mimeType: 'image/webp',
  width: 2048,
  height: 1152,
};

beforeEach(() => {
  chatMock.imageModes = true;
});

async function existing() {
  const qc = newQueryClient();
  const conv = seedConversation({ title: 'صور' }, 0);
  await loadConversation(qc, conv.id);
  return { qc, conv };
}

const sentBodies = () =>
  chatCalls('sendMessage').map(
    (c) => c.body as { imageOptions?: unknown; clientRequestId: string },
  );

function bytesStream(text: string): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
}

describe('image event', () => {
  it('decodes `image` between the deltas and the terminal event', async () => {
    const body = bytesStream(
      'event: started\ndata: {"a":1}\n\n' +
        'event: delta\ndata: {"text":"تفضل"}\n\n' +
        `event: image\ndata: {"attachment":${JSON.stringify(ATTACHMENT)}}\n\n` +
        'event: done\ndata: {"status":"complete"}\n\n',
    );
    const events: ChatEvent[] = [];
    for await (const e of decodeChatStream(body)) events.push(e);
    expect(events.map((e) => e.event)).toEqual([
      'started',
      'delta',
      'image',
      'done',
    ]);
    const image = events[2];
    expect(image?.event === 'image' && image.data.attachment).toEqual(
      ATTACHMENT,
    );
  });
});

describe('sendMessage in an image mode', () => {
  it('writes the image into the streaming answer, then keeps it after done', async () => {
    const { qc, conv } = await existing();
    chatMock.send = { kind: 'image', attachment: ATTACHMENT, delayMs: 20 };
    const running = sendMessage(
      qc,
      { key: conv.id, content: 'قطة', modeKey: modeImage.key },
      deps,
    );
    await waitFor(() =>
      expect(cachedMessages(qc, conv.id)[0]).toMatchObject({
        role: 'assistant',
        attachments: [ATTACHMENT],
      }),
    );
    const outcome = await running;
    expect(outcome.kind).toBe('done');
    expect(cachedMessages(qc, conv.id)[0]).toMatchObject({
      status: 'complete',
      content: 'تفضل، هذه صورتك:',
      attachments: [ATTACHMENT],
    });
  });

  it('ignores an image before `started` and a second image', async () => {
    const { qc, conv } = await existing();
    const assistant = {
      id: 'a1',
      sequence: 2,
      role: 'assistant' as const,
      content: '',
      status: 'streaming' as const,
      modeKey: 'image',
      finishReason: 'stop' as const,
      errorCode: null,
      createdAt: '2026-10-27T00:00:00.000Z',
      completedAt: null,
      attachments: [] as MessageDto['attachments'],
      costUsd: null,
      usage: null,
    };
    const user = { ...assistant, id: 'u1', sequence: 1, role: 'user' as const };
    const seen: unknown[] = [];
    const transport: ChatTransport = {
      async *send(): AsyncGenerator<ChatEvent> {
        yield {
          event: 'image',
          data: { attachment: { ...ATTACHMENT, id: 'early' } },
        };
        yield {
          event: 'started',
          data: {
            requestId: 'r',
            conversation: { id: conv.id, title: 'صور' },
            userMessage: user,
            assistantMessage: assistant,
            modeKey: 'image',
            reservedUsd: '0.010000000',
          },
        };
        seen.push(cachedMessages(qc, conv.id)[0]?.attachments);
        yield { event: 'image', data: { attachment: ATTACHMENT } };
        seen.push(cachedMessages(qc, conv.id)[0]?.attachments);
        yield {
          event: 'image',
          data: { attachment: { ...ATTACHMENT, id: 'second' } },
        };
        seen.push(cachedMessages(qc, conv.id)[0]?.attachments);
        yield {
          event: 'done',
          data: {
            status: 'complete',
            finishReason: 'stop',
            message: {
              ...assistant,
              status: 'complete',
              attachments: [ATTACHMENT],
            },
            chargeUsd: '0.055000000',
            balanceUsd: '4.695000000',
          },
        };
      },
    };
    const outcome = await sendMessage(
      qc,
      { key: conv.id, content: 'قطة', modeKey: 'image' },
      { ...deps, transport },
    );
    expect(outcome.kind).toBe('done');
    expect(seen).toEqual([[], [ATTACHMENT], [ATTACHMENT]]);
    expect(cachedMessages(qc, conv.id)[0]?.attachments).toEqual([ATTACHMENT]);
  });

  it('a text-only image answer has no attachments', async () => {
    const { qc, conv } = await existing();
    chatMock.send = { kind: 'normal', deltas: ['لا أستطيع رسم هذا.'] };
    await sendMessage(
      qc,
      { key: conv.id, content: 'x', modeKey: modeImage.key },
      deps,
    );
    expect(cachedMessages(qc, conv.id)[0]).toMatchObject({
      status: 'complete',
      attachments: [],
    });
  });

  it('a blocked image ends with CONTENT_BLOCKED', async () => {
    const { qc, conv } = await existing();
    chatMock.send = {
      kind: 'error-event',
      code: 'CONTENT_BLOCKED',
      deltas: [],
    };
    const outcome = await sendMessage(
      qc,
      { key: conv.id, content: 'x', modeKey: modeImage.key },
      deps,
    );
    expect(outcome).toMatchObject({ kind: 'failed', code: 'CONTENT_BLOCKED' });
    expect(cachedMessages(qc, conv.id)[0]).toMatchObject({
      status: 'failed',
      errorCode: 'CONTENT_BLOCKED',
    });
  });
});

describe('imageOptions', () => {
  it('is sent only when a ratio is set', async () => {
    const { qc, conv } = await existing();
    chatMock.send = { kind: 'image' };
    await sendMessage(
      qc,
      { key: conv.id, content: 'a', modeKey: 'image' },
      deps,
    );
    await sendMessage(
      qc,
      { key: conv.id, content: 'b', modeKey: 'image', imageOptions: {} },
      deps,
    );
    await sendMessage(
      qc,
      {
        key: conv.id,
        content: 'c',
        modeKey: 'image',
        imageOptions: { aspectRatio: '16:9' },
      },
      deps,
    );
    const bodies = sentBodies();
    expect('imageOptions' in bodies[0]!).toBe(false);
    expect('imageOptions' in bodies[1]!).toBe(false);
    expect(bodies[2]!.imageOptions).toEqual({ aspectRatio: '16:9' });
  });

  it('the hook passes imageOptions, and retry reuses them with the same clientRequestId', async () => {
    const qc = newQueryClient();
    const conv = seedConversation({}, 0);
    chatMock.send = { kind: 'network-error' };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc as QueryClient}>
        {children}
      </QueryClientProvider>
    );
    const { result } = renderHook(() => useSendMessage(conv.id), { wrapper });

    await act(async () => {
      await result.current.send('قطة', 'image', {
        imageOptions: { aspectRatio: '3:4' },
      });
    });
    expect(result.current.refusal).toMatchObject({
      code: 'NETWORK',
      retry: { imageOptions: { aspectRatio: '3:4' } },
    });

    chatMock.send = { kind: 'image' };
    await act(async () => {
      await result.current.retry();
    });
    const [first, second] = sentBodies();
    expect(second!.imageOptions).toEqual({ aspectRatio: '3:4' });
    expect(second!.clientRequestId).toBe(first!.clientRequestId);
  });
});

describe('chat-store aspect ratios', () => {
  it('sets and clears (null = automatic) per conversation', () => {
    store().setAspectRatio('c1', '4:3');
    store().setAspectRatio('c2', '1:1');
    expect(store().aspectRatios).toEqual({ c1: '4:3', c2: '1:1' });
    store().setAspectRatio('c1', null);
    expect(store().aspectRatios).toEqual({ c2: '1:1' });
  });

  it('a new chat carries its ratio to the created conversation', async () => {
    const qc = newQueryClient();
    chatMock.send = { kind: 'image' };
    store().setMode(NEW_CHAT, 'image');
    store().setAspectRatio(NEW_CHAT, '9:16');
    const outcome = await sendMessage(
      qc,
      {
        key: NEW_CHAT,
        content: 'قطة',
        modeKey: 'image',
        imageOptions: { aspectRatio: '9:16' },
      },
      deps,
    );
    if (outcome.kind !== 'done') throw new Error(outcome.kind);
    expect(store().aspectRatios[outcome.conversationId]).toBe('9:16');
    expect(store().modes[outcome.conversationId]).toBe('image');
  });

  it('is reset on sign-out like the other UI state', () => {
    store().setAspectRatio('c1', '16:9');
    store().setAspectRatio(NEW_CHAT, '1:1');
    resetChatState();
    expect(store().aspectRatios).toEqual({});
  });
});

describe('downloadAttachment', () => {
  const realCreate = URL.createObjectURL;
  const realRevoke = URL.revokeObjectURL;
  let clicked: { href: string; download: string }[];

  beforeEach(() => {
    clicked = [];
    URL.createObjectURL = vi.fn(() => 'blob:download-1');
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clicked.push({ href: this.href, download: this.download });
    });
  });
  afterEach(() => {
    URL.createObjectURL = realCreate;
    URL.revokeObjectURL = realRevoke;
    vi.restoreAllMocks();
  });

  it('fetches ?download=1 with the token, saves under the server filename and revokes the URL', async () => {
    newQueryClient();
    const conv = seedConversation({}, 0);
    chatMock.send = { kind: 'image', attachment: { id: 'abc' } };
    await sendMessage(
      newQueryClient(),
      { key: conv.id, content: 'x', modeKey: 'image' },
      deps,
    );

    await downloadAttachment('abc');

    const call = chatCalls('download').at(-1);
    expect(call?.body).toBe('abc');
    expect(call?.authorization).toMatch(/^Bearer /);
    expect(clicked).toEqual([
      { href: 'blob:download-1', download: 'lam7a-abc.webp' },
    ]);
    expect(document.querySelector('a[download]')).toBeNull();
    await tick();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:download-1');
  });

  it('throws when the image is gone, without saving anything', async () => {
    newQueryClient();
    await expect(downloadAttachment('missing')).rejects.toMatchObject({
      code: 'ATTACHMENT_NOT_FOUND',
    });
    expect(clicked).toEqual([]);
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('reads the filename from Content-Disposition, with a fallback', () => {
    expect(filenameFromDisposition('attachment; filename="lam7a-1.webp"')).toBe(
      'lam7a-1.webp',
    );
    expect(filenameFromDisposition('attachment; filename=plain.webp')).toBe(
      'plain.webp',
    );
    expect(
      filenameFromDisposition(
        'attachment; filename="x.webp"; filename*=UTF-8\'\'%D8%B5%D9%88%D8%B1%D8%A9.webp',
      ),
    ).toBe('صورة.webp');
    expect(
      filenameFromDisposition('attachment; filename="../../etc.webp"'),
    ).toBe('etc.webp');
    expect(filenameFromDisposition('inline')).toBeNull();
    expect(filenameFromDisposition(null)).toBeNull();
  });
});
