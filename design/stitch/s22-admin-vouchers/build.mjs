// Generates the hand-built S22 admin vouchers boards. Run: node build.mjs
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
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${css}</style></head>`;

const navItems = [['users', 'المستخدمون'], ['plan', 'الباقات'], ['ticket', 'الأكواد'], ['prov', 'المزوّدون'], ['model', 'النماذج'], ['mode', 'الأوضاع'], ['tag', 'تحديثات الأسعار'], ['set', 'الإعدادات']];
// Sidebar is the FIRST child of the flex row, so it renders on the right in RTL.
const sidebar = () => `<aside><div class="brand"><div class="mono" aria-hidden="true">ل</div><div><b>لمحة AI</b><small>لوحة الإدارة</small></div></div>
<nav aria-label="قائمة الإدارة">${navItems.map(([k, l]) => `<a class="nav${k === 'ticket' ? ' on' : ''}"${k === 'ticket' ? ' aria-current="page"' : ''}>${$(k)}<span>${l}</span></a>`).join('')}</nav>
<div class="foot"><a class="nav"><span class="flip">${$('logout')}</span><span>العودة إلى التطبيق</span></a></div></aside>`;
const shell = (title, body, extra = '', minH = 560) => `<div class="fr"><div class="app" style="min-height:${minH}px">${sidebar()}
<main><header class="top"><h1>${title}</h1><div class="who"><div class="avatar" aria-hidden="true">م</div>${ltr('admin@lam7ai.com')}</div></header>
<div class="content">${body}</div></main></div>${extra}</div>`;
const frame = (tag, note, html) => `<section><div class="tag">${tag}${note ? `<small>${note}</small>` : ''}</div>${html}</section>`;

// ---------- data ----------
const st = {
  active: ['b-ok', 'check', 'فعّال'], off: ['b-n', 'stop', 'متوقف'], ended: ['b-warn', 'clock', 'منتهي'],
  soon: ['b-pro', 'cal', 'لم يبدأ'], used: ['b-warn', 'err', 'مستنفد'],
};
const badge = k => `<span class="badge ${st[k][0]}">${$(st[k][1], 14)}${st[k][2]}</span>`;
const kind = k => k === 'b'
  ? `<span class="badge b-n">${$('wallet', 14)}رصيد</span>`
  : `<span class="badge b-pro">${$('clock', 14)}تجربة</span>`;
const V = [
  ['LAM7A-7KQ2-XH9M', 'b', '5.00$', '3 / 100', '1 نوفمبر 2026', 'بلا نهاية', 'active'],
  ['WELCOME5', 'b', '5.00$', '0 / 500', '1 نوفمبر 2026', '30 نوفمبر 2026', 'active'],
  ['PRO-TRIAL-7', 't', 'احترافي · 7 أيام', '12 / 50', '5 نوفمبر 2026', '31 ديسمبر 2026', 'active'],
  ['RAMADAN27', 'b', '10.00$', '0 / 200', '1 مارس 2027', '30 مارس 2027', 'soon'],
  ['EID-GIFT', 'b', '2.50$', '40 / 100', '1 سبتمبر 2026', '15 أكتوبر 2026', 'ended'],
  ['PARTNER-AL', 't', 'احترافي · 30 يومًا', '20 / 20', '1 أكتوبر 2026', 'بلا نهاية', 'used'],
  ['TEST-OLD', 'b', '1.00$', '2 / 10', '2 أغسطس 2026', 'بلا نهاية', 'off'],
];
const valueOf = v => (v[1] === 'b' ? money(v[2]) : v[2]);
const win = v => `<span class="sub">${v[4]} – ${v[5]}</span>`;

// ---------- list pieces ----------
const filterBar = (sel = 'الحالة: الكل') => `<div class="bar"><div class="sel" role="combobox" aria-label="الحالة"><span>${sel}</span>${$('down', 18)}</div><span class="sp"></span><a class="btn p">${$('plus', 18)}إنشاء كود</a></div>`;
const listRows = V.map(v => `<tr><td><a class="lnk code">${v[0]}</a></td><td>${kind(v[1])}</td><td style="font-weight:500">${valueOf(v)}</td><td>${money(v[3])}</td><td>${win(v)}</td><td>${badge(v[6])}</td><td style="width:44px"><span class="flip" style="color:var(--ink2)">${$('back', 18)}</span></td></tr>`).join('');
const listTable = `<div class="card tw"><table><thead><tr><th>الكود</th><th>النوع</th><th>القيمة</th><th>الاستخدام</th><th>الفترة</th><th>الحالة</th><th><span class="sr" style="position:absolute;width:1px;height:1px;overflow:hidden">فتح</span></th></tr></thead><tbody>${listRows}</tbody></table><div class="more"><a class="btn sm">تحميل المزيد</a></div></div>`;
const skRows = n => Array.from({ length: n }, () => `<tr><td><div class="sk" style="width:130px"></div></td><td><div class="sk" style="width:56px;height:22px;border-radius:9999px"></div></td><td><div class="sk" style="width:80px"></div></td><td><div class="sk" style="width:50px"></div></td><td><div class="sk" style="width:200px"></div></td><td><div class="sk" style="width:64px;height:22px;border-radius:9999px"></div></td><td></td></tr>`).join('');
const loadingTable = `<div class="card tw" role="status" aria-busy="true" aria-label="جارٍ التحميل"><table><thead><tr><th>الكود</th><th>النوع</th><th>القيمة</th><th>الاستخدام</th><th>الفترة</th><th>الحالة</th><th></th></tr></thead><tbody>${skRows(5)}</tbody></table></div>`;
const emptyState = `<div class="card state"><div class="ico">${$('ticket', 26)}</div><h3>لا توجد أكواد بعد</h3><p>أنشئ كودًا لمنح مستخدم رصيدًا أو باقة تجريبية.</p><a class="btn p" style="margin-block-start:8px">${$('plus', 18)}إنشاء كود</a></div>`;
const emptyFiltered = `<div class="card state"><div class="ico">${$('ticket', 26)}</div><h3>لا توجد أكواد متوقفة</h3><p>غيّر الفلتر لعرض باقي الأكواد.</p><a class="btn">عرض الكل</a></div>`;
const errorState = `<div class="card state"><div class="ico" style="background:var(--dan-c);color:var(--dan)">${$('wifi', 26)}</div><h3>تعذّر تحميل الأكواد</h3><p>تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى.</p><a class="btn" style="margin-block-start:8px">${$('refresh', 18)}إعادة المحاولة</a></div>`;

// ---------- create form ----------
const reasonF = err => `<div class="f"><label>السبب <span class="req">*</span></label><div class="in ta ${err ? 'e' : ''}"><span class="ph">يُسجَّل في سجل التدقيق</span></div>${err ? `<div class="err">${$('err', 16)}السبب مطلوب.</div>` : ''}</div>`;
const field = (lbl, inner, { hint, err, req, id } = {}) => `<div class="f"><label>${lbl}${req ? ' <span class="req">*</span>' : ''}</label>${inner}${hint ? `<div class="hint">${hint}</div>` : ''}${err ? `<div class="err">${$('err', 16)}${err}</div>` : ''}</div>`;
const inp = (v, { e, ltr: l, ph, trail } = {}) => `<div class="in ${e ? 'e' : ''}"${l ? ' style="direction:ltr"' : ''}><span class="${ph ? 'ph' : ''}">${v}</span>${trail ? `<span class="ph" style="margin-inline-start:auto">${trail}</span>` : ''}</div>`;
const dt = (v, ph) => `<div class="in" style="direction:ltr;flex:1;min-width:190px"><span class="${ph ? 'ph' : ''}">${v}</span><span style="margin-inline-start:auto;display:flex;color:var(--ink2)">${$('cal', 18)}</span></div>`;
const segF = k => `<div class="f"><span class="lb">نوع الكود <span class="req">*</span></span><div class="seg" role="radiogroup" aria-label="نوع الكود"><div role="radio" aria-checked="${k === 'b'}" class="${k === 'b' ? 'on' : ''}">${$('wallet', 18)}رصيد</div><div role="radio" aria-checked="${k === 't'}" class="${k === 't' ? 'on' : ''}">${$('clock', 18)}تجربة</div></div>
<div class="hint" style="font-size:13px;color:var(--ink2);margin-block-start:4px">${k === 'b' ? 'يضيف مبلغًا إلى رصيد المستخدم، ويحتاج باقة نشطة.' : 'يبدأ باقة لعدد من الأيام ويضيف رصيدها المضمَّن.'}</div></div>`;
const chk = (on, t, h) => `<div class="chk" role="checkbox" aria-checked="${on}"><span class="box ${on ? 'on' : ''}">${on ? $('check', 14) : ''}</span><div><div style="font-weight:500">${t}</div><div class="sub">${h}</div></div></div>`;
const createForm = ({ k, codeErr, planErr, reasonErr, busy }) => {
  const valuePart = k === 'b'
    ? field('المبلغ', inp('5.00', { ltr: true, trail: 'USD' }), { req: true, hint: `أكبر من 0 وحتى ${money('1000.00$')}.` })
    : `<div class="row2">${field('الباقة', `<div class="sel ${planErr ? 'e' : ''}"><span class="${planErr ? '' : 'ph'}">${planErr ? 'احترافي' : 'اختر باقة'}</span>${$('down', 18)}</div>`, { req: true, err: planErr, hint: planErr ? '' : 'الباقات النشطة فقط، دون الباقة الافتراضية.' })}${field('عدد الأيام', inp('7', { ltr: true }), { req: true, hint: 'من 1 إلى 365.' })}</div>`;
  return `<div class="card cp form"><h3>كود جديد</h3>${segF(k)}${valuePart}
