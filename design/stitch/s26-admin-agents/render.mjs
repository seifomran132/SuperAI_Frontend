// Renders desktop.html / mobile.html to PNG with headless Chrome (Playwright). Run: node render.mjs
import { chromium } from '../../../node_modules/playwright/index.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
for (const [n, w] of [['desktop', 1480], ['mobile', 1640]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(pathToFileURL(path.join(dir, `${n}.html`)).href, { waitUntil: 'networkidle' }).catch(() => {});
  await p.evaluate(() => document.fonts.ready);
  const over = await p.evaluate(() => [...document.querySelectorAll('.mf')].map((f, i) => { const r = f.getBoundingClientRect(); return [...f.querySelectorAll('*')].filter(e => { const q = e.getBoundingClientRect(); return q.width && (q.right > r.right + 1 || q.left < r.left - 1) && !e.closest('.sb') ; }).length ? i : -1; }).filter(i => i >= 0));
  console.log(n, 'frames with overflow:', over);
  await p.screenshot({ path: path.join(dir, `${n}.png`), fullPage: true });
}
await b.close();
