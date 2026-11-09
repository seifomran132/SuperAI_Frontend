// Generates the hand-built S23 voucher batches boards (extends S22). Run: node build.mjs
// Output: desktop.html, mobile.html (PNGs are rendered with headless Chrome, see REVIEW.md).
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
.mc .row2{grid-template-columns:1fr}.mc .dt{flex:1}
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
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
};
const $ = (k, s) => I(ic[k], s);
const money = (v, c = '') => `<bdi dir="ltr" class="${c}">${v}</bdi>`;
const ltr = e => `<span class="ltr">${e}</span>`;
const code = c => `<span class="code">${c}</span>`;
const head = t => `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${t}</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet"><style>${css}${css2}</style></head>`;

const navItems = [['users', 'المستخدمون'], ['plan', 'الباقات'], ['ticket', 'الأكواد'], ['prov', 'المزوّدون'], ['model', 'النماذج'], ['mode', 'الأوضاع'], ['tag', 'تحديثات الأسعار'], ['set', 'الإعدادات']];
// Sidebar is the FIRST child of the flex row, so it renders on the right in RTL.
const sidebar = () => `<aside><div class="brand"><div class="mono" aria-hidden="true">ل</div><div><b>لمحة AI</b><small>لوحة الإدارة</small></div></div>
<nav aria-label="قائمة الإدارة">${navItems.map(([k, l]) => `<a class="nav${k === 'ticket' ? ' on' : ''}"${k === 'ticket' ? ' aria-current="page"' : ''}>${$(k)}<span>${l}</span></a>`).join('')}</nav>
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

// ---------- batches list ----------
const BN = 'حملة العيد - مكتبة النور';
const B = [
  [BN, 'b', '5.00$', 18, 50, '250.00$', 'active', '31 ديسمبر 2026'],
  ['موزّع الرياض - الدفعة 2', 'b', '10.00$', 0, 20, '200.00$', 'active', 'بلا نهاية'],
  ['تجارب المدارس', 't', 'احترافي · 7 أيام', 12, 30, '-', 'active', '15 يناير 2027'],
  ['معرض التقنية', 'b', '2.50$', 40, 40, '100.00$', 'used', '30 نوفمبر 2026'],
  ['حملة الصيف', 'b', '5.00$', 14, 40, '200.00$', 'ended', '31 أغسطس 2026'],
  ['حملة رمضان', 'b', '10.00$', 0, 25, '250.00$', 'soon', '30 مارس 2027'],
  ['دفعة اختبار', 'b', '1.00$', 0, 10, '10.00$', 'off', 'بلا نهاية'],
];
const bValue = b => (b[1] === 'b' ? money(b[2]) : b[2]);
const bTotal = b => (b[5] === '-' ? '<span class="sub">-</span>' : money(b[5]));
const progress = (r, q, label = 'المستخدم') => `<div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="${q}" aria-valuenow="${r}" aria-label="${label} ${r} من ${q}"><span class="n">${bdiN(r + ' / ' + q)}</span><div class="track"><div class="fill${r === q ? ' done' : ''}" style="width:${Math.round((r / q) * 100)}%"></div></div></div>`;
const tabs = sel => `<div class="tabs" role="tablist" aria-label="أنواع الأكواد"><a class="tab${sel === 's' ? ' on' : ''}" role="tab" aria-selected="${sel === 's'}">أكواد فردية</a><a class="tab${sel === 'b' ? ' on' : ''}" role="tab" aria-selected="${sel === 'b'}">مجموعات الأكواد</a></div>`;
const bBar = (sel = 'الحالة: الكل') => `<div class="bar"><div class="sel" role="combobox" aria-label="الحالة"><span>${sel}</span>${$('down', 18)}</div><span class="sp"></span><a class="btn p fw">${$('plus', 18)}إنشاء مجموعة أكواد</a></div>`;
const bHead = '<tr><th>الاسم</th><th>النوع</th><th>القيمة</th><th>الاستخدام</th><th>القيمة الإجمالية</th><th>الحالة</th><th>ينتهي في</th><th></th></tr>';
const bRows = B.map(b => `<tr><td><a class="lnk" style="font-weight:600">${b[0]}</a></td><td>${kBadge(b[1])}</td><td style="font-weight:500">${bValue(b)}</td><td>${progress(b[3], b[4])}</td><td>${bTotal(b)}</td><td>${bBadge(b[6])}</td><td class="sub">${b[7]}</td><td style="width:44px"><span class="flip" style="color:var(--ink2)">${$('back', 18)}</span></td></tr>`).join('');
const bTable = `<div class="card tw"><table aria-label="قائمة مجموعات الأكواد"><thead>${bHead}</thead><tbody>${bRows}</tbody></table><div class="more"><a class="btn sm">تحميل المزيد</a></div></div>`;
const bSkRows = Array.from({ length: 5 }, () => `<tr><td><div class="sk" style="width:150px"></div></td><td><div class="sk" style="width:56px;height:22px;border-radius:9999px"></div></td><td><div class="sk" style="width:70px"></div></td><td><div class="sk" style="width:130px"></div></td><td><div class="sk" style="width:70px"></div></td><td><div class="sk" style="width:64px;height:22px;border-radius:9999px"></div></td><td><div class="sk" style="width:90px"></div></td><td></td></tr>`).join('');
const bLoading = `<div class="card tw" role="status" aria-busy="true" aria-label="جارٍ التحميل"><table><thead>${bHead}</thead><tbody>${bSkRows}</tbody></table></div>`;
const bEmpty = `<div class="card state"><div class="ico">${$('layers', 26)}</div><h3>لا توجد مجموعات أكواد بعد</h3><p>أنشئ مجموعة لتوليد عدة أكواد دفعة واحدة وتسليمها لموزّع.</p><a class="btn p" style="margin-block-start:8px">${$('plus', 18)}إنشاء مجموعة أكواد</a></div>`;
const bEmptyF = `<div class="card state"><div class="ico">${$('layers', 26)}</div><h3>لا توجد مجموعات موقوفة</h3><p>غيّر الفلتر لعرض باقي المجموعات.</p><a class="btn">عرض الكل</a></div>`;
const bError = `<div class="card state"><div class="ico" style="background:var(--dan-c);color:var(--dan)">${$('wifi', 26)}</div><h3>تعذّر تحميل المجموعات</h3><p>تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى.</p><a class="btn" style="margin-block-start:8px">${$('refresh', 18)}إعادة المحاولة</a></div>`;

// ---------- create form ----------
const crumbNew = `<div class="crumb"><span>الأكواد</span><span class="flip">${$('back', 14)}</span><span>مجموعات الأكواد</span><span class="flip">${$('back', 14)}</span><span>مجموعة جديدة</span></div><div class="hd"><div class="t"><h2>إنشاء مجموعة أكواد</h2></div></div>`;
const createBatch = (o = {}) => {
  const k = o.k || 'b';
  const qty = o.qty ?? 10, amount = o.amount ?? '5.00';
  const prefix = o.prefix || '';
  const exCode = `${prefix ? prefix.toUpperCase() : 'LAM7A'}-7KQ2-XH9M`;
  const exBlock = o.prefixErr ? '' : `<div class="ex"><span class="sub">مثال على الكود:</span><span class="code" aria-label="مثال على الكود">${exCode}</span></div><div class="hint">${prefix ? 'الأحرف بعد الرمز تُنشأ عشوائيًا لكل كود.' : 'بلا رمز يبدأ كل كود بالرمز الافتراضي LAM7A. الأحرف بعد الرمز تُنشأ عشوائيًا لكل كود.'}</div>`;
  const value = k === 'b'
    ? field('المبلغ لكل كود', inp(amount, { ltr: true, e: !!(o.amountErr || o.over), trail: 'USD' }), { req: true, hint: `أكبر من 0 وحتى ${bdiN('1000.00$')}.`, err: o.amountErr })
    : field('الباقة', `<div class="sel"><span>احترافي</span>${$('down', 18)}</div>`, { req: true, hint: 'الباقات النشطة فقط، دون الباقة الافتراضية.' });
  const second = k === 'b'
    ? field('عدد الأكواد', inp(qty, { ltr: true, e: !!o.qtyErr }), { req: true, hint: 'من 3 إلى 100. الافتراضي 10.', err: o.qtyErr })
    : field('عدد الأيام', inp('7', { ltr: true }), { req: true, hint: 'من 1 إلى 365.' });
  const qtyRow = k === 't' ? `<div class="row2">${field('عدد الأكواد', inp(qty, { ltr: true }), { req: true, hint: 'من 3 إلى 100. الافتراضي 10.' })}<div></div></div>` : '';
  const n = Number(qty), a = Number(amount);
  const tot = n * a;
  let totalBox = '';
  if (k === 'b') {
    if (o.qtyErr) totalBox = `<div class="total" role="status"><div><div style="font-weight:600">الإجمالي</div><div class="sub">صحّح عدد الأكواد لعرض الإجمالي.</div></div><div class="tv">-</div></div>`;
    else if (o.over) totalBox = `<div class="total bad" role="alert"><div><div style="font-weight:600">الإجمالي</div><div class="sub">${qtyWord(n)} × ${bdiN(money2(a))}</div><div class="sm2">${$('err', 16)}<span>الإجمالي يتجاوز الحد الأقصى للمجموعة (${bdiN('10,000.00$')}). قلّل العدد أو المبلغ.</span></div></div><div class="tv">${bdiN(money2(tot))}</div></div>`;
    else totalBox = `<div class="total" role="status"><div><div style="font-weight:600">الإجمالي</div><div class="sub">${qtyWord(n)} × ${bdiN(money2(a))}</div></div><div class="tv">${bdiN(money2(tot))}</div></div>`;
  } else {
    totalBox = `<div class="total" role="status"><div><div style="font-weight:600">ملخص المجموعة</div><div class="sub">${qtyWord(n)}، يمنح كل كود باقة «احترافي» لمدة 7 أيام.</div></div></div>`;
  }
  const blocked = !!o.over;
  const alert = o.alert ? `<div class="alert al-d" role="alert">${$('err')}<div class="sp"><b>تعذّر إنشاء المجموعة</b>لم يُحفظ أي كود. حاول مرة أخرى.</div><a class="btn sm" style="background:#fff">${$('refresh', 18)}إعادة المحاولة</a></div>` : '';
  return `<div class="card cp form">${alert}
