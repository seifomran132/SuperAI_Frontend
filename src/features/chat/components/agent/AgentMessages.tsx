import { memo } from 'react';
import { Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { MessageDto } from '~/api/generated/types.gen';
import { agentUi } from '../../model/agent';

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

/** One agent question: its text in the reader's language. The input is in the dock. */
export const AgentMessage = memo(function AgentMessage({
  message,
  label,
}: {
  message: MessageDto;
  label: string;
}) {
  const { i18n } = useTranslation();
  const ui = agentUi(message);
  const text =
    i18n.language === 'en' && ui?.prompt?.en ? ui.prompt.en : message.content;
  return (
    <article className="bg-surface border-border-subtle flex flex-col items-start gap-2 rounded-lg border p-4">
      <AgentChip label={label} />
      <p dir="auto" className="text-fg text-base leading-7 whitespace-pre-wrap">
        {text}
      </p>
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
