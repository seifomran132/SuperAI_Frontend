// Hand-built S16 board (catalog sync). Run: node build.mjs && node render.mjs
// Head, tokens, icons and base components come verbatim from base.mjs (copied from ../f4a-admin/build.mjs).
import { fs, css, ic, $, money, em } from './base.mjs';

Object.assign(ic, {
  tag: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1"/>',
  refresh: '<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M3 21v-5h5"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  img: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>',
  key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3L21 2M16 7l3 3"/>',
  wifi: '<path d="M2 8.8a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 20h.01M2 2l20 20"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  box: '<path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
});
const extra = `
.cnt{margin-inline-start:auto;min-width:24px;height:24px;border-radius:9999px;background:var(--warn);color:#fff;font-size:13px;font-weight:600;display:inline-grid;place-items:center;padding-inline:7px;line-height:24px}
.focus{outline:2px solid var(--brand);outline-offset:2px}
.note{border:1.5px dashed var(--pro);background:var(--pro-c);color:var(--pro);border-radius:12px;padding:10px 14px;font-size:13px;line-height:20px}
.note b{font-weight:600}
.board{padding:32px;background:#CBD5E1;display:grid;gap:28px;align-items:start}
.g2{grid-template-columns:1fr 1fr}.g3{grid-template-columns:1fr 1fr 1fr}
.frame{background:var(--bg);border-radius:16px;overflow:hidden}
.pad{padding:20px}
.chip{height:36px;padding-inline:14px;border-radius:9999px;border:1px solid var(--bc);background:#fff;display:inline-flex;align-items:center;gap:8px;font-weight:500;color:var(--ink)}
.chip.on{background:var(--brand);border-color:var(--brand);color:#fff}
.chip .n{font-size:13px;opacity:.9}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin-block-end:16px}
.tabs .tab .n{margin-inline-start:6px;font-size:13px;color:var(--ink2);font-weight:500}
.lnk{color:var(--pro);font-weight:600;display:inline-flex;align-items:center;gap:4px;text-decoration:underline;text-underline-offset:3px}
.rowoff td{background:var(--muted-s)}.rowoff .dim{color:var(--ink2)}
.sk{height:14px;border-radius:7px;background:var(--bs)}
.state{padding:16px 18px;display:flex;gap:14px;align-items:flex-start}
.state .ico{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;flex-shrink:0}
.state b{font-weight:600;display:block;margin-block-end:2px}.state p{color:var(--ink2);font-size:13px;margin-block-end:8px}
.i-w{background:var(--warn-c);color:var(--warn)}.i-d{background:var(--dan-c);color:var(--dan)}.i-n{background:var(--muted-s);color:var(--ink2)}.i-p{background:var(--pro-c);color:var(--pro)}
.fcard{padding:20px;margin-block-end:16px}
.fcard.retired{border-color:var(--dan-b);background:#fff}
.fh{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-block-end:14px}
.fh h3{font-size:18px;font-weight:600;line-height:28px}
.fh .meta{display:flex;gap:10px;align-items:center;flex-wrap:wrap;color:var(--ink2);font-size:13px}
.rates{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-block-end:14px}
.rate{border:1px solid var(--bs);border-radius:12px;padding:10px 14px;background:var(--bg)}
.rate .l{font-size:13px;color:var(--ink2);margin-block-end:4px}
.rate .v{display:grid;gap:2px;font-weight:600}
.rate .v>span{display:flex;justify-content:space-between;align-items:center;gap:8px}
.rate .v .old{color:var(--ink2);font-weight:500}
.rate .cap{font-size:13px;color:var(--ink2);font-weight:400}
.pct{display:inline-flex;align-items:center;gap:4px;border-radius:9999px;padding:1px 10px;font-size:13px;font-weight:600;border:1px solid;direction:ltr;unicode-bidi:isolate}
.pct.up{color:var(--warn);background:var(--warn-c);border-color:var(--warn-b)}
.pct.dn{color:var(--ok);background:var(--ok-c);border-color:#BBF7D0}
.fd{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;border-block-start:1px solid var(--bs);padding-block-start:14px}
.fd .dates{color:var(--ink2);font-size:13px;display:flex;gap:16px;flex-wrap:wrap}
.fd .btns{display:flex;gap:10px}
.mchips{display:flex;gap:8px;flex-wrap:wrap}
.mchip{height:36px;padding-inline:12px;border-radius:9999px;background:var(--pro-c);border:1px solid var(--pro-b);color:var(--pro);font-weight:600;display:inline-flex;align-items:center;gap:6px}
.closed{background:var(--muted-s);border-radius:12px;padding:10px 14px;margin-block-end:14px;font-size:13px;color:var(--ink2);display:grid;gap:2px}
.closed b{color:var(--ink);font-weight:600}
.hdr{padding:20px;margin-block-end:16px}
.hdr .r1{display:flex;justify-content:space-between;align-items:flex-start;gap:24px}
.hdr p{color:var(--ink2)}
.hdr .last{display:flex;gap:18px;flex-wrap:wrap;margin-block-start:10px;font-size:13px;color:var(--ink2)}
.hdr .last span{display:inline-flex;gap:6px;align-items:center}
.btn.dis{background:var(--muted-s);border-color:var(--bs);color:var(--ink2)}
.spin{display:inline-flex;animation:none}
.sum{padding:20px;margin-block-end:16px}
.sum .grid6{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-block-end:12px}
.sum .c{border:1px solid var(--bs);border-radius:12px;padding:10px 14px}
.sum .c .v{font-size:24px;font-weight:700;line-height:34px}.sum .c .l{font-size:13px;color:var(--ink2)}
.sum .small{display:flex;gap:20px;flex-wrap:wrap;color:var(--ink2);font-size:13px;margin-block-end:12px}
.sum .small b{color:var(--ink);font-weight:600}
.empty{padding:40px 20px;text-align:center;color:var(--ink2)}
.empty .ico{width:48px;height:48px;border-radius:14px;background:var(--muted-s);display:grid;place-items:center;margin:0 auto 10px;color:var(--ink2)}
.empty b{display:block;color:var(--ink);font-weight:600;font-size:16px}
.sw{width:44px;height:26px;border-radius:13px;background:var(--bc);position:relative}
.sw::after{content:"";position:absolute;top:3px;inset-inline-start:3px;width:20px;height:20px;border-radius:50%;background:#fff}
.ro{background:var(--muted-s);color:var(--ink)}
.from{font-size:12px;font-weight:500;color:var(--pro);background:var(--pro-c);border:1px solid var(--pro-b);border-radius:9999px;padding:0 8px;margin-inline-start:8px;display:inline-flex;align-items:center;gap:4px;line-height:18px}
.f label{display:flex;align-items:center}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px}
.twrap{overflow:hidden;border-radius:16px}
.sbx{display:grid;gap:24px}
.sbx aside{position:static;height:auto;border:1px solid var(--bs);border-radius:16px;width:260px}
.mob{width:375px;background:var(--bg)}
.mob .top{padding-inline:16px;height:56px}.mob .top h1{font-size:17px}
.mob .content{padding:16px}
.mob .rates{grid-template-columns:1fr}
.mob .fh{flex-direction:column;gap:8px}
.mob .fd .btns{width:100%}.mob .fd .btns .btn{flex:1;justify-content:center}
.mob .hdr .r1{flex-direction:column}
.mob .chips{flex-wrap:nowrap;overflow:hidden}.mob .chip{padding-inline:10px;white-space:nowrap;flex-shrink:0;gap:6px}
.mob .tabs{overflow:hidden}.mob .tab{padding-inline:10px;white-space:nowrap}
.menubtn{width:44px;height:44px;border-radius:8px;display:grid;place-items:center}
.bn{display:flex;gap:8px;align-items:center}
@media (max-width:0){}
`;
const head = t => `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>${t}</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${css}${extra}</style></head>`;

