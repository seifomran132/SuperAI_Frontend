// Hand-built S29 boards: admin design reports (overview, user usage, runs list, run detail, agent instructions). Shell, tables, dialogs, sheets copied from S26. Run: node build.mjs && node render.mjs
// Output: desktop.html, mobile.html (PNGs rendered with render.mjs, headless Chrome via Playwright).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));

const css = `
:root{--brand:#1E293B;--bg:#F8FAFC;--surface:#fff;--muted-s:#F1F5F9;--ink:#0F172A;--ink2:#475569;--bs:#E2E8F0;--bc:#7C8799;--ok:#15803D;--ok-c:#F0FDF4;--ok-b:#BBF7D0;--warn:#B45309;--warn-c:#FFFBEB;--warn-b:#FDE68A;--dan:#BE123C;--dan-c:#FFF1F2;--dan-b:#FECDD3;--pro:#4F46E5;--pro-c:#EEF2FF;--pro-b:#C7D2FE;--focus:#4F46E5}
*{box-sizing:border-box;margin:0;letter-spacing:normal;font-style:normal}
body{font-family:'IBM Plex Sans Arabic',sans-serif;background:#CBD5E1;color:var(--ink);font-size:14px;line-height:22px;-webkit-font-smoothing:antialiased}
.board{padding:32px;display:flex;flex-direction:column;gap:40px}
.board h1.bt{font-size:22px;font-weight:700;line-height:32px}
.board .note{color:var(--ink2);font-size:13px}
.tag{font-size:14px;font-weight:600;margin-block-end:10px;color:var(--ink)}
.tag small{font-weight:400;color:var(--ink2);margin-inline-start:8px}
.fr{background:var(--bg);border:1px solid #94A3B8;border-radius:12px;overflow:hidden;position:relative}
.app{display:flex;min-height:560px}
aside{width:260px;background:var(--surface);border-inline-end:1px solid var(--bs);display:flex;flex-direction:column;flex-shrink:0}
.brand{display:flex;align-items:center;gap:12px;padding:16px;height:64px;border-block-end:1px solid var(--bs)}
.mono{width:36px;height:36px;border-radius:8px;background:var(--brand);color:#fff;display:grid;place-items:center;font-weight:700;font-size:16px;flex-shrink:0}
.brand b{font-size:18px;font-weight:700;line-height:22px;display:block}.brand small{display:block;font-size:12px;color:var(--ink2);font-weight:400;line-height:16px}
nav{padding:8px 12px;flex:1;display:flex;flex-direction:column;gap:4px}
.nav{display:flex;align-items:center;gap:12px;min-height:44px;padding-inline:12px;border-radius:6px;color:var(--ink2);font-size:14px}
.nav.on{background:var(--muted-s);color:var(--ink);font-weight:600}
.foot{padding:12px;border-block-start:1px solid var(--bs)}
main{flex:1;min-width:0}
.top{height:64px;background:var(--surface);border-block-end:1px solid var(--bs);display:flex;align-items:center;justify-content:space-between;padding-inline:32px}
.top h1{font-size:20px;font-weight:600;line-height:30px}
.avatar{width:36px;height:36px;border-radius:50%;background:var(--brand);color:#fff;display:grid;place-items:center;font-size:13px;font-weight:600}
.who{display:flex;align-items:center;gap:10px;color:var(--ink2)}
.content{padding:24px 32px}
.bar{display:flex;gap:12px;align-items:center;margin-block-end:16px}
.bar .sp{flex:1}
.in,.sel{height:44px;border:1px solid var(--bc);border-radius:8px;background:#fff;padding-inline:12px;display:flex;align-items:center;gap:8px;color:var(--ink);font-size:14px}
.ph{color:var(--ink2)}
.sel{min-width:170px;justify-content:space-between}
.btn{height:44px;padding-inline:18px;border-radius:8px;font-weight:600;font-size:14px;display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid var(--bc);background:#fff;color:var(--ink);white-space:nowrap}
.btn.p{background:var(--brand);border-color:var(--brand);color:#fff}
.btn.d{color:var(--dan);border-color:var(--dan-b);background:#fff}.btn.dp{background:var(--dan);border-color:var(--dan);color:#fff}
.btn.g{border-color:transparent;background:transparent;color:var(--ink)}
.btn.off{background:var(--muted-s);border-color:var(--bs);color:#64748B}
.btn.sm{height:44px;padding-inline:14px}
.btn.ok{background:var(--ok-c);border-color:var(--ok-b);color:var(--ok)}
.card{background:#fff;border:1px solid var(--bs);border-radius:16px}
table{width:100%;border-collapse:collapse}
th{background:var(--muted-s);color:var(--ink2);font-weight:600;font-size:13px;text-align:start;padding:10px 16px;line-height:20px}
td{padding:10px 16px;border-block-start:1px solid var(--bs);vertical-align:middle;font-size:14px}
.tw table{border-radius:16px}
.tw th:first-child{border-start-start-radius:15px}.tw th:last-child{border-start-end-radius:15px}
.ltr{direction:ltr;unicode-bidi:isolate;display:inline-block}
.code{direction:ltr;unicode-bidi:isolate;display:inline-block;font-weight:600;letter-spacing:normal}
a.lnk{color:var(--pro);text-decoration:underline;text-underline-offset:3px}
.badge{display:inline-flex;align-items:center;gap:4px;border-radius:9999px;padding:1px 10px;font-size:13px;font-weight:500;line-height:20px;border:1px solid;white-space:nowrap}
.b-ok{color:var(--ok);background:var(--ok-c);border-color:var(--ok-b)}.b-warn{color:var(--warn);background:var(--warn-c);border-color:var(--warn-b)}
.b-dan{color:var(--dan);background:var(--dan-c);border-color:var(--dan-b)}.b-pro{color:var(--pro);background:var(--pro-c);border-color:var(--pro-b)}
.b-n{color:var(--ink2);background:var(--muted-s);border-color:var(--bs)}
.sub{color:var(--ink2);font-size:13px}
.pos{color:var(--ok);font-weight:600}
.more{display:flex;justify-content:center;padding:14px;border-block-start:1px solid var(--bs)}
.flip{display:flex;transform:scaleX(-1)}
.crumb{color:var(--ink2);font-size:13px;margin-block-end:8px;display:flex;gap:6px;align-items:center}
.hd{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-block-end:20px;flex-wrap:wrap}
.hd .t{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.hd h2{font-size:24px;font-weight:600;line-height:36px}
.sec{display:flex;justify-content:space-between;align-items:center;margin-block-end:12px}.sec h3{font-size:18px;font-weight:600;line-height:30px}
.cp{padding:20px}.cp h3{font-size:18px;font-weight:600;line-height:30px;margin-block-end:14px}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}
.facts{display:grid;grid-template-columns:150px 1fr;row-gap:10px}.facts dt{color:var(--ink2)}.facts dd{font-weight:500}
.f{margin-block-end:16px}.f label,.f .lb{display:block;font-weight:500;margin-block-end:6px}.f .req{color:var(--dan)}
.f .in,.f .sel{width:100%}.f .hint{font-size:13px;color:var(--ink2);margin-block-start:4px}
.f .err{font-size:13px;color:var(--dan);margin-block-start:4px;display:flex;gap:4px;align-items:center}
.in.e,.sel.e{border-color:var(--dan);border-width:2px}
.ta{height:84px;align-items:flex-start;padding-block:10px;width:100%}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.form{max-width:720px}
.seg{display:flex;border:1px solid var(--bc);border-radius:8px;overflow:hidden;background:#fff;width:100%}
.seg div{flex:1;height:42px;display:flex;align-items:center;justify-content:center;gap:8px;color:var(--ink2);font-weight:500}
.seg div+div{border-inline-start:1px solid var(--bc)}
.seg .on{background:var(--brand);color:#fff;font-weight:600}
.chk{display:flex;gap:12px;align-items:flex-start;min-height:44px;padding-block:8px;margin-block-end:12px}
.box{width:22px;height:22px;border:2px solid var(--bc);border-radius:4px;background:#fff;flex-shrink:0;display:grid;place-items:center;color:#fff;margin-block-start:1px}
.box.on{background:var(--brand);border-color:var(--brand)}
.sw{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:44px}
.trk{width:46px;height:26px;border-radius:9999px;background:var(--bc);position:relative;flex-shrink:0}
.trk::after{content:"";position:absolute;top:3px;inset-inline-start:3px;width:20px;height:20px;border-radius:50%;background:#fff}
.trk.on{background:var(--ok)}.trk.on::after{inset-inline-start:23px}
.alert{display:flex;gap:10px;align-items:flex-start;border-radius:12px;padding:12px 14px;font-size:14px;margin-block-end:16px;border:1px solid}
.al-d{background:var(--dan-c);border-color:var(--dan-b);color:var(--dan)}.al-w{background:var(--warn-c);border-color:var(--warn-b);color:var(--warn)}.al-n{background:var(--muted-s);border-color:var(--bs);color:var(--ink)}
.alert b{font-weight:600;display:block}.alert .sp{flex:1}
.sk{background:var(--muted-s);border-radius:6px;height:14px}
.hero{padding:32px 24px;text-align:center}
.hero .big{direction:ltr;unicode-bidi:isolate;display:inline-block;font-size:36px;line-height:48px;font-weight:700;background:var(--muted-s);border:1px dashed var(--bc);border-radius:12px;padding:12px 24px;letter-spacing:normal}
.hero h3{font-size:20px;font-weight:600;line-height:30px;margin-block-end:4px}
.state{display:flex;flex-direction:column;align-items:center;text-align:center;padding:48px 24px;gap:8px}
.state h3{font-size:18px;font-weight:600}.state p{color:var(--ink2);max-width:380px}
.state .ico{width:56px;height:56px;border-radius:50%;background:var(--muted-s);display:grid;place-items:center;color:var(--ink2);margin-block-end:4px}
.overlay{position:absolute;inset:0;background:rgba(15,23,42,.5);display:grid;place-items:center;padding:24px}
.dlg{background:#fff;border-radius:24px;padding:24px;box-shadow:0 12px 40px rgba(15,23,42,.25);width:480px;max-width:100%}
.dlg h3{font-size:20px;font-weight:600;line-height:30px;margin-block-end:4px}.dlg>.sub{margin-block-end:14px}
.chg{background:var(--muted-s);border-radius:12px;padding:10px 14px;margin-block-end:14px;display:grid;gap:4px}
.chg div{display:flex;justify-content:space-between;gap:12px}
.dact{display:flex;gap:10px;margin-block-start:8px}
.toast{position:absolute;inset-block-end:16px;inset-inline-start:16px;background:var(--ink);color:#fff;border-radius:12px;padding:10px 16px;display:flex;gap:8px;align-items:center}
/* phone */
.mgrid{display:grid;grid-template-columns:repeat(4,375px);gap:40px 32px;align-items:start}
.mf{width:375px;min-height:812px;background:var(--bg);border:1px solid #94A3B8;border-radius:12px;overflow:hidden;position:relative}
.mf.short{min-height:0}
.mtop{height:56px;background:#fff;border-block-end:1px solid var(--bs);display:flex;align-items:center;gap:8px;padding-inline:8px}
.mtop h1{font-size:18px;font-weight:600;flex:1}
.mic{width:44px;height:44px;display:grid;place-items:center;color:var(--ink);border-radius:8px}
.mc{padding:16px}
.mc .bar{flex-direction:column;align-items:stretch}
.mc .sel,.mc .btn.fw{width:100%;min-width:0}
.vc{padding:14px 16px;border-block-start:1px solid var(--bs);display:grid;gap:8px}
.vc:first-child{border-block-start:0}
.vc .r{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.drawer{position:absolute;inset-block:0;inset-inline-start:0;width:290px;background:#fff;border-inline-end:1px solid var(--bs);display:flex;flex-direction:column;box-shadow:0 12px 40px rgba(15,23,42,.25)}
.mc .facts{grid-template-columns:120px 1fr}
.mc .row2,.sheet .row2{grid-template-columns:1fr}.mc .dt{flex:1}
.mc .cols{grid-template-columns:1fr}
.mc .hd h2{font-size:20px;line-height:30px}
.mc .hero{padding:24px 12px}.mc .hero .big{font-size:22px;line-height:32px;padding:10px 12px}
.sheet{background:#fff;border-radius:24px 24px 0 0;padding:20px;position:absolute;inset-inline:0;inset-block-end:0;box-shadow:0 -8px 40px rgba(15,23,42,.25);max-height:92%;overflow:hidden}
`;
const I = (d, s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ic = {
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  plan: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  dl: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  warn: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>',
  dot: '<circle cx="12" cy="12" r="8"/>',
  layers: '<path d="M12 2l10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
  ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="M13 5v2M13 11v2M13 17v2"/>',
  prov: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  model: '<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 22V12M3 7l9 5 9-5"/>',
  mode: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  tag: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.2"/>',
  set: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  back: '<path d="M9 18l6-6-6-6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  wallet: '<path d="M20 7H5a2 2 0 0 1 0-4h13v4zM3 5v14a2 2 0 0 0 2 2h15V7"/><circle cx="16" cy="14" r="1"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  err: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  stop: '<circle cx="12" cy="12" r="10"/><path d="M4.9 4.9l14.2 14.2"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>',
  wifi: '<path d="M2 8.8a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 20h.01M2 2l20 20"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
};
const $ = (k, s) => I(ic[k], s);
const money = (v, c = '') => `<bdi dir="ltr" class="${c}">${v}</bdi>`;
const ltr = e => `<span class="ltr">${e}</span>`;
const code = c => `<span class="code">${c}</span>`;
const head = t => `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${t}</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet"><style>${css}${css2}</style></head>`;

const navItems = [['dash', 'نظرة عامة'], ['flag', 'الطلبات المُعلَّمة'], ['audit', 'سجل التدقيق'], ['users', 'المستخدمون'], ['plan', 'الباقات'], ['ticket', 'الأكواد'], ['prov', 'المزوّدون'], ['model', 'النماذج'], ['mode', 'الأوضاع'], ['bot', 'المساعدون'], ['tag', 'تحديثات الأسعار'], ['set', 'الإعدادات']];
let ACTIVE = 'bot';
// Sidebar is the FIRST child of the flex row, so it renders on the right in RTL.
const sidebar = () => `<aside><div class="brand"><div class="mono" aria-hidden="true">ل</div><div><b>لمحة AI</b><small>لوحة الإدارة</small></div></div>
<nav aria-label="قائمة الإدارة">${navItems.map(([k, l]) => `<a class="nav${k === ACTIVE ? ' on' : ''}"${k === ACTIVE ? ' aria-current="page"' : ''}>${$(k)}<span>${l}</span></a>`).join('')}</nav>
<div class="foot"><a class="nav"><span class="flip">${$('logout')}</span><span>العودة إلى التطبيق</span></a></div></aside>`;
const shell = (title, body, extra = '', minH = 560) => `<div class="fr"><div class="app" style="min-height:${minH}px">${sidebar()}
<main><header class="top"><h1>${title}</h1><div class="who"><div class="avatar" aria-hidden="true">م</div>${ltr('admin@lam7ai.com')}</div></header>
<div class="content">${body}</div></main></div>${extra}</div>`;
const frame = (tag, note, html) => `<section><div class="tag">${tag}${note ? `<small>${note}</small>` : ''}</div>${html}</section>`;

// =====================================================================
// S23 additions
// =====================================================================
const css2 = `
.code,.hero .big{font-family:'IBM Plex Mono',ui-monospace,monospace}
.tabs{display:flex;gap:8px;border-block-end:1px solid var(--bs);margin-block-end:20px}
.tab{min-height:44px;padding-inline:16px;display:flex;align-items:center;gap:8px;color:var(--ink2);font-weight:500;border-block-end:3px solid transparent;margin-block-end:-1px;white-space:nowrap}
.tab.on{color:var(--ink);font-weight:600;border-block-end-color:var(--brand)}
.mc .tabs .tab{flex:1;justify-content:center;padding-inline:8px}
.prog{display:flex;align-items:center;gap:10px;min-width:150px}
.prog .n{min-width:52px;font-weight:500}
.track{height:8px;border-radius:9999px;background:var(--bs);overflow:hidden;flex:1;min-width:48px}
.fill{height:100%;background:var(--brand);border-radius:9999px}.fill.done{background:var(--ok)}
.stats{display:grid;grid-template-columns:1fr 1fr;gap:32px}
.stat .sv{font-size:24px;font-weight:600;line-height:36px;margin-block:2px 8px}.stat .sv small{font-size:14px;font-weight:400;color:var(--ink2)}
.total{display:flex;align-items:center;justify-content:space-between;gap:16px;background:var(--muted-s);border:1px solid var(--bs);border-radius:12px;padding:14px 16px;margin-block-end:16px}
.total .tv{font-size:24px;font-weight:700;line-height:36px;white-space:nowrap}
.total.bad{background:var(--dan-c);border-color:var(--dan-b)}.total.bad .tv{color:var(--dan)}
.total .sm2{color:var(--dan);font-size:13px;display:flex;gap:4px;align-items:flex-start;margin-block-start:4px}
.ex{margin-block-start:10px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.ex .code{background:var(--muted-s);border:1px dashed var(--bc);border-radius:8px;padding:6px 12px;font-size:16px;font-weight:600}
.grp{font-size:16px;font-weight:600;line-height:26px;margin-block:8px 14px;padding-block-start:18px;border-block-start:1px solid var(--bs)}
.grp.first{border-block-start:0;padding-block-start:0}
.ib{width:44px;height:44px;border-radius:8px;display:grid;place-items:center;color:var(--ink2);flex-shrink:0}
.ib.done{color:var(--ok);width:auto;display:flex;align-items:center;gap:4px;padding-inline:8px;font-weight:500;font-size:13px}
.hint{font-size:13px;color:var(--ink2);margin-block-start:4px}
.al-ok{background:var(--ok-c);border-color:var(--ok-b);color:var(--ok)}
.alert .body{color:var(--ink);font-weight:400}
.alert .body b{color:var(--warn)}
.btn.lg{height:52px;padding-inline:28px;font-size:16px}
.btn.dt{color:var(--dan);border-color:transparent;background:transparent;padding-inline:12px}
.cc{display:flex;align-items:center;gap:4px}
.acts{display:flex;gap:10px;flex-wrap:wrap}
.rowoff td{color:var(--ink2)}
.rowoff .code{color:var(--ink2);text-decoration:line-through;text-decoration-thickness:1px}
.vcc{padding:14px 16px;border-block-start:1px solid var(--bs);display:grid;gap:8px}.vcc:first-child{border-block-start:0}
.mc .stats{grid-template-columns:1fr;gap:20px}
.mc .acts{width:100%}.mc .acts .btn{flex:1}
.mc .total{flex-wrap:wrap}
.mc .btn.lg{width:100%}
.mc .alert{flex-wrap:wrap}
.mc .alert .sp{flex:1 1 220px}
.mc .alert .btn{width:100%}
.sheet .dact .btn{width:100%}
`;
const money2 = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '$';
const qtyWord = n => (n >= 3 && n <= 10 ? `${n} أكواد` : `${n} كودًا`);
const bdiN = v => `<bdi dir="ltr">${v}</bdi>`;

// ---------- statuses ----------
const bst = {
  active: ['b-ok', 'check', 'فعّال'], off: ['b-n', 'stop', 'متوقف'], ended: ['b-warn', 'clock', 'منتهي'],
  soon: ['b-pro', 'cal', 'لم يبدأ'], used: ['b-warn', 'err', 'مستنفد'],
};
const bBadge = k => `<span class="badge ${bst[k][0]}">${$(bst[k][1], 14)}${bst[k][2]}</span>`;
const kBadge = k => k === 'b'
  ? `<span class="badge b-n">${$('wallet', 14)}رصيد</span>`
  : `<span class="badge b-pro">${$('clock', 14)}تجربة</span>`;
const cst = { used: ['b-pro', 'check', 'مستخدم'], unused: ['b-ok', 'dot', 'غير مستخدم'], off: ['b-n', 'stop', 'متوقف'] };
const cBadge = k => `<span class="badge ${cst[k][0]}">${$(cst[k][1], 14)}${cst[k][2]}</span>`;

// ---------- shared form/dialog bits (same patterns as S22) ----------
const reasonF = err => `<div class="f"><label>السبب <span class="req">*</span></label><div class="in ta ${err ? 'e' : ''}"><span class="ph">يُسجَّل في سجل التدقيق</span></div>${err ? `<div class="err">${$('err', 16)}السبب مطلوب</div>` : ''}</div>`;
const field = (lbl, inner, { hint, err, req } = {}) => `<div class="f"><label>${lbl}${req ? ' <span class="req">*</span>' : ''}</label>${inner}${err ? `<div class="err">${$('err', 16)}${err}</div>` : ''}${hint && !err ? `<div class="hint">${hint}</div>` : ''}</div>`;
const inp = (v, { e, ltr: l, ph, trail } = {}) => `<div class="in ${e ? 'e' : ''}"${l ? ' style="direction:ltr"' : ''}><span class="${ph ? 'ph' : ''}">${v}</span>${trail ? `<span class="ph" style="margin-inline-start:auto">${trail}</span>` : ''}</div>`;
const dtf = (v, ph) => `<div class="in" style="direction:ltr"><span class="${ph ? 'ph' : ''}">${v}</span></div>`;
const chk = (on, t, h) => `<div class="chk" role="checkbox" aria-checked="${on}"><span class="box ${on ? 'on' : ''}">${on ? $('check', 14) : ''}</span><div><div style="font-weight:500">${t}</div><div class="sub">${h}</div></div></div>`;
const segF = k => `<div class="f"><span class="lb">نوع الكود <span class="req">*</span></span><div class="seg" role="radiogroup" aria-label="نوع الكود"><div role="radio" aria-checked="${k === 'b'}" class="${k === 'b' ? 'on' : ''}">${$('wallet', 18)}رصيد</div><div role="radio" aria-checked="${k === 't'}" class="${k === 't' ? 'on' : ''}">${$('clock', 18)}تجربة</div></div>
<div class="hint">${k === 'b' ? 'يضيف مبلغًا إلى رصيد المستخدم، ويحتاج باقة نشطة.' : 'يبدأ باقة لعدد من الأيام ويضيف رصيدها المضمَّن.'}</div></div>`;
const dlg = (title, sub, body, actions) => `<div class="overlay"><div class="dlg" role="dialog" aria-modal="true"><h3>${title}</h3>${sub ? `<p class="sub" style="margin-block-end:14px">${sub}</p>` : ''}${body}<div class="dact">${actions}</div></div></div>`;
const sheet = (title, sub, body, actions) => `<div class="overlay" style="display:block;padding:0"><div class="sheet" role="dialog" aria-modal="true"><h3 style="font-size:20px;font-weight:600;line-height:30px;margin-block-end:4px">${title}</h3>${sub ? `<p class="sub" style="margin-block-end:14px">${sub}</p>` : ''}${body}<div class="dact" style="flex-direction:column">${actions}</div></div></div>`;
const shell2 = (title, body, { extra = '', minH = 560, clip } = {}) => `<div class="fr"${clip ? ` style="max-height:${clip}px"` : ''}><div class="app" style="min-height:${minH}px">${sidebar()}
<main><header class="top"><h1>${title}</h1><div class="who"><div class="avatar" aria-hidden="true">م</div>${ltr('admin@lam7ai.com')}</div></header>
<div class="content">${body}</div></main></div>${extra}</div>`;
const frame2 = (tag, note, html) => `<section><div class="tag">${tag}${note ? `<small>${note}</small>` : ''}</div>${html}</section>`;

// =====================================================================
// S26 additions: agents list + edit dialog
// =====================================================================
const css3 = `
.chip{display:inline-flex;align-items:center;border:1px solid var(--bs);background:var(--muted-s);color:var(--ink);border-radius:9999px;padding:1px 10px;font-size:13px;font-weight:500;line-height:20px;white-space:nowrap}
.chip.more{color:var(--ink2);background:#fff}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.none{display:inline-flex;align-items:center;gap:4px;color:var(--ink2);font-size:13px}
.none.w{color:var(--warn);font-weight:500}
.en{direction:ltr;unicode-bidi:isolate;display:block;text-align:start;color:var(--ink2);font-size:13px}
.key{direction:ltr;unicode-bidi:isolate;display:inline-block;font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:13px;color:var(--ink2);letter-spacing:normal}
.dlg.w{width:620px}
.swb{display:flex;align-items:center;justify-content:space-between;gap:16px;background:var(--muted-s);border:1px solid var(--bs);border-radius:12px;padding:12px 16px;margin-block-end:16px}
.plbox{border:1px solid var(--bc);border-radius:12px;background:#fff;overflow:hidden}
.plr{display:flex;align-items:center;gap:12px;min-height:48px;padding:6px 14px;border-block-start:1px solid var(--bs)}
.plr:first-child{border-block-start:0}
.plr .nm{font-weight:500;flex:1}
.plbox.e{border-color:var(--dan);border-width:2px}
.in.ltrf{direction:ltr}
.dlg .hd2{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-block-end:16px}
.dlg .hd2 h3{margin:0}
.x{width:44px;height:44px;border-radius:8px;display:grid;place-items:center;color:var(--ink2);margin:-8px;flex-shrink:0}
.dlg .dact{border-block-start:1px solid var(--bs);padding-block-start:16px;margin-block-start:8px}
.nm1{font-weight:600;font-size:15px}
.ac{display:flex;flex-direction:column;gap:2px}
.sheet{display:flex;flex-direction:column;height:92%;padding:0}
.sheet .sh{padding:12px 20px;display:flex;justify-content:space-between;align-items:flex-start;gap:8px;border-block-end:1px solid var(--bs)}
.sheet .sb{flex:1;overflow:hidden;padding:16px 20px 0;position:relative}
.sheet .sf{padding:12px 20px 20px;border-block-start:1px solid var(--bs);display:flex;flex-direction:column;gap:10px;background:#fff}
.sheet .sf .btn{width:100%}
.grab{width:40px;height:4px;border-radius:9999px;background:var(--bc);margin:8px auto 0}
.scrim{position:absolute;inset:0;background:rgba(15,23,42,.5)}
.mc .row2,.sheet .row2{grid-template-columns:1fr}
`;
const head3 = t => head(t).replace('</style>', css3 + '</style>');

const PL = [['d', 'الافتراضية'], ['b', 'أساسي'], ['p', 'احترافي'], ['e', 'أعمال', true]];
const stBadge = on => on
  ? `<span class="badge b-ok">${$('check', 14)}مفعّل</span>`
  : `<span class="badge b-n">${$('stop', 14)}متوقف</span>`;
const readyBadge = r => r
  ? `<span class="badge b-pro">${$('check', 14)}جاهز</span>`
  : `<span class="badge b-warn">${$('warn', 14)}غير جاهز</span>`;
const keyLtr = k => `<span class="key">${k}</span>`;
const dateB = d => `<bdi dir="ltr">${d}</bdi>`;
// plan chips: first 3 then «+N»
const chipsOf = (names, on) => names.length === 0
  ? `<span class="none${on ? ' w' : ''}">${on ? $('warn', 14) : ''}لا باقات${on ? ' · لا يراه أحد' : ''}</span>`
  : `<div class="chips">${names.slice(0, 3).map(n => `<span class="chip">${n}</span>`).join('')}${names.length > 3 ? `<span class="chip more" aria-label="و${names.length - 3} باقة أخرى">+${names.length - 3}</span>` : ''}</div>`;

const AG = { key: 'graphic_designer', ar: 'مصمم جرافيك', en: 'Graphic designer', order: 10 };
const agRow = (a, o) => ({ ...a, ...o });
const M_NONE = { p: null, i: null, c: null };
const M_OK = { p: 'GPT-4.1 mini', i: 'GPT Image 1', c: 'GPT-4o mini' };
const M_NOCHECK = { p: 'GPT-4.1 mini', i: 'GPT Image 1', c: null };
const MODELS = { none: M_NONE, ready: M_OK, noCheck: M_NOCHECK };
const rowOff = agRow(AG, { on: false, plans: [], upd: '2026-11-08 14:32', ready: false });
const rowOn = agRow(AG, { on: true, plans: ['الافتراضية', 'أساسي', 'احترافي', 'أعمال'], upd: '2026-11-10 09:15', ready: true });
const rowOnNR = agRow(AG, { on: true, plans: ['أساسي', 'احترافي'], upd: '2026-11-10 09:15', ready: false });
const rowOnNone = agRow(AG, { on: true, plans: [], upd: '2026-11-10 09:15', ready: true });
const rowSaved = agRow(AG, { on: true, plans: ['أساسي', 'احترافي'], upd: '2026-11-10 09:15', ready: true });

const aHead = '<tr><th>المساعد</th><th>المفتاح</th><th>الحالة والجاهزية</th><th>الباقات</th><th>الترتيب</th><th>آخر تحديث</th><th></th></tr>';
const editBtn = (a, full) => `<a class="btn sm"${full ? ' style="width:100%"' : ''} aria-label="تعديل ${a.ar}">${$('edit', 18)}تعديل</a>`;
const aRow = a => `<tr><td><div class="ac"><a class="lnk nm1">${a.ar}</a><span class="en" lang="en">${a.en}</span></div></td><td>${keyLtr(a.key)}</td><td><div style="display:flex;flex-direction:column;align-items:flex-start;gap:4px">${stBadge(a.on)}${readyBadge(a.ready)}</div></td><td style="max-width:300px">${chipsOf(a.plans, a.on)}</td><td>${bdiN(a.order)}</td><td class="sub">${dateB(a.upd)}</td><td style="text-align:end">${editBtn(a)}</td></tr>`;
const aTable = rows => `<div class="card tw"><table aria-label="قائمة المساعدين"><thead>${aHead}</thead><tbody>${rows.map(aRow).join('')}</tbody></table></div>`;
const INTRO = 'يظهر المساعد للمستخدمين عندما يكون مفعّلًا وفي باقتهم فقط. المساعد المتوقف مخفي عن الجميع.';
const aIntro = `<div class="hd" style="margin-block-end:4px"><div class="t"><h2>المساعدون</h2></div></div><p class="sub" style="margin-block-end:16px;font-size:14px">${INTRO}</p>`;
const aSk = Array.from({ length: 2 }, () => `<tr><td><div class="sk" style="width:130px"></div><div class="sk" style="width:90px;margin-block-start:6px"></div></td><td><div class="sk" style="width:120px"></div></td><td><div class="sk" style="width:64px;height:22px;border-radius:9999px"></div></td><td><div class="sk" style="width:180px;height:22px;border-radius:9999px"></div></td><td><div class="sk" style="width:30px"></div></td><td><div class="sk" style="width:110px"></div></td><td></td></tr>`).join('');
const aLoading = `<div class="card tw" role="status" aria-busy="true" aria-label="جارٍ التحميل"><table><thead>${aHead}</thead><tbody>${aSk}</tbody></table></div>`;
const aEmpty = `<div class="card state"><div class="ico">${$('bot', 26)}</div><h3>لا توجد مساعدون بعد</h3><p>لم يُضَف أي مساعد إلى النظام حتى الآن.</p></div>`;
const aError = `<div class="card state"><div class="ico" style="background:var(--dan-c);color:var(--dan)">${$('wifi', 26)}</div><h3>تعذّر تحميل المساعدين</h3><p>تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى.</p><a class="btn" style="margin-block-start:8px">${$('refresh', 18)}إعادة المحاولة</a></div>`;
const toastSaved = `<div class="toast" role="status">${$('check', 18)}تم حفظ التغييرات</div>`;

// ---------- edit dialog form ----------
const SW_HELP_OFF = 'متوقف: المساعد مخفي عن كل المستخدمين حتى لو اخترت باقات.';
const SW_HELP_ON = 'مفعّل: يظهر للمستخدمين في الباقات المختارة أدناه فقط.';
const swRow = on => `<div class="swb"><div><div style="font-weight:600" id="sw-l">${on ? 'مفعّل للمستخدمين' : 'متوقف عن المستخدمين'}</div><div class="sub" id="sw-h">${on ? SW_HELP_ON : SW_HELP_OFF}</div></div><span class="trk${on ? ' on' : ''}" role="switch" aria-checked="${on}" aria-labelledby="sw-l" aria-describedby="sw-h"></span></div>`;
const noPlansWarn = `<div class="alert al-w" role="alert" style="margin-block-end:12px">${$('warn')}<div class="sp body"><b>لا باقات مختارة</b>المساعد مفعّل لكن لا يراه أحد. اختر باقة واحدة على الأقل ليظهر للمستخدمين.</div></div>`;
const plRows = sel => PL.map(([k, n, off]) => `<div class="plr" role="checkbox" aria-checked="${sel.includes(k)}"><span class="box ${sel.includes(k) ? 'on' : ''}">${sel.includes(k) ? $('check', 14) : ''}</span><span class="nm">${n}</span>${off ? `<span class="badge b-n">${$('stop', 14)}غير نشطة</span>` : ''}</div>`).join('');
const plSk = Array.from({ length: 4 }, () => `<div class="plr"><div class="sk" style="width:22px;height:22px;border-radius:4px"></div><div class="sk" style="width:120px"></div></div>`).join('');
const plErr = `<div class="alert al-d" role="alert" style="margin:0">${$('err')}<div class="sp"><b>تعذّر تحميل الباقات</b>لن تتغير باقات المساعد عند الحفظ. أعد المحاولة لتعديلها.</div><a class="btn sm" style="background:#fff">${$('refresh', 18)}إعادة المحاولة</a></div>`;
const notReadyWarn = `<div class="alert al-w" role="alert" style="margin-block-end:12px">${$('warn')}<div class="sp body"><b>المساعد غير جاهز</b>لا يمكن تسعير التصميم بعد، فأكمل قسم «النماذج والتكلفة» أدناه قبل تفعيله للمستخدمين. يمكنك تفعيله الآن وإكماله لاحقًا.</div></div>`;
const mSel = (lbl, v, hint, err) => field(lbl, `<div class="sel${err ? ' e' : ''}" role="combobox" aria-label="${lbl}"><span class="${v ? '' : 'ph'}">${v ? `<bdi dir="ltr">${v}</bdi>` : 'اختر نموذجًا'}</span>${$('down', 18)}</div>`, { req: true, hint, err });
const modelsBlock = (o) => {
  const m = MODELS[o.models || 'ready'];
  const miss = [['النموذج الكاتب للوصف', m.p], ['نموذج إنشاء الصور', m.i], ['نموذج فحص الصور', m.c]].filter(x => !x[1]).map(x => x[0]);
  const e = o.errs || {};
  const status = miss.length === 0
    ? `<div class="alert al-ok" role="status" style="margin-block-end:16px">${$('check')}<div class="sp body"><b style="color:var(--ok)">المساعد جاهز</b>النماذج الثلاثة محددة. يعمل التسعير عندما تكون النماذج مفعّلة ولها أسعار في صفحة النماذج.</div></div>`
    : `<div class="alert al-w" role="status" style="margin-block-end:16px">${$('warn')}<div class="sp body"><b>المساعد غير جاهز</b>ينقصه: ${miss.join('، ')}. تحتاج أيضًا نماذج مفعّلة ولها أسعار في صفحة النماذج حتى يعمل التسعير.</div></div>`;
  const mg = field('هامش الربح (%)', `<div class="in${e.margin ? ' e' : ''}" style="direction:ltr;max-width:200px"><span class="${e.margin ? '' : 'ph'}">${e.margin ? '650' : 'الافتراضي'}</span><span class="ph" style="margin-inline-start:auto">%</span></div>`, { hint: 'من 0 إلى 500. اتركه فارغًا لاستخدام هامش كل نموذج. عند تحديده يحلّ محل هوامش النماذج.', err: e.margin });
  const seg = `<div class="f"><span class="lb">عدد التصاميم في كل طلب</span><div class="seg" role="radiogroup" aria-label="عدد التصاميم" style="max-width:240px">${[1, 2, 3].map(n => `<div role="radio" aria-checked="${n === 2}" class="${n === 2 ? 'on' : ''}">${n}</div>`).join('')}</div><div class="hint">من 1 إلى 3. الافتراضي 2. كل تصميم يُحسب من الاستخدام الفعلي.</div></div>`;
  return `<div class="grp">النماذج والتكلفة</div>${status}
${mSel('نموذج كتابة الوصف', m.p, 'نماذج النصوص فقط.', o.noModelErr && !m.p ? 'لم يُحدَّد نموذج' : '')}
${mSel('نموذج إنشاء الصور', m.i, 'النماذج التي تنشئ الصور فقط.', '')}
${mSel('نموذج فحص الصور', m.c, 'النماذج التي تقرأ الصور ولا تنشئها.', o.noModelErr && !m.c ? 'لم يُحدَّد نموذج' : '')}
${seg}${mg}`;
};
const plansBlock = (o, on) => {
  const sel = o.sel || [];
  const warn = on && sel.length === 0 && !o.plansState ? noPlansWarn : '';
  let box;
  if (o.plansState === 'loading') box = `<div class="plbox" role="status" aria-busy="true" aria-label="جارٍ تحميل الباقات">${plSk}</div>`;
  else if (o.plansState === 'error') box = plErr;
  else box = `<div class="plbox" role="group" aria-label="الباقات">${plRows(sel)}</div>`;
  return `<div class="grp">الباقات</div>${warn}<div class="f"><span class="lb">الباقات التي تقدّم هذا المساعد</span>${box}${o.plansState === 'error' ? '' : '<div class="hint">لن يرى المستخدمون في الباقات الأخرى هذا المساعد.</div>'}</div>`;
};
const alertBox = a => ({
  agent: `<div class="alert al-d" role="alert">${$('err')}<div class="sp"><b>لم يتم العثور على هذا المساعد.</b>قد يكون أُزيل من النظام. أغلق النافذة وحدّث القائمة.</div><a class="btn sm" style="background:#fff">${$('refresh', 18)}تحديث القائمة</a></div>`,
  plan: `<div class="alert al-d" role="alert">${$('err')}<div class="sp"><b>لم يتم العثور على الباقة.</b>إحدى الباقات المختارة لم تعد موجودة. حُدِّثت قائمة الباقات أدناه. راجع اختيارك ثم احفظ مرة أخرى. لم يُحفظ أي تغيير.</div></div>`,
  fail: `<div class="alert al-d" role="alert">${$('err')}<div class="sp"><b>تعذّر تنفيذ الإجراء</b>لم يُحفظ أي تغيير. حاول مرة أخرى.</div></div>`,
}[a] || '');
const ENDESC = 'Asks you step by step about your brand and what you want designed, then saves the design request.';
const ARDESC = 'يسألك خطوة بخطوة عن علامتك وما تريد تصميمه، ثم يحفظ طلب التصميم.';
const agentFields = o => {
  const on = !!o.on;
  const e = o.errs || {};
  const nameF = (lbl, v, en, err) => field(lbl, `<div class="in${err ? ' e' : ''}${en ? ' ltrf' : ''}"><span class="${v ? '' : 'ph'}">${v || (en ? 'English name' : 'الاسم بالعربية')}</span></div>`, { req: true, err });
  const desc = (lbl, v, en) => field(lbl, `<div class="in ta${en ? ' ltrf' : ''}" style="height:96px"><span>${v}</span></div>`);
  return `${alertBox(o.alert)}
<div class="grp first">الظهور</div>
${swRow(on)}${on && (o.models || 'ready') !== 'ready' ? notReadyWarn : ''}
<div class="grp">الاسم والوصف</div>
<div class="row2">${nameF('الاسم بالعربية', e.ar ? '' : AG.ar, false, e.ar)}${nameF('الاسم بالإنجليزية', AG.en, true)}</div>
<div class="row2">${desc('الوصف بالعربية', ARDESC, false)}${desc('الوصف بالإنجليزية', ENDESC, true)}</div>
${field('الترتيب', `<div class="in${e.order ? ' e' : ''}" style="direction:ltr;max-width:160px"><span>${e.order ? '1200' : AG.order}</span></div>`, { req: true, hint: 'من 0 إلى 1000. يظهر الأصغر أولًا.', err: e.order })}
${plansBlock(o, on)}
${modelsBlock(o)}${advBlock(o)}
<div class="grp">التأكيد</div>
${reasonF(!!e.reason)}`;
};
const dlgActions = o => `<a class="btn p${o.busy ? ' off' : ''}"${o.busy ? ' aria-disabled="true" aria-busy="true"' : ''}>${o.busy ? 'جارٍ الحفظ…' : 'حفظ التغييرات'}</a><a class="btn">إلغاء</a>`;
const dlgHeader = `<div class="hd2"><div><h3 id="dlg-t">تعديل المساعد</h3><p class="sub" style="margin:0">${AG.ar} · ${keyLtr(AG.key)}</p></div><span class="x" role="button" aria-label="إغلاق">${$('x', 20)}</span></div>`;
const agentDlg = o => `<div class="overlay" style="align-items:start"><div class="dlg w" role="dialog" aria-modal="true" aria-labelledby="dlg-t">${dlgHeader}${agentFields(o)}<div class="dact">${dlgActions(o)}</div></div></div>`;
const listBg = rows => aIntro + aTable(rows);
const D = (tag, note, rows, o, minH = 1200) => frame2(tag, note, shell2('المساعدون', listBg(rows), { minH, extra: o ? agentDlg(o) : '' }));


// =====================================================================
// S29 additions
// =====================================================================
Object.assign(ic, {
  dash: '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
  flag: '<path d="M4 22V4M4 4h12l-2 4 2 4H4"/>',
  audit: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>',
  pen: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/>',
  undo: '<path d="M3 7v6h6M3 13a9 9 0 1 0 3-7.7L3 8"/>',
  filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  palette: '<path d="M12 22a10 10 0 1 1 10-10c0 3-2 4-4 4h-2a2 2 0 0 0-1 3.7c.7.5.5 2.3-3 2.3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="12" cy="7" r="1"/><circle cx="16.5" cy="11" r="1"/>',
  up: '<path d="M18 15l-6-6-6 6"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
});

const css4 = `
body{background:#CBD5E1}
.fr.g{display:grid}.fr.g>.app,.fr.g>.overlay{grid-area:1/1}.fr.g>.overlay{position:relative;inset:auto;align-items:start}
.kpi{padding:14px 18px}.kpi .l{color:var(--ink2);font-size:13px;display:flex;align-items:center;gap:6px}.kpi .v{font-size:24px;font-weight:700;line-height:36px}.kpi .h{color:var(--ink2);font-size:13px;line-height:20px}
.negd{color:var(--dan);font-weight:600}
.blk{padding:18px 20px}
.blk .bh{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-block-end:14px;flex-wrap:wrap}
.blk .bh h3{font-size:18px;font-weight:600;line-height:28px;display:flex;align-items:center;gap:8px}
.blk .bh .hs{color:var(--ink2);font-size:13px;font-weight:400}
.sg{display:grid;gap:14px 16px}.sg.c3{grid-template-columns:repeat(3,1fr)}.sg.c4{grid-template-columns:repeat(4,1fr)}.sg.c2{grid-template-columns:1fr 1fr}
.sg+.sg{margin-block-start:16px;padding-block-start:16px;border-block-start:1px solid var(--bs)}
.st .sl{color:var(--ink2);font-size:13px;line-height:20px;display:flex;align-items:center;gap:4px}
.st .sv{font-size:22px;font-weight:700;line-height:32px;white-space:nowrap}
.st.w .sl,.st.w .sv{color:var(--warn)}
.st.d .sl,.st.d .sv{color:var(--dan)}
.two2{display:grid;grid-template-columns:5fr 7fr;gap:20px;align-items:stretch;margin-block-end:20px}
.pk{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-block-end:16px}
.pk .seg{width:auto}.pk .seg div{padding-inline:16px;flex:none}
.rng{display:flex;gap:6px;align-items:center;color:var(--ink2);font-size:13px}
.hh{font-size:16px;font-weight:600;display:flex;gap:8px;align-items:center;margin-block-end:10px}
.att{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-block-end:20px}
.al2{display:flex;gap:12px;align-items:center;background:#fff;border:1px solid var(--bs);border-radius:16px;padding:14px 16px}
.al2 .ico{width:44px;height:44px;border-radius:12px;background:var(--muted-s);color:var(--ink2);display:grid;place-items:center;flex-shrink:0}
.al2.w{border-color:var(--warn-b);background:var(--warn-c)}.al2.w .ico{background:#fff;color:var(--warn)}
.al2 .cnt{font-size:26px;font-weight:700;line-height:36px;min-width:30px;text-align:center}.al2.w .cnt{color:var(--warn)}
.al2 .tx{flex:1;min-width:0;display:flex;flex-direction:column}.al2 .tx b{font-weight:600}.al2 .tx span{color:var(--ink2);font-size:13px;line-height:20px}
.al2{flex-wrap:wrap}.al2 .go{flex-basis:100%;min-height:36px;display:flex;align-items:center;gap:6px;color:var(--pro);font-weight:600;font-size:13px;white-space:nowrap;text-decoration:underline;text-underline-offset:3px;min-height:44px}
.al2.new{outline:0}
.dn{border:1.5px dashed var(--pro);background:var(--pro-c);color:var(--pro);border-radius:12px;padding:10px 14px;font-size:13px;line-height:20px}
.ff2{display:grid;grid-template-columns:1.4fr 1fr auto;gap:12px;align-items:end}
.fcard{padding:16px 18px;margin-block-end:16px}
.fcard .f{margin:0}.fcard .f label{font-size:13px;color:var(--ink2);font-weight:500}
.in .clr{margin-inline-start:auto;display:grid;place-items:center;width:32px;height:32px;color:var(--ink2)}
.fsub{display:flex;gap:10px;align-items:center;margin-block-start:12px;flex-wrap:wrap}
.dense th{padding:10px 12px;font-size:13px}.dense td{padding:10px 12px;font-size:13.5px}
.num{white-space:nowrap}
.tr-e{text-align:end}
.lk2{color:var(--pro);font-weight:600;text-decoration:underline;text-underline-offset:3px}
.rowfl td{background:var(--warn-c)}
.cardhd{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;gap:12px;border-block-end:1px solid var(--bs)}
.cardhd h3{font-size:17px;font-weight:600;line-height:28px}
.info{display:flex;gap:10px;align-items:flex-start;background:#fff;border:1px solid var(--bs);border-radius:12px;padding:12px 14px;color:var(--ink2);margin-block-end:16px}
.info b{color:var(--ink);font-weight:600}
.hdr2{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
.fx{display:grid;grid-template-columns:repeat(2,1fr);gap:0 40px}
.fx .fr2{display:grid;grid-template-columns:130px 1fr;gap:8px;padding-block:10px;border-block-end:1px solid var(--bs);align-items:center}
.fx .fr2 dt{color:var(--ink2);font-size:13px}.fx .fr2 dd{font-weight:500;min-width:0;overflow-wrap:anywhere}
.mstrip{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-block-end:20px}
.mstrip .kpi{padding:12px 16px}.mstrip .kpi .v{font-size:22px;line-height:32px}
.tl{width:100%}
.kd{display:flex;align-items:center;gap:10px}
.kic{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;flex-shrink:0}
.k-prompt{background:var(--pro-c);color:var(--pro)}.k-image{background:#F0FDFA;color:#0F766E}.k-check{background:#F0F9FF;color:#0369A1}
.kd b{font-weight:600;display:block;line-height:20px}.kd span.s{color:var(--ink2);font-size:12.5px;line-height:18px;display:block}
.mdl{display:flex;flex-direction:column;line-height:20px}.mdl .pv{color:var(--ink2);font-size:12.5px;direction:ltr;unicode-bidi:isolate;text-align:start}
.mdl bdi{font-weight:500}
.tok{font-size:13px;line-height:20px;color:var(--ink)}.tok div{white-space:nowrap}.tok span{color:var(--ink2)}
.ecode{direction:ltr;unicode-bidi:isolate;display:inline-block;font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:12.5px;background:var(--dan-c);border:1px solid var(--dan-b);color:var(--dan);border-radius:6px;padding:0 8px;line-height:22px;letter-spacing:normal}
.etx{color:var(--dan);font-size:13px;line-height:20px;margin-block-start:2px}
.rowfail td{background:var(--dan-c)}
.rowrun td{background:var(--pro-c)}
.totr td{background:var(--muted-s);font-weight:600;border-block-start:1px solid var(--bc)}
.regen{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;color:var(--warn);font-weight:500}
.bn{display:flex;gap:6px;align-items:center;margin-block-start:2px;color:var(--ink2);font-size:12.5px}
/* advanced instructions */
.accb{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:8px 14px;background:var(--muted-s);border:1px solid var(--bs);border-radius:12px;text-align:start}
.accb.open{border-end-start-radius:0;border-end-end-radius:0;border-block-end-color:transparent;background:#fff;border-color:var(--bc)}
.accb .tx{flex:1;min-width:0}.accb .tx b{display:block;font-weight:600}.accb .tx span{display:block;color:var(--ink2);font-size:13px;line-height:20px}
.accp{border:1px solid var(--bc);border-block-start:0;border-end-start-radius:12px;border-end-end-radius:12px;padding:16px 14px 4px;background:#fff;margin-block-end:16px}
.ta2{border:1px solid var(--bc);border-radius:8px;background:#fff;padding:10px 12px;min-height:132px;font-size:14px;line-height:24px;text-align:start;unicode-bidi:plaintext}
.ta2.ph{color:var(--ink2)}.ta2.e{border-color:var(--dan);border-width:2px}
.ta2.pend{background:var(--muted-s);border-style:dashed;color:var(--ink2);display:flex;align-items:center;gap:8px;min-height:84px}
.tafoot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-block-start:6px;flex-wrap:wrap}
.cnt2{font-size:13px;color:var(--ink2)}.cnt2.bad{color:var(--dan);font-weight:600}
.rst{min-height:44px;padding-inline:10px;display:inline-flex;align-items:center;gap:6px;color:var(--pro);font-weight:600;font-size:14px;border-radius:8px}
.rst.dis{color:#64748B;font-weight:500}
.cust{display:inline-flex;align-items:center;gap:4px}
.mc .kpi .v{font-size:22px;line-height:32px}
.mc .sg.c3,.mc .sg.c4{grid-template-columns:1fr 1fr}
.mc .att{grid-template-columns:1fr}
.mc .two2{grid-template-columns:1fr}
.mc .pk{gap:10px}.mc .pk .seg{width:100%}.mc .pk .seg div{padding-inline:4px;font-size:13px}
.mc .fx{grid-template-columns:1fr}
.mc .fx .fr2{grid-template-columns:110px 1fr}
.mc .mstrip{grid-template-columns:1fr 1fr;gap:10px}
.mc .ff2{grid-template-columns:1fr}
.mc .al2{flex-wrap:wrap}
.rc{padding:14px 16px;border-block-start:1px solid var(--bs);display:grid;gap:8px}.rc:first-child{border-block-start:0}
.rc .r{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.rc .m3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.rc .m3 .l{display:block;color:var(--ink2);font-size:12.5px;line-height:18px}.rc .m3 .v{font-weight:600;font-size:14px}
.rc.fl{background:var(--warn-c)}.rc.fail{background:var(--dan-c)}.rc.run{background:var(--pro-c)}
.sc{padding:12px 14px;border-block-start:1px solid var(--bs);display:grid;gap:8px}.sc:first-child{border-block-start:0}
.sc .m3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.sc .m3 .l{display:block;color:var(--ink2);font-size:12.5px;line-height:18px}.sc .m3 .v{font-weight:600;font-size:14px}
.sc.fail{background:var(--dan-c)}.sc.run{background:var(--pro-c)}
`;
const head4 = t => head(t).replace('</style>', css3 + css4 + '</style>');

// ---------- helpers ----------
const num4 = n => `<bdi dir="ltr">${n}</bdi>`;
const nf = n => num4(n.toLocaleString('en-US'));
const m2 = v => money(v + '$', 'num');
const mneg2 = v => `<bdi dir="ltr" class="negd num">−${v}$</bdi>`;
// Run and step amounts use the "cost" format: 4 decimals below 1$, 2 from 1$ up (same as <Money kind="cost">)
const fmtC = t => { const v = t / 10000; return (v >= 1 ? v.toFixed(2) : v.toFixed(4)) + '$'; };
const mc = t => (t === null ? '<span aria-label="لا يوجد">—</span>' : money(fmtC(t), 'num'));
const mcNeg = t => (t < 0 ? `<bdi dir="ltr" class="negd num">−${fmtC(-t)}</bdi>` : mc(t));
const L2 = s => `<span class="ltr">${s}</span>`;
const em = e => `<bdi dir="ltr">${e}</bdi>`;
const crumb = (...p) => `<div class="crumb">${p.map((x, i) => (i ? `<span class="flip">${$('back', 14)}</span>` : '') + `<span>${x}</span>`).join('')}</div>`;
const note = t => `<div class="dn" role="note">${t}</div>`;
const stat = (l, v, cls = '', icon = '') => `<div class="st ${cls}"><div class="sl">${icon}${l}</div><div class="sv">${v}</div></div>`;

// ---------- statuses (API: reserved, settled, released, reconciliation_required) ----------
const RS = {
  reserved: ['b-pro', 'clock', 'جارٍ'],
  settled: ['b-ok', 'check', 'تمّ'],
  released: ['b-dan', 'err', 'فشل'],
  reconciliation_required: ['b-warn', 'flag', 'تحتاج مراجعة'],
};
const rBadge = k => `<span class="badge ${RS[k][0]}">${$(RS[k][1], 14)}${RS[k][2]}</span>`;
const SS = { started: ['b-pro', 'clock', 'جارٍ'], done: ['b-ok', 'check', 'تمّ'], failed: ['b-dan', 'err', 'فشل'] };
const sBadge = k => `<span class="badge ${SS[k][0]}">${$(SS[k][1], 14)}${SS[k][2]}</span>`;
const KIND = { prompt: ['k-prompt', 'pen', 'كتابة الوصف'], image: ['k-image', 'image', 'إنشاء الصورة'], check: ['k-check', 'scan', 'فحص الصورة'] };

// ---------- shell (ACTIVE decides the highlighted nav item) ----------
const sh2 = (active, title, body, o = {}) => { ACTIVE = active; return shell2(title, body, o); };
const mtop = t => `<header class="mtop"><button class="mic" aria-label="فتح القائمة" style="border:0;background:none">${$('menu', 24)}</button><h1>${t}</h1></header>`;
const SLICE = {};
const sliceAt = (html, g) => { const i = html.indexOf('<div class="grp">' + SLICE[g] + '</div>'); return html.slice(i).replace('<div class="grp">', '<div class="grp first">'); };
const mf = (tag, inner, extra = '', h = 812) => `<section><div class="tag">${tag}</div><div class="mf" style="${h > 812 ? 'min-height:812px' : 'height:812px'}">${inner}${extra}</div></section>`;
const mcont = b => `<div class="mc">${b}</div>`;

// ============ 1. overview ============
const picker = `<div class="pk"><div class="seg" role="radiogroup" aria-label="الفترة" style="max-width:560px">${[['7', 'آخر 7 أيام'], ['30', 'آخر 30 يومًا'], ['90', 'آخر 90 يومًا'], ['c', 'فترة مخصصة']].map(([k, l]) => `<div role="radio" aria-checked="${k === '30'}" class="${k === '30' ? 'on' : ''}">${l}</div>`).join('')}</div><div class="rng">${$('cal', 18)}<span>من 13 أكتوبر إلى 11 نوفمبر 2026 · 30 يومًا</span></div></div>`;
const attItem = (icon, count, title, sub, link, zero) => `<a class="al2${count > 0 ? ' w' : ''}"><span class="ico">${$(icon, 22)}</span><span class="cnt num" aria-hidden="true">${count}</span><span class="tx"><b>${title}</b><span>${count === 0 ? zero : sub}</span></span>${count > 0 ? `<span class="go">${link}<span class="flip">${$('arrow', 18)}</span></span>` : ''}</a>`;
const attention = (rev = 3) => `<section aria-label="تحتاج إلى انتباه"><div class="hh">${$('warn', 20)}تحتاج إلى انتباه</div><div class="att">
${attItem('flag', 4, 'طلبات مُعلَّمة', 'محسوبة من تقدير أو تحمّلنا جزءًا من تكلفتها.', 'عرض الطلبات', '')}
${attItem('palette', rev, 'تشغيلات تصميم للمراجعة', 'تحتاج مطابقة تكلفة خطواتها مع المزوّد. العدد الحالي لكل الفترات.', 'عرض التشغيلات', 'لا توجد تشغيلات تصميم للمراجعة')}
${attItem('tag', 3, 'تحديثات أسعار مفتوحة', 'تغييرات في أسعار النماذج بانتظار مراجعتك.', 'عرض تحديثات الأسعار', '')}
</div></section>`;
const chatBlock = (neg) => `<section class="card blk" aria-label="المحادثات"><div class="bh"><h3>${$('chat', 20)}المحادثات</h3></div>
<div class="sg c2">${stat('المحصَّل', m2('842.30'))}${stat('تكلفة المزوّد', m2('531.75'))}${neg ? stat('الهامش', mneg2('48.50'), 'd', $('warn', 14)) : stat('الهامش', m2('310.55'))}${stat('المُمتَص', m2('12.40'))}</div>
<p class="sub" style="margin-block-start:14px">أرقام المحادثات العادية، ولا تشمل تشغيلات التصميم.</p></section>`;
const designBlock = (o = {}) => {
  const d = o.d || { runs: 62, designs: 118, fl: 3, ch: '38.60', co: '24.15', ma: '14.45', ab: '0.62' };
  const link = o.link === false ? '' : `<a class="lk2" style="display:inline-flex;align-items:center;gap:6px;min-height:44px">${o.linkText || 'عرض التشغيلات'}<span class="flip">${$('arrow', 16)}</span></a>`;
  if (o.zero) return `<section class="card blk" aria-label="التصاميم"><div class="bh"><h3>${$('palette', 20)}التصاميم</h3></div><div class="sg c3">${stat('التشغيلات', num4(0))}${stat('التصاميم', num4(0))}${stat('تشغيلات للمراجعة', num4(0))}</div><div class="sg c4">${stat('المحصَّل', m2('0.00'))}${stat('تكلفة المزوّد', m2('0.00'))}${stat('الهامش', m2('0.00'))}${stat('المُمتَص', m2('0.00'))}</div><p class="sub" style="margin-block-start:14px">${o.zeroText || 'لا توجد تشغيلات تصميم في هذه الفترة.'}</p></section>`;
  return `<section class="card blk" aria-label="التصاميم"><div class="bh"><h3>${$('palette', 20)}التصاميم</h3>${link}</div>
<div class="sg c3">${stat('التشغيلات', nf(d.runs))}${stat('التصاميم', nf(d.designs))}${stat('تشغيلات للمراجعة', num4(d.fl), d.fl ? 'w' : '', d.fl ? $('flag', 14) : '')}</div>
<div class="sg c4">${stat('المحصَّل', m2(d.ch))}${stat('تكلفة المزوّد', m2(d.co))}${d.neg ? stat('الهامش', mneg2(d.ma), 'd', $('warn', 14)) : stat('الهامش', m2(d.ma))}${stat('المُمتَص', m2(d.ab))}</div></section>`;
};
const restOfOverview = `${note('بقية الصفحة (بطاقات المستخدمين والباقات والصور، الرسم اليومي، أكثر الأوضاع والنماذج) كما في S18 دون تغيير.')}`;
const overview = (o = {}) => picker + attention(o.rev ?? 3) + `<div class="two2">${chatBlock(o.neg)}${designBlock(o.design || {})}</div>` + restOfOverview;

// ============ 2. user usage ============
const uhead = `${crumb('المستخدمون', 'سارة الحربي')}
<div class="hd"><div class="t"><h2>سارة الحربي</h2>${em('sara.alharbi@example.com')}<span class="badge b-ok">${$('check', 14)}نشط</span></div></div>
<div class="tabs" role="tablist">${['نظرة عامة', 'الاشتراك', 'الرصيد', 'الاستهلاك'].map(t => `<div class="tab${t === 'الاستهلاك' ? ' on' : ''}" role="tab"${t === 'الاستهلاك' ? ' aria-selected="true"' : ''}>${t}</div>`).join('')}</div>`;
const uKpis = `<div class="sg c3" style="margin-block-end:14px">
<div class="card kpi"><div class="l">${$('wallet', 18)}المحتسب على المستخدم</div><div class="v num">${m2('18.42')}</div><div class="h">ما خُصم من رصيده</div></div>
<div class="card kpi"><div class="l">${$('prov', 18)}تكلفة المزوّد</div><div class="v num">${m2('12.44')}</div><div class="h">ما دفعناه للمزوّدين</div></div>
<div class="card kpi"><div class="l">${$('flag', 18)}طلبات مُعلَّمة</div><div class="v num">${num4(2)}</div><div class="h">تحتاج مطابقة التكلفة</div></div></div>`;
const uPicker = `<div class="pk"><div class="seg" style="max-width:560px">${['آخر 7 أيام', 'آخر 30 يومًا', 'آخر 90 يومًا', 'فترة مخصصة'].map((l, i) => `<div class="${i === 1 ? 'on' : ''}">${l}</div>`).join('')}</div><div class="rng">${$('cal', 18)}<span>من 13 أكتوبر إلى 11 نوفمبر 2026</span></div></div>`;
const userDesigns = (o = {}) => `<div style="margin-block-end:20px">${designBlock({ d: { runs: 9, designs: 17, fl: 1, ch: '3.74', co: '2.35', ma: '1.39', ab: '0.00' }, linkText: 'عرض تشغيلات هذا المستخدم', ...o })}</div>`;
const userPage = inner => sh2('users', 'تفاصيل المستخدم', uhead + uPicker + inner, { minH: 700 });
const userUsageNote = note('بقية تبويب الاستهلاك (الأوضاع والنماذج والرسم اليومي وأحدث الطلبات) كما في S19 دون تغيير.');

// ============ 3. runs list ============
const R = [
  { id: 'a3f9c2e1', at: '2026-11-11 14:32', u: 'sara.alharbi@example.com', k: 'create', v: 2, s: 'settled', d: 2, ch: 3176, co: 2541 },
  { id: 'b71d08aa', at: '2026-11-11 13:05', u: 'omar.k@example.com', k: 'create', v: 2, s: 'reconciliation_required', d: 2, ch: 3000, co: 2541, fl: true },
  { id: 'c20e5b93', at: '2026-11-11 12:48', u: 'lina.m@example.com', k: 'edit', v: 1, s: 'reserved', d: 0, ch: null, co: null },
  { id: 'd94a17f0', at: '2026-11-10 21:17', u: 'yousef.a@example.com', k: 'create', v: 3, s: 'released', d: 0, ch: 11, co: 9 },
  { id: 'e08c6d42', at: '2026-11-10 18:02', u: 'sara.alharbi@example.com', k: 'create', v: 2, s: 'settled', d: 2, ch: 2890, co: 2310 },
  { id: 'f5b3a901', at: '2026-11-10 11:40', u: 'huda.s@example.com', k: 'edit', v: 1, s: 'settled', d: 1, ch: 1360, co: 830 },
  { id: '0a6e4c17', at: '2026-11-09 16:21', u: 'omar.k@example.com', k: 'create', v: 1, s: 'settled', d: 1, ch: 1480, co: 1290 },
  { id: '1d2f8b36', at: '2026-11-09 09:55', u: 'lina.m@example.com', k: 'create', v: 2, s: 'reconciliation_required', d: 1, ch: 2900, co: 3270, fl: true },
];
const kindTxt = r => `${r.k === 'edit' ? 'تعديل' : 'إنشاء'}<span class="bn">${r.v === 1 ? 'تصميم واحد' : r.v === 2 ? 'تصميمان' : r.v + ' تصاميم'}</span>`;
const rHead = '<tr><th>التاريخ</th><th>المستخدم</th><th>المساعد</th><th>النوع</th><th>الحالة</th><th>التصاميم</th><th>المحتسب</th><th>تكلفة المزوّد</th></tr>';
const rRow = r => `<tr class="${r.fl ? 'rowfl' : r.s === 'released' ? '' : ''}"><td class="num"><a class="lk2">${dateB(r.at)}</a></td><td>${em(r.u)}</td><td>مصمم جرافيك</td><td>${kindTxt(r)}</td><td>${rBadge(r.s)}</td><td class="num">${num4(r.d)} <span class="sub">من ${num4(r.v)}</span></td><td>${mc(r.ch)}</td><td>${mc(r.co)}</td></tr>`;
const rTable = (rows, more = 'more') => `<div class="card tw twrap"><table class="dense" aria-label="تشغيلات المساعدين"><thead>${rHead}</thead><tbody>${rows.map(rRow).join('')}</tbody></table>${more === 'more' ? `<div class="more"><a class="btn">تحميل المزيد</a></div>` : more === 'loading' ? `<div class="more"><a class="btn off" aria-disabled="true" aria-busy="true">جارٍ التحميل…</a></div>` : more === 'end' ? `<div class="more sub">لا مزيد من التشغيلات</div>` : more === 'moreErr' ? `<div class="more" style="gap:12px;align-items:center;flex-wrap:wrap"><span style="color:var(--dan);display:flex;gap:6px;align-items:center">${$('err', 16)}تعذّر تحميل المزيد.</span><a class="btn">${$('refresh', 18)}إعادة المحاولة</a></div>` : ''}</div>`;
const statusOpts = [['', 'الكل'], ['reserved', 'جارٍ'], ['settled', 'تمّ'], ['released', 'فشل'], ['reconciliation_required', 'تحتاج مراجعة']];
const stSel = v => `<div class="f"><label>الحالة</label><div class="sel" role="combobox" aria-label="الحالة"><span>${statusOpts.find(x => x[0] === v)[1]}</span>${$('down', 18)}</div></div>`;
const userF = (v, err) => `<div class="f"><label>المستخدم</label><div class="in${err ? ' e' : ''}" style="direction:ltr">${v ? `<span>${v}</span><span class="clr" role="button" aria-label="مسح المستخدم">${$('x', 18)}</span>` : '<span class="ph">معرّف المستخدم (UUID)</span>'}</div>${err ? `<div class="err">${$('err', 16)}${err}</div>` : ''}</div>`;
const rFilters = (o = {}) => `<div class="card fcard"><div class="ff2">${userF(o.user, o.userErr)}${stSel(o.status || '')}<div style="display:flex;gap:10px"><a class="btn p">${$('filter', 18)}تطبيق</a><a class="btn">${$('x', 18)}مسح الفلاتر</a></div></div>${o.hint ? `<div class="fsub sub">${$('info', 16)}${o.hint}</div>` : ''}</div>`;
const rIntro = (t = 'تشغيلات المساعدين') => `<div class="hd" style="margin-block-end:4px"><div class="t"><h2>${t}</h2></div></div><p class="sub" style="margin-block-end:16px;font-size:14px">كل تشغيل هو طلب تصميم واحد مؤكَّد. للقراءة فقط: لا توجد إجراءات على التشغيلات. لا تظهر الأوصاف أو الصور هنا.</p>`;
const rSk = n => Array.from({ length: n }, () => `<tr>${[110, 160, 80, 70, 70, 50, 60, 60].map(w => `<td><div class="sk" style="width:${w}px"></div></td>`).join('')}</tr>`).join('');
const rLoading = `<div class="card tw twrap" role="status" aria-busy="true" aria-label="جارٍ التحميل"><table class="dense"><thead>${rHead}</thead><tbody>${rSk(6)}</tbody></table></div>`;
const rEmpty = (t, p, btn) => `<div class="card state"><div class="ico">${$('palette', 26)}</div><h3>${t}</h3><p>${p}</p>${btn ? `<a class="btn" style="margin-block-start:8px">${btn}</a>` : ''}</div>`;
const rError = `<div class="card state" role="alert"><div class="ico" style="background:var(--dan-c);color:var(--dan)">${$('wifi', 26)}</div><h3>تعذّر تحميل التشغيلات</h3><p>تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى.</p><a class="btn" style="margin-block-start:8px">${$('refresh', 18)}إعادة المحاولة</a></div>`;
const runsPage = (inner, crumbs) => sh2('bot', 'تشغيلات المساعدين', `${crumbs || ''}${inner}`, { minH: 560 });

// ============ 4. run detail ============
// amounts in ten-thousandths of a dollar
const ST = (seq, kind, v, model, prov, status, i, o, co, chg, ms, extra = {}) => ({ seq, kind, v, model, prov, status, i, o, co, chg, ms, ...extra });
const stepsOk = [
  ST(1, 'prompt', null, 'GPT-4.1 mini', 'openai', 'done', 1240, 310, 9, 11, 1800),
  ST(2, 'image', 1, 'GPT Image 1', 'openai', 'done', 412, 1056, 840, 1050, 14200),
  ST(3, 'check', 1, 'GPT-4o mini', 'openai', 'done', 1850, 96, 4, 5, 2100),
  ST(4, 'image', 2, 'GPT Image 1', 'openai', 'done', 412, 1056, 840, 1050, 13800),
  ST(5, 'check', 2, 'GPT-4o mini', 'openai', 'done', 1850, 102, 4, 5, 2000),
  ST(6, 'image', 2, 'GPT Image 1', 'openai', 'done', 412, 1056, 840, 1050, 14600, { regen: true }),
  ST(7, 'check', 2, 'GPT-4o mini', 'openai', 'done', 1850, 98, 4, 5, 2200),
];
const stepsFl = stepsOk.map((s, i) => (s.kind === 'image' ? { ...s, est: true } : s));
const stepsFail = [
  ST(1, 'prompt', null, 'GPT-4.1 mini', 'openai', 'done', 1240, 310, 9, 11, 1900),
  ST(2, 'image', 1, 'GPT Image 1', 'openai', 'failed', null, null, null, null, 60000, { err: 'PROVIDER_TIMEOUT', etx: 'استغرق الرد وقتًا أطول من المتوقع. يرجى المحاولة مرة أخرى.' }),
  ST(3, 'image', 1, 'GPT Image 1', 'openai', 'failed', null, null, null, null, 3100, { err: 'PROVIDER_UNAVAILABLE', etx: 'الخدمة مشغولة حاليًا. يرجى المحاولة بعد قليل.', regen: true }),
];
const stepsRun = [
  ST(1, 'prompt', null, 'GPT-4.1 mini', 'openai', 'done', 1240, 310, 9, 11, 1700),
  ST(2, 'image', 1, 'GPT Image 1', 'openai', 'done', 412, 1056, 840, 1050, 14100),
  ST(3, 'check', 1, 'GPT-4o mini', 'openai', 'started', null, null, null, null, null),
];
const sumK = (a, k) => a.reduce((t, s) => t + (s[k] || 0), 0);
const secs = ms => (ms === null ? 'جارٍ' : `${(ms / 1000).toFixed(1)} ث`);
const tokCell = s => (s.i === null ? '<span aria-label="لا يوجد">—</span>' : `<div class="tok"><div><bdi dir="ltr">${s.i.toLocaleString('en-US')}</bdi> <span>إدخال</span></div><div><bdi dir="ltr">${s.o.toLocaleString('en-US')}</bdi> <span>إخراج</span></div></div>`);
const tokInline = s => (s.i === null ? '—' : `${num4(s.i.toLocaleString('en-US'))} إدخال · ${num4(s.o.toLocaleString('en-US'))} إخراج`);
const kindCell = s => `<div class="kd"><span class="kic ${KIND[s.kind][0]}">${$(KIND[s.kind][1], 18)}</span><div><b>${KIND[s.kind][2]}</b><span class="s">${s.v ? `التصميم ${num4(s.v)}` : 'الطلب كله'}${s.regen ? ` · <span class="regen">${$('redo', 12)}محاولة أخرى</span>` : ''}</span></div></div>`;
ic.redo = '<path d="M21 7v6h-6M21 13a9 9 0 1 1-3-7.7L21 8"/>';
const estBadge = '<span class="badge b-n">' + $('info', 14) + 'تقديري</span>';
const stHead = '<tr><th>#</th><th>الخطوة</th><th>النموذج</th><th>الحالة</th><th>الاستخدام</th><th>المدة</th><th>تكلفة المزوّد</th><th>المحتسب</th></tr>';
const stRow = s => `<tr class="${s.status === 'failed' ? 'rowfail' : s.status === 'started' ? 'rowrun' : ''}"><td class="num">${num4(s.seq)}</td><td>${kindCell(s)}</td><td><div class="mdl"><bdi dir="ltr">${s.model}</bdi><span class="pv">${s.prov}</span></div></td><td>${sBadge(s.status)}${s.err ? `<div style="margin-block-start:6px"><span class="ecode">${s.err}</span><div class="etx">${s.etx}</div></div>` : ''}</td><td>${tokCell(s)}${s.est ? `<div style="margin-block-start:4px">${estBadge}</div>` : ''}</td><td class="num">${bdiN(secs(s.ms).replace(' ث', ''))}${s.ms === null ? '' : ' ث'}</td><td>${mc(s.co === undefined ? null : s.co)}</td><td>${mc(s.chg === undefined ? null : s.chg)}</td></tr>`;
const stTot = (a, charged) => `<tr class="totr"><td colspan="6">المجموع</td><td>${mc(sumK(a, 'co'))}</td><td>${mc(sumK(a, 'chg'))}</td></tr>`;
const stTable = (a, tot = true) => `<div class="card tw twrap"><table class="dense tl" aria-label="خطوات التشغيل"><thead>${stHead}</thead><tbody>${a.map(stRow).join('')}${tot ? stTot(a) : ''}</tbody></table></div>`;
const heldCardTxt = 'المبلغ الذي حُجز من رصيده عند البدء';
// run detail data
const RD = {
  ok: { id: 'a3f9c2e1', status: 'settled', held: 9000, ch: sumK(stepsOk, 'chg'), co: sumK(stepsOk, 'co'), ab: 0, v: 2, d: 2, k: 'create', steps: stepsOk, at: '2026-11-11 14:32:08', end: '2026-11-11 14:33:21', u: 'sara.alharbi@example.com', ab0: true },
  fl: { id: 'b71d08aa', status: 'reconciliation_required', held: 3000, ch: 3000, co: sumK(stepsFl, 'co'), ab: sumK(stepsFl, 'chg') - 3000, v: 2, d: 2, k: 'create', steps: stepsFl, at: '2026-11-11 13:05:41', end: '2026-11-11 13:06:55', u: 'omar.k@example.com' },
  fail: { id: 'd94a17f0', status: 'released', held: 13500, ch: 11, co: 9, ab: 0, v: 3, d: 0, k: 'create', steps: stepsFail, at: '2026-11-10 21:17:02', end: '2026-11-10 21:18:12', u: 'yousef.a@example.com' },
  run: { id: 'c20e5b93', status: 'reserved', held: 4500, ch: null, co: null, ab: null, v: 1, d: 0, k: 'edit', steps: stepsRun, at: '2026-11-11 12:48:30', end: null, u: 'lina.m@example.com' },
};
const fr2 = (l, v) => `<div class="fr2"><dt>${l}</dt><dd>${v}</dd></div>`;
const idTag = id => `<span class="code" title="المعرّف الكامل">${id}</span>`;
const copyBtn = l => `<span class="ib" role="button" aria-label="${l}" style="width:36px;height:36px;display:inline-grid;vertical-align:middle">${$('copy', 16)}</span>`;
const detailHead = r => `${crumb('تشغيلات المساعدين', 'تشغيل ' + r.id)}
<div class="hd"><div class="t"><h2>تشغيل ${idTag(r.id)}</h2>${rBadge(r.status)}</div><div class="acts">${r.status === 'reserved' ? `<a class="btn">${$('refresh', 18)}تحديث</a>` : ''}</div></div>`;
const facts = r => `<div class="card cp" style="margin-block-end:16px"><h3>تفاصيل الطلب</h3><dl class="fx">
${fr2('المستخدم', `<a class="lk2">${em(r.u)}</a>`)}
${fr2('المساعد', 'مصمم جرافيك')}
${fr2('المحادثة', `<span class="code">7c1e9a40</span> ${copyBtn('نسخ معرّف المحادثة')}`)}
${fr2('النوع', r.k === 'edit' ? 'تعديل تصميم' : 'إنشاء تصاميم')}
${fr2('طلب التصميم', `<span class="code">9b04d7e2</span> ${copyBtn('نسخ معرّف الطلب')}`)}
${fr2('التصاميم', `${num4(r.d)} من ${num4(r.v)} المطلوبة`)}
${fr2('بدأ في', dateB(r.at))}
${fr2('انتهى في', r.end ? dateB(r.end) : '<span class="sub">لم ينتهِ بعد</span>')}
</dl></div>`;
const mstrip = r => {
  const mg = r.ch === null ? null : r.ch - r.co;
  return `<div class="mstrip">
<div class="card kpi"><div class="l">${$('clock', 16)}المحجوز</div><div class="v num">${mc(r.held)}</div><div class="h">${heldCardTxt}</div></div>
<div class="card kpi"><div class="l">${$('wallet', 16)}المحتسب</div><div class="v num">${r.ch === null ? mc(null) : mc(r.ch)}</div><div class="h">${r.ch === null ? 'يُحتسب عند انتهاء التشغيل' : r.status === 'released' ? 'ما استُخدم فقط، وأُفرج عن الباقي' : 'لا يزيد عن المحجوز'}</div></div>
<div class="card kpi"><div class="l">${$('prov', 16)}تكلفة المزوّد</div><div class="v num">${mc(r.co)}</div><div class="h">مجموع خطوات التشغيل</div></div>
<div class="card kpi${mg !== null && mg < 0 ? ' dank' : ''}"><div class="l">${$('chart', 16)}الهامش</div><div class="v num">${mg === null ? mc(null) : mcNeg(mg)}</div><div class="h">المحتسب ناقص التكلفة</div></div>
<div class="card kpi${r.ab ? ' warnk' : ''}"><div class="l" ${r.ab ? 'style="color:var(--warn)"' : ''}>${$('warn', 16)}المُمتَص</div><div class="v num"${r.ab ? ' style="color:var(--warn)"' : ''}>${r.ab === null ? mc(null) : mc(r.ab)}</div><div class="h">تكلفة تحمّلناها فوق المحتسب</div></div></div>`;
};
ic.chart = '<path d="M3 3v18h18M8 17v-5M13 17V8M18 17v-9"/>';
ic.wallet = ic.wallet;
const banner = {
  fl: `<div class="alert al-w" role="note">${$('flag')}<div class="sp body"><b>هذا التشغيل يحتاج مراجعة</b>جزء من الخطوات محسوب من تقدير (لم يرجع المزوّد استخدامًا فعليًا)، وتجاوز مجموع الخطوات المبلغ المحجوز فتحمّلنا الفرق. طابِق التكلفة مع لوحة المزوّد. لا يمكن وضع علامة «تمت المراجعة» من هنا.</div></div>`,
  fail: `<div class="alert al-d" role="note">${$('err')}<div class="sp"><b>لم يخرج أي تصميم</b>فشلت محاولات إنشاء الصورة. حُسب على المستخدم ما استُخدم فقط (كتابة الوصف)، وأُفرج عن بقية المبلغ المحجوز.</div></div>`,
  run: `<div class="alert al-n" role="status">${$('clock')}<div class="sp"><b>التشغيل قيد التنفيذ</b>تظهر الخطوات الجارية وما اكتمل منها. لا تُحتسب المبالغ إلا عند انتهاء التشغيل. اضغط «تحديث» لجلب آخر الخطوات.</div></div>`,
  ok: '',
};
const detailPage = (key, o = {}) => {
  const r = RD[key];
  return sh2('bot', 'تشغيلات المساعدين', detailHead(r) + (banner[o.banner ?? key] || '') + mstrip(r) + facts(r) + `<div class="sec"><h3>خطوات التشغيل</h3><span class="sub">كل استدعاء لنموذج، بالترتيب</span></div>` + stTable(r.steps, key !== 'run') + `<p class="sub" style="margin-block-start:10px">«محاولة أخرى» تعني إعادة إنشاء الصورة نفسها بعد فحص أخفق. المحتسب لكل خطوة يشمل هامش الربح.</p>`, { minH: 700 });
};

// ============ 5. agent dialog additions ============
const DP_TXT = 'Write the image prompt in English. Keep the Arabic headline exactly as given, centered, with generous margins. Prefer flat colours from the brand palette and avoid photographic textures unless a product photo is supplied.';
const DC_TXT = 'تحقق من أن النص العربي مكتوب كما هو دون أخطاء إملائية، وأن الشعار ظاهر وغير مقصوص. أجب بنفس صيغة JSON المطلوبة فقط.';
const advField = (lbl, hint, f, extraHint) => {
  const state = f.state || 'default'; // default | custom | pending | over
  const text = state === 'over' ? DP_TXT + ' ' + DP_TXT.slice(0, 120) : f.text;
  const count = f.count ?? (state === 'custom' ? text.length : 0);
  const over = state === 'over';
  const box = state === 'pending'
    ? `<div class="ta2 pend" role="status">${$('undo', 18)}سيُستعاد الافتراضي عند الحفظ.</div>`
    : state === 'default'
      ? `<div class="ta2 ph" dir="auto">تُستخدم التعليمات الافتراضية. اكتب هنا لاستبدالها.</div>`
      : `<div class="ta2${over ? ' e' : ''}" dir="auto" ${over ? 'aria-invalid="true"' : ''}>${text}</div>`;
  const cnt = over ? '4,210' : count.toLocaleString('en-US');
  const counter = state === 'pending' ? '' : `<span class="cnt2${over ? ' bad' : ''}" aria-live="polite"><bdi dir="ltr">${cnt} / 4,000</bdi></span>`;
  const rst = state === 'default'
    ? `<span class="rst dis" aria-disabled="true">${$('undo', 18)}استعادة الافتراضي</span>`
    : state === 'pending'
      ? `<span class="rst">${$('undo', 18)}تراجع عن الاستعادة</span>`
      : `<span class="rst" role="button">${$('undo', 18)}استعادة الافتراضي</span>`;
  return `<div class="f"><label>${lbl}</label>${box}<div class="tafoot">${rst}${counter}</div>${over ? `<div class="err">${$('err', 16)}الحد الأقصى 4000 حرف. أزل 210 حرفًا.</div>` : `<div class="hint">${hint}</div>`}${extraHint ? `<div class="hint">${extraHint}</div>` : ''}</div>`;
};
const advSummary = o => {
  const a = o.adv || { open: false };
  const p = a.p || { state: 'default' }, c = a.c || { state: 'default' };
  const n = [p, c].filter(x => x.state === 'custom' || x.state === 'over').length;
  const chip = n ? `<span class="badge b-pro cust">${$('pen', 14)}مخصّصة</span>` : `<span class="badge b-n">الافتراضية</span>`;
  return { chip, p, c };
};
const advBlock = o => {
  if (!o.adv) return '';
  const a = o.adv; const { chip, p, c } = advSummary(o);
  const head = `<!--adv--><div class="grp" style="font-size:0;line-height:0;margin-block:8px 14px"></div>`;
  const toggle = `<div class="accb${a.open ? ' open' : ''}" role="button" tabindex="0" aria-expanded="${!!a.open}" aria-controls="adv-p"><div class="tx"><b>تعليمات متقدمة</b><span>${a.open ? 'للمسؤولين فقط. غيّرها بحذر.' : 'اختياري. تغيّر طريقة كتابة الوصف وفحص الصور.'}</span></div>${chip}${$(a.open ? 'up' : 'down', 20)}</div>`;
  if (!a.open) return head + toggle + '<div style="height:16px"></div>';
  const warn = `<div class="alert al-w" role="note" style="margin-block-end:16px">${$('warn')}<div class="sp body"><b>لا تغيّر صيغة الرد</b>يجب أن يظل الفاحص يردّ بصيغة JSON التي يقرؤها المساعد. إذا غيّرتها فقد يتعطل فحص الصور.</div></div>`;
  return head + toggle + `<div class="accp" id="adv-p">${warn}
${advField('تعليمات كتابة الوصف', 'تحدّد كيف يكتب المساعد وصف الصورة. اتركها على الافتراضي إن لم تكن متأكدًا.', p)}
${advField('تعليمات الفحص', 'تحدّد ما يفحصه المساعد في الصورة (النص والشعار). تأكد أن النص لا يطلب صيغة ردّ مختلفة.', c)}
<p class="hint" style="margin-block-end:12px">النصوص الإنجليزية تُعرض من اليسار إلى اليمين تلقائيًا. تُسجَّل التغييرات في سجل التدقيق مع السبب.</p></div>`;
};
// dialog frames: grid frame so the overlay sets the height
const DG = (tag, note, rows, o) => frame2(tag, note, (ACTIVE = 'bot', `<div class="fr g"><div class="app">${sidebar()}<main><header class="top"><h1>المساعدون</h1><div class="who"><div class="avatar" aria-hidden="true">م</div>${ltr('admin@lam7ai.com')}</div></header><div class="content">${listBg(rows)}</div></main></div>${agentDlg(o)}</div>`));
const A_CUSTOM = { open: true, p: { state: 'custom', text: DP_TXT }, c: { state: 'custom', text: DC_TXT } };
// list with instructions column
const aHead3 = '<tr><th>المساعد</th><th>المفتاح</th><th>الحالة والجاهزية</th><th>التعليمات</th><th>الباقات</th><th>الترتيب</th><th>آخر تحديث</th><th></th></tr>';
const instrCell = c => c ? `<span class="badge b-pro cust">${$('pen', 14)}مخصّصة</span>` : '<span class="sub">—</span>';
const aRow3 = (a, c) => `<tr><td><div class="ac"><a class="lnk nm1">${a.ar}</a><span class="en" lang="en">${a.en}</span></div></td><td>${keyLtr(a.key)}</td><td><div style="display:flex;flex-direction:column;align-items:flex-start;gap:4px">${stBadge(a.on)}${readyBadge(a.ready)}</div></td><td>${instrCell(c)}</td><td style="max-width:260px">${chipsOf(a.plans, a.on)}</td><td>${bdiN(a.order)}</td><td class="sub">${dateB(a.upd)}</td><td style="text-align:end">${editBtn(a)}</td></tr>`;
const aTable3 = c => `<div class="card tw"><table aria-label="قائمة المساعدين"><thead>${aHead3}</thead><tbody>${aRow3(rowOn, c)}</tbody></table></div>`;
// phone: dialog slice
SLICE.adv = 'تعليمات متقدمة';
const msheetAdv = (o, scroll = 0) => `<div class="scrim"></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="dlg-t"><div class="grab" aria-hidden="true"></div><div class="sh"><div><h3 id="dlg-t">تعديل المساعد</h3><p class="sub" style="margin:0">${AG.ar} · ${keyLtr(AG.key)}</p></div><span class="x" role="button" aria-label="إغلاق">${$('x', 20)}</span></div><div class="sb"><div style="margin-block-start:-${scroll}px">${(h => h.slice(h.indexOf('<!--adv-->')))(agentFields({ ...o, mobile: true }))}</div></div><div class="sf">${dlgActions(o)}</div></div>`;
const mCard3 = (a, c) => `<div class="vc"><div class="r"><div class="ac"><a class="lnk nm1">${a.ar}</a><span class="en" lang="en">${a.en}</span></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">${stBadge(a.on)}${readyBadge(a.ready)}</div></div><div class="r">${keyLtr(a.key)}<span class="sub">التعليمات: ${c ? `<span class="badge b-pro cust">${$('pen', 14)}مخصّصة</span>` : 'الافتراضية'}</span></div>${chipsOf(a.plans, a.on)}${editBtn(a, true)}</div>`;
const mListAg = c => mcont(`<div class="card" style="overflow:hidden">${mCard3(rowOn, c)}</div>`);

// =====================================================================
// DESKTOP BOARD
// =====================================================================
const dBoardIntro = `<div><h1 class="bt">S29 · تقارير التصميم (لوحة الإدارة) · سطح المكتب</h1><p class="note">لوحة توضيحية مرسومة يدويًا من نظام Bayan v2، بنفس غلاف S18 وS19 وS26. العناوين والملاحظات المنقّطة شروح وليست جزءًا من الواجهة. بيانات العينة خيالية. أسماء النماذج تظهر هنا لأنها شاشة إدارة فقط.</p></div>`;
const FRAME = (tag, n, html) => frame2(tag, n, html);
const reviewNoteUserFilter = 'الفلتر الحالي محفوظ في الرابط: ?userId=…';
const desktop = `${head4('S29 تقارير التصميم - لوحة الإدارة')}<body><div class="board" style="width:1480px">
${dBoardIntro}
${FRAME('1a. نظرة عامة · كتلة «التصاميم» وبطاقة «للمراجعة»', 'بطاقة «تشغيلات تصميم للمراجعة» (designRunsToReview = 3) تقود إلى /admin/agent-runs?status=reconciliation_required', sh2('dash', 'نظرة عامة', overview(), { minH: 560 }))}
${FRAME('1b. نظرة عامة · لا تشغيلات في الفترة', 'العدّاد 0: البطاقة محايدة وبلا رابط. الكتلة بأصفار ونص توضيحي', sh2('dash', 'نظرة عامة', overview({ rev: 0, design: { zero: true } }), { minH: 560 }))}
${FRAME('1c. نظرة عامة · هامش التصاميم سالب', 'لون الخطر مع أيقونة ونص. الرقم بإشارة − (U+2212)', sh2('dash', 'نظرة عامة', overview({ design: { d: { runs: 62, designs: 118, fl: 3, ch: '24.10', co: '31.40', ma: '7.30', ab: '3.15', neg: true } } }), { minH: 560 }))}
${FRAME('2a. استهلاك المستخدم · كتلة «التصاميم» مع رابط', 'تحت بطاقات المحادثات في تبويب «الاستهلاك». الرابط يفتح /admin/agent-runs?userId=…', userPage(uKpis + userDesigns() + userUsageNote))}
${FRAME('2b. استهلاك المستخدم · بلا تصاميم في الفترة', 'الأصفار والرابط غير ظاهر', userPage(uKpis + userDesigns({ zero: true, zeroText: 'لم ينشئ هذا المستخدم تصاميم في هذه الفترة.' }) + userUsageNote))}
${FRAME('3a. قائمة التشغيلات /admin/agent-runs', 'الأحدث أولًا. الصف المعلَّم بخلفية كهرمانية. «تحميل المزيد» يطلب nextCursor', runsPage(rIntro() + rFilters() + rTable(R)))}
${FRAME('3b. مفلترة بـ «تحتاج مراجعة»', 'القادمة من بطاقة «للمراجعة»', runsPage(rIntro() + rFilters({ status: 'reconciliation_required' }) + rTable(R.filter(r => r.fl), 'end')))}
${FRAME('3c. مفلترة بمستخدم', 'القادمة من رابط صفحة المستخدم. البريد يُجلب من المستخدم، والرابط يحمل userId فقط', runsPage(rIntro() + rFilters({ user: 'sara.alharbi@example.com', hint: 'تشغيلات سارة الحربي · ' + reviewNoteUserFilter }) + rTable(R.filter(r => r.u.startsWith('sara')), 'end')))}
${FRAME('3d. خطأ في معرّف المستخدم', 'VALIDATION_FAILED: المعرّف ليس UUID. القائمة الأخيرة تبقى', runsPage(rIntro() + rFilters({ user: 'sara', userErr: 'أدخل معرّف المستخدم الكامل (UUID)' }) + rTable(R)))}
${FRAME('3e. أثناء تحميل المزيد', '', runsPage(rIntro() + rFilters() + rTable(R, 'loading')))}
${FRAME('3f. تعذّر تحميل المزيد', 'الصفوف المحمّلة تبقى', runsPage(rIntro() + rFilters() + rTable(R, 'moreErr')))}
${FRAME('3g. جارٍ التحميل', '', runsPage(rIntro() + rFilters() + rLoading))}
${FRAME('3h. لا تشغيلات بعد', 'لا فلاتر مطبَّقة', runsPage(rIntro() + rFilters() + rEmpty('لا توجد تشغيلات بعد', 'تظهر هنا طلبات التصميم بمجرد أن يؤكدها المستخدمون.')))}
${FRAME('3i. لا نتائج للفلتر', '', runsPage(rIntro() + rFilters({ status: 'reconciliation_required' }) + rEmpty('لا توجد تشغيلات مطابقة', 'جرّب حالة أخرى أو امسح الفلاتر.', 'مسح الفلاتر')))}
${FRAME('3j. تعذّر التحميل', '', runsPage(rIntro() + rFilters() + rError))}
${FRAME('4a. تفاصيل التشغيل · تمّ (مع إعادة إنشاء)', 'التصميم 2 فشل فحصه فأُعيد إنشاؤه مرة. السبعة خطوات مجموعها = المحتسب', detailPage('ok'))}
${FRAME('4b. تفاصيل التشغيل · تحتاج مراجعة', 'استخدام تقديري في خطوات الصور، وتجاوز المحجوز فتحمّلنا الفرق (المُمتَص)', detailPage('fl'))}
${FRAME('4c. تفاصيل التشغيل · فشل', 'محاولتا الصورة أخفقتا. رمز الخطأ ونصّه المعتمد', detailPage('fail'))}
${FRAME('4d. تفاصيل التشغيل · جارٍ', 'خطوة الفحص جارية. المبالغ فارغة حتى النهاية. زر «تحديث»', detailPage('run'))}
${FRAME('4e. تفاصيل التشغيل · جارٍ التحميل', '', sh2('bot', 'تشغيلات المساعدين', crumb('تشغيلات المساعدين', 'تشغيل') + `<div role="status" aria-busy="true" aria-label="جارٍ التحميل"><div class="sk" style="width:240px;height:28px;margin-block-end:20px"></div><div class="mstrip">${Array.from({ length: 5 }, () => `<div class="card kpi"><div class="sk" style="width:60%"></div><div class="sk" style="width:80%;height:22px;margin-block:10px"></div></div>`).join('')}</div><div class="card tw twrap"><table class="dense"><thead>${stHead}</thead><tbody>${Array.from({ length: 4 }, () => `<tr>${[20, 150, 100, 60, 90, 40, 60, 60].map(w => `<td><div class="sk" style="width:${w}px"></div></td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`, { minH: 560 }))}
${FRAME('4f. تفاصيل التشغيل · AGENT_RUN_NOT_FOUND', '404: «لم يتم العثور على هذا التشغيل.»', sh2('bot', 'تشغيلات المساعدين', crumb('تشغيلات المساعدين', 'تشغيل') + `<div class="card state"><div class="ico" style="background:var(--dan-c);color:var(--dan)">${$('err', 26)}</div><h3>لم يتم العثور على هذا التشغيل.</h3><p>قد يكون الرابط قديمًا أو غير صحيح.</p><a class="btn" style="margin-block-start:8px">العودة إلى التشغيلات</a></div>`, { minH: 560 }))}
${FRAME('4g. تفاصيل التشغيل · تعذّر التحميل', '', sh2('bot', 'تشغيلات المساعدين', crumb('تشغيلات المساعدين', 'تشغيل') + rError.replace('التشغيلات', 'التشغيل'), { minH: 560 }))}
${frame2('5a. قائمة المساعدين · عمود «التعليمات»', '«مخصّصة» عندما يكون أحد النصين مخصّصًا، وإلا «—». القائمة لا تعرض النصوص', (ACTIVE = 'bot', shell2('المساعدون', aIntro + aTable3(true), { minH: 420 })))}
${frame2('5b. قائمة المساعدين · افتراضية', '', shell2('المساعدون', aIntro + aTable3(false), { minH: 420 }))}
${DG('5c. نافذة التعديل · «تعليمات متقدمة» مطوية (الافتراضي)', 'ملخص الحالة في الصف: «الافتراضية»', [rowOn], { on: true, sel: ['b', 'p'], adv: { open: false } })}
${DG('5d. «تعليمات متقدمة» مفتوحة · الافتراضيتان', 'الحقلان فارغان بنص إرشادي، و«استعادة الافتراضي» معطّل، والعدّاد 0 / 4,000', [rowOn], { on: true, sel: ['b', 'p'], adv: { open: true } })}
${DG('5e. مفتوحة · تعليمات مخصّصة', 'الوصف بالإنجليزية يُعرض LTR والفحص بالعربية RTL (dir=auto). «استعادة الافتراضي» فعّال. تظهر «مخصّصة» في الملخص', [rowOn], { on: true, sel: ['b', 'p'], adv: A_CUSTOM })}
${DG('5f. مفتوحة · بعد «استعادة الافتراضي» (قبل الحفظ)', 'الحقل يُرسل null عند الحفظ. «تراجع عن الاستعادة» يعيد النص', [rowOn], { on: true, sel: ['b', 'p'], adv: { open: true, p: { state: 'pending' }, c: { state: 'custom', text: DC_TXT } } })}
${DG('5g. مفتوحة · تجاوز 4000 حرف', 'العدّاد وحدّ الحقل بلون الخطر مع أيقونة ونص. الحفظ يبقى ممكنًا بعد التصحيح فقط', [rowOn], { on: true, sel: ['b', 'p'], adv: { open: true, p: { state: 'over' }, c: { state: 'default' } } })}
</div></body></html>`;
fs.writeFileSync(path.join(dir, 'desktop.html'), desktop);

// =====================================================================
// MOBILE BOARD
// =====================================================================
const mRunCard = r => `<div class="rc${r.fl ? ' fl' : r.s === 'released' ? '' : r.s === 'reserved' ? '' : ''}"><div class="r"><a class="lk2">${dateB(r.at)}</a>${rBadge(r.s)}</div><div>${em(r.u)}</div><div class="r"><span class="sub">مصمم جرافيك · ${r.k === 'edit' ? 'تعديل' : 'إنشاء'}</span><span class="sub">التصاميم: ${num4(r.d)} من ${num4(r.v)}</span></div><div class="m3" style="grid-template-columns:1fr 1fr"><div><span class="l">المحتسب</span><span class="v">${mc(r.ch)}</span></div><div><span class="l">تكلفة المزوّد</span><span class="v">${mc(r.co)}</span></div></div></div>`;
const mRFilters = (o = {}) => `<div class="card fcard">${userF(o.user)}<div style="height:12px"></div>${stSel(o.status || '')}<div class="acts" style="margin-block-start:12px"><a class="btn p">${$('filter', 18)}تطبيق</a><a class="btn">مسح الفلاتر</a></div></div>`;
const mRuns = (rows, more = 'more') => `<div class="card" style="overflow:hidden">${rows.map(mRunCard).join('')}${more === 'more' ? `<div class="more"><a class="btn">تحميل المزيد</a></div>` : more === 'end' ? '<div class="more sub">لا مزيد من التشغيلات</div>' : ''}</div>`;
const mSk = `<div class="rc" role="status" aria-busy="true" aria-label="جارٍ التحميل"><div class="sk" style="width:50%;height:18px"></div><div class="sk" style="width:80%"></div><div class="sk" style="width:60%"></div></div>`;
const mStepCard = s => `<div class="sc${s.status === 'failed' ? ' fail' : s.status === 'started' ? ' run' : ''}"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px">${kindCell(s)}${sBadge(s.status)}</div><div class="mdl"><bdi dir="ltr">${s.model}</bdi><span class="pv">${s.prov}</span></div>${s.err ? `<div><span class="ecode">${s.err}</span><div class="etx">${s.etx}</div></div>` : ''}<div class="m3" style="grid-template-columns:1fr 1fr 1fr"><div><span class="l">تكلفة المزوّد</span><span class="v">${mc(s.co ?? null)}</span></div><div><span class="l">المحتسب</span><span class="v">${mc(s.chg ?? null)}</span></div><div><span class="l">المدة</span><span class="v">${s.ms === null ? 'جارٍ' : bdiN((s.ms / 1000).toFixed(1)) + ' ث'}</span></div></div><div class="sub">الاستخدام: ${tokInline(s)} ${s.est ? estBadge : ''}</div></div>`;
const mDetail = (key, o = {}) => {
  const r = RD[key];
  const mg = r.ch === null ? null : r.ch - r.co;
  const strip = `<div class="mstrip" style="margin-block-end:16px"><div class="card kpi"><div class="l">المحجوز</div><div class="v num">${mc(r.held)}</div></div><div class="card kpi"><div class="l">المحتسب</div><div class="v num">${mc(r.ch)}</div></div><div class="card kpi"><div class="l">تكلفة المزوّد</div><div class="v num">${mc(r.co)}</div></div><div class="card kpi${mg !== null && mg < 0 ? ' dank' : ''}"><div class="l">الهامش</div><div class="v num">${mg === null ? mc(null) : mcNeg(mg)}</div></div><div class="card kpi${r.ab ? ' warnk' : ''}" style="grid-column:1/-1"><div class="l"${r.ab ? ' style="color:var(--warn)"' : ''}>المُمتَص</div><div class="v num"${r.ab ? ' style="color:var(--warn)"' : ''}>${mc(r.ab)}</div></div></div>`;
  const hd = `${crumb('تشغيلات المساعدين', 'تشغيل ' + r.id)}<div class="hd" style="margin-block-end:12px"><div class="t"><h2>تشغيل ${idTag(r.id)}</h2>${rBadge(r.status)}</div>${r.status === 'reserved' ? `<a class="btn" style="width:100%">${$('refresh', 18)}تحديث</a>` : ''}</div>`;
  const body = o.part === 'steps'
    ? `<div class="sec"><h3>خطوات التشغيل</h3></div><div class="card" style="overflow:hidden">${r.steps.map(mStepCard).join('')}<div class="sc" style="background:var(--muted-s)"><div style="display:flex;justify-content:space-between;font-weight:600"><span>المجموع</span><span>${mc(sumK(r.steps, 'co'))} · ${mc(sumK(r.steps, 'chg'))}</span></div></div></div>`
    : (banner[o.banner ?? key] || '').replace('class="alert', 'class="alert') + strip + facts(r);
  return mtop('تشغيلات المساعدين') + mcont(o.part === 'steps' ? body : hd + body);
};
const mOverview = (o = {}) => mtop('نظرة عامة') + mcont(picker.replace('style="max-width:560px"', '') + attention(o.rev ?? 3) + (o.only === 'design' ? '' : chatBlock()) + '<div style="height:16px"></div>' + designBlock(o.design || {}));
const mUserUsage = mtop('تفاصيل المستخدم') + mcont(uhead + uKpis + userDesigns());
const mobile = `${head4('S29 تقارير التصميم - جوال')}<body><div class="board" style="width:1640px">
<div><h1 class="bt">S29 · تقارير التصميم (لوحة الإدارة) · الجوال 375px</h1><p class="note">الجداول تتحول إلى بطاقات ولا يوجد تمرير أفقي للصفحة. تفاصيل التشغيل تُعرض في لقطتين من الصفحة نفسها: الأعلى (الملخص والحقائق) ثم الخطوات. النافذة تصبح ورقة سفلية رأسها وأزرارها ثابتة.</p></div>
<div class="mgrid">
${mf('م1a. نظرة عامة · بطاقة «للمراجعة» وكتلة التصاميم', mOverview(), '', 1500)}
${mf('م1b. نظرة عامة · بلا تشغيلات', mOverview({ rev: 0, design: { zero: true } }), '', 1500)}
${mf('م2a. استهلاك المستخدم · كتلة التصاميم', mUserUsage, '', 1300)}
${mf('م2b. استهلاك المستخدم · بلا تصاميم', mtop('تفاصيل المستخدم') + mcont(uhead + uKpis + userDesigns({ zero: true, zeroText: 'لم ينشئ هذا المستخدم تصاميم في هذه الفترة.' })), '', 1300)}
${mf('م3a. قائمة التشغيلات (بطاقات)', mtop('تشغيلات المساعدين') + mcont(rIntro().replace('<p class="sub"', '<p class="sub" style="display:none"') + mRFilters() + mRuns(R.slice(0, 5))), '', 1500)}
${mf('م3b. مفلترة بـ «تحتاج مراجعة»', mtop('تشغيلات المساعدين') + mcont(rIntro().replace('<p class="sub"', '<p class="sub" style="display:none"') + mRFilters({ status: 'reconciliation_required' }) + mRuns(R.filter(r => r.fl), 'end')), '', 812)}
${mf('م3c. مفلترة بمستخدم', mtop('تشغيلات المساعدين') + mcont(rIntro().replace('<p class="sub"', '<p class="sub" style="display:none"') + mRFilters({ user: 'sara.alharbi@example.com' }) + mRuns(R.filter(r => r.u.startsWith('sara')), 'end')), '', 812)}
${mf('م3d. جارٍ التحميل', mtop('تشغيلات المساعدين') + mcont(mRFilters() + `<div class="card" style="overflow:hidden">${mSk}${mSk}${mSk}</div>`))}
${mf('م3e. لا تشغيلات', mtop('تشغيلات المساعدين') + mcont(mRFilters() + rEmpty('لا توجد تشغيلات بعد', 'تظهر هنا طلبات التصميم بمجرد أن يؤكدها المستخدمون.')))}
${mf('م3f. لا نتائج للفلتر', mtop('تشغيلات المساعدين') + mcont(mRFilters({ status: 'reconciliation_required' }) + rEmpty('لا توجد تشغيلات مطابقة', 'جرّب حالة أخرى أو امسح الفلاتر.', 'مسح الفلاتر')))}
${mf('م3g. تعذّر التحميل', mtop('تشغيلات المساعدين') + mcont(mRFilters() + rError))}
${mf('م4a. تفاصيل التشغيل · تمّ · أعلى', mDetail('ok'), '', 1380)}
${mf('م4b. تفاصيل التشغيل · تمّ · الخطوات', mDetail('ok', { part: 'steps' }), '', 1700)}
${mf('م4c. تحتاج مراجعة · أعلى', mDetail('fl'), '', 1500)}
${mf('م4d. تحتاج مراجعة · الخطوات (تقديري)', mDetail('fl', { part: 'steps' }), '', 1700)}
${mf('م4e. فشل · أعلى', mDetail('fail'), '', 1380)}
${mf('م4f. فشل · الخطوات', mDetail('fail', { part: 'steps' }), '', 840)}
${mf('م4g. جارٍ · أعلى', mDetail('run'), '', 1380)}
${mf('م4h. جارٍ · الخطوات', mDetail('run', { part: 'steps' }), '', 700)}
${mf('م5a. قائمة المساعدين · «مخصّصة»', mtop('المساعدون') + mListAg(true))}
${mf('م5b. الورقة · «تعليمات متقدمة» مطوية', mtop('المساعدون') + mListAg(false), msheetAdv({ on: true, sel: ['b', 'p'], adv: { open: false } }))}
${mf('م5c. الورقة · مفتوحة · الافتراضيتان', mtop('المساعدون') + mListAg(false), msheetAdv({ on: true, sel: ['b', 'p'], adv: { open: true } }))}
${mf('م5d. الورقة · مفتوحة · مخصّصة', mtop('المساعدون') + mListAg(true), msheetAdv({ on: true, sel: ['b', 'p'], adv: A_CUSTOM }))}
${mf('م5e. الورقة · مخصّصة · أسفل (الفحص)', mtop('المساعدون') + mListAg(true), msheetAdv({ on: true, sel: ['b', 'p'], adv: A_CUSTOM }, 330))}
${mf('م5f. الورقة · بعد «استعادة الافتراضي»', mtop('المساعدون') + mListAg(true), msheetAdv({ on: true, sel: ['b', 'p'], adv: { open: true, p: { state: 'pending' }, c: { state: 'custom', text: DC_TXT } } }))}
${mf('م5g. الورقة · تجاوز 4000 حرف', mtop('المساعدون') + mListAg(true), msheetAdv({ on: true, sel: ['b', 'p'], adv: { open: true, p: { state: 'over' }, c: { state: 'default' } } }))}
</div></div></body></html>`;
fs.writeFileSync(path.join(dir, 'mobile.html'), mobile);
console.log('ok');
