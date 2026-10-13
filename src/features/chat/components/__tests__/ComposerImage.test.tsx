import { createRef } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '~/i18n';
import { createQueryClient } from '~/api/query-client';
import ar from '~/i18n/ar.json';
import arErrors from '~/i18n/errors.ar.json';
import { modeFast, modeProfessional } from '~/mocks/chat';
import type { AttachmentDraft } from '../../model/attachment-draft';
import type { ComposerImageInput } from '../../model/image-input';
import { NEW_CHAT, useChatStore } from '../../model/chat-store';
import { modesKey } from '../../model/queries';
import type { useSendMessage } from '../../model/useSendMessage';
import { Composer } from '../Composer';

type Send = ReturnType<typeof useSendMessage>;
const send = {
  send: vi.fn(),
  retry: vi.fn(),
  stop: vi.fn(),
  dismissRefusal: vi.fn(),
  status: 'idle',
  isBusy: false,
  pending: null,
  refusal: undefined,
  rateLimitSeconds: 0,
  canSend: true,
  conversationId: null,
} as unknown as Send;

const file = new File(['x'], 'a.png', { type: 'image/png' });
const png = () => new File(['x'], 'b.png', { type: 'image/png' });

function input(
  draft: AttachmentDraft = { status: 'empty' },
  overrides: Partial<ComposerImageInput> = {},
): ComposerImageInput {
  return {
    draft: { draft, notice: null },
    addFiles: vi.fn(),
    remove: vi.fn(),
    retry: vi.fn(),
    dismissNotice: vi.fn(),
    modeSupportsImages: (key) => key === 'professional',
    ...overrides,
  };
}

function setup(imageInput?: ComposerImageInput, modeKey?: string) {
  const qc = createQueryClient();
  qc.setQueryData(modesKey(), [modeFast, modeProfessional]);
  render(
    <QueryClientProvider client={qc}>
      <Composer
        storeKey={NEW_CHAT}
        conversationModeKey={modeKey}
        send={send}
        noPlan={false}
        textareaRef={createRef<HTMLTextAreaElement>()}
        imageInput={imageInput}
      />
    </QueryClientProvider>,
  );
}

beforeEach(() => useChatStore.getState().reset());
afterEach(() => useChatStore.getState().reset());

describe('composer image input', () => {
  it('has no attach button without imageInput', () => {
    setup();
    expect(
      screen.queryByRole('button', { name: ar.chat.image.attach }),
    ).not.toBeInTheDocument();
  });

  it('has no attach button when no mode reads images, and ignores drops', () => {
    const im = input(undefined, { modeSupportsImages: () => false });
    setup(im);
    expect(
      screen.queryByRole('button', { name: ar.chat.image.attach }),
    ).not.toBeInTheDocument();
    const drop = createEvent.drop(document);
    Object.defineProperty(drop, 'dataTransfer', {
      value: { types: ['Files'], files: [file] },
    });
    document.dispatchEvent(drop);
    expect(im.addFiles).not.toHaveBeenCalled();
  });

  it('attaches by the picker', () => {
    const im = input();
    setup(im);
    expect(
      screen.getByRole('button', { name: ar.chat.image.attach }),
    ).toBeInTheDocument();
    const picker = screen.getByTestId('image-input');
    expect(picker).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
    fireEvent.change(picker, { target: { files: [file] } });
    expect(im.addFiles).toHaveBeenCalledWith([file]);
  });

  it('attaches by drop and shows the drop zone while dragging', () => {
    const im = input();
    setup(im);
    const dt = { types: ['Files'], files: [file] };
    const enter = createEvent.dragEnter(document);
    Object.defineProperty(enter, 'dataTransfer', { value: dt });
    fireEvent(document, enter);
    expect(screen.getByText(ar.chat.image.drop)).toBeInTheDocument();
    expect(screen.getByText(ar.chat.image.dropHint)).toBeInTheDocument();
    const drop = createEvent.drop(document);
    Object.defineProperty(drop, 'dataTransfer', { value: dt });
    fireEvent(document, drop);
    expect(im.addFiles).toHaveBeenCalledWith([file]);
    expect(screen.queryByText(ar.chat.image.drop)).not.toBeInTheDocument();
  });

  it('attaches by paste, and leaves plain-text paste alone', () => {
    const im = input();
    setup(im);
    const box = screen.getByLabelText(ar.chat.composer.label);
    fireEvent.paste(box, {
      clipboardData: { files: [png()], getData: () => '' },
    });
    expect(im.addFiles).toHaveBeenCalledTimes(1);
    fireEvent.paste(box, { clipboardData: { files: [], getData: () => 'hi' } });
    expect(im.addFiles).toHaveBeenCalledTimes(1);
  });

  it('shows the mode notice and disables send when the mode cannot read images', () => {
    const ready: AttachmentDraft = {
      status: 'ready',
      file,
      previewUrl: 'blob:1',
      uploadId: 'u',
      attachment: { id: 'u', mimeType: 'image/webp', width: 800, height: 600 },
    };
    setup(input(ready), 'fast');
    expect(screen.getByText(ar.chat.image.modeNotice)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(ar.chat.composer.label), {
      target: { value: 'hi' },
    });
    expect(
      screen.getByRole('button', { name: ar.chat.composer.send }),
    ).toBeDisabled();
  });

  it('sends with an empty text when the image is ready in a capable mode', () => {
    const ready: AttachmentDraft = {
      status: 'ready',
      file,
      previewUrl: 'blob:1',
      uploadId: 'u',
      attachment: { id: 'u', mimeType: 'image/webp', width: 800, height: 600 },
    };
    setup(input(ready), 'professional');
    expect(
      screen.queryByText(ar.chat.image.modeNotice),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: ar.chat.composer.send }),
    ).toBeEnabled();
  });

  it('blocks send while uploading', () => {
    const up: AttachmentDraft = {
      status: 'uploading',
      file,
      previewUrl: 'blob:1',
      progress: 5,
    };
    setup(input(up), 'professional');
    fireEvent.change(screen.getByLabelText(ar.chat.composer.label), {
      target: { value: 'hi' },
    });
    expect(
      screen.getByRole('button', { name: ar.chat.composer.send }),
    ).toBeDisabled();
  });

  it('shows the one-image notice', () => {
    const im = input({
      status: 'ready',
      file,
      previewUrl: 'blob:1',
      uploadId: 'u',
      attachment: { id: 'u', mimeType: 'image/webp', width: 800, height: 600 },
    });
    im.draft = { ...im.draft, notice: 'TOO_MANY_ATTACHMENTS' };
    setup(im, 'professional');
    expect(screen.getByText(arErrors.TOO_MANY_ATTACHMENTS)).toBeInTheDocument();
  });

  it('marks image-capable modes in the menu', async () => {
    setup(input());
    fireEvent.keyDown(
      screen.getByRole('button', {
        name: new RegExp(ar.chat.composer.modeMenu),
      }),
      { key: 'Enter' },
    );
    expect(await screen.findAllByText(ar.chat.image.readsImages)).toHaveLength(
      1,
    );
  });
});
