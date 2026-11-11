// Hand-built S28 "My designs" boards. Run: node build.mjs [--png]  -> desktop.html, mobile.html (+ PNGs with --png, via Playwright)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const dir = path.dirname(fileURLToPath(import.meta.url));

const css = `
:root{--brand:#1E293B;--bg:#F8FAFC;--surface:#fff;--muted-s:#F1F5F9;--ink:#0F172A;--ink2:#475569;--faint:#64748B;--bs:#E2E8F0;--bc:#7C8799;--ok:#15803D;--ok-c:#F0FDF4;--ok-b:#BBF7D0;--warn:#B45309;--warn-c:#FFFBEB;--warn-b:#FDE68A;--dan:#BE123C;--dan-c:#FFF1F2;--dan-b:#FECDD3;--pro:#4F46E5;--pro-c:#EEF2FF;--pro-b:#C7D2FE;--m1:#0F766E;--m2:#4F46E5;--m3:#0369A1}
*{box-sizing:border-box;margin:0;letter-spacing:normal;font-style:normal}
body{font-family:'IBM Plex Sans Arabic',sans-serif;background:#CBD5E1;color:var(--ink);font-size:14px;line-height:22px;-webkit-font-smoothing:antialiased}
.board{padding:32px;display:flex;flex-direction:column;gap:40px}
.board h1.bt{font-size:22px;font-weight:700;line-height:32px}.board .note{color:var(--ink2);font-size:13px}
.tag{font-size:14px;font-weight:600;margin-block-end:10px}.tag small{font-weight:400;color:var(--ink2);margin-inline-start:8px}
.row{display:flex;gap:28px;align-items:flex-start;flex-wrap:wrap}
.fr{background:var(--bg);border:1px solid #94A3B8;border-radius:12px;overflow:hidden;position:relative}
.fr.d{width:1360px}.fr.h{width:660px}.fr.m{width:375px}
.ov{position:absolute;inset:0;background:rgba(15,23,42,.45);display:grid;place-items:center;padding:24px;z-index:30}
.ov.sheet{place-items:end stretch;padding:0}
.dlg{background:#fff;border-radius:24px;padding:24px;width:460px;max-width:100%;display:flex;flex-direction:column;gap:14px}
.sheet .dlg{width:auto;border-end-start-radius:0;border-end-end-radius:0}
.dlg h3{font-size:20px;font-weight:600;line-height:32px}
.dlg .acts{display:flex;gap:12px;margin-block-start:6px}
.sheet .acts{flex-direction:column}.sheet .acts .btn{width:100%}
.app{display:flex;min-height:620px;position:relative}
aside{width:280px;background:var(--surface);border-inline-end:1px solid var(--bs);display:flex;flex-direction:column;flex-shrink:0}
.h aside{width:200px}
.brand{display:flex;align-items:center;gap:12px;padding:16px;height:64px;border-block-end:1px solid var(--bs)}
.mono{width:36px;height:36px;border-radius:8px;background:var(--brand);color:#fff;display:grid;place-items:center;font-weight:700;font-size:16px;flex-shrink:0}
.brand b{font-size:18px;font-weight:700}
.newchat{margin:16px 16px 8px}
.rec{padding:8px 16px;flex:1;color:var(--ink2);font-size:13px}.rec div.i{display:flex;justify-content:space-between;padding:8px 0;color:var(--ink);font-size:14px}
nav{padding:8px 12px;border-block-start:1px solid var(--bs);display:flex;flex-direction:column;gap:4px}
.nav{display:flex;align-items:center;gap:12px;min-height:44px;padding-inline:12px;border-radius:8px;color:var(--ink2);font-size:14px}
.nav.on{background:var(--muted-s);color:var(--ink);font-weight:600;box-shadow:inset -3px 0 0 var(--brand)}
main{flex:1;min-width:0;position:relative}
.top{height:64px;background:var(--surface);border-block-end:1px solid var(--bs);display:flex;align-items:center;justify-content:space-between;padding-inline:32px}
.h .top{padding-inline:16px}
.top h1{font-size:20px;font-weight:600}
.topr{display:flex;align-items:center;gap:12px}
.av{width:36px;height:36px;border-radius:50%;background:var(--brand);color:#fff;display:grid;place-items:center;font-size:13px;font-weight:600}
.chip{border:1px solid var(--bs);background:var(--muted-s);border-radius:9999px;padding:4px 14px;font-size:13px;color:var(--ink2)}
.content{padding:28px 32px}
.h .content{padding:20px 16px}.m .content{padding:16px}
.mtop{height:56px;background:#fff;border-block-end:1px solid var(--bs);display:flex;align-items:center;gap:8px;padding-inline:8px 16px}
.mtop h1{font-size:18px;font-weight:600;flex:1}
.ib{width:44px;height:44px;display:grid;place-items:center;border-radius:8px;color:var(--ink);background:transparent;border:0}
.btn{height:44px;padding-inline:16px;border-radius:8px;font:600 14px 'IBM Plex Sans Arabic',sans-serif;display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid var(--bc);background:#fff;color:var(--ink);white-space:nowrap}
.btn.p{background:var(--brand);border-color:var(--brand);color:#fff}
.btn.dg{color:var(--dan);border-color:var(--dan-b)}
.btn.off{background:var(--muted-s);border-color:var(--bs);color:#64748B}
.btn.ic{padding:0;width:44px}.btn.full{width:100%}
.hd{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-block-end:20px;flex-wrap:wrap}
.hd h2{font-size:24px;font-weight:600;line-height:36px}.hd p{color:var(--ink2);font-size:15px}
.m .hd h2{font-size:22px}.m .hd{margin-block-end:14px}
.badge{display:inline-flex;align-items:center;gap:4px;border-radius:9999px;padding:1px 10px;font-size:13px;font-weight:500;border:1px solid;white-space:nowrap}
.b-warn{color:var(--warn);background:var(--warn-c);border-color:var(--warn-b)}.b-pro{color:var(--pro);background:var(--pro-c);border-color:var(--pro-b)}
.card{background:#fff;border:1px solid var(--bs);border-radius:16px}
.sk{background:var(--muted-s);border-radius:8px}
.notice{display:flex;gap:10px;align-items:flex-start;border:1px solid;border-radius:12px;padding:12px 14px;font-size:14px}
.n-dan{background:var(--dan-c);border-color:var(--dan-b);color:var(--dan)}
.empty{display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;padding:48px 24px}
.empty .eic{width:64px;height:64px;border-radius:16px;background:var(--muted-s);display:grid;place-items:center;color:var(--ink2)}
.empty h3{font-size:20px;font-weight:600}.empty p{color:var(--ink2);max-width:440px}
.hint{color:var(--ink2);font-size:13px}
.ltr{direction:ltr;unicode-bidi:isolate;display:inline-block}
.frow{display:flex;align-items:center;gap:12px;margin-block-end:20px;position:relative;flex-wrap:wrap}
.frow label{font-weight:500;font-size:14px}
.sel{min-height:44px;min-width:260px;border:1px solid var(--bc);border-radius:8px;background:#fff;padding-inline:14px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:15px}
.m .frow{flex-direction:column;align-items:stretch;gap:6px}.m .sel{min-width:0;width:100%}
.lb{position:absolute;inset-block-start:calc(100% + 4px);inset-inline-start:0;width:260px;background:#fff;border:1px solid var(--bs);border-radius:16px;box-shadow:0 10px 24px -6px rgba(15,23,42,.14),0 2px 6px rgba(15,23,42,.06);padding:8px;z-index:20}
.lb div{display:flex;align-items:center;gap:10px;min-height:44px;padding-inline:12px;border-radius:8px;font-size:14px}
.lb div.on{background:var(--muted-s);font-weight:600}.lb div span.ck{margin-inline-start:auto;color:var(--ink);display:flex}
.gal{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.m .gal{grid-template-columns:repeat(2,1fr);gap:12px}
.dc{display:flex;flex-direction:column;position:relative}
.well{border-radius:15px 15px 0 0;background:var(--muted-s);display:grid;place-items:center;height:240px;border-block-end:1px solid var(--bs)}
.m .well{height:174px}
.well>div{box-shadow:0 1px 3px rgba(15,23,42,.18)}
.well svg{display:block;width:100%;height:100%}
.dc .bd{flex:1;padding:14px 16px 16px;display:flex;flex-direction:column;gap:10px}
.m .dc .bd{padding:10px 10px 12px;gap:8px}
.dc .nm{display:flex;align-items:center;gap:8px;justify-content:space-between}
.dc .nm b{font-size:16px;font-weight:600;line-height:24px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.m .dc .nm b{font-size:15px}
.dc .mt{color:var(--ink2);font-size:13px;line-height:20px}
.dc .rv{display:flex}
.acts2{display:flex;gap:8px;position:relative;margin-block-start:auto}
.m .acts2{flex-direction:column}.m .acts2>.btn,.m .acts2>.split{flex:none}
.acts2>.btn{flex:1}
.split{display:flex;position:relative;flex:1}
.split .btn:first-child{flex:1;border-start-end-radius:0;border-end-end-radius:0}
.split .btn:last-child{width:44px;padding:0;border-start-start-radius:0;border-end-start-radius:0;margin-inline-start:-1px}
.m .split .btn:last-child{display:none}.m .split .btn:first-child{border-radius:8px}
.dm{position:absolute;inset-block-start:calc(100% + 6px);inset-inline-end:0;width:312px;background:#fff;border:1px solid var(--bs);border-radius:16px;box-shadow:0 10px 24px -6px rgba(15,23,42,.14),0 2px 6px rgba(15,23,42,.06);padding:14px;z-index:20;display:flex;flex-direction:column;gap:14px;text-align:start}
.dg5{font-size:13px;font-weight:600;color:var(--ink2);margin-block-end:6px}
.seg{display:flex;gap:6px}
.seg span{flex:1;min-height:44px;display:grid;place-items:center;border:1px solid var(--bc);border-radius:8px;font-size:14px;font-weight:500;background:#fff}
.seg span.on{background:var(--brand);border-color:var(--brand);color:#fff;font-weight:600}
.opt{display:flex;align-items:center;gap:12px;min-height:52px;border:1px solid var(--bs);border-radius:12px;padding:6px 12px;margin-block-end:6px;background:#fff}
.opt.on{border-color:var(--brand);background:var(--muted-s)}
.opt .rd{width:20px;height:20px;border-radius:50%;border:2px solid var(--bc);flex-shrink:0;display:grid;place-items:center}
.opt.on .rd{border-color:var(--brand)}.opt.on .rd i{width:10px;height:10px;border-radius:50%;background:var(--brand);display:block}
.opt b{font-weight:600;font-size:14px;display:block;line-height:20px}.opt small{font-size:13px;color:var(--ink2);display:block;line-height:18px}
.ft{font-size:13px;color:var(--ink2)}
.toasts{position:absolute;inset-block-end:20px;inset-inline-end:20px;display:flex;flex-direction:column;gap:8px;width:360px;z-index:25}
.m .toasts{inset-inline:12px;width:auto}
.toast{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid var(--bs);border-radius:12px;padding:12px 14px;box-shadow:0 10px 24px -6px rgba(15,23,42,.18);font-size:14px}
.toast.e{border-color:var(--dan-b)}.toast.e .ti{color:var(--dan)}.toast .ti{color:var(--ok);display:flex}
.toast .btn{height:36px;padding-inline:12px;margin-inline-start:auto}
.more{display:flex;justify-content:center;margin-block-start:20px}
.m .more .btn{width:100%}
.amenu{position:absolute;inset-block-start:60px;inset-inline-end:16px;width:280px;background:#fff;border:1px solid var(--bs);border-radius:16px;box-shadow:0 10px 24px -6px rgba(15,23,42,.14),0 2px 6px rgba(15,23,42,.06);padding:8px;z-index:20}
.amenu .u{display:flex;gap:12px;align-items:center;padding:10px 12px}.amenu .u .av{width:40px;height:40px}
.amenu hr{border:0;border-block-start:1px solid var(--bs);margin:4px 0}
.mi{display:flex;align-items:center;gap:12px;min-height:44px;padding-inline:12px;border-radius:8px;font-size:14px;font-weight:500}
.mi.on{background:var(--muted-s)}.mi .ic2{color:var(--faint);display:flex}.mi.out{color:var(--dan)}.mi.out .ic2{color:var(--dan)}.mi span.f{flex:1}
.mi small{color:var(--ink2);font-size:13px;font-weight:400}
.uc{max-width:860px;margin-inline:auto;display:flex;flex-direction:column;gap:24px}
.m .uc{gap:16px}
.mp{display:flex;align-items:center;gap:8px}
.mp .sq{width:44px;height:44px;border:1px solid var(--bc);border-radius:8px;display:grid;place-items:center;background:#fff}
.mp .mb{min-height:44px;min-width:200px;border:1px solid var(--bc);border-radius:8px;background:#fff;padding-inline:16px;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:15px;font-weight:500}
.m .mp .mb{flex:1;min-width:0}
.tc{display:grid;grid-template-columns:1fr 1fr;gap:16px}.m .tc{gap:12px}
.tc .card{padding:24px}.m .tc .card{padding:14px}
.tc h2{font-size:14px;font-weight:500;color:var(--ink2)}.tc p{font-size:36px;line-height:52px;font-weight:700;margin-block-start:4px}.m .tc p{font-size:26px;line-height:40px}
.us h2{font-size:18px;font-weight:600;margin-block-end:12px}
.ut{background:#fff;border:1px solid var(--bs);border-radius:16px;overflow:hidden}
.uh,.ur{display:grid;gap:24px;padding-inline:24px;align-items:center}
.uh{padding-block:16px 8px;font-size:13px;font-weight:500;color:var(--ink2)}
.ur{padding-block:12px;min-height:64px;border-block-start:1px solid var(--bs)}
.c3{grid-template-columns:150px 1fr 90px 100px}.c4{grid-template-columns:1fr 100px 100px 110px}
.te{text-align:end}
.ur .lab{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:600;min-width:0}
.dotd{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.pbar{height:8px;border-radius:9999px;background:var(--muted-s);overflow:hidden}.pbar i{display:block;height:100%;border-radius:9999px}
.ur .num{font-size:15px;color:var(--ink2)}.ur .amt{font-size:16px;font-weight:600}
.agic{width:32px;height:32px;border-radius:8px;background:var(--muted-s);display:grid;place-items:center;color:var(--ink2);flex-shrink:0}
.mrow{padding:12px 14px;border-block-start:1px solid var(--bs);display:flex;flex-direction:column;gap:8px}
.mrow:first-child{border:0}
.mrow .l1{display:flex;justify-content:space-between;align-items:center;font-size:15px;font-weight:600}
.mrow .l1 .lab{display:flex;gap:10px;align-items:center}
.mrow .l2{display:flex;gap:16px;color:var(--ink2);font-size:14px}
.chart{padding:24px}.m .chart{padding:16px}
.chart h2{margin:0}
.bars{display:flex;align-items:flex-end;gap:10px;height:150px;margin-block-start:16px;border-block-end:1px solid var(--bc)}
.bars i{flex:1;background:var(--brand);border-radius:3px 3px 0 0;display:block}
.usn{display:flex;gap:8px;align-items:center;margin-block-start:10px;color:var(--ink2);font-size:13px}
`;