<div class="grp first">المجموعة</div>
${field('اسم المجموعة', inp(o.name ?? BN, { e: !!o.nameErr, ph: false }), { req: true, hint: 'للاستخدام الداخلي، حتى 100 حرف. يُستخدم اسمًا لملف التنزيل.', err: o.nameErr })}
${segF(k)}
<div class="row2">${value}${second}</div>${qtyRow}
<div class="grp">شكل الكود</div>
${field('رمز البداية (اختياري)', inp(prefix || 'EID', { ltr: true, ph: !prefix, e: !!o.prefixErr }), { hint: 'من 2 إلى 12 حرفًا إنجليزيًا أو رقمًا. يظهر بحروف كبيرة.', err: o.prefixErr })}${exBlock}
<div class="grp">الفترة والشروط</div>
<div class="row2">${field('يبدأ في', dtf(o.start || 'YYYY-MM-DD HH:mm', !o.start), { hint: 'بتوقيت جهازك. الافتراضي: الآن.' })}${field('ينتهي في', dtf(o.end || 'YYYY-MM-DD HH:mm', !o.end), { hint: 'بتوقيت جهازك. اتركه فارغًا لتبقى الأكواد بلا نهاية.' })}</div>
${chk(!!o.newOnly, 'للمستخدمين الجدد فقط', 'من لم تكن لهم باقة غير الباقة الافتراضية.')}
${field('ملاحظة داخلية', `<div class="in ta"><span class="${o.note ? '' : 'ph'}">${o.note || 'مثال: اسم الموزّع أو رقم الطلب (لا تظهر للمستخدمين)'}</span></div>`, {})}
<div class="grp">التأكيد</div>
${totalBox}
${reasonF(o.reasonErr)}
<div class="dact" style="margin-block-start:0"><a class="btn p${blocked || o.busy ? ' off' : ''}"${blocked ? ' aria-disabled="true"' : ''}>${o.busy ? 'جارٍ الإنشاء…' : 'إنشاء المجموعة'}</a><a class="btn">إلغاء</a></div></div>`;
};

// ---------- batch detail ----------
const crumbD = name => `<div class="crumb"><span>الأكواد</span><span class="flip">${$('back', 14)}</span><span>مجموعات الأكواد</span><span class="flip">${$('back', 14)}</span><span>${name}</span></div>`;
const dlBtn = `<a class="btn">${$('dl', 18)}تنزيل ملف CSV</a>`;
const bHeadD = (state, { created, off, name = BN } = {}) => `${crumbD(name)}<div class="hd"><div class="t"><h2>${name}</h2>${bBadge(state)}${kBadge('b')}</div><div class="acts">${created ? '' : dlBtn}${off ? `<a class="btn">تفعيل المجموعة</a>` : `<a class="btn d">${$('stop', 18)}إيقاف المجموعة</a>`}</div></div>`;
const createdHero = `<div class="card cp" style="margin-block-end:20px;border-color:var(--ok-b)"><div style="display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap"><div style="flex:1;min-width:260px"><span class="badge b-ok" style="margin-block-end:8px">${$('check', 14)}تم إنشاء المجموعة</span><h3 style="margin-block-end:4px">أُنشئت ${qtyWord(50)} جاهزة للاستخدام</h3><p class="sub">نزّل الملف وسلّمه للموزّع. تجد الأكواد أيضًا في الجدول أدناه.</p></div><a class="btn p lg">${$('dl', 20)}تنزيل ملف CSV</a></div>
<div class="alert al-w" style="margin-block:16px 0" role="note">${$('warn')}<div class="sp body"><b>هذه أكواد صالحة للاستخدام الآن</b>شارك الملف مع الموزّع المقصود فقط. من يملك الكود يستطيع استخدامه.</div></div></div>`;
const offBanner = `<div class="alert al-n" role="status">${$('stop')}<div class="sp"><b>هذه المجموعة متوقفة</b>لا يعمل أي كود غير مستخدم فيها، وتظهر للمستخدمين كأنها غير موجودة. فعّلها لتعمل الأكواد من جديد، عدا ما أوقفته منها واحدًا واحدًا.</div></div>`;
const failBanner = `<div class="alert al-d" role="alert">${$('err')}<div class="sp"><b>تعذّر تنزيل الملف</b>لم يتغير شيء في المجموعة. تحقق من اتصالك ثم حاول مرة أخرى.</div><a class="btn sm" style="background:#fff">${$('refresh', 18)}إعادة المحاولة</a></div>`;
const stats = (r, q, cred, tot) => `<div class="card cp"><h3>التقدم</h3><div class="stats">
<div class="stat"><div class="sub">الأكواد المستخدمة</div><div class="sv">${bdiN(r + ' / ' + q)}</div><div class="prog" style="min-width:0" role="progressbar" aria-valuemin="0" aria-valuemax="${q}" aria-valuenow="${r}" aria-label="الأكواد المستخدمة ${r} من ${q}"><div class="track"><div class="fill" style="width:${Math.round((r / q) * 100)}%"></div></div><span class="sub">${Math.round((r / q) * 100)}%</span></div></div>
<div class="stat"><div class="sub">الرصيد المضاف</div><div class="sv">${bdiN(cred)} <small>من ${bdiN(tot)}</small></div><div class="prog" style="min-width:0" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round((r / q) * 100)}" aria-label="الرصيد المضاف ${cred} من ${tot}"><div class="track"><div class="fill" style="width:${Math.round((r / q) * 100)}%"></div></div><span class="sub">${Math.round((r / q) * 100)}%</span></div></div></div></div>`;
const statsCard = stats(18, 50, '90.00$', '250.00$');
const summaryD = `<div class="card cp"><h3>ملخص المجموعة</h3><dl class="facts">
<dt>النوع</dt><dd>${kBadge('b')}</dd><dt>القيمة لكل كود</dt><dd>${money('5.00$')}</dd>
<dt>عدد الأكواد</dt><dd>${money('50')}</dd><dt>رمز البداية</dt><dd><span class="code">EID</span></dd>
<dt>يبدأ في</dt><dd>${bdiN('2026-12-01 09:00')}</dd><dt>للمستخدمين الجدد فقط</dt><dd>لا</dd>
<dt>أنشأه</dt><dd>${ltr('admin@lam7ai.com')}</dd><dt>تاريخ الإنشاء</dt><dd>9 نوفمبر 2026 · 14:20</dd></dl>
<p class="sub" style="margin-block-start:14px">النوع والقيمة والعدد وتاريخ البدء لا تتغير بعد الإنشاء.</p></div>`;
const settingsD = (dirty = true) => `<div class="card cp"><h3>الإعدادات</h3>
${field('ينتهي في', `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><div class="in" style="direction:ltr;flex:1;min-width:190px"><span>2026-12-31 23:59</span></div><a class="btn g sm" style="flex-shrink:0">إزالة التاريخ</a></div>`, { hint: 'يسري على كل أكواد المجموعة.' })}
${field('ملاحظة داخلية', '<div class="in ta"><span>وُزّعت على مكتبة النور - فرع العليا</span></div>', {})}
<div class="dact" style="margin-block-start:0"><a class="btn p${dirty ? '' : ' off'}">حفظ التغييرات</a><a class="btn">تراجع</a></div></div>`;
const copyBtn = done => `<span class="ib${done ? ' done' : ''}" role="button" aria-label="${done ? 'تم النسخ' : 'نسخ الكود'}">${$(done ? 'check' : 'copy', 18)}${done ? '<span>تم النسخ</span>' : ''}</span>`;
const C = [
  ['EID-7KQ2-XH9M', 'used', '3 نوفمبر 2026 · 10:44', 'sara.n@example.com'],
  ['EID-4TD8-N2WA', 'unused'],
  ['EID-M9X3-K5PB', 'used', '2 نوفمبر 2026 · 21:05', 'omar.k@example.com'],
  ['EID-R6HC-2YJE', 'off'],
  ['EID-W8LF-Q3ZV', 'unused'],
  ['EID-B2NG-7SUD', 'used', '1 نوفمبر 2026 · 08:20', 'lina.t@example.com'],
  ['EID-5VCP-A9XT', 'unused'],
];
const allUnused = rows => rows.map(c => [c[0], 'unused']);
const cHead = '<tr><th>الكود</th><th>الحالة</th><th>تاريخ الاستخدام</th><th>المستخدم</th><th></th></tr>';
const cRows = (rows, copiedIdx = -1, batchOff = false) => rows.map((c, i) => `<tr${c[1] === 'off' ? ' class="rowoff"' : ''}><td><div class="cc"><span class="code">${c[0]}</span>${copyBtn(i === copiedIdx)}</div></td><td>${batchOff && c[1] === 'unused' ? '<span class="badge b-n">' + $('dot', 14) + 'غير مستخدم</span>' : cBadge(c[1])}</td><td class="sub">${c[2] || '-'}</td><td>${c[3] ? `<a class="lnk ltr">${c[3]}</a>` : '<span class="sub">-</span>'}</td><td style="text-align:end">${c[1] === 'unused' && !batchOff ? `<a class="btn dt">${$('stop', 18)}إيقاف الكود</a>` : ''}${c[1] === 'off' && !batchOff ? `<a class="btn sm">${$('check', 18)}تفعيل الكود</a>` : ''}</td></tr>`).join('');
const codesFilter = (s = 'الحالة: الكل') => `<div class="sel" role="combobox" aria-label="الحالة" style="min-width:190px"><span>${s}</span>${$('down', 18)}</div>`;
const codesSec = (inner, count = '18 / 50') => `<div class="sec" style="margin-block-start:24px"><h3>الأكواد <span class="sub" style="font-weight:400">(${bdiN(count)} مستخدم)</span></h3>${codesFilter()}</div>${inner}`;
const codesOk = (rows = C, copied = -1, batchOff = false) => `<div class="card tw"><table aria-label="أكواد المجموعة"><thead>${cHead}</thead><tbody>${cRows(rows, copied, batchOff)}</tbody></table><div class="more"><a class="btn sm">تحميل المزيد</a></div></div>`;
const cSk = Array.from({ length: 4 }, () => `<tr><td><div class="sk" style="width:150px"></div></td><td><div class="sk" style="width:80px;height:22px;border-radius:9999px"></div></td><td><div class="sk" style="width:120px"></div></td><td><div class="sk" style="width:170px"></div></td><td></td></tr>`).join('');
const codesLoading = `<div class="card tw" role="status" aria-busy="true" aria-label="جارٍ التحميل"><table><thead>${cHead}</thead><tbody>${cSk}</tbody></table></div>`;
const codesErr = `<div class="card state" style="padding-block:36px"><div class="ico" style="background:var(--dan-c);color:var(--dan)">${$('wifi', 26)}</div><h3>تعذّر تحميل الأكواد</h3><p>تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى.</p><a class="btn" style="margin-block-start:8px">${$('refresh', 18)}إعادة المحاولة</a></div>`;
const codesEmptyF = `<div class="card state" style="padding-block:36px"><div class="ico">${$('ticket', 26)}</div><h3>لا توجد أكواد مستخدمة بعد</h3><p>ستظهر هنا الأكواد التي استخدمها أصحابها.</p><a class="btn">عرض الكل</a></div>`;
const detailBody = (o = {}) => `${bHeadD(o.state || 'active', o)}${o.created ? createdHero : ''}${o.stats || statsCard}<div class="cols" style="margin-block-start:20px">${summaryD}${settingsD(o.dirty !== false)}</div>${codesSec(o.codes || codesOk(C, o.copied ?? -1), o.count)}`;
const detailTop = (o = {}) => `${bHeadD(o.state || 'active', o)}${o.top || ''}${statsCard}`;

