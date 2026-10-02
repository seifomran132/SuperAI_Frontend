// Everything that changes when the platform is sold under another brand.
// Mode and status colors are deliberately not here: they stay fixed for contrast.
export interface BrandConfig {
  key: string;
  name: { ar: string; en: string };
  tagline: { ar: string; en: string };
  /** Single letter or short mark used until a final logo exists. */
  monogram: string;
  logoUrl?: string;
  /** Overrides --color-brand / --color-brand-hover / --color-on-brand. */
  colors: { brand: string; brandHover: string; onBrand: string };
  /** Where users ask for a plan or more balance (no in-app payments at launch). */
  contact: { whatsapp?: string; email?: string; phone?: string };
  legal: { termsUrl?: string; privacyUrl?: string };
}
