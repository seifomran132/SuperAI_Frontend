// Everything that changes when the platform is sold under another brand.
// Mode and status colors are deliberately not here: they stay fixed for contrast.
export interface BrandConfig {
  key: string;
  name: { ar: string; en: string };
  tagline: { ar: string; en: string };
  /** Single letter or short mark used until a final logo exists. */
  monogram: string;
  logoUrl?: string;
  /** Overrides --color-brand / --color-brand-hover / --color-on-brand / --color-brand-accent. */
  colors: {
    brand: string;
    brandHover: string;
    onBrand: string;
    accent?: string;
  };
  /**
   * The logo's glyph, drawn on the brand tile (64×64 units): a stroke in the
   * on-brand colour and an optional dot in the accent. Without it the tile
   * shows `monogram`.
   */
  mark?: {
    d: string;
    strokeWidth: number;
    dot?: { cx: number; cy: number; r: number };
  };
  /** Where users ask for a plan or more balance (no in-app payments at launch). */
  contact: { whatsapp?: string; email?: string; phone?: string };
  legal: { termsUrl?: string; privacyUrl?: string };
}
