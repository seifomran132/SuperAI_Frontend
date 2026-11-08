// Hand-built S19 board (admin user Usage tab, flagged requests, audit log). Run: node build.mjs && node render.mjs
// Tokens, icons and base components come verbatim from base.mjs (copied from ../s16-catalog-sync/base.mjs <- ../f4a-admin/build.mjs).
import { fs, css, ic, $, money, em } from './base.mjs';

Object.assign(ic, {
  dash: '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
  flag: '<path d="M4 22V4M4 4h12l-2 4 2 4H4"/>',
  audit: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>',
  chart: '<path d="M3 3v18h18M8 17v-5M13 17V8M18 17v-9"/>',
  tag: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  undo: '<path d="M3 7v6h6M3 13a9 9 0 1 0 3-7.7L3 8"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  refresh: '<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M3 21v-5h5"/>',
  filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  bot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M9 14h.01M15 14h.01"/>',
});

const extra = `
.cnt{margin-inline-start:auto;min-width:24px;height:24px;border-radius:9999px;background:var(--warn);color:#fff;font-size:13px;font-weight:600;display:inline-grid;place-items:center;padding-inline:7px}
.note{border:1.5px dashed var(--pro);background:var(--pro-c);color:var(--pro);border-radius:12px;padding:10px 14px;font-size:13px;line-height:20px}
.note b{font-weight:600}
.board{padding:24px;background:#CBD5E1;display:grid;gap:28px;align-items:start;grid-template-columns:minmax(0,1fr)}
main{min-width:0}
.g2{grid-template-columns:1fr 1fr}
.frame{background:var(--bg);border-radius:16px;overflow:hidden;display:flex}
.frame aside{position:static;height:auto}
.sec-title{font-size:16px;font-weight:700;margin-block-end:8px;color:var(--ink)}
.chip{min-height:44px;padding-inline:16px;border-radius:9999px;border:1px solid var(--bc);background:#fff;display:inline-flex;align-items:center;gap:8px;font-weight:500;color:var(--ink);white-space:nowrap}
.chip.on{background:var(--brand);border-color:var(--brand);color:#fff;font-weight:600}
.chips{display:flex;gap:8px;flex-wrap:wrap}
.pp{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-block-end:6px}
.pp-meta{display:flex;gap:16px;flex-wrap:wrap;color:var(--ink2);font-size:13px;margin-block-end:18px;align-items:center}
.pp-meta span{display:inline-flex;gap:6px;align-items:center}
.custom{display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap;background:#fff;border:1px solid var(--bs);border-radius:12px;padding:14px 16px;margin-block-end:8px}
.custom .f{margin:0}.custom .f .in{width:190px}
.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-block-end:14px}
.kpi{padding:14px 18px}.kpi .l{color:var(--ink2);font-size:13px;display:flex;align-items:center;gap:6px}.kpi .v{font-size:26px;font-weight:700;line-height:38px}
.kpi .h{color:var(--ink2);font-size:12.5px;line-height:18px}
.kpi.warnk{border-color:var(--warn-b);background:var(--warn-c)}.kpi.warnk .l,.kpi.warnk .v{color:var(--warn)}
.kpi.dank{border-color:var(--dan-b);background:var(--dan-c)}.kpi.dank .l{color:var(--dan)}
.negd{color:var(--dan);font-weight:600}
.plus{color:var(--ink)}
.cardhd{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;gap:12px}
.cardhd h3{font-size:17px;font-weight:600;line-height:28px}
.twrap{overflow:hidden;border-radius:16px}
.dense th{padding:10px 12px;font-size:13px}.dense td{padding:10px 12px;font-size:13.5px}
.num{white-space:nowrap}
.tr-end{text-align:end}
.lnk{color:var(--pro);font-weight:600;text-decoration:underline;text-underline-offset:3px}
.sk{height:14px;border-radius:7px;background:var(--bs)}
.state{padding:16px 18px;display:flex;gap:14px;align-items:flex-start}
.state .ico{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;flex-shrink:0}
.state b{font-weight:600;display:block;margin-block-end:2px}.state p{color:var(--ink2);font-size:13px;margin-block-end:8px}
.i-w{background:var(--warn-c);color:var(--warn)}.i-d{background:var(--dan-c);color:var(--dan)}.i-n{background:var(--muted-s);color:var(--ink2)}
.empty{padding:44px 20px;text-align:center;color:var(--ink2)}
.empty .ico{width:48px;height:48px;border-radius:14px;background:var(--muted-s);display:grid;place-items:center;margin:0 auto 10px;color:var(--ink2)}
.empty b{display:block;color:var(--ink);font-weight:600;font-size:16px;margin-block-end:2px}
.info{display:flex;gap:10px;align-items:flex-start;background:#fff;border:1px solid var(--bs);border-radius:12px;padding:12px 14px;color:var(--ink2);margin-block-end:16px}
.info span.t{flex:1}.info b{color:var(--ink);font-weight:600}
.chartwrap{position:relative;padding:0 18px 14px}
.tt{position:absolute;background:var(--ink);color:#fff;border-radius:10px;padding:8px 12px;font-size:13px;line-height:20px;z-index:2;white-space:nowrap}
.tt b{font-weight:600;display:block}
.legend{display:flex;gap:16px;color:var(--ink2);font-size:13px;padding:0 18px 10px;align-items:center}
.legend i{display:inline-block;width:12px;height:12px;border-radius:3px;background:var(--brand);margin-inline-end:6px;vertical-align:-1px}
.seg{display:inline-flex;border:1px solid var(--bc);border-radius:8px;overflow:hidden;background:#fff}
.seg span{min-height:44px;padding-inline:14px;display:inline-flex;align-items:center;font-weight:500;color:var(--ink2)}
.seg span.on{background:var(--muted-s);color:var(--ink);font-weight:600}
.seg span+span{border-inline-start:1px solid var(--bc)}
.ff{display:grid;grid-template-columns:repeat(3,1fr);gap:12px 14px;margin-block-end:12px}
.ff .f{margin:0}.ff .f .in{width:100%}
.ff .f label{font-size:13px;color:var(--ink2);font-weight:500}
.fcard{padding:16px 18px;margin-block-end:16px}
.who2{display:flex;flex-direction:column;gap:2px}.who2 .sid{font-size:12.5px;color:var(--ink2)}
.act-t{direction:ltr;unicode-bidi:isolate;display:inline-block;background:var(--muted-s);border:1px solid var(--bs);border-radius:6px;padding:0 8px;font-size:13px;line-height:22px}
.res{display:flex;flex-direction:column;gap:2px}
.expbtn{width:44px;height:44px;border-radius:8px;display:grid;place-items:center;color:var(--ink2);border:1px solid var(--bc);background:#fff}
.expbtn.open{background:var(--muted-s);color:var(--ink)}
.rowopen td{background:var(--muted-s);border-block-start:1px solid var(--bs)}
.detail{padding:16px 18px;background:#fff;border-block-start:1px solid var(--bs)}
.detail-g{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-block-end:12px}
.cb-h{font-weight:600;font-size:13px;margin-block-end:6px;display:flex;gap:8px;align-items:center}
pre.cb{direction:ltr;text-align:start;unicode-bidi:isolate;margin:0;background:var(--muted-s);border:1px solid var(--bs);border-radius:10px;padding:12px 14px;font-family:'IBM Plex Mono',ui-monospace,Consolas,monospace;font-size:12.5px;line-height:20px;color:var(--ink);overflow:auto;min-height:60px}
.cb-empty{color:var(--ink2);font-size:13px;font-family:'IBM Plex Sans Arabic',sans-serif}
.rsn{color:var(--ink2);font-size:13px}.rsn b{color:var(--ink);font-weight:600}
.menubtn{width:44px;height:44px;border-radius:8px;display:grid;place-items:center}
/* mobile */
.mob{width:375px;background:var(--bg);overflow:hidden;border-radius:16px}
.mob .top{padding-inline:12px 16px;height:56px}.mob .top h1{font-size:17px}
.mob .content{padding:16px}
.mob .crumb{margin-block-end:6px}
.mob .hd h2{font-size:20px;line-height:30px}
.mob .tabs{margin-block-end:14px;gap:0}.mob .tab{padding:10px 12px;white-space:nowrap}
.mob .chips{flex-wrap:nowrap;overflow-x:auto;padding-block-end:4px}
.mob .chip{flex-shrink:0;padding-inline:14px}
.mob .kpis{grid-template-columns:1fr 1fr;gap:10px}
.mob .kpi{padding:12px 14px}.mob .kpi .v{font-size:22px;line-height:32px}
.mob .custom{flex-direction:column;align-items:stretch}.mob .custom .f .in{width:100%}
.mcard{padding:14px 16px;margin-block-end:10px}
.mcard .r{display:flex;justify-content:space-between;align-items:center;gap:8px}
.mcard h4{font-size:15px;font-weight:600}
.mgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px 12px;margin-block-start:10px;font-size:13px}
.mgrid .l{color:var(--ink2);display:block;font-size:12.5px}.mgrid .v{font-weight:600;font-size:14px}
.mob .legend{padding-inline:0}.mob .chartwrap{padding:0 8px 10px}
.mob .ff{grid-template-columns:1fr}
.mob .detail-g{grid-template-columns:1fr}
.mob .seg span{padding-inline:10px}
.sheet{background:#fff;border:1px solid var(--bs);border-radius:16px;padding:14px 16px;margin-block-end:12px}
.mob .state{padding:14px}
.mob .info{padding:10px 12px}
`;
const head = t => `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>${t}</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400&display=swap" rel="stylesheet"><style>${css}${extra}</style></head>`;