// ---------- dialogs ----------
const dCsv = dlg('تنزيل ملف الأكواد', `المجموعة: ${BN}`,
  `<div class="alert al-w" style="margin-block-end:12px" role="note">${$('warn')}<div class="sp body"><b>الملف يحتوي أكواد صالحة للاستخدام</b>شاركه مع الموزّع المقصود فقط. من يملك الكود يستطيع استخدامه.</div></div>
<p class="sub" style="margin-block-end:4px">لا يحتوي الملف على بيانات المستخدمين. يُسجَّل كل تنزيل في سجل التدقيق.</p>`,
  `<a class="btn p">${$('dl', 18)}تنزيل الملف</a><a class="btn">إلغاء</a>`);
const dCsvBusy = dlg('تنزيل ملف الأكواد', `المجموعة: ${BN}`,
  `<div class="alert al-w" style="margin-block-end:12px" role="note">${$('warn')}<div class="sp body"><b>الملف يحتوي أكواد صالحة للاستخدام</b>شاركه مع الموزّع المقصود فقط. من يملك الكود يستطيع استخدامه.</div></div>`,
  `<a class="btn p off">جارٍ التنزيل…</a><a class="btn">إلغاء</a>`);
const dCode = err => dlg('إيقاف الكود', `الكود: ${code('EID-4TD8-N2WA')}`,
  `<p class="sub" style="margin-block-end:14px;color:var(--ink)">سيظهر الكود للمستخدمين كأنه غير موجود، وسيبقى متوقفًا حتى لو أعدت تفعيل المجموعة.</p>${reasonF(err)}`,
  `<a class="btn dp">إيقاف الكود</a><a class="btn">إلغاء</a>`);
