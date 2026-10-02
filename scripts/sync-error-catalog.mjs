// Builds src/i18n/errors.{ar,en}.json from the backend's error catalog.
// The UI shows errors by `code`; `message` from the API is a developer fallback only.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// BACKEND_DIR lets CI point at a checkout of the backend repo.
const backendDir = process.env.BACKEND_DIR ?? '../SuperAI_Backend';
const source = resolve(backendDir, 'openapi/error-codes.json');
const catalog = JSON.parse(readFileSync(source, 'utf8'));

for (const lang of ['ar', 'en']) {
  const out = {};
  for (const code of Object.keys(catalog).sort()) out[code] = catalog[code][lang];
  const target = new URL(`../src/i18n/errors.${lang}.json`, import.meta.url);
  writeFileSync(target, JSON.stringify(out, null, 2) + '\n');
}

console.log(`Error catalog: ${Object.keys(catalog).length} codes`);
