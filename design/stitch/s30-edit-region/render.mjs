// Renders desktop.html / mobile.html to PNG. Run: node render.mjs [name]. Needs playwright (repo devDependency).
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
const dir = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.resolve(dir, '../../../package.json'));
const { chromium } = require('playwright');
const only = process.argv[2];
const b = await chromium.launch();
for (const [n, w] of [['desktop', 1640], ['mobile', 1300]]) {
  if (only && only !== n) continue;
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(pathToFileURL(path.join(dir, `${n}.html`)).href);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(dir, `${n}.png`), fullPage: true });
  console.log(n, 'done');
}
await b.close();
