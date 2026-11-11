// Hand-built S27 "designs in the chat" boards (graphic designer, stage 4). Run: node build.mjs -> desktop.html, mobile.html
// PNGs: node render.mjs. Look comes from s25-css.mjs (S25 CSS, unchanged) and s24-parts.mjs (S24 parts), plus the additions below.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { css as baseCss } from './s25-css.mjs';
import { ic, fileWord, logoSvg } from './s24-parts.mjs';
const dir = path.dirname(fileURLToPath(import.meta.url));

const css = baseCss + `
.fr.c{width:760px}
/* design cards */
.dgrid{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start}
.dcard{background:#fff;border:1px solid var(--bs);border-radius:16px;position:relative;display:flex;flex-direction:column;width:300px}
.dcard.story{width:214px}.dcard.ban{width:100%}
.dth{position:relative;border-radius:15px 15px 0 0;overflow:hidden;background:var(--muted-s);border-block-end:1px solid var(--bs)}
.dth svg{display:block;width:100%;height:100%}
.vb{position:absolute;inset-block-start:8px;inset-inline-start:8px;background:var(--brand);color:#fff;border-radius:9999px;padding:0 10px;font-size:12px;font-weight:600;line-height:22px}
.dcap{display:flex;align-items:center;gap:8px;padding:8px 12px 2px;min-height:40px;font-size:14px;flex-wrap:wrap}
.dcap b{font-weight:600}
.dact{display:flex;gap:8px;padding:6px 12px 12px}.dact .btn{flex:1;padding-inline:10px}
.dact .btn.off{cursor:not-allowed}
.m .dgrid{flex-direction:column}.m .dcard{width:100%}.m .dcard.story{width:230px}
.swipe{display:flex;gap:12px;overflow:hidden;margin-inline:-14px;padding-inline:14px}.swipe .dcard{flex:0 0 78%}
.pg{display:flex;gap:6px;justify-content:center;align-items:center;margin-block-start:2px}.pg i{width:8px;height:8px;border-radius:50%;background:var(--bs)}.pg i.on{background:var(--brand);width:20px;border-radius:9999px}
.dnote{display:flex;gap:6px;align-items:flex-start;color:var(--ink2);font-size:13px}
/* progress */
.prow{display:flex;align-items:center;gap:10px}.prow b{font-size:16px;font-weight:600}
.pcount{margin-inline-start:auto;font-size:14px;font-weight:600;color:var(--ink)}
.slots{display:flex;gap:12px}
.slot{width:140px;aspect-ratio:1;border:1px dashed var(--bc);border-radius:12px;background:var(--muted-s);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font-size:13px;color:var(--ink2)}
.slot.done{border-style:solid;border-color:var(--ok-b);background:var(--ok-c);color:var(--ok);font-weight:500}
.m .slot{flex:1;width:auto;max-width:140px}
.pulse{animation:pl 2s ease-in-out infinite}@keyframes pl{50%{opacity:.5}}
@media (prefers-reduced-motion:reduce){.pulse{animation:none}}
.panel.calm{background:var(--muted-s);border-color:var(--bs);box-shadow:none;flex-direction:row;align-items:flex-start;gap:10px;color:var(--ink2);font-size:14px;padding:14px 16px}
/* download menu */
.dmenu{position:absolute;inset-inline-end:0;top:calc(100% + 6px);width:300px;z-index:6;background:#fff;border:1px solid var(--bs);border-radius:16px;box-shadow:0 12px 24px -6px rgba(15,23,42,.18);padding:14px}
.dm{display:flex;flex-direction:column;gap:12px}
.dm h4{font-size:15px;font-weight:600}
.dm .gl{font-size:13px;font-weight:600;color:var(--ink2);margin-block-end:6px}
.seg{display:flex;border:1px solid var(--bc);border-radius:8px;overflow:hidden}
.seg button{flex:1;min-height:44px;border:0;background:#fff;font:500 14px 'IBM Plex Sans Arabic',sans-serif;color:var(--ink)}
.seg button+button{border-inline-start:1px solid var(--bc)}
.seg .on{background:var(--brand);color:#fff;font-weight:600}
.rad{display:flex;gap:12px;align-items:flex-start;padding:10px 12px;border:1px solid var(--bc);border-radius:12px;min-height:44px;background:#fff;margin-block-end:8px}
.rad.on{border:2px solid var(--brand);padding:9px 11px;background:var(--muted-s)}
.rad .ro{width:20px;height:20px;border-radius:50%;border:2px solid var(--bc);flex-shrink:0;margin-block-start:1px;display:grid;place-items:center}
.rad.on .ro{border-color:var(--brand)}.rad.on .ro:after{content:'';width:10px;height:10px;border-radius:50%;background:var(--brand)}
.rad b{font-weight:600;font-size:14px;display:block;line-height:22px}.rad .d{font-size:13px;color:var(--ink2)}
.dm.busy .seg,.dm.busy .rad{opacity:.55}
.grab{width:40px;height:4px;border-radius:4px;background:#CBD5E1;align-self:center}
.dlg.sh{gap:14px;padding-block-end:20px}
.dlg.sh .hh2{display:flex;align-items:center;justify-content:space-between}
/* multi select chips */
.ch.sel{background:var(--pro-c);border:2px solid var(--pro);color:#3730A3;font-weight:600;padding-inline:16px;gap:8px}
.mh2{font-size:14px;font-weight:600;color:var(--ink)}
.lead{font-size:13px;color:var(--ink2)}
`;

const font = '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">';
const P2 = {
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7" r="1"/><circle cx="15.5" cy="7" r="1"/>',
  pencil: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  dl: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  chevd: '<path d="m6 9 6 6 6-6"/>',
};
const ic2 = (n, s = 20) => `<span style="display:inline-flex;flex-shrink:0"><svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P2[n]}</svg></span>`;
const I = (n, s) => (P2[n] ? ic2(n, s) : ic(n, s));
const L = (t) => `<bdi dir="ltr">${t}</bdi>`;

const AG = 'مصمم جرافيك';
const BR = 'مقهى الندى';