const dCodeOn = dlg('تفعيل الكود', `الكود: ${code('EID-R6HC-2YJE')}`, `<p class="sub" style="margin-block-end:14px;color:var(--ink)">سيعمل الكود من جديد ضمن فترته، ما دامت المجموعة فعّالة.</p>${reasonF(false)}`, `<a class="btn p">تفعيل الكود</a><a class="btn">إلغاء</a>`);
const dBatchOff = err => dlg('إيقاف المجموعة', `المجموعة: ${BN}`,
  `<div class="chg"><div><span class="sub">حالة المجموعة</span><span>فعّالة ← متوقفة</span></div></div><p class="sub" style="margin-block-end:14px;color:var(--ink)">ستتوقف كل أكواد المجموعة غير المستخدمة، وتظهر للمستخدمين كأنها غير موجودة. الأكواد التي استُخدمت من قبل لا تتأثر. يمكنك تفعيل المجموعة لاحقًا.</p>${reasonF(err)}`,
  `<a class="btn dp">إيقاف المجموعة</a><a class="btn">إلغاء</a>`);
const dBatchOn = dlg('تفعيل المجموعة', `المجموعة: دفعة اختبار`,
  `<div class="chg"><div><span class="sub">حالة المجموعة</span><span>متوقفة ← فعّالة</span></div></div><p class="sub" style="margin-block-end:14px;color:var(--ink)">ستعمل الأكواد غير المستخدمة من جديد ضمن فترتها، عدا الأكواد التي أوقفتها واحدًا واحدًا.</p>${reasonF(false)}`,
  `<a class="btn p">تفعيل المجموعة</a><a class="btn">إلغاء</a>`);
