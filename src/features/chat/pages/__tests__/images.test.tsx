import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MessageDto } from '~/api/generated/types.gen';
import ar from '~/i18n/ar.json';
import errorsAr from '~/i18n/errors.ar.json';
import {
  chatCalls,
  chatMock,
  message,
  modeFast,
  modeProfessional,
  resetChatMock,
  seedConversation,
  seedUpload,
} from '~/mocks/chat';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';
import { stopAllStreams } from '../../model/active-streams';
import { NEW_CHAT, useChatStore } from '../../model/chat-store';

// Image input end to end on the page (API_CONTRACT §8): attach, upload, send,
// and images in the history, against the MSW server.

useAuthMocks();

const realCreate = URL.createObjectURL;
const realRevoke = URL.revokeObjectURL;
let urls = 0;

beforeEach(async () => {
  resetChatMock();
  useChatStore.getState().reset();
  // jsdom has no object URLs.
  URL.createObjectURL = vi.fn(() => `blob:test-${++urls}`);
  URL.revokeObjectURL = vi.fn();
  await signInDirectly();
});
afterEach(() => {
  stopAllStreams();
  useChatStore.getState().reset();
  URL.createObjectURL = realCreate;
  URL.revokeObjectURL = realRevoke;
});

/** A conversation on the mock server holding exactly these messages. */
function withMessages(
  overrides: Parameters<typeof seedConversation>[0],
  messages: MessageDto[],
) {
  const conv = seedConversation(overrides);
  chatMock.messages[conv.id] = messages;
  return conv;
}

const png = () => new File(['png-bytes'], 'photo.png', { type: 'image/png' });

async function attach(file: File) {
  const button = await screen.findByRole('button', {
    name: ar.chat.image.attach,
  });
  const input = button.parentElement!.querySelector('input[type="file"]')!;
  fireEvent.change(input, { target: { files: [file] } });
}

const sendButton = () =>
  screen.getByRole('button', { name: ar.chat.composer.send });

describe('attaching', () => {
  it('hides the attach button when no mode on the plan reads images', async () => {
    chatMock.modes = [modeFast];
    await renderApp('/chat');
    await screen.findByRole('textbox', { name: ar.chat.composer.label });
    expect(
      screen.queryByRole('button', { name: ar.chat.image.attach }),
    ).not.toBeInTheDocument();
  });

  it('uploads the image and sends it, with no text, in a mode that reads images', async () => {
    useChatStore.getState().setMode(NEW_CHAT, modeProfessional.key);
    await renderApp('/chat');
    await attach(png());
    expect(await screen.findByText(ar.chat.image.uploaded)).toBeInTheDocument();
    expect(chatCalls('upload')).toHaveLength(1);
    expect(chatCalls('upload')[0]!.authorization).toMatch(/^Bearer /);

    await waitFor(() => expect(sendButton()).toBeEnabled());
    fireEvent.click(sendButton());

    await waitFor(() => expect(chatCalls('sendMessage')).toHaveLength(1));
    const body = chatCalls('sendMessage')[0]!.body as {
      content: string;
      attachments: { uploadId: string }[];
    };
    expect(body.content).toBe('');
    expect(body.attachments).toHaveLength(1);
    const [stored] = [...chatMock.uploads.keys()];
    expect(body.attachments[0]!.uploadId).toBe(stored);

    // The message shows the image; the tile is gone from the composer.
    expect(
      await screen.findByRole('button', { name: ar.chat.image.view }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByText(ar.chat.image.uploaded),
      ).not.toBeInTheDocument(),
    );
  });

  it('blocks sending in a mode that cannot read images and keeps the image', async () => {
    useChatStore.getState().setMode(NEW_CHAT, modeFast.key);
    await renderApp('/chat');
    await attach(png());
    expect(await screen.findByText(ar.chat.image.uploaded)).toBeInTheDocument();
    expect(screen.getByText(ar.chat.image.modeNotice)).toBeInTheDocument();
    expect(sendButton()).toBeDisabled();
  });

  it('shows the server error for an image over 5 MB', async () => {
    chatMock.upload = {
      kind: 'refuse',
      status: 413,
      code: 'ATTACHMENT_TOO_LARGE',
    };
    useChatStore.getState().setMode(NEW_CHAT, modeProfessional.key);
    await renderApp('/chat');
    await attach(png());
    expect(
      await screen.findByText(errorsAr.ATTACHMENT_TOO_LARGE),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: ar.common.retry }),
    ).not.toBeInTheDocument();
  });

  it('offers retry after a network failure while uploading', async () => {
    chatMock.upload = { kind: 'network-error' };
    useChatStore.getState().setMode(NEW_CHAT, modeProfessional.key);
    await renderApp('/chat');
    await attach(png());
    expect(
      await screen.findByText(ar.chat.image.errors.UPLOAD_FAILED),
    ).toBeInTheDocument();
    chatMock.upload = { kind: 'ok' };
    fireEvent.click(screen.getByRole('button', { name: ar.common.retry }));
    expect(await screen.findByText(ar.chat.image.uploaded)).toBeInTheDocument();
  });

  it('drops the image when the server says it was already used', async () => {
    useChatStore.getState().setMode(NEW_CHAT, modeProfessional.key);
    await renderApp('/chat');
    await attach(png());
    expect(await screen.findByText(ar.chat.image.uploaded)).toBeInTheDocument();
    for (const upload of chatMock.uploads.values()) upload.used = true;

    await waitFor(() => expect(sendButton()).toBeEnabled());
    fireEvent.click(sendButton());
    expect(
      await screen.findByText(errorsAr.ATTACHMENT_ALREADY_USED),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByText(ar.chat.image.uploaded),
      ).not.toBeInTheDocument(),
    );
  });
});

