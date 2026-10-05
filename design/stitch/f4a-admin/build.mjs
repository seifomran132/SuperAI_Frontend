// Generates the hand-built F4a admin screens. Run: node build.mjs
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

const users = [
  ['sara.alharbi@example.com', 'سارة الحربي', 'ok', 0, 'اليوم 10:44', '2 أكتوبر 2026'],
  ['khaled.m@example.com', 'خالد المطيري', 'ok', 0, 'أمس 21:05', '28 سبتمبر 2026'],
  ['admin@bayan.com', 'فريق بيان', 'ok', 1, 'اليوم 09:12', '1 سبتمبر 2026'],
  ['noura.q@example.com', 'نورة القحطاني', 'warn', 0, '12 سبتمبر 2026', '20 أغسطس 2026'],
  ['omar.f@example.com', 'عمر الفهد', 'ok', 0, 'منذ 3 أيام', '15 أغسطس 2026'],
  ['lina.s@example.com', 'لينا السبيعي', 'ok', 0, 'أمس 14:30', '9 أغسطس 2026'],
  ['old.user@example.com', 'مستخدم سابق', 'dan', 0, '3 يونيو 2026', '2 مايو 2026'],
  ['majed.d@example.com', 'ماجد الدوسري', 'ok', 0, '1 أكتوبر 2026', '30 يوليو 2026'],
  ['reem.a@example.com', 'ريم العتيبي', 'ok', 0, 'اليوم 08:20', '22 يوليو 2026'],
  ['yousef.k@example.com', 'يوسف الكعبي', 'warn', 0, '5 سبتمبر 2026', '10 يوليو 2026'],
];
const st = { ok: ['b-ok', 'check', 'نشط'], warn: ['b-warn', 'stop', 'موقوف'], dan: ['b-dan', 'err', 'محذوف'] };
const badge = k => `<span class="badge ${st[k][0]}">${$(st[k][1], 14)}${st[k][2]}</span>`;
const rows = users.map((u, i) => `<tr><td>${em(u[0])}</td><td style="font-weight:500">${u[1]}</td><td>${badge(u[2])}</td>
<td>${u[3] ? `<span class="badge b-pro">${$('shield', 14)}مسؤول</span>` : '<span class="sub">-</span>'}</td><td class="sub">${u[4]}</td><td class="sub">${u[5]}</td>
<td style="width:56px"><div class="kebab" aria-label="إجراءات">${$('dots')}${i === 1 ? `<div class="menu"><div>${$('open', 18)}فتح</div><div>${$('plan', 18)}تفعيل باقة</div><div>${$('wallet', 18)}إضافة رصيد</div></div>` : ''}</div></td></tr>`).join('');
fs.writeFileSync('users.html', shell('المستخدمون', `
<div class="bar"><div class="in grow"><span class="ph" style="display:flex">${$('search')}</span><span class="ph">ابحث بالبريد الإلكتروني أو الاسم</span></div>
<div class="sel"><span>الحالة: الكل</span>${$('down', 18)}</div><div class="sel"><span>الصلاحية: الكل</span>${$('down', 18)}</div></div>
<div class="card tw"><table><thead><tr><th>البريد الإلكتروني</th><th>الاسم</th><th>الحالة</th><th>الصلاحية</th><th>آخر دخول</th><th>تاريخ التسجيل</th><th></th></tr></thead><tbody>${rows}</tbody></table>
<div class="pager"><span>${money('1–20')} من ${money('134')}</span><div class="pg"><span class="sub">الصفحة 1 من 7</span><div class="ib off" aria-label="السابق"><span style="display:flex">${$('back')}</span></div><div class="ib" aria-label="التالي"><span class="flip">${$('back')}</span></div></div></div></div>`));