const dSave = err => dlg('حفظ التغييرات', `المجموعة: ${BN}`,
  `<div class="chg"><div><span class="sub">ينتهي في</span><span>${bdiN('2026-12-31 23:59')} ← بلا نهاية</span></div><div><span class="sub">الملاحظة الداخلية</span><span>تغيّرت</span></div></div>${reasonF(err)}`,
  `<a class="btn p">حفظ</a><a class="btn">إلغاء</a>`);

// ---------- single voucher detail (code with a batch) ----------
const V1 = 'EID-4TD8-N2WA';
const voucherBatchDetail = `<div class="crumb"><span>الأكواد</span><span class="flip">${$('back', 14)}</span>${code(V1)}</div>
<div class="hd"><div class="t"><h2 class="code">${V1}</h2>${bBadge('active')}${kBadge('b')}</div><div class="acts"><a class="btn d">${$('stop', 18)}إيقاف الكود</a></div></div>
<div class="alert al-n" role="note">${$('layers')}<div class="sp"><b>هذا الكود من مجموعة «${BN}»</b>يُستخدم مرة واحدة فقط، ويُعدَّل تاريخ انتهائه من المجموعة.</div><a class="btn sm" style="background:#fff">فتح المجموعة<span class="flip">${$('back', 16)}</span></a></div>
<div class="cols"><div class="card cp"><h3>ملخص الكود</h3><dl class="facts"><dt>النوع</dt><dd>${kBadge('b')}</dd><dt>القيمة</dt><dd>${money('5.00$')}</dd><dt>المجموعة</dt><dd><a class="lnk">${BN}</a></dd><dt>يبدأ في</dt><dd>${bdiN('2026-12-01 09:00')}</dd><dt>للمستخدمين الجدد فقط</dt><dd>لا</dd><dt>أنشأه</dt><dd>${ltr('admin@lam7ai.com')}</dd><dt>تاريخ الإنشاء</dt><dd>9 نوفمبر 2026 · 14:20</dd></dl><p class="sub" style="margin-block-start:14px">النوع والقيمة والباقة وتاريخ البدء لا تتغير بعد الإنشاء.</p></div>
<div class="card cp"><h3>الإعدادات</h3>${field('ملاحظة داخلية', '<div class="in ta"><span>وُزّعت على مكتبة النور - فرع العليا</span></div>', {})}<div class="dact" style="margin-block-start:0"><a class="btn p off">حفظ التغييرات</a><a class="btn">تراجع</a></div></div></div>
<div class="sec" style="margin-block-start:24px"><h3>الاستخدامات</h3></div><div class="card state" style="padding-block:32px"><h3>لم يستخدم أحد هذا الكود بعد</h3><p>ستظهر هنا الحسابات التي استخدمته.</p></div>`;
const notFound = `<div class="crumb"><span>الأكواد</span><span class="flip">${$('back', 14)}</span><span>مجموعات الأكواد</span></div><div class="card state"><div class="ico" style="background:var(--dan-c);color:var(--dan)">${$('err', 26)}</div><h3>المجموعة غير موجودة</h3><p>لم يتم العثور على هذه المجموعة من الأكواد.</p><a class="btn" style="margin-block-start:8px">العودة إلى المجموعات</a></div>`;
const detailLoading = `<div class="crumb"><span>الأكواد</span></div><div class="hd"><div class="t"><div class="sk" style="width:260px;height:30px"></div></div></div><div class="card cp" role="status" aria-busy="true" aria-label="جارٍ التحميل">${'<div class="sk" style="margin-block-end:16px;height:28px"></div>'.repeat(3)}</div>`;

