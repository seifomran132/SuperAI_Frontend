import {
  useEffect,
  useLayoutEffect,
  type KeyboardEvent,
  type RefObject,
} from 'react';
import { ArrowRight, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { useChatStore, type ConversationKey } from '../model/chat-store';
import type { Refusal } from '../model/refusals';
import type { useSendMessage } from '../model/useSendMessage';
import { useSelectedMode } from '../model/useChatQueries';
import { FieldRefusalText, isFieldRefusal } from './ChatNotice';
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
}

/** Message box with the mode chip inside; Enter sends, Shift+Enter adds a line. */
export function Composer({
  storeKey,
  conversationModeKey,
  send,
  noPlan,
  refusal,
  textareaRef,
}: ComposerProps) {
  const { t } = useTranslation();
  const draft = useChatStore((s) => s.drafts[storeKey] ?? '');
  const setDraft = useChatStore((s) => s.setDraft);
  const { modeKey, modes, setMode } = useSelectedMode(
    storeKey,
    conversationModeKey,
  );
  const fieldError = isFieldRefusal(refusal);

  const canSubmit =
    draft.trim() !== '' && send.canSend && !noPlan && modeKey !== null;

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

  const submit = () => {
    if (!canSubmit || modeKey === null) return;
    void send.send(draft, modeKey);
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
        <textarea
          ref={textareaRef}
          rows={1}
          dir="auto"
          value={draft}
          onChange={(event) => setDraft(storeKey, event.target.value)}
          onKeyDown={onKeyDown}
          aria-label={t('chat.composer.label')}
          aria-invalid={fieldError || undefined}
          aria-describedby={fieldError ? 'composer-error' : undefined}
          placeholder={t('chat.composer.placeholder')}
          className="text-fg placeholder:text-fg-subtle max-h-[200px] min-h-12 w-full resize-none bg-transparent px-1 py-2 text-base leading-7 outline-hidden"
        />
        <div className="flex items-center justify-between gap-3">
          <ModeSelector modes={modes} modeKey={modeKey} onSelect={setMode} />
          {send.isBusy ? (
            <Button
              type="button"
              size="sm"
              onClick={send.stop}
              aria-label={t('chat.composer.stop')}
            >
              <Square aria-hidden="true" className="size-3.5 fill-current" />
              {t('chat.composer.stop')}
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!canSubmit}
              aria-label={t('chat.composer.send')}
              className="rounded-full"
            >
              <ArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
            </Button>
          )}
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