const navItems = [['users', 'المستخدمون'], ['plan', 'الباقات'], ['prov', 'المزوّدون'], ['model', 'النماذج'], ['mode', 'الأوضاع'], ['tag', 'تحديثات الأسعار', 'price'], ['set', 'الإعدادات']];
const idOf = (it, i) => it[2] || ['users', 'plans', 'prov', 'models', 'modes', 'price', 'set'][i];
const sidebar = (active, count) => `<aside><div class="brand"><div class="mono">ب</div><div><b>بيان</b><small>لوحة الإدارة</small></div></div>
<nav aria-label="الإدارة">${navItems.map((it, i) => {
  const id = idOf(it, i);
  const isP = id === 'price';
  const label = isP && count ? ` aria-label="تحديثات الأسعار، ${count} بانتظار المراجعة"` : '';
  return `<a class="nav${id === active ? ' on' : ''}"${label}>${$(it[0])}<span>${it[1]}</span>${isP && count ? `<span class="cnt" aria-hidden="true">${count}</span>` : ''}</a>`;
}).join('')}</nav>
<div class="foot"><a class="nav"><span class="flip">${$('logout')}</span><span>العودة إلى التطبيق</span></a></div></aside>`;
const topbar = t => `<header class="top"><h1>${t}</h1><div class="who"><div class="avatar">م</div><span class="ltr">admin@bayan.com</span></div></header>`;
const shell = (title, body, active, count = 3) => `${head(title + ' - لوحة الإدارة')}<body><div class="app">${sidebar(active, count)}
<main>${topbar(title)}<div class="content">${body}</div></main></div></body></html>`;
const frame = (inner, active, title, count = 3) => `<div class="frame" style="display:flex">${sidebar(active, count).replace('<aside', '<aside style="position:static;height:auto;min-height:560px"')}<main style="flex:1;min-width:0">${topbar(title)}<div class="content">${inner}</div></main></div>`;
const board = (t, inner, cls = 'g2') => `${head(t)}<body style="background:#CBD5E1;min-height:100vh"><div class="board ${cls}">${inner}</div></body></html>`;
const tag = t => `<div class="tag">${t}</div>`;
const L = s => `<span class="ltr">${s}</span>`;
const crumb = (...p) => `<div class="crumb">${p.map((x, i) => (i ? `<span class="flip">${$('back', 14)}</span>` : '') + `<span>${x}</span>`).join('')}</div>`;
const p$ = v => (v === null ? '<span aria-label="لا يوجد">—</span>' : money(v + '$'));