// ---------- DESKTOP ----------
const offDetail = bHeadD('off', { off: true, name: 'دفعة اختبار' }) + offBanner + stats(0, 10, '0.00$', '10.00$') + codesSec(codesOk(C.slice(1, 5).map(c => [c[0], c[1] === 'off' ? 'off' : 'unused']), -1, true), '0 / 10');
const desktop = `${head('S23 مجموعات الأكواد - لوحة الإدارة')}<body><div class="board" style="width:1480px">
<div><h1 class="bt">S23 · مجموعات الأكواد (لوحة الإدارة) · سطح المكتب</h1><p class="note">لوحة توضيحية مرسومة يدويًا من نظام Bayan v2، امتداد لـ S22. العناوين والملاحظات الصغيرة شروح وليست جزءًا من الواجهة. بيانات العينة خيالية.</p></div>
${frame2('1. تبويب «مجموعات الأكواد» /admin/vouchers?tab=batches', 'كل حالات الشارة: فعّال، مستنفد، منتهي، لم يبدأ، متوقف', shell2('الأكواد', tabs('b') + bBar() + bTable))}
${frame2('1b. جارٍ التحميل', '', shell2('الأكواد', tabs('b') + bBar() + bLoading, { minH: 420 }))}
${frame2('1c. لا توجد مجموعات بعد', '', shell2('الأكواد', tabs('b') + bBar() + bEmpty, { minH: 420 }))}
${frame2('1d. فلتر بلا نتائج', 'الفلتر «موقوف»', shell2('الأكواد', tabs('b') + bBar('الحالة: موقوف') + bEmptyF, { minH: 420 }))}
${frame2('1e. تعذّر التحميل', '', shell2('الأكواد', tabs('b') + bBar() + bError, { minH: 420 }))}
${frame2('2a. إنشاء مجموعة · رصيد', 'رمز البداية EID: المثال يتغير مباشرة، والإجمالي = العدد × المبلغ', shell2('إنشاء مجموعة أكواد', crumbNew + createBatch({ prefix: 'eid', qty: 50, amount: '5.00', newOnly: true, note: 'وُزّعت على مكتبة النور - فرع العليا', end: '2026-12-31 23:59' })))}
${frame2('2b. إنشاء مجموعة · القيم الافتراضية', 'بلا رمز: المثال بالرمز الافتراضي ومكتوب أنه مثال', shell2('إنشاء مجموعة أكواد', crumbNew + createBatch({ name: 'موزّع الرياض - الدفعة 2', qty: 10, amount: '5.00' })))}
${frame2('3a. نوع «تجربة»', 'الباقة + عدد الأيام، بلا إجمالي مالي', shell2('إنشاء مجموعة أكواد', crumbNew + createBatch({ k: 't', name: 'تجارب المدارس', qty: 30, prefix: 'EDU' })))}
${frame2('3b. الإجمالي فوق 10,000$', 'الإنشاء معطّل مع رسالة (100 × 150.00$)', shell2('إنشاء مجموعة أكواد', crumbNew + createBatch({ qty: 100, amount: '150.00', over: true, prefix: 'EID' })))}
${frame2('3c. أخطاء الحقول', 'الاسم، عدد الأكواد (2)، الرمز، والسبب', shell2('إنشاء مجموعة أكواد', crumbNew + createBatch({ name: '', nameErr: 'اسم المجموعة مطلوب.', qty: 2, qtyErr: 'اكتب عددًا صحيحًا من 3 إلى 100.', prefix: 'E-1', prefixErr: 'من 2 إلى 12 حرفًا إنجليزيًا أو رقمًا فقط.', reasonErr: true })))}
${frame2('3d. فشل الإنشاء', 'VOUCHER_CODE_TAKEN: رسالة عامة وإعادة المحاولة بمفتاح جديد', shell2('إنشاء مجموعة أكواد', crumbNew + createBatch({ alert: true, qty: 50, prefix: 'EID' }), { clip: 640 }))}
${frame2('3e. أثناء الإرسال', 'الزر معطّل ويعرض «جارٍ الإنشاء…» (أسفل النموذج)', shell2('إنشاء مجموعة أكواد', `<div style="height:330px;overflow:hidden;position:relative"><div style="position:absolute;inset-inline:0;inset-block-end:0">${createBatch({ busy: true, qty: 50, prefix: 'EID' })}</div></div>`, { minH: 420 }))}
${frame2('4a. تفاصيل المجموعة', 'التقدم، تنزيل CSV، الإيقاف، الإعدادات، جدول الأكواد (أحدها أُوقف وحده والمجموعة فعّالة، وأحدها نُسخ)', shell2('تفاصيل المجموعة', detailBody({ copied: 4 })))}
${frame2('4b. بعد الإنشاء', 'إشعار الأكواد الصالحة وزر التنزيل في المقدمة', shell2('تفاصيل المجموعة', detailBody({ created: true, dirty: false, stats: stats(0, 50, '0.00$', '250.00$'), codes: codesOk(allUnused(C)), count: '0 / 50' })))}
${frame2('4c. المجموعة متوقفة', 'لافتة وزر «تفعيل المجموعة» ونافذة التفعيل', shell2('تفاصيل المجموعة', offDetail, { extra: dBatchOn, clip: 900 }))}
${frame2('5a. تحذير قبل التنزيل', 'يظهر قبل كل تنزيل CSV', shell2('تفاصيل المجموعة', detailTop(), { extra: dCsv, clip: 640 }))}
${frame2('5b. أثناء التنزيل', 'الزر معطّل ويعرض «جارٍ التنزيل…»', shell2('تفاصيل المجموعة', detailTop(), { extra: dCsvBusy, clip: 640 }))}
${frame2('6a. إيقاف كود واحد', 'نافذة السبب، السبب مطلوب (خطأ)', shell2('تفاصيل المجموعة', detailBody({}), { extra: dCode(true), clip: 1050 }))}
${frame2('6d. تفعيل كود متوقف', 'زر «تفعيل الكود» على صف الكود المتوقف، والمجموعة فعّالة', shell2('تفاصيل المجموعة', detailBody({}), { extra: dCodeOn, clip: 1050 }))}
${frame2('6b. إيقاف المجموعة', 'نافذة السبب', shell2('تفاصيل المجموعة', detailBody({}), { extra: dBatchOff(false), clip: 1050 }))}
${frame2('6c. حفظ الإعدادات', 'نافذة السبب لتاريخ الانتهاء والملاحظة', shell2('تفاصيل المجموعة', detailBody({}), { extra: dSave(false), clip: 1050 }))}
${frame2('7. تفاصيل كود تابع لمجموعة', 'حقل «الحد الأقصى للاستخدام» محذوف، ورابط إلى المجموعة', shell2('تفاصيل الكود', voucherBatchDetail))}
${frame2('8a. جارٍ تحميل الأكواد', '', shell2('تفاصيل المجموعة', detailTop() + codesSec(codesLoading), { minH: 420 }))}
${frame2('8b. تعذّر تحميل الأكواد', 'يبقى باقي الصفحة سليمًا', shell2('تفاصيل المجموعة', detailTop() + codesSec(codesErr), { minH: 420 }))}
${frame2('8c. فلتر «مستخدم» بلا نتائج', '', shell2('تفاصيل المجموعة', detailTop() + `<div class="sec" style="margin-block-start:24px"><h3>الأكواد</h3>${codesFilter('الحالة: مستخدم')}</div>` + codesEmptyF, { minH: 420 }))}
${frame2('8d. تعذّر تنزيل الملف', 'رسالة خطأ مع إعادة المحاولة، والصفحة كما هي', shell2('تفاصيل المجموعة', bHeadD('active') + failBanner + statsCard, { minH: 420 }))}
${frame2('8e. جارٍ تحميل المجموعة / مجموعة غير موجودة', 'VOUCHER_BATCH_NOT_FOUND', shell2('تفاصيل المجموعة', detailLoading + '<div style="height:24px"></div>' + notFound, { minH: 420 }))}
</div></body></html>`;
fs.writeFileSync(path.join(dir, 'desktop.html'), desktop);

