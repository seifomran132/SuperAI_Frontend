// Writes the files crawlers ask for at the site root: robots.txt, sitemap.xml
// and the brand's favicon.ico. Runs after `vite build`, with the same env as the
// build, so a white-label build gets its own address and icon.
import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnv } from 'vite';

const root = 'dist/client';
const env = loadEnv('production', process.cwd(), 'VITE_');
const site = (env.VITE_SITE_ORIGIN ?? '').replace(/\/+$/, '');
const brand = env.VITE_BRAND || 'lam7a';
if (!site) {
  console.error(
    'VITE_SITE_ORIGIN is not set: robots.txt and sitemap.xml need it.',
  );
  process.exit(1);
}

// Only the prerendered public pages. The app itself serves one shell for
// every path, which says nothing to a search engine.
const pages = ['/', '/plans'];

// Signed-in, email-link and one-time pages: nothing to index there.
const privatePaths = [
  '/chat',
  '/admin',
  '/account',
  '/balance',
  '/usage',
  '/complete-profile',
  '/check-email',
  '/forgot-password',
  '/reset-password',
  '/auth/',
];

writeFileSync(
  join(root, 'robots.txt'),
  [
    'User-agent: *',
    ...privatePaths.map((path) => `Disallow: ${path}`),
    '',
    `Sitemap: ${site}/sitemap.xml`,
    '',
  ].join('\n'),
);

writeFileSync(
  join(root, 'sitemap.xml'),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...pages.map((path) => `  <url><loc>${site}${path}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n'),
);

// Browsers and crawlers still ask for /favicon.ico; without it Caddy answers
// with the app shell.
const icon = join(root, 'brand', brand, 'favicon.ico');
if (!existsSync(icon)) {
  console.error(
    `Missing ${icon}: run scripts/brand-images.mjs with VITE_BRAND=${brand}.`,
  );
  process.exit(1);
}
copyFileSync(icon, join(root, 'favicon.ico'));

console.log(
  `Site files for ${site}: robots.txt, sitemap.xml, favicon.ico (${brand})`,
);
