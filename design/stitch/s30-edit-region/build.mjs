// Hand-built S30 "mark an area on the uploaded design" boards (graphic designer, edit flow). Run: node build.mjs -> desktop.html, mobile.html
// PNGs: node render.mjs. Look comes from s25-css.mjs (S25 CSS, unchanged) and s24-parts.mjs (S24 parts, unchanged), plus the additions below.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { css as baseCss } from './s25-css.mjs';
import { ic, P } from './s24-parts.mjs';
const dir = path.dirname(fileURLToPath(import.meta.url));

const css = baseCss + `
.fr.c{width:760px}
.mh2{font-size:14px;font-weight:600;color:var(--ink)}
.pulse{animation:pl 2s ease-in-out infinite}@keyframes pl{50%{opacity:.5}}
@media (prefers-reduced-motion:reduce){.pulse{animation:none}}
/* ---- region input (S30). The image is a LTR coordinate space (x from the image's left, y from the top), never mirrored. */
.rg-h1{display:flex;gap:8px;align-items:flex-start;font-size:14px;color:var(--ink2);line-height:22px}
.rg-h1 .ico{color:var(--pro);margin-block-start:1px}
.rg-stg{display:flex;justify-content:center;padding:22px;background:var(--muted-s);border:1px solid var(--bs);border-radius:12px;touch-action:none;position:relative}
.rg-img{position:relative;direction:ltr;cursor:crosshair;user-select:none;-webkit-user-select:none;touch-action:none;--hit:32px}
.rg-img.foc{outline:3px solid var(--pro);outline-offset:4px}
.rg-clip{position:absolute;inset:0;overflow:hidden;border-radius:6px;background:#fff}
.rg-clip svg{display:block;width:100%;height:100%}
.rg-dim{position:absolute;box-shadow:0 0 0 999px rgba(15,23,42,.6)}
.rg-dim.lt{box-shadow:0 0 0 999px rgba(15,23,42,.45)}
.rg-bx{position:absolute;border:2px solid #fff;box-shadow:0 0 0 1px rgba(15,23,42,.75);cursor:move}
.rg-bx.foc{outline:3px solid var(--pro);outline-offset:3px}
.rg-bx.bad{border:2px dashed #fff;box-shadow:0 0 0 2px var(--dan);cursor:crosshair}
.rg-bx.lock{opacity:.8;cursor:default}
.rg-lw{position:absolute;inset-block-start:4px;inset-inline-start:4px}.rg-lbl{display:block;direction:rtl;background:#fff;color:var(--ink);border-radius:9999px;padding:0 8px;font-size:12px;font-weight:600;line-height:20px;white-space:nowrap}
.rg-h{position:absolute;width:var(--hit);height:var(--hit);display:grid;place-items:center;transform:translate(-50%,-50%)}
.rg-h i{display:block;width:16px;height:16px;background:#fff;border:2px solid var(--pro);border-radius:4px;box-shadow:0 0 0 1px rgba(255,255,255,.9)}
.rg-h.tl{inset-inline-start:0;inset-block-start:0;cursor:nwse-resize}.rg-h.br{inset-inline-start:100%;inset-block-start:100%;cursor:nwse-resize}
.rg-h.tr{inset-inline-start:100%;inset-block-start:0;cursor:nesw-resize}.rg-h.bl{inset-inline-start:0;inset-block-start:100%;cursor:nesw-resize}
.rg-cur{position:absolute;inset-inline-start:100%;inset-block-start:100%;transform:translate(-30%,-30%);color:#fff;filter:drop-shadow(0 0 2px rgba(15,23,42,.9));pointer-events:none}
.rg-fing{position:absolute;inset-inline-start:100%;inset-block-start:100%;width:44px;height:44px;border-radius:50%;background:rgba(79,70,229,.28);border:2px solid #fff;box-shadow:0 0 0 1px rgba(15,23,42,.6);transform:translate(-50%,-50%);pointer-events:none}
.rg-pill{position:absolute;inset-inline:0;inset-block-end:12px;margin-inline:auto;width:max-content;max-width:90%;display:flex;gap:8px;align-items:center;background:#fff;border:1px solid var(--bc);border-radius:9999px;padding:6px 14px;font-size:14px;font-weight:500;direction:rtl;pointer-events:none}
.rg-st{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:44px;font-size:13px;color:var(--ink2)}
.rg-st .err-u{margin:0;font-size:14px}
.rg-st.pad{min-height:44px}
.rg-load{display:grid;place-items:center;background:var(--bs);border:1px dashed var(--bc);border-radius:6px;position:relative;overflow:hidden}
.rg-load:before{content:'';position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.7) 50%,transparent 70%);animation:sh 1.6s linear infinite}
@keyframes sh{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
@media (prefers-reduced-motion:reduce){.rg-load:before{animation:none}}
.rg-fail{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;background:var(--dan-c);border:1px solid var(--dan-b);border-radius:6px;color:var(--dan);padding:16px;direction:rtl}
.rg-fail .btn{background:#fff}
.rg-mini{position:relative;direction:ltr;flex-shrink:0}
.rg-mini .rg-clip{border-radius:6px}
.rg-mbx{position:absolute;border:2px solid #fff;box-shadow:0 0 0 1px rgba(15,23,42,.75)}
.rg-mini.sm .rg-mbx{border-width:1.5px}
.rg-ub{display:flex;flex-direction:column;gap:6px;align-items:flex-start}
.rg-cap{padding:0 8px 6px;font-size:16px;line-height:28px}
.rg-act{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.rg-act .r{display:flex;gap:10px;align-items:center}
.m .rg-act{flex-direction:column;align-items:stretch}.m .rg-act .r{width:100%}.m .rg-act .r .btn{flex:1}.m .rg-act>.btn{flex:none;width:100%}.m .scr{max-height:560px}
.m .rg-stg{margin-inline:-14px;padding:0;border-radius:0;border-inline:0;background:none}
.m .rg-stg.pt{padding:14px 0;background:var(--muted-s)}
.m .rg-img{--hit:44px}
.m .rg-st{min-height:44px}
.kbh{border:1px solid var(--bs);border-radius:12px;padding:12px 14px;background:var(--muted-s);font-size:14px;display:flex;flex-direction:column;gap:6px}
.kbh .k{display:inline-block;direction:ltr;unicode-bidi:isolate;border:1px solid var(--bc);border-radius:6px;padding:0 6px;background:#fff;font-weight:500;font-size:13px;line-height:20px}
.kbh .rw{display:flex;gap:10px;align-items:baseline}.kbh .rw>span:first-child{min-width:230px;flex-shrink:0}
.spec{padding:24px;background:#fff;display:flex;gap:40px;align-items:flex-start;flex-wrap:wrap}
.spec .it{display:flex;flex-direction:column;align-items:center;gap:10px;font-size:13px;color:var(--ink2);text-align:center;max-width:200px}
.spec .box{width:120px;height:90px;position:relative;background:var(--muted-s);border-radius:6px;direction:ltr}
.spec .hit{outline:1.5px dashed var(--pro);background:rgba(79,70,229,.1);border-radius:50%}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
`;
const font = '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">';
const P2 = {
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7" r="1"/><circle cx="15.5" cy="7" r="1"/>',
  pencil: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><rect x="8" y="8" width="8" height="8" rx="1"/>',
  undo: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/>',
  kbd: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
  cross: '<path d="M12 3v18M3 12h18"/>',
};
const ic2 = (n, s = 20) => `<span style="display:inline-flex;flex-shrink:0"><svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P2[n]}</svg></span>`;
const I = (n, s) => (P2[n] ? ic2(n, s) : ic(n, s));
const L = (t) => `<bdi dir="ltr">${t}</bdi>`;
const AG = 'مصمم جرافيك';
const BR = 'مقهى الندى';