// ---------- shell (brand from src/brand/lam7a.ts: monogram «ل», «لمحة AI») ----------
const navItems = [['dash', 'نظرة عامة', 'overview'], ['flag', 'الطلبات المُعلَّمة', 'requests'], ['audit', 'سجل التدقيق', 'audit'], ['users', 'المستخدمون', 'users'], ['plan', 'الباقات', 'plans'], ['prov', 'المزوّدون', 'prov'], ['model', 'النماذج', 'models'], ['mode', 'الأوضاع', 'modes'], ['tag', 'تحديثات الأسعار', 'price'], ['set', 'الإعدادات', 'set']];
const sidebar = active => `<aside><div class="brand"><div class="mono">ل</div><div><b>لمحة AI</b><small>لوحة الإدارة</small></div></div>
<nav aria-label="الإدارة">${navItems.map(([i, l, id]) => `<a class="nav${id === active ? ' on' : ''}"${id === active ? ' aria-current="page"' : ''}>${$(i)}<span>${l}</span></a>`).join('')}</nav>
<div class="foot"><a class="nav"><span class="flip">${$('logout')}</span><span>العودة إلى التطبيق</span></a></div></aside>`;
const topbar = t => `<header class="top"><h1>${t}</h1><div class="who"><div class="avatar">م</div><span class="ltr">admin@lam7ai.com</span></div></header>`;
const frame = (inner, active, title) => `<div class="frame">${sidebar(active)}<main>${topbar(title)}<div class="content">${inner}</div></main></div>`;
const board = (t, inner) => `${head(t)}<body style="background:#CBD5E1"><div class="board">${inner}</div></body></html>`;
const tag = t => `<div class="sec-title">${t}</div>`;
const L = s => `<span class="ltr">${s}</span>`;
const crumb = (...p) => `<div class="crumb">${p.map((x, i) => (i ? `<span class="flip">${$('back', 14)}</span>` : '') + `<span>${x}</span>`).join('')}</div>`;

// ---------- value helpers ----------
const m = v => money(v + '$');
const mneg = v => `<bdi dir="ltr" class="negd">−${v}$</bdi>`; // U+2212, danger colour only for negatives
const dash = '<span aria-label="لا يوجد">—</span>';
const mm = v => (v === null ? dash : m(v));
const num = n => `<bdi dir="ltr">${n}</bdi>`;
const st = {
  reconciliation_required: ['b-warn', 'flag', 'مُعلَّمة'],
  reserved: ['b-n', 'clock', 'محجوزة'],
  settled: ['b-ok', 'check', 'مُسوّاة'],
  released: ['b-n', 'undo', 'مُحرَّرة'],
};
const badge = k => `<span class="badge ${st[k][0]}">${$(st[k][1], 14)}${st[k][2]}</span>`;
const src = s => (s === 'estimated' ? `<span class="badge b-n">${$('info', 14)}تقديري</span>` : `<span class="badge b-n">من المزوّد</span>`);
const tdE = '<td class="num">—</td>';

// ---------- period picker (same as S18) ----------
const presets = [['7', 'آخر 7 أيام'], ['30', 'آخر 30 يومًا'], ['90', 'آخر 90 يومًا'], ['c', 'فترة مخصّصة']];
const picker = (on = '30', range = 'من 8 أكتوبر 2026 إلى 6 نوفمبر 2026', custom = '') => `
<div class="pp"><div class="chips" role="group" aria-label="الفترة">${presets.map(([k, l]) => `<a class="chip${k === on ? ' on' : ''}"${k === on ? ' aria-pressed="true"' : ''}>${k === 'c' ? $('cal', 16) : ''}${l}</a>`).join('')}</div></div>
${custom}
<div class="pp-meta"><span>${$('cal', 16)}${range}</span><span>${$('clock', 16)}الأيام بتوقيت UTC</span></div>`;
const dateIn = (label, v, err) => `<div class="f"><label>${label}</label><div class="in${err ? ' e' : ''}" style="direction:ltr">${v ? `<span>${v}</span>` : '<span class="ph">YYYY-MM-DD</span>'}<span style="margin-inline-start:auto;color:var(--ink2);display:flex">${$('cal', 18)}</span></div>${err ? `<div class="err">${$('err', 16)}${err}</div>` : ''}</div>`;
const customBox = (a, b, errA, errB) => `<div class="custom">${dateIn('من', a, errA)}${dateIn('إلى', b, errB)}<a class="btn p">تطبيق</a></div>`;

// ---------- user header with tabs ----------
const uhead = tab => `${crumb('المستخدمون', 'سارة الحربي')}
<div class="hd"><div class="t"><h2>سارة الحربي</h2>${em('sara.alharbi@example.com')}${badge('settled').replace('b-ok', 'b-ok').replace('مُسوّاة', 'نشط')}<span class="badge b-n">${$('check', 14)}البريد مؤكد</span></div></div>
<div class="tabs" role="tablist">${['نظرة عامة', 'الاشتراك', 'الرصيد', 'الاستهلاك'].map(t => `<div class="tab${t === tab ? ' on' : ''}" role="tab"${t === tab ? ' aria-selected="true"' : ''}>${t}</div>`).join('')}</div>`;