describe('images in the history', () => {
  it('loads a stored image and opens the viewer', async () => {
    const image = seedUpload();
    const conv = withMessages({ title: 'صورة' }, [
      message({
        sequence: 1,
        role: 'user',
        content: 'ما هذا؟',
        attachments: [image],
      }),
      message({ sequence: 2, role: 'assistant', content: 'جبل' }),
    ]);
    await renderApp(`/chat/${conv.id}`);
    const opener = await screen.findByRole('button', {
      name: ar.chat.image.view,
    });
    expect(chatCalls('download')).toHaveLength(1);
    fireEvent.click(opener);
    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByRole('button', { name: ar.chat.image.close }),
    ).toBeInTheDocument();
  });

  it('shows a retry when the image cannot be loaded', async () => {
    chatMock.download = { kind: 'not-found' };
    const conv = withMessages({ title: 'صورة' }, [
      message({
        sequence: 1,
        role: 'user',
        content: '',
        attachments: [
          { id: 'gone', mimeType: 'image/webp', width: 10, height: 10 },
        ],
      }),
      message({ sequence: 2, role: 'assistant', content: 'جبل' }),
    ]);
    await renderApp(`/chat/${conv.id}`);
    expect(
      await screen.findByText(ar.chat.image.loadFailed),
    ).toBeInTheDocument();
  });

  it('does not offer to re-send a failed answer to a question with an image', async () => {
    const image = seedUpload();
    const conv = withMessages({ title: 'صورة' }, [
      message({
        sequence: 1,
        role: 'user',
        content: 'ما هذا؟',
        attachments: [image],
      }),
      message({
        sequence: 2,
        role: 'assistant',
        content: '',
        status: 'failed',
        errorCode: 'PROVIDER_ERROR',
      }),
    ]);
    await renderApp(`/chat/${conv.id}`);
    await screen.findByText(errorsAr.PROVIDER_ERROR);
    expect(
      screen.queryByRole('button', { name: ar.chat.message.retry }),
    ).not.toBeInTheDocument();
  });
});