// ---- sample uploaded design: a promo card, logo top-left, round product badge in the centre (content, not UI)
const SHAPES = { land: { w: 1600, h: 1200 }, port: { w: 1200, h: 1600 } };
const promo = (shape) => {
  const { w, h } = SHAPES[shape]; const vw = shape === 'land' ? 400 : 300; const vh = shape === 'land' ? 300 : 400;
  const cx = vw / 2; const cy = shape === 'land' ? 150 : 190;
  const t = (x, y, s, wt, txt, f = '#F2E3CF') => `<text x="${x}" y="${y}" font-size="${s}" font-weight="${wt}" fill="${f}" text-anchor="middle" font-family="IBM Plex Sans Arabic">${txt}</text>`;
  return `<svg viewBox="0 0 ${vw} ${vh}" preserveAspectRatio="none" role="img" aria-label="التصميم المرفوع"><rect width="${vw}" height="${vh}" fill="#123B3A"/><rect x="16" y="16" width="44" height="44" rx="10" fill="#F2E3CF"/><circle cx="38" cy="38" r="13" fill="#7A3E1D"/><circle cx="38" cy="38" r="6" fill="#F2E3CF"/><circle cx="${cx}" cy="${cy}" r="66" fill="#0B2423"/><circle cx="${cx}" cy="${cy}" r="62" fill="none" stroke="#C9A24B" stroke-width="5"/><circle cx="${cx}" cy="${cy}" r="42" fill="#F2E3CF"/>${t(cx, cy + 16, 46, 700, '1', '#7A3E1D')}${t(cx, vh - 42, 22, 700, 'عرض الذكرى الأولى')}${t(cx, vh - 18, 12, 400, 'خصم 20% على كل المشروبات')}</svg>`;
};
// normalised boxes (x, y from the image's top-left; each side >= 0.03)
const BOX = {
  land: { product: { x: 0.33, y: 0.27, w: 0.34, h: 0.46 }, logo: { x: 0.025, y: 0.03, w: 0.15, h: 0.2 }, tiny: { x: 0.48, y: 0.46, w: 0.022, h: 0.035 }, drawn: { x: 0.33, y: 0.27, w: 0.24, h: 0.3 }, logoDraw: { x: 0.025, y: 0.03, w: 0.09, h: 0.12 } },
  port: { product: { x: 0.2, y: 0.25, w: 0.6, h: 0.45 }, logo: { x: 0.03, y: 0.025, w: 0.2, h: 0.15 } },
};
const pos = (b) => `inset-inline-start:${b.x * 100}%;inset-block-start:${b.y * 100}%;width:${b.w * 100}%;height:${b.h * 100}%`;
const WIDTH = { land: 520, port: 300 };
const WIDTH_M = { land: '100%', port: '240px' };