// ---------- data (internally consistent: totals = sum of modes = sum of models) ----------
const totals = { req: 412, flag: 2, inp: '1,284,500', cac: '640,200', out: '356,900', chg: '18.42', cost: '12.44', margin: '5.98', abs: '0.31' };
const byMode = [
  ['سريع', 'fast', 318, 0, '6.12', '3.41', '2.71', '0.00', 0],
  ['احترافي', 'professional', 82, 2, '9.88', '6.19', '3.69', '0.31', 0],
  ['تصميم', 'design', 12, 0, '2.42', '2.84', '0.42', '0.00', 1],
];
const byModel = [
  ['Gemini 2.5 Flash', 'google/gemini-2.5-flash', 318, 0, '6.12', '3.41', '2.71', '0.00', 0],
  ['GPT-4o', 'openai/gpt-4o', 62, 2, '7.81', '5.04', '2.77', '0.31', 0],
  ['GPT-4o mini', 'openai/gpt-4o-mini', 20, 0, '2.07', '1.15', '0.92', '0.00', 0],
  ['Imagen 4', 'google/imagen-4.0', 12, 0, '2.42', '2.84', '0.42', '0.00', 1],
];
const marginCell = (v, neg) => (neg ? mneg(v) : '<span class="plus">' + m('+' + v) + '</span>').replace('+', '+');
const flagCell = n => (n ? `<span class="badge b-warn">${$('flag', 14)}${num(n)}</span>` : '<span class="sub">0</span>');
const breakdown = (rows, firstCol, kind) => `<div class="card twrap"><table class="dense"><thead><tr><th>${firstCol}</th><th>الطلبات</th><th>مُعلَّمة</th><th>المحتسب</th><th>تكلفة المزوّد</th><th>الهامش</th><th>متحمَّلة</th></tr></thead><tbody>${rows.map(r => `<tr><td>${kind === 'mode' ? `<b style="font-weight:600">${r[0]}</b><div class="sub">${L(r[1])}</div>` : `<b style="font-weight:600">${r[0]}</b><div class="sub">${L(r[1])}</div>`}</td><td class="num">${num(r[2])}</td><td>${flagCell(r[3])}</td><td class="num">${m(r[4])}</td><td class="num">${m(r[5])}</td><td class="num">${marginCell(r[6], r[8])}</td><td class="num">${m(r[7])}</td></tr>`).join('')}</tbody></table></div>`;

const kpi = (l, v, h, cls = '', icon = '') => `<div class="card kpi ${cls}"><div class="l">${icon}${l}</div><div class="v">${v}</div>${h ? `<div class="h">${h}</div>` : ''}</div>`;
const kpis = (neg = false) => `<div class="kpis">
${kpi('المحتسب على المستخدم', m(totals.chg), 'ما خُصم من رصيده')}
${kpi('تكلفة المزوّد', m(neg ? '1.20' : totals.cost), 'ما دفعناه للمزوّدين')}
${neg ? kpi('الهامش', mneg('0.42'), 'المحتسب ناقص التكلفة. سالب: التكلفة أعلى من المحتسب', 'dank', $('warn', 16)) : kpi('الهامش', m('+' + totals.margin), 'المحتسب ناقص التكلفة')}
${kpi('الطلبات', num(totals.req), '')}
${kpi('طلبات مُعلَّمة', num(totals.flag), 'تحتاج مطابقة التكلفة', 'warnk', $('flag', 16))}
${kpi('تكلفة متحمَّلة', m(totals.abs), 'تجاوزت المبلغ المحجوز ولم تُحتسب عليه')}
${kpi('رموز الإدخال', num(totals.inp), '')}
${kpi('رموز مخزّنة', num(totals.cac), 'من الإدخال')}
${kpi('رموز الإخراج', num(totals.out), 'تشمل التفكير والصور المُنشأة')}
</div>`;

