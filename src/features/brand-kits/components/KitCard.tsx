import { Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { BrandKitDto } from '~/api/generated/types.gen';
import '../i18n';
import { useBrandAssetImage } from '../model/queries';
import { DraftBadge } from './parts';

const DOTS = 4;

/** Black or white, whichever reads better on a brand colour (WCAG luminance). */
export function textOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const l =
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255);
  return l > 0.179 ? '#000000' : '#FFFFFF';
}

/** The kit's newest logo, or its first letter on its first colour. */
export function KitThumbnail({
  kit,
  className = 'size-14',
}: {
  kit: Pick<BrandKitDto, 'id' | 'name' | 'colors' | 'logoAssetId'>;
  className?: string;
}) {
  const logo = useBrandAssetImage(kit.id, kit.logoAssetId);
  if (logo.url) {
    return (
      <span
        className={`border-border-subtle bg-surface flex shrink-0 items-center justify-center overflow-hidden rounded-md border ${className}`}
      >
        <img src={logo.url} alt="" className="h-full w-full object-contain" />
      </span>
    );
  }
  const color = kit.colors[0];
  return (
    <span
      aria-hidden="true"
      className={`bg-surface-muted text-fg flex shrink-0 items-center justify-center rounded-md text-xl font-bold ${className}`}
      style={
        color ? { backgroundColor: color, color: textOn(color) } : undefined
      }
    >
      {Array.from(kit.name.trim())[0] ?? ''}
    </span>
  );
}

/** One kit in the list (S24 frame 1). The whole card opens the kit. */
export function KitCard({ kit }: { kit: BrandKitDto }) {
  const { t } = useTranslation();
  const extra = kit.colors.length - DOTS;
  return (
    <li>
      <Link
        to="/brands/$brandKitId"
        params={{ brandKitId: kit.id }}
        className="bg-surface border-border-subtle hover:bg-surface-muted focus-visible:outline-focus flex h-full flex-col gap-4 rounded-lg border p-4 outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
      >
        <span className="flex items-center gap-3">
          <KitThumbnail kit={kit} />
          <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
            <span dir="auto" className="text-fg truncate font-bold">
              {kit.name}
            </span>
            {kit.status === 'draft' ? <DraftBadge /> : null}
          </span>
          <ChevronLeft
            aria-hidden="true"
            className="text-fg-muted size-5 shrink-0 ltr:rotate-180"
          />
        </span>
        <span className="mt-auto flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            {kit.colors.slice(0, DOTS).map((hex) => (
              <span
                key={hex}
                aria-hidden="true"
                className="border-border-subtle size-5 rounded-full border"
                style={{ backgroundColor: hex }}
              />
            ))}
            {extra > 0 ? (
              <span dir="ltr" className="text-fg-muted text-sm">
                {t('brandKits.moreColors', { count: extra })}
              </span>
            ) : null}
          </span>
          <span className="text-fg-muted text-sm">
            {t('brandKits.files', { count: kit.assetCount })}
          </span>
        </span>
      </Link>
    </li>
  );
}