// ---------- 1. sidebar ----------
fs.writeFileSync('sidebar.html', board('الشريط الجانبي - تحديثات الأسعار', `
<div>${tag('1a. عدد 3 بانتظار المراجعة (الاسم المتاح للقارئ الشاشي: «تحديثات الأسعار، 3 بانتظار المراجعة»)')}<div class="sbx">${sidebar('price', 3)}</div></div>
<div>${tag('1b. العدد صفر: الشارة مخفية')}<div class="sbx">${sidebar('models', 0)}</div>
<div style="height:20px"></div>${tag('1c. عدد كبير (احتياط إن لم يتوفر العدد من الخادم): «100+»')}
<div class="card" style="width:260px;padding:12px">${`<a class="nav on" aria-label="تحديثات الأسعار، أكثر من 100 بانتظار المراجعة">${$('tag')}<span>تحديثات الأسعار</span><span class="cnt" aria-hidden="true">100+</span></a>`}</div>
<div style="height:20px"></div>
<div class="note"><b>ملاحظات:</b> الشارة بلون التحذير (نص أبيض على لون warn) ولا تعتمد على اللون وحده: الرقم ظاهر. تُخفى عند 0. تُحدَّث كل 10 دقائق وعند التركيز على النافذة وبعد أي تطبيق أو تجاهل أو تشغيل. العنصر بارتفاع 44px.</div></div>`));

// ---------- 2. picker ----------
const models = [
  ['gpt-4.1', 'GPT-4.1', '1,047,576', '32,768', '2.00$', '8.00$', ['img'], null],
  ['gpt-4o', 'GPT-4o', '128,000', '16,384', '2.50$', '10.00$', ['img', 'tier'], null],
  ['gpt-4o-mini', 'GPT-4o mini', '128,000', '16,384', '0.15$', '0.60$', ['img'], { added: 1 }],
  ['gpt-3.5-turbo-0301', 'GPT-3.5 Turbo (0301)', '4,096', '4,096', '1.50$', '2.00$', ['dep'], null],
  ['text-embedding-3-small', '—', '8,191', '—', '0.02$', '—', [], null],
];
const bd = { img: `<span class="badge b-n">${$('img', 14)}يقرأ الصور</span>`, tier: `<span class="badge b-warn">${$('warn', 14)}سعر متدرّج</span>`, dep: `<span class="badge b-warn">${$('clock', 14)}متوقف من المزود</span>` };
const added = `<span class="badge b-ok">${$('check', 14)}مضاف</span> <a class="lnk">عرض النموذج<span class="flip">${$('back', 14)}</span></a>`;
const pickRows = (rows, noCat) => rows.map((m, i) => {
  const a = m[7] && m[7].added;
  return `<tr class="${a ? 'rowoff' : ''}"${a ? ' aria-disabled="true"' : ''}><td>${a ? `<span class="ltr dim">${m[0]}</span>` : `<a class="lnk" style="text-decoration:none;color:var(--ink)">${L(m[0])}</a>`}</td>
<td class="${a ? 'dim' : ''}" style="font-weight:500">${m[1]}</td><td>${L(m[2])}</td><td>${m[3] === '—' ? '—' : L(m[3])}</td>
<td>${noCat ? '—' : p$(m[4].replace('$', ''))}</td><td>${noCat || m[5] === '—' ? '—' : p$(m[5].replace('$', ''))}</td>
<td><div class="bn" style="flex-wrap:wrap">${a ? added : m[6].map(k => bd[k]).join('')}</div></td></tr>`;
}).join('');
const table = (rows, noCat) => `<div class="card twrap"><table><thead><tr><th>معرّف النموذج عند المزود</th><th>الاسم</th><th>نافذة السياق</th><th>أقصى إخراج</th><th>سعر الإدخال<div class="sub" style="font-weight:400">لكل مليون رمز</div></th><th>سعر الإخراج<div class="sub" style="font-weight:400">لكل مليون رمز</div></th><th>ملاحظات</th></tr></thead><tbody>${pickRows(rows, noCat)}</tbody></table></div>`;
const pickBar = `<div class="bar"><div><div class="sub" style="margin-block-end:4px">المزود</div><div class="sel" style="min-width:200px"><span>OpenAI</span>${$('down', 18)}</div></div>
<div style="flex:1;max-width:420px"><div class="sub" style="margin-block-end:4px">بحث</div><div class="in focus"><span class="ph" style="display:flex">${$('search')}</span><span class="ph">ابحث بالمعرّف أو الاسم</span></div></div>
<div style="margin-inline-start:auto;align-self:end"><a class="btn">${$('plus', 18)}إدخال يدوي</a></div></div>`;
const stepper = n => `<div class="sub" style="margin-block-end:12px;display:flex;gap:8px;align-items:center"><span class="badge ${n === 1 ? 'b-pro' : 'b-n'}">1</span><span style="${n === 1 ? 'font-weight:600;color:var(--ink)' : ''}">اختيار النموذج</span><span class="flip">${$('back', 14)}</span><span class="badge ${n === 2 ? 'b-pro' : 'b-n'}">2</span><span style="${n === 2 ? 'font-weight:600;color:var(--ink)' : ''}">البيانات والسعر</span></div>`;
fs.writeFileSync('picker.html', shell('إضافة نموذج', `${crumb('النماذج', 'إضافة نموذج')}${stepper(1)}${pickBar}${table(models)}
<div class="sub" style="margin-block-start:10px">الصفوف المضافة لا يمكن اختيارها. اضغط على صف لمتابعة الخطوة 2 بالبيانات معبّأة من الكتالوج.</div>`, 'models'));