${field('عدد مرات الاستخدام', inp('100', { ltr: true }), { req: true, hint: 'يستخدمه كل مستخدم مرة واحدة فقط.' })}
${field('الكود (اختياري)', inp(codeErr ? 'WELCOME5' : 'LAM7A-XXXX-XXXX', { ltr: true, e: codeErr, ph: !codeErr }), { err: codeErr, hint: codeErr ? '' : 'من 4 إلى 40 حرفًا إنجليزيًا أو رقمًا أو شرطة. اتركه فارغًا ليُنشأ كود تلقائيًا.' })}
<div class="row2">${field('يبدأ في', dt('01/12/2026 09:00'), { hint: 'بتوقيت جهازك. الافتراضي: الآن.' })}${field('ينتهي في', dt('dd/mm/yyyy --:--', true), { hint: 'اتركه فارغًا ليبقى الكود بلا نهاية.' })}</div>
${chk(k === 't', 'للمستخدمين الجدد فقط', 'من لم تكن لهم باقة غير الباقة الافتراضية.')}
${field('ملاحظة داخلية', '<div class="in ta"><span class="ph">مثال: حملة، شريك (لا تظهر للمستخدمين)</span></div>', {})}
${reasonF(reasonErr)}
<div class="dact" style="margin-block-start:0"><a class="btn p${busy ? ' off' : ''}">${busy ? 'جارٍ الإنشاء…' : 'إنشاء الكود'}</a><a class="btn">إلغاء</a></div></div>`;
};
const crumbNew = `<div class="crumb"><span>الأكواد</span><span class="flip">${$('back', 14)}</span><span>كود جديد</span></div><div class="hd"><div class="t"><h2>إنشاء كود</h2></div></div>`;

// ---------- created ----------
const created = copied => `<div class="card form hero"><span class="badge b-ok" style="margin-block-end:12px">${$('check', 14)}تم إنشاء الكود</span>
<h3>هذا هو الكود الجديد</h3><p class="sub" style="margin-block-end:18px">انسخه وشاركه مع المستخدمين.</p>
<div class="big" aria-label="الكود">LAM7A-7KQ2-XH9M</div>
<div style="display:flex;justify-content:center;gap:10px;margin-block-start:18px;align-items:center;flex-wrap:wrap">${copied ? `<a class="btn ok" aria-live="polite">${$('check', 18)}تم النسخ</a>` : `<a class="btn p">${$('copy', 18)}نسخ الكود</a>`}</div>
<div class="sub" style="margin-block-start:18px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap">${kind('b')}<span>${money('5.00$')}</span><span>·</span><span>${money('100')} استخدام</span></div>
<div style="display:flex;justify-content:center;gap:10px;margin-block-start:20px;flex-wrap:wrap"><a class="btn">فتح الكود</a><a class="btn">إنشاء كود آخر</a><a class="btn g">العودة إلى القائمة</a></div></div>`;

// ---------- detail ----------
const R = [
  ['sara.alharbi@example.com', '3 نوفمبر 2026 · 10:44', '5.00$', '-'],
  ['khaled.m@example.com', '2 نوفمبر 2026 · 21:05', '5.00$', '-'],
  ['reem.a@example.com', '1 نوفمبر 2026 · 08:20', '5.00$', '-'],
];
const RT = [
  ['omar.f@example.com', '5 نوفمبر 2026 · 12:10', '10.00$', 'sub_41c7'],
  ['lina.s@example.com', '5 نوفمبر 2026 · 09:30', '10.00$', 'sub_3a9e'],
  ['user.deleted@example.com', '4 نوفمبر 2026 · 17:02', '10.00$', 'sub_2b10'],
];
const redRows = rs => rs.map(r => `<tr><td><a class="lnk ltr">${r[0]}</a></td><td class="sub">${r[1]}</td><td>${money(r[2], 'pos')}</td><td>${r[3] === '-' ? '<span class="sub">-</span>' : `<span class="ltr sub">${r[3]}</span>`}</td></tr>`).join('');
const redTable = (rs, used, max) => `<div class="sec" style="margin-block-start:24px"><h3>الاستخدامات <span class="sub" style="font-weight:400">(${money(used + ' / ' + max)})</span></h3></div>
<div class="card tw"><table><thead><tr><th>المستخدم</th><th>تاريخ الاستخدام</th><th>الرصيد المضاف</th><th>الاشتراك</th></tr></thead><tbody>${redRows(rs)}</tbody></table><div class="more"><a class="btn sm">تحميل المزيد</a></div></div>`;
const redEmpty = `<div class="sec" style="margin-block-start:24px"><h3>الاستخدامات</h3></div><div class="card state" style="padding-block:32px"><h3>لم يستخدم أحد هذا الكود بعد</h3><p>ستظهر هنا الحسابات التي استخدمته.</p></div>`;
const detailHead = (c, state, k = 'b') => `<div class="crumb"><span>الأكواد</span><span class="flip">${$('back', 14)}</span>${code(c)}</div>
<div class="hd"><div class="t"><h2 class="code">${c}</h2>${badge(state)}${kind(k)}</div>
${state === 'off' ? `<a class="btn">تفعيل الكود</a>` : `<a class="btn d">${$('stop', 18)}إيقاف الكود</a>`}</div>`;
const summary = (o = {}) => `<div class="card cp"><h3>ملخص الكود</h3><dl class="facts">
<dt>النوع</dt><dd>${kind(o.t ? 't' : 'b')}</dd>
<dt>القيمة</dt><dd>${o.t ? 'احترافي · 30 يومًا' : money('5.00$')}</dd>
${o.t ? '<dt>الباقة</dt><dd>احترافي</dd>' : ''}
<dt>يبدأ في</dt><dd>${o.start || '1 نوفمبر 2026 · 09:00'}</dd>
<dt>للمستخدمين الجدد فقط</dt><dd>${o.newOnly ? 'نعم' : 'لا'}</dd>
<dt>أنشأه</dt><dd>${ltr('admin@lam7ai.com')}</dd>
<dt>تاريخ الإنشاء</dt><dd>${o.created || '1 نوفمبر 2026 · 08:55'}</dd></dl>
<p class="sub" style="margin-block-start:14px">النوع والقيمة والباقة وتاريخ البدء لا تتغير بعد الإنشاء.</p></div>`;
const edit = (o = {}) => `<div class="card cp"><h3>الإعدادات</h3>
<div class="f"><div class="sw"><div><div style="font-weight:500">الكود فعّال</div><div class="sub">عند الإيقاف يظهر للمستخدمين كأنه غير موجود.</div></div><div class="trk ${o.active === false ? '' : 'on'}" role="switch" aria-checked="${o.active !== false}" aria-label="الكود فعّال"></div></div></div>
${field('ينتهي في', `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${dt(o.end || 'dd/mm/yyyy --:--', !o.end).replace('class="in"', 'class="in" ').replace('<div class="in"', '<div class="in" ')}${o.end ? `<a class="btn g sm" style="flex-shrink:0">إزالة التاريخ</a>` : ''}</div>`, { hint: o.end ? '' : 'بلا نهاية.' })}
${field('الحد الأقصى للاستخدام', inp(o.max || '100', { ltr: true, e: !!o.maxErr }), { err: o.maxErr, hint: o.maxErr ? '' : `لا يقل عن عدد الاستخدامات الحالية (${o.used || 3}).` })}
${field('ملاحظة داخلية', `<div class="in ta"><span>${o.note || 'حملة الإطلاق - نوفمبر'}</span></div>`, {})}
<div class="dact" style="margin-block-start:0"><a class="btn p${o.dirty === false ? ' off' : ''}">حفظ التغييرات</a><a class="btn">تراجع</a></div></div>`;
const reasonDlg = (err, wide = true) => `<div class="overlay"><div class="dlg" role="dialog" aria-labelledby="d1"><h3 id="d1">حفظ التغييرات</h3><p class="sub">الكود: ${code('LAM7A-7KQ2-XH9M')}</p>
<div class="chg"><div><span class="sub">الحد الأقصى للاستخدام</span><span>${money('100')} ← ${money('150')}</span></div><div><span class="sub">ينتهي في</span><span>بلا نهاية ← 31 ديسمبر 2026</span></div></div>
${reasonF(err)}<div class="dact"><a class="btn p">حفظ</a><a class="btn">إلغاء</a></div></div></div>`;
const quickDlg = (act) => `<div class="overlay"><div class="dlg" role="dialog"><h3>${act === 'off' ? 'إيقاف الكود' : 'تفعيل الكود'}</h3><p class="sub">${act === 'off' ? 'سيظهر الكود للمستخدمين كأنه غير موجود. يمكنك تفعيله لاحقًا.' : 'سيعمل الكود من جديد ضمن فترته وحدّه.'}</p>${reasonF(false)}<div class="dact"><a class="btn ${act === 'off' ? 'dp' : 'p'}">${act === 'off' ? 'إيقاف الكود' : 'تفعيل الكود'}</a><a class="btn">إلغاء</a></div></div></div>`;
const banner = (kind2) => kind2 === 'off'
  ? `<div class="alert al-n" role="status">${$('stop')}<div class="sp"><b>هذا الكود متوقف</b>يظهر للمستخدمين كأنه غير موجود. فعّله ليعمل من جديد.</div></div>`
  : `<div class="alert al-w" role="status">${$('err')}<div class="sp"><b>تم استخدام الكود بالكامل (${money('20 / 20')})</b>ارفع الحد الأقصى من الإعدادات إذا أردت إتاحته لمزيد من المستخدمين.</div></div>`;
const detailBody = (c, state, o = {}) => `${detailHead(c, state, o.t ? 't' : 'b')}${o.banner ? banner(o.banner) : ''}<div class="cols">${summary(o.sum)}${edit(o.edit)}</div>${o.empty ? redEmpty : redTable(o.rs || R, o.used || 3, o.max || 100)}`;
const detailLoading = `<div class="crumb"><span>الأكواد</span></div><div class="hd"><div class="t"><div class="sk" style="width:240px;height:30px"></div></div></div><div class="cols" role="status" aria-busy="true" aria-label="جارٍ التحميل"><div class="card cp">${'<div class="sk" style="margin-block-end:16px"></div>'.repeat(6)}</div><div class="card cp">${'<div class="sk" style="margin-block-end:16px;height:36px"></div>'.repeat(4)}</div></div>`;
const detailErr = `<div class="crumb"><span>الأكواد</span></div><div class="card state"><div class="ico" style="background:var(--dan-c);color:var(--dan)">${$('err', 26)}</div><h3>تعذّر تحميل الكود</h3><p>لم نتمكن من فتح هذا الكود. جرّب مرة أخرى أو ارجع إلى القائمة.</p><div style="display:flex;gap:10px;margin-block-start:8px"><a class="btn">${$('refresh', 18)}إعادة المحاولة</a><a class="btn g">العودة إلى القائمة</a></div></div>`;

// ---------- DESKTOP ----------
const desktop = `${head('S22 الأكواد - لوحة الإدارة')}<body><div class="board" style="width:1480px">
<div><h1 class="bt">S22 · الأكواد (لوحة الإدارة) · سطح المكتب</h1><p class="note">لوحة توضيحية مرسومة يدويًا من نظام Bayan v2. العناوين والملاحظات الصغيرة شروح وليست جزءًا من الواجهة.</p></div>
${frame('1. القائمة /admin/vouchers', 'كل حالات الشارة: فعّال، لم يبدأ، منتهي، مستنفد، متوقف', shell('الأكواد', filterBar() + listTable))}
${frame('1b. جارٍ التحميل', 'هياكل رمادية، role="status"', shell('الأكواد', filterBar() + loadingTable, '', 420))}
${frame('1c. لا توجد أكواد بعد', '', shell('الأكواد', filterBar() + emptyState, '', 420))}
${frame('1d. فلتر بلا نتائج', 'الفلتر «متوقف»', shell('الأكواد', filterBar('الحالة: متوقف') + emptyFiltered, '', 420))}
${frame('1e. تعذّر التحميل', 'إعادة المحاولة', shell('الأكواد', filterBar() + errorState, '', 420))}
${frame('2a. إنشاء كود · رصيد', 'خطأ على حقل الكود: VOUCHER_CODE_TAKEN، والسبب مطلوب', shell('إنشاء كود', crumbNew + createForm({ k: 'b', codeErr: 'يوجد كود بهذا الاسم بالفعل.', reasonErr: true })))}
${frame('2b. إنشاء كود · تجربة', 'خطأ على حقل الباقة: PLAN_NOT_ACTIVE', shell('إنشاء كود', crumbNew + createForm({ k: 't', planErr: 'الباقة غير نشطة.' })))}
${frame('2c. أثناء الإرسال', 'الزر معطّل ويعرض «جارٍ الإنشاء…»', shell('إنشاء كود', crumbNew + createForm({ k: 'b', busy: true }), '', 420))}
${frame('3a. تم إنشاء الكود', 'الكود المولَّد بحجم كبير وزر النسخ', shell('إنشاء كود', created(false), '', 560))}
${frame('3b. بعد النسخ', 'الزر يتحول إلى «تم النسخ» ويُعلن role="status" لقارئ الشاشة', shell('إنشاء كود', created(true), '', 560))}
${frame('4a. تفاصيل الكود · فعّال', 'ملخص للقراءة فقط + إعدادات قابلة للتعديل + الاستخدامات (رصيد)', shell('تفاصيل الكود', detailBody('LAM7A-7KQ2-XH9M', 'active', { edit: { end: '31/12/2026 23:59' } })))}
${frame('4b. حفظ التغييرات · نافذة السبب', 'السبب مطلوب (خطأ)', shell('تفاصيل الكود', detailBody('LAM7A-7KQ2-XH9M', 'active', { edit: { max: '150', end: '31/12/2026 23:59' } }), reasonDlg(true)))}
${frame('4c. الحد أقل من الاستخدامات', 'تحقق في النموذج قبل الإرسال (والخادم يرفض بـ 400)', shell('تفاصيل الكود', detailBody('LAM7A-7KQ2-XH9M', 'active', { used: 12, edit: { max: '5', used: 12, maxErr: 'لا يمكن أن يكون الحد أقل من عدد الاستخدامات الحالية (12).' }, rs: R, max: 100 })))}
${frame('4d. كود متوقف', 'لافتة + زر «تفعيل الكود» + نافذة التفعيل', shell('تفاصيل الكود', detailBody('TEST-OLD', 'off', { banner: 'off', edit: { active: false, max: '10', used: 2, note: 'اختبار داخلي' }, empty: true }), quickDlg('on')))}
${frame('4e. كود مستنفد (تجربة)', 'لافتة + الاستخدامات مع معرّف الاشتراك المختصر', shell('تفاصيل الكود', detailBody('PARTNER-AL', 'used', { t: true, banner: 'used', sum: { t: true, newOnly: true, start: '1 أكتوبر 2026 · 09:00' }, edit: { max: '20', used: 20, note: 'شريك: مدرسة الأمل' }, rs: RT, used: 20, max: 20 })))}
${frame('4f. إيقاف الكود · نافذة السبب', 'اختصار من زر الرأس', shell('تفاصيل الكود', detailBody('LAM7A-7KQ2-XH9M', 'active', {}), quickDlg('off')))}
${frame('4g. جارٍ التحميل', '', shell('تفاصيل الكود', detailLoading, '', 420))}
${frame('4h. تعذّر التحميل', '', shell('تفاصيل الكود', detailErr, '', 420))}
</div></body></html>`;
fs.writeFileSync(path.join(dir, 'desktop.html'), desktop);

// ---------- MOBILE ----------
const mtop = t => `<header class="mtop"><button class="mic" aria-label="فتح القائمة" style="border:0;background:none">${$('menu', 24)}</button><h1>${t}</h1></header>`;
const mf = (tag, inner, extra = '', short = false) => `<section><div class="tag">${tag}</div><div class="mf${short ? ' short' : ''}">${inner}${extra}</div></section>`;
const mCards = V.map(v => `<div class="vc"><div class="r"><a class="lnk code">${v[0]}</a>${badge(v[6])}</div><div class="r">${kind(v[1])}<span style="font-weight:500">${valueOf(v)}</span></div><div class="r sub"><span>الاستخدام: ${money(v[3])}</span></div><div class="sub">${v[4]} – ${v[5]}</div></div>`).join('');
const mFilter = (sel = 'الحالة: الكل') => `<div class="bar"><a class="btn p fw">${$('plus', 18)}إنشاء كود</a><div class="sel" role="combobox" aria-label="الحالة"><span>${sel}</span>${$('down', 18)}</div></div>`;
const mSkCards = Array.from({ length: 4 }, () => `<div class="vc" role="status" aria-busy="true"><div class="sk" style="width:60%;height:18px"></div><div class="sk" style="width:40%"></div><div class="sk" style="width:80%"></div></div>`).join('');
const mRed = (rs, used, max) => `<div class="sec" style="margin-block-start:24px"><h3>الاستخدامات <span class="sub" style="font-weight:400">(${money(used + ' / ' + max)})</span></h3></div><div class="card" style="overflow:hidden">${rs.map(r => `<div class="vc"><a class="lnk ltr" style="overflow-wrap:anywhere">${r[0]}</a><div class="r"><span class="sub">${r[1]}</span>${money(r[2], 'pos')}</div>${r[3] === '-' ? '' : `<div class="sub">الاشتراك: <span class="ltr">${r[3]}</span></div>`}</div>`).join('')}<div class="more"><a class="btn sm">تحميل المزيد</a></div></div>`;
const drawer = `<div class="overlay" style="background:rgba(15,23,42,.5);display:block;padding:0"><div class="drawer" style="inset-block:0">${sidebar().replace('<aside>', '<div style="display:flex;flex-direction:column;height:100%">').replace('</aside>', '</div>')}</div></div>`;
const mobile = `${head('S22 الأكواد - جوال')}<body><div class="board" style="width:1640px">
<div><h1 class="bt">S22 · الأكواد (لوحة الإدارة) · الجوال 375px</h1><p class="note">الجدول يتحول إلى بطاقات، ولا يوجد تمرير أفقي للصفحة. القائمة الجانبية تفتح من الأيمن (بداية السطر).</p></div>
<div class="mgrid">
${mf('م1. القائمة', mtop('الأكواد') + `<div class="mc">${mFilter()}<div class="card" style="overflow:hidden">${mCards}<div class="more"><a class="btn sm">تحميل المزيد</a></div></div></div>`)}
${mf('م1b. القائمة الجانبية مفتوحة', mtop('الأكواد') + `<div class="mc">${mFilter()}<div class="card" style="overflow:hidden">${mCards.split('<div class="vc">').slice(1, 3).map(x => '<div class="vc">' + x).join('')}</div></div>`, drawer)}
${mf('م1c. جارٍ التحميل', mtop('الأكواد') + `<div class="mc">${mFilter()}<div class="card" style="overflow:hidden">${mSkCards}</div></div>`)}
${mf('م1d. لا توجد أكواد بعد', mtop('الأكواد') + `<div class="mc">${mFilter()}${emptyState}</div>`)}
${mf('م1e. تعذّر التحميل', mtop('الأكواد') + `<div class="mc">${mFilter()}${errorState}</div>`)}
${mf('م2a. إنشاء · رصيد (أخطاء)', mtop('إنشاء كود') + `<div class="mc">${createForm({ k: 'b', codeErr: 'يوجد كود بهذا الاسم بالفعل.', reasonErr: true }).replace('form"', 'form" style="border-radius:16px"')}</div>`)}
${mf('م2b. إنشاء · تجربة (خطأ الباقة)', mtop('إنشاء كود') + `<div class="mc">${createForm({ k: 't', planErr: 'الباقة غير نشطة.' })}</div>`)}
${mf('م3. تم إنشاء الكود / تم النسخ', mtop('إنشاء كود') + `<div class="mc">${created(true)}</div>`)}
${mf('م4a. التفاصيل · فعّال', mtop('تفاصيل الكود') + `<div class="mc">${detailHead('LAM7A-7KQ2-XH9M', 'active')}<div class="cols">${summary()}${edit({ end: '31/12/2026 23:59' })}</div>${mRed(R, 3, 100)}</div>`)}
${mf('م4b. كود متوقف', mtop('تفاصيل الكود') + `<div class="mc">${detailHead('TEST-OLD', 'off')}${banner('off')}${summary({})}</div>`, quickDlgSheet('on'))}
${mf('م4c. كود مستنفد', mtop('تفاصيل الكود') + `<div class="mc">${detailHead('PARTNER-AL', 'used', 't')}${banner('used')}${edit({ max: '20', used: 20, note: 'شريك: مدرسة الأمل' })}</div>`)}
${mf('م4d. حفظ التغييرات · السبب', mtop('تفاصيل الكود') + `<div class="mc">${detailHead('LAM7A-7KQ2-XH9M', 'active')}${edit({ max: '150' })}</div>`, saveSheet())}
</div></div></body></html>`;
function quickDlgSheet(act) {
  return `<div class="overlay" style="display:block;padding:0"><div class="sheet"><h3 style="font-size:20px;font-weight:600;line-height:30px">${act === 'off' ? 'إيقاف الكود' : 'تفعيل الكود'}</h3><p class="sub" style="margin-block-end:14px">سيعمل الكود من جديد ضمن فترته وحدّه.</p>${reasonF(false)}<div class="dact" style="flex-direction:column"><a class="btn p">تفعيل الكود</a><a class="btn">إلغاء</a></div></div></div>`;
}
function saveSheet() {
  return `<div class="overlay" style="display:block;padding:0"><div class="sheet"><h3 style="font-size:20px;font-weight:600;line-height:30px">حفظ التغييرات</h3><p class="sub" style="margin-block-end:12px">الكود: ${code('LAM7A-7KQ2-XH9M')}</p><div class="chg"><div><span class="sub">الحد الأقصى</span><span>${money('100')} ← ${money('150')}</span></div></div>${reasonF(true)}<div class="dact" style="flex-direction:column"><a class="btn p">حفظ</a><a class="btn">إلغاء</a></div></div></div>`;
}
fs.writeFileSync(path.join(dir, 'mobile.html'), mobile);
console.log('ok');