// ---- sample designs (neutral posters, fictional brand); content, not UI
const PAL = { 1: ['#F2E3CF', '#7A3E1D', '#C9A24B'], 2: ['#2F5D50', '#F2E3CF', '#C9A24B'], 3: ['#FFFFFF', '#0B3C5D', '#D9B310'] };
const DIM = { sq: [100, 100, '1024×1024', '1080×1080'], story: [90, 160, '864×1536', '1080×1920'], ban: [160, 90, '1536×864', '1920×1080'] };
const poster = (k, v = 1) => {
  const [w, h] = DIM[k]; const [bg, ink, ac] = PAL[v];
  const t = (x, y, s, wt, txt, f = ink) => `<text x="${x}" y="${y}" font-size="${s}" font-weight="${wt}" fill="${f}" text-anchor="middle" font-family="IBM Plex Sans Arabic">${txt}</text>`;
  let b = `<rect width="${w}" height="${h}" fill="${bg}"/>`;
  if (k === 'sq') b += `<circle cx="50" cy="38" r="24" fill="${ac}"/><circle cx="50" cy="38" r="12" fill="${bg}"/>${t(50, 74, 11, 700, 'افتتاحنا الجديد')}${t(50, 85, 5.5, 400, 'ندعوكم لتجربة قهوتنا')}`;
  if (k === 'story') b += `<circle cx="45" cy="58" r="28" fill="${ac}"/><circle cx="45" cy="58" r="14" fill="${bg}"/>${t(45, 112, 10, 700, 'افتتاحنا الجديد')}${t(45, 126, 5, 400, 'ندعوكم لتجربة قهوتنا')}${t(45, 150, 4.5, 600, BR)}`;
  if (k === 'ban') b += `<circle cx="38" cy="45" r="28" fill="${ac}"/><circle cx="38" cy="45" r="14" fill="${bg}"/>${t(106, 42, 12, 700, 'افتتاحنا الجديد')}${t(106, 56, 6, 400, 'ندعوكم لتجربة قهوتنا')}${t(106, 78, 4.5, 600, BR)}`;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="معاينة التصميم">${b}</svg>`;
};

// ---- messages
const aq = (t) => `<div class="amsg"><span class="achip">${I('palette', 14)} ${AG}</span><p>${t}</p></div>`;
const aT = (title, body, o = {}) => `<div class="amsg"><span class="achip">${I('palette', 14)} ${AG}</span><div style="display:flex;gap:8px;align-items:flex-start;color:${o.warn ? 'var(--warn)' : 'var(--ok)'};font-weight:600">${ic(o.warn ? 'alert' : 'check', 20)}<span>${title}</span></div>${body ? `<p>${body}</p>` : ''}${o.extra || ''}</div>`;
const ub = (t) => `<div class="um">${t}</div>`;
const ubTh = (svgs) => `<div class="um pad0"><div class="uth" aria-label="الملفات المرفقة">${svgs.map((s) => `<span>${s}</span>`).join('')}</div></div>`;

const dcard = (o) => {
  const k = o.k || 'sq'; const [w, h, orig, std] = DIM[k];
  const menu = o.menu ? `<div class="dmenu" role="dialog" aria-label="تنزيل التصميم ${o.n}">${dlBody({ ...o.menu, k })}</div>` : '';
  return `<article class="dcard ${k}" aria-label="التصميم ${o.n}">
<div class="dth" style="aspect-ratio:${w}/${h}">${poster(k, o.v || 1)}${o.ver > 1 ? `<span class="vb" aria-label="النسخة ${o.ver}">${L('v' + o.ver)}</span>` : ''}</div>
<div class="dcap"><b>التصميم ${o.n}</b>${o.review ? `<span class="badge b-warn">${ic('alert', 14)} تحقّق من النص</span>` : ''}</div>
<div class="dact"><button class="btn ${o.disEdit ? 'off' : ''}" ${o.disEdit ? 'aria-disabled="true" disabled' : ''} aria-label="تعديل التصميم ${o.n}">${I('pencil', 18)} تعديل</button><button class="btn" aria-haspopup="dialog" aria-expanded="${o.menu ? 'true' : 'false'}" aria-label="تنزيل التصميم ${o.n}">${I('dl', 18)} تنزيل ${I('chevd', 16)}</button></div>${menu}</article>`;
};
const grid = (cards, o = {}) => (o.swipe ? `<div class="swipe">${cards.join('')}</div><div class="pg" aria-hidden="true"><i class="on"></i><i></i></div>` : `<div class="dgrid">${cards.join('')}</div>`);
const resMsg = (cards, o = {}) => aT(o.title || 'تصاميمك جاهزة', o.body ?? 'اضغط «تعديل» لتغيير أي تصميم، أو «تنزيل» لحفظه.', { extra: grid(cards, o) + (o.note ? `<div class="dnote" role="status">${ic('alert', 16)}<span>${o.note}</span></div>` : '') });
const emptyMsg = () => aT('لم يخرج أي تصميم هذه المرة.', 'لم يُحتسب من رصيدك إلا ما جرى تنفيذه فعلًا. يمكنك المحاولة مرة أخرى أو اختيار علامة أخرى.', { warn: true });
const progMsg = (done, total, o = {}) => {
  const slots = Array.from({ length: total }, (_, i) => (i < done ? `<div class="slot done">${ic('check', 22)}<span>جاهز</span></div>` : `<div class="slot"><span class="spin" style="display:inline-flex">${ic('spin', 22)}</span><span class="pulse">قيد التصميم</span></div>`)).join('');
  return `<div class="amsg" role="status" aria-live="polite"><span class="achip">${I('palette', 14)} ${AG}</span>
<div class="prow"><span class="spin" style="display:inline-flex;color:var(--brand)">${ic('spin', 22)}</span><b>${o.edit ? 'جارٍ تعديل التصميم…' : 'جارٍ التصميم…'}</b><span class="pcount">${L(done)} من ${L(total)}</span></div>
<div class="bar" role="progressbar" aria-label="تقدّم التصميم" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}"><i style="width:${(done / total) * 100}%"></i></div>
<div class="slots">${slots}</div><p class="hint">يستغرق هذا عادةً نحو دقيقة.</p></div>`;
};

// ---- docks
const panel = (inner, o = {}) => `<div class="panel ${o.cls || ''} ${o.err ? 'err' : ''}">${inner}</div>`;
const calm = (t) => `<div class="panel calm" role="status">${ic('alert', 20)}<span>${t}</span></div>`;
const progDock = () => calm('لا حاجة لانتظارنا هنا. يمكنك مغادرة الصفحة والعودة لاحقًا، وستجد التصاميم في هذه المحادثة.');
const nextP = (o = {}) => panel(`<div class="pa" style="${o.m ? 'flex-direction:column;align-items:stretch' : ''}"><span class="hint">${o.hint || 'ماذا بعد؟'}</span><div class="r">${o.retry ? `<button class="btn p ${o.m ? 'full1' : ''}">${ic('refresh', 18)} حاول مرة أخرى</button>` : `<button class="btn p ${o.m ? 'full1' : ''}">${ic('sparkle', 18)} تصميم جديد</button>`}<button class="btn ${o.m ? 'full1' : ''}">علامة أخرى</button></div></div>`);
const cnt = (n, max) => `<span class="cs">${L(`${n} / ${max}`)}</span>`;
const sendBtn = (off) => `<button class="send ${off ? 'off' : ''}" aria-label="إرسال" ${off ? 'disabled' : ''}><span class="flip" style="display:flex">${ic('arr', 20)}</span></button>`;
const textP = (o) => panel(`<div><div class="ta2 big">${o.v ? o.v : `<span class="ph">${o.ph}</span>`}</div></div><div class="pa"><span>${cnt(o.v ? o.v.length : 0, o.max)}</span><div class="r">${sendBtn(!o.v)}</div></div>`);
const errU = (t) => `<div class="err-u" role="alert" style="margin:0">${ic('alert', 14)}<span>${t}</span></div>`;

// request summary
const sumRow = (l, v, edit) => `<div class="sr"><span class="l">${l}</span><span class="v">${v}</span>${edit ? `<button class="tx" aria-label="تعديل ${l}">${I('pencil', 14)} تعديل</button>` : '<span style="width:76px"></span>'}</div>`;
const mt = (svg) => `<span class="mt">${svg}</span>`;
const thSq = (v) => mt(poster('sq', v));
const photoSvg = (c1, c2) => `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"><rect width="100" height="100" fill="${c1}"/><circle cx="62" cy="40" r="22" fill="${c2}"/><rect y="70" width="100" height="30" fill="rgba(0,0,0,.18)"/></svg>`;
const reqRows = [sumRow('العلامة', BR, 0), sumRow('نوع التصميم', 'منشور إنستغرام', 1), sumRow('الموضوع', 'افتتاح فرعنا الجديد في حي الياسمين', 1), sumRow('النص', '<span style="display:block;width:100%">العنوان: افتتاحنا الجديد</span><span style="display:block;width:100%;color:var(--ink2)">السطر الثاني: ندعوكم لتجربة قهوتنا</span>', 1), sumRow('الوسائط', mt(photoSvg('#C9A24B', '#fff')) + '<span class="hint" style="margin-inline-start:6px">صورة منتج</span>', 1)].join('');
const countWord = (n) => (n === 1 ? 'تصميم واحد' : n === 2 ? 'تصميمين' : `${n} تصاميم`);
const createLabel = (fits) => (fits === 1 ? 'أنشئ تصميمًا واحدًا' : fits === 2 ? 'أنشئ تصميمين' : 'أنشئ التصاميم');
const noteSome = (fits, total) => `<div class="notice n-pro" role="status" style="margin:0">${ic('alert', 20)}<span>رصيدك يكفي ${fits === 1 ? 'لتصميم واحد' : fits === 2 ? 'لتصميمين' : `لـ${L(fits)} تصاميم`} من ${L(total)}.</span></div>`;
const noteNone = (t) => `<div class="notice n-warn" role="alert" style="margin:0;flex-wrap:wrap;align-items:center">${ic('alert', 20)}<div style="flex:1;min-width:160px">${t} <a class="lnk" href="#">الرصيد</a></div><button class="btn">طلب رصيد</button></div>`;
const createBtn = (o) => (o.busy
  ? `<button class="btn p ${o.m ? 'full1' : ''}" disabled aria-busy="true"><span class="spin" style="display:inline-flex">${ic('spin', 18)}</span> جارٍ الإنشاء…</button>`
  : `<button class="btn p ${o.m ? 'full1' : ''} ${o.none ? 'off' : ''}" ${o.none ? 'disabled aria-disabled="true"' : ''}>${ic('sparkle', 18)} ${o.label || createLabel(o.fits)}</button>`);