// ---------- chart (30 bars; first day on the RIGHT, today on the LEFT; Y axis on the right) ----------
const days = 30;
const seed = [0.42, 0.55, 0.38, 0.71, 0.9, 0.35, 0.28, 0.6, 0.77, 0.84, 0.52, 0.47, 0.93, 1.1, 0.66, 0.4, 0.31, 0.58, 0.72, 0.8, 0.95, 0.5, 0.44, 0.69, 0.88, 1.22, 0.76, 0.49, 0.62, 0.34];
const sumSeed = seed.reduce((a, b) => a + b, 0);
const daily = seed.map(v => +(v * 18.42 / sumSeed).toFixed(2));
daily[days - 1] = +(18.42 - daily.slice(0, days - 1).reduce((a, b) => a + b, 0)).toFixed(2);
const dateAt = i => { const d = new Date(Date.UTC(2026, 9, 8 + i)); return d; };
const ar = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const dl = i => `${dateAt(i).getUTCDate()} ${ar[dateAt(i).getUTCMonth()]}`;
const chart = (W, H, labelIdx, pick = 25) => {
  const axisW = 52, padT = 12, padB = 28, plotW = W - axisW, plotH = H - padT - padB;
  const max = 1.5, slot = plotW / days, bw = Math.max(3, slot * 0.62);
  let s = `<svg direction="ltr" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="المبلغ المحتسب يوميًا من 8 أكتوبر إلى 6 نوفمبر 2026. اليوم الأول في اليمين">`;
  [0, 0.5, 1, 1.5].forEach(t => {
    const y = padT + plotH - (t / max) * plotH;
    s += `<line x1="0" x2="${plotW}" y1="${y}" y2="${y}" stroke="#E2E8F0" stroke-width="1"/><text x="${plotW + 8}" y="${y + 4}" font-size="12" fill="#475569" direction="ltr" style="unicode-bidi:isolate">${t === 0 ? '0$' : t + '$'}</text>`;
  });
  daily.forEach((v, i) => {
    const x = plotW - (i + 1) * slot + (slot - bw) / 2; // i = 0 is the first day, drawn at the right edge
    const h = (v / max) * plotH, y = padT + plotH - h;
    s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="2" fill="${i === pick ? '#0F172A' : '#1E293B'}" opacity="${i === pick ? 1 : 0.82}"/>`;
  });
  labelIdx.forEach(i => {
    const cx = plotW - (i + 0.5) * slot;
    const anchor = i === 0 ? 'end' : i === days - 1 ? 'start' : 'middle';
    const x = i === 0 ? plotW - 2 : i === days - 1 ? 2 : cx;
    s += `<text x="${x}" y="${H - 8}" font-size="12" fill="#475569" text-anchor="${anchor}">${dl(i)}</text>`;
  });
  return s + '</svg>';
};
const tipFor = (W, i, topPx) => {
  const slot = (W - 52) / days; const cx = (W - 52) - (i + 0.5) * slot;
  return `<div class="tt" style="top:${topPx}px;inset-inline-start:${Math.round(W - 52 - cx + 18 - 150)}px" role="tooltip"><b>${dl(i)} 2026</b>المحتسب ${money(daily[i] + '$')} <span style="opacity:.8">· <bdi>14</bdi> طلبًا</span></div>`;
};
const seriesSwitch = `<div class="seg" role="group" aria-label="السلسلة"><span class="on" aria-pressed="true">المحتسب</span><span>تكلفة المزوّد</span><span>الطلبات</span></div>`;
const chartCard = (W, mob = false) => `<div class="card" style="margin-block-end:20px"><div class="cardhd"><h3>${mob ? 'الاستهلاك اليومي' : 'الاستهلاك اليومي'}</h3><a class="btn sm" style="height:44px">${$('table', 18)}عرض كجدول</a></div>
${mob ? `<div class="chips" style="padding:0 16px 10px">${['المحتسب', 'تكلفة المزوّد', 'الطلبات'].map((x, i) => `<a class="chip${i === 0 ? ' on' : ''}" style="min-height:44px">${x}</a>`).join('')}</div>` : `<div style="padding:0 18px 10px">${seriesSwitch}</div>`}
<div class="legend"><span><i></i>المحتسب على المستخدم (30 يومًا، اليوم الأول في اليمين)</span></div>
<div class="chartwrap">${chart(W, mob ? 230 : 280, mob ? [0, 14, 29] : [0, 7, 14, 21, 29])}${mob ? '' : tipFor(W, 25, 40)}</div></div>`;

// ---------- request data ----------
const reqUser = [
  ['اليوم · 10:44', 'سريع', 'Gemini 2.5 Flash', 'settled', 'provider', '0.0500', '0.0042', '0.0021', '0.0000'],
  ['اليوم · 10:42', 'احترافي', 'GPT-4o', 'reconciliation_required', 'estimated', '0.0800', '0.0800', '0.1112', '0.0312'],
  ['اليوم · 10:40', 'سريع', 'Gemini 2.5 Flash', 'reserved', 'provider', '0.0500', null, null, null],
  ['أمس · 21:05', 'احترافي', 'GPT-4o', 'released', 'provider', '0.0800', '0.0000', '0.0000', '0.0000'],
  ['أمس · 18:12', 'تصميم', 'Imagen 4', 'settled', 'provider', '0.1200', '0.1200', '0.1420', '0.0000'],
  ['4 نوفمبر 2026 · 09:30', 'سريع', 'Gemini 2.5 Flash', 'settled', 'provider', '0.0500', '0.0031', '0.0016', '0.0000'],
];
const reqUserRow = r => `<tr><td class="sub num">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${badge(r[3])}</td><td>${src(r[4])}</td><td class="num">${m(r[5])}</td><td class="num">${mm(r[6])}</td><td class="num">${mm(r[7])}</td><td class="num">${mm(r[8])}</td></tr>`;
const reqUserTable = rows => `<div class="card twrap"><table class="dense"><thead><tr><th>الوقت</th><th>الوضع</th><th>النموذج</th><th>الحالة</th><th>المصدر</th><th>المحجوز</th><th>المحتسب</th><th>تكلفة المزوّد</th><th>متحمَّلة</th></tr></thead><tbody>${rows}</tbody></table>
<div class="more"><a class="btn sm" style="height:44px">تحميل المزيد</a></div></div>`;

const flagged = [
  ['اليوم · 10:42', 'sara.alharbi@example.com', 'احترافي', 'GPT-4o', 'openai/gpt-4o', 'reconciliation_required', 'estimated', '0.0800', '0.0800', '0.1112', '0.0312'],
  ['اليوم · 08:15', 'khaled.m@example.com', 'احترافي', 'GPT-4o', 'openai/gpt-4o', 'reconciliation_required', 'estimated', '0.0800', '0.0800', '0.0975', '0.0175'],
  ['أمس · 22:31', 'noura.q@example.com', 'سريع', 'Gemini 2.5 Flash', 'google/gemini-2.5-flash', 'reconciliation_required', 'provider', '0.0500', '0.0500', '0.0538', '0.0038'],
  ['أمس · 14:02', 'omar.f@example.com', 'تصميم', 'Imagen 4', 'google/imagen-4.0', 'reconciliation_required', 'estimated', '0.1200', '0.1200', '0.1420', '0.0220'],
  ['4 نوفمبر 2026 · 19:48', 'lina.s@example.com', 'احترافي', 'GPT-4o', 'openai/gpt-4o', 'reconciliation_required', 'estimated', '0.0800', '0.0800', '0.0801', '0.0001'],
  ['3 نوفمبر 2026 · 11:20', 'reem.a@example.com', 'سريع', 'Gemini 2.5 Flash', 'google/gemini-2.5-flash', 'reconciliation_required', 'provider', '0.0500', '0.0500', '0.0512', '0.0012'],
  ['2 نوفمبر 2026 · 16:55', 'majed.d@example.com', 'احترافي', 'GPT-4o', 'openai/gpt-4o', 'reconciliation_required', 'estimated', '0.0800', '0.0800', '0.0930', '0.0130'],
];
const flagRow = r => `<tr><td class="sub num">${r[0]}</td><td><a class="lnk">${L(r[1])}</a></td><td>${r[2]}</td><td>${r[3]}<div class="sub">${L(r[4])}</div></td><td>${badge(r[5])}</td><td>${src(r[6])}</td><td class="num">${m(r[7])}</td><td class="num">${m(r[8])}</td><td class="num">${m(r[9])}</td><td class="num">${m(r[10])}</td></tr>`;
const flagTable = rows => `<div class="card twrap"><table class="dense"><thead><tr><th>الوقت</th><th>المستخدم</th><th>الوضع</th><th>النموذج</th><th>الحالة</th><th>المصدر</th><th>المحجوز</th><th>المحتسب</th><th>تكلفة المزوّد</th><th>متحمَّلة</th></tr></thead><tbody>${rows}</tbody></table>
<div class="more"><a class="btn sm" style="height:44px">تحميل المزيد</a></div></div>`;
const statusChips = on => `<div class="chips" role="group" aria-label="الحالة" style="margin-block-end:14px">${[['reconciliation_required', 'مُعلَّمة'], ['reserved', 'محجوزة'], ['settled', 'مُسوّاة'], ['released', 'مُحرَّرة']].map(([k, l]) => `<a class="chip${k === on ? ' on' : ''}"${k === on ? ' aria-pressed="true"' : ''}>${l}</a>`).join('')}</div>`;
const countNote = `<div class="info" role="note">${$('info', 20)}<span class="t"><b>عدّاد للطلبات المُعلَّمة وليس قائمة مهام.</b> الطلبات المُعلَّمة هي التي تحتاج مطابقة تكلفتها مع المزوّد. لا يمكن حاليًا وضع علامة «تمت المراجعة»، لذلك تبقى الطلبات هنا ولا ينقص العدد.</span></div>`;

const skRows = (n, cols) => Array.from({ length: n }, () => `<tr>${Array.from({ length: cols }, (_, i) => `<td><div class="sk" style="width:${i === 1 ? 140 : 56 + (i % 3) * 14}px"></div></td>`).join('')}</tr>`).join('');
const skTable = (cols, heads) => `<div class="card twrap" aria-busy="true"><table class="dense"><thead><tr>${heads.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${skRows(5, cols)}</tbody></table><div class="sub" style="padding:10px 16px;border-block-start:1px solid var(--bs)" role="status">جارٍ التحميل…</div></div>`;
const errCard = (title, p) => `<div class="card state" role="alert"><div class="ico i-d">${$('err', 22)}</div><div><b>${title}</b><p>${p}</p><a class="btn sm" style="height:44px">${$('refresh', 16)}إعادة المحاولة</a></div></div>`;
const emptyCard = (title, p, btn = '') => `<div class="card empty"><div class="ico">${$('flag', 24)}</div><b>${title}</b><p>${p}</p>${btn}</div>`;

// ---------- audit data ----------
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const json = o => (o === null ? `<span class="cb-empty" dir="rtl">لا توجد قيمة سابقة</span>` : esc(JSON.stringify(o, null, 2)));
const oldV = { status: 'active', suspendedAt: null, reason: null };
const newV = { status: 'suspended', suspendedAt: '2026-11-06T10:44:12Z', reason: 'terms_violation' };
const audit = [
  ['اليوم · 10:44', 'admin', 'admin@lam7ai.com', 'b3c1f0aa', 'user.suspend', 'user', '7d2e91c4', 'مخالفة شروط الاستخدام', true],
  ['اليوم · 09:12', 'admin', 'admin@lam7ai.com', 'b3c1f0aa', 'balance.adjust', 'user', 'a41f08de', 'تصحيح خطأ إدخال', false],
  ['اليوم · 06:00', 'system', 'مزامنة الكتالوج', null, 'catalog.apply_price', 'model', '5c90b3e1', 'تطبيق تلقائي: تغيير أقل من 50%', false],
  ['أمس · 17:30', 'cli', 'سطر الأوامر', null, 'admin.grant', 'user', 'b3c1f0aa', 'تهيئة أول مسؤول', false],
  ['أمس · 11:05', 'admin', 'admin@lam7ai.com', 'b3c1f0aa', 'subscription.activate', 'user', '7d2e91c4', null, false],
  ['4 نوفمبر 2026 · 20:41', 'user', 'khaled.m@example.com', 'e72a5d10', 'account.update_profile', 'user', 'e72a5d10', null, false],
];
const actorType = { admin: ['b-pro', 'مسؤول'], system: ['b-n', 'النظام'], cli: ['b-n', 'سطر الأوامر'], user: ['b-n', 'مستخدم'] };
const actorCell = r => `<div class="who2"><span>${r[2].includes('@') ? L(r[2]) : `<b style="font-weight:600">${r[2]}</b>`}</span><span class="sid"><span class="badge ${actorType[r[1]][0]}" style="padding:0 8px;font-size:12px">${actorType[r[1]][1]}</span>${r[3] ? ` ${L(r[3])}` : ''}</span></div>`;
const detailBlock = () => `<div class="detail"><div class="detail-g"><div><div class="cb-h">القيمة السابقة</div><pre class="cb" dir="ltr">${json(oldV)}</pre></div><div><div class="cb-h">القيمة الجديدة</div><pre class="cb" dir="ltr">${json(newV)}</pre></div></div>
<div class="rsn"><b>السبب:</b> مخالفة شروط الاستخدام</div></div>`;
const auditRow = r => `<tr${r[8] ? ' class="rowopen"' : ''}><td class="sub num">${r[0]}</td><td>${actorCell(r)}</td><td><span class="act-t">${r[4]}</span></td><td><div class="res"><span>${r[5] === 'user' ? 'مستخدم' : 'نموذج'}</span><span class="sub">${L(r[5] + ' · ' + r[6])}</span></div></td><td class="rsn">${r[7] || dash}</td>
<td style="width:56px"><a class="expbtn${r[8] ? ' open' : ''}" aria-expanded="${r[8]}" aria-label="${r[8] ? 'إخفاء' : 'عرض'} تفاصيل التغيير"><span style="display:flex;${r[8] ? 'transform:rotate(180deg)' : ''}">${$('down', 20)}</span></a></td></tr>${r[8] ? `<tr class="rowopen"><td colspan="6" style="padding:0">${detailBlock()}</td></tr>` : ''}`;
const auditTable = rows => `<div class="card twrap"><table class="dense"><thead><tr><th>الوقت</th><th>المنفّذ</th><th>الإجراء</th><th>المورد</th><th>السبب</th><th><span class="sr" style="font-size:0">تفاصيل</span></th></tr></thead><tbody>${rows}</tbody></table>
<div class="more"><a class="btn sm" style="height:44px">تحميل المزيد</a></div></div>`;
const tin = (label, v, ph, extraCls = '', err = '', hint = '') => `<div class="f"><label>${label}</label><div class="in${err ? ' e' : ''}" style="${v || ph?.match(/^[A-Za-z]/) ? 'direction:ltr' : ''}">${v ? `<span>${v}</span>` : `<span class="ph">${ph}</span>`}</div>${err ? `<div class="err">${$('err', 16)}${err}</div>` : hint ? `<div class="hint">${hint}</div>` : ''}</div>`;
const auditFilters = (opts = {}) => `<div class="card fcard"><div class="ff">
${tin('الإجراء', opts.action || '', 'مثال: <bdi dir="ltr">user.suspend</bdi>')}
${tin('نوع المورد', opts.rtype || '', 'مثال: <bdi dir="ltr">user</bdi>')}
${tin('معرّف المورد', '', 'المعرّف الكامل للمورد')}
${tin('المسؤول (معرّف)', opts.admin || '', 'UUID', '', opts.adminErr || '', opts.adminErr ? '' : 'يقبل المعرّف الكامل (<bdi dir="ltr">UUID</bdi>) فقط')}
${dateIn('من تاريخ', opts.from || '', '')}
${dateIn('إلى تاريخ', opts.to || '', '')}
</div><div style="display:flex;gap:10px;align-items:center"><a class="btn p">${$('filter', 18)}تطبيق</a><a class="btn">${$('x', 18)}مسح الفلاتر</a><span class="sub" style="margin-inline-start:auto">الأيام بتوقيت UTC · الفلاتر محفوظة في الرابط</span></div></div>`;

// ================= DESKTOP BOARD =================
const D = [];
const userUsage = (inner) => frame(`${uhead('الاستهلاك')}${inner}`, 'users', 'تفاصيل المستخدم');
const recentHdr = `<div class="sec"><h3>أحدث طلبات المستخدم</h3><span class="sub">تظهر أحدث الطلبات بغض النظر عن الفترة المختارة</span></div>`;
D.push(`<div>${tag('1a. تبويب «الاستهلاك»: البيانات (آخر 30 يومًا)')}${userUsage(`${picker()}${kpis()}
<div class="sec"><h3>حسب الوضع</h3></div>${breakdown(byMode, 'الوضع', 'mode')}
<div class="sec" style="margin-block-start:20px"><h3>حسب النموذج</h3></div>${breakdown(byModel, 'النموذج', 'model')}
<div style="height:20px"></div>${chartCard(1000)}
${recentHdr}${reqUserTable(reqUser.map(reqUserRow).join(''))}`)}</div>`);

D.push(`<div style="display:grid;gap:28px">
<div>${tag('1b. تحميل')}${userUsage(`${picker()}<div class="kpis">${Array.from({ length: 6 }, () => `<div class="card kpi"><div class="sk" style="width:90px;margin-block-end:12px"></div><div class="sk" style="width:120px;height:24px"></div></div>`).join('')}</div>
<div class="card" aria-busy="true" style="padding:18px;height:200px;margin-block-end:16px"><div class="sk" style="width:140px;margin-block-end:16px"></div><div class="sk" style="height:130px;border-radius:10px"></div></div>${skTable(7, ['الوقت', 'الوضع', 'النموذج', 'الحالة', 'المصدر', 'المحتسب', 'متحمَّلة'])}`)}</div>
<div>${tag('1c. خطأ مع إعادة المحاولة (الفترة تبقى ظاهرة)')}${userUsage(`${picker('90', 'من 9 أغسطس 2026 إلى 6 نوفمبر 2026')}${errCard('تعذّر تحميل الاستهلاك', 'تحقق من اتصالك ثم أعد المحاولة.')}`)}</div></div>`);

D.push(`<div style="display:grid;gap:28px">
<div>${tag('1d. فترة مخصّصة مع خطأ تحقق (قبل الإرسال)')}${userUsage(`${picker('c', 'اختر الفترة ثم اضغط «تطبيق»', customBox('2026-11-06', '2026-10-01', '', 'يجب ألا يسبق تاريخ النهاية تاريخ البداية.'))}<div class="card" style="padding:18px;color:var(--ink2)">تبقى النتائج السابقة ظاهرة حتى يُطبَّق نطاق صحيح. الحد الأقصى 366 يومًا؛ الرسالة: «الحد الأقصى للفترة 366 يومًا.»</div>`)}</div>
<div>${tag('1e. فترة بلا استهلاك (أصفار) وهامش سالب')}${userUsage(`${picker('7', 'من 31 أكتوبر 2026 إلى 6 نوفمبر 2026')}<div class="card empty" style="margin-block-end:16px"><div class="ico">${$('chart', 24)}</div><b>لا يوجد استهلاك في هذه الفترة</b><p>لم يرسل المستخدم أي رسالة بين 31 أكتوبر و6 نوفمبر 2026.</p></div>
<div class="sub" style="margin-block-end:8px">بطاقة الهامش عندما يكون سالبًا (فترة أخرى):</div><div class="kpis" style="grid-template-columns:repeat(3,1fr)">${kpi('المحتسب على المستخدم', m('0.78'), 'ما خُصم من رصيده')}${kpi('تكلفة المزوّد', m('1.20'), 'ما دفعناه للمزوّدين')}${kpi('الهامش', mneg('0.42'), 'المحتسب ناقص التكلفة. سالب: التكلفة أعلى من المحتسب', 'dank', $('warn', 16))}</div>`)}</div></div>`);

D.push(`<div style="display:grid;gap:28px">
<div>${tag('1f. «عرض كجدول» (للقراءة بقارئ الشاشة وللأرقام الدقيقة)')}${userUsage(`${picker()}<div class="card" style="margin-block-end:16px"><div class="cardhd"><h3>الاستهلاك اليومي</h3><a class="btn sm" style="height:44px">${$('chart', 18)}عرض كرسم</a></div>
<div style="max-height:330px;overflow:auto"><table class="dense"><thead><tr><th>اليوم</th><th>الطلبات</th><th>المحتسب</th><th>تكلفة المزوّد</th></tr></thead><tbody>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<tr><td>${dl(i)} 2026</td><td class="num">${num(10 + ((i * 7) % 9))}</td><td class="num">${m(daily[i].toFixed(2))}</td><td class="num">${m((daily[i] * 0.64).toFixed(2))}</td></tr>`).join('')}</tbody></table></div><div class="sub" style="padding:10px 16px;border-block-start:1px solid var(--bs)">يظهر كل أيام الفترة (30 يومًا) مرتبة من الأقدم إلى الأحدث، ويمرَّر داخل البطاقة.</div></div>`)}</div>
<div>${tag('1g. أحدث الطلبات: لا طلبات للمستخدم / خطأ في القائمة')}${userUsage(`${picker()}${recentHdr}<div class="card empty" style="margin-block-end:16px"><div class="ico">${$('flag', 24)}</div><b>لا توجد طلبات لهذا المستخدم</b><p>ستظهر هنا أحدث رسائله عند إرسالها.</p></div>${errCard('تعذّر تحميل الطلبات', 'تحقق من اتصالك ثم أعد المحاولة. الإجماليات أعلاه لا تتأثر.')}`)}</div></div>`);

// 2. flagged requests
const reqPage = (inner) => frame(inner, 'requests', 'الطلبات المُعلَّمة');
D.push(`<div>${tag('2a. «الطلبات المُعلَّمة»: القائمة (الأحدث أولًا)')}${reqPage(`${countNote}${statusChips('reconciliation_required')}${flagTable(flagged.map(flagRow).join(''))}`)}</div>`);
D.push(`<div style="display:grid;gap:28px">
<div>${tag('2b. فارغة (الحالة «مُعلَّمة»)')}${reqPage(`${countNote}${statusChips('reconciliation_required')}${emptyCard('لا توجد طلبات مُعلَّمة', 'كل الطلبات الحالية مُسوّاة. سيظهر هنا أي طلب تحتاج تكلفته إلى مطابقة.')}`)}</div>
<div>${tag('2c. فارغة لحالة أخرى (محجوزة)')}${reqPage(`${countNote}${statusChips('reserved')}${emptyCard('لا توجد طلبات بهذه الحالة', 'جرّب حالة أخرى.')}`)}</div></div>`);
D.push(`<div style="display:grid;gap:28px">
<div>${tag('2d. تحميل')}${reqPage(`${countNote}${statusChips('reconciliation_required')}${skTable(10, ['الوقت', 'المستخدم', 'الوضع', 'النموذج', 'الحالة', 'المصدر', 'المحجوز', 'المحتسب', 'التكلفة', 'متحمَّلة'])}`)}</div>
<div>${tag('2e. خطأ مع إعادة المحاولة، وحالة «محجوزة» (القيم التي لم تُحدَّد بعد تظهر —)')}${reqPage(`${statusChips('reserved')}${flagTable(`<tr><td class="sub num">اليوم · 10:40</td><td><a class="lnk">${L('sara.alharbi@example.com')}</a></td><td>سريع</td><td>—<div class="sub">${L('—')}</div></td><td>${badge('reserved')}</td><td>${src('provider')}</td><td class="num">${m('0.0500')}</td><td class="num">—</td><td class="num">—</td><td class="num">—</td></tr>`)}<div style="height:12px"></div>${errCard('تعذّر تحميل المزيد', 'ما حُمّل يبقى ظاهرًا. أعد المحاولة لتحميل بقية الطلبات.')}`)}</div></div>`);

// 3. audit
const auditPage = inner => frame(inner, 'audit', 'سجل التدقيق');
D.push(`<div>${tag('3a. «سجل التدقيق»: فلاتر، صفوف الأحدث أولًا، صف موسَّع بالقيمتين جنبًا إلى جنب (كتل LTR)')}${auditPage(`${auditFilters({ action: 'user.suspend', from: '2026-10-01', to: '2026-11-06' })}${auditTable(audit.map(auditRow).join(''))}`)}</div>`);
D.push(`<div style="display:grid;gap:28px">
<div>${tag('3b. خطأ تحقق في فلتر المسؤول (قبل الإرسال)')}${auditPage(`${auditFilters({ admin: 'sara', adminErr: 'أدخل معرّفًا صحيحًا بصيغة <bdi dir="ltr">UUID</bdi>.' })}<div class="card" style="padding:16px 18px;color:var(--ink2)">تبقى النتائج السابقة حتى يُطبَّق فلتر صحيح.</div>`)}</div>
<div>${tag('3c. لا نتائج مطابقة')}${auditPage(`${auditFilters({ action: 'user.delete', from: '2026-10-01', to: '2026-10-07' })}${emptyCard('لا توجد سجلات مطابقة', 'غيّر الفلاتر أو وسّع الفترة.', `<a class="btn" style="margin-block-start:10px">${$('x', 18)}مسح الفلاتر</a>`).replace($('flag', 24), $('audit', 24))}`)}</div></div>`);
D.push(`<div style="display:grid;gap:28px">
<div>${tag('3d. تحميل')}${auditPage(`${auditFilters()}${skTable(6, ['الوقت', 'المنفّذ', 'الإجراء', 'المورد', 'السبب', ''])}`)}</div>
<div>${tag('3e. خطأ مع إعادة المحاولة؛ قيمة سابقة فارغة (إنشاء)')}${auditPage(`${errCard('تعذّر تحميل سجل التدقيق', 'تحقق من اتصالك ثم أعد المحاولة. الفلاتر محفوظة.')}<div style="height:16px"></div><div class="card twrap"><div class="detail" style="border:0"><div class="detail-g"><div><div class="cb-h">القيمة السابقة</div><pre class="cb" dir="ltr">${json(null)}</pre></div><div><div class="cb-h">القيمة الجديدة</div><pre class="cb" dir="ltr">${json({ planKey: 'pro', active: true })}</pre></div></div><div class="rsn"><b>السبب:</b> ${dash}</div></div></div>`)}</div></div>`);
D.push(`<div class="note"><b>ملاحظات التنفيذ:</b> القالب كله من f4a وS16 نفسها. حقول الفلاتر نصّ حر إلى أن يتوفر <span class="ltr">GET /admin/audit/facets</span> (يُستبدل بقوائم منسدلة). تبويب «الاستهلاك» يستخدم <span class="ltr">?tab=usage&amp;from=&amp;to=</span> نفسها في S18. قائمة طلبات المستخدم لا تتبع الفترة حتى يضيف الخادم <span class="ltr">from/to</span>. العناوين والأرقام الصغيرة (نص الإجراء) بخط عادي؛ الخط الأحادي لكتل JSON فقط.</div>`);
fs.writeFileSync('desktop.html', board('S19 - الاستهلاك والطلبات المُعلَّمة وسجل التدقيق', D.join('')));

// ================= MOBILE BOARD (375px frames) =================
const mtop = t => `<header class="top"><h1>${t}</h1><a class="menubtn" aria-label="القائمة">${$('prov', 24)}</a></header>`;
const mframe = (title, inner) => `<div class="mob">${mtop(title)}<div class="content">${inner}</div></div>`;
const mtag = t => `<div class="sec-title" style="width:375px">${t}</div>`;
const mcell = (l, v) => `<div><span class="l">${l}</span><span class="v">${v}</span></div>`;
const modeCard = r => `<div class="card mcard"><div class="r"><div><h4>${r[0]}</h4><span class="sub">${L(r[1])}</span></div>${r[3] ? `<span class="badge b-warn">${$('flag', 14)}${num(r[3])} مُعلَّمة</span>` : ''}</div>
<div class="mgrid">${mcell('الطلبات', num(r[2]))}${mcell('المحتسب', m(r[4]))}${mcell('تكلفة المزوّد', m(r[5]))}${mcell('الهامش', marginCell(r[6], r[8]))}${mcell('متحمَّلة', m(r[7]))}</div></div>`;
const mReqCard = r => `<div class="card mcard"><div class="r">${badge(r[3])}<span class="sub">${r[0]}</span></div><div style="margin-block-start:8px"><b style="font-weight:600">${r[1]}</b> <span class="sub">· ${r[2]}</span></div>
<div class="r" style="margin-block-start:6px">${src(r[4])}</div>
<div class="mgrid">${mcell('المحجوز', m(r[5]))}${mcell('المحتسب', mm(r[6]))}${mcell('تكلفة المزوّد', mm(r[7]))}${mcell('متحمَّلة', mm(r[8]))}</div></div>`;
const mFlagCard = r => `<div class="card mcard"><div class="r">${badge(r[5])}<span class="sub">${r[0]}</span></div>
<div style="margin-block-start:8px"><a class="lnk" style="word-break:break-all">${L(r[1])}</a></div>
<div style="margin-block-start:4px"><b style="font-weight:600">${r[2]}</b> <span class="sub">· ${r[3]} ${L(r[4])}</span></div><div style="margin-block-start:6px">${src(r[6])}</div>
<div class="mgrid">${mcell('المحجوز', m(r[7]))}${mcell('المحتسب', m(r[8]))}${mcell('تكلفة المزوّد', m(r[9]))}${mcell('متحمَّلة', m(r[10]))}</div></div>`;
const mAuditCard = r => `<div class="card mcard"${r[8] ? ' style="border-color:var(--bc)"' : ''}><div class="r"><span class="act-t">${r[4]}</span><span class="sub">${r[0]}</span></div>
<div style="margin-block-start:8px">${actorCell(r)}</div><div class="sub" style="margin-block-start:6px">المورد: ${r[5] === 'user' ? 'مستخدم' : 'نموذج'} ${L(r[6])}</div>
<div class="rsn" style="margin-block-start:6px"><b>السبب:</b> ${r[7] || dash}</div>
<div style="margin-block-start:10px"><a class="btn sm" style="height:44px;width:100%;justify-content:center" aria-expanded="${r[8]}">${r[8] ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}<span style="display:flex;${r[8] ? 'transform:rotate(180deg)' : ''}">${$('down', 18)}</span></a></div>
${r[8] ? `<div style="margin-block-start:12px"><div class="cb-h">القيمة السابقة</div><pre class="cb" dir="ltr">${json(oldV)}</pre><div class="cb-h" style="margin-block-start:10px">القيمة الجديدة</div><pre class="cb" dir="ltr">${json(newV)}</pre></div>` : ''}</div>`;
const mUserHead = tab => `${crumb('المستخدمون', 'سارة الحربي')}<div class="hd" style="margin-block-end:10px"><div class="t"><h2>سارة الحربي</h2>${badge('settled').replace('مُسوّاة', 'نشط')}</div></div><div class="sub" style="margin-block-end:10px">${L('sara.alharbi@example.com')}</div>
<div class="tabs" role="tablist">${['نظرة عامة', 'الاشتراك', 'الرصيد', 'الاستهلاك'].map(t => `<div class="tab${t === tab ? ' on' : ''}" role="tab">${t}</div>`).join('')}</div>`;
const mPicker = (on = '30', range = '8 أكتوبر - 6 نوفمبر 2026') => `<div class="chips" role="group" aria-label="الفترة">${presets.map(([k, l]) => `<a class="chip${k === on ? ' on' : ''}">${l.replace('آخر ', '')}</a>`).join('')}</div>
<div class="pp-meta" style="margin-block-start:8px;margin-block-end:14px"><span>${$('cal', 16)}${range}</span><span>${$('clock', 16)}الأيام بتوقيت UTC</span></div>`;
const mKpis = `<div class="kpis">${kpi('المحتسب', m(totals.chg), '')}${kpi('تكلفة المزوّد', m(totals.cost), '')}${kpi('الهامش', m('+' + totals.margin), '')}${kpi('تكلفة متحمَّلة', m(totals.abs), '')}${kpi('الطلبات', num(totals.req), '')}${kpi('مُعلَّمة', num(totals.flag), '', 'warnk', $('flag', 16))}${kpi('رموز الإدخال', num(totals.inp), '')}${kpi('رموز مخزّنة', num(totals.cac), '')}</div><div class="kpis" style="grid-template-columns:1fr">${kpi('رموز الإخراج', num(totals.out), 'تشمل التفكير والصور المُنشأة')}</div>`;
const mMore = `<a class="btn" style="width:100%;justify-content:center;margin-block-end:8px">تحميل المزيد</a>`;
const mFilters = `<div class="sheet"><div class="ff">${tin('الإجراء', 'user.suspend', '')}${tin('نوع المورد', '', 'مثال: <bdi dir="ltr">user</bdi>')}${tin('معرّف المورد', '', 'المعرّف الكامل للمورد')}${tin('المسؤول (معرّف)', '', 'UUID', '', '', 'يقبل المعرّف الكامل (<bdi dir="ltr">UUID</bdi>) فقط')}${dateIn('من تاريخ', '2026-10-01', '')}${dateIn('إلى تاريخ', '', '')}</div>
<div style="display:flex;gap:10px"><a class="btn p" style="flex:1;justify-content:center">تطبيق</a><a class="btn" style="flex:1;justify-content:center">مسح الفلاتر</a></div></div>`;
const mFilterBtn = (n) => `<a class="btn" style="width:100%;justify-content:center;margin-block-end:14px">${$('filter', 18)}الفلاتر${n ? ` <span class="badge b-pro" style="padding:0 8px">${num(n)}</span>` : ''}</a>`;

const M = [];
M.push(`<div>${mtag('M1a. الاستهلاك: الإجماليات والجداول كبطاقات')}${mframe('تفاصيل المستخدم', `${mUserHead('الاستهلاك')}${mPicker()}${mKpis}<div class="sec"><h3>حسب الوضع</h3></div>${byMode.map(modeCard).join('')}`)}</div>`);
M.push(`<div>${mtag('M1b. حسب النموذج، الرسم اليومي (اليوم الأول في اليمين)')}${mframe('تفاصيل المستخدم', `<div class="sec"><h3>حسب النموذج</h3></div>${byModel.map(r => modeCard(r).replace(`<h4>${r[0]}</h4>`, `<h4>${r[0]}</h4>`)).join('')}
<div style="height:8px"></div>${chartCard(343 - 32 + 16, true).replace('margin-block-end:20px', 'margin-block-end:8px')}<div class="note" style="margin-block-end:8px">الرسم يمرَّر داخل بطاقته عند الفترات الطويلة (حتى 366 يومًا) ولا تتمرَّر الصفحة أفقيًا.</div>`)}</div>`);
M.push(`<div>${mtag('M1c. أحدث الطلبات + تحميل المزيد')}${mframe('تفاصيل المستخدم', `<div class="sec" style="flex-direction:column;align-items:flex-start;gap:2px"><h3>أحدث طلبات المستخدم</h3><span class="sub">تظهر أحدث الطلبات بغض النظر عن الفترة المختارة</span></div>${reqUser.slice(0, 4).map(mReqCard).join('')}${mMore}`)}</div>`);
M.push(`<div>${mtag('M1d. فترة مخصّصة بخطأ / تحميل / خطأ')}${mframe('تفاصيل المستخدم', `${mPicker('c', 'اختر الفترة ثم اضغط «تطبيق»').replace('<div class="pp-meta"', customBox('2026-11-06', '2026-10-01', '', 'يجب ألا يسبق تاريخ النهاية تاريخ البداية.') + '<div class="pp-meta"')}
<div class="card" aria-busy="true" style="padding:14px;margin-block-end:12px"><div class="sk" style="width:100px;margin-block-end:10px"></div><div class="sk" style="width:140px;height:22px"></div></div>
${errCard('تعذّر تحميل الاستهلاك', 'تحقق من اتصالك ثم أعد المحاولة.')}`)}</div>`);
M.push(`<div>${mtag('M2a. «الطلبات المُعلَّمة»: بطاقات')}${mframe('الطلبات المُعلَّمة', `${countNote}${statusChips('reconciliation_required')}${flagged.slice(0, 3).map(mFlagCard).join('')}${mMore}`)}</div>`);
M.push(`<div>${mtag('M2b. فارغة / تحميل / خطأ')}${mframe('الطلبات المُعلَّمة', `${statusChips('reconciliation_required')}${emptyCard('لا توجد طلبات مُعلَّمة', 'كل الطلبات الحالية مُسوّاة. سيظهر هنا أي طلب تحتاج تكلفته إلى مطابقة.')}<div style="height:12px"></div>
<div class="card mcard" aria-busy="true"><div class="sk" style="width:90px;margin-block-end:10px"></div><div class="sk" style="width:200px;margin-block-end:8px"></div><div class="sk" style="width:150px"></div></div><div class="card mcard" aria-busy="true"><div class="sk" style="width:90px;margin-block-end:10px"></div><div class="sk" style="width:200px;margin-block-end:8px"></div><div class="sk" style="width:150px"></div></div>
${errCard('تعذّر تحميل الطلبات', 'تحقق من اتصالك ثم أعد المحاولة.')}`)}</div>`);
M.push(`<div>${mtag('M3a. «سجل التدقيق»: فلاتر مفتوحة')}${mframe('سجل التدقيق', `${mFilterBtn(2)}${mFilters}`)}</div>`);
M.push(`<div>${mtag('M3b. السجل: بطاقة موسَّعة (القيمتان فوق بعض، LTR)')}${mframe('سجل التدقيق', `${mFilterBtn(0)}${audit.slice(0, 3).map(mAuditCard).join('')}${mMore}`)}</div>`);
M.push(`<div>${mtag('M3c. لا نتائج / خطأ / تحميل')}${mframe('سجل التدقيق', `${mFilterBtn(1)}${emptyCard('لا توجد سجلات مطابقة', 'غيّر الفلاتر أو وسّع الفترة.', `<a class="btn" style="margin-block-start:10px">${$('x', 18)}مسح الفلاتر</a>`).replace($('flag', 24), $('audit', 24))}<div style="height:12px"></div>${errCard('تعذّر تحميل سجل التدقيق', 'تحقق من اتصالك ثم أعد المحاولة.')}<div style="height:12px"></div><div class="card mcard" aria-busy="true"><div class="sk" style="width:120px;margin-block-end:10px"></div><div class="sk" style="width:220px;margin-block-end:8px"></div><div class="sk" style="width:160px"></div></div>`)}</div>`);
fs.writeFileSync('mobile.html', `${head('S19 - جوال')}<body style="background:#CBD5E1"><div class="board" style="grid-template-columns:repeat(4,375px);justify-content:center;gap:28px">${M.join('')}</div></body></html>`);
console.log('built');
