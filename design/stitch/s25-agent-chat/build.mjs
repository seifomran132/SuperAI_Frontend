// Hand-built S25 "graphic designer agent in the chat" boards. Run: node build.mjs -> desktop.html, mobile.html
// PNGs: node render.mjs (headless Chrome via Playwright). Shared look comes from s24-parts.mjs (copied from S24).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { css as baseCss, ic, fileWord, logoSvg, hex, swRow, xbtn, logoT, photoT, pdfT, upT, failT } from './s24-parts.mjs';
const dir = path.dirname(fileURLToPath(import.meta.url));

const css = baseCss + `
.fr.c{width:760px}
.top{height:64px}
.top .lt{display:flex;align-items:center;gap:12px}
.av{width:36px;height:36px;border-radius:50%;background:var(--brand);color:#fff;display:grid;place-items:center;font-size:13px;font-weight:600}
.btn.sm{height:40px;padding-inline:14px;font-weight:500}
.rec .i.on{background:var(--muted-s);box-shadow:inset -3px 0 0 var(--brand);border-radius:8px;padding-inline:8px;font-weight:600}
.rec .i{align-items:center;gap:8px}.rec .i span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.chat{display:flex;flex-direction:column;min-height:716px;background:var(--bg)}
.col{display:flex;flex-direction:column;background:var(--bg);min-height:520px}
.col.tall{min-height:700px}
.msgs{flex:1;padding:24px 32px;display:flex;flex-direction:column;gap:18px;width:100%;max-width:924px;margin-inline:auto}
.c .msgs{padding:20px 24px}.m .msgs{padding:16px 12px;gap:14px}
.um{align-self:flex-start;max-width:78%;background:var(--muted-s);border-radius:16px;padding:10px 16px;font-size:16px;line-height:28px}
.um.pad0{padding:8px}
.uth{display:flex;gap:8px}.uth span{width:72px;height:72px;border-radius:12px;overflow:hidden;border:1px solid var(--bs);background:#fff;display:block}.uth svg{width:100%;height:100%}
.usw{display:flex;gap:8px;align-items:center;padding:4px 2px}.usw i{width:28px;height:28px;border-radius:50%;border:1px solid rgba(15,23,42,.2);display:block}
.amsg{background:#fff;border:1px solid var(--bs);border-radius:16px;padding:14px 18px;display:flex;flex-direction:column;gap:8px}
.amsg p{font-size:16px;line-height:28px}
.amsg.ok{background:var(--ok-c);border-color:var(--ok-b)}
.achip{display:inline-flex;align-items:center;gap:6px;align-self:flex-start;background:var(--brand);color:#fff;border-radius:9999px;padding:1px 10px;font-size:12px;font-weight:500}
.dock{padding:8px 32px 16px}.c .dock{padding:8px 24px 16px}.m .dock{padding:8px 12px 12px}
.dock .notice{max-width:860px;margin-inline:auto;margin-block-end:8px}
.panel{max-width:860px;margin-inline:auto;background:#fff;border:1px solid var(--bc);border-radius:24px;padding:16px;box-shadow:0 4px 6px -1px rgba(15,23,42,.04);display:flex;flex-direction:column;gap:12px;position:relative}
.m .panel{padding:14px}
.panel.err{border:2px solid var(--dan);padding:15px}
.panel.busy .busyin{opacity:.55;pointer-events:none}
.pa{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.pa .r{display:flex;gap:10px;align-items:center}
.m .pa .r{width:100%}.m .pa .r .btn.full1{flex:1}
.send{width:44px;height:44px;border-radius:50%;background:var(--brand);color:#fff;display:grid;place-items:center;border:0;flex-shrink:0}
.send.off{background:var(--muted-s);color:#64748B;border:1px solid var(--bs)}
.ta2{min-height:64px;font-size:16px;line-height:28px;padding:2px 4px}
.ta2.big{min-height:96px}
.cs{font-size:13px;color:var(--ink2)}.cs.bad{color:var(--dan);font-weight:600}
.pl{font-size:14px;font-weight:500;color:var(--ink)}
.f2{border:1px solid var(--bc);border-radius:8px;padding:8px 12px;display:flex;flex-direction:column;gap:2px;min-height:44px;font-size:16px}
.f2.bad{border:2px solid var(--dan);padding:7px 11px}
.bgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.m .bgrid{grid-template-columns:1fr}
.bk{display:flex;gap:12px;align-items:center;min-height:68px;padding:10px 12px;border:1px solid var(--bc);border-radius:12px;background:#fff;text-align:start;font:inherit;color:var(--ink)}
.bk .th{width:44px;height:44px;font-size:20px;border-radius:10px}
.bk b{font-weight:600;font-size:15px;display:block;line-height:22px}
.bk .sub{font-size:13px;color:var(--ink2)}
.bk.new{border-style:dashed;border-width:2px;font-weight:600}
.bk.new .pi{width:44px;height:44px;border-radius:10px;background:var(--muted-s);display:grid;place-items:center;flex-shrink:0}
.bk.dis{background:var(--muted-s);border-color:var(--bs);color:#64748B}
.chips{display:flex;flex-wrap:wrap;gap:10px}
.ch{min-height:44px;padding-inline:18px;border:1px solid var(--bc);border-radius:9999px;background:#fff;display:inline-flex;align-items:center;font:500 15px 'IBM Plex Sans Arabic',sans-serif;color:var(--ink)}
.ch.foc{outline:2px solid var(--pro);outline-offset:2px}
.or{display:flex;align-items:center;gap:12px;color:var(--ink2);font-size:13px}.or:before,.or:after{content:'';flex:1;height:1px;background:var(--bs)}
.c .files{grid-template-columns:repeat(4,1fr)}.m .files{grid-template-columns:repeat(2,1fr)}
.sumc{border:1px solid var(--bs);border-radius:16px;overflow:hidden}
.sr{display:flex;gap:12px;align-items:center;padding:10px 14px;border-block-end:1px solid var(--bs)}
.sr:last-child{border:0}
.sr .l{width:120px;color:var(--ink2);font-size:14px;flex-shrink:0}
.sr .v{flex:1;min-width:0;font-size:15px;display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.sr .v .th{width:40px;height:40px;border-radius:8px;font-size:16px}
.sr .v .sw{width:24px;height:24px;border-radius:50%}
.sr .v .mt{width:40px;height:40px;border-radius:8px;overflow:hidden;border:1px solid var(--bs);display:block}.sr .v .mt svg{width:100%;height:100%}
.m .sr{flex-wrap:wrap;gap:4px 12px}.m .sr .l{width:auto;flex:1}.m .sr .v{flex-basis:100%;order:3}
.m .sr .tx{order:2}.m .sr>span[style]{display:none}.m .scr{max-height:380px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;padding-inline-end:2px}.scr{display:flex;flex-direction:column;gap:12px}
.tx{background:none;border:0;color:var(--pro);font:600 14px 'IBM Plex Sans Arabic',sans-serif;min-height:44px;padding-inline:8px;text-decoration:underline;text-underline-offset:3px}
.comp{max-width:860px;margin-inline:auto;background:#fff;border:1px solid var(--bc);border-radius:24px;padding:12px 16px;box-shadow:0 4px 6px -1px rgba(15,23,42,.04);display:flex;flex-direction:column;gap:8px;min-height:116px;justify-content:space-between}
.comp .ph{padding:4px}
.mw{position:relative}
.mchip{display:inline-flex;gap:6px;align-items:center;border:1px solid #99F6E4;background:#F0FDFA;color:#0F766E;border-radius:9999px;padding:4px 14px;min-height:40px;font-size:14px;font-weight:500}
.help2{text-align:center;color:var(--ink2);font-size:13px;margin-block-start:8px}
.menu{position:absolute;inset-inline-start:0;bottom:calc(100% + 8px);width:380px;background:#fff;border:1px solid var(--bs);border-radius:16px;box-shadow:0 12px 24px -6px rgba(15,23,42,.18);padding:8px;z-index:5}
.m .menu{width:340px}
.mi{display:flex;gap:12px;align-items:flex-start;padding:10px 12px;border-radius:12px;min-height:44px}
.mi.sel{background:var(--muted-s)}
.mi .dt{width:10px;height:10px;border-radius:50%;margin-block-start:8px;flex-shrink:0}
.mi b{font-size:15px;font-weight:600;display:inline-block}.mi .d{font-size:13px;color:var(--ink2);line-height:20px;margin-block-start:2px}
.mi .ag{width:28px;height:28px;border-radius:8px;background:var(--brand);color:#fff;display:grid;place-items:center;flex-shrink:0;margin-block-start:-2px}
.mh{padding:10px 12px 4px;font-size:13px;font-weight:600;color:var(--ink2);border-block-start:1px solid var(--bs);margin-block-start:6px}
.sbadge{display:inline-flex;align-items:center;gap:4px;padding:0 8px;border-radius:9999px;font-size:12px;font-weight:500;background:var(--muted-s);color:var(--ink2);border:1px solid var(--bs);margin-inline-start:6px}
.sbadge.dk{background:var(--brand);color:#fff;border-color:var(--brand)}
.hero{display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px}
.hero .mono{width:56px;height:56px;border-radius:12px;font-size:24px}
.hero h2{font-size:28px;font-weight:700;line-height:44px}.hero p{color:var(--ink2);font-size:16px}
.sug2{display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;max-width:640px}.m .sug2{grid-template-columns:1fr}
.sug2 div{background:#fff;border:1px solid var(--bs);border-radius:16px;padding:18px 16px;font-size:15px;min-height:64px;display:flex;align-items:center}
.sec2{width:100%;max-width:640px;text-align:start;font-size:13px;font-weight:600;color:var(--ink2);margin-block-start:6px}
.agc{width:100%;max-width:640px;display:flex;gap:14px;align-items:center;background:#fff;border:1px solid var(--bc);border-radius:16px;padding:14px 16px;text-align:start}
.agc .ico{width:48px;height:48px;border-radius:12px;background:var(--brand);color:#fff;display:grid;place-items:center;flex-shrink:0}
.agc b{font-size:16px;font-weight:600;display:block}.agc span.d{color:var(--ink2);font-size:14px;line-height:22px}
.empty-main{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:32px 24px}
.m .empty-main{padding:20px 14px;gap:12px;justify-content:flex-start}
.kb{height:250px;background:#D1D5DB;display:grid;place-items:center;color:#475569;font-size:13px;border-block-start:1px solid #9CA3AF}
.spin{animation:sp 1s linear infinite}@keyframes sp{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.spin{animation:none}}
.mtop h1{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
`;

