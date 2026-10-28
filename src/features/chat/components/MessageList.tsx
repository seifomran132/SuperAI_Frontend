import { useCallback, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import type { MessageDto, ModeDto } from '~/api/generated/types.gen';
import { cn } from '~/lib/utils';
import { useAttachmentImage } from '../model/useAttachmentImage';
import type { AspectRatio } from '../model/image-options';
import { AssistantMessage, UserMessage } from './MessageCard';

/** How far from the bottom still counts as "following" the answer. */
const NEAR_BOTTOM_PX = 120;
const NEAR_TOP_PX = 120;

export interface MessageListProps {
  messages: MessageDto[];
  modes: ModeDto[];
  /** A send in this tab, before the server has created the answer. */
  preparing: { modeKey: string } | null;
  /** A send in this tab is writing into this conversation. */
  local: boolean;
  canRetry: boolean;
  onRetry: (text: string, modeKey: string | null) => void;
  /** Chosen image ratio of this conversation, for the «creating» placeholder. */
  creatingRatio?: AspectRatio | null;
  hasOlder: boolean;
  isFetchingOlder: boolean;
  olderFailed: boolean;
  onLoadOlder: () => void;
}

const placeholder = (modeKey: string): MessageDto => ({
  id: 'preparing-placeholder',
  sequence: Number.MAX_SAFE_INTEGER,
  role: 'assistant',
  content: '',
  status: 'streaming',
  modeKey,
  finishReason: 'stop',
  errorCode: null,
  createdAt: new Date(0).toISOString(),
  completedAt: null,
  attachments: [],
  costUsd: null,
  usage: null,
});

/**
 * Oldest → newest. Older messages load when scrolling up without moving what
 * the user is reading; new text keeps the view at the bottom only while the
 * user is already near it.
 */
export function MessageList({
  messages,
  modes,
  preparing,
  local,
  canRetry,
  onRetry,
  creatingRatio,
  hasOlder,
  isFetchingOlder,
  olderFailed,
  onLoadOlder,
}: MessageListProps) {
  const { t } = useTranslation();
  const scroller = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const anchor = useRef<{ height: number; top: number } | null>(null);
  const firstId = useRef<string | null>(null);
  const lastUserId = useRef<string | null>(null);

  // Keeps the cards memoised: the parent's callback changes every render.
  const retryRef = useRef(onRetry);
  useLayoutEffect(() => {
    retryRef.current = onRetry;
  });
  const stableRetry = useCallback(
    (text: string, modeKey: string | null) => retryRef.current(text, modeKey),
    [],
  );

  // After a failure older pages load only through the retry button.
  const requestOlder = useCallback(
    (manual = false) => {
      const el = scroller.current;
      if (!el || !hasOlder || isFetchingOlder || (olderFailed && !manual))
        return;
      anchor.current = { height: el.scrollHeight, top: el.scrollTop };
      onLoadOlder();
    },
    [hasOlder, isFetchingOlder, olderFailed, onLoadOlder],
  );

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    nearBottom.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    if (el.scrollTop < NEAR_TOP_PX) requestOlder();
  };

  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const first = messages[0]?.id ?? null;
    // The user just sent: show their message even if they had scrolled up.
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    const justSent =
      lastUser !== undefined &&
      lastUserId.current !== null &&
      lastUser.id !== lastUserId.current;
    lastUserId.current = lastUser?.id ?? lastUserId.current;
    const prependedOlder =
      anchor.current !== null &&
      firstId.current !== null &&
      first !== firstId.current;
    if (prependedOlder && anchor.current) {
      // Older page arrived above: keep the same message under the finger.
      el.scrollTop =
        anchor.current.top + (el.scrollHeight - anchor.current.height);
      anchor.current = null;
    } else if (firstId.current === null || nearBottom.current || justSent) {
      el.scrollTop = el.scrollHeight;
    }
    firstId.current = first;
    // Short history with more above: nothing to scroll, so fetch directly.
    if (hasOlder && !isFetchingOlder && el.scrollHeight <= el.clientHeight) {
      requestOlder();
    }
  }, [
    messages,
    preparing,
    hasOlder,
    isFetchingOlder,
    olderFailed,
    requestOlder,
  ]);

  return (
    <div
      ref={scroller}
      onScroll={onScroll}
      className="h-full overflow-y-auto overscroll-contain"
    >
      <div
        className={cn(
          'mx-auto flex w-full max-w-[860px] flex-col gap-6 px-4 py-6 sm:px-6',
        )}
      >
        {hasOlder ? (
          <div className="flex justify-center">
            {olderFailed ? (
              <Alert
                variant="danger"
                action={
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => requestOlder(true)}
                  >
                    {t('common.retry')}
                  </Button>
                }
              >
                {t('chat.list.olderError')}
              </Alert>
            ) : (
              <p
                role={isFetchingOlder ? 'status' : undefined}
                className="text-fg-subtle text-sm"
              >
                {isFetchingOlder ? t('chat.list.loadingOlder') : null}
              </p>
            )}
          </div>
        ) : null}

        {messages.map((message, index) =>
          message.role === 'user' ? (
            <UserMessage
              key={message.id}
              message={message}
              attachments={message.attachments}
              useImage={useAttachmentImage}
            />
          ) : (
            <AssistantMessage
              key={message.id}
              message={message}
              modes={modes}
              local={local}
              retryText={
                // An image is used by one message only (§8.2), so a question
                // with an image is re-sent by attaching it again, not here.
                canRetry &&
                messages[index - 1]?.role === 'user' &&
                messages[index - 1]!.attachments.length === 0
                  ? messages[index - 1]!.content
                  : undefined
              }
              onRetry={stableRetry}
              creatingRatio={creatingRatio}
            />
          ),
        )}

        {preparing ? (
          <AssistantMessage
            message={placeholder(preparing.modeKey)}
            modes={modes}
            local
            creatingRatio={creatingRatio}
          />
        ) : null}
      </div>
    </div>
  );
}