const stateCard = (ico, cls, t, p, acts) => `<div class="card state"><div class="ico ${cls}">${$(ico)}</div><div style="flex:1"><b>${t}</b><p>${p}</p>${acts || ''}</div></div>`;
fs.writeFileSync('picker-states.html', board('إضافة نموذج - الحالات', `
<div>${tag('2a. جارٍ التحميل')}<div class="card" style="padding:16px;display:grid;gap:14px" aria-busy="true"><div class="sub">جارٍ جلب النماذج المتاحة…</div>${[70, 90, 60, 80].map(w => `<div style="display:flex;gap:16px"><div class="sk" style="width:${w}%;max-width:180px"></div><div class="sk" style="width:25%"></div><div class="sk" style="width:15%"></div></div>`).join('')}</div></div>
<div>${tag('2b. المزود بلا مفتاح')}${stateCard('key', 'i-w', 'أضف مفتاح الواجهة البرمجية أولًا', 'لا يمكن جلب النماذج قبل إعداد مفتاح هذا المزود.', `<a class="lnk">الانتقال إلى المزوّدين<span class="flip">${$('back', 14)}</span></a>`)}</div>
<div>${tag('2c. المفتاح غير صالح (PROVIDER_KEY_INVALID)')}${stateCard('err', 'i-d', 'مفتاح الواجهة البرمجية مرفوض', 'رفض المزود المفتاح الحالي. استبدله بمفتاح صالح ثم أعد المحاولة.', `<a class="lnk">استبدال المفتاح<span class="flip">${$('back', 14)}</span></a>`)}</div>
<div>${tag('2d. تعذّر الوصول إلى المزود (502)')}${stateCard('wifi', 'i-d', 'تعذّر الوصول إلى المزود', 'لم نتمكن من جلب قائمة النماذج الآن. حاول مرة أخرى بعد قليل.', `<a class="btn sm">${$('refresh', 16)}إعادة المحاولة</a>`)}</div>
<div>${tag('2e. فارغ: لا نماذج لدى المزود (أو لا نتائج للبحث)')}<div class="card empty"><div class="ico">${$('box', 24)}</div><b>لا توجد نماذج مطابقة</b>غيّر كلمة البحث، أو <a class="lnk">أدخل النموذج يدويًا</a>.</div></div>
<div style="grid-column:1/-1">${tag('2f. الكتالوج غير متاح (catalogAvailable = false): الصفوف تُعرض بلا أسعار ولا تعبئة')}<div class="alert al-w" role="status">${$('warn')}<div>تعذّر الوصول إلى الكتالوج العام؛ أدخل البيانات والأسعار يدويًا.</div></div>${table(models.slice(0, 3), true)}</div>`));

// ---------- 3. model form ----------
const fld = (label, val, o = {}) => `<div class="f"><label>${label}${o.req ? ' <span class="req">*</span>' : ''}${o.cat ? `<span class="from">${$('info', 12)}من الكتالوج</span>` : ''}</label><div class="in ${o.ro ? 'ro' : ''}" style="${o.ltr ? 'direction:ltr;' : ''}">${o.lock ? `<span style="display:flex;color:var(--ink2)">${$('lock', 16)}</span>` : ''}<span>${val}</span>${o.unit ? `<span class="ph" style="margin-inline-start:auto">${o.unit}</span>` : ''}</div>${o.hint ? `<div class="hint">${o.hint}</div>` : ''}</div>`;
const form = `${crumb('النماذج', 'إضافة نموذج')}${stepper(2)}
<div class="card cp"><h3>النموذج</h3>
<div class="fgrid"><div class="f"><label>المزود</label><div class="in ro"><span style="display:flex;color:var(--ink2)">${$('lock', 16)}</span><span>OpenAI</span><a class="lnk" style="margin-inline-start:auto">تغيير</a></div></div>
<div class="f"><label>المعرّف عند المزود</label><div class="in ro"><span style="display:flex;color:var(--ink2)">${$('lock', 16)}</span>${L('gpt-4o')}<a class="lnk" style="margin-inline-start:auto">تغيير</a></div></div>
${fld('الاسم المعروض', 'GPT-4o', { req: 1, cat: 1 })}${fld('نافذة السياق', '128000', { req: 1, cat: 1, ltr: 1, unit: 'رمز' })}
${fld('أقصى رموز الإخراج', '16384', { req: 1, cat: 1, ltr: 1, unit: 'رمز' })}
<div class="f"><label>يقرأ الصور<span class="from">${$('info', 12)}من الكتالوج</span></label><div style="display:flex;align-items:center;gap:12px;height:44px"><div class="sw" style="background:var(--ok)"></div><span>مفعّل</span></div></div></div>
<div class="sub">يُنشأ النموذج معطّلًا، ويمكن تفعيله من صفحته.</div></div>
<div class="card cp" style="margin-block-start:16px"><h3>السعر الأولي</h3><p class="sub" style="margin-block-end:14px">بالدولار لكل مليون رمز. يمكن ترك الحقول فارغة وتحديد السعر لاحقًا.</p>
<div class="fgrid">${fld('سعر الإدخال', '2.50', { cat: 1, ltr: 1, unit: '$' })}${fld('سعر الإخراج', '10.00', { cat: 1, ltr: 1, unit: '$' })}${fld('سعر الإدخال المخزّن مؤقتًا', '1.25', { cat: 1, ltr: 1, unit: '$' })}
<div class="f"><label>سعر كتابة الذاكرة المؤقتة</label><div class="in" style="direction:ltr"><span class="ph">اختياري</span><span class="ph" style="margin-inline-start:auto">$</span></div></div></div></div>
<div class="card cp" style="margin-block-start:16px"><h3>الكتالوج</h3>
<div class="alert al-w" style="margin:0" role="status">${$('warn')}<div>يكلّف المزود أكثر فوق حجم سياق معيّن، ونحن نحتسب سعرًا واحدًا. اخفض نافذة السياق إلى حد الشريحة أو سعّر بالشريحة الأعلى.</div></div>
<div class="note" style="margin-block-start:12px"><b>لاحقًا (غير مرسوم، بانتظار حقل في الخادم):</b> مفتاح «مزامنة السعر مع الكتالوج» يُضاف هنا في الموضع نفسه، وتبقى الشريحة السعرية في هذا القسم.</div></div>
<div style="margin-block-start:16px">
<div class="alert al-w" role="status">${$('warn')}<div>المزود يوقف هذا النموذج؛ لا تعتمد عليه في الأوضاع الجديدة.</div></div>
<div class="dact"><a class="btn p">إضافة النموذج</a><a class="btn">إلغاء</a></div>
<div class="note" style="margin-block-start:12px"><b>ملاحظة:</b> تحذير «متوقف من المزود» يظهر هنا لنماذج deprecated فقط (مرسوم للتوضيح مع تحذير الشريحة). «إضافة النموذج» يفتح ReasonDialog واحدًا بسبب واحد، ويحفظ النموذج وسعره في طلب واحد.</div></div>`;
fs.writeFileSync('model-form.html', shell('إضافة نموذج', form, 'models'));

