// Fails the build when the JavaScript loaded before the first screen grows past
// the budget. Counts every script the shell and the prerendered pages load,
// gzipped. Run after `npm run build`; `npm run analyze` shows what is inside.
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

// KB gzipped; about 10% above the size at F5b.
const budgets = {
  'dist/client/_shell.html': 240,
  'dist/client/plans/index.html': 270,
  'dist/client/index.html': 256,
  'dist/client/privacy/index.html': 245,
};

let failed = false;
for (const [page, budget] of Object.entries(budgets)) {
  const html = readFileSync(page, 'utf8');
  const scripts = [...new Set(html.match(/assets\/[^"']+\.js/g) ?? [])];
  const kb =
    scripts.reduce(
      (sum, s) => sum + gzipSync(readFileSync(`dist/client/${s}`)).length,
      0,
    ) / 1024;
  const ok = kb <= budget;
  failed ||= !ok;
  console.log(
    `${ok ? 'ok  ' : 'FAIL'} ${page}: ${kb.toFixed(1)} KB gz of ${budget} KB (${scripts.length} scripts)`,
  );
}
if (failed) process.exit(1);
