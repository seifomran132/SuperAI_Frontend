// Hand-built S18 board (admin dashboard). Run: node build.mjs && node render.mjs
// Head, tokens, icons and base components come from base.mjs (same copy as S16 / f4a-admin).
import { fs, css, ic, $, money } from './base.mjs';

Object.assign(ic, {
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  refresh: '<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M3 21v-5h5"/>',
  tag: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1"/>',
  img: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
  audit: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 12h6M9 16h6"/>',
  table: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
  bars: '<path d="M3 3v18h18M8 17v-6M13 17V7M18 17v-3"/>',
  tdown: '<path d="M22 17l-8.5-8.5-5 5L2 7M16 17h6v-6"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
});

const extra = `
.mono{font-family:'IBM Plex Sans Arabic',sans-serif}
.board{padding:32px;background:#CBD5E1;display:grid;gap:36px;justify-content:center}
.frame{background:var(--bg);border-radius:16px;overflow:hidden;position:relative}
.frame.shell{display:flex;width:1440px}
.frame.part{width:1148px}.frame.part .content{padding:16px 16px}
.tagl{font-size:14px;color:var(--ink);margin-block-end:10px;font-weight:600}
.note{border:1.5px dashed var(--pro);background:var(--pro-c);color:var(--pro);border-radius:12px;padding:10px 14px;font-size:13px;line-height:20px;margin-block-start:10px}
.note b{font-weight:600}
a{text-decoration:none;color:inherit}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.num{font-variant-numeric:tabular-nums}
/* picker */
.pick{padding:16px 20px;margin-block-end:16px}
.prow{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.seg{display:inline-flex;gap:4px;padding:4px;border:1px solid var(--bc);border-radius:12px;background:#fff}
.seg .o{height:44px;padding-inline:16px;border-radius:8px;display:inline-flex;align-items:center;font-weight:500;color:var(--ink);white-space:nowrap}
.seg .o.on{background:var(--brand);color:#fff;font-weight:600}
.rng{display:flex;align-items:center;gap:8px;color:var(--ink2);margin-inline-start:auto}
.utc{display:flex;align-items:center;gap:6px;color:var(--ink2);font-size:13px;margin-block-start:10px}
.crow{display:flex;gap:12px;align-items:flex-start;margin-block-start:14px;padding-block-start:14px;border-block-start:1px solid var(--bs);flex-wrap:wrap}
.fld{min-width:200px}.fld label{display:block;font-weight:500;margin-block-end:6px}
.fld .in{width:100%;justify-content:space-between}
.fld .err{font-size:13px;color:var(--dan);margin-block-start:4px;display:flex;gap:4px;align-items:flex-start;max-width:340px}
.btn.off{opacity:.5}
/* attention */
.att{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-block-end:16px}
.al{display:flex;gap:16px;align-items:center;padding:16px 20px;border:1px solid var(--bs);border-radius:16px;background:#fff;color:var(--ink)}
.al.w{background:var(--warn-c);border-color:var(--warn-b)}
.al .ico{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:var(--muted-s);color:var(--ink2);flex-shrink:0}
.al.w .ico{background:#fff;color:var(--warn)}
.al .cnt{font-size:28px;font-weight:700;line-height:40px;min-width:40px}
.al .tx{flex:1;min-width:0}.al .tx b{display:block;font-weight:600}.al .tx span{display:block;color:var(--ink2);font-size:13px;line-height:20px}
.al .go{display:flex;align-items:center;gap:6px;font-weight:600;white-space:nowrap}
.hh{display:flex;align-items:center;gap:8px;font-size:18px;font-weight:600;line-height:30px;margin-block-end:10px}
/* kpis */
.k4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-block-end:16px}
.k3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-block-end:16px}
.kpi{padding:18px 20px}
.kpi .l{color:var(--ink2);font-size:14px;font-weight:500;display:flex;align-items:center;gap:8px}
.kpi .v{font-size:28px;font-weight:700;line-height:44px}
.kpi .h{color:var(--ink2);font-size:13px;line-height:20px}
.kpi.neg{border-color:var(--dan-b);background:var(--dan-c)}
.mneg{color:var(--dan)}
.kv{display:flex;justify-content:space-between;align-items:center;padding-block:8px;border-block-start:1px solid var(--bs);font-size:14px}
.kv:first-of-type{border-block-start:0}.kv b{font-weight:600}
.kv .sm{color:var(--ink2)}
.kpi .v.sk{height:28px}
/* chart */
.cc{padding:20px;margin-block-end:16px}
.chd{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-block-end:14px}
.chd h3{font-size:18px;font-weight:600;line-height:30px}
.chd .sp{margin-inline-start:auto;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.seg.sm .o{height:44px;padding-inline:14px}
.tg{height:44px;padding-inline:14px;border:1px solid var(--bc);border-radius:8px;background:#fff;display:inline-flex;align-items:center;gap:8px;font-weight:500;color:var(--ink);white-space:nowrap}
.tg.on{background:var(--muted-s);border-color:var(--brand);font-weight:600}
.leg{display:flex;gap:18px;color:var(--ink);margin-block-end:8px;font-size:13px}
.leg span{display:inline-flex;align-items:center;gap:6px}
.sw{width:12px;height:12px;border-radius:3px;display:inline-block}
.cw{position:relative}
.cw svg{display:block}
.cw text{font-family:'IBM Plex Sans Arabic',sans-serif;font-size:12px;fill:#475569;letter-spacing:normal;font-style:normal}
.tt{position:absolute;width:210px;background:#fff;border:1px solid var(--bs);border-radius:12px;box-shadow:0 8px 24px rgba(15,23,42,.14);padding:10px 12px;font-size:13px;line-height:20px;z-index:3}
.tt b{display:block;font-weight:600;margin-block-end:6px;font-size:14px}
.tt .r{display:flex;align-items:center;justify-content:space-between;gap:8px}
.tt .r span.n{display:inline-flex;align-items:center;gap:6px}
.chempty{height:260px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;border:1px dashed var(--bc);border-radius:12px;color:var(--ink2)}
.chempty b{color:var(--ink);font-weight:600;font-size:16px}
.tbs{max-height:340px;overflow:auto;border:1px solid var(--bs);border-radius:12px}
.tbs th{position:sticky;top:0}
.tbs td.n,.tbs th.n{text-align:end}
.scrl{overflow-x:auto;overflow-y:hidden;border-radius:8px}
.hint{display:flex;align-items:center;gap:6px;color:var(--ink2);font-size:13px;margin-block-start:8px}
/* tops */
.two{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.top2{padding:20px}
.top2 .hd2{display:flex;justify-content:space-between;align-items:baseline;margin-block-end:8px}
.top2 h3{font-size:18px;font-weight:600;line-height:30px}
.top2 table th{padding:8px 12px}.top2 table td{padding:10px 12px}
.top2 th.n,.top2 td.n{text-align:end}
.dot{width:10px;height:10px;border-radius:50%;display:inline-block;margin-inline-end:8px}
.key{display:inline-flex;align-items:center}
.emp{padding:28px 12px;text-align:center;color:var(--ink2)}
/* skeleton */
.skb{background:linear-gradient(90deg,#E2E8F0,#F1F5F9,#E2E8F0);background-size:200% 100%;border-radius:8px;animation:sh 1.4s linear infinite}
@keyframes sh{to{background-position:-200% 0}}
@media (prefers-reduced-motion:reduce){.skb{animation:none}}
.erc{padding:28px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;border-color:var(--dan-b);background:var(--dan-c);color:var(--dan)}
.erc b{font-weight:600;font-size:16px}.erc p{color:var(--ink);font-size:14px}
.ld{display:flex;align-items:center;gap:8px;color:var(--ink2);margin-block-end:12px}
/* mobile */
.mob{width:375px;background:var(--bg);overflow:hidden;position:relative}
.mob .top{padding-inline:16px;height:56px}.mob .top h1{font-size:17px}
.mob .content{padding:16px}
.menubtn{width:44px;height:44px;border-radius:8px;display:grid;place-items:center}
.mob .pick{padding:14px}
.mob .seg{display:grid;grid-template-columns:1fr 1fr;width:100%}
.mob .seg .o{justify-content:center;padding-inline:8px}
.mob .rng{margin-inline-start:0;width:100%}
.mob .att,.mob .k4,.mob .k3,.mob .two{grid-template-columns:1fr}
.mob .al{flex-wrap:wrap}.mob .al .go{width:100%}
.mob .cc{padding:14px}
.mob .chd .sp{margin-inline-start:0;width:100%}
.mob .chd .sp .seg{display:flex;width:100%}.mob .chd .sp .seg .o{flex:1;padding-inline:6px;font-size:13px}
.mob .tg{width:100%;justify-content:center}
.mob .crow{flex-direction:column}.mob .fld,.mob .fld .err{min-width:0;width:100%;max-width:none}
.mob .top2{padding:14px}.mob .top2 th,.mob .top2 td{padding-inline:6px}.mob .top2 .key{font-size:13px}
.mob .kpi{padding:16px}
.mdrawer{position:absolute;inset:0;background:rgba(15,23,42,.45);z-index:9}
.mdrawer aside{position:absolute;inset-block:0;inset-inline-start:0;width:300px;height:auto;border-inline-end:0;border-inline-start:1px solid var(--bs);overflow:auto}
.mrow{display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;justify-content:center}
.mrow>div{width:375px}
.mrow .tagl{min-height:44px}
`;