// ---------- MOBILE ----------
const mtop = t => `<header class="mtop"><button class="mic" aria-label="فتح القائمة" style="border:0;background:none">${$('menu', 24)}</button><h1>${t}</h1></header>`;
const mf = (tag, inner, extra = '', clip = false) => `<section><div class="tag">${tag}</div><div class="mf"${clip ? ' style="max-height:812px"' : ''}>${inner}${extra}</div></section>`;
const mBar = (sel = 'الحالة: الكل') => `<div class="bar"><a class="btn p fw">${$('plus', 18)}إنشاء مجموعة أكواد</a><div class="sel" role="combobox" aria-label="الحالة"><span>${sel}</span>${$('down', 18)}</div></div>`;
const mCards = B.map(b => `<div class="vc"><div class="r"><a class="lnk" style="font-weight:600">${b[0]}</a>${bBadge(b[6])}</div><div class="r">${kBadge(b[1])}<span style="font-weight:500">${bValue(b)}</span></div>${progress(b[3], b[4])}<div class="r sub"><span>الإجمالي: ${b[5] === '-' ? '-' : money(b[5])}</span><span>ينتهي: ${b[7]}</span></div></div>`).join('');
const mSk = Array.from({ length: 4 }, () => `<div class="vc" role="status" aria-busy="true"><div class="sk" style="width:60%;height:18px"></div><div class="sk" style="width:40%"></div><div class="sk" style="width:80%"></div></div>`).join('');
const mCodeCards = (rows, copied = -1, batchOff = false) => rows.map((c, i) => `<div class="vcc${c[1] === 'off' ? ' rowoff' : ''}"><div style="display:flex;align-items:center;justify-content:space-between"><span class="code">${c[0]}</span>${copyBtn(i === copied)}</div><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${batchOff && c[1] === 'unused' ? '<span class="badge b-n">' + $('dot', 14) + 'غير مستخدم</span>' : cBadge(c[1])}${c[2] ? `<span class="sub">${c[2]}</span>` : ''}</div>${c[3] ? `<a class="lnk ltr" style="overflow-wrap:anywhere">${c[3]}</a>` : ''}${c[1] === 'unused' && !batchOff ? `<a class="btn d" style="width:100%">${$('stop', 18)}إيقاف الكود</a>` : ''}${c[1] === 'off' && !batchOff ? `<a class="btn" style="width:100%">${$('check', 18)}تفعيل الكود</a>` : ''}</div>`).join('');
const mCodesSec = (inner, count = '18 / 50') => `<div class="sec" style="margin-block-start:24px"><h3>الأكواد <span class="sub" style="font-weight:400">(${bdiN(count)} مستخدم)</span></h3></div><div style="margin-block-end:12px"><div class="sel" style="width:100%" role="combobox" aria-label="الحالة"><span>الحالة: الكل</span>${$('down', 18)}</div></div>${inner}`;
const mCodesOk = (rows = C, copied = -1, batchOff = false) => `<div class="card" style="overflow:hidden">${mCodeCards(rows, copied, batchOff)}<div class="more"><a class="btn sm">تحميل المزيد</a></div></div>`;
const mHead = (state, o = {}) => `<div class="crumb"><span>مجموعات الأكواد</span></div><div class="hd"><div class="t"><h2>${o.name || BN}</h2></div><div class="t">${bBadge(state)}${kBadge('b')}</div><div class="acts">${o.created ? '' : dlBtn}${o.off ? '<a class="btn">تفعيل المجموعة</a>' : `<a class="btn d">${$('stop', 18)}إيقاف المجموعة</a>`}</div></div>`;
const mDetail = (o = {}) => `${mHead(o.state || 'active', o)}${statsCard}${mCodesSec(mCodesOk(C, o.copied ?? -1))}<div class="cols" style="margin-block-start:24px">${summaryD}${settingsD()}</div>`;
const mTop = () => `${mHead('active')}${statsCard}`;
const mSheetCsv = sheet('تنزيل ملف الأكواد', `المجموعة: ${BN}`, `<div class="alert al-w" style="margin-block-end:12px" role="note">${$('warn')}<div class="sp body"><b>الملف يحتوي أكواد صالحة للاستخدام</b>شاركه مع الموزّع المقصود فقط. من يملك الكود يستطيع استخدامه.</div></div><p class="sub" style="margin-block-end:8px">لا يحتوي الملف على بيانات المستخدمين. يُسجَّل كل تنزيل في سجل التدقيق.</p>`, `<a class="btn p">${$('dl', 18)}تنزيل الملف</a><a class="btn">إلغاء</a>`);
const mSheetCode = sheet('إيقاف الكود', `الكود: ${code('EID-4TD8-N2WA')}`, `<p class="sub" style="margin-block-end:14px;color:var(--ink)">سيظهر الكود للمستخدمين كأنه غير موجود، وسيبقى متوقفًا حتى لو أعدت تفعيل المجموعة.</p>${reasonF(true)}`, `<a class="btn dp">إيقاف الكود</a><a class="btn">إلغاء</a>`);
const mSheetCodeOn = sheet('تفعيل الكود', `الكود: ${code('EID-R6HC-2YJE')}`, `<p class="sub" style="margin-block-end:14px;color:var(--ink)">سيعمل الكود من جديد ضمن فترته، ما دامت المجموعة فعّالة.</p>${reasonF(false)}`, `<a class="btn p">تفعيل الكود</a><a class="btn">إلغاء</a>`);
const mSheetBatch = sheet('إيقاف المجموعة', `المجموعة: ${BN}`, `<p class="sub" style="margin-block-end:14px;color:var(--ink)">ستتوقف كل أكواد المجموعة غير المستخدمة. الأكواد التي استُخدمت من قبل لا تتأثر. يمكنك تفعيل المجموعة لاحقًا.</p>${reasonF(false)}`, `<a class="btn dp">إيقاف المجموعة</a><a class="btn">إلغاء</a>`);
const mSheetSave = sheet('حفظ التغييرات', `المجموعة: ${BN}`, `<div class="chg"><div><span class="sub">ينتهي في</span><span>${bdiN('2026-12-31 23:59')} ← بلا نهاية</span></div></div>${reasonF(false)}`, `<a class="btn p">حفظ</a><a class="btn">إلغاء</a>`);

