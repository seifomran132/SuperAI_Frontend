import type { ReactNode } from 'react';
import { CircleAlert, ImageOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '~/lib/utils';
import '../i18n';
import { useDesignImage } from '../model/designs';

const RATIO_CLASS: Record<string, string> = {
  '1:1': 'aspect-square',
  '3:4': 'aspect-[3/4]',
  '4:3': 'aspect-[4/3]',
  '9:16': 'aspect-[9/16]',
  '16:9': 'aspect-[16/9]',
};

/** The design in its real shape inside a fixed preview well (S28); opens the viewer. */
export function DesignPreview({
  attachmentId,
  aspectRatio,
  label,
  onOpen,
  className,
}: {
  attachmentId: string;
  aspectRatio: string;
  label: string;
  onOpen?: (src: string) => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const image = useDesignImage(attachmentId);
  return (
    <div
      className={cn(
        'bg-surface-muted flex items-center justify-center p-3',
        className,
      )}
    >
      {image.url ? (
        <button
          type="button"
          disabled={!onOpen}
          aria-label={t('designs.openViewer')}
          onClick={() => image.url && onOpen?.(image.url)}
          className={cn(
            'focus-visible:outline-focus max-h-full max-w-full overflow-hidden rounded-md outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid',
            RATIO_CLASS[aspectRatio] ?? 'aspect-square',
            aspectRatio === '9:16' || aspectRatio === '3:4'
              ? 'h-full'
              : 'w-full',
          )}
        >
          <img
            src={image.url}
            alt={label}
            className="h-full w-full object-contain"
          />
        </button>
      ) : image.isError ? (
        <button
          type="button"
          onClick={image.refetch}
          className="text-fg-muted flex flex-col items-center gap-2 p-3 text-sm"
        >
          <ImageOff aria-hidden="true" className="size-6" />
          {t('designs.imageError')}
        </button>
      ) : (
        <div
          className={cn(
            'bg-surface max-h-full max-w-full animate-pulse rounded-md',
            RATIO_CLASS[aspectRatio] ?? 'aspect-square',
            aspectRatio === '9:16' || aspectRatio === '3:4'
              ? 'h-full'
              : 'w-full',
          )}
        />
      )}
    </div>
  );
}

/** «v2» on an edited version. */
export function VersionBadge({ version }: { version: number }) {
  const { t } = useTranslation();
  if (version < 2) return null;
  return (
    <span
      dir="ltr"
      className="bg-mode-2-container text-mode-2 border-mode-2-border inline-flex h-6 items-center rounded-full border px-2 text-xs font-semibold"
    >
      {t('designs.version', { n: version })}
    </span>
  );
}

/** «تحقّق من النص»: the checker still found a problem after the fix. */
export function ReviewNote() {
  const { t } = useTranslation();
  return (
    <span className="bg-warning-container border-warning-border text-warning inline-flex h-6 items-center gap-1 rounded-full border px-2 text-xs font-medium">
      <CircleAlert aria-hidden="true" className="size-3.5" />
      {t('designs.needsReview')}
    </span>
  );
}

/** A design with its facts and actions (chat results and gallery). */
export function DesignCard({
  preview,
  title,
  meta,
  badges,
  actions,
}: {
  preview: ReactNode;
  title?: ReactNode;
  meta?: ReactNode;
  badges?: ReactNode;
  actions: ReactNode;
}) {
  return (
    <li className="bg-surface border-border-subtle flex flex-col overflow-hidden rounded-lg border">
      {preview}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {title || badges ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            {title ? (
              <span className="text-fg min-w-0 truncate font-bold">
                {title}
              </span>
            ) : (
              <span />
            )}
            {badges ? <span className="flex gap-1.5">{badges}</span> : null}
          </div>
        ) : null}
        {meta ? <p className="text-fg-muted text-sm">{meta}</p> : null}
        <div className="mt-auto flex flex-wrap gap-2 pt-1">{actions}</div>
      </div>
    </li>
  );
}