const reqP = (o = {}) => {
  const note = o.noteHtml || (o.fits && o.fits < (o.total || 2) ? noteSome(o.fits, o.total || 2) : o.none ? noteNone('رصيدك لا يكفي لهذا التصميم.') : '');
  return panel(`<div class="scr"><div class="sumc">${reqRows}</div></div>${note}<div class="pa"><span></span><div class="r"><button class="btn ${o.m ? 'full1' : ''}" ${o.busy ? 'disabled' : ''}>علامة أخرى</button>${createBtn({ ...o, fits: o.fits })}</div></div>`);
};
// edit summary
const editP = (rows, o = {}) => {
  const note = o.none ? noteNone('رصيدك لا يكفي لهذا التعديل.') : '';
  return panel(`<div class="scr"><div class="sumc">${rows}</div></div>${note}<div class="pa"><span></span><div class="r"><button class="btn ${o.m ? 'full1' : ''}" ${o.busy ? 'disabled' : ''}>إلغاء</button>${o.busy ? `<button class="btn p ${o.m ? 'full1' : ''}" disabled aria-busy="true"><span class="spin" style="display:inline-flex">${ic('spin', 18)}</span> جارٍ التعديل…</button>` : `<button class="btn p ${o.m ? 'full1' : ''} ${o.none ? 'off' : ''}" ${o.none ? 'disabled aria-disabled="true"' : ''}>${I('pencil', 18)} عدّله</button>`}</div></div>`);
};
const delRows = [sumRow('العلامة', BR, 0), sumRow('التصميم', thSq(1) + '<span class="hint" style="margin-inline-start:6px">التصميم 1</span>', 0), sumRow('التعديل', 'اجعل الخلفية أفتح وكبّر العنوان قليلًا', 1)].join('');
const upRows = [sumRow('العلامة', BR, 0), sumRow('التصميم', mt(poster('sq', 3)) + '<span class="hint" style="margin-inline-start:6px">من ملفك</span>', 1), sumRow('التغييرات', 'استبدال الشعار، تغيير النص', 1), sumRow('النص الجديد', '<span style="display:block;width:100%">العنوان: خصم نهاية الأسبوع</span><span style="display:block;width:100%;color:var(--ink2)">السطر الثاني: على كل المشروبات</span>', 1)].join('');

