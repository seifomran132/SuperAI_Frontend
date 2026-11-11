import type { BrandAssetDto } from '~/api/generated/types.gen';

// Limits from API_CONTRACT §10. The backend checks them again; these keep the
// user from waiting on an upload or a save that can only be refused.

export const NAME_MAX = 80;
export const COLORS_MAX = 12;
export const ASSETS_MAX = 40;
export const RULES_MAX = 10;
export const RULE_MAX = 200;
export const PROFILE_MAX = {
  style: 500,
  tone: 300,
  fontStyle: 300,
  notes: 2000,
} as const;

export const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const PDF_MAX_BYTES = 20 * 1024 * 1024;

export type AssetKind = BrandAssetDto['kind'];
const KNOWN_KINDS = new Set<string>([
  'logo',
  'reference',
  'product',
  'guideline',
  'design',
]);
/** A kind the API knows; the chat's upload steps send theirs (`design` for an edit). */
export const isAssetKind = (kind: string): kind is AssetKind =>
  KNOWN_KINDS.has(kind);
/** Display order of the file groups (S24). */
export const ASSET_KINDS: AssetKind[] = [
  'logo',
  'reference',
  'product',
  'guideline',
];

const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
]);
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'svg']);

/** `accept` for a kind's file picker. */
export const acceptFor = (kind: AssetKind) =>
  kind === 'guideline'
    ? 'image/jpeg,image/png,image/webp,image/svg+xml,application/pdf'
    : 'image/jpeg,image/png,image/webp,image/svg+xml';

export type AssetCheck =
  'BRAND_ASSET_TYPE_NOT_ALLOWED' | 'BRAND_ASSET_TOO_LARGE' | null;

/** First-line check before uploading; the backend reads the real type from the bytes. */
export function checkAssetFile(
  file: Pick<File, 'type' | 'name' | 'size'>,
  kind: AssetKind,
): AssetCheck {
  const ext = file.name.includes('.')
    ? file.name.split('.').pop()!.toLowerCase()
    : '';
  const type = file.type.toLowerCase();
  const isPdf = type === 'application/pdf' || ext === 'pdf';
  if (isPdf) {
    if (kind !== 'guideline') return 'BRAND_ASSET_TYPE_NOT_ALLOWED';
    return file.size > PDF_MAX_BYTES ? 'BRAND_ASSET_TOO_LARGE' : null;
  }
  if (!IMAGE_TYPES.has(type) && !IMAGE_EXTENSIONS.has(ext)) {
    return 'BRAND_ASSET_TYPE_NOT_ALLOWED';
  }
  return file.size > IMAGE_MAX_BYTES ? 'BRAND_ASSET_TOO_LARGE' : null;
}

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** `#abc` / `abc` / `#AABBCC` → `#AABBCC`, as the backend stores it; null when not a colour. */
export function normalizeHex(input: string): string | null {
  const match = HEX.exec(input.trim());
  if (!match) return null;
  const digits = match[1]!;
  const full =
    digits.length === 3
      ? digits
          .split('')
          .map((d) => d + d)
          .join('')
      : digits;
  return `#${full.toUpperCase()}`;
}

/** Megabytes with one decimal, Western digits («2.4 MB»). */
export const formatMegabytes = (bytes: number) =>
  `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
