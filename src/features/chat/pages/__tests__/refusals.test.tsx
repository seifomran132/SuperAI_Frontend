import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ar from '~/i18n/ar.json';
import errorsAr from '~/i18n/errors.ar.json';
import {
  chatCalls,
  chatMock,
  refusals,
  seedConversation,
  type Refuse,
} from '~/mocks/chat';
import { renderApp, useAuthMocks } from '~/test/render-app';
import { useChatStore } from '../../model/chat-store';
import {
  clickLikeUser,
  composer,
  readyComposer,
  sendButton,
  sends,
  typeAndSend,
  useChatTestState,
} from './support';

useAuthMocks();
useChatTestState();
afterEach(() => vi.useRealTimers());

const DRAFT = 'رسالتي المهمة';

/** An existing conversation (no creation step), already open with a ready composer. */
async function openConversation() {
  const conv = seedConversation({ title: 'محادثة' }, 2);
  const app = await renderApp(`/chat/${conv.id}`);
  await readyComposer();
  await screen.findByText('رسالة 1');
  return { conv, ...app };
}

async function refuseWith(refusal: Refuse) {
  chatMock.send = refusal;
  const app = await openConversation();
  await typeAndSend(DRAFT);
  return app;
}

const modeChip = () =>
  screen.getByRole('button', { name: ar.chat.composer.modeMenu });

describe('refusals keep the draft and show the right notice', () => {
  it('INSUFFICIENT_BALANCE: switch button changes only the mode and never sends', async () => {
    chatMock.send = refusals.INSUFFICIENT_BALANCE;
    const { conv } = await openConversation();
    useChatStore.getState().setMode(conv.id, 'professional');
    await waitFor(() => expect(modeChip()).toHaveTextContent('احترافي'));
    await typeAndSend(DRAFT);

    const switchButton = await screen.findByRole('button', {
      name: /التبديل إلى «سريع»/,
    });
    expect(switchButton).toHaveTextContent('0.0030$');
    // The notice quotes the estimate and the balance from `data`.
    expect(
      screen.getByText(/رصيدك غير كافٍ لهذه الرسالة في وضع «احترافي»/),
    ).toHaveTextContent('0.0120$');
    expect(composer()).toHaveValue(DRAFT);
    expect(sends()).toHaveLength(1);

    fireEvent.click(switchButton);

    await waitFor(() => expect(modeChip()).toHaveTextContent('سريع'));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });
    expect(sends()).toHaveLength(1);
    expect(composer()).toHaveValue(DRAFT);
  });

  it('MODE_NOT_AVAILABLE: notice, modes refetched, first available mode selected', async () => {
    chatMock.send = refusals.MODE_NOT_AVAILABLE;
    const { conv } = await openConversation();
    useChatStore.getState().setMode(conv.id, 'professional');
    await waitFor(() => expect(modeChip()).toHaveTextContent('احترافي'));
    const modeRequests = chatCalls('listModes').length;
    // The plan lost the mode meanwhile.
    chatMock.modes = chatMock.modes.filter((m) => m.key === 'fast');
    await typeAndSend(DRAFT);

    expect(
      await screen.findByText(errorsAr.MODE_NOT_AVAILABLE),
    ).toBeInTheDocument();
    await waitFor(() => expect(modeChip()).toHaveTextContent('سريع'));
    expect(chatCalls('listModes').length).toBeGreaterThan(modeRequests);
    expect(composer()).toHaveValue(DRAFT);
    expect(sends()).toHaveLength(1);
  });

  it('CONVERSATION_BUSY: notice and the messages are refetched', async () => {
    chatMock.send = refusals.CONVERSATION_BUSY;
    const { conv } = await openConversation();
    const before = chatCalls('listMessages').filter(
      (c) => (c.body as { id: string }).id === conv.id,
    ).length;
    await typeAndSend(DRAFT);
    expect(await screen.findByText(ar.chat.notice.busy)).toBeInTheDocument();
    await waitFor(() =>
      expect(
        chatCalls('listMessages').filter(
          (c) => (c.body as { id: string }).id === conv.id,
        ).length,
      ).toBeGreaterThan(before),
    );
    expect(composer()).toHaveValue(DRAFT);
  });

  it('CONTEXT_TOO_LONG: text under the composer', async () => {
    await refuseWith(refusals.CONTEXT_TOO_LONG);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(errorsAr.CONTEXT_TOO_LONG);
    expect(composer()).toHaveValue(DRAFT);
    expect(composer()).toBeInvalid();
  });

  it('VALIDATION_FAILED: text under the composer', async () => {
    await refuseWith(refusals.VALIDATION_FAILED);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(errorsAr.VALIDATION_FAILED);
    expect(composer()).toHaveValue(DRAFT);
  });

  it('DUPLICATE_REQUEST is silent: messages are refetched and the draft is cleared', async () => {
    chatMock.send = refusals.DUPLICATE_REQUEST;
    const { conv } = await openConversation();
    const before = chatCalls('listMessages').length;
    await typeAndSend(DRAFT);
    await waitFor(() =>
      expect(chatCalls('listMessages').length).toBeGreaterThan(before),
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(ar.chat.notice.busy)).not.toBeInTheDocument();
    expect(composer()).toHaveValue('');
    expect(useChatStore.getState().refusals[conv.id]).toBeUndefined();
    expect(sends()).toHaveLength(1);
  });

  it('PROFILE_INCOMPLETE goes to /complete-profile', async () => {
    const { here } = await refuseWith(refusals.PROFILE_INCOMPLETE);
    await waitFor(() => expect(here()).toMatch(/^\/complete-profile/));
  });

  it('a network failure keeps the draft; Retry reuses the same clientRequestId', async () => {
    chatMock.send = { kind: 'network-error' };
    await openConversation();
    await typeAndSend(DRAFT);
    expect(await screen.findByText(ar.common.networkError)).toBeInTheDocument();
    expect(composer()).toHaveValue(DRAFT);

    chatMock.send = { kind: 'normal' };
    fireEvent.click(screen.getByRole('button', { name: ar.common.retry }));
    expect(await screen.findByText(/تعمل الباقات هكذا\./)).toBeInTheDocument();

    const bodies = sends().map(
      (c) => c.body as { clientRequestId: string; content: string },
    );
    expect(bodies).toHaveLength(2);
    expect(bodies[1]!.clientRequestId).toBe(bodies[0]!.clientRequestId);
    expect(bodies[1]!.content).toBe(DRAFT);
  });

  it('a new chat refused on the first send reuses its conversation on the next send', async () => {
    chatMock.send = refusals.CONVERSATION_BUSY;
    await renderApp('/chat');
    await readyComposer();
    await typeAndSend(DRAFT);
    expect(await screen.findByText(ar.chat.notice.busy)).toBeInTheDocument();
    expect(composer()).toHaveValue(DRAFT);

    chatMock.send = { kind: 'normal' };
    await waitFor(() => expect(sendButton()).toBeEnabled());
    fireEvent.click(sendButton());
    expect(await screen.findByText(/تعمل الباقات هكذا\./)).toBeInTheDocument();
    expect(chatCalls('createConversation')).toHaveLength(1);
  });
});