const head = t => `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${t}</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${css}${extra}</style></head>`;

// brand values come from src/brand/lam7a.ts (monogram «ل», name «لمحة AI»)
const navItems = [
  ['grid', 'نظرة عامة', 'overview'], ['users', 'المستخدمون', 'users'], ['plan', 'الباقات', 'plans'], ['prov', 'المزوّدون', 'prov'],
  ['model', 'النماذج', 'models'], ['mode', 'الأوضاع', 'modes'], ['tag', 'تحديثات الأسعار', 'price'],
  ['flag', 'الطلبات المُعلَّمة', 'flagged'], ['audit', 'سجل التدقيق', 'audit'], ['set', 'الإعدادات', 'set'],
];
const sidebar = (active = 'overview') => `<aside><div class="brand"><div class="mono">ل</div><div><b>لمحة AI</b><small>لوحة الإدارة</small></div></div>
<nav aria-label="الإدارة">${navItems.map(([i, l, id]) => {
  const label = id === 'price' ? ' aria-label="تحديثات الأسعار، 3 بانتظار المراجعة"' : '';
  return `<a class="nav${id === active ? ' on' : ''}"${id === active ? ' aria-current="page"' : ''}${label}>${$(i)}<span>${l}</span>${id === 'price' ? '<span class="cnt" aria-hidden="true" style="margin-inline-start:auto;min-width:24px;height:24px;border-radius:9999px;background:var(--warn);color:#fff;font-size:13px;font-weight:600;display:inline-grid;place-items:center;padding-inline:7px;line-height:24px">3</span>' : ''}</a>`;
}).join('')}</nav>
<div class="foot"><a class="nav"><span class="flip">${$('logout')}</span><span>العودة إلى التطبيق</span></a></div></aside>`;
const topbar = t => `<header class="top"><h1>${t}</h1><div class="who"><div class="avatar">م</div><span class="ltr">admin@lam7ai.com</span></div></header>`;
const mtop = t => `<header class="top"><h1>${t}</h1><a class="menubtn" aria-label="القائمة">${$('prov', 24)}</a></header>`;
const shellFrame = inner => `<div class="frame shell">${sidebar().replace('<aside', '<aside style="position:static;height:auto"')}<main>${topbar('نظرة عامة')}<div class="content">${inner}</div></main></div>`;
const partFrame = inner => `<div class="frame part"><div class="content">${inner}</div></div>`;
const tg = (t, inner, n = '') => `<div><div class="tagl">${t}</div>${inner}${n ? `<div class="note">${n}</div>` : ''}</div>`;

