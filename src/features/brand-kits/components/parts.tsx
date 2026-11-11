import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '~/lib/utils';

/** A card section of the kit page (S24 frame 3a). */
export function Section({
  id,
  title,
  description,
  aside,
  tone = 'default',
  children,
}: {
  id: string;
  title: string;
  description?: string;
  /** Shown at the end of the title row, e.g. a counter. */
  aside?: ReactNode;
  tone?: 'default' | 'danger';
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn(
        'bg-surface flex flex-col gap-4 rounded-lg border p-5 sm:p-6',
        tone === 'danger' ? 'border-danger-border' : 'border-border-subtle',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            id={id}
            className={cn(
              'text-lg font-bold',
              tone === 'danger' ? 'text-danger' : 'text-fg',
            )}
          >
            {title}
          </h2>
          {description ? (
            <p className="text-fg-muted mt-1 text-sm">{description}</p>
          ) : null}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** `12 / 80`, kept left-to-right inside Arabic text. */
export function Counter({
  count,
  max,
  id,
  className,
}: {
  count: number;
  max: number;
  id?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <span
      id={id}
      dir="ltr"
      className={cn(
        'shrink-0 text-sm whitespace-nowrap tabular-nums',
        count > max ? 'text-danger font-semibold' : 'text-fg-muted',
        className,
      )}
    >
      {t('brandKits.counter', { count, max })}
    </span>
  );
}

/** A colour value shown as a hex code; hex reads left to right. */
export function Hex({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <bdi dir="ltr" className={cn('font-semibold tabular-nums', className)}>
      {value}
    </bdi>
  );
}

/** «مسودة»: a kit the graphic designer agent has not finished setting up. */
export function DraftBadge() {
  const { t } = useTranslation();
  return (
    <span className="bg-warning-container border-warning-border text-warning inline-flex h-7 items-center rounded-full border px-2.5 text-[13px] font-medium">
      {t('brandKits.draft')}
    </span>
  );
}

export const textareaClass =
  'bg-surface text-fg placeholder:text-fg-subtle border-border-control w-full min-w-0 rounded-md border px-4 py-3 text-base leading-7 outline-hidden focus-visible:border-focus focus-visible:outline-focus focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 aria-invalid:border-danger aria-invalid:border-2 disabled:opacity-60';