// upload / chips / fields
const zoneD = (o) => o.dis ? `<div class="dz dis">${ic('alert', 22)}<span>وصلت إلى الحد الأقصى: ${L(o.max)} ${o.max === 1 ? 'ملف' : 'ملفات'}.</span><small>احذف الملف لتتمكن من اختيار غيره.</small></div>` : `<div class="dz" tabindex="0" role="button">${ic('upload', 24)}<b style="font-weight:600">اسحب الملف هنا أو اضغط للاختيار</b><small>${o.hint}</small></div>`;
const zoneM = (o) => `<div class="pbtns"><button class="btn p" style="flex:1" ${o.dis ? 'disabled' : ''}>${ic('upload', 18)} اختيار ملف</button><button class="btn" style="flex:1" ${o.dis ? 'disabled' : ''}>${ic('cam', 18)} التقاط صورة</button></div><div class="hint" style="margin-block-start:6px">${o.hint}</div>`;
const xbtn = `<button class="x" aria-label="حذف الملف">${ic('trash', 18)}</button>`;
const tileSvg = (svg) => `<div class="fi">${svg.replace('<svg ', '<svg class="pv" ')}${xbtn}</div>`;
const uploadP = (o) => {
  const n = o.tile ? 1 : 0;
  const zone = o.m ? zoneM(o) : zoneD(o);
  return panel(`${o.m && n ? '' : zone}${n ? `<div class="files" style="margin:0">${tileSvg(o.tile)}</div>` : ''}${o.m && n ? `<div class="hint">وصلت إلى الحد الأقصى: ${L(1)} ملف.</div>` : ''}
<div class="pa"><span class="cs"><span class="ltr" dir="ltr">${n} / 1</span></span><div class="r">${n ? `<button class="btn p ${o.m ? 'full1' : ''}">متابعة (ملف واحد)</button>` : ''}</div></div>`);
};
const chipsP = (items, foc) => panel(`<div class="chips" role="group">${items.map((t, i) => `<button class="ch ${foc === i ? 'foc' : ''}">${t}</button>`).join('')}</div>`);
const changesP = (o = {}) => {
  const sel = o.sel || [];
  const items = ['استبدال الشعار', 'استبدال المنتج', 'تغيير النص'];
  const ok = sel.length > 0 || o.v;
  return panel(`<div class="mh2" id="chg">اختر واحدًا أو أكثر</div>
<div class="chips" role="group" aria-labelledby="chg">${items.map((t, i) => sel.includes(i) ? `<button class="ch sel" role="checkbox" aria-checked="true">${ic('check', 16)} ${t}</button>` : `<button class="ch" role="checkbox" aria-checked="false">${t}</button>`).join('')}</div>
<div class="or">أو</div><div class="f2"><span class="${o.v ? '' : 'ph'}">${o.v || 'أو صِفه بكلماتك'}</span></div>
<div class="pa"><span>${cnt(o.v ? o.v.length : 0, 200)}</span><div class="r"><button class="btn p ${o.m ? 'full1' : ''} ${ok ? '' : 'off'}" ${ok ? '' : 'disabled aria-disabled="true"'}>متابعة${sel.length ? ` (${L(sel.length)})` : ''}</button></div></div>`);
};
const fieldsP = (o = {}) => {
  const f = (l, v, ph, max) => `<div class="fld" style="margin:0"><label>${l}</label><div class="f2">${v ? `<span>${v}</span>` : `<span class="ph">${ph}</span>`}</div><div class="cnt"><span></span>${cnt(v.length, max)}</div></div>`;
  return panel(`${f('العنوان الرئيسي', 'خصم نهاية الأسبوع', 'مثال: افتتاحنا الجديد', 60)}${f('السطر الثاني', 'على كل المشروبات', 'مثال: ندعوكم لتجربة قهوتنا', 120)}<div class="pa"><button class="btn ${o.m ? 'full1' : ''}" style="${o.m ? 'flex:1' : ''}">بدون نص</button><div class="r" style="${o.m ? 'flex:1' : ''}"><button class="btn p ${o.m ? 'full1' : ''}">متابعة</button></div></div>`);
};

// download menu body (popover on desktop, bottom sheet on phone)
const dlBody = (o) => {
  const k = o.k || 'sq'; const [, , orig, std] = DIM[k];
  const fmt = o.fmt || 'PNG'; const size = o.size || 'original';
  const dis = o.busy ? 'disabled' : '';
  const seg = ['PNG', 'JPG', 'WebP'].map((f) => `<button role="radio" aria-checked="${f === fmt}" class="${f === fmt ? 'on' : ''}" ${dis}>${L(f)}</button>`).join('');
  const rad = (id, t, d) => `<div class="rad ${size === id ? 'on' : ''}" role="radio" aria-checked="${size === id}"><span class="ro"></span><div><b>${t}</b><span class="d">${L(d)}</span></div></div>`;
  return `<div class="dm ${o.busy ? 'busy' : ''}" ${o.busy ? 'aria-busy="true"' : ''}>
<div><div class="gl" id="dl-t">النوع</div><div class="seg" role="radiogroup" aria-labelledby="dl-t">${seg}</div>${fmt === 'JPG' ? '<div class="hint" style="margin-block-start:6px">يوضع التصميم على خلفية بيضاء.</div>' : ''}</div>
<div><div class="gl" id="dl-s">الحجم</div><div role="radiogroup" aria-labelledby="dl-s">${rad('original', 'الحجم الأصلي', orig)}${rad('standard', 'مقاس منصات التواصل', std)}</div></div>
${o.err ? `<div class="err-u" role="alert" style="margin:0">${ic('alert', 14)}<span>تعذّر التنزيل. تحقق من الاتصال وحاول مرة أخرى.</span></div>` : ''}
<button class="btn p full" ${dis} ${o.busy ? 'aria-busy="true"' : ''}>${o.busy ? `<span class="spin" style="display:inline-flex">${ic('spin', 18)}</span> جارٍ التنزيل…` : o.err ? `${ic('refresh', 18)} إعادة المحاولة` : `${I('dl', 18)} تنزيل`}</button>
${o.busy ? '<span class="sr-only" role="status" style="position:absolute;width:1px;height:1px;overflow:hidden">جارٍ تنزيل التصميم</span>' : ''}</div>`;
};
const sheet = (o) => `<div class="ov sheet"><div class="dlg sh" role="dialog" aria-modal="true" aria-label="تنزيل التصميم"><div class="grab"></div><div class="hh2"><h3>تنزيل التصميم</h3><button class="ib" aria-label="إغلاق">${ic('x', 22)}</button></div>${dlBody(o)}</div></div>`;