const P = {
  plus: '<path d="M5 12h14M12 5v14"/>',
  chev: '<path d="m9 18 6-6-6-6"/>', down: '<path d="m6 9 6 6 6-6"/>', check: '<path d="M20 6 9 17l-5-5"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>',
  layers: '<path d="m12 2-10 5 10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
  wallet: '<path d="M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l12-3v3M17 14h.01"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  img: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>', spin: '<path d="M21 12a9 9 0 1 1-6.2-8.6"/>',
  dl: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  cal: '<path d="M8 3v4m8-4v4M4 10h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/>',
  chart: '<path d="M4 4v16h16M8 16v-4m4 4V8m4 8v-6"/>', out: '<path d="M15 17l5-5-5-5M20 12H9m4 8H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7"/>',
  next: '<path d="M15 6l-6 6 6 6"/>',
};
const ic = (n, s = 20) => `<span style="display:inline-flex;flex-shrink:0"><svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg></span>`;

const navItems = (on, designer = true) => `<div class="nav">${ic('wallet', 18)} الرصيد</div>${designer ? `<div class="nav">${ic('layers', 18)} علاماتي التجارية</div><div class="nav ${on === 'designs' ? 'on' : ''}" ${on === 'designs' ? 'aria-current="page"' : ''}>${ic('img', 18)} تصاميمي</div>` : ''}<div class="nav">${ic('user', 18)} الحساب</div>`;
const sideNav = (on = 'designs', designer = true) => `<aside>
<div class="brand"><div class="mono">ل</div><b>لمحة AI</b></div>
<button class="btn p newchat">${ic('plus', 18)} محادثة جديدة</button>
<div class="rec">المحادثات الأخيرة<div class="i"><span>تصميم منشور للمعرض</span><span class="hint">الآن</span></div><div class="i"><span>ملخص عقد الإيجار</span><span class="hint">أمس</span></div></div>
<nav aria-label="التنقل">${navItems(on, designer)}</nav>
</aside>`;
const dApp = (title, body, o = {}) => `<div class="app">${sideNav(o.on === undefined ? 'designs' : o.on)}<main><div class="top"><h1>${title}</h1><div class="topr"><span class="chip">الرصيد <bdi dir="ltr">14.50$</bdi></span><span class="av" aria-hidden="true">س ع</span></div></div><div class="content">${body}</div>${o.menu || ''}</main></div>`;
const mApp = (title, body) => `<div class="mtop"><button class="ib" aria-label="فتح القائمة">${ic('menu', 24)}</button><h1>${title}</h1></div><div class="content">${body}</div>`;
const fr = (cls, t, note, inner, ov = '') => `<div><div class="tag">${t}${note ? `<small>${note}</small>` : ''}</div><div class="fr ${cls}">${inner}${ov}</div></div>`;