// stage: the image in its real shape + the box layers
// o: shape, box, state (empty|drawing|placed|small|busy|focus|kbd|load|fail), label, m
const stage = (o) => {
  const shape = o.shape || 'land'; const { w, h } = SHAPES[shape]; const b = o.box; const st = o.state;
  const width = o.m ? WIDTH_M[shape] : WIDTH[shape] + 'px';
  const sty = `width:${width};aspect-ratio:${w}/${h}`;
  const cap = o.m ? 'port' : '';
  const wrap = (inner) => `<div class="rg-stg ${o.m && shape === 'port' ? 'pt' : ''}">${inner}</div>`;
  if (st === 'load') return wrap(`<div class="rg-img" style="${sty}" aria-busy="true"><div class="rg-load" style="position:absolute;inset:0" role="status" aria-label="جارٍ تحميل التصميم"><span class="spin" style="display:inline-flex;color:var(--ink2);position:relative">${ic('spin', 28)}</span></div></div>`);
  if (st === 'fail') return wrap(`<div class="rg-img" style="${sty}"><div class="rg-fail" style="position:absolute;inset:0" role="alert">${ic('alert', 26)}<b style="font-weight:600">تعذّر تحميل التصميم.</b><span style="font-size:13px">تحقق من الاتصال ثم أعد المحاولة.</span><button class="btn">${ic('refresh', 18)} إعادة المحاولة</button></div></div>`);
  const dim = b ? `<i class="rg-dim ${st === 'small' ? 'lt' : ''}" style="${pos(b)}"></i>` : '';
  let bx = '';
  if (b && st === 'drawing') bx = `<div class="rg-bx" style="${pos(b)}">${o.m ? '<i class="rg-fing"></i>' : `<span class="rg-cur">${I('cross', 22)}</span>`}</div>`;
  else if (b && st === 'small') bx = `<div class="rg-bx bad" style="${pos(b)}"></div>`;
  else if (b) {
    const lock = st === 'busy' ? 'lock' : '';
    const handles = lock ? '' : ['tl', 'tr', 'bl', 'br'].map((c) => `<span class="rg-h ${c}"><i></i></span>`).join('');
    bx = `<div class="rg-bx ${lock} ${st === 'focus' ? 'foc' : ''}" style="${pos(b)}" ${lock ? '' : 'tabindex="0" role="group" aria-label="المربع المحدَّد. الأسهم للتحريك."'}>${o.label ? `<span class="rg-lw"><span class="rg-lbl">${o.label}</span></span>` : ''}${handles}</div>`;
  }
  const pill = st === 'empty' || st === 'kbd' ? `<div class="rg-pill">${I('scan', 18)}<span>${o.m ? 'اسحب بإصبعك لرسم مربع' : st === 'kbd' ? `اضغط ${L('Enter')} لإنشاء مربع في الوسط` : 'اسحب لرسم مربع'}</span></div>` : '';
  return wrap(`<div class="rg-img ${st === 'kbd' ? 'foc' : ''}" style="${sty}" ${st === 'busy' ? 'aria-busy="true"' : 'tabindex="0" role="application" aria-roledescription="محدّد منطقة"'} aria-label="التصميم الذي رفعته. حدّد ${o.what} بمربع."><div class="rg-clip">${promo(shape)}${dim}</div>${bx}${pill}</div>`);
};
const mini = (shape, b, w, o = {}) => {
  const { w: iw, h: ih } = SHAPES[shape];
  return `<div class="rg-mini ${o.sm ? 'sm' : ''}" style="width:${w}px;aspect-ratio:${iw}/${ih}" role="img" aria-label="${o.alt}"><div class="rg-clip">${promo(shape)}<i class="rg-dim lt" style="${pos(b)}"></i></div><i class="rg-mbx" style="${pos(b)}"></i></div>`;
};

// ---- message / dock parts (copied from S25/S27 conventions)
const aq = (t) => `<div class="amsg"><span class="achip">${I('palette', 14)} ${AG}</span><p>${t}</p></div>`;
const ub = (t) => `<div class="um">${t}</div>`;
const ubReg = (txt, thumb) => `<div class="um pad0"><div class="rg-ub">${thumb}<div class="rg-cap">${txt}</div></div></div>`;
const panel = (inner, o = {}) => `<div class="panel ${o.err ? 'err' : ''}">${inner}</div>`;
const errU = (t) => `<div class="err-u" role="alert">${ic('alert', 16)}<span>${t}</span></div>`;
const Q = {
  chg: 'استبدال الشعار، استبدال المنتج', prodQ: 'حدّد مكان المنتج في التصميم', logoQ: 'حدّد مكان الشعار في التصميم',
  prodH: 'اسحب مربعًا حول المنتج الذي تريد استبداله', logoH: 'اسحب مربعًا حول الشعار الذي تريد استبداله',
  newProd: 'ارفع صورة المنتج الجديد. ملف واحد.', editSum: 'راجع التعديل قبل أن ننفّذه.',
};
const hintImg = 'PNG أو JPG أو WebP، حتى 10 ميغابايت';

