import { createRef } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '~/i18n';
import { createQueryClient } from '~/api/query-client';
import ar from '~/i18n/ar.json';
import { modeFast, modeProfessional } from '~/mocks/chat';
import { NEW_CHAT, useChatStore } from '../../model/chat-store';
import { modesKey } from '../../model/queries';
import type { useSendMessage } from '../../model/useSendMessage';
import { Composer } from '../Composer';

type Send = ReturnType<typeof useSendMessage>;

function fakeSend(overrides: Partial<Send> = {}): Send {
  return {
    send: vi.fn(() => Promise.resolve({ kind: 'ignored' })),
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
    ...overrides,
  } as Send;
}

function setup(send: Send, { noPlan = false } = {}) {
  const qc = createQueryClient();
  qc.setQueryData(modesKey(), [modeFast, modeProfessional]);
  render(
    <QueryClientProvider client={qc}>
      <Composer
        storeKey={NEW_CHAT}
        send={send}
        noPlan={noPlan}
        textareaRef={createRef<HTMLTextAreaElement>()}
      />
    </QueryClientProvider>,
  );
  return screen.getByLabelText(ar.chat.composer.label);
}

beforeEach(() => useChatStore.getState().reset());
afterEach(() => useChatStore.getState().reset());

describe('composer', () => {
  it('Enter sends the draft with the selected mode', () => {
    const send = fakeSend();
    const box = setup(send);
    fireEvent.change(box, { target: { value: 'مرحبا' } });
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(send.send).toHaveBeenCalledWith('مرحبا', 'fast');
  });

  it('Shift+Enter does not send', () => {
    const send = fakeSend();
    const box = setup(send);
    fireEvent.change(box, { target: { value: 'سطر' } });
    fireEvent.keyDown(box, { key: 'Enter', shiftKey: true });
    expect(send.send).not.toHaveBeenCalled();
  });

  it('does not send an empty draft', () => {
    const send = fakeSend();
    const box = setup(send);
    fireEvent.change(box, { target: { value: '   ' } });
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(send.send).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: ar.chat.composer.send }),
    ).toBeDisabled();
  });

  it('is disabled without a plan, even with text', () => {
    const send = fakeSend();
    const box = setup(send, { noPlan: true });
    fireEvent.change(box, { target: { value: 'مرحبا' } });
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(send.send).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: ar.chat.composer.send }),
    ).toBeDisabled();
  });

  it('is disabled while rate limited', () => {
    const send = fakeSend({ canSend: false, rateLimitSeconds: 20 });
    const box = setup(send);
    fireEvent.change(box, { target: { value: 'مرحبا' } });
    expect(
      screen.getByRole('button', { name: ar.chat.composer.send }),
    ).toBeDisabled();
  });

  it('shows Stop instead of Send while an answer is being written', () => {
    const send = fakeSend({ isBusy: true, status: 'streaming' });
    setup(send);
    fireEvent.click(
      screen.getByRole('button', { name: ar.chat.composer.stop }),
    );
    expect(send.stop).toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: ar.chat.composer.send }),
    ).not.toBeInTheDocument();
  });

  it('keeps the draft in the store', () => {
    const box = setup(fakeSend());
    fireEvent.change(box, { target: { value: 'مسودة' } });
    expect(useChatStore.getState().drafts[NEW_CHAT]).toBe('مسودة');
  });
});
