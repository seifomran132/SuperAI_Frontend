import { Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import type { ModeDto } from '~/api/generated/types.gen';
import { cn } from '~/lib/utils';
import { modePosition } from '../model/useChatQueries';
import { ModeIcon, modeTone, useModeDescription, useModeLabel } from './mode';

/**
 * The mode chip inside the composer and its menu. Picking a mode only selects
 * it for the next message; it never sends anything.
 */
export function ModeSelector({
  modes,
  modeKey,
  onSelect,
}: {
  modes: ModeDto[];
  modeKey: string | null;
  onSelect: (modeKey: string) => void;
}) {
  const { t } = useTranslation();
  const label = useModeLabel();
  const description = useModeDescription();
  const position = modePosition(modes, modeKey);
  const current = position > 0 ? modes[position - 1] : undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={modes.length === 0}
        aria-label={t('chat.composer.modeMenu')}
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