// action row. state decides what is enabled
const acts = (o) => {
  const { m, optional, state } = o;
  const noBox = ['empty', 'drawing', 'load', 'fail', 'kbd', 'small'].includes(state);
  const busy = state === 'busy'; const skipBusy = state === 'skipbusy';
  const resetOff = ['empty', 'drawing', 'load', 'fail', 'busy', 'skipbusy', 'kbd'].includes(state);
  const contOff = noBox || busy || skipBusy;
  const reset = `<button class="btn ${resetOff ? 'off' : ''} ${m ? 'full1' : ''}" ${resetOff ? 'disabled aria-disabled="true"' : ''}>${I('undo', 18)} إعادة التحديد</button>`;
  const cont = busy
    ? `<button class="btn p ${m ? 'full1' : ''}" disabled aria-busy="true"><span class="spin" style="display:inline-flex">${ic('spin', 18)}</span> جارٍ الإرسال…</button>`
    : `<button class="btn p ${m ? 'full1' : ''} ${contOff ? 'off' : ''}" ${contOff ? 'disabled aria-disabled="true"' : ''}>متابعة</button>`;
  const skip = optional ? (skipBusy
    ? `<button class="btn ${m ? 'full1' : ''}" disabled aria-busy="true"><span class="spin" style="display:inline-flex">${ic('spin', 18)}</span> جارٍ التخطّي…</button>`
    : `<button class="btn ${m ? 'full1' : ''} ${busy ? 'off' : ''}" ${busy ? 'disabled aria-disabled="true"' : ''}>تخطَّ — سأجده بنفسي</button>`) : '';
  if (m) return `<div class="rg-act"><div class="r">${reset}${cont}</div>${skip}</div>`;
  return `<div class="rg-act">${reset}<div class="r">${skip}${cont}</div></div>`;
};
const statusLine = (o) => {
  const m = o.m; const kbBtn = !m ? `<button class="tx" aria-expanded="${o.kb ? 'true' : 'false'}">${I('kbd', 16)} اختصارات لوحة المفاتيح</button>` : '';
  let l = '';
  switch (o.state) {
    case 'empty': l = `<span>لم تحدّد مكانًا بعد.</span>`; break;
    case 'kbd': l = `<span>لم تحدّد مكانًا بعد.</span>`; break;
    case 'drawing': l = `<span>${o.m ? 'ارفع إصبعك لتثبيت المربع.' : 'أفلت الزر لتثبيت المربع.'}</span>`; break;
    case 'placed': case 'focus': l = `<span>${o.redo ? 'هذا تحديدك السابق. عدّله أو أعد التحديد من جديد.' : 'حرّك المربع أو اسحب ركنًا لتغيير حجمه.'}</span>`; break;
    case 'small': l = errU('المربع صغير جدًا. اسحب مربعًا أكبر حول ' + o.what + '.'); break;
    case 'busy': l = `<span>جارٍ إرسال التحديد…</span>`; break;
    case 'skipbusy': l = `<span>جارٍ التخطّي…</span>`; break;
    case 'load': l = `<span>جارٍ تحميل التصميم…</span>`; break;
    case 'fail': l = '<span></span>'; break;
    case 'err400': l = errU('تعذّر حفظ التحديد. عدّل المربع وحاول مرة أخرى.'); break;
    case 'errnet': l = errU('تعذّر إرسال التحديد. تحقق من الاتصال وحاول مرة أخرى. مربعك محفوظ.'); break;
    default: l = '<span></span>';
  }
  return `<div class="rg-st" role="status" aria-live="polite">${l}${kbBtn}</div>`;
};
const kbHelp = () => `<div class="kbh" id="kbh"><div class="rw"><span><b style="font-weight:600">${L('Tab')}</b> إلى الصورة ثم <span class="k">Enter</span></span><span>ينشئ مربعًا في الوسط</span></div>
<div class="rw"><span>الأسهم</span><span>تحريك المربع (${L('1%')}). مع <span class="k">Shift</span>: ${L('5%')}</span></div>
<div class="rw"><span><span class="k">Alt</span> + السهم الأيمن أو الأيسر</span><span>زيادة العرض أو إنقاصه</span></div>
<div class="rw"><span><span class="k">Alt</span> + السهم الأعلى أو الأسفل</span><span>زيادة الارتفاع أو إنقاصه</span></div>
<div class="rw"><span><span class="k">Delete</span></span><span>إعادة التحديد</span></div>
<div class="hint">الأسهم تتبع اتجاه الصورة كما تراها: السهم الأيسر يحرّك المربع نحو يسار الصورة. يقرأ قارئ الشاشة مكان المربع وحجمه عند كل تغيير.</div></div>`;

