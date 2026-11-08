// Renders desktop.html (1440) and mobile.html (4 frames of 375) to full-page PNGs and checks the mobile frames for horizontal overflow.
// Run: node render.mjs (needs playwright from ../../../node_modules and Chrome; set CHROME to override the path).
import { chromium } from '../../../node_modules/playwright/index.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const chrome = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const b = await chromium.launch({ executablePath: chrome });
for (const [f, w] of [['desktop', 1440], ['mobile', 1600]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto('file://' + path.join(dir, f + '.html').replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  if (f === 'mobile') {
    const bad = await p.evaluate(() => [...document.querySelectorAll('.mob')].map((el, i) => {
      const r = el.getBoundingClientRect();
      const over = [...el.querySelectorAll('*')].filter(c => { const cr = c.getBoundingClientRect(); const clip = c.closest('.chips,pre,.twrap'); return !clip && (cr.right > r.right + 0.5 || cr.left < r.left - 0.5); }).slice(0, 3).map(c => c.className || c.tagName);
      return { frame: i, width: r.width, scrollW: el.scrollWidth, over };
    }));
    console.log(JSON.stringify(bad));
  }
  await p.screenshot({ path: path.join(dir, f + '.png'), fullPage: true });
  await p.close();
}
await b.close();
