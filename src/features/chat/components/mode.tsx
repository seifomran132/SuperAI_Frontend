import { Sparkles, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ModeDto } from '~/api/generated/types.gen';
import { cn } from '~/lib/utils';
import { modePosition } from '../model/useChatQueries';

// Mode colours are assigned by position in GET /modes (mode-1, mode-2, …),
// never by mode name, so a renamed or new mode keeps working. Class names are
// written out in full so Tailwind can see them.
const tones = [
  {
    chip: 'border-mode-1-border bg-mode-1-container text-mode-1',
    dot: 'bg-mode-1',
  },
  {
    chip: 'border-mode-2-border bg-mode-2-container text-mode-2',
    dot: 'bg-mode-2',
  },
] as const;

/** Tone for a 1-based position; positions past the palette wrap around. */
export function modeTone(position: number) {
  const index = Math.max(position - 1, 0) % tones.length;
  return tones[index]!;
}

export function useModeLabel() {
  const { i18n } = useTranslation();
  return (mode: Pick<ModeDto, 'labelAr' | 'labelEn'>) =>
    i18n.language === 'en' ? mode.labelEn : mode.labelAr;
}

export function useModeDescription() {
  const { i18n } = useTranslation();
  return (mode: Pick<ModeDto, 'descriptionAr' | 'descriptionEn'>) =>
    i18n.language === 'en' ? mode.descriptionEn : mode.descriptionAr;
}

export function ModeIcon({
  position,
  className,
}: {
  position: number;
  className?: string;
}) {
  const Icon = position % 2 === 1 ? Zap : Sparkles;
  return <Icon aria-hidden="true" className={cn('size-3.5', className)} />;
}

/** Label of the mode an answer was written in; nothing when the plan no longer lists it. */
export function ModeChip({
  modeKey,
  modes,
}: {
  modeKey: string | null;
  modes: ModeDto[];
}) {
  const label = useModeLabel();
  const position = modePosition(modes, modeKey);
  const mode = position > 0 ? modes[position - 1] : undefined;
  if (!mode) return null;
  return (
    <span
      data-slot="mode-chip"
      data-mode-position={position}
      className={cn(
        'inline-flex h-6 items-center gap-1 rounded-full border px-2.5 text-xs font-semibold',
        modeTone(position).chip,
      )}
    >
      <ModeIcon position={position} />
      {label(mode)}
    </span>
  );
}