const font = '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">';
const P2 = { send: '<path d="M5 12h14M12 5l7 7-7 7"/>', palette: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7" r="1"/><circle cx="15.5" cy="7" r="1"/>', bolt: '<path d="M13 2 3 14h8l-1 8 10-12h-8z"/>', imgp: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>', pencil: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>', chevd: '<path d="m6 9 6 6 6-6"/>' };
const ic2 = (n, s = 20) => `<span style="display:inline-flex;flex-shrink:0"><svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P2[n]}</svg></span>`;
const I = (n, s) => (P2[n] ? ic2(n, s) : ic(n, s));

const AG = 'مصمم جرافيك';
const BR = 'مقهى الندى';
const cols = ['#7A3E1D', '#F2E3CF', '#2F5D50', '#C9A24B'];

// ---- messages
const aq = (t, o = {}) => `<div class="amsg ${o.ok ? 'ok' : ''}"><span class="achip">${I('palette', 14)} ${AG}</span>${o.ok ? `<div style="display:flex;gap:8px;align-items:flex-start;color:var(--ok);font-weight:600">${ic('check', 20)}<span>${t[0]}</span></div><p>${t[1]}</p>` : `<p>${t}</p>`}</div>`;
const ub = (t) => `<div class="um">${t}</div>`;
const ubTh = (ks) => `<div class="um pad0"><div class="uth" aria-label="الملفات المرفقة">${ks.map((k) => `<span>${k.startsWith('<') ? k : logoSvg(k)}</span>`).join('')}</div></div>`;
const ubSw = (cs) => `<div class="um"><div class="usw" aria-label="الألوان">${cs.map((c) => `<i style="background:${c}"></i>`).join('')}</div></div>`;
const photoSvg = (c1, c2) => `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"><rect width="100" height="100" fill="${c1}"/><circle cx="62" cy="40" r="22" fill="${c2}"/><rect y="70" width="100" height="30" fill="rgba(0,0,0,.18)"/></svg>`;

const Q = {
  name: 'أهلًا بك! نجهّز هوية علامتك أولًا ثم نُعدّ طلب التصميم. ما اسم علامتك التجارية؟',
  logo: 'هل لديك شعار؟ ارفعه هنا وسنقترح عليك ألوانًا منه. يمكنك تخطّي هذه الخطوة.',
  colors: 'ما ألوان علامتك؟ رتّبها من الأهم إلى الأقل أهمية.',
  style: 'كيف تصف أسلوب علامتك؟ اختر وصفًا قريبًا أو اكتب وصفك.',
  fonts: 'كيف تبدو خطوطك؟ صفها بكلماتك، فلا نحتاج اسم الخط. يمكنك تخطّي هذه الخطوة.',
  extras: 'هل لديك تصاميم سابقة أو دليل للهوية؟ ارفعها لنسترشد بها. يمكنك تخطّي هذه الخطوة.',
  sumB: `هذه هوية «${BR}». راجعها قبل أن نتابع.`,
  pick: 'اختر العلامة التي نصمّم لها، أو أضف علامة جديدة.',
  format: 'ما نوع التصميم الذي تريده؟',
  topic: 'ما موضوع التصميم؟ مثال: افتتاح فرع جديد، أو خصم نهاية الأسبوع.',
  text: 'ما النص الذي يظهر على التصميم؟ يمكنك ترك الحقلين فارغين.',
  media: 'هل لديك صورة منتج، أو تصميم تريد شيئًا يشبهه؟ ارفعها أو تخطَّ هذه الخطوة.',
  sumR: 'راجع طلب التصميم قبل حفظه.',
};

// ---- panels (the input that replaces the composer)
const panel = (inner, o = {}) => `<div class="panel ${o.err ? 'err' : ''} ${o.busy ? 'busy' : ''}" ${o.busy ? 'aria-busy="true"' : ''}>${inner}</div>`;
const sendBtn = (o = {}) => `<button class="send ${o.off ? 'off' : ''}" aria-label="${o.busy ? 'جارٍ الإرسال' : 'إرسال'}" ${o.off ? 'disabled' : ''}>${o.busy ? `<span class="spin" style="display:inline-flex">${ic('spin', 20)}</span>` : `<span class="flip" style="display:flex">${ic('arr', 20)}</span>`}</button>`;
const cnt = (n, max) => `<span class="cs ${n > max ? 'bad' : ''}"><bdi dir="ltr">${n} / ${max}</bdi></span>`;
const errU = (t) => `<div class="err-u" role="alert" style="margin:0">${ic('alert', 14)}<span>${t}</span></div>`;
const skipB = (busy) => `<button class="btn" ${busy ? 'disabled' : ''}>تخطّي</button>`;

const textP = (o = {}) => { // brand name etc.
  const v = o.v ?? '';
  return panel(`<div class="busyin"><div class="ta2 ${o.big ? 'big' : ''}">${v ? v : `<span class="ph">${o.ph}</span>`}</div></div>
  ${o.err ? errU(o.err) : ''}<div class="pa"><span>${cnt(o.n ?? v.length, o.max)}${o.busy ? '<span class="cs" style="margin-inline-start:12px" role="status">جارٍ الإرسال…</span>' : ''}</span><div class="r">${o.optional ? skipB(o.busy) : ''}${sendBtn({ off: o.err || (!v && !o.optional) || false, busy: o.busy })}</div></div>`, o);
};

const kitsB = [
  { n: BR, logo: 'a' }, { n: 'استوديو أفق للتصوير', logo: 'b' },
  { n: 'متجر زهرة', c: '#D6336C', letter: 'ز', draft: true }, { n: 'عيادة سنا', c: '#0F766E', letter: 'س' },
];
const bk = (k) => `<button class="bk"><div class="th" style="background:${k.logo ? '#fff' : k.c}">${k.logo ? logoSvg(k.logo) : k.letter}</div><div style="flex:1;min-width:0"><b>${k.n}</b>${k.draft ? '<span class="badge b-warn">مسودة</span> <span class="sub">أكمل الإعداد</span>' : ''}</div></button>`;
const brandP = (o = {}) => panel(`<div class="bgrid">${kitsB.map(bk).join('')}<button class="bk new ${o.off ? 'dis' : ''}" ${o.off ? 'disabled aria-disabled="true"' : ''}><span class="pi">${ic('plus', 22)}</span><span>علامة جديدة</span></button></div>
  ${o.off ? `<div class="notice n-warn" role="status" style="margin:0">${ic('alert', 20)}<div>وصلت إلى حد باقتك: <bdi dir="ltr">[5]</bdi> هويات. <a class="lnk" href="#">عرض الباقات</a></div></div>` : ''}
  ${o.limitErr ? `<div class="notice n-dan" role="alert" style="margin:0">${ic('alert', 20)}<div>وصلت إلى الحد الأقصى لعدد هويات العلامة التجارية في باقتك. احذف واحدة أو رقِّ باقتك. <a class="lnk" href="#" style="color:var(--dan)">عرض الباقات</a></div></div>` : ''}`);

const chipsP = (o = {}) => panel(`<div class="chips" role="group">${o.items.map((t, i) => `<button class="ch ${o.foc === i ? 'foc' : ''}">${t}</button>`).join('')}</div>${o.text ? `<div class="or">أو</div><div class="f2"><span class="ph">أو صِفه بكلماتك</span></div><div class="pa"><span>${cnt(0, 200)}</span>${sendBtn({ off: true })}</div>` : ''}`);

const zoneD = (o) => o.dis ? `<div class="dz dis">${ic('alert', 22)}<span>وصلت إلى الحد الأقصى: <bdi dir="ltr">${o.max}</bdi> ${o.max === 1 ? 'ملف' : 'ملفات'}.</span><small>احذف ملفًا لتتمكن من الإضافة.</small></div>`
  : `<div class="dz ${o.hov ? 'hov' : ''}" tabindex="0" role="button">${ic('upload', 24)}<b style="font-weight:600">${o.hov ? 'أفلت الملفات هنا' : 'اسحب الملفات هنا أو اضغط للاختيار'}</b><small>${o.hint}</small></div>`;
const zoneM = (o) => `<div class="pbtns"><button class="btn p" style="flex:1" ${o.dis ? 'disabled' : ''}>${ic('upload', 18)} اختيار ملفات</button>${o.noCam ? '' : `<button class="btn" style="flex:1" ${o.dis ? 'disabled' : ''}>${ic('cam', 18)} التقاط صورة</button>`}</div><div class="hint" style="margin-block-start:6px">${o.hint}</div>`;
const uploadP = (o) => {
  const m = o.m; const n = (o.tiles || []).length;
  const zone = m ? (o.dis ? zoneD(o) : zoneM(o)) : zoneD(o);
  const busy = o.uploading;
  const cont = n > 0 ? `<button class="btn p ${m ? 'full1' : ''} ${busy ? 'off' : ''}" ${busy ? 'disabled' : ''}>متابعة${busy ? '' : ` (${fileWord(o.done ?? n)})`}</button>` : '';
  return panel(`${zone}${o.err ? errU(o.err) : ''}${n ? `<div class="files" style="margin:0">${o.tiles.join('')}</div>` : ''}
  <div class="pa"><span class="cs"><span class="ltr" dir="ltr">${o.done ?? n} / ${o.max}</span> ${busy ? ' · جارٍ الرفع…' : ''}</span><div class="r">${o.optional && n === 0 ? `<button class="btn ${m ? 'full1' : ''}">تخطّي</button>` : ''}${cont}</div></div>`);
};

const sugBlock = `<div class="notice n-pro" style="flex-direction:column;margin:0"><b style="font-weight:600">ألوان من شعارك</b><div class="sug">${['#E8B04B', '#3B2A20', '#C7512D'].map((h) => `<span class="sc"><span class="sw" style="background:${h}"></span><b>${hex(h)}</b><button class="btn">إضافة</button></span>`).join('')}</div><span class="hint" style="color:#3730A3">لا تُضاف الألوان إلا إذا ضغطت «إضافة».</span></div>`;
const colorsP = (o = {}) => {
  const a = cols.slice(0, o.n || 4);
  const full = o.full;
  return panel(`<div class="sp"><b style="font-weight:600">الألوان</b><span class="cs"><span class="ltr" dir="ltr">${full ? 12 : a.length} / 12</span></span></div>
  <div class="scr"><div class="cl">${(full ? [...cols, '#0B3C5D', '#D9B310', '#328CC1', '#D6336C', '#0F766E', '#E6FFFA', '#134E4A', '#99F6E4'].slice(0, 3) : a).map((h, i, arr) => swRow(i + 1, h, i === 0, i === arr.length - 1)).join('')}${full ? `<div class="hint" style="text-align:center">… و<bdi dir="ltr">9</bdi> ألوان أخرى</div>` : ''}</div>
  ${o.sug ? sugBlock : ''}
  <div class="add" style="margin:0"><div class="picker" aria-label="اختيار لون" ${full ? 'style="opacity:.45"' : ''}><i style="background:#2F80ED"></i></div><div class="in ${o.bad ? 'err' : ''}" style="width:150px;direction:ltr;${full ? 'background:var(--muted-s)' : ''}"><span class="${o.bad ? '' : 'ph'}" dir="ltr">${o.bad ? '#12G4' : '#RRGGBB'}</span></div><button class="btn ${full ? 'off' : ''}" ${full ? 'disabled' : ''}>${ic('plus', 18)} إضافة لون</button></div>
  ${full ? `<div class="err-u" style="margin:0;color:var(--ink2)">${ic('alert', 14)} وصلت إلى الحد الأقصى: <bdi dir="ltr">12</bdi> لونًا.</div>` : ''}
  ${o.bad ? errU('اكتب اللون بصيغة <bdi dir="ltr">#RRGGBB</bdi>.') : ''}
  ${o.dup ? errU('هذا اللون مضاف مسبقًا.') : ''}
  </div><div class="pa"><span class="hint">اللون الأول هو الأساسي.</span><div class="r"><button class="btn p ${o.m ? 'full1' : ''}">متابعة</button></div></div>`);
};

const fieldsP = (o = {}) => {
  const h = o.h ?? ''; const s = o.s ?? '';
  const f = (l, v, ph, max, bad) => `<div class="fld" style="margin:0"><label>${l}</label><div class="f2 ${bad ? 'bad' : ''}">${v ? `<span>${v}</span>` : `<span class="ph">${ph}</span>`}</div><div class="cnt">${bad ? `<span class="e" role="alert">${ic('alert', 14)} ${bad}</span>` : '<span></span>'}${cnt(o.hn ?? v.length, max).replace('<span class', '<span class')}</div></div>`;
  return panel(`${f('العنوان الرئيسي', h, 'مثال: افتتاحنا الجديد', 60, o.err && 'العنوان أطول من 60 حرفًا.')}${f('السطر الثاني', s, 'مثال: ندعوكم لتجربة قهوتنا', 120)}
  <div class="pa"><button class="btn ${o.m ? 'full1' : ''}" style="${o.m ? 'flex:1' : ''}">بدون نص</button><div class="r" style="${o.m ? 'flex:1' : ''}"><button class="btn p ${o.m ? 'full1' : ''} ${o.err ? 'off' : ''}" ${o.err ? 'disabled' : ''}>متابعة</button></div></div>`, { err: false });
};

const sumRow = (l, v, edit) => `<div class="sr"><span class="l">${l}</span><span class="v">${v}</span>${edit ? `<button class="tx" aria-label="تعديل ${l}">${I('pencil', 14)} تعديل</button>` : '<span style="width:76px"></span>'}</div>`;
const swv = (cs) => cs.map((c) => `<span class="sw" style="background:${c};border:1px solid rgba(15,23,42,.2)"></span>`).join('') + `<span class="hint" style="margin-inline-start:6px">${cs.length} ألوان</span>`;
const thv = (arr) => arr.map((x) => `<span class="mt">${x}</span>`).join('');
const sumP = (kind, o = {}) => {
  const brand = kind === 'brand';
  const rows = brand
    ? [sumRow('الاسم', BR, 1), sumRow('الشعار', thv([logoSvg('a')]), 1), sumRow('الألوان', swv(cols), 1), sumRow('الأسلوب', 'دافئ وبسيط', 1), sumRow('الخطوط', 'خط عربي ناعم بحروف مستديرة للعناوين', 1), sumRow('ملفات إضافية', thv([photoSvg('#F2E3CF', '#7A3E1D'), photoSvg('#2F5D50', '#C9A24B')]) + '<span class="hint" style="margin-inline-start:6px">+ ملف PDF</span>', 1)]
    : [sumRow('العلامة', BR, 0), sumRow('نوع التصميم', 'منشور إنستغرام', 1), sumRow('الموضوع', 'افتتاح فرعنا الجديد في حي الياسمين', 1), sumRow('النص', '<span style="display:block;width:100%">العنوان: افتتاحنا الجديد</span><span style="display:block;width:100%;color:var(--ink2)">السطر الثاني: ندعوكم لتجربة قهوتنا</span>', 1), sumRow('الوسائط', thv([photoSvg('#C9A24B', '#fff')]) + '<span class="hint" style="margin-inline-start:6px">صورة منتج</span>', 1)];
  const none = o.est === 'none';
  const note = o.est === 'some' ? `<div class="notice n-pro" role="status" style="margin:0">${ic('alert', 20)}<span>${o.estText}</span></div>`
    : none ? `<div class="notice n-warn" role="alert" style="margin:0;flex-wrap:wrap;align-items:center">${ic('alert', 20)}<div style="flex:1;min-width:160px">رصيدك لا يكفي لهذا التصميم. <a class="lnk" href="#">الرصيد</a></div><button class="btn">طلب رصيد</button></div>` : '';
  return panel(`<div class="scr"><div class="sumc">${rows.join('')}</div></div>${note}
  <div class="pa"><span></span><div class="r">${brand ? '' : `<button class="btn ${o.m ? 'full1' : ''}">علامة أخرى</button>`}<button class="btn p ${o.m ? 'full1' : ''} ${none ? 'off' : ''}" ${none ? 'disabled aria-disabled="true"' : ''}>${ic('check', 18)} يبدو جيدًا</button></div></div>`);
};

const savedP = (m) => panel(`<div class="pa" style="${m ? 'flex-direction:column;align-items:stretch' : ''}"><span class="hint">طلبك محفوظ في هذه المحادثة.</span><div class="r"><button class="btn p ${m ? 'full1' : ''}">${ic('sparkle', 18)} تصميم جديد</button><button class="btn ${m ? 'full1' : ''}">علامة أخرى</button></div></div>`);
const noneNotice = `<div class="notice n-warn" role="status">${ic('alert', 20)}<div style="flex:1">لا يمكن المتابعة في هذه المحادثة. <a class="lnk" href="#">عرض الباقات</a> أو ابدأ محادثة عادية.</div></div>`;

// ---- frames
const fr = (cls, t, note, inner) => `<div><div class="tag">${t}${note ? `<small>${note}</small>` : ''}</div><div class="fr ${cls}">${inner}</div></div>`;
const col = (msgs, dock, o = {}) => `<div class="col ${o.tall ? 'tall' : ''}"><div class="msgs">${msgs}</div><div class="dock">${dock}</div></div>`;

const sideNav = (active) => `<aside>
<div class="brand"><div class="mono">ل</div><b>لمحة AI</b></div>
<button class="btn p newchat">${ic('plus', 18)} محادثة جديدة</button>
<div class="rec">المحادثات الأخيرة
<div class="i ${active === 'brand' ? 'on' : ''}"><span>${AG} · ${BR}</span><span class="hint">الآن</span></div>
<div class="i ${active === 'plain' ? 'on' : ''}"><span>تصميم منشور للمعرض</span><span class="hint">أمس</span></div>
<div class="i ${active === 'first' ? 'on' : ''}"><span>${active === 'first' ? AG : 'ملخص عقد الإيجار'}</span><span class="hint">${active === 'first' ? 'الآن' : 'أمس'}</span></div></div>
<nav aria-label="التنقل"><div class="nav">${ic('wallet', 18)} الرصيد</div><div class="nav">${ic('layers', 18)} علاماتي التجارية</div><div class="nav">${ic('user', 18)} الحساب</div></nav>
</aside>`;
const topD = (title, agent) => `<div class="top"><h1>${title}</h1><div class="lt"><span class="chip">الرصيد <bdi dir="ltr">14.50$</bdi></span><span class="av" aria-label="الحساب">س ع</span></div></div>`;
const appD = (active, title, inner, agent = true) => `<div class="app">${sideNav(active)}<main style="display:flex;flex-direction:column">${topD(title, agent)}<div class="chat" style="flex:1">${inner}</div></main></div>`;
const topM = (title, agent = true) => `<div class="mtop"><button class="ib" aria-label="فتح القائمة">${ic('menu', 24)}</button><h1>${title}</h1></div>`;
const appM = (title, inner, agent = true) => `${topM(title, agent)}<div class="col" style="min-height:660px">${inner}</div>`;
const colM = (msgs, dock) => `<div class="msgs">${msgs}</div><div class="dock">${dock}</div>`;

// new-chat composer and menu
const menu = (o = {}) => `<div class="menu" role="menu" aria-label="اختيار الوضع">
<div class="mi"><span class="dt" style="background:#0F766E"></span><div style="flex:1"><b>سريع</b><div class="d">إجابات سريعة للاستخدام اليومي.</div></div>${ic('check', 18)}</div>
<div class="mi"><span class="dt" style="background:#4F46E5"></span><div><b>احترافي</b><span class="sbadge">${ic('img', 12)} يقرأ الصور</span><div class="d">تفكير أعمق للمهام المعقدة.</div></div></div>
<div class="mi"><span class="dt" style="background:#64748B"></span><div><b>تصميم</b><span class="sbadge dk">${ic('img', 12)} صورة</span><div class="d">يُنشئ صورة من وصفك.</div></div></div>
<div class="mh" id="grp-tasks">مهام متخصصة</div>
<div class="mi" role="menuitem" style="${o.focus ? 'outline:2px solid var(--pro);outline-offset:-2px' : ''}"><span class="ag">${I('palette', 16)}</span><div><b>${AG}</b><div class="d">يجهّز هوية علامتك ويحفظ طلب التصميم، خطوة بخطوة.</div>${o.inChat ? '<div class="d" style="color:var(--ink)">يبدأ محادثة جديدة.</div>' : ''}</div></div>
</div>`;
const composer = (o = {}) => `<div class="comp"><div class="ph">اكتب رسالتك…</div><div class="pa"><div class="mw">${o.menu ? menu(o) : ''}<span class="mchip">${ic('bolt', 16)} سريع ${ic('down', 14)}</span></div>${sendBtn({ off: true })}</div></div><div class="help2">تُحتسب تكلفة كل رد من رصيدك حسب الوضع المستخدم.</div>`;
const suggest = `<div class="sug2"><div>لخّص لي نصًّا طويلًا في نقاط</div><div>اكتب رسالة رسمية باحترافية</div><div>اشرح لي مفهومًا بطريقة بسيطة</div><div>ساعدني في كتابة كود بايثون</div></div>`;
const agentCard = `<div class="sec2">مهام متخصصة</div><button class="agc"><span class="ico">${I('palette', 26)}</span><span style="flex:1"><b>${AG}</b><span class="d">يجهّز هوية علامتك ويحفظ طلب التصميم، خطوة بخطوة.</span></span><span class="flip" style="color:var(--ink2)">${ic('chev', 20)}</span></button>`;
const hero = `<div class="hero"><div class="mono">ل</div><h2>كيف أساعدك اليوم؟</h2><p>اكتب سؤالك أو اختر فكرة للبدء.</p></div>`;
const emptyChat = (o = {}) => `<div class="empty-main">${hero}${suggest}${o.agent ? agentCard : ''}</div><div class="dock">${composer(o)}</div>`;
const emptyChatM = (o = {}) => `<div class="empty-main">${hero}<div class="sug2"><div>لخّص لي نصًّا طويلًا في نقاط</div><div>اكتب رسالة رسمية باحترافية</div></div>${o.agent ? agentCard : ''}</div><div class="dock">${composer(o)}</div>`;

// helpers to build a typical column frame
const M = (...a) => a.join('');
const kbd = '<div class="kb">لوحة المفاتيح (للتوضيح فقط)</div>';

// ---- DESKTOP BOARD
const D = [];
D.push(fr('d', '1a. منتقي الوضع: مجموعة «مهام متخصصة»', 'قائمة الأوضاع في صندوق الكتابة. تحت الأوضاع مجموعة ثانية، ووصف كل مهمة. في محادثة قائمة يظهر سطر «يبدأ محادثة جديدة»', appD('plain', 'محادثة جديدة', emptyChat({ agent: false, menu: true, focus: true }), false)));
D.push(fr('d', '1b. محادثة جديدة: بطاقة المصمم', 'في الحالة الفارغة، تحت الاقتراحات المعتادة، حتى يكتشفه من لا يفتح القائمة', appD('plain', 'محادثة جديدة', emptyChat({ agent: true }), false)));
D.push(fr('d', '1c. المنتقي داخل محادثة قائمة', 'اختيار المصمم هنا يبدأ محادثة جديدة ولا يغيّر هذه', appD('plain', 'تصميم منشور للمعرض', `<div class="msgs">${ub('أريد فكرة لمنشور عن معرض الكتاب')}<div class="amsg"><span class="mchip" style="align-self:flex-start;min-height:28px;padding-block:0">${ic('bolt', 14)} سريع</span><p>بالتأكيد. هذه ثلاث أفكار: قصة قصيرة عن أول كتاب قرأته، وصورة لمكتبتك المفضلة، وسؤال للمتابعين عن كتابهم الأخير.</p></div></div><div class="dock">${composer({ menu: true, inChat: true })}</div>`, false)));

D.push(fr('d', '2a. رأس محادثة المصمم: العنوان في البداية', 'العنوان «مصمم جرافيك» حتى تتحدد العلامة. زر «محادثة جديدة» في الرأس والقائمة الجانبية يفتحان محادثة عادية', appD('first', AG, col(aq(Q.name), textP({ ph: 'اكتب اسم علامتك', max: 80 })) )));

const fullHist = M(aq(Q.name), ub(BR), aq(Q.logo), ubTh(['a']), aq(Q.colors), ubSw(cols), aq(Q.style), ub('دافئ وبسيط'), aq(Q.fonts));
D.push(fr('d', '2b. محادثة كاملة: السجل فوق الإدخال النشط', `العنوان «${AG} · ${BR}» بعد تسمية العلامة. الإجابات فقاعات عادية: نص، صورة مصغّرة للشعار، ألوان. الأسئلة القديمة نص فقط`, appD('brand', `${AG} · ${BR}`, col(fullHist, textP({ ph: 'مثال: خط عربي ناعم بحروف مستديرة', max: 300, optional: true, big: true }), { tall: true }))));

const C = []; // column frames
const cf = (t, n, msgs, dock, o) => C.push(fr('c', t, n, col(msgs, dock, o)));
cf('3a. brand_picker', 'بطاقات: شعار مصغّر أو الحرف الأول على أول لون، الاسم، «مسودة». الضغط على بطاقة يرسل الاختيار', aq(Q.pick), brandP());
cf('3b. brand_picker: «علامة جديدة» معطّلة', 'canCreate = false: السبب ورابط الباقات', aq(Q.pick), brandP({ off: true }));
cf('3c. text: اسم العلامة (80 حرفًا)', 'مطلوب: بلا «تخطّي»، والإرسال معطّل حتى يُكتب نص', aq(Q.name), textP({ v: BR, max: 80 }));
cf('3d. text اختياري', 'يظهر «تخطّي»', aq(Q.fonts), textP({ ph: 'مثال: خط عربي ناعم بحروف مستديرة', max: 300, optional: true, big: true }));
cf('3e. choices: نوع التصميم', 'الضغط على خيار يرسله فورًا. الخيار المركّز عليه بلوحة المفاتيح يظهر بحلقة التركيز', M(aq(Q.sumB), aq(Q.format)), chipsP({ items: ['منشور إنستغرام', 'ستوري إنستغرام', 'منشور فيسبوك', 'بانر', 'صورة منتج'], foc: 0 }));
cf('3f. choices مع allowText', 'الخيارات ثم «أو صِفه بكلماتك» (النص يُحفظ كما كُتب)', aq(Q.style), chipsP({ items: ['بسيط وعصري', 'دافئ وكلاسيكي', 'جريء وملوّن', 'فاخر وهادئ', 'مرح وشبابي'], text: true }));
const hint1 = 'PNG أو JPG أو WebP أو SVG، حتى 10 ميغابايت لكل ملف';
cf('3g. upload: لا ملفات (اختياري)', 'منطقة S24 داخل المحادثة. «تخطّي» يرسل قائمة فارغة', aq(Q.logo), uploadP({ hint: hint1, max: 3, optional: true, tiles: [] }));
cf('3h. upload: رفع جارٍ وتعذّر الرفع', '«متابعة» معطّلة حتى ينتهي الرفع', aq(Q.logo), uploadP({ hint: hint1, max: 3, tiles: [logoT('a'), upT(62), failT], uploading: true, done: 1, err: 'حجم الصورة أكبر من 10 ميغابايت.' }));
cf('3i. upload: جاهز للمتابعة', 'مع ملف PDF (دليل الهوية)، والعدّاد حتى maxFiles', aq(Q.extras), uploadP({ hint: 'PNG أو JPG أو WebP حتى 10 ميغابايت، أو PDF حتى 20 ميغابايت', max: 10, tiles: [photoT('#F2E3CF', '#7A3E1D'), photoT('#2F5D50', '#C9A24B'), pdfT('brand-guide.pdf')], optional: true }));
cf('3j. upload: بلغ الحد الأقصى', 'maxFiles = 3 والمنطقة معطّلة', aq(Q.logo), uploadP({ hint: hint1, max: 3, dis: true, tiles: [logoT('a'), logoT('b'), photoT('#C9A24B', '#fff')] }));
cf('3k. colors', 'ألوان حالية بالترتيب مع «الأهم»، ألوان مقترحة من الشعار (لا تُضاف إلا بـ«إضافة»)، منتقي وhex', M(aq(Q.logo), ubTh(['a']), aq(Q.colors)), colorsP({ n: 3, sug: true }), { tall: true });
cf('3l. colors: خطأ hex وبلوغ الحد', 'قيمة غير صالحة تُبقي ما كُتب وتظهر الرسالة تحته. وعند max تُعطَّل الإضافة', aq(Q.colors), colorsP({ n: 2, bad: true }));
cf('3m. colors: وصلت إلى max', '', aq(Q.colors), colorsP({ full: true }));
cf('3n. fields', 'العنوان ≤60 والسطر الثاني ≤120. يمكن ترك الحقلين فارغين: «بدون نص»', aq(Q.text), fieldsP({ h: 'افتتاحنا الجديد', s: 'ندعوكم لتجربة قهوتنا' }));
cf('3o. fields فارغة', 'تبقى «متابعة» متاحة بحقلين فارغين (النص اختياري)', aq(Q.text), fieldsP({}));
cf('3p. summary: هوية العلامة', '«تعديل» لكل عنصر قابل للتعديل (editable): يعود بعده إلى هذا الملخص. الألوان دوائر، الملفات صور مصغّرة', M(aq(Q.sumB)), sumP('brand'), { tall: true });
cf('3q. summary: طلب التصميم', 'لا أسعار في الملخص. حين تكون ui.estimate فارغة (null) لا يظهر شيء عن الرصيد. هنا أيضًا «علامة أخرى» (change_brand)؛ «العلامة» تتغيّر بها لا بـ«تعديل»', M(aq(Q.sumR)), sumP('request'), { tall: true });
cf('3q2. summary: الرصيد يكفي لبعض التصاميم', 'fitsVariants بين 1 وvariants-1: ملاحظة معلومات فقط، و«يبدو جيدًا» تبقى متاحة', M(aq(Q.sumR)), sumP('request', { est: 'some', estText: 'رصيدك يكفي لتصميم واحد من <bdi dir="ltr">2</bdi>.' }), { tall: true });
cf('3q3. summary: الرصيد لا يكفي', 'fitsVariants = 0: تحذير مع رابط «الرصيد» و«طلب رصيد»؛ «يبدو جيدًا» معطّلة، و«تعديل» و«علامة أخرى» متاحتان', M(aq(Q.sumR)), sumP('request', { est: 'none' }), { tall: true });
cf('3r. design_saved', 'رسالة نجاح، ثم «تصميم جديد» (نفس العلامة) و«علامة أخرى»', aq(['تم حفظ طلب التصميم.', `حفظنا طلبك لعلامة «${BR}». إنشاء التصاميم نفسها سيُضاف لاحقًا، وطلبك محفوظ إلى ذلك الحين.`], { ok: true }), savedP());
cf('3s. none (محظورة)', 'لا إدخال: الرسالة ورابط الباقات فقط. المحادثة العادية متاحة', aq('باقتك الحالية لا تتضمن هويات للعلامة التجارية، ولا يمكن للمصمم المتابعة بدونها.'), noneNotice);

const S = [];
const sf = (t, n, msgs, dock, o) => S.push(fr('c', t, n, col(msgs, dock, o)));
sf('4a. جارٍ الإرسال', 'الإدخال معطّل وزر الإرسال يدور. لا فقاعة تفاؤلية: تظهر الإجابة مع السؤال التالي عند وصول الرد', aq(Q.name), textP({ v: BR, max: 80, busy: true }));
sf('4b. خطأ تحقق (400 VALIDATION_FAILED)', 'تحت الإدخال، والقيمة باقية للتعديل', aq(Q.name), textP({ v: 'مقهى الندى للقهوة المختصة والحلويات المنزلية والمشروبات الباردة والساخنة وكل ما يحتاجه عشاق القهوة', max: 80, n: 97, err: 'الاسم أطول من 80 حرفًا. اختصره ثم أرسل.' }));
sf('4c. تغيّرت الخطوة (409 AGENT_STEP_MISMATCH)', 'يُعاد تحميل الرسائل من تلقاء نفسه: ملاحظة قصيرة فوق السؤال الأخير، ثم إدخاله', M(aq(Q.name), ub(BR), `<div class="hint" role="status" style="display:flex;gap:6px;align-items:center;justify-content:center;color:var(--ink2)">${ic('refresh', 14)} تغيّرت المحادثة، فعرضنا السؤال الأخير.</div>`, aq(Q.logo)), uploadP({ hint: hint1, max: 3, optional: true, tiles: [] }));
sf('4d. المساعد غير متاح (409 AGENT_NOT_AVAILABLE)', 'يحلّ الإشعار محل الإدخال مع رابط الباقات', M(aq(Q.name), ub(BR), aq(Q.logo)), `<div class="notice n-warn" role="alert">${ic('alert', 20)}<div style="flex:1">هذا المساعد غير متاح في باقتك. <a class="lnk" href="#">عرض الباقات</a></div></div>`);
sf('4e. حد الهويات (409 BRAND_KIT_LIMIT_REACHED)', 'عند الضغط على «علامة جديدة»: الرسالة ورابط الباقات تحت البطاقات', aq(Q.pick), brandP({ limitErr: true }));
sf('4f. خطأ شبكة', 'القيمة باقية، و«إعادة المحاولة» ترسل الإجابة نفسها بالمعرّف نفسه', aq(Q.name), (() => { const p = textP({ v: BR, max: 80 }); return p.replace('<div class="pa">', `<div class="notice n-dan" role="alert" style="margin:0;align-items:center;flex-wrap:wrap">${ic('alert', 20)}<div style="flex:1;min-width:180px">تعذّر الإرسال. تحقق من الاتصال وحاول مرة أخرى.</div><button class="btn dg">${ic('refresh', 18)} إعادة المحاولة</button></div><div class="pa">`); })());

const desktop = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>S25 مصمم جرافيك في المحادثة</title>${font}<style>${css}</style></head><body><div class="board">
<div><h1 class="bt">S25 · مصمم جرافيك في المحادثة (سطح المكتب)</h1><p class="note">لوحة تصميم: العناوين والملاحظات الصغيرة شرح للمراجعة وليست جزءًا من الواجهة. بيانات تجريبية. المساعد يطرح سؤالًا واحدًا في كل رسالة، وإدخال آخر سؤال يحلّ محل صندوق الكتابة. لا ذكاء اصطناعي يعمل هنا ولا تكلفة، فلا يظهر رصيد أو سعر في الخطوات. إطارات الإدخال تعرض عمود المحادثة وحده (بلا القائمة الجانبية) لتوفير المساحة.</p></div>
${D.slice(0, 3).join('\n')}
${D.slice(3).join('\n')}
<div><h1 class="bt" style="font-size:18px">3. إدخال لكل نوع (ui.type)</h1></div>
<div class="row">${C.join('\n')}</div>
<div><h1 class="bt" style="font-size:18px">4. الحالات</h1></div>
<div class="row">${S.join('\n')}</div>
</div></body></html>`;
const fx = (h) => h.replace(/(?<![\w>])(\d+ \/ \d+)(?![\w<])/g, '<bdi dir="ltr">$1</bdi>');
fs.writeFileSync(path.join(dir, 'desktop.html'), fx(desktop));

// ---- MOBILE BOARD
const Mx = [];
const mf = (t, n, title, inner, agent = true) => Mx.push(fr('m', t, n, appM(title, inner, agent)));
mf('م1. المنتقي', 'مجموعة «مهام متخصصة» تحت الأوضاع', 'محادثة جديدة', `<div class="empty-main">${hero}</div><div class="dock">${composer({ menu: true, focus: true })}</div>`, false);
mf('م1b. محادثة جديدة', 'بطاقة المصمم في الحالة الفارغة', 'محادثة جديدة', emptyChatM({ agent: true }), false);
mf('م2. السؤال الأول والإدخال فوق لوحة المفاتيح', 'الإدخال يلتصق بأسفل الشاشة ويرتفع مع لوحة المفاتيح', AG, colM(aq(Q.name), textP({ ph: 'اكتب اسم علامتك', max: 80 })) + kbd);
mf('م2b. محادثة جارية', 'العنوان بعد تسمية العلامة (يُقصّ بنقاط إن طال)', `${AG} · ${BR}`, colM(M(aq(Q.name), ub(BR), aq(Q.logo), ubTh(['a']), aq(Q.colors), ubSw(cols), aq(Q.style), ub('دافئ وبسيط'), aq(Q.fonts)), textP({ ph: 'مثال: خط عربي ناعم', max: 300, optional: true })));
mf('م3. brand_picker', '', AG, colM(aq(Q.pick), brandP()));
mf('م3b. brand_picker معطّل', 'الحد ورابط الباقات', AG, colM(aq(Q.pick), brandP({ off: true })));
mf('م4. choices', '', AG, colM(aq(Q.format), chipsP({ items: ['منشور إنستغرام', 'ستوري إنستغرام', 'منشور فيسبوك', 'بانر', 'صورة منتج'] })));
mf('م4b. choices مع نص', '', AG, colM(aq(Q.style), chipsP({ items: ['بسيط وعصري', 'دافئ وكلاسيكي', 'جريء وملوّن', 'فاخر وهادئ'], text: true })) + '');
mf('م5. upload', 'على الجوال: «اختيار ملفات» و«التقاط صورة»', AG, colM(aq(Q.logo), uploadP({ m: true, hint: hint1, max: 3, optional: true, tiles: [] })));
mf('م5b. upload: ملفات ورفع جارٍ', '', AG, colM(aq(Q.logo), uploadP({ m: true, hint: hint1, max: 3, tiles: [logoT('a'), upT(62)], uploading: true, done: 1 })));
mf('م6. colors', 'في الجوال تتمرّر لوحة الإدخال داخليًا (حد أقصى لارتفاعها)، وتبقى «متابعة» ظاهرة', AG, colM(aq(Q.colors), colorsP({ n: 3, sug: true, m: true })));
mf('م7. fields', '', AG, colM(aq(Q.text), fieldsP({ h: 'افتتاحنا الجديد', s: 'ندعوكم لتجربة قهوتنا', m: true })));
mf('م8. summary: طلب التصميم', 'بلا ملاحظة رصيد', AG, colM(aq(Q.sumR), sumP('request', { m: true })));
mf('م8c. الرصيد يكفي لبعض التصاميم', '', AG, colM(aq(Q.sumR), sumP('request', { m: true, est: 'some', estText: 'رصيدك يكفي لتصميمين من <bdi dir="ltr">3</bdi>.' })));
mf('م8d. الرصيد لا يكفي', '«يبدو جيدًا» معطّلة', AG, colM(aq(Q.sumR), sumP('request', { m: true, est: 'none' })));
mf('م8b. summary: هوية العلامة', '', AG, colM(aq(Q.sumB), sumP('brand', { m: true })));
mf('م9. design_saved', '', AG, colM(aq(['تم حفظ طلب التصميم.', `حفظنا طلبك لعلامة «${BR}». إنشاء التصاميم نفسها سيُضاف لاحقًا.`], { ok: true }), savedP(true)));
mf('م10. المساعد غير متاح', '', AG, colM(aq(Q.logo), `<div class="notice n-warn" role="alert">${ic('alert', 20)}<div style="flex:1">هذا المساعد غير متاح في باقتك. <a class="lnk" href="#">عرض الباقات</a></div></div>`));
mf('م11. خطأ شبكة', '', AG, colM(aq(Q.name), textP({ v: BR, max: 80 }).replace('<div class="pa">', `<div class="notice n-dan" role="alert" style="margin:0;align-items:center;flex-wrap:wrap">${ic('alert', 20)}<div style="flex:1;min-width:160px">تعذّر الإرسال. تحقق من الاتصال وحاول مرة أخرى.</div><button class="btn dg">${ic('refresh', 18)} إعادة المحاولة</button></div><div class="pa">`)));
mf('م12. خطأ تحقق', '', AG, colM(aq(Q.name), textP({ v: 'مقهى الندى للقهوة المختصة والحلويات المنزلية والمشروبات الباردة والساخنة', max: 80, n: 85, err: 'الاسم أطول من 80 حرفًا. اختصره ثم أرسل.' })));
const mobile = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>S25 مصمم جرافيك في المحادثة (جوال)</title>${font}<style>${css}</style></head><body><div class="board">
<div><h1 class="bt">S25 · مصمم جرافيك في المحادثة (جوال 375px)</h1><p class="note">زر القائمة أعلى اليمين يفتح درج المحادثات. محادثة عادية جديدة من «محادثة جديدة» في الدرج. الإدخال في أسفل الشاشة فوق لوحة المفاتيح. لوحة الإدخال الطويلة (ألوان، ملخص) تتمرّر داخليًا بارتفاع أقصى، وتبقى أزرار المتابعة ثابتة تحتها.</p></div>
<div class="row">${Mx.join('\n')}</div>
</div></body></html>`;
fs.writeFileSync(path.join(dir, 'mobile.html'), fx(mobile));
console.log('ok');
