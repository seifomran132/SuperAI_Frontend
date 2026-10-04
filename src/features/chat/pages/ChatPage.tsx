import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import type { MessageDto } from '~/api/generated/types.gen';
import { isApiError } from '~/api/errors';
import {
  ChatNotice,
  NoPlanNotice,
  RefusalNotice,
  isFieldRefusal,
} from '../components/ChatNotice';
import { Composer } from '../components/Composer';
import { EmptyState } from '../components/EmptyState';
import { MessageList } from '../components/MessageList';
import { RequestBalanceDialog } from '../components/RequestBalanceDialog';
import { useNoPlan } from '../components/useNoPlan';
import { NEW_CHAT, useChatStore } from '../model/chat-store';
import {
  useBalance,
  useConversation,
  useMessages,
  useModes,
  useSelectedMode,
} from '../model/useChatQueries';
import { useResumeRefresh } from '../model/useResumeRefresh';
import { useSendMessage } from '../model/useSendMessage';

function MessagesSkeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="mx-auto flex w-full max-w-[860px] flex-col gap-6 px-4 py-6 sm:px-6"
    >
      <div className="bg-surface-muted h-12 w-2/3 animate-pulse rounded-lg" />
      <div className="bg-surface-muted h-40 animate-pulse rounded-lg" />
      <div className="bg-surface-muted h-12 w-1/2 animate-pulse rounded-lg" />
    </div>
  );
}

function CenteredState({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex h-full w-full max-w-[440px] flex-col items-center justify-center gap-4 px-4 text-center">
      {children}
    </div>
  );
}

/** New chat (no id) or an existing conversation: messages, notices and the composer. */
export function ChatPage({ conversationId }: { conversationId?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const key = conversationId ?? NEW_CHAT;
  const [balanceDialog, setBalanceDialog] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const dialogOpener = useRef<HTMLElement | null>(null);
  const openBalanceDialog = () => {
    dialogOpener.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setBalanceDialog(true);
  };

  const conversation = useConversation(conversationId);
  const messagesQuery = useMessages(conversationId);
  const modesQuery = useModes();
  const { balanceUsd } = useBalance();
  const noPlan = useNoPlan();
  const selected = useSelectedMode(key, conversation.data?.modeKey);
  const setDraft = useChatStore((s) => s.setDraft);

  const send = useSendMessage(key, {
    // A new chat becomes /chat/:id once the server has accepted the message.
    onStarted: (id) => {
      if (conversationId) return;
      void navigate({
        to: '/chat/$conversationId',
        params: { conversationId: id },
        replace: true,
      });
    },
  });
  useResumeRefresh(conversationId);

  const refusal = send.refusal;
  useEffect(() => {
    if (refusal?.code === 'PROFILE_INCOMPLETE') {
      void navigate({
        to: '/complete-profile',
        search: {
          redirect: conversationId ? `/chat/${conversationId}` : '/chat',
        },
      });
    }
  }, [refusal, navigate, conversationId]);

  // Before the conversation exists the optimistic message lives in the registry only.
  const messages = useMemo<MessageDto[]>(() => {
    if (conversationId || !send.pending) return messagesQuery.messages;
    const now = new Date().toISOString();
    return [
      {
        id: 'pending:new-chat',
        sequence: 1,
        role: 'user',
        content: send.pending.content,
        status: 'complete',
        modeKey: send.pending.modeKey,
        finishReason: 'stop',
        errorCode: null,
        createdAt: now,
        completedAt: now,
      },
    ];
  }, [conversationId, send.pending, messagesQuery.messages]);

  const notFound =
    Boolean(conversationId) &&
    (conversation.notFound || messagesQuery.notFound);

  const onRetryAnswer = (text: string, modeKey: string | null) => {
    const usable =
      modeKey && selected.modes.some((m) => m.key === modeKey)
        ? modeKey
        : selected.modeKey;
    if (usable) void send.send(text, usable);
  };

  const preparing =
    send.status === 'creating' || send.status === 'preparing'
      ? { modeKey: send.pending?.modeKey ?? selected.modeKey ?? '' }
      : null;

  let body: ReactNode;
  if (notFound) {
    body = (
      <CenteredState>
        <p className="text-fg text-lg font-semibold">
          {t('errors:CONVERSATION_NOT_FOUND')}
        </p>
        <Button asChild>
          <Link to="/chat">{t('chat.notFound.action')}</Link>
        </Button>
      </CenteredState>
    );
  } else if (conversationId && messagesQuery.status === 'pending') {
    body = <MessagesSkeleton label={t('chat.list.loading')} />;
  } else if (conversationId && messagesQuery.status === 'error') {
    const error = messagesQuery.error;
    body = (
      <CenteredState>
        <Alert
          variant="danger"
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void messagesQuery.refetch()}
            >
              {t('common.retry')}
            </Button>
          }
        >
          {isApiError(error)
            ? t(`errors:${error.code}`, { defaultValue: t('chat.list.error') })
            : t('chat.list.error')}
        </Alert>
      </CenteredState>
    );
  } else if (messages.length === 0 && !preparing) {
    body = (
      <EmptyState
        onPick={(text) => {
          setDraft(key, text);
          textarea.current?.focus();
        }}
      />
    );
  } else {
    body = (
      <MessageList
        // A different conversation starts at its own bottom.
        key={conversationId ?? NEW_CHAT}
        messages={messages}
        modes={modesQuery.modes}
        balanceUsd={balanceUsd}
        preparing={preparing}
        local={send.isBusy}
        canRetry={send.canSend && !noPlan}
        onRetry={onRetryAnswer}
        hasOlder={Boolean(messagesQuery.hasOlder)}
        isFetchingOlder={messagesQuery.isFetchingOlder}
        olderFailed={messagesQuery.isFetchNextPageError}
        onLoadOlder={() => void messagesQuery.fetchOlder()}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">{body}</div>
      {notFound ? null : (
        <div className="shrink-0 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
          <div className="mx-auto flex w-full max-w-[860px] flex-col gap-3">
            {noPlan ? (
              <NoPlanNotice onRequestBalance={openBalanceDialog} />
            ) : refusal && !isFieldRefusal(refusal) ? (
              <RefusalNotice
                refusal={refusal}
                modes={modesQuery.modes}
                selectedModeKey={selected.modeKey}
                onSwitchMode={selected.setMode}
                onRequestBalance={openBalanceDialog}
                onRetry={() => void send.retry()}
                rateLimitSeconds={send.rateLimitSeconds}
              />
            ) : null}
            {modesQuery.isError ? (
              <ChatNotice
                tone="danger"
                action={
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => void modesQuery.refetch()}
                  >
                    {t('common.retry')}
                  </Button>
                }
              >
                {t('common.networkError')}
              </ChatNotice>
            ) : null}
            <Composer
              storeKey={key}
              conversationModeKey={conversation.data?.modeKey}
              send={send}
              noPlan={noPlan}
              refusal={refusal}
              textareaRef={textarea}
            />
          </div>
        </div>
      )}
      <RequestBalanceDialog
        open={balanceDialog}
        onOpenChange={setBalanceDialog}
        onCloseAutoFocus={(event) => {
          // The button that opened it may be gone (the notice cleared): fall back to the message box.
          event.preventDefault();
          const opener = dialogOpener.current;
          (opener?.isConnected ? opener : textarea.current)?.focus();
        }}
      />
    </div>
  );
}
