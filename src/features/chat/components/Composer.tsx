import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AgentDto } from '~/api/generated/types.gen';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { useOnline } from '~/lib/useOnline';
import { useChatStore, type ConversationKey } from '../model/chat-store';
import type { Refusal } from '../model/refusals';
import type { useSendMessage } from '../model/useSendMessage';
import { useSelectedMode } from '../model/useChatQueries';
import { FieldRefusalText, isFieldRefusal } from './ChatNotice';
import { canSend, modeBlocksImage } from '../model/can-send';
import {
  initialAttachmentState,
  liveCount,
  MAX_IMAGES,
  readyAttachments,
} from '../model/attachment-draft';
import { attachmentKey } from '../model/queries';
import type { ComposerImageInput } from '../model/image-input';
import {
  AttachButton,
  DropZoneOverlay,
  pastedImages,
  useFileDrop,
} from './ImageAttach';
import { AttachmentTile } from './AttachmentTile';
import { ImageModeNotice, TooManyImagesNotice } from './ImageNotices';
import { ImageRatioMenu } from './ImageRatioMenu';
import { ModeSelector } from './ModeSelector';

const MAX_HEIGHT_PX = 200;

export interface ComposerProps {
  storeKey: ConversationKey;
  /** The conversation's last mode: the default for the next message. */
  conversationModeKey?: string | null;
  send: ReturnType<typeof useSendMessage>;
  /** No active subscription: sending would be refused, so it is disabled up front. */
  noPlan: boolean;
  refusal?: Refusal;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  /** Image input state and handlers. Without it the composer is text-only. */
  imageInput?: ComposerImageInput;
  /** Agents offered in the mode menu (F13). */
  agents?: AgentDto[];
  onStartAgent?: (agentKey: string) => void;
  startingAgent?: string | null;
}

