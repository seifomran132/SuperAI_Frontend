import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ar from '~/i18n/ar.json';
import errorsAr from '~/i18n/errors.ar.json';
import {
  chatMock,
  refusals,
  seedConversation,
  type Refuse,
} from '~/mocks/chat';
import { renderApp, useAuthMocks } from '~/test/render-app';
import {
  clickLikeUser,
  composer,
  readyComposer,
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

describe('refusal opening the request dialog', () => {
  it('NO_ACTIVE_SUBSCRIPTION: notice with «تواصل معنا» opening the dialog', async () => {
    await refuseWith(refusals.NO_ACTIVE_SUBSCRIPTION);
    expect(
      await screen.findByText(errorsAr.NO_ACTIVE_SUBSCRIPTION),
    ).toBeInTheDocument();
    expect(composer()).toHaveValue(DRAFT);
    clickLikeUser(
      screen.getByRole('button', { name: ar.chat.notice.contactUs }),
    );
    expect(
      await screen.findByRole('dialog', { name: ar.chat.requestBalance.title }),
    ).toBeInTheDocument();
  });
});