// the dock for one region frame
const regionDock = (o) => {
  const what = o.target === 'logo' ? 'الشعار' : 'المنتج';
  const hint = o.target === 'logo' ? Q.logoH : Q.prodH;
  const b = o.box === undefined ? null : o.box;
  const label = o.target === 'logo' ? null : 'المنتج';
  const so = { ...o, what, optional: o.target === 'logo' };
  const loadStage = stage({ ...so, box: b, label, state: o.state === 'err400' || o.state === 'errnet' || o.state === 'skipbusy' ? (o.state === 'skipbusy' ? 'empty' : 'placed') : o.state });
  return panel(`<div class="rg-h1"><span class="ico">${I('scan', 20)}</span><span>${hint}</span></div>${loadStage}${statusLine({ ...so })}${o.kb ? kbHelp() : ''}${acts({ m: o.m, optional: so.optional, state: o.state === 'err400' || o.state === 'errnet' ? 'placed' : o.state })}`);
};

// request summary (edit_summary), copied from S27
const sumRow = (l, v, edit) => `<div class="sr"><span class="l">${l}</span><span class="v">${v}</span>${edit ? `<button class="tx" aria-label="تعديل ${l}">${I('pencil', 14)} تعديل</button>` : '<span style="width:76px"></span>'}</div>`;
const mt = (svg) => `<span class="mt">${svg}</span>`;
const okV = (txt) => `<span style="display:inline-flex;gap:4px;align-items:center;color:var(--ok);font-weight:500">${ic('check', 16)} ${txt}</span>`;
const regionVal = (shape, b, target) => `${mini(shape, b, 64, { sm: true, alt: `التصميم مع مربع حول ${target}` })}${okV('محدَّد')}`;
const editP = (rows, o = {}) => panel(`<div class="scr"><div class="sumc">${rows}</div></div><div class="pa"><span></span><div class="r"><button class="btn ${o.m ? 'full1' : ''}">إلغاء</button><button class="btn p ${o.m ? 'full1' : ''}">${I('pencil', 18)} عدّله</button></div></div>`);
const photoSvg = (c1, c2) => `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"><rect width="100" height="100" fill="${c1}"/><circle cx="62" cy="40" r="22" fill="${c2}"/><rect y="70" width="100" height="30" fill="rgba(0,0,0,.18)"/></svg>`;
const sumRows = (logo) => [
  sumRow('العلامة', BR, 0),
  sumRow('التصميم', mt(promo('land')) + '<span class="hint" style="margin-inline-start:6px">من ملفك</span>', 1),
  sumRow('التغييرات', 'استبدال الشعار، استبدال المنتج', 1),
  sumRow('مكان الشعار', logo ? regionVal('land', BOX.land.logo, 'الشعار') : `<span style="color:var(--ink2)">تلقائي</span>`, 1),
  sumRow('مكان المنتج', regionVal('land', BOX.land.product, 'المنتج'), 1),
  sumRow('المنتج الجديد', mt(photoSvg('#C9A24B', '#fff')) + '<span class="hint" style="margin-inline-start:6px">صورة منتج</span>', 1),
].join('');

// upload dock (next step after the product box), copied from S27
const upload = (m) => panel(`${m ? `<div class="pbtns"><button class="btn p" style="flex:1">${ic('upload', 18)} اختيار ملف</button><button class="btn" style="flex:1">${ic('cam', 18)} التقاط صورة</button></div><div class="hint" style="margin-block-start:6px">${hintImg}</div>` : `<div class="dz" tabindex="0" role="button">${ic('upload', 24)}<b style="font-weight:600">اسحب الملف هنا أو اضغط للاختيار</b><small>${hintImg}</small></div>`}<div class="pa"><span class="cs"><span class="ltr" dir="ltr">0 / 1</span></span><div class="r"></div></div>`);

// ---- frames
const fr = (cls, t, note, inner) => `<div><div class="tag">${t}${note ? `<small>${note}</small>` : ''}</div><div class="fr ${cls}">${inner}</div></div>`;
const col = (msgs, dock, o = {}) => `<div class="col" style="min-height:${o.min || 900}px"><div class="msgs">${msgs}</div><div class="dock">${dock}</div></div>`;
const M = (...a) => a.join('');
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
const appM = (title, msgs, dock, o = {}) => `${topM(title)}<div class="col" style="min-height:${o.min || 760}px"><div class="msgs">${msgs}</div><div class="dock">${dock}</div></div>`;

const prodMsgs = M(ub(Q.chg), aq(Q.prodQ));
const logoMsgs = M(ub(Q.chg), aq(Q.logoQ));
const prodAfterLogo = M(ub(Q.chg), aq(Q.logoQ), ubReg('حدّدت مكان الشعار', mini('land', BOX.land.logo, 170, { alt: 'التصميم مع مربع حول الشعار' })), aq(Q.prodQ));
const pd = (o) => regionDock({ target: 'product', ...o });
const ld = (o) => regionDock({ target: 'logo', ...o });
const PB = BOX.land.product; const LB = BOX.land.logo;

