import { useTranslation } from 'react-i18next';
import { brand } from '~/brand';
import { cn } from '~/lib/utils';

/** Brand monogram tile (until a final logo exists). */
export function BrandMark({
  className,
  textClassName = 'text-base',
}: {
  className?: string;
  textClassName?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'bg-brand text-on-brand flex shrink-0 items-center justify-center rounded-md font-bold',
        textClassName,
        className,
      )}
    >
      {brand.monogram}
    </span>
  );
}

/** Brand name in the UI language (never hard-coded). */
export function useBrandName() {
  const { i18n } = useTranslation();
  return i18n.language === 'en' ? brand.name.en : brand.name.ar;
}
