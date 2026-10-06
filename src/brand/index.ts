import type { CSSProperties } from 'react';
import { env } from '~/lib/env';
import { lam7a } from './lam7a';
import type { BrandConfig } from './types';

const brands: Record<string, BrandConfig> = { lam7a };

export const brand: BrandConfig = brands[env.brand] ?? lam7a;

/** Inline style for <html> so brand colors override the default tokens. */
export const brandStyle = {
  '--color-brand': brand.colors.brand,
  '--color-brand-hover': brand.colors.brandHover,
  '--color-on-brand': brand.colors.onBrand,
} as CSSProperties;

export type { BrandConfig };