/** Message box with the mode chip inside; Enter sends, Shift+Enter adds a line. */
export function Composer({
  storeKey,
  conversationModeKey,
  send,
  noPlan,
  refusal,
  textareaRef,
  imageInput,
  agents,
  onStartAgent,
  startingAgent,
}: ComposerProps) {
  const { t } = useTranslation();
  const draft = useChatStore((s) => s.drafts[storeKey] ?? '');
  const setDraft = useChatStore((s) => s.setDraft);
  const { modeKey, modes, setMode } = useSelectedMode(
    storeKey,
    conversationModeKey,
  );
  const fieldError = isFieldRefusal(refusal);

  // The ratio menu exists only in an image mode; «تلقائي» is null and sends nothing.
  const generatesImages =
    modes.find((mode) => mode.key === modeKey)?.generatesImages === true;
  const aspectRatio = useChatStore((s) => s.aspectRatios[storeKey] ?? null);
  const setAspectRatio = useChatStore((s) => s.setAspectRatio);
  const imageOptions =
    generatesImages && aspectRatio ? { aspectRatio } : undefined;

  const online = useOnline();

  // Attaching is offered only when at least one mode on the plan reads images.
  const imagesAvailable =
    imageInput !== undefined &&
    modes.some((mode) => imageInput.modeSupportsImages(mode.key));
  const image = imagesAvailable ? imageInput : undefined;
  const images = image?.draft ?? initialAttachmentState;
  const modeReadsImages =
    image !== undefined && modeKey !== null
      ? image.modeSupportsImages(modeKey)
      : true;
  const draftOk = image
    ? canSend({
        images,
        text: draft,
        modeSupportsImages: modeReadsImages,
      })
    : draft.trim() !== '';
  const dragging = useFileDrop(image !== undefined, (files) =>
    image?.addFiles(files),
  );

  const canSubmit =
    online && draftOk && send.canSend && !noPlan && modeKey !== null;

  // Grows with the text up to a cap, then scrolls.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [draft, textareaRef]);

  // Keep the box usable after a refusal puts the text back.
  useEffect(() => {
    if (refusal && draft) textareaRef.current?.focus();
  }, [refusal]);

  // Stop becomes a disabled Send when the answer ends: keep keyboard users in the box.
  const actionRef = useRef<HTMLButtonElement>(null);
  const wasBusy = useRef(send.isBusy);
  useEffect(() => {
    if (
      wasBusy.current &&
      !send.isBusy &&
      document.activeElement === actionRef.current
    ) {
      textareaRef.current?.focus();
    }
    wasBusy.current = send.isBusy;
  }, [send.isBusy, textareaRef]);

  // The images being sent: their tiles are hidden until the server accepts the
  // message (then they are cleared) or refuses it (then they show again).
  const [sendingImage, setSendingImage] = useState(false);
  const qc = useQueryClient();

  const submit = () => {
    if (!canSubmit || modeKey === null) return;
    // In the order the user added them, each upload once.
    const ready = readyAttachments(images);
    if (ready.length === 0 || !image) {
      if (imageOptions) void send.send(draft, modeKey, { imageOptions });
      else void send.send(draft, modeKey);
      return;
    }
    // The message shows the local files at once instead of downloading them back.
    for (const item of ready) {
      qc.setQueryData(attachmentKey(item.uploadId), item.file);
    }
    setSendingImage(true);
    void send
      .send(draft, modeKey, {
        attachments: ready.map((item) => item.attachment),
        onAccepted: image.clear,
        imageOptions,
      })
      .then((outcome) => {
        setSendingImage(false);
        // An upload is gone or used: it cannot be sent again; attach anew.
        if (
          outcome.kind === 'refused' &&
          outcome.refusal.code === 'OTHER' &&
          (outcome.refusal.errorCode === 'ATTACHMENT_NOT_FOUND' ||
            outcome.refusal.errorCode === 'ATTACHMENT_ALREADY_USED')
        ) {
          image.clear();
        }
      });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return;
    // Enter that confirms an IME composition must not send.
    if (event.nativeEvent.isComposing) return;
    event.preventDefault();
    submit();
  };

  return (
    <div className="flex flex-col gap-2">
      {dragging ? <DropZoneOverlay /> : null}
      {image && modeBlocksImage(images, modeReadsImages) ? (
        <ImageModeNotice />
      ) : null}
      {image?.draft.notice ? <TooManyImagesNotice /> : null}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className={cn(
          'bg-surface flex flex-col gap-1 rounded-lg border p-3 transition-colors',
          'focus-within:outline-focus focus-within:outline-solid focus-within:outline-2 focus-within:outline-offset-2',
          fieldError ? 'border-danger' : 'border-border-control',
        )}
      >
        {image && !sendingImage && images.tiles.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <ul
              aria-label={t('chat.image.attachedList')}
              className="flex flex-wrap items-start gap-3"
            >
              {images.tiles.map((tile) => (
                <li key={tile.key} className="max-w-full">
                  <AttachmentTile
                    draft={tile.draft}
                    onRemove={() => image.remove(tile.key)}
                    onRetry={() => image.retry(tile.key)}
                  />
                </li>
              ))}
            </ul>
            {liveCount(images) < MAX_IMAGES ? (
              <p className="text-fg-subtle px-1 text-xs">
                {t('chat.image.limitHint', { max: MAX_IMAGES })}
              </p>
            ) : null}
          </div>
        ) : null}
        <textarea
          ref={textareaRef}
          rows={1}
          dir="auto"
          value={draft}
          onChange={(event) => setDraft(storeKey, event.target.value)}
          onKeyDown={onKeyDown}
          onPaste={
            image
              ? (event) => {
                  const files = pastedImages(event);
                  if (files.length === 0) return;
                  event.preventDefault();
                  image.addFiles(files);
                }
              : undefined
          }
          aria-label={t('chat.composer.label')}
          aria-invalid={fieldError || undefined}
          aria-describedby={fieldError ? 'composer-error' : undefined}
          placeholder={t('chat.composer.placeholder')}
          className="text-fg placeholder:text-fg-subtle max-h-[200px] min-h-12 w-full resize-none bg-transparent px-1 py-2 text-base leading-7 outline-hidden"
        />
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            {image ? <AttachButton onFiles={image.addFiles} /> : null}
            <ModeSelector
              modes={modes}
              modeKey={modeKey}
              onSelect={setMode}
              supportsImages={image?.modeSupportsImages}
              agents={agents}
              onStartAgent={onStartAgent}
              startingAgent={startingAgent}
            />
            {generatesImages ? (
              <ImageRatioMenu
                ratio={aspectRatio}
                onChange={(next) => setAspectRatio(storeKey, next)}
                disabled={send.isBusy}
              />
            ) : null}
          </div>
          {/* One button for both roles: swapping elements would drop focus to the page. */}
          <Button
            ref={actionRef}
            type={send.isBusy ? 'button' : 'submit'}
            size={send.isBusy ? 'sm' : 'icon'}
            onClick={
              send.isBusy
                ? (event) => {
                    // Stopping before the first stream event restores the draft and
                    // re-renders this button as type="submit" while the click is still
                    // being handled; the browser would then submit the form again.
                    event.preventDefault();
                    send.stop();
                  }
                : undefined
            }
            disabled={!send.isBusy && !canSubmit}
            aria-label={
              send.isBusy ? t('chat.composer.stop') : t('chat.composer.send')
            }
            title={
              !send.isBusy && !online
                ? t('chat.composer.sendOffline')
                : undefined
            }
            className={send.isBusy ? undefined : 'rounded-full'}
          >
            {send.isBusy ? (
              <>
                <Square aria-hidden="true" className="size-3.5 fill-current" />
                {t('chat.composer.stop')}
              </>
            ) : (
              <ArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
            )}
          </Button>
        </div>
      </form>
      {refusal && fieldError ? (
        <FieldRefusalText refusal={refusal} />
      ) : (
        <p className="text-fg-subtle hidden px-1 text-center text-xs sm:block">
          {t('chat.composer.helper')}
        </p>
      )}
    </div>
  );
}