// ---------- 4. price updates ----------
const tabsRow = (on) => `<div class="tabs" role="tablist">${[['بانتظار المراجعة', 'open', 3], ['مطبّقة', 'applied'], ['متجاهلة', 'dismissed'], ['لم تعد سارية', 'superseded']].map(t => `<div class="tab${t[1] === on ? ' on' : ''}" role="tab">${t[0]}${t[2] != null ? `<span class="n">${t[2]}</span>` : ''}</div>`).join('')}</div>`;
const chipsRow = (on = 'all') => `<div class="chips" role="group" aria-label="نوع التحديث">${[['all', 'الكل', 3], ['large', 'تغيير كبير', 1], ['miss', 'سعر مفقود', 1], ['ret', 'نموذج متوقف', 1]].map(c => `<span class="chip${c[0] === on ? ' on' : ''}">${c[0] === on ? $('check', 16) : ''}${c[1]}<span class="n">${c[2]}</span></span>`).join('')}</div>`;
const hdrBox = (mode) => `<div class="card hdr"><div class="r1"><div style="flex:1"><p>تتم المزامنة كل 6 ساعات. تُطبَّق التغييرات حتى 50% تلقائيًا، والأكبر تنتظر مراجعتك.</p>
<div class="last"><span>${$('clock', 16)}آخر مزامنة: ${mode === 'stale' ? '9 أكتوبر 2026 · 06:00' : 'اليوم · 06:00'}</span><span>${$('cal', 16)}${mode === 'running' ? 'بدأت: 10:44 · بطلب من مسؤول' : 'التشغيل: تلقائي'}</span><span>${$('refresh', 16)}المزامنة القادمة: ${mode === 'stale' ? '—' : 'اليوم · 12:00'}</span></div></div>
${mode === 'running' ? `<a class="btn dis" aria-disabled="true" aria-busy="true">${$('refresh', 18)}جارٍ التحقق…</a>` : `<a class="btn p">${$('refresh', 18)}تشغيل المزامنة الآن</a>`}</div>
${mode === 'stale' ? `<div class="alert al-w" role="alert" style="margin:14px 0 0">${$('warn')}<div>لم تتم المزامنة منذ مدة؛ تحقّق من مهمة المزامنة.</div></div>` : ''}</div>`;
const kindB = { large: `<span class="badge b-warn">${$('warn', 14)}تغيير كبير</span>`, miss: `<span class="badge b-n">${$('info', 14)}سعر مفقود</span>`, ret: `<span class="badge b-dan">${$('err', 14)}نموذج متوقف</span>` };
const mlink = `<a class="lnk">عرض النموذج<span class="flip">${$('back', 14)}</span></a>`;
const rate = (l, o, n) => `<div class="rate"><div class="l">${l}</div><div class="v"><span class="old"><span class="cap">الحالي</span>${p$(o)}</span><span><span class="cap">المقترح</span>${p$(n)}</span></div></div>`;
const dates = (f, l) => `<div class="dates"><span>أول رصد: ${f}</span><span>آخر رصد: ${l}</span></div>`;
const fHead = (name, prov, id, kind, extra = '') => `<div class="fh"><div><h3>${name}</h3><div class="meta"><span>${prov}</span>${L(id)}${extra}</div></div>${kindB[kind]}</div>`;
const cLarge = (closed) => `<article class="card fcard">${fHead('GPT-4o', 'OpenAI', 'gpt-4o', 'large', `<span class="pct up" aria-label="نسبة التغيير">+62.50%</span>`)}
${closed ? `<div class="closed"><span><b>طُبِّق السعر</b> بواسطة ${L('sara.admin@bayan.com')}</span><span>13 أكتوبر 2026 · 14:20</span><span>السبب: يطابق إعلان المزود الأخير</span></div>` : ''}
<div class="rates">${rate('الإدخال', '2.50', '4.0625')}${rate('الإخراج', '10.00', '16.25')}${rate('الإدخال المخزّن', '1.25', '2.03125')}${rate('كتابة الذاكرة المؤقتة', null, null)}</div>
<div class="fd">${dates('12 أكتوبر 2026', 'اليوم · 06:00')}<div class="btns">${mlink}${closed ? '' : `<a class="btn p">تطبيق السعر</a><a class="btn">تجاهل</a>`}</div></div></article>`;
const cMiss = `<article class="card fcard">${fHead('GPT-4o mini', 'OpenAI', 'gpt-4o-mini', 'miss')}
<div class="alert al-w" style="margin-block-end:14px">${$('info')}<div>لا يوجد سعر في الكتالوج<span style="display:block;font-weight:400">السعر الحالي: الإدخال ${p$('0.15')} · الإخراج ${p$('0.60')}. لن يتغيّر السعر تلقائيًا.</span></div></div>
<div class="fd">${dates('10 أكتوبر 2026', 'اليوم · 06:00')}<div class="btns">${mlink}<a class="btn">تجاهل</a></div></div></article>`;
const modeChips = ms => `<div style="margin-block-end:14px"><div class="sub" style="margin-block-end:6px;font-weight:600">أوضاع مفعّلة تستخدمه</div>${ms.length ? `<div class="mchips">${ms.map(m => `<a class="mchip">${m}<span class="flip">${$('back', 14)}</span></a>`).join('')}</div>` : `<div class="sub" style="color:var(--ink)">لا تستخدمه أوضاع مفعّلة</div>`}</div>`;
const cRet = (ms) => `<article class="card fcard retired">${fHead('GPT-3.5 Turbo (0301)', 'OpenAI', 'gpt-3.5-turbo-0301', 'ret')}
<div class="alert al-d" style="margin-block-end:14px">${$('err')}<div><b>لم يعد المزود يقدّم هذا النموذج</b>قد تفشل الردود عليه. المزامنة لا توقف النماذج ولا الأوضاع؛ هذا قرار يتخذه المسؤول.</div></div>
${modeChips(ms)}<div class="fd">${dates('11 أكتوبر 2026', 'اليوم · 06:00')}<div class="btns">${mlink}<a class="btn">تجاهل</a></div></div></article>`;
const more = `<div style="display:flex;justify-content:center"><a class="btn">تحميل المزيد</a></div>`;
const pu = (body, mode) => `${hdrBox(mode)}${tabsRow('open')}${chipsRow()}${body}`;
fs.writeFileSync('price-updates.html', shell('تحديثات الأسعار', pu(`${cLarge()}${cMiss}${cRet(['الدردشة السريعة', 'التحليل المعمّق'])}${more}`), 'price'));

