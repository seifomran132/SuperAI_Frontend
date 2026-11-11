import { useTranslation } from 'react-i18next';
import { brand } from '~/brand';
import { BrandSymbol } from '~/components/BrandSymbol';

/** The brand symbol (logo A, or the monogram for a brand without a glyph). */
export const BrandMark = BrandSymbol;

/** Brand name in the UI language (never hard-coded). */
export function useBrandName() {
  const { i18n } = useTranslation();
  return i18n.language === 'en' ? brand.name.en : brand.name.ar;
}
