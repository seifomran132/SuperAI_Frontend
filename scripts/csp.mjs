// Writes dist/client/_caddy/csp.caddy: the Content-Security-Policy header for
// this build. TanStack Start's shell has small inline scripts (hydration,
// scroll restoration), so instead of 'unsafe-inline' the policy lists the
// sha256 of each one. Caddy imports the file from the current release, so the
// header always matches the HTML it serves. Runs after `vite build`, with the
// same env as the build (process env wins over .env.production, as in Vite).
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnv } from 'vite';

const root = 'dist/client';
const env = loadEnv('production', process.cwd(), 'VITE_');
// The API and GoTrue live on the API subdomain: the only origins fetch may reach.
const apiOrigins = [
  ...new Set(
    [env.VITE_API_ORIGIN, env.VITE_GOTRUE_URL].map(
      (url) => new URL(url).origin,
    ),
  ),
];

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory())
      return entry.name === 'assets' ? [] : htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

const hashes = new Set();
for (const file of htmlFiles(root)) {
  const html = readFileSync(file, 'utf8');
  // Inline scripts only: <script ...>content</script> without a src attribute.
  for (const [, attrs, body] of html.matchAll(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/g,
  )) {
    if (/\bsrc\s*=/.test(attrs) || body.length === 0) continue;
    // Browsers hash the script text after HTML parsing: NUL becomes U+FFFD
    // (TanStack's state has "__root__\0") and line breaks are normalized.
    const parsed = body
      .replace(/\r\n?/g, '\n')
      .replace(/\u0000/g, String.fromCodePoint(0xfffd));
    hashes.add(createHash('sha256').update(parsed).digest('base64'));
  }
}

const policy = [
  "default-src 'self'",
  `script-src 'self' ${[...hashes].map((h) => `'sha256-${h}'`).join(' ')}`,
  // Inline style attributes come from React and Radix (positioning, brand colors).
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // Markdown never loads remote images; data: covers inline icons.
  "img-src 'self' data:",
  `connect-src 'self' ${apiOrigins.join(' ')}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

mkdirSync(join(root, '_caddy'), { recursive: true });
writeFileSync(
  join(root, '_caddy', 'csp.caddy'),
  `header Content-Security-Policy "${policy}"\n`,
);
console.log(
  `CSP: ${hashes.size} inline script hash(es), API ${apiOrigins.join(' ')} -> ${root}/_caddy/csp.caddy`,
);