// ---- frames
const fr = (cls, t, note, inner) => `<div><div class="tag">${t.replace(/`/g, '')}${note ? `<small>${note.replace(/`/g, '')}</small>` : ''}</div><div class="fr ${cls}">${inner}</div></div>`;
const col = (msgs, dock, o = {}) => `<div class="col ${o.tall ? 'tall' : ''}" ${o.min ? `style="min-height:${o.min}px"` : ''}><div class="msgs">${msgs}</div><div class="dock">${dock}</div></div>`;
const sideNav = () => `<aside>
<div class="brand"><div class="mono">ل</div><b>لمحة AI</b></div>
<button class="btn p newchat">${ic('plus', 18)} محادثة جديدة</button>
<div class="rec">المحادثات الأخيرة
<div class="i on"><span>${AG} · ${BR}</span><span class="hint">الآن</span></div>
<div class="i"><span>تصميم منشور للمعرض</span><span class="hint">أمس</span></div>
<div class="i"><span>ملخص عقد الإيجار</span><span class="hint">أمس</span></div></div>
<nav aria-label="التنقل"><div class="nav">${ic('wallet', 18)} الرصيد</div><div class="nav">${ic('layers', 18)} علاماتي التجارية</div><div class="nav">${ic('img', 18)} تصاميمي</div><div class="nav">${ic('user', 18)} الحساب</div></nav>
</aside>`;
const topD = (title) => `<div class="top"><h1>${title}</h1><div class="lt"><span class="chip">الرصيد <bdi dir="ltr">14.50$</bdi></span><span class="av" aria-label="الحساب">س ع</span></div></div>`;
const appD = (title, inner) => `<div class="app">${sideNav()}<main style="display:flex;flex-direction:column">${topD(title)}<div class="chat" style="flex:1">${inner}</div></main></div>`;
const topM = (title) => `<div class="mtop"><button class="ib" aria-label="فتح القائمة">${ic('menu', 24)}</button><h1>${title}</h1></div>`;
const appM = (title, msgs, dock, o = {}) => `${topM(title)}<div class="col" style="min-height:${o.min || 660}px"><div class="msgs">${msgs}</div><div class="dock">${dock}</div></div>`;

const Q = {
  sumR: 'راجع طلب التصميم قبل أن ننشئه.', format: 'ما نوع التصميم الذي تريده؟', topic: 'ما موضوع التصميم؟ مثال: افتتاح فرع جديد، أو خصم نهاية الأسبوع.',
  edit: 'ماذا أغيّر؟ مثال: اجعل الخلفية أفتح، أو كبّر العنوان.', editSum: 'راجع التعديل قبل أن ننفّذه.',
  up: 'ارفع التصميم الذي تريد تعديله. ملف واحد.', chg: 'ما الذي تريد تغييره؟ اختر واحدًا أو أكثر، أو صِفه بكلماتك.',
  prod: 'ارفع صورة المنتج الجديد. ملف واحد.', txt: 'ما النص الجديد الذي يظهر على التصميم؟ يمكنك ترك الحقلين فارغين.',
};
const hintImg = 'PNG أو JPG أو WebP، حتى 10 ميغابايت';
const two = (o = {}) => [dcard({ n: 1, ...o }), dcard({ n: 2, v: 2, ...(o.second || {}) })];
const resPosts = (o = {}) => resMsg([dcard({ n: 1, disEdit: o.dis }), dcard({ n: 2, v: 2, review: true, disEdit: o.dis })], o);
const formatItems = ['منشور إنستغرام', 'ستوري إنستغرام', 'منشور فيسبوك', 'بانر', 'صورة منتج', 'تعديل تصميم موجود'];

// ================= DESKTOP
const D = [];
D.push(fr('d', 'أ. النتائج: المحادثة كاملة', 'الصور داخل رسالة المصمم وتبقى في السجل. الصندوق السفلي يعرض الخطوة التالية فقط. «تصاميمي» في القائمة الجانبية (S28)', appD(`${AG} · ${BR}`, col(M(aq(Q.sumR), ub('أنشئ التصاميم'), resPosts()), nextP(), { tall: true }))));
function M(...a) { return a.join(''); }
D.push(fr('d', 'ب. أثناء التصميم: المحادثة كاملة', 'لا إدخال: ملاحظة قصيرة فقط. تُحدَّث الرسائل كل ثانيتين دون أن يلاحظ المستخدم', appD(`${AG} · ${BR}`, col(M(aq(Q.sumR), ub('أنشئ التصاميم'), progMsg(1, 2)), progDock(), { tall: true }))));

const sec = (t) => `<div><h1 class="bt" style="font-size:18px">${t}</h1></div>`;
const rows = [];
const cf = (arr, t, n, msgs, dock, o) => arr.push(fr('c', t, n, col(msgs, dock, o)));

// 1 create
const C1 = [];
cf(C1, '1a. ملخص الطلب: «أنشئ التصاميم»', 'الرصيد يكفي لكل التصاميم: لا ملاحظة. الزر الرئيسي يحلّ محل «يبدو جيدًا»', aq(Q.sumR), reqP(), { tall: true });
cf(C1, '1b. الرصيد يكفي لتصميم واحد من 2', '`fitsVariants` = 1: ملاحظة معلومات والزر «أنشئ تصميمًا واحدًا» (يرسل `variants: 1`)', aq(Q.sumR), reqP({ fits: 1, total: 2 }), { tall: true });
cf(C1, '1c. الرصيد يكفي لتصميمين من 3', 'الأعداد: 1 «تصميم واحد / أنشئ تصميمًا واحدًا»، 2 «تصميمين / أنشئ تصميمين»، 3 «3 تصاميم / أنشئ 3 تصاميم»', aq(Q.sumR), reqP({ fits: 2, total: 3 }), { tall: true });
cf(C1, '1d. الرصيد لا يكفي', 'التحذير الحالي مع «الرصيد» و«طلب رصيد»؛ الزر معطّل، و«علامة أخرى» و«تعديل» متاحتان', aq(Q.sumR), reqP({ none: true }), { tall: true });
cf(C1, '1e. جارٍ الإرسال (بعد الضغط)', 'الأزرار معطّلة والزر يدور حتى يصل رد الخادم، ثم تظهر رسالة التقدّم', aq(Q.sumR), reqP({ busy: true }), { tall: true });

// 2 progress
const C2 = [];
cf(C2, '2a. التقدّم: 1 من 2', 'مؤشر هادئ: دوران بطيء ونبض خفيف، يتوقفان مع «تقليل الحركة». لا معاينة للصور قبل رسالة النتائج. `role="status"` و`aria-live="polite"`', M(aq(Q.sumR), ub('أنشئ التصاميم'), progMsg(1, 2)), progDock(), { tall: true });
cf(C2, '2b. التقدّم: 0 من 2', 'البداية', M(aq(Q.sumR), ub('أنشئ التصاميم'), progMsg(0, 2)), progDock(), { tall: true });
cf(C2, '2c. تعديل: 0 من 1', 'تعديل تصميم واحد (إنشاء: «جارٍ التصميم…»، تعديل: «جارٍ تعديل التصميم…»)', M(aq(Q.editSum), ub('عدّله'), progMsg(0, 1, { edit: true })), progDock(), { tall: true });