// ---------- money / format ----------
const m = v => money(v + '$');
const mneg = v => `<bdi dir="ltr" class="mneg">−${v}$</bdi>`;
const nf = n => n.toLocaleString('en');

// ---------- data (30 days: 8 Oct .. 6 Nov 2026, oldest first) ----------
const N = 30;
const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const day = i => new Date(Date.UTC(2026, 9, 8 + i));
const dLabel = (i, withMonth) => `${day(i).getUTCDate()}${withMonth ? ' ' + months[day(i).getUTCMonth()] : ''}`;
const dFull = i => `${day(i).getUTCDate()} ${months[day(i).getUTCMonth()]} ${day(i).getUTCFullYear()}`;
const rnd = i => (Math.sin(i * 12.9898 + 4.1) * 43758.5453) % 1;
const scaleTo = (w, total) => {
  const s = w.reduce((a, b) => a + b, 0);
  const c = w.map(x => Math.round((x / s) * total));
  c[c.length - 1] += total - c.reduce((a, b) => a + b, 0);
  return c;
};
const w1 = Array.from({ length: N }, (_, i) => 0.5 + Math.abs(rnd(i)) + (i > 20 ? 0.4 : 0) + (i % 7 === 5 ? -0.25 : 0));
const chargedC = scaleTo(w1, 84230);
const costC = scaleTo(chargedC.map((c, i) => c * (0.55 + 0.15 * Math.abs(rnd(i + 50)))), 53175);
const reqs = scaleTo(w1.map((x, i) => x * (0.9 + 0.2 * Math.abs(rnd(i + 9)))), 4820);
const newU = scaleTo(w1.map((x, i) => 0.3 + Math.abs(rnd(i + 31))), 86);
const c2 = c => (c / 100).toFixed(2);

