import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ar from '~/i18n/ar.json';
import errorsAr from '~/i18n/errors.ar.json';
import { chatMock, modeImage } from '~/mocks/chat';
import { renderApp, useAuthMocks } from '~/test/render-app';
import { NEW_CHAT, useChatStore } from '../../model/chat-store';
import { sends, typeAndSend, useChatTestState } from './support';

useAuthMocks();
useChatTestState();

type Body = { content: string; modeKey: string; imageOptions?: unknown };

describe('image modes: retry', () => {
  it('Retry on a failed image answer keeps the chosen aspect ratio', async () => {
    chatMock.imageModes = true;
    chatMock.send = {
      kind: 'error-event',
      code: 'CONTENT_BLOCKED',
      deltas: [],
    };
    const store = useChatStore.getState();
    store.setMode(NEW_CHAT, modeImage.key);
    store.setAspectRatio(NEW_CHAT, '16:9');

    await renderApp('/chat');
    // The composer is ready once the mode chip shows the image mode.
    await screen.findByLabelText(ar.chat.composer.label);
    await waitFor(() =>
      expect(
        screen.getByRole('button', {
          name: new RegExp(ar.chat.composer.modeMenu),
        }),
      ).toHaveTextContent(modeImage.labelAr),
    );
    await typeAndSend('قطة على نافذة');
    expect(
      await screen.findByText(errorsAr.CONTENT_BLOCKED),
    ).toBeInTheDocument();

    chatMock.send = { kind: 'image' };
    fireEvent.click(
      screen.getByRole('button', { name: ar.chat.message.retry }),
    );
    await waitFor(() => expect(sends()).toHaveLength(2));
    const [first, second] = sends().map((c) => c.body as Body);
    expect(first).toMatchObject({
      modeKey: modeImage.key,
      imageOptions: { aspectRatio: '16:9' },
    });
    expect(second).toMatchObject({
      content: first!.content,
      modeKey: modeImage.key,
      imageOptions: { aspectRatio: '16:9' },
    });
  });
});