// ---------- 4b. states ----------
const emptyTab = (t, d) => `<div class="card empty"><div class="ico">${$('check', 24)}</div><b>${t}</b>${d}</div>`;
fs.writeFileSync('price-updates-states.html', board('تحديثات الأسعار - الحالات', `
<div>${tag('4a. المزامنة جارية: الزر معطّل «جارٍ التحقق…» (تشمل مزامنة مجدولة أو من مسؤول آخر)')}${hdrBox('running')}</div>
<div>${tag('4b. تحذير التأخر: آخر مزامنة قبل أكثر من 12 ساعة أو لم تحدث')}${hdrBox('stale')}</div>
<div>${tag('4c. تبويب «مطبّقة»: بطاقة مغلقة تعرض من حسمها ومتى والسبب (بلا أزرار إجراء)')}${tabsRow('applied')}${cLarge(true)}</div>
<div>${tag('4d. بطاقة نموذج متوقف بلا أوضاع مفعّلة')}${cRet([])}</div>
<div>${tag('4e. فارغ: بانتظار المراجعة')}${emptyTab('لا توجد تحديثات بانتظار المراجعة', 'ستظهر هنا تغييرات الأسعار الكبيرة والنماذج المتوقفة بعد أي مزامنة.')}</div>
<div>${tag('4f. فارغ: المطبّقة / المتجاهلة / التي لم تعد سارية (النص حسب التبويب)')}<div style="display:grid;gap:12px">${emptyTab('لا توجد تحديثات مطبّقة', 'ستظهر هنا الأسعار التي طبّقتها.')}${emptyTab('لا توجد تحديثات متجاهلة', 'ستظهر هنا التنبيهات التي تجاهلتها.')}${emptyTab('لا توجد تحديثات لم تعد سارية', 'تظهر هنا الاقتراحات التي حلّت محلها مزامنة أحدث.')}</div></div>
<div>${tag('4g. تحميل القائمة / خطأ قابل للاسترداد')}<div class="card state" aria-busy="true"><div class="ico i-n">${$('refresh')}</div><div><b>جارٍ تحميل التحديثات…</b><p>لحظات.</p></div></div>
<div style="height:12px"></div>${stateCard('err', 'i-d', 'تعذّر تحميل التحديثات', 'تحقق من الاتصال ثم أعد المحاولة.', `<a class="btn sm">${$('refresh', 16)}إعادة المحاولة</a>`)}</div>
<div>${tag('ملاحظة')}<div class="note"><b>تسمية التبويبات (مقترحة):</b> «بانتظار المراجعة / مطبّقة / متجاهلة / لم تعد سارية» بدل «مفتوحة» و«ملغاة بالمزامنة». «ملغاة بالمزامنة» تُفهم كأن المزامنة حذفتها؛ الحالة الفعلية (superseded) أن المزامنة اللاحقة أبطلت الاقتراح، فـ«لم تعد سارية» أوضح. الأعداد تظهر على تبويب المراجعة وعلى مرشحات النوع فقط.</div></div>`));