const mobile = `${head('S23 مجموعات الأكواد - جوال')}<body><div class="board" style="width:1640px">
<div><h1 class="bt">S23 · مجموعات الأكواد (لوحة الإدارة) · الجوال 375px</h1><p class="note">الجداول تتحول إلى بطاقات ولا يوجد تمرير أفقي للصفحة. النوافذ تصبح أوراقًا سفلية بأزرار بعرض كامل. بيانات العينة خيالية.</p></div>
<div class="mgrid">
${mf('م1. تبويب المجموعات', mtop('الأكواد') + `<div class="mc">${tabs('b')}${mBar()}<div class="card" style="overflow:hidden">${mCards}<div class="more"><a class="btn sm">تحميل المزيد</a></div></div></div>`)}
${mf('م1b. جارٍ التحميل', mtop('الأكواد') + `<div class="mc">${tabs('b')}${mBar()}<div class="card" style="overflow:hidden">${mSk}</div></div>`)}
${mf('م1c. لا توجد مجموعات بعد', mtop('الأكواد') + `<div class="mc">${tabs('b')}${mBar()}${bEmpty}</div>`)}
${mf('م1d. تعذّر التحميل', mtop('الأكواد') + `<div class="mc">${tabs('b')}${mBar()}${bError}</div>`)}
${mf('م2a. إنشاء · رصيد', mtop('إنشاء مجموعة أكواد') + `<div class="mc">${createBatch({ prefix: 'eid', qty: 50, amount: '5.00', newOnly: true, end: '2026-12-31 23:59' })}</div>`)}
${mf('م2b. إنشاء · الافتراضي', mtop('إنشاء مجموعة أكواد') + `<div class="mc">${createBatch({ name: 'موزّع الرياض - الدفعة 2', qty: 10 })}</div>`)}
${mf('م2c. تجربة', mtop('إنشاء مجموعة أكواد') + `<div class="mc">${createBatch({ k: 't', name: 'تجارب المدارس', qty: 30, prefix: 'EDU' })}</div>`)}
${mf('م2d. الإجمالي فوق 10,000$', mtop('إنشاء مجموعة أكواد') + `<div class="mc">${createBatch({ qty: 100, amount: '150.00', over: true, prefix: 'EID', reasonErr: true })}</div>`)}
${mf('م3. أخطاء الحقول وفشل الإنشاء', mtop('إنشاء مجموعة أكواد') + `<div class="mc">${createBatch({ name: '', nameErr: 'اسم المجموعة مطلوب.', qty: 2, qtyErr: 'اكتب عددًا صحيحًا من 3 إلى 100.', prefix: 'E-1', prefixErr: 'من 2 إلى 12 حرفًا إنجليزيًا أو رقمًا فقط.', reasonErr: true, alert: true })}</div>`)}
${mf('م4a. بعد الإنشاء', mtop('تفاصيل المجموعة') + `<div class="mc">${mHead('active', { created: true })}${createdHero}${stats(0, 50, '0.00$', '250.00$')}${mCodesSec(mCodesOk(allUnused(C.slice(0, 4))), '0 / 50')}</div>`)}
${mf('م4b. تفاصيل المجموعة', mtop('تفاصيل المجموعة') + `<div class="mc">${mDetail({ copied: 4 })}</div>`)}
${mf('م4c. المجموعة متوقفة', mtop('تفاصيل المجموعة') + `<div class="mc">${mHead('off', { off: true, name: 'دفعة اختبار' })}${offBanner}${stats(0, 10, '0.00$', '10.00$')}${mCodesSec(mCodesOk(C.slice(1, 5).map(c => [c[0], c[1] === 'off' ? 'off' : 'unused']), -1, true), '0 / 10')}</div>`)}
${mf('م5. تحذير التنزيل', mtop('تفاصيل المجموعة') + `<div class="mc">${mTop()}</div>`, mSheetCsv, true)}
${mf('م6a. إيقاف كود', mtop('تفاصيل المجموعة') + `<div class="mc">${mTop()}${mCodesSec(mCodesOk(C))}</div>`, mSheetCode, true)}
${mf('م6d. تفعيل كود', mtop('تفاصيل المجموعة') + `<div class="mc">${mTop()}${mCodesSec(mCodesOk(C))}</div>`, mSheetCodeOn, true)}
${mf('م6b. إيقاف المجموعة', mtop('تفاصيل المجموعة') + `<div class="mc">${mTop()}</div>`, mSheetBatch, true)}
${mf('م6c. حفظ الإعدادات', mtop('تفاصيل المجموعة') + `<div class="mc">${mTop()}<div style="margin-block-start:16px">${settingsD()}</div></div>`, mSheetSave, true)}
${mf('م7. كود تابع لمجموعة', mtop('تفاصيل الكود') + `<div class="mc">${voucherBatchDetail}</div>`)}
${mf('م8a. جارٍ تحميل الأكواد', mtop('تفاصيل المجموعة') + `<div class="mc">${mTop()}${mCodesSec(`<div class="card" style="overflow:hidden">${mSk}</div>`)}</div>`)}
${mf('م8b. تعذّر تحميل الأكواد', mtop('تفاصيل المجموعة') + `<div class="mc">${mTop()}${mCodesSec(codesErr)}</div>`)}
${mf('م8c. تعذّر تنزيل الملف', mtop('تفاصيل المجموعة') + `<div class="mc">${mHead('active')}${failBanner}${statsCard}</div>`)}
</div></div></body></html>`;
fs.writeFileSync(path.join(dir, 'mobile.html'), mobile);
console.log('ok');
