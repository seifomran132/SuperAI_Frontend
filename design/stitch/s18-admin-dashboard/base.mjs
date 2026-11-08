// Verbatim copy of the f4a-admin head, tokens, icons and helpers (lines 1-118 of ../f4a-admin/build.mjs).
import fs from 'node:fs';
const css = `
:root{--brand:#1E293B;--bg:#F8FAFC;--surface:#fff;--muted-s:#F1F5F9;--ink:#0F172A;--ink2:#475569;--bs:#E2E8F0;--bc:#8B95A7;--ok:#15803D;--ok-c:#F0FDF4;--warn:#B45309;--warn-c:#FFFBEB;--warn-b:#FDE68A;--dan:#BE123C;--dan-c:#FFF1F2;--dan-b:#FECDD3;--pro:#4F46E5;--pro-c:#EEF2FF;--pro-b:#C7D2FE}
*{box-sizing:border-box;margin:0;letter-spacing:normal;font-style:normal}
body{font-family:'IBM Plex Sans Arabic',sans-serif;background:var(--bg);color:var(--ink);font-size:14px;line-height:22px;-webkit-font-smoothing:antialiased}
.app{display:flex;min-height:100vh}
aside{width:260px;background:var(--surface);border-inline-end:1px solid var(--bs);display:flex;flex-direction:column;flex-shrink:0;position:sticky;top:0;height:100vh}
.brand{display:flex;align-items:center;gap:12px;padding:16px;height:64px;border-block-end:1px solid var(--bs)}
.mono{width:36px;height:36px;border-radius:10px;background:var(--brand);color:#fff;display:grid;place-items:center;font-weight:700;font-size:18px}
.brand b{font-size:16px;font-weight:600;line-height:20px}.brand small{display:block;font-size:13px;color:var(--ink2);font-weight:400}
nav{padding:16px 12px;flex:1;display:flex;flex-direction:column;gap:4px}
.nav{display:flex;align-items:center;gap:12px;height:44px;padding-inline:12px;border-radius:8px;color:var(--ink2);font-weight:500;position:relative}
.nav.on{background:var(--muted-s);color:var(--ink);font-weight:600}
.nav.on::after{content:"";position:absolute;inset-inline-end:-12px;top:8px;bottom:8px;width:3px;background:var(--brand);border-radius:2px}
.foot{padding:12px;border-block-start:1px solid var(--bs)}
main{flex:1;min-width:0}
.top{height:64px;background:var(--surface);border-block-end:1px solid var(--bs);display:flex;align-items:center;justify-content:space-between;padding-inline:32px}
.top h1{font-size:20px;font-weight:600;line-height:30px}
.avatar{width:36px;height:36px;border-radius:50%;background:var(--brand);color:#fff;display:grid;place-items:center;font-size:13px;font-weight:600}
.who{display:flex;align-items:center;gap:10px;color:var(--ink2)}
.content{padding:24px 32px}
.bar{display:flex;gap:12px;align-items:center;margin-block-end:16px}
.in,.sel{height:44px;border:1px solid var(--bc);border-radius:8px;background:#fff;padding-inline:12px;display:flex;align-items:center;gap:8px;color:var(--ink);font-size:14px}
.in.grow{flex:1;max-width:420px}.ph{color:var(--ink2)}
.sel{min-width:150px;justify-content:space-between}
.btn{height:44px;padding-inline:18px;border-radius:8px;font-weight:600;font-size:14px;display:inline-flex;align-items:center;gap:8px;border:1px solid var(--bc);background:#fff;color:var(--ink);white-space:nowrap}
.btn.p{background:var(--brand);border-color:var(--brand);color:#fff}
.btn.d{color:var(--dan);border-color:var(--dan-b);background:#fff}.btn.dp{background:var(--dan);border-color:var(--dan);color:#fff}
.btn.sm{height:36px;padding-inline:12px}
.card{background:#fff;border:1px solid var(--bs);border-radius:16px}
table{width:100%;border-collapse:collapse}
th{background:var(--muted-s);color:var(--ink2);font-weight:600;font-size:13px;text-align:start;padding:10px 16px;line-height:20px}
td{padding:10px 16px;border-block-start:1px solid var(--bs);vertical-align:middle;font-size:14px}
.tw{overflow:visible}.tw table{border-radius:16px}
.tw th:first-child{border-start-start-radius:15px}.tw th:last-child{border-start-end-radius:15px}
.ltr{direction:ltr;unicode-bidi:isolate;display:inline-block}
.badge{display:inline-flex;align-items:center;gap:4px;border-radius:9999px;padding:1px 10px;font-size:13px;font-weight:500;line-height:20px;border:1px solid}
.b-ok{color:var(--ok);background:var(--ok-c);border-color:#BBF7D0}.b-warn{color:var(--warn);background:var(--warn-c);border-color:var(--warn-b)}
.b-dan{color:var(--dan);background:var(--dan-c);border-color:var(--dan-b)}.b-pro{color:var(--pro);background:var(--pro-c);border-color:var(--pro-b)}
.b-n{color:var(--ink2);background:var(--muted-s);border-color:var(--bs)}
.sub{color:var(--ink2);font-size:13px}
.pos{color:var(--ok);font-weight:600}.neg{color:var(--ink);font-weight:600}
.pager{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-block-start:1px solid var(--bs);color:var(--ink2)}
.pg{display:flex;gap:8px;align-items:center}
.ib{width:44px;height:36px;border:1px solid var(--bc);border-radius:8px;display:grid;place-items:center;background:#fff;color:var(--ink)}
.ib.off{opacity:.45}
.kebab{width:36px;height:36px;border-radius:8px;display:grid;place-items:center;color:var(--ink2);position:relative}
.menu{position:absolute;inset-inline-end:0;top:34px;width:180px;background:#fff;border:1px solid var(--bs);border-radius:12px;box-shadow:0 8px 24px rgba(15,23,42,.1);padding:6px;z-index:5;color:var(--ink)}
.menu div{height:40px;display:flex;align-items:center;gap:10px;padding-inline:10px;border-radius:8px;font-weight:500}.menu div:first-child{background:var(--muted-s)}
.hd{display:flex;align-items:center;margin-block-end:16px}
.hd .t{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.hd h2{font-size:24px;font-weight:600;line-height:36px}
.crumb{color:var(--ink2);font-size:13px;margin-block-end:8px;display:flex;gap:6px;align-items:center}
.tabs{display:flex;gap:4px;border-block-end:1px solid var(--bs);margin-block-end:20px}
.tab{padding:10px 18px;color:var(--ink2);font-weight:500;border-block-end:3px solid transparent;margin-block-end:-1px}
.tab.on{color:var(--ink);font-weight:600;border-color:var(--brand)}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-block-end:20px}
.stat{padding:16px 20px}.stat .v{font-size:28px;font-weight:700;line-height:40px}.stat.big{border-color:var(--brand)}
.sec{display:flex;justify-content:space-between;align-items:center;margin-block-end:12px}.sec h3{font-size:18px;font-weight:600;line-height:30px}
.more{display:flex;justify-content:center;padding:14px;border-block-start:1px solid var(--bs)}
.facts{display:grid;grid-template-columns:140px 1fr;row-gap:10px;padding:0 20px 16px}.facts dt{color:var(--ink2)}.facts dd{font-weight:500}
.cp{padding:20px}.cp h3{font-size:18px;font-weight:600;line-height:30px;margin-block-end:12px}
.act{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:14px 0;border-block-start:1px solid var(--bs)}
.act p{color:var(--ink2);font-size:13px}.act b{font-weight:600}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}
.plan{background:var(--muted-s);border-radius:12px;padding:14px 16px;margin-block-end:14px}
.dlgs{display:grid;grid-template-columns:1fr 1fr;gap:32px;padding:32px;background:#CBD5E1;min-height:100vh;align-items:start}
.dlg{background:#fff;border-radius:24px;padding:24px;box-shadow:0 12px 40px rgba(15,23,42,.25)}
.dlg h3{font-size:20px;font-weight:600;line-height:30px;margin-block-end:4px}.dlg>.sub{margin-block-end:16px}
.f{margin-block-end:14px}.f label{display:block;font-weight:500;margin-block-end:6px}.f .req{color:var(--dan)}
.f .in,.f .sel{width:100%}.f .hint{font-size:13px;color:var(--ink2);margin-block-start:4px}
.f .err{font-size:13px;color:var(--dan);margin-block-start:4px;display:flex;gap:4px;align-items:center}
.in.e{border-color:var(--dan);border-width:2px}
.ta{height:84px;align-items:flex-start;padding-block:10px;width:100%}
.alert{display:flex;gap:10px;align-items:flex-start;border-radius:12px;padding:12px 14px;font-size:14px;margin-block-end:14px;border:1px solid}
.al-d{background:var(--dan-c);border-color:var(--dan-b);color:var(--dan)}.al-w{background:var(--warn-c);border-color:var(--warn-b);color:var(--warn)}
.alert b{font-weight:600;display:block}
.dact{display:flex;gap:10px;margin-block-start:8px}
.tag{font-size:13px;color:var(--ink2);margin-block-end:10px;font-weight:600}
.flip{display:flex;transform:scaleX(-1)}
`;
const I = (d, s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ic = {
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  plan: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  prov: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  model: '<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 22V12M3 7l9 5 9-5"/>',
  mode: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  set: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  back: '<path d="M9 18l6-6-6-6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  dots: '<circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/>',
  open: '<path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  wallet: '<path d="M20 7H5a2 2 0 0 1 0-4h13v4zM3 5v14a2 2 0 0 0 2 2h15V7"/><circle cx="16" cy="14" r="1"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  warn: '<path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
  err: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  stop: '<circle cx="12" cy="12" r="10"/><path d="M4.9 4.9l14.2 14.2"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
};
const $ = (k, s) => I(ic[k], s);
const money = (v, c = '') => `<bdi dir="ltr" class="${c}">${v}</bdi>`;
const em = e => `<span class="ltr">${e}</span>`;
const head = t => `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>${t}</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${css}</style></head>`;
const nav = [['users', 'المستخدمون'], ['plan', 'الباقات'], ['prov', 'المزوّدون'], ['model', 'النماذج'], ['mode', 'الأوضاع'], ['set', 'الإعدادات']];
const shell = (title, body) => `${head(title + ' - لوحة الإدارة')}<body><div class="app">
<aside><div class="brand"><div class="mono">ب</div><div><b>بيان</b><small>لوحة الإدارة</small></div></div>
<nav aria-label="الإدارة">${nav.map(([k, l], i) => `<a class="nav${i === 0 ? ' on' : ''}">${$(k)}<span>${l}</span></a>`).join('')}</nav>
<div class="foot"><a class="nav"><span class="flip">${$('logout')}</span><span>العودة إلى التطبيق</span></a></div></aside>
<main><header class="top"><h1>${title}</h1><div class="who"><div class="avatar">م</div><span class="ltr">admin@bayan.com</span></div></header>
<div class="content">${body}</div></main></div></body></html>`;

export { fs, css, I, ic, $, money, em, head, nav, shell };