// ---------- artwork (fictional designs drawn as SVG at their real shape)
const SH = { sq: { w: 100, h: 100, o: [1024, 1024], s: [1080, 1080] }, st: { w: 90, h: 160, o: [1152, 2048], s: [1080, 1920] }, bn: { w: 160, h: 90, o: [1792, 1008], s: [1920, 1080] }, fb: { w: 90, h: 120, o: [1152, 1536], s: [1080, 1440] }, ed: { w: 120, h: 90, o: [1200, 900], s: [1440, 1080] } };
const K = {
  cafe: { n: 'مقهى الندى', c1: '#F2E3CF', c2: '#7A3E1D', c3: '#2F5D50', c4: '#C9A24B' },
  ofuq: { n: 'استوديو أفق للتصوير', c1: '#0B3C5D', c2: '#D9B310', c3: '#328CC1', c4: '#FFFFFF' },
  sana: { n: 'عيادة سنا', c1: '#E6FFFA', c2: '#0F766E', c3: '#134E4A', c4: '#99F6E4' },
  zahra: { n: 'متجر زهرة', c1: '#FFF0F5', c2: '#D6336C', c3: '#7A1B3E', c4: '#F7B2CB' },
};
const FMT = { instagram_post: 'منشور إنستغرام', instagram_story: 'ستوري إنستغرام', facebook_post: 'منشور فيسبوك', banner: 'بانر', product_image: 'صورة منتج' };
const art = (shape, k, head, sub, style = 0) => {
  const { w, h } = SH[shape]; const c = K[k];
  const fs = 9; const cx = w / 2;
  const txt = (y, size, wt, fill, s) => `<text x="${cx}" y="${y}" text-anchor="middle" direction="rtl" font-family="IBM Plex Sans Arabic" font-size="${size}" font-weight="${wt}" fill="${fill}">${s}</text>`;
  let bg = '', fg = c.c2, fg2 = c.c3;
  if (style === 0) bg = `<rect width="${w}" height="${h}" fill="${c.c1}"/><circle cx="${w * .5}" cy="${h * .3}" r="${Math.min(w, h) * .2}" fill="${c.c2}"/><circle cx="${w * .5}" cy="${h * .3}" r="${Math.min(w, h) * .09}" fill="${c.c1}"/>`;
  if (style === 1) { bg = `<rect width="${w}" height="${h}" fill="${c.c1}"/><path d="M0 ${h * .55}L${w} ${h * .3}V${h}H0z" fill="${c.c2}"/><circle cx="${w * .72}" cy="${h * .22}" r="${Math.min(w, h) * .1}" fill="${c.c4}"/>`; fg = '#fff'; fg2 = '#fff'; }
  if (style === 2) { bg = `<rect width="${w}" height="${h}" fill="${c.c2}"/><rect y="${h * .62}" width="${w}" height="${h * .38}" fill="${c.c3}"/><circle cx="${w * .3}" cy="${h * .3}" r="${Math.min(w, h) * .14}" fill="${c.c4}"/>`; fg = '#fff'; fg2 = '#fff'; }
  const hy = shape === 'bn' ? h * .62 : h * (style === 0 ? .66 : .72);
  const by = hy + fs * 1.4;
  const t = txt(hy, fs, 700, fg, head) + txt(by, fs * .62, 500, fg2, sub);
  const pill = `<rect x="${cx - 22}" y="${h - 12}" width="44" height="7" rx="3.5" fill="${style === 0 ? c.c2 : c.c4}"/>`;
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${head}">${bg}${t}${pill}</svg>`;
};
const fit = (shape, mw, mh) => { const { w, h } = SH[shape]; const r = w / h; let W = mw, H = mw / r; if (H > mh) { H = mh; W = mh * r; } return [Math.round(W), Math.round(H)]; };
const px = (a) => `<bdi dir="ltr">${a[0]}×${a[1]}</bdi>`;

