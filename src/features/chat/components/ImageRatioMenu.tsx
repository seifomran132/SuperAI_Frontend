import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { ASPECT_RATIOS, type AspectRatio } from '../model/image-options';

const NAME_KEYS: Record<AspectRatio, string> = {
  '1:1': 'chat.image.ratioSquare',
  '3:4': 'chat.image.ratioPortrait',
  '4:3': 'chat.image.ratioLandscape',
  '9:16': 'chat.image.ratioTall',
  '16:9': 'chat.image.ratioWide',
};

/** A small outline in the shape of the ratio, longest side 16px; dashed for automatic. */
function Glyph({ ratio }: { ratio: AspectRatio | null }) {
  const [w, h] = (ratio ?? '1:1').split(':').map(Number) as [number, number];
  const scale = 16 / Math.max(w, h);
  return (
    <span
      aria-hidden="true"
      className="flex size-5 shrink-0 items-center justify-center"
    >
      <span
        style={{ width: w * scale, height: h * scale }}
        className={
          ratio
            ? 'border-fg-muted rounded-xs border-2'
            : 'border-fg-muted rounded-xs border-2 border-dashed'
        }
      />
    </span>
  );
}

/**
 * Aspect ratio of the image to create. «تلقائي» (null) sends no option: the
 * model follows an attached image, otherwise square.
 */
export function ImageRatioMenu({
  ratio,
  onChange,
  disabled,
}: {
  ratio: AspectRatio | null;
  onChange: (ratio: AspectRatio | null) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        className="focus-visible:outline-focus text-fg border-border-control bg-surface inline-flex h-11 items-center gap-1.5 rounded-full border px-3 text-sm font-medium outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
      >
        <Glyph ratio={ratio} />
        <span>
          {ratio ? <bdi dir="ltr">{ratio}</bdi> : t('chat.image.ratioAuto')}
        </span>
        {/* After the visible text, so the accessible name starts with it. */}
        <span className="sr-only">{t('chat.image.ratio')}</span>
        <ChevronDown aria-hidden="true" className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" className="min-w-48">
        <DropdownMenuRadioGroup
          value={ratio ?? 'auto'}
          onValueChange={(value) =>
            onChange(value === 'auto' ? null : (value as AspectRatio))
          }
        >
          <DropdownMenuRadioItem value="auto" className="min-h-11 gap-2">
            <Glyph ratio={null} />
            {t('chat.image.ratioAuto')}
          </DropdownMenuRadioItem>
          {ASPECT_RATIOS.map((value) => (
            <DropdownMenuRadioItem
              key={value}
              value={value}
              className="min-h-11 gap-2"
            >
              <Glyph ratio={value} />
              <span>
                {t(NAME_KEYS[value])} <bdi dir="ltr">{value}</bdi>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
