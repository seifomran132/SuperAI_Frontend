import type { CSSProperties } from 'react';
import { env } from '~/lib/env';
import { bayan } from './bayan';
import type { BrandConfig } from './types';

const brands: Record<string, BrandConfig> = { bayan };

export const brand: BrandConfig = brands[env.brand] ?? bayan;

/** Inline style for <html> so brand colors override the default tokens. */
export const brandStyle = {
  '--color-brand': brand.colors.brand,
  '--color-brand-hover': brand.colors.brandHover,
  '--color-on-brand': brand.colors.onBrand,
} as CSSProperties;

export type { BrandConfig };
