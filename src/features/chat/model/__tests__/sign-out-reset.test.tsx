import { act, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import ar from '~/i18n/ar.json';
import { auth } from '~/lib/auth/client';
import { signOut } from '~/features/auth';
import { authMock, defaultProfile } from '~/mocks/auth';
import { chatCalls, chatMock, conversation, resetChatMock } from '~/mocks/chat';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';
import {
  SESSION_ENDED,
  getStream,
  isStreaming,
  registerStream,
  stopAllStreams,
} from '../active-streams';
import { useChatStore } from '../chat-store';
import {
  clearMessageCosts,
  getMessageCost,
  recordMessageCost,
} from '../message-costs';
import { installChatSessionReset, onChatAuthChange } from '../session-reset';

useAuthMocks();

beforeEach(async () => {
  resetChatMock();
  useChatStore.getState().reset();
  clearMessageCosts();
  await signInDirectly();
});
afterEach(() => {
  stopAllStreams();
  useChatStore.getState().reset();
  clearMessageCosts();
});

const stream = (controller: AbortController) => ({
  status: 'streaming' as const,
  abortController: controller,
  clientRequestId: 'r1',
  content: 'نص جزئي',
  modeKey: 'fast',
});

describe('sign-out reset', () => {
  it('clears the cache and chat state, aborts streams, and the next user sees nothing', async () => {
    const mine = conversation({ title: 'عقد سري للمستخدم الأول' });
    chatMock.conversations = [mine];
    const { router, queryClient } = await renderApp('/chat');
    installChatSessionReset();
    const list = await screen.findByRole('navigation', {
      name: ar.shell.recent,
    });
    await within(list).findByText('عقد سري للمستخدم الأول');
    expect(queryClient.getQueryCache().getAll().length).toBeGreaterThan(0);

    const controller = new AbortController();
    registerStream(mine.id, stream(controller));
    useChatStore.getState().setDraft('new', 'مسودة المستخدم الأول');
    useChatStore.getState().setMode(mine.id, 'professional');
    recordMessageCost('m1', '0.001470000');

    await act(async () => {
      expect((await signOut()).errorKey).toBeNull();
    });

    // Streams: aborted with the session-ended reason and forgotten.
    expect(controller.signal.aborted).toBe(true);
    expect(controller.signal.reason).toBe(SESSION_ENDED);
    expect(isStreaming(mine.id)).toBe(false);
    expect(getStream(mine.id)).toBeUndefined();
    // UI state.
    const ui = useChatStore.getState();
    expect(ui.drafts).toEqual({});
    expect(ui.modes).toEqual({});
    expect(ui.drawerOpen).toBe(false);
    expect(getMessageCost('m1')).toBeUndefined();
    // Query cache: nothing of the first user's data is left.
    await act(async () => {
      await router.navigate({ to: '/sign-in' });
    });
    expect(
      JSON.stringify(
        queryClient
          .getQueryCache()
          .getAll()
          .map((q) => q.state.data),
      ),
    ).not.toContain('عقد سري للمستخدم الأول');

    // Another user signs in on the same tab.
    chatMock.conversations = [];
    authMock.me = {
      kind: 'ok',
      profile: {
        ...defaultProfile,
        id: '22222222-2222-4222-8222-222222222222',
        email: 'other@test.local',
        fullName: 'ليلى',
      },
    };
    const before = chatCalls('listConversations').length;
    await act(async () => {
      const { error } = await auth.signInWithPassword({
        email: 'other@test.local',
        password: 'password123',
      });
      expect(error).toBeNull();
      await router.navigate({ to: '/chat' });
    });

    expect(
      await screen.findByText(ar.shell.list.emptyTitle),
    ).toBeInTheDocument();
    expect(screen.queryByText('عقد سري للمستخدم الأول')).toBeNull();
    expect(screen.queryByText('مسودة المستخدم الأول')).toBeNull();
    const box = await screen.findByLabelText(ar.chat.composer.label);
    expect((box as HTMLTextAreaElement).value).toBe('');
    // Fetched again for the new user, not served from the old cache.
    expect(chatCalls('listConversations').length).toBeGreaterThan(before);
  });
});

describe('onChatAuthChange', () => {
  // The module remembers the last user id; start every test signed out.
  beforeEach(() => {
    onChatAuthChange('SIGNED_OUT', null);
  });

  const fill = () => {
    const controller = new AbortController();
    registerStream('c1', stream(controller));
    const s = useChatStore.getState();
    s.setDraft('c1', 'مسودة');
    s.setMode('c1', 'professional');
    s.setDrawerOpen(true);
    s.setRateLimitedUntil(Date.now() + 60_000);
    s.setNewChatConversationId('c9');
    recordMessageCost('m1', '0.5');
    return controller;
  };

  it('resets everything on SIGNED_OUT', () => {
    const controller = fill();
    expect(onChatAuthChange('SIGNED_IN', 'u1')).toBe(false);
    expect(controller.signal.aborted).toBe(false);

    expect(onChatAuthChange('SIGNED_OUT', null)).toBe(true);
    expect(controller.signal.reason).toBe(SESSION_ENDED);
    expect(useChatStore.getState()).toMatchObject({
      drafts: {},
      modes: {},
      refusals: {},
      drawerOpen: false,
      rateLimitedUntil: null,
      newChatConversationId: null,
    });
    expect(getMessageCost('m1')).toBeUndefined();
  });

  it('resets when another tab switches to a different user, but not on a token refresh', () => {
    onChatAuthChange('SIGNED_IN', 'u1');
    const controller = fill();
    expect(onChatAuthChange('TOKEN_REFRESHED', 'u1')).toBe(false);
    expect(useChatStore.getState().drafts).toEqual({ c1: 'مسودة' });
    expect(controller.signal.aborted).toBe(false);

    expect(onChatAuthChange('SIGNED_IN', 'u2')).toBe(true);
    expect(controller.signal.reason).toBe(SESSION_ENDED);
    expect(useChatStore.getState().drafts).toEqual({});
    expect(useChatStore.getState().drawerOpen).toBe(false);
  });
});