// ================= DESKTOP
const D = [];
D.push(fr('d', 'أ. المحادثة كاملة: تحديد مكان المنتج', 'الصندوق السفلي يحلّ محل مربع الكتابة، كما في بقية خطوات المصمم. الصورة بشكلها الحقيقي (4:3 هنا)', appD(`${AG} · ${BR}`, col(prodAfterLogo, pd({ state: 'placed', box: PB }), { min: 1000 }))));
D.push(fr('d', 'ب. المحادثة كاملة: تحديد مكان الشعار (اختياري)', 'زر «تخطَّ» ظاهر بجانب «متابعة»', appD(`${AG} · ${BR}`, col(logoMsgs, ld({ state: 'empty' }), { min: 1000 }))));

const sec = (t) => `<div><h1 class="bt" style="font-size:18px">${t}</h1></div>`;
const cf = (arr, t, n, msgs, dock, o) => arr.push(fr('c', t, n, col(msgs, dock, o)));
const C1 = []; const C2 = []; const C3 = []; const C4 = []; const C5 = []; const C6 = [];

cf(C1, '1a. المنتج: قبل الرسم', '`edit_product_region`، `optional: false`. لا «تخطَّ». «متابعة» و«إعادة التحديد» معطّلتان. الصورة قابلة للتركيز', prodMsgs, pd({ state: 'empty' }));
cf(C1, '1b. أثناء الرسم', 'بدء السحب من الركن العلوي: المنطقة خارج المربع معتّمة. لا مقابض حتى تُفلت الزر', prodMsgs, pd({ state: 'drawing', box: BOX.land.drawn }));
cf(C1, '1c. المربع مُحدَّد', 'أربعة مقابض في الأركان للتحجيم، والمربع كله للتحريك، وشارة «المنتج» داخله. «متابعة» مفعّلة', prodMsgs, pd({ state: 'placed', box: PB }));
cf(C1, '1d. المربع صغير جدًا', 'أي ضلع أقل من 0.03 من الصورة: إطار متقطّع أحمر مع رسالة (أيقونة ونص) و«متابعة» معطّلة. السحب خارج المربع يبدأ مربعًا جديدًا', prodMsgs, pd({ state: 'small', box: BOX.land.tiny }));
cf(C1, '1e. جارٍ الإرسال', 'المربع مقفل (بلا مقابض) و«متابعة» تدور. لا تعديل أثناء الإرسال', prodMsgs, pd({ state: 'busy', box: PB }));
cf(C1, '1f. تصميم عمودي (3:4)', 'الشكل الحقيقي يُحفظ: عرض أضيق وارتفاع كامل. الارتفاع الأقصى للمنطقة يتبع الشاشة', prodMsgs, pd({ state: 'placed', box: BOX.port.product, shape: 'port' }), { min: 1000 });
cf(C1, '1g. «تعديل» من الملخص: التحديد السابق جاهز', 'العودة إلى الخطوة بالمربع السابق: «متابعة» مفعّلة فورًا، و«إعادة التحديد» تمسحه', M(ub(Q.chg), aq(Q.prodQ)), pd({ state: 'placed', box: PB, redo: true }));
cf(C1, '1h. تحميل التصميم', 'من `width` و`height` في `ui` يظهر مكان الصورة بشكلها الحقيقي (4:3 هنا) بدل قفزة في التخطيط. «متابعة» معطّلة', prodMsgs, pd({ state: 'load' }));

cf(C2, '2a. الشعار: قبل الرسم', '`edit_logo_region`، `optional: true`. «تخطَّ — سأجده بنفسي» متاح دائمًا ولا يحتاج مربعًا', logoMsgs, ld({ state: 'empty' }));
cf(C2, '2b. أثناء الرسم', 'الشعار أصغر: المربع صغير والمقابض لا تظهر قبل الإفلات', logoMsgs, ld({ state: 'drawing', box: BOX.land.logoDraw }));
cf(C2, '2c. المربع مُحدَّد', 'مربع حول الشعار في الأعلى (يسار الصورة). تبقى «تخطَّ» متاحة. لا شارة داخل المربع (ضيّق)', logoMsgs, ld({ state: 'placed', box: LB }));
cf(C2, '2d. جارٍ التخطّي', 'يرسل `{ skip: true }`. زر «تخطَّ» يدور و«متابعة» و«إعادة التحديد» معطّلتان', logoMsgs, ld({ state: 'skipbusy' }));
cf(C2, '2e. المربع صغير جدًا', 'الرسالة نفسها مع «الشعار»', logoMsgs, ld({ state: 'small', box: { x: 0.04, y: 0.05, w: 0.02, h: 0.025 } }));
cf(C2, '2f. تحميل التصميم', '«تخطَّ» تبقى متاحة أثناء التحميل', logoMsgs, ld({ state: 'load' }));

cf(C3, '3a. السجل بعد تحديد الشعار والمنتج', 'رد المستخدم: صورة مصغّرة للتصميم عليها المربع (المنطقة خارجه معتّمة) مع «حدّدت مكان …». الخطوة التالية: رفع المنتج الجديد', M(ub(Q.chg), aq(Q.logoQ), ubReg('حدّدت مكان الشعار', mini('land', LB, 170, { alt: 'التصميم مع مربع حول الشعار' })), aq(Q.prodQ), ubReg('حدّدت مكان المنتج', mini('land', PB, 170, { alt: 'التصميم مع مربع حول المنتج' })), aq(Q.newProd)), upload(), { min: 1020 });
cf(C3, '3b. السجل بعد تخطّي الشعار', 'التخطّي رد نصي قصير بلا صورة (من `content` الخادم)', M(ub(Q.chg), aq(Q.logoQ), ub('تخطّيت تحديد الشعار'), aq(Q.prodQ), ubReg('حدّدت مكان المنتج', mini('land', PB, 170, { alt: 'التصميم مع مربع حول المنتج' })), aq(Q.newProd)), upload(), { min: 1020 });