// 3 results
const C3 = [];
cf(C3, '3a. النتائج: منشوران مربعان', 'التصميم 2 يحتاج مراجعة النص. «تعديل» و«تنزيل» لكل تصميم. الصندوق السفلي: «تصميم جديد» و«علامة أخرى»', M(aq(Q.sumR), ub('أنشئ التصاميم'), resPosts()), nextP(), { tall: true });
cf(C3, '3b. النتائج: ستوري 9:16', 'الشكل محفوظ: بطاقتان بنسبة 9:16', M(ub('أنشئ التصاميم'), resMsg([dcard({ n: 1, k: 'story' }), dcard({ n: 2, k: 'story', v: 2 })])), nextP(), { tall: true });
cf(C3, '3c. النتائج: بانر 16:9', 'البانر بعرض الرسالة كاملًا، تحت بعضها', M(ub('أنشئ التصاميم'), resMsg([dcard({ n: 1, k: 'ban' }), dcard({ n: 2, k: 'ban', v: 2, review: true })])), nextP(), { min: 900 });
cf(C3, '3d. بعد التعديل: «v2»', 'التصميم المعدَّل يحمل شارة النسخة. تصميم واحد، و«تعديل» متاحة لمزيد من النسخ (v3...)', M(aq(Q.editSum), ub('عدّله'), resMsg([dcard({ n: 1, ver: 2 })], { title: 'تم التعديل', body: 'هذه نسخة التصميم الجديدة.' })), nextP(), { tall: true });
cf(C3, '3e. لم يخرج أي تصميم', 'مصفوفة `designs` فارغة: رسالة، ثم «حاول مرة أخرى» (تعود إلى الملخص) و«علامة أخرى»', M(aq(Q.sumR), ub('أنشئ التصاميم'), emptyMsg()), nextP({ retry: true, hint: 'يمكنك المحاولة من جديد.' }), { tall: true });
cf(C3, '3f. تنزيل من تصميم جاهز (حالة التركيز)', 'حلقة التركيز على «تنزيل»؛ البطاقات أزرارها 44px', M(ub('أنشئ التصاميم'), resMsg([dcard({ n: 1 })])), nextP(), { tall: true });

// 4 older
const C4 = [];
const older = M(aq(Q.sumR), ub('أنشئ التصاميم'), resPosts({ dis: true, note: 'أكمل الخطوة الحالية أولًا.' }), ub('تصميم جديد'), aq(Q.topic));
cf(C4, '4a. «تعديل» على نتائج قديمة', 'المحادثة الآن عند خطوة أخرى (موضوع تصميم جديد): «تعديل» معطّلة (`aria-disabled`) مع «أكمل الخطوة الحالية أولًا»؛ «تنزيل» تبقى متاحة', older, textP({ ph: 'اكتب موضوع التصميم', max: 200 }), { min: 1060 });
cf(C4, '4b. النتائج الحالية: «تعديل» متاحة', 'للمقارنة: عند خطوة النتائج نفسها تكون «تعديل» متاحة لكل تصميم', M(aq(Q.sumR), ub('أنشئ التصاميم'), resPosts()), nextP(), { tall: true });

// 5 download menu
const C5 = [];
const withMenu = (menu, k = 'sq') => M(ub('أنشئ التصاميم'), resMsg([dcard({ n: 1, k, menu })], { body: 'اضغط «تعديل» لتغيير التصميم، أو «تنزيل» لحفظه.' }));
cf(C5, '5a. قائمة التنزيل: الافتراضي', 'النوع PNG والحجم «الحجم الأصلي» محدّدان. تفتح من «تنزيل» تحت التصميم؛ الأحجام بالبكسل لشكل هذا التصميم', withMenu({}), nextP(), { min: 1100 });
cf(C5, '5b. JPG ومقاس منصات التواصل (ستوري)', 'المقاس بحسب الشكل: 1080×1920 لستوري. JPG تُوضع على خلفية بيضاء فيظهر سطر شرح', withMenu({ fmt: 'JPG', size: 'standard' }, 'story'), nextP(), { min: 1360 });
cf(C5, '5c. جارٍ التنزيل', 'الخيارات معطّلة والزر يدور (جلب الملف بالرمز ثم حفظه باسم الخادم)', withMenu({ busy: true }), nextP(), { min: 1100 });
cf(C5, '5d. تعذّر التنزيل', 'الاختيارات باقية، و«إعادة المحاولة» تنزّل بالخيارات نفسها', withMenu({ err: true, fmt: 'WebP' }), nextP(), { min: 1120 });

// 6 edit delivered
const C6 = [];
const editAsk = M(aq(Q.sumR), ub('أنشئ التصاميم'), resMsg([dcard({ n: 1 })], { body: '' }), ubTh([poster('sq', 1)]).replace('</div></div>', '</div></div>'), ub('تعديل التصميم 1'), aq(Q.edit));
cf(C6, '6a. design_edit: «ماذا أغيّر؟»', 'الضغط على «تعديل» يضيف رد المستخدم ثم السؤال. حقل نصي (حد 500 حرف مقترح)', M(resMsg([dcard({ n: 1 })], { body: '' }), ub('تعديل التصميم 1'), aq(Q.edit)), textP({ ph: 'اكتب ما تريد تغييره', max: 500 }), { tall: true });
cf(C6, '6b. edit_summary', 'تصميم واحد. «عدّله» و«إلغاء» (cancel: يعود إلى نوع التصميم). «تعديل» بجانب نص التعديل يعيد إلى سؤاله', M(ub('اجعل الخلفية أفتح وكبّر العنوان قليلًا'), aq(Q.editSum)), editP(delRows), { tall: true });
cf(C6, '6c. edit_summary: الرصيد لا يكفي', 'نفس ملاحظة الرصيد؛ «عدّله» معطّل و«إلغاء» متاح', M(ub('اجعل الخلفية أفتح وكبّر العنوان قليلًا'), aq(Q.editSum)), editP(delRows, { none: true }), { tall: true });
cf(C6, '6d. edit_summary: جارٍ الإرسال', '', M(ub('اجعل الخلفية أفتح وكبّر العنوان قليلًا'), aq(Q.editSum)), editP(delRows, { busy: true }), { tall: true });