const D = [
  { k: 'cafe', sh: 'sq', f: 'instagram_post', d: '11 نوفمبر 2026', v: 2, head: 'قهوة الصباح', sub: 'بطعم البيت', st: 0 },
  { k: 'ofuq', sh: 'st', f: 'instagram_story', d: '10 نوفمبر 2026', rv: 1, head: 'حجز الجلسات', sub: 'خصم هذا الأسبوع', st: 2 },
  { k: 'sana', sh: 'bn', f: 'banner', d: '9 نوفمبر 2026', head: 'ابتسامتك أولًا', sub: 'فحص مجاني', st: 1 },
  { k: 'cafe', sh: 'fb', f: 'facebook_post', d: '8 نوفمبر 2026', head: 'حلويات منزلية', sub: 'كل يوم طازجة', st: 1 },
  { k: 'ofuq', sh: 'ed', f: null, d: '7 نوفمبر 2026', head: 'معرض الصور', sub: 'الجمعة المقبلة', st: 0 },
  { k: 'sana', sh: 'sq', f: 'product_image', d: '5 نوفمبر 2026', head: 'كريم العناية', sub: 'للبشرة الحساسة', st: 2 },
  { k: 'cafe', sh: 'st', f: 'instagram_story', d: '4 نوفمبر 2026', head: 'عرض الشتاء', sub: 'مشروبات ساخنة', st: 2 },
  { k: 'ofuq', sh: 'bn', f: 'banner', d: '2 نوفمبر 2026', rv: 1, head: 'تصوير المنتجات', sub: 'احجز موعدك', st: 1 },
  { k: 'sana', sh: 'sq', f: 'instagram_post', d: '1 نوفمبر 2026', v: 2, head: 'نصائح الأسنان', sub: 'كل أسبوع', st: 0 },
];
const fmtLabel = (x) => (x.f ? FMT[x.f] : 'تصميم معدَّل');

