import { ImagePlus, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BrandMark } from './BrandMark';
import type { AgentDto } from '~/api/generated/types.gen';

const chipKeys = ['chip1', 'chip2', 'chip3', 'chip4'] as const;

/** New chat: example prompts fill the composer; they never send. */
export function EmptyState({
  onPick,
  imageMode,
  agents = [],
  onStartAgent,
  startingAgent = null,
}: {
  onPick: (text: string) => void;
  /** The selected mode creates images: other headline, hint and example prompts. */
  imageMode?: boolean;
  /** Agents of the plan (F13): a card each, which starts its conversation. */
  agents?: AgentDto[];
  onStartAgent?: (agentKey: string) => void;
  startingAgent?: string | null;
}) {
  const { t, i18n } = useTranslation();
  const prefix = imageMode ? 'chat.emptyImage' : 'chat.empty';
  return (
    <div className="relative h-full overflow-y-auto">
      <div className="flex min-h-full flex-col items-center justify-center gap-3 px-4 py-8 text-center">
        <BrandMark className="size-14 rounded-lg" textClassName="text-2xl" />
        <h1 className="text-fg mt-3 text-2xl leading-9 font-bold">
          {t(`${prefix}.title`)}
        </h1>
        <p className="text-fg-muted flex items-center gap-1.5 text-base">
          {imageMode ? (
            <ImagePlus aria-hidden="true" className="size-5 shrink-0" />
          ) : null}
          {imageMode ? t('chat.emptyImage.hint') : t('chat.empty.subtitle')}
        </p>
        <ul className="mt-5 grid w-full max-w-[640px] gap-3 sm:grid-cols-2">
          {chipKeys.map((chip) => {
            const key = `${prefix}.${chip}`;
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onPick(t(key))}
                  className="bg-surface border-border-subtle text-fg hover:bg-surface-muted focus-visible:outline-focus min-h-16 w-full rounded-lg border px-4 py-3 text-start text-sm font-medium outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {t(key)}
                </button>
              </li>
            );
          })}
        </ul>
        {agents.length > 0 && onStartAgent ? (
          <ul className="mt-2 grid w-full max-w-[640px] gap-3">
            {agents.map((agent) => (
              <li key={agent.key}>
                <button
                  type="button"
                  disabled={startingAgent !== null}
                  onClick={() => onStartAgent(agent.key)}
                  className="bg-surface border-border-control hover:bg-surface-muted focus-visible:outline-focus flex min-h-16 w-full items-center gap-3 rounded-lg border px-4 py-3 text-start outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
                >
                  <span
                    aria-hidden="true"
                    className="bg-brand text-on-brand flex size-10 shrink-0 items-center justify-center rounded-md"
                  >
                    <Palette className="size-5" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-fg-subtle text-xs">
                      {t('chat.agent.group')}
                    </span>
                    <span className="text-fg font-semibold">
                      {i18n.language === 'en' ? agent.labelEn : agent.labelAr}
                    </span>
                    <span className="text-fg-muted text-sm">
                      {i18n.language === 'en'
                        ? agent.descriptionEn
                        : agent.descriptionAr}
                    </span>
                  </span>
                  <span className="text-fg text-sm font-semibold">
                    {startingAgent === agent.key
                      ? t('chat.agent.starting')
                      : t('chat.agent.cardAction')}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