// 7 edit uploaded
const C7 = [];
cf(C7, '7a. design_format مع «تعديل تصميم موجود»', 'خيار سادس مع أنواع التصميم (`edit_existing`)', aq(Q.format), chipsP(formatItems, 5));
cf(C7, '7b. edit_upload: بلا ملف', 'ملف واحد (`kind: design`). لا «تخطّي»: الخطوة مطلوبة', M(ub('تعديل تصميم موجود'), aq(Q.up)), uploadP({ hint: hintImg }));
cf(C7, '7c. edit_upload: جاهز', 'بعد اختيار الملف تتعطّل المنطقة (الحد 1)، و«متابعة»', M(ub('تعديل تصميم موجود'), aq(Q.up)), uploadP({ hint: hintImg, dis: true, max: 1, tile: poster('sq', 3) }));
cf(C7, '7d. edit_changes: بلا اختيار', 'اختيار متعدّد. «متابعة» معطّلة حتى يُختار خيار أو يُكتب وصف', M(ub('ملف التصميم'), aq(Q.chg)), changesP());
cf(C7, '7e. edit_changes: خياران محدّدان', 'الخيار المحدّد: تعبئة وحدّ سميك وعلامة ✓ (لا يعتمد على اللون وحده). «متابعة (2)»', M(ub('ملف التصميم'), aq(Q.chg)), changesP({ sel: [0, 2] }));
cf(C7, '7f. edit_changes: وصف بالكلمات', 'يمكن الاكتفاء بالوصف دون اختيار (يرسل `{ choices: [], text }`)', M(ub('ملف التصميم'), aq(Q.chg)), changesP({ v: 'اجعل اللون الأساسي أخضر' }));
cf(C7, '7g. edit_product (عند استبدال المنتج)', 'ملف واحد من نوع `product`', M(ub('استبدال المنتج'), aq(Q.prod)), uploadP({ hint: hintImg }));
cf(C7, '7h. edit_text (عند تغيير النص)', 'العنوان ≤60 والسطر الثاني ≤120', M(ub('تغيير النص'), aq(Q.txt)), fieldsP());
cf(C7, '7i. edit_summary: تصميم مرفوع', 'كل صف له «تعديل» يعود إلى سؤاله ثم إلى الملخص. التصميم يحتفظ بشكله (لا اختيار مقاس)', M(ub('متابعة'), aq(Q.editSum)), editP(upRows), { tall: true });

// 8 errors
const C8 = [];
const notReady = `<div class="notice n-warn" role="alert" style="margin:0">${ic('alert', 20)}<div style="flex:1">لا يمكن إنشاء التصاميم الآن. حاول مرة أخرى بعد قليل.</div></div>`;
cf(C8, '8a. AGENT_NOT_READY', 'يبقى الملخص كما هو والزر متاح لإعادة المحاولة. لا ذكر لنماذج أو مزودين', aq(Q.sumR), reqP({ noteHtml: notReady }), { tall: true });
cf(C8, '8b. INSUFFICIENT_BALANCE: يكفي لبعضها', 'رصيد تغيّر عند التأكيد: من `data.fitsVariants`. الزر يتحدّث إلى «أنشئ تصميمًا واحدًا». لا أسعار', aq(Q.sumR), reqP({ fits: 1, total: 2, noteHtml: `<div class="notice n-warn" role="alert" style="margin:0">${ic('alert', 20)}<div style="flex:1">رصيدك لم يعد يكفي لكل التصاميم. يكفي الآن لتصميم واحد من ${L(2)}.</div></div>` }), { tall: true });
cf(C8, '8c. INSUFFICIENT_BALANCE: لا يكفي لأي تصميم', '`fitsVariants` = 0: التحذير مع «الرصيد» و«طلب رصيد» والزر معطّل (لا إضافة رصيد أو دفع)', aq(Q.sumR), reqP({ none: true, noteHtml: noteNone('رصيدك لا يكفي لهذا الطلب.') }), { tall: true });
cf(C8, '8d. DESIGN_IN_PROGRESS', 'ملاحظة قصيرة فوق التقدّم، تُعاد الرسائل ويستمر التتبّع', M(aq(Q.sumR), ub('أنشئ التصاميم'), `<div class="hint" role="status" style="display:flex;gap:6px;align-items:center;justify-content:center;color:var(--ink2)">${ic('refresh', 14)} التصاميم قيد الإنشاء بالفعل، نتابع التقدّم.</div>`, progMsg(1, 2)), progDock(), { tall: true });