const typeSeg = (sel = 'PNG') => `<div class="seg" role="radiogroup" aria-label="نوع الملف">${['PNG', 'JPG', 'WebP'].map((t) => `<span class="${t === sel ? 'on' : ''}" role="radio" aria-checked="${t === sel}"><bdi dir="ltr">${t}</bdi></span>`).join('')}</div>`;
const sizeOpts = (shape, sel = 'o') => `<div role="radiogroup" aria-label="الحجم"><div class="opt ${sel === 'o' ? 'on' : ''}" role="radio" aria-checked="${sel === 'o'}"><span class="rd">${sel === 'o' ? '<i></i>' : ''}</span><div><b>الحجم الأصلي</b><small>${px(SH[shape].o)} بكسل</small></div></div><div class="opt ${sel === 's' ? 'on' : ''}" role="radio" aria-checked="${sel === 's'}"><span class="rd">${sel === 's' ? '<i></i>' : ''}</span><div><b>مقاس منصات التواصل</b><small>${px(SH[shape].s)} بكسل</small></div></div></div>`;
const menuBody = (shape, t = 'PNG', s = 'o') => `<div><div class="dg5">نوع الملف</div>${typeSeg(t)}${t === 'JPG' ? '<div class="ft" style="margin-block-start:6px">يُوضع JPG على خلفية بيضاء.</div>' : ''}</div><div><div class="dg5">الحجم</div>${sizeOpts(shape, s)}</div><div class="ft">يبقى شكل التصميم كما هو دون قصّ.</div>`;

const card = (x, c, o = {}) => {
  const [mw, mh] = c === 'm' ? [141, 150] : [304, 216]; const [W, H] = fit(x.sh, mw, mh);
  const k = K[x.k];
  const dlBtn = o.busy ? `<button class="btn off" disabled aria-busy="true">${ic('spin', 18)} جارٍ التنزيل…</button>`
    : `<div class="split"><button class="btn">${ic('dl', 18)} تنزيل</button><button class="btn" aria-label="خيارات التنزيل" aria-haspopup="menu" aria-expanded="${!!o.menu}">${ic('down', 18)}</button></div>`;
  return `<article class="card dc"><div class="well"><div style="width:${W}px;height:${H}px">${art(x.sh, x.k, x.head, x.sub, x.st)}</div></div><div class="bd"><div class="nm"><b title="${k.n}">${k.n}</b>${x.v ? `<span class="badge b-pro"><bdi dir="ltr">v${x.v}</bdi></span>` : ''}</div><div class="mt">${fmtLabel(x)} · ${x.d}</div>${x.rv ? `<div class="rv"><span class="badge b-warn">${ic('alert', 14)} تحقّق من النص</span></div>` : ''}<div class="acts2"><button class="btn">${ic('chat', 18)} فتح المحادثة</button>${dlBtn}${o.menu ? `<div class="dm" role="menu" aria-label="خيارات التنزيل">${menuBody(x.sh, o.menu[0], o.menu[1])}</div>` : ''}</div></div></article>`;
};
const skCard = (c) => `<div class="card dc" aria-hidden="true"><div class="well"><div class="sk" style="width:${c === 'm' ? 110 : 190}px;height:${c === 'm' ? 110 : 190}px;box-shadow:none"></div></div><div class="bd"><div class="sk" style="height:18px;width:60%"></div><div class="sk" style="height:14px;width:80%"></div><div class="sk" style="height:44px"></div></div></div>`;

const brands = ['كل العلامات', 'مقهى الندى', 'استوديو أفق للتصوير', 'عيادة سنا', 'متجر زهرة'];
const selBox = (v, open) => `<div class="sel" role="combobox" aria-haspopup="listbox" aria-expanded="${!!open}" aria-label="العلامة التجارية"><span>${v}</span>${ic('down', 18)}</div>`;
const filterRow = (v = 'كل العلامات', open = false) => `<div class="frow"><label>العلامة التجارية</label>${selBox(v, open)}${open ? `<div class="lb" role="listbox" style="inset-inline-start:98px">${brands.map((b) => `<div class="${b === v ? 'on' : ''}" role="option" aria-selected="${b === v}">${b}${b === v ? `<span class="ck">${ic('check', 18)}</span>` : ''}</div>`).join('')}</div>` : ''}</div>`;
const head = () => `<div class="hd"><div><h2>تصاميمي</h2><p>التصاميم التي سلّمها لك «مصمم جرافيك»، الأحدث أولًا.</p></div></div>`;
const more = (c, busy) => `<div class="more">${busy ? `<button class="btn off ${c === 'm' ? 'full' : ''}" disabled aria-busy="true">${ic('spin', 18)} جارٍ التحميل…</button>` : `<button class="btn ${c === 'm' ? 'full' : ''}">تحميل المزيد</button>`}</div>`;
const cards = (list, c, o = {}) => `<div class="gal">${list.map((x, i) => card(x, c, o[i] || {})).join('')}</div>`;
const galleryBody = (c, o = {}) => `${head()}${filterRow(o.brand, o.open)}${cards(o.list || D, c, o.o || {})}${o.after || ''}`;
const emptyAll = (c) => `${head()}<div class="card empty"><div class="eic">${ic('img', 30)}</div><h3>لا توجد تصاميم بعد</h3><p>اطلب من «مصمم جرافيك» في المحادثة أن يصمّم لك منشورًا أو ستوري أو بانرًا، وستجد تصاميمك هنا.</p><div style="display:flex;${c === 'm' ? 'width:100%;flex-direction:column' : ''}"><button class="btn p">${ic('sparkle', 18)} التحدث مع مصمم جرافيك</button></div></div>`;
const emptyBrand = (c, b = 'متجر زهرة') => `${head()}${filterRow(b)}<div class="card empty"><div class="eic">${ic('img', 30)}</div><h3>لا توجد تصاميم لعلامة «${b}»</h3><p>لم يسلّم لك «مصمم جرافيك» تصاميم لهذه العلامة بعد. اختر علامة أخرى أو ابدأ تصميمًا جديدًا في المحادثة.</p><div style="display:flex;gap:10px;${c === 'm' ? 'width:100%;flex-direction:column' : 'flex-wrap:wrap;justify-content:center'}"><button class="btn p">${ic('sparkle', 18)} التحدث مع مصمم جرافيك</button><button class="btn">عرض كل العلامات</button></div></div>`;
const loadB = (c) => `${head()}${filterRow()}<div class="gal" aria-busy="true" role="status" aria-label="جارٍ تحميل التصاميم">${Array.from({ length: 6 }, () => skCard(c)).join('')}</div>`;
const errB = () => `${head()}${filterRow('عيادة سنا')}<div class="notice n-dan" role="alert" style="align-items:center;flex-wrap:wrap">${ic('alert', 20)}<div style="flex:1;min-width:200px">تعذّر تحميل تصاميمك. تحقق من الاتصال وحاول مرة أخرى.</div><button class="btn dg">${ic('refresh', 18)} إعادة المحاولة</button></div>`;
const toast = (kind, t, retry) => `<div class="toast ${kind}" role="${kind === 'e' ? 'alert' : 'status'}"><span class="ti">${ic(kind === 'e' ? 'alert' : 'check', 20)}</span><span>${t}</span>${retry ? `<button class="btn">إعادة المحاولة</button>` : ''}</div>`;
const moreErr = `<div class="notice n-dan" role="alert" style="margin-block-start:16px;align-items:center;flex-wrap:wrap">${ic('alert', 20)}<div style="flex:1">تعذّر تحميل المزيد. حاول مرة أخرى.</div><button class="btn dg">${ic('refresh', 18)} إعادة المحاولة</button></div>`;

