import { describe, expect, it } from 'vitest';
import { checkAssetFile, formatMegabytes, normalizeHex } from '../rules';

const file = (name: string, type: string, size = 1000) => ({
  name,
  type,
  size,
});
const MB = 1024 * 1024;

describe('normalizeHex', () => {
  it('stores colours as #RRGGBB, as the backend does', () => {
    expect(normalizeHex('#abc')).toBe('#AABBCC');
    expect(normalizeHex('1a4b8c')).toBe('#1A4B8C');
    expect(normalizeHex('  #1A4B8C ')).toBe('#1A4B8C');
  });

  it('refuses anything else', () => {
    for (const bad of ['', '#12', '#12345', '#GGGGGG', 'red', '#1234567']) {
      expect(normalizeHex(bad)).toBeNull();
    }
  });
});

describe('checkAssetFile', () => {
  it('takes images up to 10 MB in every group', () => {
    expect(
      checkAssetFile(file('logo.svg', 'image/svg+xml'), 'logo'),
    ).toBeNull();
    expect(
      checkAssetFile(file('a.webp', 'image/webp', 10 * MB), 'product'),
    ).toBeNull();
    expect(
      checkAssetFile(file('a.png', 'image/png', 10 * MB + 1), 'reference'),
    ).toBe('BRAND_ASSET_TOO_LARGE');
  });

  it('takes a PDF only as a guideline, up to 20 MB', () => {
    expect(checkAssetFile(file('g.pdf', 'application/pdf'), 'logo')).toBe(
      'BRAND_ASSET_TYPE_NOT_ALLOWED',
    );
    expect(
      checkAssetFile(file('g.pdf', 'application/pdf', 20 * MB), 'guideline'),
    ).toBeNull();
    expect(
      checkAssetFile(
        file('g.pdf', 'application/pdf', 20 * MB + 1),
        'guideline',
      ),
    ).toBe('BRAND_ASSET_TOO_LARGE');
  });

  it('refuses other types', () => {
    expect(checkAssetFile(file('a.gif', 'image/gif'), 'logo')).toBe(
      'BRAND_ASSET_TYPE_NOT_ALLOWED',
    );
    expect(checkAssetFile(file('font.ttf', 'font/ttf'), 'guideline')).toBe(
      'BRAND_ASSET_TYPE_NOT_ALLOWED',
    );
  });
});

it('formats sizes in megabytes with Western digits', () => {
  expect(formatMegabytes(2.4 * MB)).toBe('2.4 MB');
});