// ---------- chart (svg, direction ltr, day 1 on the RIGHT) ----------
const COLORS = { charged: '#1E293B', cost: '#0369A1', req: '#4F46E5', users: '#0F766E' };
function chart({ w = 1076, h = 280, kind = 'money', hover = -1, empty = false, nDays = N, padR = 56 }) {
  const padL = 8, padT = 12, padB = 28;
  const pw = w - padR - padL, ph = h - padT - padB, step = pw / nDays;
  const series = kind === 'money' ? [chargedC.map(x => x / 100), costC.map(x => x / 100)] : kind === 'req' ? [reqs] : [newU];
  const cols = kind === 'money' ? [COLORS.charged, COLORS.cost] : [kind === 'req' ? COLORS.req : COLORS.users];
  const rawMax = empty ? 10 : Math.max(...series.flat());
  const unit = rawMax <= 6 ? 2 : rawMax <= 12 ? 5 : rawMax <= 60 ? 10 : rawMax <= 120 ? 20 : rawMax <= 600 ? 100 : 100;
  const max = Math.ceil(rawMax / unit) * unit, ticks = max / unit;
  const y = v => padT + ph - (v / max) * ph;
  const xc = i => padL + pw - (i + 0.5) * step; // i=0 (first day) at the right
  const fmt = v => (kind === 'money' ? `${v}$` : `${v}`);
  let s = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="direction:ltr" role="img" aria-label="${kind === 'money' ? 'رسم بياني يومي للمحصَّل وتكلفة المزوّد، من 8 أكتوبر إلى 6 نوفمبر' : kind === 'req' ? 'رسم بياني يومي للطلبات' : 'رسم بياني يومي للمستخدمين الجدد'}">`;
  for (let t = 0; t <= ticks; t++) {
    const v = t * unit, yy = y(v);
    s += `<line x1="${padL}" x2="${padL + pw}" y1="${yy}" y2="${yy}" stroke="${t === 0 ? '#7C8799' : '#E2E8F0'}" stroke-width="1"/>`;
    s += `<text x="${padL + pw + 10}" y="${yy + 4}" text-anchor="start" direction="ltr">${fmt(v)}</text>`;
  }
  if (hover >= 0) s += `<rect x="${xc(hover) - step / 2}" y="${padT}" width="${step}" height="${ph}" fill="#F1F5F9"/>`;
  // rebuild gridlines on top of hover band is unnecessary; bars:
  const bw = Math.max(2, Math.min(step * (series.length === 2 ? 0.34 : 0.56), 22));
  if (!empty) {
    for (let i = 0; i < nDays; i++) {
      series.forEach((sr, k) => {
        const off = series.length === 2 ? (k === 0 ? bw / 2 + 1 : -bw / 2 - 1) : 0; // series 1 sits on the right of its pair
        const x = xc(i) + off - bw / 2, yy = y(sr[i]);
        s += `<rect x="${x}" y="${yy}" width="${bw}" height="${padT + ph - yy}" rx="2" fill="${cols[k]}"/>`;
      });
    }
  }
  const labelIdx = [];
  let lastMonth = -1;
  for (let i = 0; i < nDays; i++) {
    if (i % 5 === 0 || i === nDays - 1) labelIdx.push(i);
  }
  for (const i of labelIdx) {
    const mo = day(i).getUTCMonth();
    const withMonth = mo !== lastMonth || i === nDays - 1;
    lastMonth = mo;
    s += `<text x="${xc(i)}" y="${h - 8}" text-anchor="middle">${dLabel(i, withMonth)}</text>`;
  }
  s += '</svg>';
  return s;
}
const legend = kind => kind === 'money'
  ? `<div class="leg"><span><i class="sw" style="background:${COLORS.charged}"></i>المحصَّل</span><span><i class="sw" style="background:${COLORS.cost}"></i>تكلفة المزوّد</span></div>`
  : `<div class="leg"><span><i class="sw" style="background:${kind === 'req' ? COLORS.req : COLORS.users}"></i>${kind === 'req' ? 'الطلبات' : 'مستخدمون جدد'}</span></div>`;

function tooltip(i, kind, w = 1076) {
  const padR = 56, padL = 8, pw = w - padR - padL, step = pw / N;
  const x = padL + pw - (i + 0.5) * step; // center of hovered day
  const left = Math.max(0, x - 210 - 18); // opens toward the plot interior (left of the bar, since the bar is near the right)
  const rows = kind === 'money'
    ? `<div class="r"><span class="n"><i class="sw" style="background:${COLORS.charged}"></i>المحصَّل</span>${m(c2(chargedC[i]))}</div><div class="r"><span class="n"><i class="sw" style="background:${COLORS.cost}"></i>تكلفة المزوّد</span>${m(c2(costC[i]))}</div>`
    : kind === 'req'
      ? `<div class="r"><span class="n"><i class="sw" style="background:${COLORS.req}"></i>الطلبات</span><bdi dir="ltr">${nf(reqs[i])}</bdi></div>`
      : `<div class="r"><span class="n"><i class="sw" style="background:${COLORS.users}"></i>مستخدمون جدد</span><bdi dir="ltr">${nf(newU[i])}</bdi></div>`;
  return `<div class="tt" role="tooltip" style="inset-inline-start:auto;left:${left}px;top:34px"><b>${dFull(i)}</b>${rows}</div>`;
}

function chartTable(kind = 'money') {
  const head = kind === 'money' ? '<th>التاريخ</th><th class="n">المحصَّل</th><th class="n">تكلفة المزوّد</th>' : kind === 'req' ? '<th>التاريخ</th><th class="n">الطلبات</th>' : '<th>التاريخ</th><th class="n">مستخدمون جدد</th>';
  const rows = Array.from({ length: N }, (_, i) => `<tr><td>${dFull(i)}</td>${kind === 'money' ? `<td class="n">${m(c2(chargedC[i]))}</td><td class="n">${m(c2(costC[i]))}</td>` : `<td class="n"><bdi dir="ltr">${nf((kind === 'req' ? reqs : newU)[i])}</bdi></td>`}</tr>`).join('');
  return `<div class="tbs" tabindex="0" role="region" aria-label="جدول القيم اليومية"><table><caption class="sr">القيم اليومية، من 8 أكتوبر إلى 6 نوفمبر 2026</caption><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

const seriesSwitch = sel => `<div class="seg sm" role="radiogroup" aria-label="السلسلة المعروضة">${[['money', 'المبالغ'], ['req', 'الطلبات'], ['users', 'مستخدمون جدد']].map(([k, l]) => `<span class="o${k === sel ? ' on' : ''}" role="radio" aria-checked="${k === sel}">${l}</span>`).join('')}</div>`;

function chartCard({ kind = 'money', table = false, hover = -1, empty = false, mobile = false, loading = false }) {
  const title = kind === 'money' ? 'المحصَّل مقابل تكلفة المزوّد' : kind === 'req' ? 'الطلبات اليومية' : 'المستخدمون الجدد يوميًا';
  const tgl = `<button class="tg${table ? ' on' : ''}" aria-pressed="${table}">${$(table ? 'bars' : 'table', 18)}${table ? 'عرض كرسم بياني' : 'عرض كجدول'}</button>`;
  let body;
  if (loading) body = `<div class="skb" style="height:280px;border-radius:12px" aria-hidden="true"></div>`;
  else if (table) body = chartTable(kind);
  else if (empty) body = `<div class="chempty" role="status">${$('bars', 32)}<b>لا نشاط في هذه الفترة</b><span>لم تُسجَّل أي رسائل بين 8 أكتوبر و6 نوفمبر.</span></div>`;
  else if (mobile) {
    body = `${legend(kind)}<div style="display:flex;direction:rtl"><div class="scrl cw" tabindex="0" role="region" aria-label="الرسم البياني، مرّر أفقيًا لعرض باقي الأيام" style="flex:1;min-width:0">${chart({ w: 640, h: 240, kind, hover: -1 }).replace(/<text x="(\d+(\.\d+)?)" y="(\d+(\.\d+)?)" text-anchor="start"[^>]*>[^<]*<\/text>/g, '')}</div></div>
    <div class="hint">${$('info', 16)}مرّر أفقيًا لعرض باقي الأيام. اليوم الأول عند الطرف الأيمن واليوم الحالي عند الأيسر.</div>`;
  } else body = `${legend(kind)}<div class="cw">${chart({ kind, hover })}${hover >= 0 ? tooltip(hover, kind) : ''}</div>`;
  return `<section class="card cc"><div class="chd"><h3>${loading ? 'النشاط اليومي' : title}</h3><div class="sp">${loading ? '' : seriesSwitch(kind)}${loading ? '' : tgl}</div></div>${body}</section>`;
}

// mobile chart: y axis fixed on the right, outside the scroller
function mobChart({ kind = 'money' }) {
  const h = 240, padT = 12, padB = 28, ph = h - padT - padB;
  const series = kind === 'money' ? [chargedC.map(x => x / 100), costC.map(x => x / 100)] : kind === 'req' ? [reqs] : [newU];
  const rawMax = Math.max(...series.flat());
  const unit = rawMax <= 6 ? 2 : rawMax <= 12 ? 5 : rawMax <= 60 ? 10 : 100, max = Math.ceil(rawMax / unit) * unit, ticks = max / unit;
  const yAxis = `<svg width="44" height="${h}" viewBox="0 0 44 ${h}" style="direction:ltr;flex-shrink:0" aria-hidden="true">${Array.from({ length: ticks + 1 }, (_, t) => { const yy = padT + ph - (t * unit / max) * ph; return `<text x="6" y="${yy + 4}" text-anchor="start" style="font-family:'IBM Plex Sans Arabic';font-size:12px;fill:#475569">${t * unit}${kind === 'money' ? '$' : ''}</text>`; }).join('')}</svg>`;
  const plot = chart({ w: 640, h, kind, padR: 14 }).replace(/<text x="[\d.]+" y="[\d.]+" text-anchor="start" direction="ltr">[^<]*<\/text>/g, '');
  return `${legend(kind)}<div style="display:flex;direction:rtl;gap:0">${yAxis}<div class="scrl cw" tabindex="0" role="region" aria-label="الرسم البياني، مرّر أفقيًا لعرض باقي الأيام" style="flex:1;min-width:0">${plot}</div></div>
  <div class="hint">${$('info', 16)}مرّر أفقيًا لعرض باقي الأيام.</div>`;
}
function chartCardMob({ kind = 'money', table = false, empty = false, loading = false }) {
  const title = kind === 'money' ? 'المحصَّل مقابل تكلفة المزوّد' : kind === 'req' ? 'الطلبات اليومية' : 'المستخدمون الجدد يوميًا';
  const tgl = `<button class="tg${table ? ' on' : ''}" aria-pressed="${table}">${$(table ? 'bars' : 'table', 18)}${table ? 'عرض كرسم بياني' : 'عرض كجدول'}</button>`;
  let body;
  if (loading) body = `<div class="skb" style="height:240px;border-radius:12px" aria-hidden="true"></div>`;
  else if (table) body = chartTable(kind).replace('max-height:340px', 'max-height:300px');
  else if (empty) body = `<div class="chempty" role="status" style="height:220px;padding:12px">${$('bars', 32)}<b>لا نشاط في هذه الفترة</b><span>لم تُسجَّل أي رسائل بين 8 أكتوبر و6 نوفمبر.</span></div>`;
  else body = mobChart({ kind });
  return `<section class="card cc"><div class="chd"><h3>${loading ? 'النشاط اليومي' : title}</h3><div class="sp">${loading ? '' : seriesSwitch(kind)}${loading ? '' : tgl}</div></div>${body}</section>`;
}

// ---------- picker ----------
const presets = [['7', 'آخر 7 أيام'], ['30', 'آخر 30 يومًا'], ['90', 'آخر 90 يومًا'], ['c', 'فترة مخصصة']];
function picker({ sel = '30', from = '', to = '', errFrom = '', errTo = '', rangeText = 'من 8 أكتوبر إلى 6 نوفمبر 2026 · 30 يومًا', disabledApply = false, loadingMsg = false }) {
  const seg = `<div class="seg" role="radiogroup" aria-label="الفترة">${presets.map(([k, l]) => `<span class="o${k === sel ? ' on' : ''}" role="radio" aria-checked="${k === sel}">${l}</span>`).join('')}</div>`;
  const dateField = (id, label, v, err) => `<div class="fld"><label for="${id}">${label}</label><div class="in${err ? ' e' : ''}" id="${id}" ${err ? `aria-invalid="true" aria-describedby="${id}-e"` : ''}><bdi dir="ltr" class="num">${v}</bdi><span style="display:flex;color:var(--ink2)">${$('cal', 18)}</span></div>${err ? `<div class="err" id="${id}-e" role="alert">${$('err', 16)}<span>${err}</span></div>` : ''}</div>`;
  const custom = sel === 'c' ? `<div class="crow">${dateField('f-from', 'من', from, errFrom)}${dateField('f-to', 'إلى', to, errTo)}<div class="fld"><label style="visibility:hidden" aria-hidden="true">.</label><button class="btn p${disabledApply ? ' off' : ''}"${disabledApply ? ' aria-disabled="true"' : ''}>تطبيق</button></div></div>` : '';
  return `<section class="card pick" aria-label="الفترة"><div class="prow">${seg}<div class="rng">${$('cal', 18)}<span>${rangeText}</span></div></div>
<p class="utc">${$('info', 16)}الأيام بتوقيت UTC</p>${loadingMsg ? `<div class="ld" role="status" style="margin:10px 0 0">${$('refresh', 16)}جارٍ تحميل التقرير…</div>` : ''}${custom}</section>`;
}

// ---------- attention ----------
function attention({ flagged = 4, price = 3 } = {}) {
  const item = (icon, count, title, sub, link, id) => `<a class="al${count > 0 ? ' w' : ''}" href="#"><span class="ico">${$(icon, 22)}</span><span class="cnt num" aria-hidden="true">${count}</span><span class="tx"><b>${title}</b><span>${count === 0 ? id : sub}</span></span><span class="go">${link}<span class="flip">${$('arrow', 18)}</span></span></a>`;
  return `<section aria-label="تحتاج إلى انتباه"><div class="hh">${$('warn', 20)}تحتاج إلى انتباه</div><div class="att">
${item('flag', flagged, 'طلبات مُعلَّمة', 'محسوبة من تقدير أو تحمّلنا جزءًا من تكلفتها. العدد الحالي لكل الفترات.', 'عرض الطلبات', 'لا توجد طلبات مُعلَّمة')}
${item('tag', price, 'تحديثات أسعار مفتوحة', 'تغييرات في أسعار النماذج بانتظار مراجعتك.', 'عرض تحديثات الأسعار', 'لا توجد تحديثات أسعار مفتوحة')}
</div></section>`;
}

// ---------- kpis ----------
const kpi = (label, icon, value, help, cls = '') => `<div class="card kpi ${cls}"><div class="l">${$(icon, 18)}${label}</div><div class="v num">${value}</div><div class="h">${help}</div></div>`;
function moneyCards({ charged = '842.30', cost = '531.75', margin = '310.55', absorbed = '12.40', negative = false }) {
  const marginV = negative ? mneg(margin) : m(margin);
  const marginCard = negative
    ? `<div class="card kpi neg"><div class="l" style="color:var(--dan)">${$('tdown', 18)}الهامش</div><div class="v num">${marginV}</div><div class="h" style="color:var(--dan);font-weight:500;display:flex;align-items:center;gap:4px">${$('warn', 14)}أقل من التكلفة في هذه الفترة</div><div class="h">المحصَّل ناقص تكلفة المزوّد</div></div>`
    : kpi('الهامش', 'bars', marginV, 'المحصَّل ناقص تكلفة المزوّد');
  return `<div class="k4">${kpi('المحصَّل', 'wallet', m(charged), 'ما خُصم من أرصدة المستخدمين')}${kpi('تكلفة المزوّد', 'prov', m(cost), 'ما دفعناه للمزوّدين')}${marginCard}${kpi('المُمتَص', 'warn', m(absorbed), 'تكلفة زادت عن المبلغ المحجوز وتحمّلناها')}</div>`;
}
const usersCard = (t = 1240, n = 86, a = 312) => `<div class="card kpi"><div class="l">${$('users', 18)}المستخدمون</div><div class="v num"><bdi dir="ltr">${nf(t)}</bdi></div><div class="h" style="margin-block-end:6px">إجمالي الحسابات غير المحذوفة</div>
<div class="kv"><span class="sm">جدد في الفترة</span><b class="num"><bdi dir="ltr">${nf(n)}</bdi></b></div><div class="kv"><span class="sm">نشطون في الفترة</span><b class="num"><bdi dir="ltr">${nf(a)}</bdi></b></div></div>`;
const plansCard = () => `<div class="card kpi"><div class="l">${$('plan', 18)}الباقات النشطة</div><div class="v num"><bdi dir="ltr">211</bdi></div><div class="h" style="margin-block-end:6px">اشتراكات نشطة الآن</div>
${[['الأساسية', 142], ['المتقدمة', 58], ['الأعمال', 11]].map(([p, c]) => `<div class="kv"><span class="sm">${p}</span><b class="num"><bdi dir="ltr">${c}</bdi></b></div>`).join('')}</div>`;
const imgCard = (c = 214, u = 97) => `<div class="card kpi"><div class="l">${$('img', 18)}الصور</div><div class="v num"><bdi dir="ltr">${nf(c)}</bdi></div><div class="h" style="margin-block-end:6px">صور أُنشئت في الفترة</div>
<div class="kv"><span class="sm">صور رفعها المستخدمون</span><b class="num"><bdi dir="ltr">${nf(u)}</bdi></b></div></div>`;

// ---------- tops ----------
const modeDots = ['#0F766E', '#4F46E5', '#0369A1', '#A21CAF'];
const topModes = [['fast', 2310, '312.40'], ['professional', 1604, '401.90'], ['design', 612, '98.75'], ['research', 294, '29.25']];
const topModels = [['google/gemini-2.5-flash', 2540, '298.10'], ['anthropic/claude-sonnet-4-5', 1480, '372.55'], ['openai/gpt-4o', 640, '121.30'], ['google/imagen-4', 214, '38.15'], ['openai/gpt-4o-mini', 146, '12.20']];
function topCard(title, sub, head1, rows, dots, empty) {
  const body = empty ? `<tr><td colspan="3"><div class="emp">لا توجد بيانات في هذه الفترة</div></td></tr>` : rows.map(([k, r, c], i) => `<tr><td><span class="key">${dots ? `<i class="dot" style="background:${modeDots[i]}"></i>` : ''}<span class="ltr">${k.replace('/', '/<wbr>')}</span></span></td><td class="n num"><bdi dir="ltr">${nf(r)}</bdi></td><td class="n">${m(c)}</td></tr>`).join('');
  return `<section class="card top2"><div class="hd2"><h3>${title}</h3><span class="sub">${sub}</span></div><table><thead><tr><th>${head1}</th><th class="n">الطلبات</th><th class="n">المحصَّل</th></tr></thead><tbody>${body}</tbody></table></section>`;
}

// ---------- states ----------
const skKpi = (lines = 1) => `<div class="card kpi" aria-hidden="true"><div class="skb" style="height:16px;width:90px;margin-block-end:12px"></div><div class="skb" style="height:30px;width:120px;margin-block-end:10px"></div>${Array.from({ length: lines }, () => '<div class="skb" style="height:12px;width:80%;margin-block-start:8px"></div>').join('')}</div>`;
const skAtt = () => `<div class="att" aria-hidden="true"><div class="al"><div class="skb" style="width:44px;height:44px"></div><div class="tx"><div class="skb" style="height:14px;width:40%;margin-block-end:8px"></div><div class="skb" style="height:12px;width:70%"></div></div></div><div class="al"><div class="skb" style="width:44px;height:44px"></div><div class="tx"><div class="skb" style="height:14px;width:40%;margin-block-end:8px"></div><div class="skb" style="height:12px;width:70%"></div></div></div></div>`;
const skTop = () => `<section class="card top2" aria-hidden="true"><div class="skb" style="height:20px;width:160px;margin-block-end:16px"></div>${Array.from({ length: 5 }, () => '<div class="skb" style="height:16px;margin-block-end:14px"></div>').join('')}</section>`;

function dashboard(o = {}) {
  const st = o.state || 'data';
  const mob = !!o.mobile;
  const chartC = mob ? chartCardMob : chartCard;
  if (st === 'loading') {
    return `${picker({ loadingMsg: true })}<div aria-busy="true"><div class="hh" aria-hidden="true">${$('warn', 20)}تحتاج إلى انتباه</div>${skAtt()}
<div class="k4">${skKpi()}${skKpi()}${skKpi()}${skKpi()}</div><div class="k3">${skKpi(3)}${skKpi(3)}${skKpi(2)}</div>${chartC({ loading: true })}<div class="two">${skTop()}${skTop()}</div></div>`;
  }
  if (st === 'error') {
    return `${picker({})}<div class="card erc" role="alert">${$('err', 32)}<b>تعذّر تحميل التقرير</b><p>تحقق من اتصالك ثم أعد المحاولة.</p><button class="btn p" style="margin-block-start:6px">${$('refresh', 18)}إعادة المحاولة</button></div>`;
  }
  if (st === 'empty') {
    return `${picker({})}${attention({ flagged: 0, price: 0 })}${moneyCards({ charged: '0.00', cost: '0.00', margin: '0.00', absorbed: '0.00' })}<div class="k3">${usersCard(1240, 0, 0)}${plansCard()}${imgCard(0, 0)}</div>${chartC({ empty: true })}<div class="two">${topCard('أكثر الأوضاع استخدامًا', 'أعلى 10', 'الوضع', [], true, true)}${topCard('أكثر النماذج استخدامًا', 'أعلى 10', 'النموذج', [], false, true)}</div>`;
  }
  const neg = st === 'neg';
  return `${picker({ sel: o.sel || '30', from: o.from, to: o.to, errFrom: o.errFrom, errTo: o.errTo, rangeText: o.rangeText, disabledApply: o.disabledApply })}${attention()}
${moneyCards(neg ? { charged: '120.40', cost: '168.90', margin: '48.50', absorbed: '9.10', negative: true } : {})}<div class="k3">${usersCard()}${plansCard()}${imgCard()}</div>
${chartC({ kind: o.kind || 'money', table: o.table, hover: o.hover })}<div class="two">${topCard('أكثر الأوضاع استخدامًا', 'أعلى 10', 'الوضع', topModes, true)}${topCard('أكثر النماذج استخدامًا', 'أعلى 10', 'النموذج', topModels, false)}</div>`;
}

// ============ DESKTOP BOARD ============
const dNotes = {
  main: 'الحالة الافتراضية: آخر 30 يومًا. مؤشر الفأرة على 20 أكتوبر: التلميح بالعربية ويفتح نحو داخل الرسم. اليوم الأول (8 أكتوبر) عند الطرف الأيمن واليوم الحالي (6 نوفمبر) عند الأيسر، ومحور القيم عند الأيمن. «تحتاج إلى انتباه» أعداد وليست قائمة مهام: العدد الحالي لكل الفترات.',
};
const desktopBoard = `${head('S18 لوحة الإدارة - نظرة عامة (سطح المكتب)')}<body style="background:#CBD5E1"><div class="board">
${tg('1. الحالة الافتراضية (آخر 30 يومًا، ببيانات)', shellFrame(dashboard({ hover: 12 })), dNotes.main)}
${tg('2. هامش سالب (الحالة الاستثنائية للبطاقات): علامة − ولون الخطر ونص «أقل من التكلفة»', partFrame(moneyCards({ charged: '120.40', cost: '168.90', margin: '48.50', absorbed: '9.10', negative: true })), 'اللون وحده لا يكفي: العلامة − والأيقونة والنص المساند. الهامش الموجب يبقى بلون النص العادي (لا أخضر). المبالغ بصيغة <bdi dir="ltr">14.48$</bdi> داخل bdi LTR.')}
${tg('3. السلسلة: الطلبات، ثم المستخدمون الجدد (مفتاح تبديل السلاسل)', partFrame(chartCard({ kind: 'req', hover: 20 }) + chartCard({ kind: 'users', hover: 3 })))}
${tg('4. «عرض كجدول» مفعّل (نسخة جدولية للرسم، للقارئ الشاشي وللقيم الدقيقة؛ الأقدم أولًا ثم الأحدث)', partFrame(chartCard({ kind: 'money', table: true })), 'الجدول داخل منطقة قابلة للتمرير مع ترويسة ثابتة (tabindex=0 وعنوان). زر التبديل aria-pressed ويتغير نصه إلى «عرض كرسم بياني».')}
${tg('5. فترة مخصصة: حقلا تاريخ (من / إلى) صالحان', partFrame(picker({ sel: 'c', from: '01/09/2026', to: '06/11/2026', rangeText: 'من 1 سبتمبر إلى 6 نوفمبر 2026 · 67 يومًا' })))}
${tg('6. فترة مخصصة غير صالحة (أ: البداية بعد النهاية، ب: أكثر من 366 يومًا)', partFrame(picker({ sel: 'c', from: '20/10/2026', to: '10/10/2026', errFrom: 'يجب أن يكون تاريخ البداية قبل تاريخ النهاية أو مساويًا له.', disabledApply: true, rangeText: 'آخر فترة صالحة: من 8 أكتوبر إلى 6 نوفمبر 2026' }) + picker({ sel: 'c', from: '01/01/2025', to: '06/11/2026', errTo: 'أقصى فترة هي 366 يومًا. قصّر الفترة وحاول مرة أخرى.', disabledApply: true, rangeText: 'آخر فترة صالحة: من 8 أكتوبر إلى 6 نوفمبر 2026' })), 'يمسك zod الخطأ قبل الإرسال ويعطّل «تطبيق». التقرير تحت الحقول يبقى على آخر فترة صالحة. إن رفض الخادم الفترة (VALIDATION_FAILED) يظهر الخطأ نفسه على الحقل من details. الرسالة نصوص جديدة مقترحة.')}
${tg('7. التحميل (هياكل بدل البيانات؛ يبقى منتقي الفترة فعّالًا)', shellFrame(dashboard({ state: 'loading' })), 'aria-busy على منطقة البيانات ورسالة role=status «جارٍ تحميل التقرير…». الوميض يتوقف مع prefers-reduced-motion.')}
${tg('8. فترة بلا نشاط (أصفار، رسالة فارغة للرسم، قوائم فارغة)', shellFrame(dashboard({ state: 'empty' })), 'المستخدمون الإجماليون والباقات النشطة لا تتأثر بالفترة فتبقى كما هي. الأرقام صفر والمبالغ <bdi dir="ltr">0.00$</bdi> بلا إشارة. العدّادان في «تحتاج إلى انتباه» عند 0 بلا لون تحذير.')}
${tg('9. خطأ مع إعادة المحاولة (منتقي الفترة يبقى، والفترة تُحفظ في الرابط)', shellFrame(dashboard({ state: 'error' })), 'النص من t(errors:CODE). الخطأ 403 يُعالج بحارس المسار قبل الصفحة.')}
</div></body></html>`;
fs.writeFileSync('desktop.html', desktopBoard);

// ============ MOBILE BOARD ============
const mf = (title, inner, extraCls = '') => `<div><div class="tagl">${title}</div><div class="mob card ${extraCls}" style="border-radius:16px">${mtop('نظرة عامة')}<div class="content">${inner}</div></div></div>`;
const drawer = `<div><div class="tagl">M9. القائمة الجانبية (تنزلق من اليمين، نفس عناصر الشريط)</div><div class="mob card" style="border-radius:16px;height:760px">${mtop('نظرة عامة')}<div class="content"><div class="skb" style="height:90px"></div></div><div class="mdrawer" style="inset-inline-start:0"><aside style="inset-inline-end:0;inset-inline-start:auto;border-inline-start:0;border-inline-end:0;border-inline-start:1px solid var(--bs);position:absolute;height:100%;width:300px;display:flex;right:0;left:auto">${sidebar().replace(/^<aside[^>]*>/, '').replace(/<\/aside>$/, '')}</aside></div></div></div>`;
const mobileBoard = `${head('S18 لوحة الإدارة - نظرة عامة (جوال 375px)')}<body style="background:#CBD5E1"><div class="board" style="padding:24px"><div class="mrow">
${mf('M1. الحالة الافتراضية (البطاقات تتراكم، الرسم يمرَّر داخل بطاقته، محور القيم ثابت عند الأيمن)', dashboard({ mobile: true }))}
${mf('M2. هامش سالب', moneyCards({ charged: '120.40', cost: '168.90', margin: '48.50', absorbed: '9.10', negative: true }))}
${mf('M3. السلاسل الأخرى: الطلبات', chartCardMob({ kind: 'req' }) + chartCardMob({ kind: 'users' }))}
${mf('M4. «عرض كجدول»', chartCardMob({ table: true }))}
${mf('M5. فترة مخصصة صالحة', picker({ sel: 'c', from: '01/09/2026', to: '06/11/2026', rangeText: 'من 1 سبتمبر إلى 6 نوفمبر 2026 · 67 يومًا' }))}
${mf('M6. فترة مخصصة غير صالحة', picker({ sel: 'c', from: '20/10/2026', to: '10/10/2026', errFrom: 'يجب أن يكون تاريخ البداية قبل تاريخ النهاية أو مساويًا له.', disabledApply: true, rangeText: 'آخر فترة صالحة: من 8 أكتوبر إلى 6 نوفمبر 2026' }) + picker({ sel: 'c', from: '01/01/2025', to: '06/11/2026', errTo: 'أقصى فترة هي 366 يومًا. قصّر الفترة وحاول مرة أخرى.', disabledApply: true, rangeText: 'آخر فترة صالحة: من 8 أكتوبر إلى 6 نوفمبر 2026' }))}
${mf('M7. التحميل', dashboard({ state: 'loading', mobile: true }))}
${mf('M8. فترة بلا نشاط', dashboard({ state: 'empty', mobile: true }))}
${mf('M10. خطأ مع إعادة المحاولة', dashboard({ state: 'error', mobile: true }))}
${drawer}
</div></div></body></html>`;
fs.writeFileSync('mobile.html', mobileBoard);
console.log('built');