describe('rate limit', () => {
  it('counts down from data.retryAfterSeconds, disables Send, then enables it again', async () => {
    // Only the clock is faked: the countdown recomputes from Date.now() on its
    // 1 s interval, so moving the clock is enough and nothing waits 42 s.
    vi.useFakeTimers({ toFake: ['Date'] });
    chatMock.send = refusals.RATE_LIMITED;
    await openConversation();
    await typeAndSend(DRAFT);

    const notice = await screen.findByText(/حاول بعد 42 ثانية/, {
      selector: '[aria-hidden=true] span',
    });
    expect(notice).toBeInTheDocument();
    expect(composer()).toHaveValue(DRAFT);
    expect(sendButton()).toBeDisabled();

    vi.setSystemTime(Date.now() + 40_000);
    await waitFor(() =>
      expect(
        screen.getByText(/حاول بعد 2 ثانية/, { selector: 'span' }),
      ).toBeInTheDocument(),
    );
    expect(sendButton()).toBeDisabled();

    vi.setSystemTime(Date.now() + 3_000);
    await waitFor(() => expect(sendButton()).toBeEnabled(), { timeout: 3000 });
    expect(screen.queryByText(/حاول بعد/)).not.toBeInTheDocument();
    expect(composer()).toHaveValue(DRAFT);

    chatMock.send = { kind: 'normal' };
    fireEvent.click(sendButton());
    expect(await screen.findByText(/تعمل الباقات هكذا\./)).toBeInTheDocument();
  });
});

// Last on purpose: a Radix dialog left open makes the next jsdom test spin forever.
describe('refusal without alternatives', () => {
  it('INSUFFICIENT_BALANCE without alternatives offers «تواصل معنا لإضافة رصيد» which opens the request dialog', async () => {
    await refuseWith({
      ...refusals.INSUFFICIENT_BALANCE,
      data: {
        estimatedCostUsd: '0.012000000',
        balanceUsd: '0.000000000',
        alternatives: [],
      },
    });
    const contact = await screen.findByRole('button', {
      name: ar.chat.notice.requestBalance,
    });
    expect(
      screen.queryByRole('button', { name: /التبديل إلى/ }),
    ).not.toBeInTheDocument();
    expect(composer()).toHaveValue(DRAFT);
    clickLikeUser(contact);
    const dialog = await screen.findByRole('dialog', {
      name: ar.chat.requestBalance.title,
    });
    expect(
      within(dialog).getByText(ar.chat.requestBalance.body),
    ).toBeInTheDocument();
    // The draft survives the dialog.
    expect(composer()).toHaveValue(DRAFT);
    expect(sends()).toHaveLength(1);
  });
});