C4.push(fr('c', '4a. edit_summary: الشعار والمنتج محدَّدان', 'صفّان جديدان: «مكان الشعار» و«مكان المنتج» بصورة مصغّرة عليها المربع و«محدَّد». «تعديل» يعيد إلى الخطوة بالمربع السابق (1g)', col(M(ub('متابعة'), aq(Q.editSum)), editP(sumRows(true)), { min: 900 })));
C4.push(fr('c', '4b. edit_summary: الشعار تلقائي', 'عند تخطّي الشعار: «تلقائي» بلا صورة. «تعديل» يفتح الخطوة فارغة (مثل 2a)', col(M(ub('متابعة'), aq(Q.editSum)), editP(sumRows(false)), { min: 900 })));

cf(C5, '5a. تعذّر تحميل التصميم: المنتج', 'جلب الصورة بالرمز فشل: رسالة وزر «إعادة المحاولة» داخل مكان الصورة بشكلها الحقيقي. «متابعة» معطّلة', prodMsgs, pd({ state: 'fail' }));
cf(C5, '5b. تعذّر تحميل التصميم: الشعار', 'يبقى «تخطَّ» متاحًا: لا يحتاج الصورة', logoMsgs, ld({ state: 'fail' }));
cf(C5, '5c. `400 VALIDATION_FAILED` على `region`', 'الرسالة تحت الصورة والمربع باقٍ كما هو (لا يُمسح). «متابعة» تعيد المحاولة', prodMsgs, pd({ state: 'err400', box: PB }));
cf(C5, '5d. تعذّر الإرسال (شبكة)', 'المربع محفوظ والإدخال لا يضيع. إعادة المحاولة بالضغط على «متابعة»', prodMsgs, pd({ state: 'errnet', box: PB }));

cf(C6, '6a. لوحة المفاتيح: التركيز على الصورة', 'التركيز على الصورة بحلقة التركيز. `Enter` ينشئ مربعًا في الوسط (30%) يمكن تحريكه. اللوحة تُفتح بزر «اختصارات لوحة المفاتيح»', prodMsgs, pd({ state: 'kbd', kb: true }), { min: 1060 });
cf(C6, '6b. لوحة المفاتيح: التركيز على المربع', 'حلقة التركيز على المربع. الأسهم للتحريك و`Alt` مع الأسهم للتحجيم. منطقة الحالة `aria-live` تقرأ «المربع في وسط الصورة، عرضه 34% وارتفاعه 46%.»', prodMsgs, pd({ state: 'focus', box: PB, kb: true }), { min: 1060 });
C6.push(fr('c', '6c. مقاييس المقابض', 'تشريح للمراجعة: المقبض المرئي 16px داخل منطقة لمس: 32px على سطح المكتب و44px على الجوال (المنطقة المتقطّعة)', `<div class="spec">
<div class="it"><div class="box"><span class="rg-h tl" style="--hit:32px"><i></i></span><span class="rg-h br" style="--hit:32px;transform:translate(-50%,-50%)"><i></i></span></div><span>سطح المكتب<br>${L('32px')} (المرئي ${L('16px')})</span></div>
<div class="it"><div class="box"><span class="rg-h tl hit" style="--hit:44px"><i></i></span><span class="rg-h br hit" style="--hit:44px"><i></i></span></div><span>الجوال: ${L('44px')} على الأقل<br>منطقة اللمس المتقطّعة</span></div>
<div class="it"><div class="box" style="width:60px;height:40px"><span class="rg-h tl hit" style="--hit:44px"><i></i></span><span class="rg-h br hit" style="--hit:44px"><i></i></span></div><span>مربع أصغر من منطقتي لمس: الأقرب إلى الإصبع يُحرَّك</span></div></div>`));

