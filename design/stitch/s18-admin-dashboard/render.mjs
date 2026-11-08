// Renders desktop.html and mobile.html to full-page PNGs and checks mobile frames for horizontal overflow.
import { chromium } from '../../../node_modules/playwright/index.mjs';
import path from 'node:path';
const dir = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
for (const [f, w] of [['desktop', 1560], ['mobile', 1300]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto('file:///' + path.join(dir, f + '.html').replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  if (f === 'mobile') {
    const over = await p.evaluate(() => [...document.querySelectorAll('.mob')].map((m, i) => ({ i, sw: m.scrollWidth, cw: m.clientWidth })).filter(x => x.sw > x.cw));
    console.log('mobile frames with horizontal overflow:', JSON.stringify(over));
    const small = await p.evaluate(() => [...document.querySelectorAll('.mob a, .mob button, .mob .seg .o, .mob .in')].filter(e => { const r = e.getBoundingClientRect(); return r.height > 0 && r.height < 44 && !e.closest('.mdrawer'); }).map(e => e.className + ':' + Math.round(e.getBoundingClientRect().height)));
    console.log('mobile targets under 44px:', JSON.stringify([...new Set(small)]));
  }
  await p.screenshot({ path: path.join(dir, f + '.png'), fullPage: true });
  await p.close();
}
await b.close();