// ---------- 5. summary ----------
const cell = (v, l, cls = '') => `<div class="c ${cls}"><div class="v">${v}</div><div class="l">${l}</div></div>`;
const summary = (unreach) => unreach ? `<section class="card sum" aria-label="نتيجة المزامنة"><div class="sec"><h3>نتيجة المزامنة</h3><span class="sub">اليوم · 10:45 · بطلب من مسؤول</span></div>
<div class="alert al-w" role="status" style="margin:0">${$('warn')}<div><b>تعذّر الوصول إلى الكتالوج</b>لم تتغيّر أي أسعار. ${'تم فحص قوائم المزودين فقط.'}</div></div>
<div class="small sub" style="display:flex;gap:20px;margin-block-start:12px"><span>مزوّدون تم فحصهم: <b>${money('3')}</b></span><span>تعذّر الوصول إليهم: <b>${money('1')}</b></span><span>نماذج متوقفة: <b>${money('1')}</b></span></div></section>` :
`<section class="card sum" aria-label="نتيجة المزامنة"><div class="sec"><h3>نتيجة المزامنة</h3><span class="sub">اليوم · 10:45 · بطلب من مسؤول</span></div>
<div class="grid6">${cell(money('42'), 'تم فحصه')}${cell(money('5'), 'طُبّق تلقائيًا')}${cell(money('31'), 'دون تغيير')}${cell(money('2'), 'بانتظار المراجعة')}${cell(money('1'), 'بلا سعر في الكتالوج')}${cell(money('3'), 'غير موجود في الكتالوج')}</div>
<div class="small"><span>تخطّي: <b>${money('0')}</b></span><span>فشل: <b>${money('1')}</b></span><span>مزوّدون تم فحصهم: <b>${money('3')}</b></span><span>تعذّر الوصول إلى مزوّدين: <b>${money('0')}</b></span><span>تم تجاهله: <b>${money('2')}</b></span></div>
<div class="alert al-d" style="margin:0" role="alert">${$('err')}<div><b>نماذج متوقفة عند المزود: ${money('1')}</b>منها ${money('1')} مستخدم في أوضاع مفعّلة. راجعها في القائمة أدناه.</div></div></section>`;
fs.writeFileSync('sync-summary.html', board('ملخص المزامنة', `<div>${tag('5a. بعد تشغيل ناجح (تظهر أعلى الصفحة عند انتهاء التشغيل وتُغلق عند التنقل)')}${summary(false)}</div>
<div>${tag('5b. الكتالوج غير متاح')}${summary(true)}</div>
<div>${tag('5c. ملاحظة')}<div class="note"><b>تسميات الأعداد مقترحة</b> وتحتاج مطابقة مع حقول CatalogSyncSummaryDto عند الاستيراد. لا حسابات على الواجهة: كل رقم قادم من الخادم. حالة الخطر تظهر فقط عندما يكون عدد النماذج المتوقفة أكبر من 0، وتُخفى المجموعة الرقمية الصغرى للأصفار إن رغب المسؤول (قرار مفتوح).</div></div>`, 'g2'.replace('g2', 'g2')));