const header = tab => `<div class="crumb"><span>المستخدمون</span><span class="flip">${$("back", 14)}</span><span>سارة الحربي</span></div>
<div class="hd"><div class="t"><h2>سارة الحربي</h2>${em('sara.alharbi@example.com')}${badge('ok')}<span class="badge b-n">${$('check', 14)}البريد مؤكد</span></div></div>
<div class="tabs" role="tablist">${['نظرة عامة', 'الاشتراك', 'الرصيد'].map(t => `<div class="tab${t === tab ? ' on' : ''}" role="tab">${t}</div>`).join('')}</div>`;
const A = 'admin@bayan.com';
const L = [
  ['تسجيل دفعة', '+10.00$', 'p', A, 'تحويل بنكي - فبراير', 'INV-20261001-07', '3 أكتوبر 2026 · 11:20', '24.48$'],
  ['استخدام المحادثة', '-0.0042$', 'n', 0, '-', 'msg_8f3a21', 'اليوم · 10:44', '14.48$'],
  ['استخدام المحادثة', '-0.0015$', 'n', 0, '-', 'msg_8f3a1c', 'اليوم · 10:42', '14.49$'],
  ['استرداد', '+0.12$', 'p', 0, 'فشل الرد', 'msg_8e91b0', 'أمس · 21:05', '14.49$'],
  ['تعديل يدوي', '-1.13$', 'n', A, 'تصحيح خطأ إدخال', '-', '2 أكتوبر 2026 · 18:30', '14.37$'],
  ['رصيد الباقة', '+10.00$', 'p', A, 'تفعيل باقة [اسم الباقة]', 'sub_41c7', '1 أكتوبر 2026 · 08:00', '15.50$'],
  ['انتهاء الرصيد', '-0.40$', 'n', 0, 'انتهاء الباقة', '-', '4 سبتمبر 2026 · 00:00', '0.00$'],
];
const lrows = L.map(r => `<tr><td style="font-weight:500">${r[0]}</td><td>${money(r[1], r[2] === 'p' ? 'pos' : 'neg')}</td><td>${money(r[7])}</td>
<td>${r[3] ? `مسؤول: ${em(r[3])}` : 'النظام'}</td><td class="sub">${r[4]}</td><td>${r[5] === '-' ? '<span class="sub">-</span>' : `<span class="ltr sub">${r[5]}</span>`}</td><td class="sub">${r[6]}</td></tr>`).join('');
fs.writeFileSync('user-detail.html', shell('تفاصيل المستخدم', `${header('الرصيد')}
<div class="stats"><div class="card stat big"><div class="sub">المتاح للإنفاق</div><div class="v">${money('14.48$')}</div></div>
<div class="card stat"><div class="sub">الرصيد الكلي</div><div class="v">${money('14.50$')}</div></div><div class="card stat"><div class="sub">محجوز لردود جارية</div><div class="v">${money('0.02$')}</div></div></div>
<div class="sec"><h3>سجل العمليات</h3><div style="display:flex;gap:10px"><a class="btn">${$('wallet', 18)}تسجيل دفعة</a><a class="btn p">${$('plus', 18)}إضافة أو خصم رصيد</a></div></div>
<div class="card tw"><table><thead><tr><th>النوع</th><th>المبلغ</th><th>الرصيد بعد العملية</th><th>المنفّذ</th><th>السبب</th><th>المرجع</th><th>التاريخ</th></tr></thead><tbody>${lrows}</tbody></table>
<div class="more"><a class="btn sm">تحميل المزيد</a></div></div>`));

const H = [
  ['[اسم الباقة]', '1 أكتوبر 2026', '1 نوفمبر 2026', 'نشطة', 'ok'],
  ['[اسم الباقة]', '1 سبتمبر 2026', '4 سبتمبر 2026', 'منتهية', 'n'],
  ['[باقة تجريبية]', '1 أغسطس 2026', '1 سبتمبر 2026', 'منتهية', 'n'],
];
fs.writeFileSync('user-tabs.html', shell('تفاصيل المستخدم', `${header('نظرة عامة')}
<div class="cols"><div>
<div class="tag">تبويب «نظرة عامة»</div>
<div class="card"><div class="cp" style="padding-block-end:4px"><h3>بيانات الحساب</h3></div>
<dl class="facts"><dt>الاسم</dt><dd>سارة الحربي</dd><dt>البريد الإلكتروني</dt><dd>${em('sara.alharbi@example.com')}</dd><dt>المعرّف</dt><dd>${em('b3c1f0aa-92d4-4e1b')}</dd><dt>الحالة</dt><dd>${badge('ok')}</dd><dt>الصلاحية</dt><dd>مستخدم عادي</dd><dt>آخر دخول</dt><dd>اليوم · 10:44</dd><dt>تاريخ التسجيل</dt><dd>2 أكتوبر 2026</dd></dl>
<div class="cp" style="padding-block-start:0;padding-block-end:6px"><div class="act"><div><b>إيقاف الحساب</b><p>لن يتمكن المستخدم من الدخول أو الدردشة حتى إعادة التفعيل.</p></div><a class="btn d">إيقاف الحساب</a></div>
<div class="act"><div><b>إعادة التفعيل</b><p>يظهر بدل «إيقاف الحساب» عندما يكون الحساب موقوفًا.</p></div><a class="btn">إعادة التفعيل</a></div>
<div class="act"><div><b>منح صلاحية مسؤول</b><p>يصل المستخدم إلى لوحة الإدارة وكل إجراءاتها.</p></div><a class="btn">منح صلاحية مسؤول</a></div>
<div class="act"><div><b>إزالة الصلاحية</b><p>يظهر بدل «منح» للمسؤولين. لا يمكن إزالتها عن نفسك أو عن آخر مسؤول.</p></div><a class="btn">إزالة الصلاحية</a></div></div></div></div>
<div><div class="tag">تبويب «الاشتراك»</div>
<div class="card cp"><h3>الباقة الحالية</h3><div class="plan"><div style="display:flex;justify-content:space-between"><b style="font-weight:600;font-size:16px">[اسم الباقة]</b><span class="badge b-ok">${$('check', 14)}نشطة</span></div>
<div class="sub" style="margin-block-start:6px;display:flex;gap:6px;align-items:center">${$('cal', 16)}تنتهي في 1 نوفمبر 2026</div></div>
<div style="display:flex;gap:10px"><a class="btn p">تفعيل باقة</a><a class="btn d">إنهاء الباقة</a></div></div>
<div class="sec" style="margin-block-start:20px"><h3>سجل الاشتراكات</h3></div>
<div class="card tw"><table><thead><tr><th>الباقة</th><th>البداية</th><th>النهاية</th><th>الحالة</th></tr></thead><tbody>${H.map(h => `<tr><td style="font-weight:500">${h[0]}</td><td class="sub">${h[1]}</td><td class="sub">${h[2]}</td><td><span class="badge ${h[4] === 'ok' ? 'b-ok' : 'b-n'}">${h[3]}</span></td></tr>`).join('')}</tbody></table></div></div></div>`));

