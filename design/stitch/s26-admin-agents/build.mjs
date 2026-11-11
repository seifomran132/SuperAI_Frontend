// Generates the hand-built S26 admin agents boards (shell, tables, dialogs copied from S22/S23). Run: node build.mjs
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

const navItems = [['users', 'المستخدمون'], ['plan', 'الباقات'], ['ticket', 'الأكواد'], ['prov', 'المزوّدون'], ['model', 'النماذج'], ['mode', 'الأوضاع'], ['bot', 'المساعدون'], ['tag', 'تحديثات الأسعار'], ['set', 'الإعدادات']];
// Sidebar is the FIRST child of the flex row, so it renders on the right in RTL.
const sidebar = () => `<aside><div class="brand"><div class="mono" aria-hidden="true">ل</div><div><b>لمحة AI</b><small>لوحة الإدارة</small></div></div>
<nav aria-label="قائمة الإدارة">${navItems.map(([k, l]) => `<a class="nav${k === 'bot' ? ' on' : ''}"${k === 'bot' ? ' aria-current="page"' : ''}>${$(k)}<span>${l}</span></a>`).join('')}</nav>
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
${modelsBlock(o)}
<div class="grp">التأكيد</div>
${reasonF(!!e.reason)}`;
};
const dlgActions = o => `<a class="btn p${o.busy ? ' off' : ''}"${o.busy ? ' aria-disabled="true" aria-busy="true"' : ''}>${o.busy ? 'جارٍ الحفظ…' : 'حفظ التغييرات'}</a><a class="btn">إلغاء</a>`;
const dlgHeader = `<div class="hd2"><div><h3 id="dlg-t">تعديل المساعد</h3><p class="sub" style="margin:0">${AG.ar} · ${keyLtr(AG.key)}</p></div><span class="x" role="button" aria-label="إغلاق">${$('x', 20)}</span></div>`;
const agentDlg = o => `<div class="overlay" style="align-items:start"><div class="dlg w" role="dialog" aria-modal="true" aria-labelledby="dlg-t">${dlgHeader}${agentFields(o)}<div class="dact">${dlgActions(o)}</div></div></div>`;
const listBg = rows => aIntro + aTable(rows);
const D = (tag, note, rows, o, minH = 1200) => frame2(tag, note, shell2('المساعدون', listBg(rows), { minH, extra: o ? agentDlg(o) : '' }));

// ---------- DESKTOP ----------
const errs = { ar: 'الاسم بالعربية مطلوب', order: 'أدخل عددًا صحيحًا من 0 إلى 1000', reason: true };
const desktop = `${head3('S26 المساعدون - لوحة الإدارة')}<body><div class="board" style="width:1480px">
<div><h1 class="bt">S26 · المساعدون (لوحة الإدارة) · سطح المكتب</h1><p class="note">لوحة توضيحية مرسومة يدويًا من نظام Bayan v2، بنفس غلاف S22 وS23. العناوين والملاحظات الصغيرة شروح وليست جزءًا من الواجهة. بيانات العينة خيالية. في التطبيق تُمرَّر النافذة داخليًا بحد أقصى 90% من ارتفاع الشاشة وتبقى أزرارها ثابتة، وهنا تُرسم كاملة.</p></div>
${D('1a. القائمة /admin/agents', 'الحالة اليوم: مساعد واحد متوقف وبلا باقات', [rowOff], null, 420)}
${D('1b. القائمة · مفعّل لعدة باقات', 'أول 3 باقات ثم «+1»', [rowOn], null, 420)}
${D('1c. القائمة · مفعّل بلا باقات', 'تنبيه في الصف: لا أحد يراه', [rowOnNone], null, 420)}
${frame2('1d. بعد الحفظ', 'إشعار «تم حفظ التغييرات» وتحديث الصف', shell2('المساعدون', listBg([rowSaved]), { minH: 420, extra: toastSaved }))}
${frame2('1e. جارٍ التحميل', '', shell2('المساعدون', aIntro + aLoading, { minH: 420 }))}
${frame2('1f. قائمة فارغة', '', shell2('المساعدون', aIntro + aEmpty, { minH: 420 }))}
${frame2('1g. تعذّر التحميل', '', shell2('المساعدون', aIntro + aError, { minH: 420 }))}
${D('1h. القائمة · مفعّل وغير جاهز', 'شارتا الحالة: مفعّل + غير جاهز (ينقصه نموذج)', [rowOnNR], null, 420)}
${D('2a. نافذة التعديل · الحالة الحالية', 'متوقف وبلا باقات وبلا نماذج (غير جاهز، بلا تحذير لأنه متوقف)', [rowOff], { on: false, sel: [], models: 'none' }, 1999)}
${D('2b. التفعيل بلا باقات', 'تحذير: لا أحد سيراه. الحفظ ممكن', [rowOff], { on: true, sel: [] }, 2059)}
${D('2c. مفعّل لباقتين', 'الاختيار هو ما يُرسل في planKeys', [rowOn], { on: true, sel: ['b', 'p'] }, 1977)}
${D('2d. أخطاء الحقول', 'الاسم العربي، الترتيب، والسبب', [rowOff], { on: true, sel: ['p'], errs: { ...errs, margin: 'أدخل نسبة بين 0 و 500' }, noModelErr: true, models: 'noCheck' }, 2155)}
${D('2e. أثناء الحفظ', 'الزر معطّل ويعرض «جارٍ الحفظ…»', [rowOff], { on: true, sel: ['b', 'p'], busy: true }, 1977)}
${D('2f. AGENT_NOT_FOUND', '404: المساعد لم يعد موجودًا', [rowOff], { on: true, sel: ['p'], alert: 'agent' }, 2063)}
${D('2g. PLAN_NOT_FOUND', '404: باقة مختارة لم تعد موجودة', [rowOff], { on: true, sel: ['p'], alert: 'plan' }, 2085)}
${D('2h. جارٍ تحميل الباقات', 'الباقات تُجلب من قائمة الباقات', [rowOn], { on: true, plansState: 'loading' }, 1977)}
${D('2i. تعذّر تحميل الباقات', 'لا تُرسل planKeys عند الحفظ، وباقي الحقول تُحفظ', [rowOn], { on: true, plansState: 'error' }, 1827)}
${D('3a. النماذج والتكلفة · جاهز', 'النماذج الثلاثة محددة، عدد التصاميم 2، الهامش فارغ (هامش النماذج)', [rowOn], { on: true, sel: ['b', 'p'], models: 'ready' }, 1977)}
${D('3b. النماذج والتكلفة · غير جاهز', 'نموذج الفحص ناقص: السبب مكتوب. المساعد متوقف فلا تحذير في الأعلى', [rowOff], { on: false, sel: ['p'], models: 'noCheck' }, 1999)}
${D('3c. التفعيل وهو غير جاهز', 'تحذير تحت المفتاح. الحفظ ممكن', [rowOff], { on: true, sel: ['p'], models: 'noCheck' }, 2103)}
${D('2j. فشل عام', 'خطأ شبكة أو خادم: رسالة عامة، والنموذج يحتفظ بما كُتب', [rowOff], { on: true, sel: ['b'], alert: 'fail' }, 2063)}
</div></body></html>`;
fs.writeFileSync(path.join(dir, 'desktop.html'), desktop);

