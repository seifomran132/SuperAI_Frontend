import { chromium } from 'file:///F:/Projects/SuperCardAI/SuperAI_frontend/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1680,height:900},deviceScaleFactor:1});
await p.goto('file:///F:/Projects/SuperCardAI/SuperAI_frontend/design/brand/logo/logo-concepts.html');await p.waitForTimeout(800);
await p.screenshot({path:'F:/Projects/SuperCardAI/SuperAI_frontend/design/brand/logo/logo-concepts.png',fullPage:true});await b.close();
