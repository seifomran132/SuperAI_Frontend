import { Suspense, lazy, memo } from 'react';
import { CircleCheck, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { MessageDto } from '~/api/generated/types.gen';
import { agentUi } from '../../model/agent';

// Loads with the first results, not with every chat.
const AgentResults = lazy(() => import('./AgentResults'));

/** The agent's name on its messages; brand fill, since an agent is not a mode (S25). */
export function AgentChip({ label }: { label: string }) {
  if (!label) return null;
  return (
    <span className="bg-brand text-on-brand inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold">
      <Palette aria-hidden="true" className="size-3.5" />
      {label}
    </span>
  );
}

/** «جارٍ التصميم… 1 من 2» while the designs are made (S27 frame 2). */
function Progress({ done, total }: { done: number; total: number }) {
  const { t } = useTranslation();
  return (
    <div role="status" className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-fg font-semibold">{t('chat.agent.working')}</span>
        <span dir="ltr" className="text-fg-muted text-sm tabular-nums">
          {t('chat.agent.workingCount', { done, total })}
        </span>
      </div>
      <div className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: Math.max(total, 1) }, (_, i) => (
          <span
            key={i}
            className={
              i < done
                ? 'bg-success h-2 flex-1 rounded-full'
                : 'bg-surface-muted h-2 flex-1 animate-pulse rounded-full motion-reduce:animate-none'
            }
          />
        ))}
      </div>
    </div>
  );
}

/**
 * One agent question: its text in the reader's language. The input is in the
 * dock; progress and results show here, so they stay in the history.
 */
export const AgentMessage = memo(function AgentMessage({
  message,
  label,
  canEditDesigns = false,
  onEditDesign,
}: {
  message: MessageDto;
  label: string;
  /** The conversation is at its results step: «تعديل» works on any design. */
  canEditDesigns?: boolean;
  onEditDesign?: (outputId: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const ui = agentUi(message);
  const text =
    i18n.language === 'en' && ui?.prompt?.en ? ui.prompt.en : message.content;
  return (
    <article className="bg-surface border-border-subtle flex flex-col items-start gap-2 rounded-lg border p-4">
      <AgentChip label={label} />
      {ui?.type === 'results' && ui.designs.length > 0 ? (
        <p className="text-success flex items-center gap-1.5 text-sm font-semibold">
          <CircleCheck aria-hidden="true" className="size-4" />
          {t('chat.agent.ready')}
        </p>
      ) : null}
      <p dir="auto" className="text-fg text-base leading-7 whitespace-pre-wrap">
        {ui?.type === 'results' && ui.designs.length === 0
          ? `${text}\n${t('chat.agent.noResults')}`
          : text}
      </p>
      {ui?.type === 'progress' ? (
        <Progress done={ui.done} total={ui.total} />
      ) : null}
      {ui?.type === 'results' && ui.designs.length > 0 ? (
        <Suspense fallback={null}>
          <AgentResults
            designs={ui.designs}
            canEdit={canEditDesigns}
            onEdit={onEditDesign}
          />
        </Suspense>
      ) : null}
    </article>
  );
});

const colorsOf = (message: MessageDto): string[] => {
  const value = message.answer?.value as { colors?: unknown } | undefined;
  return Array.isArray(value?.colors)
    ? value.colors.filter((c): c is string => typeof c === 'string')
    : [];
};

/** The user's answer to a step, as a user bubble; colours show as swatches. */
export const AgentReply = memo(function AgentReply({
  message,
}: {
  message: MessageDto;
}) {
  const colors = colorsOf(message);
  return (
    <div className="flex flex-col items-start">
      <div className="bg-surface-muted text-fg max-w-[85%] rounded-lg px-4 py-2.5 text-base leading-7">
        {colors.length > 0 ? (
          <span className="flex flex-wrap items-center gap-2 py-1">
            {colors.map((hex) => (
              <span
                key={hex}
                className="border-border-subtle size-8 rounded-full border"
                style={{ backgroundColor: hex }}
              />
            ))}
            <span className="sr-only">{message.content}</span>
          </span>
        ) : (
          <span dir="auto" className="whitespace-pre-wrap">
            {message.content}
          </span>
        )}
      </div>
    </div>
  );
});
