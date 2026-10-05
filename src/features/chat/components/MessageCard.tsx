import { memo } from 'react';
import { Check, Copy, Info, RefreshCw, TriangleAlert } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { Money } from '~/components/Money';
import { Button } from '~/components/ui/button';
import type { MessageDto, ModeDto } from '~/api/generated/types.gen';
import { toDecimal } from '~/lib/money';
import { cn } from '~/lib/utils';
import { messageState } from '../model/message-state';
import { useMessageCost } from '../model/message-costs';
import { BrandMark, useBrandName } from './BrandMark';
import { Markdown } from './Markdown';
import { ModeChip } from './mode';
import { TypingDots } from './TypingDots';
import { useCopy } from './useCopy';

const clocks = new Map<string, Intl.DateTimeFormat>();

/** One formatter per locale: building an Intl.DateTimeFormat per message is slow. */
function clockFormat(language: string) {
  const locale = language === 'en' ? 'en' : 'ar-u-nu-latn';
  let format = clocks.get(locale);
  if (!format) {
    format = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      numberingSystem: 'latn',
    });
    clocks.set(locale, format);
  }
  return format;
}

/** What the user typed, shown exactly (no Markdown). */
export const UserMessage = memo(function UserMessage({
  message,
}: {
  message: MessageDto;
}) {
  const { i18n } = useTranslation();
  const pending = messageState(message) === 'pending';
  return (
    <div className="flex flex-col items-start gap-1.5">
      <div
        dir="auto"
        aria-busy={pending || undefined}
        className={cn(
          'bg-surface-muted text-fg max-w-[85%] rounded-lg px-4 py-3 text-base leading-7 wrap-anywhere whitespace-pre-wrap',
          pending && 'opacity-70',
        )}
      >
        {message.content}
      </div>
      {!pending ? (
        <time
          dateTime={message.createdAt}
          className="text-fg-subtle px-1 text-xs tabular-nums"
        >
          {clockFormat(i18n.language).format(new Date(message.createdAt))}
        </time>
      ) : null}
    </div>
  );
});

export interface AssistantMessageProps {
  message: MessageDto;
  modes: ModeDto[];
  /** An answer is being written by a send in this tab (not left over from an earlier visit). */
  local: boolean;
  /** Current balance, shown as "remaining" only on the newest answer. */
  remainingUsd?: string;
  /** The question this answer belongs to; with `onRetry`, offers a re-send. */
  retryText?: string;
  /** Re-sends the question as a new message (must be a stable function). */
  onRetry?: (text: string, modeKey: string | null) => void;
}

export const AssistantMessage = memo(function AssistantMessage({
  message,
  modes,
  local,
  remainingUsd,
  retryText,
  onRetry,
}: AssistantMessageProps) {
  const { t, i18n } = useTranslation();
  const brandName = useBrandName();
  const { copied, copy } = useCopy();
  const cost = useMessageCost(message.id);
  const state = messageState(message);
  const streaming = state === 'streaming';
  const failed = state === 'failed';
  const hasText = message.content.trim() !== '';
  const hasCost = cost !== undefined && !toDecimal(cost).isZero();
  const showFooter = !streaming && !failed && hasText;

  const failureKey = `errors:${message.errorCode}`;
  const failureText =
    message.errorCode && i18n.exists(failureKey)
      ? t(failureKey)
      : t('chat.message.failed');
  // An error after some text: the kept text stays, with the reason below it.
  const partialError = state === 'partial' && message.errorCode !== null;
  const cutShort =
    (state === 'cut' || state === 'stopped' || state === 'partial') &&
    !partialError;

  return (
    <article
      aria-busy={streaming || undefined}
      className="flex flex-col gap-2"
      data-state={state}
    >
      <header className="flex items-center gap-2">
        <BrandMark className="size-6 text-xs" />
        <span className="text-fg text-sm font-semibold">{brandName}</span>
        <ModeChip modeKey={message.modeKey} modes={modes} />
      </header>

      <div className="border-border-subtle bg-surface rounded-lg border px-5 py-4">
        {streaming && !hasText ? (
          <p
            role="status"
            className="text-fg-muted flex items-center gap-2 text-sm"
          >
            {local ? t('chat.message.preparing') : t('chat.message.writing')}
            <TypingDots />
          </p>
        ) : null}

        {failed ? (
          <div className="flex flex-col items-start gap-3">
            <p
              role="alert"
              className="text-danger flex items-start gap-2 text-sm font-medium"
            >
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0"
              />
              {failureText}
            </p>
            {hasCost ? (
              <p className="text-fg-subtle text-xs">
                <Trans
                  i18nKey="chat.message.cost"
                  components={{ cost: <Money value={cost} kind="cost" /> }}
                />
              </p>
            ) : null}
            {onRetry && retryText !== undefined ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onRetry(retryText, message.modeKey)}
              >
                <RefreshCw aria-hidden="true" className="size-4" />
                {t('chat.message.retry')}
              </Button>
            ) : null}
          </div>
        ) : null}

        {hasText ? (
          <Markdown text={message.content} streaming={streaming} />
        ) : null}

        {partialError && hasText ? (
          <p
            role="alert"
            className="text-danger mt-3 flex items-start gap-2 text-sm font-medium"
          >
            <TriangleAlert
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />
            {failureText}
          </p>
        ) : null}

        {cutShort && hasText ? (
          <p className="text-fg-subtle mt-3 flex items-center gap-1.5 text-sm">
            <Info aria-hidden="true" className="size-4 shrink-0" />
            {t('chat.message.cut')}
          </p>
        ) : null}

        {showFooter ? (
          <footer className="border-border-subtle mt-4 flex items-center justify-between gap-3 border-t pt-3">
            <p className="text-fg-subtle text-xs">
              {hasCost ? (
                remainingUsd !== undefined ? (
                  <Trans
                    i18nKey="chat.message.costWithBalance"
                    components={{
                      cost: <Money value={cost} kind="cost" />,
                      balance: <Money value={remainingUsd} />,
                    }}
                  />
                ) : (
                  <Trans
                    i18nKey="chat.message.cost"
                    components={{ cost: <Money value={cost} kind="cost" /> }}
                  />
                )
              ) : null}
            </p>
            <button
              type="button"
              onClick={() => void copy(message.content)}
              className="text-fg-muted hover:text-fg focus-visible:outline-focus inline-flex min-h-11 items-center gap-1.5 rounded-sm px-2 text-xs outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {copied ? (
                <Check aria-hidden="true" className="size-4" />
              ) : (
                <Copy aria-hidden="true" className="size-4" />
              )}
              {copied ? t('chat.message.copied') : t('chat.message.copy')}
            </button>
            <span role="status" className="sr-only">
              {copied ? t('chat.message.copied') : ''}
            </span>
          </footer>
        ) : null}
      </div>
    </article>
  );
});