// ---------- MOBILE ----------
const mtop = t => `<header class="mtop"><button class="mic" aria-label="فتح القائمة" style="border:0;background:none">${$('menu', 24)}</button><h1>${t}</h1></header>`;
const mf = (tag, inner, extra = '') => `<section><div class="tag">${tag}</div><div class="mf" style="height:812px">${inner}${extra}</div></section>`;
const mCard = a => `<div class="vc"><div class="r"><div class="ac"><a class="lnk nm1">${a.ar}</a><span class="en" lang="en">${a.en}</span></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">${stBadge(a.on)}${readyBadge(a.ready)}</div></div><div class="r">${keyLtr(a.key)}<span class="sub">الترتيب: ${bdiN(a.order)}</span></div>${chipsOf(a.plans, a.on)}<div class="sub">آخر تحديث: ${dateB(a.upd)}</div>${editBtn(a, true)}</div>`;
const mList = rows => `<div class="mc"><p class="sub" style="font-size:14px;margin-block-end:16px">${INTRO}</p><div class="card" style="overflow:hidden">${rows.map(mCard).join('')}</div></div>`;
const mSkC = `<div class="vc" role="status" aria-busy="true" aria-label="جارٍ التحميل"><div class="sk" style="width:60%;height:18px"></div><div class="sk" style="width:40%"></div><div class="sk" style="width:80%"></div></div>`;
// bottom sheet: pinned header and footer, scrolling body (the negative offset simulates scroll)
const SLICE = { models: 'النماذج والتكلفة' };
const msheet = (o, scroll = 0) => scroll === "end" ? msheetEnd(o) : msheetN(o, scroll);
const msheetEnd = o => msheetN(o, 0).replace(/<div class="sb"><div style="[^"]*">/, `<div class="sb"><div style="position:absolute;inset-inline:20px;inset-block-end:0">`);
const sliceAt = (html, g) => { const i = html.indexOf('<div class="grp">' + SLICE[g] + '</div>'); return html.slice(i).replace('<div class="grp">', '<div class="grp first">'); };
const msheetN = (o, scroll = 0) => `<div class="scrim"></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="dlg-t"><div class="grab" aria-hidden="true"></div><div class="sh"><div><h3 id="dlg-t">تعديل المساعد</h3><p class="sub" style="margin:0">${AG.ar} · ${keyLtr(AG.key)}</p></div><span class="x" role="button" aria-label="إغلاق">${$('x', 20)}</span></div><div class="sb"><div style="margin-block-start:-${scroll}px">${o.slice ? sliceAt(agentFields({ ...o, mobile: true }), o.slice) : agentFields({ ...o, mobile: true })}</div></div><div class="sf">${dlgActions(o)}</div></div>`;
const mDrawer = `<div class="scrim"></div><div class="drawer" role="dialog" aria-label="القائمة"><div class="brand"><div class="mono" aria-hidden="true">ل</div><div><b>لمحة AI</b><small>لوحة الإدارة</small></div></div><nav aria-label="قائمة الإدارة">${navItems.map(([k, l]) => `<a class="nav${k === 'bot' ? ' on' : ''}"${k === 'bot' ? ' aria-current="page"' : ''}>${$(k)}<span>${l}</span></a>`).join('')}</nav><div class="foot"><a class="nav"><span class="flip">${$('logout')}</span><span>العودة إلى التطبيق</span></a></div></div>`;
const mobile = `${head3('S26 المساعدون - جوال')}<body><div class="board" style="width:1640px">
<div><h1 class="bt">S26 · المساعدون (لوحة الإدارة) · الجوال 375px</h1><p class="note">الجدول يتحول إلى بطاقات ولا يوجد تمرير أفقي للصفحة. النافذة تصبح ورقة سفلية: رأسها وأزرارها ثابتة والمحتوى يُمرَّر. «أعلى» و«أسفل» لقطتان من الورقة نفسها قبل التمرير وبعده.</p></div>
<div class="mgrid">
${mf('م1a. القائمة', mtop('المساعدون') + mList([rowOff]))}
${mf('م1b. مفعّل لعدة باقات', mtop('المساعدون') + mList([rowOn]))}
${mf('م1c. مفعّل بلا باقات', mtop('المساعدون') + mList([rowOnNone]))}
${mf('م1d. القائمة الجانبية', mtop('المساعدون') + mList([rowOff]), mDrawer)}
${mf('م1e. جارٍ التحميل', mtop('المساعدون') + `<div class="mc"><div class="card" style="overflow:hidden">${mSkC}${mSkC}</div></div>`)}
${mf('م1f. قائمة فارغة', mtop('المساعدون') + `<div class="mc">${aEmpty}</div>`)}
${mf('م1g. تعذّر التحميل', mtop('المساعدون') + `<div class="mc">${aError}</div>`)}
${mf('م1h. بعد الحفظ', mtop('المساعدون') + mList([rowSaved]), `<div class="toast" style="inset-inline:16px;inset-block-end:16px" role="status">${$('check', 18)}تم حفظ التغييرات</div>`)}
${mf('م2a. الورقة · أعلى', mtop('المساعدون') + mList([rowOff]), msheet({ on: false, sel: [] }))}
${mf('م2b. الورقة · أسفل', mtop('المساعدون') + mList([rowOff]), msheet({ on: false, sel: [] }, "end"))}
${mf('م2c. التفعيل بلا باقات · أسفل', mtop('المساعدون') + mList([rowOff]), msheet({ on: true, sel: [] }, 760))}
${mf('م2d. مفعّل لباقتين · أسفل', mtop('المساعدون') + mList([rowOn]), msheet({ on: true, sel: ['b', 'p'] }, "end"))}
${mf('م2e. أخطاء الحقول · أعلى', mtop('المساعدون') + mList([rowOff]), msheet({ on: true, sel: ['p'], errs }, 100))}
${mf('م2f. أخطاء الحقول · أسفل', mtop('المساعدون') + mList([rowOff]), msheet({ on: true, sel: ['p'], errs }, "end"))}
${mf('م2g. أثناء الحفظ', mtop('المساعدون') + mList([rowOff]), msheet({ on: true, sel: ['b', 'p'], busy: true }, "end"))}
${mf('م2h. AGENT_NOT_FOUND', mtop('المساعدون') + mList([rowOff]), msheet({ on: true, sel: ['p'], alert: 'agent' }))}
${mf('م2i. PLAN_NOT_FOUND', mtop('المساعدون') + mList([rowOff]), msheet({ on: true, sel: ['p'], alert: 'plan' }))}
${mf('م2j. تعذّر تحميل الباقات', mtop('المساعدون') + mList([rowOn]), msheet({ on: true, plansState: 'error' }, 560))}
${mf('م3a. النماذج · جاهز', mtop('المساعدون') + mList([rowOn]), msheet({ on: true, sel: ['b', 'p'], models: 'ready', slice: 'models' }))}
${mf('م3b. النماذج · غير جاهز', mtop('المساعدون') + mList([rowOff]), msheet({ on: false, sel: ['p'], models: 'noCheck', slice: 'models' }))}
${mf('م3c. التفعيل وهو غير جاهز · أعلى', mtop('المساعدون') + mList([rowOff]), msheet({ on: true, sel: ['p'], models: 'noCheck' }))}
${mf('م3d. القائمة · مفعّل وغير جاهز', mtop('المساعدون') + mList([rowOnNR]))}
${mf('م2k. فشل عام', mtop('المساعدون') + mList([rowOff]), msheet({ on: true, sel: ['b'], alert: 'fail' }))}
</div></div></body></html>`;
fs.writeFileSync(path.join(dir, 'mobile.html'), mobile);
console.log('ok');