const reason = err => `<div class="f"><label>السبب <span class="req">*</span></label><div class="in ta ${err ? 'e' : ''}"><span class="ph">يُسجَّل في سجل التدقيق</span></div>${err ? `<div class="err">${$('err', 16)}السبب مطلوب.</div>` : ''}</div>`;
const apiErr = msg => `<div class="alert al-d" role="alert">${$('err')}<div><b>تعذّر تنفيذ الإجراء</b>${msg}</div></div>`;
const acts = (label, cls = 'p') => `<div class="dact"><a class="btn ${cls}">${label}</a><a class="btn">إلغاء</a></div>`;
const dlg = (tag, t, sub, inner) => `<div><div class="tag">${tag}</div><div class="dlg" role="dialog"><h3>${t}</h3><p class="sub">${sub}</p>${inner}</div></div>`;
const moneyIn = (v, e) => `<div class="in ${e ? 'e' : ''}" style="direction:ltr"><span>${v}</span><span class="ph" style="margin-inline-start:auto">USD</span></div>`;
fs.writeFileSync('dialogs.html', `${head('نوافذ الإدارة')}<body><div class="dlgs">
${dlg('1. تفعيل باقة - خطأ في حقل', 'تفعيل باقة', 'المستخدم: سارة الحربي', `<div class="f"><label>الباقة <span class="req">*</span></label><div class="sel"><span>[اسم الباقة]</span>${$('down', 18)}</div></div>
<div class="f"><label>تاريخ الانتهاء (اختياري)</label><div class="in"><span class="ph">يوم / شهر / سنة</span></div><div class="hint">شهر واحد افتراضيًا</div></div>${reason(true)}${acts('تفعيل الباقة')}`)}
${dlg('2. إضافة أو خصم رصيد - خطأ في حقل', 'إضافة أو خصم رصيد', 'المستخدم: سارة الحربي', `<div class="f"><label>المبلغ <span class="req">*</span></label>${moneyIn('-0.5.0', true)}<div class="hint">استخدم - للخصم</div><div class="err">${$('err', 16)}أدخل مبلغًا صحيحًا، مثل 5.00 أو -2.50.</div></div>${reason(false)}${acts('تنفيذ')}`)}
${dlg('3. تسجيل دفعة - خطأ من الخادم', 'تسجيل دفعة', 'المستخدم: سارة الحربي', `${apiErr('رقم مرجع الدفعة مستخدم من قبل. تحقق من الرقم ولا تكرر التسجيل.')}
<div class="f"><label>المبلغ <span class="req">*</span></label>${moneyIn('10.00')}</div>
<div class="f"><label>مرجع الدفعة <span class="req">*</span></label><div class="in" style="direction:ltr"><span>INV-20261001-07</span></div><div class="hint">رقم الحوالة أو الفاتورة. لا يمكن تسجيل المرجع نفسه مرتين.</div></div>
<div class="f"><label>السبب <span class="req">*</span></label><div class="in ta"><span>تحويل بنكي - فبراير</span></div></div>${acts('تسجيل الدفعة')}`)}
${dlg('4. إنهاء الباقة - تأكيد خطير', 'إنهاء الباقة', 'المستخدم: سارة الحربي · [اسم الباقة]', `<div class="alert al-w" role="alert">${$('warn')}<div><b>سينتهي كل رصيد المستخدم فورًا</b>لا يمكن التراجع عن هذا الإجراء.</div></div>${reason(true)}${apiErr('لا توجد باقة نشطة لهذا المستخدم.')}${acts('إنهاء الباقة', 'dp')}`)}
</div></body></html>`);
