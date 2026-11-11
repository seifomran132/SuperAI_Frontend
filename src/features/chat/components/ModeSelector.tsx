import { Check, ChevronDown, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import type { AgentDto, ModeDto } from '~/api/generated/types.gen';
import { cn } from '~/lib/utils';
import { modePosition } from '../model/useChatQueries';
import { CreatesImagesBadge, ReadsImagesBadge } from './ImageNotices';
import { ModeIcon, modeTone, useModeDescription, useModeLabel } from './mode';

/**
 * The mode chip inside the composer and its menu. Picking a mode only selects
 * it for the next message; it never sends anything.
 */
export function ModeSelector({
  modes,
  modeKey,
  onSelect,
  supportsImages,
  agents = [],
  onStartAgent,
  startingAgent = null,
}: {
  modes: ModeDto[];
  modeKey: string | null;
  onSelect: (modeKey: string) => void;
  /** With it, modes that can read images get a «يقرأ الصور» mark. */
  supportsImages?: (modeKey: string) => boolean;
  /** Agents of the plan (F13), offered as a second group; picking one starts a conversation. */
  agents?: AgentDto[];
  onStartAgent?: (agentKey: string) => void;
  startingAgent?: string | null;
}) {
  const { t, i18n } = useTranslation();
  const label = useModeLabel();
  const description = useModeDescription();
  const position = modePosition(modes, modeKey);
  const current = position > 0 ? modes[position - 1] : undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={modes.length === 0 && agents.length === 0}
        data-mode-position={position}
        className={cn(
          'focus-visible:outline-focus inline-flex h-11 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60',
          current
            ? modeTone(position).chip
            : 'border-border-control text-fg-muted bg-surface',
        )}
      >
        {current ? (
          <>
            <ModeIcon position={position} />
            {label(current)}
          </>
        ) : (
          t(modes.length === 0 ? 'chat.composer.noModes' : 'chat.composer.mode')
        )}
        {/* After the visible label, so the accessible name starts with it (WCAG 2.5.3). */}
        <span className="sr-only">{t('chat.composer.modeMenu')}</span>
        <ChevronDown aria-hidden="true" className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        className="w-80 max-w-[90vw]"
      >
        <DropdownMenuRadioGroup value={modeKey ?? ''} onValueChange={onSelect}>
          {modes.map((mode, index) => (
            <DropdownMenuRadioItem
              key={mode.key}
              value={mode.key}
              className="items-start"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'mt-2 size-2.5 shrink-0 rounded-full',
                  modeTone(index + 1).dot,
                )}
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-fg font-semibold">{label(mode)}</span>
                <span className="text-fg-muted text-xs leading-5">
                  {description(mode)}
                </span>
                {mode.generatesImages || supportsImages?.(mode.key) ? (
                  <span className="flex flex-wrap items-center gap-1.5">
                    {mode.generatesImages ? <CreatesImagesBadge /> : null}
                    {supportsImages?.(mode.key) ? <ReadsImagesBadge /> : null}
                  </span>
                ) : null}
              </span>
              {mode.key === modeKey ? (
                <Check
                  aria-hidden="true"
                  className="text-fg mt-1 size-4 shrink-0"
                />
              ) : null}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        {/* Agents are tasks, not modes: picking one starts its own conversation. */}
        {agents.length > 0 && onStartAgent ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-fg-subtle text-xs font-medium">
              {t('chat.agent.group')}
            </DropdownMenuLabel>
            {agents.map((agent) => (
              <DropdownMenuItem
                key={agent.key}
                disabled={startingAgent !== null}
                className="items-start"
                onSelect={() => onStartAgent(agent.key)}
              >
                <span
                  aria-hidden="true"
                  className="bg-brand text-on-brand mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md"
                >
                  <Palette className="size-4" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-fg font-semibold">
                    {i18n.language === 'en' ? agent.labelEn : agent.labelAr}
                  </span>
                  <span className="text-fg-muted text-xs leading-5">
                    {i18n.language === 'en'
                      ? agent.descriptionEn
                      : agent.descriptionAr}
                  </span>
                  <span className="text-fg-subtle text-xs leading-5">
                    {t('chat.agent.startsNew')}
                  </span>
                </span>
              </DropdownMenuItem>
            ))}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
