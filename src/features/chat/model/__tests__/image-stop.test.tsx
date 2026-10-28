import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  chatMock,
  modeImage,
  seedConversation,
  serverSeesDisconnect,
} from '~/mocks/chat';
import { getStream, stopStream } from '../active-streams';
import { sendMessage } from '../send-message';
import {
  cachedMessages,
  loadConversation,
  newQueryClient,
  tick,
  timerFrames,
  useChatTestSetup,
} from './helpers';

// Stop after the created image (API_CONTRACT §9). In its own file: a request
// left over from an earlier test in the same file can reach the reset mock and
// fail this send's POST (seen as "interrupted"), which made it flaky.

useChatTestSetup();

const deps = { scheduleFrame: timerFrames };
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

describe('image modes: Stop', () => {
  it('shows the image mid-stream (status streaming), and Stop after it keeps the image', async () => {
    const { qc, conv } = await existing();
    chatMock.send = { kind: 'image', attachment: ATTACHMENT, hang: true };
    const running = sendMessage(
      qc,
      { key: conv.id, content: 'قطة', modeKey: modeImage.key },
      deps,
    );
    await waitFor(() =>
      expect(cachedMessages(qc, conv.id)[0]).toMatchObject({
        status: 'streaming',
        attachments: [ATTACHMENT],
      }),
    );
    expect(getStream(conv.id)?.status).toBe('streaming');
    // Later deltas keep the image (the frame writer spreads the message).
    await tick(5);
    expect(cachedMessages(qc, conv.id)[0]?.attachments).toEqual([ATTACHMENT]);

    stopStream(conv.id);
    serverSeesDisconnect();
    expect((await running).kind).toBe('stopped');
    await waitFor(() =>
      expect(cachedMessages(qc, conv.id)[0]).toMatchObject({
        status: 'partial',
        attachments: [ATTACHMENT],
      }),
    );
  });
});