// ---------- usage
const monthPicker = `<div class="mp" role="group" aria-label="اختيار الشهر"><span class="sq">${ic('chev', 20)}</span><span class="mb"><span style="display:flex;gap:8px;align-items:center;color:var(--ink)">${ic('cal', 20)} نوفمبر 2026</span>${ic('down', 16)}</span><span class="sq" style="opacity:.4;background:var(--muted-s)">${ic('next', 20)}</span></div>`;
const totals = (z) => `<section class="tc" aria-label="إجمالي الشهر"><div class="card"><h2>الرسائل</h2><p><bdi dir="ltr">${z ? 0 : 49}</bdi></p></div><div class="card"><h2>المبلغ المحسوم</h2><p><bdi dir="ltr">${z ? '0.00' : '3.59'}$</bdi></p></div></section>`;
const MODES = [['متقدم', 'm2', 100, 14, '2.15'], ['سريع', 'm1', 39, 31, '0.84'], ['تصميم', 'm3', 28, 4, '0.60']];
const modeD = `<section class="us"><h2>حسب الوضع</h2><div class="ut"><div class="uh c3"><span>الوضع</span><span class="sr-only"></span><span class="te">الرسائل</span><span class="te">المبلغ</span></div>${MODES.map(([l, c, w, n, a]) => `<div class="ur c3"><span class="lab"><span class="dotd" style="background:var(--${c})"></span>${l}</span><div class="pbar" aria-hidden="true"><i style="width:${w}%;background:var(--${c})"></i></div><span class="num te"><bdi dir="ltr">${n}</bdi></span><span class="amt te"><bdi dir="ltr">${a}$</bdi></span></div>`).join('')}</div></section>`;
const modeM = `<section class="us"><h2>حسب الوضع</h2><div class="ut">${MODES.map(([l, c, w, n, a]) => `<div class="mrow"><div class="l1"><span class="lab"><span class="dotd" style="background:var(--${c})"></span>${l}</span><bdi dir="ltr">${a}$</bdi></div><div class="pbar" aria-hidden="true"><i style="width:${w}%;background:var(--${c})"></i></div><div class="l2"><span>الرسائل: <bdi dir="ltr">${n}</bdi></span></div></div>`).join('')}</div></section>`;
const NOTE = `<div class="usn">${ic('alert', 14)} تُحسب التصاميم بشكل منفصل عن إجمالي الرسائل أعلاه.</div>`;
const defN = { r: 4, d: 7, a: '1.12' };
const designsD = (n = defN) => `<section class="us" aria-labelledby="dsg"><h2 id="dsg">التصاميم</h2><div class="ut"><div class="uh c4"><span>الوكيل</span><span class="te">الطلبات</span><span class="te">التصاميم</span><span class="te">المبلغ</span></div><div class="ur c4"><span class="lab"><span class="agic">${ic('sparkle', 18)}</span>مصمم جرافيك</span><span class="num te"><bdi dir="ltr">${n.r}</bdi></span><span class="num te"><bdi dir="ltr">${n.d}</bdi></span><span class="amt te"><bdi dir="ltr">${n.a}$</bdi></span></div></div>${NOTE}</section>`;
const designsM = (n = defN) => `<section class="us" aria-labelledby="dsg"><h2 id="dsg">التصاميم</h2><div class="ut"><div class="mrow"><div class="l1"><span class="lab"><span class="agic">${ic('sparkle', 18)}</span>مصمم جرافيك</span><bdi dir="ltr">${n.a}$</bdi></div><div class="l2"><span>الطلبات: <bdi dir="ltr">${n.r}</bdi></span><span>التصاميم: <bdi dir="ltr">${n.d}</bdi></span></div></div></div>${NOTE}</section>`;
const chartC = `<section class="us card chart"><h2>الاستهلاك اليومي</h2><div class="bars" aria-hidden="true">${[40, 100, 28, 70, 8, 52].map((h) => `<i style="height:${h}%"></i>`).join('')}</div><div class="usn">الأيام بتوقيت UTC</div></section>`;
const usageD = (o = {}) => `<div class="uc"><div style="display:flex;justify-content:space-between;align-items:center;gap:16px">${monthPicker}<span class="hint">يُحسب الشهر بتوقيت UTC.</span></div>${totals(o.zero)}${o.zero ? '' : modeD}${designsD(o.n)}${o.zero ? '' : chartC}</div>`;
const usageM = (o = {}) => `<div class="uc">${monthPicker}${totals(o.zero)}${o.zero ? '' : modeM}${designsM(o.n)}${o.zero ? '' : chartC}</div>`;

const mi = (icon, l, extra = '', cls = '') => `<div class="mi ${cls}" role="menuitem"><span class="ic2">${ic(icon, 20)}</span><span class="f">${l}</span>${extra}</div>`;
const acctMenu = `<div class="amenu" role="menu" aria-label="الحساب"><div class="u"><span class="av">س ع</span><div><div style="font-weight:600;font-size:15px">سيف عمران</div><div class="hint ltr" dir="ltr">seif@example.com</div></div></div><hr>${mi('wallet', 'الرصيد', '<small><bdi dir="ltr">14.50$</bdi></small>')}${mi('chart', 'استهلاكي')}${mi('layers', 'علاماتي التجارية')}${mi('img', 'تصاميمي', '', 'on')}${mi('user', 'الحساب')}<hr>${mi('out', 'تسجيل الخروج', '', 'out')}</div>`;

