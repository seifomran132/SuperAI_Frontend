import { beforeEach, describe, expect, it } from 'vitest';
import { chatMock, modeImage, seedConversation } from '~/mocks/chat';
import { sendMessage } from '../send-message';
import {
  cachedBalance,
  cachedMessages,
  loadConversation,
  newQueryClient,
  timerFrames,
  useChatTestSetup,
} from './helpers';

// F8 slice 3: a provider failure in an image mode that was still charged.

useChatTestSetup();

beforeEach(() => {
  chatMock.imageModes = true;
});

describe('PROVIDER_ERROR in an image mode with a charge', () => {
  it('fails the answer without an image, keeps the charge and updates the balance', async () => {
    const qc = newQueryClient();
    const conv = seedConversation({ title: 'صور' }, 0);
    await loadConversation(qc, conv.id);
    chatMock.send = {
      kind: 'error-event',
      code: 'PROVIDER_ERROR',
      deltas: [],
    };
    chatMock.chargeUsd = '0.040000000';
    chatMock.balanceUsd = '0.460000000';

    const outcome = await sendMessage(
      qc,
      { key: conv.id, content: 'قطة', modeKey: modeImage.key },
      { scheduleFrame: timerFrames },
    );

    expect(outcome).toMatchObject({
      kind: 'failed',
      code: 'PROVIDER_ERROR',
      chargeUsd: '0.040000000',
      balanceUsd: '0.460000000',
    });
    expect(cachedMessages(qc, conv.id)[0]).toMatchObject({
      status: 'failed',
      errorCode: 'PROVIDER_ERROR',
      attachments: [],
    });
    expect(cachedBalance(qc)).toBe('0.460000000');
  });
});