const desktop = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>S30 تحديد مكان على التصميم</title>${font}<style>${css}</style></head><body><div class="board">
<div><h1 class="bt">S30 · تحديد مكان على التصميم المرفوع (سطح المكتب)</h1><p class="note">لوحة تصميم: العناوين والملاحظات الصغيرة شرح للمراجعة وليست جزءًا من الواجهة. بيانات تجريبية (علامة «${BR}») والتصميم المرفوع بطاقة ترويجية تجريبية. يمتد على لوحتي S25 وS27 المعتمدتين: القائمة الجانبية على اليمين، رسالة المصمم بشارتها، والصندوق السفلي يحلّ محل مربع الكتابة. الصورة لا تُعكس: الإحداثيات من أعلى يسار الصورة (x من اليسار وy من الأعلى) بقيم بين 0 و1. لا أسعار ولا أسماء نماذج. الصور خاصة (تُجلب بالرمز).</p></div>
${D.join('\n')}
${sec('1. تحديد مكان المنتج (مطلوب)')}<div class="row">${C1.join('\n')}</div>
${sec('2. تحديد مكان الشعار (اختياري)')}<div class="row">${C2.join('\n')}</div>
${sec('3. السجل')}<div class="row">${C3.join('\n')}</div>
${sec('4. ملخص التعديل')}<div class="row">${C4.join('\n')}</div>
${sec('5. الأخطاء')}<div class="row">${C5.join('\n')}</div>
${sec('6. إمكانية الوصول: بديل السحب')}<div class="row">${C6.join('\n')}</div>
</div></body></html>`;
const fx = (h) => h.replace(/(?<![\w>])(\d+ \/ \d+)(?![\w<])/g, '<bdi dir="ltr">$1</bdi>');
fs.writeFileSync(path.join(dir, 'desktop.html'), fx(desktop));

// ================= MOBILE
const Mx = [];
const mf = (t, n, msgs, dock, o = {}) => Mx.push(fr('m', t, n, appM(`${AG} · ${BR}`, msgs, dock, o)));
const mp = (o) => pd({ m: true, ...o }); const ml = (o) => ld({ m: true, ...o });
mf('م1. المنتج: قبل الرسم', 'الصورة بعرض اللوحة كاملًا. منطقة الصورة تلتقط الإيماءة (`touch-action: none`) فلا تتحرك الصفحة أثناء السحب. الأزرار تحت الصورة', prodMsgs, mp({ state: 'empty' }));
mf('م2. أثناء الرسم بإصبع واحد', 'دائرة اللمس تحت الإصبع عند الركن', prodMsgs, mp({ state: 'drawing', box: BOX.land.drawn }));
mf('م3. المربع مُحدَّد', 'المقابض مناطق لمس 44px. «إعادة التحديد» و«متابعة» بعرض متساوٍ', prodMsgs, mp({ state: 'placed', box: PB }));
mf('م4. المربع صغير جدًا', 'الرسالة تحت الصورة مباشرة', prodMsgs, mp({ state: 'small', box: BOX.land.tiny }));
mf('م5. جارٍ الإرسال', '', prodMsgs, mp({ state: 'busy', box: PB }));
mf('م6. الشعار: قبل الرسم', '«تخطَّ — سأجده بنفسي» زر بعرض كامل تحت الصف', logoMsgs, ml({ state: 'empty' }));
mf('م7. الشعار: مربع مُحدَّد', 'يبقى «تخطَّ» متاحًا', logoMsgs, ml({ state: 'placed', box: LB }));
mf('م8. الشعار: جارٍ التخطّي', '', logoMsgs, ml({ state: 'skipbusy' }));
mf('م9. تصميم عمودي', 'العرض يتقلّص ليبقى الارتفاع داخل الشاشة، والصورة في الوسط', prodMsgs, mp({ state: 'placed', box: BOX.port.product, shape: 'port' }), { min: 1000 });
mf('م10. تحميل التصميم', 'مكان بشكل الصورة (4:3) من `width` و`height`', prodMsgs, mp({ state: 'load' }));
mf('م11. تعذّر تحميل التصميم', '', prodMsgs, mp({ state: 'fail' }));
mf('م12. `VALIDATION_FAILED`', 'المربع باقٍ والرسالة تحت الصورة', prodMsgs, mp({ state: 'err400', box: PB }));
mf('م13. تعديل من الملخص: التحديد السابق', '«متابعة» مفعّلة', prodMsgs, mp({ state: 'placed', box: PB, redo: true }));
mf('م14. السجل', 'صورة مصغّرة بالمربع في رد المستخدم', M(ub(Q.chg), aq(Q.logoQ), ub('تخطّيت تحديد الشعار'), aq(Q.prodQ), ubReg('حدّدت مكان المنتج', mini('land', PB, 170, { alt: 'التصميم مع مربع حول المنتج' })), aq(Q.newProd)), upload(true), { min: 900 });
mf('م15. edit_summary', 'الشعار «تلقائي» بعد التخطّي، والمنتج «محدَّد» بمصغّرة', M(ub('متابعة'), aq(Q.editSum)), editP(sumRows(false), { m: true }), { min: 760 });
mf('م15b. edit_summary: الشعار محدَّد', '', M(ub('متابعة'), aq(Q.editSum)), editP(sumRows(true), { m: true }), { min: 760 });

const mobile = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>S30 تحديد مكان على التصميم (جوال)</title>${font}<style>${css}</style></head><body><div class="board">
<div><h1 class="bt">S30 · تحديد مكان على التصميم (جوال 375px)</h1><p class="note">القائمة الجانبية درج يفتحه زر القائمة. الصورة بعرض اللوحة، الرسم بإصبع واحد، المقابض 44px، الصفحة لا تتحرك أثناء الإيماءة داخل الصورة، والأزرار تحتها.</p></div>
<div class="row">${Mx.join('\n')}</div>
</div></body></html>`;
fs.writeFileSync(path.join(dir, 'mobile.html'), fx(mobile));
console.log('ok');
