// Makes a brand's icons and link-preview image into public/brand/<brand>/:
//   icon-32.png, favicon.ico (16 + 32), apple-touch-icon.png (180), share.png (1200×630)
//
//   npm run dev                       (signed out, with VITE_BRAND set to the brand)
//   node scripts/brand-images.mjs     [base URL, default http://localhost:3001]
//
// Colors and the monogram are read from the running app and the share image is
// the landing page's own hero, so a white-label brand needs no edits here.
// Run again after the hero, tagline or brand colors change, and commit the files.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';
import { loadEnv } from 'vite';

const base = process.argv[2] ?? 'http://localhost:3001';
const brandKey =
  loadEnv('development', process.cwd(), 'VITE_').VITE_BRAND || 'lam7a';
const out = join('public', 'brand', brandKey);
mkdirSync(out, { recursive: true });

const FONT =
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@700&display=block';

const browser = await chromium.launch();
try {
  // A fresh context is signed out, so `/` shows the landing page.
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    locale: 'ar',
  });
  await page.goto(base);
  await page.locator('main h1').waitFor();
  await page.evaluate(() => document.fonts.ready);

  const { brand, onBrand, monogram } = await page.evaluate(() => {
    const css = getComputedStyle(document.documentElement);
    return {
      brand: css.getPropertyValue('--color-brand').trim(),
      onBrand: css.getPropertyValue('--color-on-brand').trim(),
      monogram:
        document.querySelector('header a span')?.textContent?.trim() ?? '',
    };
  });
  if (!brand || !monogram) throw new Error('Brand color or monogram not found');

  // Share image: header with the brand, hero below it. The sign-in buttons mean
  // nothing in a preview, and the hero's page padding would push it past 630.
  await page.addStyleTag({
    content: `
      header a[href="/sign-in"], header a[href="/sign-up"] { visibility: hidden; }
      main > section:first-child > div { padding-block: 40px !important; }
    `,
  });
  writeFileSync(
    join(out, 'share.png'),
    await page.screenshot({ clip: { x: 0, y: 0, width: 1200, height: 630 } }),
  );

  // Icons: the monogram tile, as in the app header. Rounded for browser tabs;
  // square for iOS, which rounds the corners itself.
  async function tile(size, radius) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<!doctype html><html lang="ar" dir="rtl"><head>
      <link rel="stylesheet" href="${FONT}">
      <style>
        html, body { margin: 0; background: transparent; }
        div { width: ${size}px; height: ${size}px; border-radius: ${radius}px;
          background: ${brand}; color: ${onBrand}; display: flex;
          align-items: center; justify-content: center;
          font: 700 ${Math.round(size * 0.62)}px/1 'IBM Plex Sans Arabic'; }
      </style></head><body><div>${monogram}</div></body></html>`);
    await page.evaluate(() => document.fonts.ready);
    return page.screenshot({ omitBackground: true });
  }

  const png16 = await tile(16, 3);
  const png32 = await tile(32, 7);
  writeFileSync(join(out, 'icon-32.png'), png32);
  writeFileSync(join(out, 'favicon.ico'), ico([png16, png32], [16, 32]));
  writeFileSync(join(out, 'apple-touch-icon.png'), await tile(180, 0));
} finally {
  await browser.close();
}
console.log(`Brand images for ${brandKey} -> ${out}`);

/** An .ico holding PNG images (supported by every current browser). */
function ico(images, sizes) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach((png, i) => {
    const entry = 6 + 16 * i;
    header.writeUInt8(sizes[i], entry);
    header.writeUInt8(sizes[i], entry + 1);
    header.writeUInt16LE(1, entry + 4); // color planes
    header.writeUInt16LE(32, entry + 6); // bits per pixel
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images]);
}