const font = '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">';
const T = 'تصاميمي';
const df = (cls, t, n, body, ov, o) => fr(cls, t, n, dApp(T, body, o), ov);
const first6 = D.slice(0, 6);
const cafeOnly = D.filter((x) => x.k === 'cafe').concat([{ k: 'cafe', sh: 'sq', f: 'product_image', d: '28 أكتوبر 2026', head: 'بن مختص', sub: 'محمّص طازج', st: 2 }]);
const miniSide = (t, d) => `<div style="width:280px"><div class="tag">${t}</div><div class="fr" style="height:430px;display:flex">${sideNav('designs', d).replace('<aside>', '<aside style="width:100%;border:0">')}</div></div>`;

const desktop = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>S28 تصاميمي</title>${font}<style>${css}</style></head><body><div class="board">
<div><h1 class="bt">S28 · تصاميمي (معرض التصاميم، سطح المكتب)</h1><p class="note">لوحة تصميم: العناوين والملاحظات الصغيرة شرح للمراجعة وليست جزءًا من الواجهة. بيانات وتصاميم تجريبية (SVG) بأشكالها الحقيقية: مربع 1:1، ستوري 9:16، بانر 16:9، فيسبوك 3:4، وتصميم معدَّل مرفوع بشكله (هنا 4:3). لكل بطاقة منطقة معاينة بارتفاع ثابت والتصميم داخلها بنسبته دون قصّ، فيبقى ترتيب «الأحدث أولًا» واضحًا.</p></div>
${df('d', '1. المعرض /designs', 'تسعة تصاميم، شارة v2، «تحقّق من النص»، «تصميم معدَّل»، تحميل المزيد', galleryBody('d', { after: more('d') }))}
${df('d', '1b. قائمة التنزيل', 'زر «تنزيل» ينزّل بالاختيارات الحالية (PNG والحجم الأصلي افتراضيًا)، والسهم يفتح النوع والحجم بالبكسل', galleryBody('d', { list: first6, o: { 1: { menu: ['PNG', 'o'] } } }))}
${df('d', '1c. قائمة التنزيل: مقاس منصات التواصل', 'بطاقة بانر، JPG و«مقاس منصات التواصل»، مع تنبيه الخلفية البيضاء', galleryBody('d', { list: first6, o: { 2: { menu: ['JPG', 's'] } } }))}
${df('d', '1d. تصفية حسب العلامة', 'القائمة مفتوحة: كل العلامات وأسماء العلامات', galleryBody('d', { open: true, list: first6.slice(0, 3) }))}
${df('d', '1e. بعد التصفية: «مقهى الندى»', '', galleryBody('d', { brand: 'مقهى الندى', list: cafeOnly }))}
${df('d', '1f. علامة بلا تصاميم', 'متجر زهرة: لا شيء بعد، مع طريق للمحادثة ولعرض كل العلامات', emptyBrand('d'))}
${df('d', '2. لا تصاميم بعد', 'يشير إلى «مصمم جرافيك» في المحادثة', emptyAll('d'))}
${df('d', '3. جارٍ التحميل', 'هياكل بنفس بنية البطاقة، والتصفية ظاهرة', loadB('d'))}
${df('d', '4. تعذّر التحميل', 'العلامة المختارة تبقى، وإعادة المحاولة', errB())}
${df('d', '5. تحميل المزيد: جارٍ التحميل، وعند الفشل', 'البطاقات المحمّلة تبقى في الحالتين', `${head()}${filterRow()}${cards(D.slice(0, 3), 'd')}<div class="gal" style="margin-block-start:16px" aria-busy="true">${skCard('d')}${skCard('d')}${skCard('d')}</div>${more('d', true)}<div class="hint" style="margin-block:28px 8px">عند الفشل:</div>${moreErr}${more('d')}`)}
${df('d', '6. أثناء التنزيل وبعده', 'الزر معطّل «جارٍ التنزيل…»؛ إشعاران (sonner) أسفل اليسار: نجاح وفشل مع إعادة المحاولة', galleryBody('d', { list: first6.slice(0, 3), o: { 0: { busy: true } } }), `<div class="toasts">${toast('ok', 'بدأ تنزيل التصميم.')}${toast('e', 'تعذّر تنزيل التصميم.', true)}</div>`)}
<div class="row">
<div style="width:660px"><div class="tag">7. قائمة الحساب <small>«تصاميمي» بعد «علاماتي التجارية» وقبل «الحساب»</small></div><div class="fr h" style="height:520px"><div class="app" style="min-height:520px">${sideNav('designs')}<main><div class="top"><h1>${T}</h1><div class="topr"><span class="chip">الرصيد <bdi dir="ltr">14.50$</bdi></span><span class="av">س ع</span></div></div><div class="content">${head()}</div>${acctMenu}</main></div></div></div>
<div style="display:flex;gap:24px">${miniSide('8a. الشريط الجانبي: الباقة تتيح «مصمم جرافيك»', true)}${miniSide('8b. الباقة لا تتيحه: لا «علاماتي التجارية» ولا «تصاميمي»', false)}</div>
</div>
<div><h1 class="bt" style="margin-block-end:4px">«استهلاكي»: قسم «التصاميم» (S20 مع إضافة)</h1><p class="note">القسم الجديد بعد «حسب الوضع» وقبل «الاستهلاك اليومي»، بنفس بطاقات S20. يُرسم فقط عندما تحتوي designs[] على عناصر. لا يدخل في «الرسائل» و«المبلغ المحسوم».</p></div>
${fr('d', '9. استهلاكي: الشهر الحالي مع التصاميم', 'وكيل واحد الآن (مصمم جرافيك): الطلبات، التصاميم، المبلغ', dApp('استهلاكي', usageD(), { on: null }))}
${fr('d', '9b. شهر تصاميم فقط (بلا رسائل)', 'الرسائل 0 والمبلغ 0.00$، لكن التصاميم تظهر بدل بطاقة «لا يوجد استهلاك»', dApp('استهلاكي', usageD({ zero: true, n: { r: 2, d: 3, a: '0.48' } }), { on: null }))}
</div></body></html>`;
fs.writeFileSync(path.join(dir, 'desktop.html'), desktop);

// ---------- mobile
const sheetDl = (x, t, s) => { const [a, b] = fit(x.sh, 48, 48); return `<div class="ov sheet"><div class="dlg" role="dialog" aria-modal="true" aria-label="تنزيل التصميم"><div style="display:flex;gap:12px;align-items:center"><div style="width:56px;height:56px;display:grid;place-items:center;background:var(--muted-s);border-radius:8px"><div style="width:${a}px;height:${b}px">${art(x.sh, x.k, x.head, x.sub, x.st)}</div></div><div><h3 style="font-size:18px;line-height:28px">تنزيل التصميم</h3><div class="hint">${K[x.k].n} · ${fmtLabel(x)}</div></div></div>${menuBody(x.sh, t, s)}<div class="acts"><button class="btn p">${ic('dl', 18)} تنزيل</button><button class="btn">إلغاء</button></div></div></div>`; };
const sheetBrand = `<div class="ov sheet"><div class="dlg" role="dialog" aria-modal="true" aria-label="العلامة التجارية" style="gap:8px"><h3>العلامة التجارية</h3>${brands.map((b, i) => `<div class="mi ${i === 1 ? 'on' : ''}" role="option" style="min-height:48px">${b}${i === 1 ? `<span style="margin-inline-start:auto;display:flex">${ic('check', 20)}</span>` : ''}</div>`).join('')}</div></div>`;
const mf = (t, n, body, ov, title = T) => fr('m', t, n, mApp(title, body), ov);
const drawer = `<div class="app" style="min-height:660px">${sideNav('designs').replace('<aside>', '<aside style="width:300px">')}<div style="flex:1;background:rgba(15,23,42,.45)"></div></div>`;
const mTop = D.slice(0, 6);
const mobile = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>S28 تصاميمي (جوال)</title>${font}<style>${css}</style></head><body><div class="board">
<div><h1 class="bt">S28 · تصاميمي (جوال 375px)</h1><p class="note">عمودان من البطاقات بأشكال التصاميم الحقيقية. التصفية حقل اختيار يفتح ورقة سفلية. «تنزيل» يفتح ورقة سفلية فيها النوع والحجم وزر «تنزيل» (لا سهم قائمة على الجوال). القائمة الجانبية درج من اليمين.</p></div>
<div class="row">
${mf('م1. المعرض', '', galleryBody('m', { list: mTop, after: more('m') }))}
${mf('م1b. تصفية: «مقهى الندى»', '', galleryBody('m', { brand: 'مقهى الندى', list: cafeOnly.slice(0, 4) }))}
${mf('م1c. علامة بلا تصاميم', '', emptyBrand('m'))}
${mf('م2. لا تصاميم بعد', '', emptyAll('m'))}
</div><div class="row">
${mf('م3. جارٍ التحميل', '', loadB('m'))}
${mf('م4. تعذّر التحميل', '', errB())}
${mf('م5. التصفية: ورقة اختيار العلامة', '', galleryBody('m', { brand: 'مقهى الندى', list: mTop.slice(0, 2) }), sheetBrand)}
${mf('م6. التنزيل: PNG والحجم الأصلي', 'ستوري', galleryBody('m', { list: mTop.slice(0, 4) }), sheetDl(D[1], 'PNG', 'o'))}
</div><div class="row">
${mf('م7. التنزيل: JPG ومقاس منصات التواصل', 'بانر مع تنبيه الخلفية البيضاء', galleryBody('m', { list: mTop.slice(0, 4) }), sheetDl(D[2], 'JPG', 's'))}
${mf('م8. أثناء التنزيل وإشعار الفشل', '', galleryBody('m', { list: mTop.slice(0, 4), o: { 0: { busy: true } } }), `<div class="toasts">${toast('e', 'تعذّر تنزيل التصميم.', true)}</div>`)}
${mf('م9. تحميل المزيد جارٍ', '', `${head()}${filterRow()}${cards(D.slice(4, 6), 'm')}<div class="gal" style="margin-block-start:12px">${skCard('m')}${skCard('m')}</div>${more('m', true)}`)}
<div><div class="tag">م10. الدرج الجانبي <small>«تصاميمي» بعد «علاماتي التجارية»</small></div><div class="fr m">${drawer}</div></div>
</div><div class="row">
${mf('م11. استهلاكي: قسم التصاميم', 'بعد «حسب الوضع»', usageM(), '', 'استهلاكي')}
${mf('م12. استهلاكي: شهر تصاميم فقط', '', usageM({ zero: true, n: { r: 2, d: 3, a: '0.48' } }), '', 'استهلاكي')}
</div>
</div></body></html>`;
fs.writeFileSync(path.join(dir, 'mobile.html'), mobile);
console.log('html ok');

if (process.argv.includes('--png')) {
  const req = createRequire(path.resolve(dir, '../../../package.json'));
  const { chromium } = req('playwright');
  let b; try { b = await chromium.launch({ channel: 'chrome' }); } catch { b = await chromium.launch(); }
  for (const n of ['desktop', 'mobile']) {
    const pg = await b.newPage({ viewport: { width: 1424, height: 900 } });
    await pg.goto('file:///' + path.join(dir, n + '.html').replace(/\\/g, '/'), { waitUntil: 'networkidle' });
    await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(500);
    await pg.screenshot({ path: path.join(dir, n + '.png'), fullPage: true });
    const over = await pg.evaluate(() => [...document.querySelectorAll('.fr.m')].map((f) => { const r = f.getBoundingClientRect(); return [...f.querySelectorAll('*')].filter((e) => { const q = e.getBoundingClientRect(); return q.width && (q.right > r.right + 1 || q.left < r.left - 1); }).length; }));
    console.log(n, 'mobile-frame overflow counts', over.join(','));
    await pg.close();
  }
  await b.close();
}
