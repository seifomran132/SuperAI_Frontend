// Renders every *.html here to a full-page PNG. Run: node render.mjs (needs playwright from ../../../node_modules and Chrome)
import { chromium } from '../../../node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
const dir = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
  const w = f === 'mobile.html' ? 427 : f.match(/^(sidebar|picker-states|price-updates-states|sync-summary|dialogs)/) ? 1440 : 1280;
  const p = await b.newPage({ viewport: { width: w, height: 800 } });
  await p.goto('file://' + path.join(dir, f), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(dir, f.replace('.html', '.png')), fullPage: true });
  await p.close();
}
await b.close();
