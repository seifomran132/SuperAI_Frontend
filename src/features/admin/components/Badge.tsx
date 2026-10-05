import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '~/lib/utils';

const tones = {
  success: 'bg-success-container text-success border-success/30',
  warning: 'bg-warning-container text-warning border-warning-border',
  danger: 'bg-danger-container text-danger border-danger-border',
  info: 'bg-mode-1-container text-mode-1 border-mode-1-border',
  neutral: 'bg-surface-muted text-fg-muted border-border-subtle',
} as const;

export type BadgeTone = keyof typeof tones;

/** Status pill: icon plus text, so colour is never the only signal. */
export function Badge({
  tone,
  Icon,
  children,
}: {
  tone: BadgeTone;
  Icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        tones[tone],
      )}
    >
      {children}
      <Icon aria-hidden="true" className="size-3.5" />
    </span>
  );
}