// ---------- 6. dialogs ----------
const reason = (v) => `<div class="f"><label>السبب <span class="req">*</span></label><div class="in ta"><span class="${v ? '' : 'ph'}">${v || 'يُسجَّل في سجل التدقيق'}</span></div></div>`;
const acts = (label, cls = 'p', dis) => `<div class="dact"><a class="btn ${cls}">${label}</a><a class="btn">إلغاء</a></div>`;
const dlg = (tg, t, sub, inner) => `<div>${tag(tg)}<div class="dlg" role="dialog" aria-modal="true"><h3>${t}</h3><p class="sub">${sub}</p>${inner}</div></div>`;
const miniCmp = `<div class="plan" style="display:grid;gap:6px"><div style="display:flex;justify-content:space-between"><span class="sub">الإدخال (لكل مليون رمز)</span><span>${p$('2.50')} ← ${p$('4.0625')}</span></div><div style="display:flex;justify-content:space-between"><span class="sub">الإخراج (لكل مليون رمز)</span><span>${p$('10.00')} ← ${p$('16.25')}</span></div><div style="display:flex;justify-content:space-between"><span class="sub">نسبة التغيير</span><span class="pct up">+62.50%</span></div></div>`;
fs.writeFileSync('dialogs.html', board('نوافذ تحديثات الأسعار', `
${dlg('6a. تطبيق السعر', 'تطبيق السعر', `GPT-4o · ${L('gpt-4o')}`, `${miniCmp}<p class="sub" style="margin-block-end:14px">يصبح السعر المقترح هو السعر الحالي للنموذج من الآن، ولا يغيّر تكلفة الرسائل السابقة.</p>${reason()}${acts('تطبيق السعر')}`)}
${dlg('6b. تجاهل (تغيير كبير / سعر مفقود)', 'تجاهل التحديث', `GPT-4o · ${L('gpt-4o')}`, `<div class="alert al-w">${$('info')}<div>لن يُعرض هذا الاقتراح مرة أخرى.</div></div>${reason()}${acts('تجاهل')}`)}
${dlg('6c. تجاهل نموذج متوقف (تجاهل دائم)', 'تجاهل تنبيه النموذج المتوقف', `GPT-3.5 Turbo (0301) · ${L('gpt-3.5-turbo-0301')}`, `<div class="alert al-d" role="alert">${$('err')}<div><b>تجاهل دائم</b>يخفي التجاهل هذا التنبيه نهائيًا. يبقى النموذج مفعّلًا، وقد يرفضه المزود بالفعل.</div></div>${reason()}${acts('تجاهل نهائيًا', 'dp')}`)}
${dlg('6d. تشغيل المزامنة الآن', 'تشغيل المزامنة الآن', 'فحص الكتالوج العام وقوائم المزودين', `<p style="margin-block-end:14px">يتحقق من الكتالوج العام وقوائم المزودين. قد يستغرق أكثر من 30 ثانية، ويمكنك متابعة العمل أثناء ذلك.</p>${reason()}${acts('تشغيل المزامنة')}`)}
${dlg('6e. خطأ CATALOG_FINDING_OUTDATED داخل نافذة التطبيق (السبب محفوظ)', 'تطبيق السعر', `GPT-4o · ${L('gpt-4o')}`, `<div class="alert al-d" role="alert">${$('err')}<div><b>هذا الاقتراح لم يعد مطابقًا للكتالوج</b>تغيّر السعر منذ رصده. شغّل المزامنة للحصول على اقتراح محدّث.<div style="margin-block-start:8px"><a class="btn sm">${$('refresh', 16)}تشغيل المزامنة الآن</a></div></div></div>${miniCmp}${reason('يطابق إعلان المزود الأخير')}<div class="dact"><a class="btn dis" aria-disabled="true">تطبيق السعر</a><a class="btn">إلغاء</a></div>`)}
<div>${tag('6f. ملاحظات')}<div class="note"><b>تعتمد كلها على ReasonDialog في f4a</b>: السبب إلزامي، يُحفظ عند الخطأ القابل للاسترداد، ويحمل مفتاح idempotency. في 6e يبقى الزر معطّلًا حتى تُشغَّل المزامنة، ثم يُغلق المربع وتتحدّث القائمة. أخطاء NOT_OPEN وNOT_FOUND تُغلق المربع مع رسالة وتحدّث القائمة؛ NOT_APPLICABLE لا يحدث لأن الزر مخفي لغير تغيير كبير.</div></div>`));

// ---------- mobile ----------
const mobRate = rate;
fs.writeFileSync('mobile.html', `${head('تحديثات الأسعار - جوال')}<body style="background:#CBD5E1;display:flex;justify-content:center;padding:24px"><div class="mob">
<header class="top"><h1>تحديثات الأسعار</h1><a class="menubtn" aria-label="القائمة">${$('prov', 24)}</a></header>
<div class="content"><div class="card hdr" style="padding:16px"><div class="r1"><p>تتم المزامنة كل 6 ساعات. تُطبَّق التغييرات حتى 50% تلقائيًا، والأكبر تنتظر مراجعتك.</p><a class="btn p" style="width:100%;justify-content:center">${$('refresh', 18)}تشغيل المزامنة الآن</a></div><div class="last"><span>${$('clock', 16)}آخر مزامنة: اليوم · 06:00</span></div></div>
${tabsRow('open')}${chipsRow()}
<article class="card fcard" style="padding:16px">${fHead('GPT-4o', 'OpenAI', 'gpt-4o', 'large')}<div style="margin-block-end:12px"><span class="pct up">+62.50%</span></div>
<div class="rates">${mobRate('الإدخال', '2.50', '4.0625')}${mobRate('الإخراج', '10.00', '16.25')}${mobRate('الإدخال المخزّن', '1.25', '2.03125')}${mobRate('كتابة الذاكرة المؤقتة', null, null)}</div>
<div class="fd" style="display:grid">${dates('12 أكتوبر 2026', 'اليوم · 06:00')}${mlink}<div class="btns"><a class="btn p">تطبيق السعر</a><a class="btn">تجاهل</a></div></div></article></div></div></body></html>`);
console.log('built');