const desktop = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>S27 التصاميم في المحادثة</title>${font}<style>${css}</style></head><body><div class="board">
<div><h1 class="bt">S27 · التصاميم في المحادثة (سطح المكتب)</h1><p class="note">لوحة تصميم: العناوين والملاحظات الصغيرة شرح للمراجعة وليست جزءًا من الواجهة. بيانات تجريبية (علامة «${BR}»). تمتد على لوحة S25 المعتمدة: الشكل نفسه، وصندوق الإدخال السفلي يحلّ محل مربع الكتابة. لا أسعار في أي إطار: ملاحظات الرصيد فقط. الصور خاصة (تُجلب بالرمز ولا تظهر روابطها). إطارات الأعمدة تعرض عمود المحادثة وحده.</p></div>
${D.join('\n')}
${sec('1. زر الإنشاء في ملخص الطلب')}<div class="row">${C1.join('\n')}</div>
${sec('2. التقدّم')}<div class="row">${C2.join('\n')}</div>
${sec('3. النتائج')}<div class="row">${C3.join('\n')}</div>
${sec('4. «تعديل» على رسالة نتائج قديمة')}<div class="row">${C4.join('\n')}</div>
${sec('5. قائمة التنزيل')}<div class="row">${C5.join('\n')}</div>
${sec('6. تعديل تصميم سُلّم')}<div class="row">${C6.join('\n')}</div>
${sec('7. تعديل تصميم مرفوع')}<div class="row">${C7.join('\n')}</div>
${sec('8. الأخطاء')}<div class="row">${C8.join('\n')}</div>
</div></body></html>`;
const fx = (h) => h.replace(/(?<![\w>])(\d+ \/ \d+)(?![\w<])/g, '<bdi dir="ltr">$1</bdi>');
fs.writeFileSync(path.join(dir, 'desktop.html'), fx(desktop));

// ================= MOBILE
const Mx = [];
const mf = (t, n, msgs, dock, o = {}) => Mx.push(fr('m', t, n, appM(`${AG} · ${BR}`, msgs, dock, o) + (o.overlay || '')));
mf('م1. «أنشئ التصاميم»', 'الأزرار بعرض اللوحة', aq(Q.sumR), reqP({ m: true }));
mf('م1b. يكفي لتصميم واحد من 2', '«أنشئ تصميمًا واحدًا»', aq(Q.sumR), reqP({ m: true, fits: 1, total: 2 }));
mf('م1c. الرصيد لا يكفي', 'الزر معطّل', aq(Q.sumR), reqP({ m: true, none: true }));
mf('م2. التقدّم: 1 من 2', 'الصندوق السفلي ملاحظة فقط', M(aq(Q.sumR), ub('أنشئ التصاميم'), progMsg(1, 2)), progDock());
mf('م2b. DESIGN_IN_PROGRESS', 'ملاحظة قصيرة مع بقاء التقدّم', M(ub('أنشئ التصاميم'), `<div class="hint" role="status" style="display:flex;gap:6px;align-items:center;justify-content:center;color:var(--ink2)">${ic('refresh', 14)} التصاميم قيد الإنشاء بالفعل، نتابع التقدّم.</div>`, progMsg(0, 2)), progDock());
mf('م3. النتائج: عمود واحد (المقترح)', 'بطاقة بعرض الرسالة، بالترتيب. الستوري بعرض أضيق', M(ub('أنشئ التصاميم'), resPosts()), nextP({ m: true }), { min: 1080 });
mf('م3b. النتائج: صف يُمرَّر (بديل)', 'ثلثا الشاشة تقريبًا لكل بطاقة مع إطلالة على التالية ونقاط', M(ub('أنشئ التصاميم'), resMsg([dcard({ n: 1 }), dcard({ n: 2, v: 2, review: true })], { swipe: true })), nextP({ m: true }), { min: 700 });
mf('م3c. ستوري 9:16', '', M(ub('أنشئ التصاميم'), resMsg([dcard({ n: 1, k: 'story' }), dcard({ n: 2, k: 'story', v: 2 })])), nextP({ m: true }), { min: 1300 });
mf('م3d. بانر مع v2', 'التعديل: «v2» على الصورة', M(ub('عدّله'), resMsg([dcard({ n: 1, k: 'ban', ver: 2 })], { title: 'تم التعديل', body: 'هذه نسخة التصميم الجديدة.' })), nextP({ m: true }), { min: 700 });
mf('م3e. لم يخرج أي تصميم', '', M(ub('أنشئ التصاميم'), emptyMsg()), nextP({ m: true, retry: true, hint: 'يمكنك المحاولة من جديد.' }));
mf('م4. «تعديل» على نتائج قديمة', 'معطّلة مع «أكمل الخطوة الحالية أولًا»', M(resMsg([dcard({ n: 1, disEdit: true })], { note: 'أكمل الخطوة الحالية أولًا.' }), ub('تصميم جديد'), aq(Q.topic)), textP({ ph: 'اكتب موضوع التصميم', max: 200 }), { min: 900 });
const shOv = (o) => ({ overlay: sheet(o), min: 700 });
mf('م5. قائمة التنزيل (ورقة سفلية)', 'الافتراضي: PNG والحجم الأصلي', ub('أنشئ التصاميم') + resMsg([dcard({ n: 1 })], { body: '' }), nextP({ m: true }), shOv({}));
mf('م5b. JPG ومقاس المنصات (ستوري)', '1080×1920', ub('أنشئ التصاميم') + resMsg([dcard({ n: 1, k: 'story' })], { body: '' }), nextP({ m: true }), shOv({ k: 'story', fmt: 'JPG', size: 'standard' }));
mf('م5c. جارٍ التنزيل', '', ub('أنشئ التصاميم') + resMsg([dcard({ n: 1 })], { body: '' }), nextP({ m: true }), shOv({ busy: true }));
mf('م5d. تعذّر التنزيل', '', ub('أنشئ التصاميم') + resMsg([dcard({ n: 1 })], { body: '' }), nextP({ m: true }), shOv({ err: true, fmt: 'WebP' }));
mf('م6. design_edit', '', M(resMsg([dcard({ n: 1 })], { body: '' }), ub('تعديل التصميم 1'), aq(Q.edit)), textP({ ph: 'اكتب ما تريد تغييره', max: 500 }), { min: 900 });
mf('م6b. edit_summary', '', M(ub('اجعل الخلفية أفتح وكبّر العنوان قليلًا'), aq(Q.editSum)), editP(delRows, { m: true }));
mf('م6c. edit_summary: لا يكفي', '', M(ub('اجعل الخلفية أفتح وكبّر العنوان قليلًا'), aq(Q.editSum)), editP(delRows, { m: true, none: true }));
mf('م7. تعديل تصميم موجود', 'الخيار السادس في أنواع التصميم', aq(Q.format), chipsP(formatItems, undefined));
mf('م7b. edit_upload', 'اختيار ملف والتقاط صورة', M(ub('تعديل تصميم موجود'), aq(Q.up)), uploadP({ m: true, hint: hintImg }));
mf('م7c. edit_changes: اختيار متعدّد', '', M(ub('ملف التصميم'), aq(Q.chg)), changesP({ m: true, sel: [0, 2] }));
mf('م7d. edit_changes: بلا اختيار', '«متابعة» معطّلة', M(ub('ملف التصميم'), aq(Q.chg)), changesP({ m: true }));
mf('م7e. edit_summary: تصميم مرفوع', '', M(ub('متابعة'), aq(Q.editSum)), editP(upRows, { m: true }), { min: 760 });
mf('م8. AGENT_NOT_READY', '', aq(Q.sumR), reqP({ m: true, noteHtml: notReady }));
mf('م8b. INSUFFICIENT_BALANCE', 'يكفي لبعضها', aq(Q.sumR), reqP({ m: true, fits: 1, total: 2, noteHtml: `<div class="notice n-warn" role="alert" style="margin:0">${ic('alert', 20)}<div style="flex:1">رصيدك لم يعد يكفي لكل التصاميم. يكفي الآن لتصميم واحد من ${L(2)}.</div></div>` }));

const mobile = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>S27 التصاميم في المحادثة (جوال)</title>${font}<style>${css}</style></head><body><div class="board">
<div><h1 class="bt">S27 · التصاميم في المحادثة (جوال 375px)</h1><p class="note">القائمة الجانبية درج يفتحه زر القائمة. قائمة التنزيل ورقة سفلية. النتائج في عمود واحد (م3) مع بديل صف يُمرَّر (م3b) للقرار.</p></div>
<div class="row">${Mx.join('\n')}</div>
</div></body></html>`;
fs.writeFileSync(path.join(dir, 'mobile.html'), fx(mobile));
console.log('ok');
