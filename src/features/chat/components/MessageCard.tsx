import { memo } from 'react';
import { Check, Copy, Info, RefreshCw, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import type { MessageDto, ModeDto } from '~/api/generated/types.gen';
import { cn } from '~/lib/utils';
import { messageState } from '../model/message-state';
import type {
  MessageAttachment,
  UseAttachmentImage,
} from '../model/image-input';
import type { AspectRatio } from '../model/image-options';
import { useAttachmentImage } from '../model/useAttachmentImage';
import { GeneratedImage, ImagePlaceholder } from './GeneratedImage';
import { MessageImage } from './MessageImage';
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
  attachments,
  useImage,
}: {
  message: MessageDto;
  /** Images of this message, shown above the text; needs `useImage` to load them. */
  attachments?: MessageAttachment[];
  useImage?: UseAttachmentImage;
}) {
  const { i18n } = useTranslation();
  const pending = messageState(message) === 'pending';
  const images = attachments ?? [];
  return (
    <div className="flex flex-col items-start gap-1.5">
      {images.length > 0 && useImage ? (
        <div
          className={cn(
            'bg-surface-muted flex max-w-[85%] flex-col gap-2 rounded-lg p-2',
            pending && 'opacity-70',
          )}
        >
          {images.map((attachment) => (
            <MessageImage
              key={attachment.id}
              attachment={attachment}
              useImage={useImage}
            />
          ))}
          {message.content !== '' ? (
            <div
              dir="auto"
              className="text-fg px-2 pb-1 text-base leading-7 wrap-anywhere whitespace-pre-wrap"
            >
              {message.content}
            </div>
          ) : null}
        </div>
      ) : (
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
      )}
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
  /** The question this answer belongs to; with `onRetry`, offers a re-send. */
  retryText?: string;
  /** Re-sends the question as a new message (must be a stable function). */
  onRetry?: (text: string, modeKey: string | null) => void;
  /** Ratio the conversation asked for, for the «creating» placeholder; null/undefined is square. */
  creatingRatio?: AspectRatio | null;
}

export const AssistantMessage = memo(function AssistantMessage({
  message,
  modes,
  local,
  retryText,
  onRetry,
  creatingRatio,
}: AssistantMessageProps) {
  const { t, i18n } = useTranslation();
  const brandName = useBrandName();
  const { copied, copy } = useCopy();
  const state = messageState(message);
  const streaming = state === 'streaming';
  const failed = state === 'failed';
  const hasText = message.content.trim() !== '';
  const images = message.attachments ?? [];
  // An image answer still being written, with no image yet: show where it will appear.
  const creating =
    streaming &&
    images.length === 0 &&
    modes.find((mode) => mode.key === message.modeKey)?.generatesImages ===
      true;
  const [ratioW, ratioH] = (creatingRatio ?? '1:1').split(':').map(Number) as [
    number,
    number,
  ];
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
        {/* While an image is being created its placeholder is the only status (one announcement). */}
        {streaming && !hasText && !creating ? (
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

        {images.length > 0 || creating ? (
          <div className={cn('flex flex-col gap-3', hasText && 'mt-4')}>
            {images.map((attachment) => (
              <GeneratedImage
                key={attachment.id}
                attachment={attachment}
                useImage={useAttachmentImage}
              />
            ))}
            {creating ? (
              <ImagePlaceholder
                width={ratioW}
                height={ratioH}
                label={t('chat.image.creating')}
              />
            ) : null}
          </div>
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

        {cutShort && (hasText || images.length > 0) ? (
          <p className="text-fg-subtle mt-3 flex items-center gap-1.5 text-sm">
            <Info aria-hidden="true" className="size-4 shrink-0" />
            {t('chat.message.cut')}
          </p>
        ) : null}

        {showFooter ? (
          <footer className="border-border-subtle mt-4 flex items-center justify-end gap-3 border-t pt-3">
            {/* Per-answer cost is not shown (decision 2026-10-15); the balance chip shows what is left. */}
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
