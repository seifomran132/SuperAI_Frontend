// Hand-built S24 "My brands" boards. Run: node build.mjs  -> desktop.html, mobile.html (PNGs rendered with headless Chrome)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));

const css = `
:root{--brand:#1E293B;--bg:#F8FAFC;--surface:#fff;--muted-s:#F1F5F9;--ink:#0F172A;--ink2:#475569;--bs:#E2E8F0;--bc:#7C8799;--ok:#15803D;--ok-c:#F0FDF4;--ok-b:#BBF7D0;--warn:#B45309;--warn-c:#FFFBEB;--warn-b:#FDE68A;--dan:#BE123C;--dan-c:#FFF1F2;--dan-b:#FECDD3;--pro:#4F46E5;--pro-c:#EEF2FF;--pro-b:#C7D2FE}
*{box-sizing:border-box;margin:0;letter-spacing:normal;font-style:normal}
body{font-family:'IBM Plex Sans Arabic',sans-serif;background:#CBD5E1;color:var(--ink);font-size:14px;line-height:22px;-webkit-font-smoothing:antialiased}
.board{padding:32px;display:flex;flex-direction:column;gap:40px}
.board h1.bt{font-size:22px;font-weight:700;line-height:32px}.board .note{color:var(--ink2);font-size:13px}
.tag{font-size:14px;font-weight:600;margin-block-end:10px}.tag small{font-weight:400;color:var(--ink2);margin-inline-start:8px}
.row{display:flex;gap:28px;align-items:flex-start;flex-wrap:wrap}
.fr{background:var(--bg);border:1px solid #94A3B8;border-radius:12px;overflow:hidden;position:relative}
.fr.d{width:1360px}.fr.h{width:660px}.fr.m{width:375px}
.ov{position:absolute;inset:0;background:rgba(15,23,42,.45);display:grid;place-items:center;padding:24px}
.ov.sheet{place-items:end stretch;padding:0}
.dlg{background:#fff;border-radius:24px;padding:24px;width:460px;max-width:100%;display:flex;flex-direction:column;gap:14px}
.sheet .dlg{width:auto;border-end-start-radius:0;border-end-end-radius:0}
.dlg h3{font-size:20px;font-weight:600;line-height:32px}
.dlg .acts{display:flex;gap:12px;justify-content:flex-start;margin-block-start:6px}
.sheet .acts{flex-direction:column}.sheet .acts .btn{width:100%}
.app{display:flex;min-height:620px}
aside{width:260px;background:var(--surface);border-inline-end:1px solid var(--bs);display:flex;flex-direction:column;flex-shrink:0}
.h aside{width:200px}
.brand{display:flex;align-items:center;gap:12px;padding:16px;height:64px;border-block-end:1px solid var(--bs)}
.mono{width:36px;height:36px;border-radius:8px;background:var(--brand);color:#fff;display:grid;place-items:center;font-weight:700;font-size:16px;flex-shrink:0}
.brand b{font-size:18px;font-weight:700}
.newchat{margin:16px 16px 8px}
.rec{padding:8px 16px;flex:1;color:var(--ink2);font-size:13px}.rec div.i{display:flex;justify-content:space-between;padding:8px 0;color:var(--ink);font-size:14px}
nav{padding:8px 12px;border-block-start:1px solid var(--bs);display:flex;flex-direction:column;gap:4px}
.nav{display:flex;align-items:center;gap:12px;min-height:44px;padding-inline:12px;border-radius:8px;color:var(--ink2);font-size:14px}
.nav.on{background:var(--muted-s);color:var(--ink);font-weight:600;box-shadow:inset -3px 0 0 var(--brand)}
main{flex:1;min-width:0}
.top{height:64px;background:var(--surface);border-block-end:1px solid var(--bs);display:flex;align-items:center;justify-content:space-between;padding-inline:32px}
.h .top{padding-inline:16px}
.top h1{font-size:20px;font-weight:600}
.chip{border:1px solid var(--bs);background:var(--muted-s);border-radius:9999px;padding:4px 14px;font-size:13px;color:var(--ink2)}
.content{padding:28px 32px;max-width:1000px;margin-inline:auto}
.h .content{padding:20px 16px}
.m .content{padding:16px}
.mtop{height:56px;background:#fff;border-block-end:1px solid var(--bs);display:flex;align-items:center;gap:8px;padding-inline:8px 16px}
.mtop h1{font-size:18px;font-weight:600;flex:1}
.ib{width:44px;height:44px;display:grid;place-items:center;border-radius:8px;color:var(--ink);background:transparent;border:0}
.btn{height:44px;padding-inline:18px;border-radius:8px;font:600 14px 'IBM Plex Sans Arabic',sans-serif;display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid var(--bc);background:#fff;color:var(--ink);white-space:nowrap}
.btn.p{background:var(--brand);border-color:var(--brand);color:#fff}
.btn.dg{color:var(--dan);border-color:var(--dan-b)}.btn.dp{background:var(--dan);border-color:var(--dan);color:#fff}
.btn.off{background:var(--muted-s);border-color:var(--bs);color:#64748B}
.btn.ic{padding:0;width:44px}
.btn.full{width:100%}
.hd{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-block-end:20px;flex-wrap:wrap}
.hd h2{font-size:24px;font-weight:600;line-height:36px}.hd p{color:var(--ink2);font-size:15px}
.m .hd h2{font-size:22px}
.badge{display:inline-flex;align-items:center;gap:4px;border-radius:9999px;padding:1px 10px;font-size:13px;font-weight:500;border:1px solid;white-space:nowrap}
.b-warn{color:var(--warn);background:var(--warn-c);border-color:var(--warn-b)}.b-pro{color:var(--pro);background:var(--pro-c);border-color:var(--pro-b)}
.card{background:#fff;border:1px solid var(--bs);border-radius:16px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.m .grid,.h .grid{grid-template-columns:1fr}
.kc{padding:16px;display:flex;flex-direction:column;gap:12px;color:inherit;text-decoration:none}
.kc .hh{display:flex;gap:12px;align-items:center}
.th{width:56px;height:56px;border-radius:12px;border:1px solid var(--bs);display:grid;place-items:center;overflow:hidden;flex-shrink:0;font-weight:700;font-size:24px;color:#fff}
.kc b{font-size:16px;font-weight:600;line-height:24px;display:block}
.dots{display:flex;gap:6px;align-items:center}.dot{width:20px;height:20px;border-radius:50%;border:1px solid rgba(15,23,42,.18)}
.meta{display:flex;justify-content:space-between;align-items:center;color:var(--ink2);font-size:13px}
.sk{background:var(--muted-s);border-radius:8px}
.notice{display:flex;gap:10px;align-items:flex-start;border:1px solid;border-radius:12px;padding:12px 14px;font-size:14px}
.n-warn{background:var(--warn-c);border-color:var(--warn-b);color:#78350F}.n-dan{background:var(--dan-c);border-color:var(--dan-b);color:var(--dan)}
.n-ok{background:var(--ok-c);border-color:var(--ok-b);color:var(--ok)}.n-pro{background:var(--pro-c);border-color:var(--pro-b);color:#3730A3}
a.lnk{color:var(--pro);text-decoration:underline;text-underline-offset:3px;font-weight:500}
.empty{display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;padding:48px 24px}
.empty .eic{width:64px;height:64px;border-radius:16px;background:var(--muted-s);display:grid;place-items:center;color:var(--ink2)}
.empty h3{font-size:20px;font-weight:600}.empty p{color:var(--ink2);max-width:420px}
.sec{padding:20px;margin-block-end:16px}.m .sec{padding:16px}
.sec>.sp>h3,.sec>h3{font-size:18px;font-weight:600;line-height:30px}.sec .help{color:var(--ink2);font-size:14px;margin-block-end:14px}
.fld{display:flex;flex-direction:column;gap:6px;margin-block-end:16px}
.fld label{font-weight:500;font-size:14px}
.in{min-height:44px;border:1px solid var(--bc);border-radius:8px;background:#fff;padding:10px 12px;display:flex;align-items:center;gap:8px;font-size:15px;width:100%}
.in.ta{align-items:flex-start;min-height:88px}
.in.err{border-color:var(--dan);border-width:2px}
.ph{color:var(--ink2)}
.cnt{display:flex;justify-content:space-between;gap:12px;font-size:13px;color:var(--ink2)}
.cnt .e{color:var(--dan);display:flex;gap:4px;align-items:center}
.ltr{direction:ltr;unicode-bidi:isolate;display:inline-block}
.inl{display:flex;gap:12px}.m .inl,.h .inl{flex-direction:column}
.cl{display:flex;flex-direction:column;gap:8px}
.cr{display:flex;align-items:center;gap:12px;border:1px solid var(--bs);border-radius:12px;padding:8px 12px}
.m .cr{flex-wrap:wrap}
.sw{width:40px;height:40px;border-radius:8px;border:1px solid rgba(15,23,42,.2);flex-shrink:0}
.cr .n{width:24px;color:var(--ink2);font-size:13px;text-align:center}
.ca{display:flex;gap:8px;margin-inline-start:auto}.m .ca{flex-basis:100%;margin:0}
.cr .hx{font-weight:600;font-size:15px;min-width:90px}
.sug{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.sc{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--bc);border-radius:9999px;padding:4px 14px 4px 4px;min-height:44px;background:#fff;font-size:14px}
.sc .sw{width:32px;height:32px;border-radius:50%}
.sc b{font-weight:600}
.sc .btn{height:36px;padding-inline:14px;border-radius:9999px}
.add{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-block-start:14px}
.picker{width:44px;height:44px;border-radius:8px;border:1px solid var(--bc);padding:5px;background:#fff;flex-shrink:0}.picker i{display:block;width:100%;height:100%;border-radius:4px}
.grp{border-block-start:1px solid var(--bs);padding-block:18px 4px;margin-block-start:18px}
.grp.first{border:0;margin:0;padding-block-start:0}
.grp h4{font-size:16px;font-weight:600;display:flex;justify-content:space-between;align-items:center;margin-block-end:2px}
.grp h4 span{font-weight:400;font-size:13px;color:var(--ink2)}
.grp .sub{color:var(--ink2);font-size:13px;margin-block-end:10px}
.dz{border:2px dashed var(--bc);border-radius:12px;min-height:96px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;text-align:center;padding:16px;background:#fff;color:var(--ink)}
.dz small{color:var(--ink2);font-size:13px}
.dz.hov{background:var(--pro-c);border-color:var(--pro)}
.dz.dis{background:var(--muted-s);border-style:solid;border-color:var(--bs);color:var(--ink2)}
.pbtns{display:flex;gap:10px}
.err-u{display:flex;gap:6px;align-items:flex-start;color:var(--dan);font-size:13px;margin-block-start:8px}
.files{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-block-start:12px}.m .files{grid-template-columns:repeat(2,1fr)}.h .files{grid-template-columns:repeat(3,1fr)}
.fi{position:relative;aspect-ratio:1;border:1px solid var(--bs);border-radius:12px;overflow:hidden;background:var(--muted-s);display:grid;place-items:center}
.fi svg.pv{width:100%;height:100%}
.fi .x{position:absolute;inset-block-start:4px;inset-inline-start:4px;width:44px;height:44px;border-radius:8px;background:rgba(255,255,255,.94);border:1px solid var(--bs);display:grid;place-items:center;color:var(--dan)}
.fi.pdf{background:#fff;color:var(--ink2);font-size:13px;text-align:center;padding:8px;align-content:center;justify-items:center;gap:4px}
.fi .prog{position:absolute;inset-inline:0;inset-block-end:0;background:rgba(255,255,255,.95);padding:8px;font-size:12px;border-block-start:1px solid var(--bs)}
.bar{height:6px;border-radius:9999px;background:var(--bs);margin-block-start:4px;overflow:hidden}.bar i{display:block;height:100%;background:var(--brand)}
.rl{display:flex;flex-direction:column;gap:8px}
.rr{display:flex;gap:8px;align-items:center}
.sbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-block-start:16px;padding:12px 14px;border-radius:12px;background:var(--warn-c);border:1px solid var(--warn-b);color:#78350F;font-weight:500}
.sbar .a{display:flex;gap:8px}.m .sbar .a{width:100%}.m .sbar .btn{flex:1}
.flip{display:flex;transform:scaleX(-1)}
.back{display:inline-flex;align-items:center;gap:6px;color:var(--ink2);font-size:14px;min-height:44px}
.sp{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}
.hint{color:var(--ink2);font-size:13px}
`;

const P = {
  plus: '<path d="M5 12h14M12 5v14"/>', upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>', trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  chev: '<path d="m9 18 6-6-6-6"/>', up: '<path d="m18 15-6-6-6 6"/>', down: '<path d="m6 9 6 6 6-6"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5"/>',
  cam: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>', check: '<path d="M20 6 9 17l-5-5"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>',
  layers: '<path d="m12 2-10 5 10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>', arr: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  wallet: '<path d="M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l12-3v3M17 14h.01"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  img: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>', spin: '<path d="M21 12a9 9 0 1 1-6.2-8.6"/>',
};
const ic = (n, s = 20) => `<span style="display:inline-flex;flex-shrink:0"><svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg></span>`;

const sideNav = `<aside>
<div class="brand"><div class="mono">ل</div><b>لمحة AI</b></div>
<button class="btn p newchat">${ic('plus', 18)} محادثة جديدة</button>
<div class="rec">المحادثات الأخيرة<div class="i"><span>تصميم منشور للمعرض</span><span class="hint">الآن</span></div><div class="i"><span>ملخص عقد الإيجار</span><span class="hint">أمس</span></div></div>
<nav aria-label="التنقل"><div class="nav">${ic('wallet', 18)} الرصيد</div><div class="nav on" aria-current="page">${ic('layers', 18)} علاماتي التجارية</div><div class="nav">${ic('user', 18)} الحساب</div></nav>
</aside>`;
const dApp = (title, body) => `<div class="app">${sideNav}<main><div class="top"><h1>${title}</h1><span class="chip">الرصيد <bdi dir="ltr">14.50$</bdi></span></div><div class="content">${body}</div></main></div>`;
const mApp = (title, body) => `<div class="mtop"><button class="ib" aria-label="فتح القائمة">${ic('menu', 24)}</button><h1>${title}</h1></div><div class="content">${body}</div>`;

const fr = (cls, t, note, inner, ov = '') => `<div><div class="tag">${t}${note ? `<small>${note}</small>` : ''}</div><div class="fr ${cls}">${inner}${ov}</div></div>`;
const ovD = (c) => `<div class="ov"><div class="dlg" role="dialog" aria-modal="true">${c}</div></div>`;
const ovM = (c) => `<div class="ov sheet"><div class="dlg" role="dialog" aria-modal="true">${c}</div></div>`;

// ---- sample data (fictional)
const kits = [
  { n: 'مقهى الندى', c: ['#7A3E1D', '#F2E3CF', '#2F5D50', '#C9A24B'], f: 9, logo: 'a' },
  { n: 'استوديو أفق للتصوير', c: ['#0B3C5D', '#D9B310', '#328CC1'], f: 4, logo: 'b' },
  { n: 'متجر زهرة', c: ['#D6336C'], f: 0, draft: true, letter: 'ز' },
  { n: 'عيادة سنا', c: ['#0F766E', '#E6FFFA', '#134E4A', '#99F6E4', '#FFFFFF'], f: 17, letter: 'س' },
];
const fileWord = (n) => (n === 0 ? 'لا ملفات' : n === 1 ? 'ملف واحد' : n <= 10 ? `${n} ملفات` : `${n} ملفًا`);
const logoSvg = (k) => k === 'a'
  ? `<svg class="pv" viewBox="0 0 56 56"><rect width="56" height="56" fill="#F2E3CF"/><circle cx="28" cy="28" r="16" fill="#7A3E1D"/><circle cx="28" cy="28" r="8" fill="#F2E3CF"/></svg>`
  : `<svg class="pv" viewBox="0 0 56 56"><rect width="56" height="56" fill="#fff"/><path d="M10 42 28 12l18 30z" fill="#0B3C5D"/><circle cx="28" cy="34" r="6" fill="#D9B310"/></svg>`;
const card = (k) => {
  const th = k.logo ? `<div class="th" style="background:#fff">${logoSvg(k.logo)}</div>` : `<div class="th" style="background:${k.c[0]}" aria-hidden="true">${k.letter}</div>`;
  const dots = k.c.slice(0, 4).map((c) => `<span class="dot" style="background:${c}"></span>`).join('') + (k.c.length > 4 ? `<span class="hint">+${k.c.length - 4}</span>` : '');
  return `<a class="card kc" href="#"><div class="hh">${th}<div style="flex:1;min-width:0"><b>${k.n}</b>${k.draft ? '<span class="badge b-warn" style="margin-block-start:4px">مسودة</span>' : ''}</div><span class="flip" style="color:var(--ink2)">${ic('chev', 20)}</span></div><div class="meta"><div class="dots" aria-label="ألوان الهوية">${dots}</div><span>${fileWord(k.f)}</span></div></a>`;
};
const skCard = `<div class="card kc"><div class="hh"><div class="sk th" style="border:0"></div><div style="flex:1"><div class="sk" style="height:18px;width:70%"></div></div></div><div class="meta"><div class="sk" style="height:20px;width:100px"></div><div class="sk" style="height:14px;width:50px"></div></div></div>`;
const intro = 'احفظ ألوان علامتك وشعاراتها وأسلوبها هنا، ليستخدمها «مصمم جرافيك» في المحادثة.';
const newBtn = (off, full) => `<button class="btn ${off ? 'off' : 'p'} ${full ? 'full' : ''}" ${off ? 'disabled aria-disabled="true"' : ''}>${ic('plus', 18)} هوية جديدة</button>`;
const limitMsg = `<div class="notice n-warn" role="status">${ic('alert', 20)}<div>وصلت إلى حد باقتك: <bdi dir="ltr">[5]</bdi> هويات. <a class="lnk" href="#">عرض الباقات</a></div></div>`;
const narrow = (c) => c === 'm' || c === 'h';
const listHead = (off, c) => `<div class="hd"><div><h2>علاماتي التجارية</h2><p>${intro}</p></div>${c === 'd' ? newBtn(off) : ''}</div>${c === 'd' ? '' : `<div style="margin-block-end:16px">${newBtn(off, c === 'm')}</div>`}`;
const listBody = (off, c) => `${listHead(off, c)}${off ? `<div style="margin-block-end:16px">${limitMsg}</div>` : ''}<div class="grid">${kits.map(card).join('')}</div><div style="display:flex;justify-content:center;margin-block-start:20px"><button class="btn ${c === 'm' ? 'full' : ''}">تحميل المزيد</button></div>`;
const emptyB = (c) => `${listHead(false, c)}<div class="card empty"><div class="eic">${ic('layers', 30)}</div><h3>لا توجد هويات بعد</h3><p>أنشئ هوية لعلامتك هنا، أو اطلب من «مصمم جرافيك» في المحادثة أن يبدأ معك.</p><div style="display:flex;gap:10px;justify-content:center;${c === 'm' ? 'width:100%;flex-direction:column' : 'flex-wrap:wrap'}"><button class="btn p">${ic('sparkle', 18)} التحدث مع مصمم جرافيك</button><button class="btn">${ic('plus', 18)} هوية جديدة</button></div></div>`;
const loadB = (c) => `${listHead(false, c)}<div class="grid" aria-busy="true">${skCard}${skCard}${skCard}${narrow(c) ? '' : skCard + skCard + skCard}</div>`;
const errB = (c) => `${listHead(false, c)}<div class="notice n-dan" role="alert" style="align-items:center;flex-wrap:wrap">${ic('alert', 20)}<div style="flex:1;min-width:200px">تعذّر تحميل هوياتك. تحقق من الاتصال وحاول مرة أخرى.</div><button class="btn dg">${ic('refresh', 18)} إعادة المحاولة</button></div>`;

const newForm = (err) => `<h3>هوية جديدة</h3><p class="hint" style="font-size:14px">اختر اسمًا لعلامتك. تضيف الألوان والملفات بعد ذلك.</p><div class="fld" style="margin:0"><label>اسم العلامة التجارية</label><div class="in ${err ? 'err' : ''}">${err ? '<span class="ph">مثال: مقهى الندى</span>' : '<span>مقهى الندى</span>'}</div><div class="cnt">${err ? `<span class="e" role="alert">${ic('alert', 14)} الاسم مطلوب، من 1 إلى 80 حرفًا.</span>` : '<span></span>'}<span>${err ? 0 : 11} / 80</span></div></div><div class="acts"><button class="btn p">إنشاء الهوية</button><button class="btn">إلغاء</button></div>`;

// ---- kit page
const hex = (h) => `<span class="ltr" dir="ltr">${h}</span>`;
const swRow = (i, h, first, last) => `<div class="cr"><span class="n">${i}</span><span class="sw" style="background:${h}" aria-hidden="true"></span><span class="hx">${hex(h)}</span>${i === 1 ? '<span class="badge b-pro">الأهم</span>' : ''}<span class="ca"><button class="btn ic" aria-label="تقديم ${h}" ${first ? 'disabled style="opacity:.45"' : ''}>${ic('up', 18)}</button><button class="btn ic" aria-label="تأخير ${h}" ${last ? 'disabled style="opacity:.45"' : ''}>${ic('down', 18)}</button><button class="btn ic dg" aria-label="حذف ${h}">${ic('x', 18)}</button></span></div>`;
const cols = ['#7A3E1D', '#F2E3CF', '#2F5D50', '#C9A24B'];
const palette = (o = {}) => { const a = cols.slice(0, o.n || 4); return `<div class="sec card"><div class="sp"><h3>الألوان</h3><span class="hint">${a.length} / 12</span></div><div class="help">رتّب الألوان من الأهم إلى الأقل أهمية. اللون الأول هو الأساسي في تصاميمك.</div>
<div class="cl">${a.map((h, i) => swRow(i + 1, h, i === 0, i === a.length - 1)).join('')}</div>
${o.sug ? `<div class="notice n-pro" style="margin-block-start:14px;flex-direction:column"><b style="font-weight:600">ألوان من شعارك</b><div class="sug">${['#E8B04B', '#3B2A20', '#C7512D'].map((h) => `<span class="sc"><span class="sw" style="background:${h}"></span><b>${hex(h)}</b><button class="btn">إضافة</button></span>`).join('')}</div><span class="hint" style="color:#3730A3">لا تُضاف الألوان إلا إذا ضغطت «إضافة».</span></div>` : ''}
<div class="add"><div class="picker" aria-label="اختيار لون"><i style="background:#2F80ED"></i></div><div class="in" style="width:150px;direction:ltr"><span class="ph" dir="ltr">#RRGGBB</span></div><button class="btn">${ic('plus', 18)} إضافة لون</button></div>
${o.dup ? `<div class="err-u" role="alert">${ic('alert', 14)} هذا اللون مضاف مسبقًا.</div>` : ''}</div>`; };

const zone = (o) => {
  const dz = o.disabled ? `<div class="dz dis">${ic('alert', 22)}<span>وصلت إلى الحد الأقصى: 40 ملفًا.</span><small>احذف ملفًا لتتمكن من الإضافة.</small></div>`
    : o.m ? `<div class="pbtns"><button class="btn p" style="flex:1">${ic('upload', 18)} اختيار ملفات</button>${o.noCam ? '' : `<button class="btn" style="flex:1">${ic('cam', 18)} التقاط صورة</button>`}</div><div class="hint" style="margin-block-start:6px">${o.hint}</div>`
      : `<div class="dz ${o.hov ? 'hov' : ''}" tabindex="0" role="button">${ic('upload', 24)}<b style="font-weight:600">${o.hov ? 'أفلت الملفات هنا' : 'اسحب الملفات هنا أو اضغط للاختيار'}</b><small>${o.hint}</small></div>`;
  const err = o.err ? `<div class="err-u" role="alert">${ic('alert', 14)}<span>${o.err}</span></div>` : '';
  const tiles = (o.tiles || []).join('');
  return `<div class="grp ${o.first ? 'first' : ''}"><h4>${o.t}<span>${fileWord(o.cnt)}</span></h4><div class="sub">${o.sub}</div>${dz}${err}${tiles ? `<div class="files">${tiles}</div>` : ''}</div>`;
};
const xbtn = `<button class="x" aria-label="حذف الملف">${ic('trash', 18)}</button>`;
const logoT = (k) => `<div class="fi" style="background:#fff">${logoSvg(k)}${xbtn}</div>`;
const photoT = (c1, c2) => `<div class="fi"><svg class="pv" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"><rect width="100" height="100" fill="${c1}"/><circle cx="62" cy="40" r="22" fill="${c2}"/><rect y="70" width="100" height="30" fill="rgba(0,0,0,.18)"/></svg>${xbtn}</div>`;
const pdfT = (n) => `<div class="fi pdf">${ic('file', 32)}<span class="ltr" dir="ltr" style="color:var(--ink);font-weight:500;word-break:break-all">${n}</span><span class="ltr" dir="ltr">PDF · 2.4 MB</span>${xbtn}</div>`;
const upT = (p) => `<div class="fi">${ic('img', 28)}<div class="prog"><span>جارٍ الرفع… <bdi dir="ltr">${p}%</bdi></span><div class="bar"><i style="width:${p}%"></i></div></div></div>`;
const failT = `<div class="fi" style="background:var(--dan-c);border-color:var(--dan-b);align-content:center;justify-items:center;gap:4px;text-align:center;padding:8px;color:var(--dan);font-size:13px">${ic('alert', 22)}<span>تعذّر الرفع</span><button class="btn" style="font-size:13px;padding-inline:10px;background:#fff">${ic('refresh', 14)} إعادة</button></div>`;
const files = (o = {}) => {
  const m = o.m;
  const z = [
    { t: 'شعارات', sub: 'شعارك بأشكاله المختلفة. نقترح عليك ألوانًا منها.', hint: 'PNG أو JPG أو WebP، حتى 10 ميغابايت لكل ملف', cnt: 2, tiles: [logoT('a'), logoT('b'), ...(o.up ? [upT(62)] : []), ...(o.fail ? [failT] : [])], err: o.e1, first: true },
    { t: 'تصاميم سابقة', sub: 'أعمال سابقة يسترشد بها المصمم في الأسلوب.', hint: 'PNG أو JPG أو WebP، حتى 10 ميغابايت لكل ملف', cnt: 2, tiles: [photoT('#F2E3CF', '#7A3E1D'), photoT('#2F5D50', '#C9A24B')], err: o.e2 },
    { t: 'صور المنتجات', sub: 'صور منتجاتك أو خدماتك.', hint: 'PNG أو JPG أو WebP، حتى 10 ميغابايت لكل ملف', cnt: 3, tiles: [photoT('#C9A24B', '#fff'), photoT('#E2E8F0', '#7A3E1D'), photoT('#F2E3CF', '#2F5D50')], err: o.e3 },
    { t: 'أدلة الهوية', sub: 'دليل استخدام الشعار والألوان إن وجد.', hint: 'PDF حتى 20 ميغابايت، أو صورة حتى 10 ميغابايت', cnt: 1, tiles: [pdfT('brand-guide.pdf')], noCam: true, err: o.e4 },
  ];
  return `<div class="sec card"><div class="sp"><h3>الملفات</h3><span class="hint">${o.total || 8} / 40 ملفًا</span></div><div class="help" style="margin-block-end:4px">كل ملف يُرفع ضمن مجموعته. يمكنك حذف أي ملف في أي وقت.</div>${z.map((g) => zone({ ...g, m, hov: o.hov && g.t === 'شعارات', disabled: o.full && g.t === 'تصاميم سابقة' })).join('')}</div>`;
};

const field = (l, ph, v, max, o = {}) => `<div class="fld"><label>${l}</label><div class="in ${o.ta ? 'ta' : ''}">${v ? `<span>${v}</span>` : `<span class="ph">${ph}</span>`}</div><div class="cnt">${o.help ? `<span>${o.help}</span>` : '<span></span>'}<span>${v ? v.length : 0} / ${max}</span></div></div>`;
const rules = (t, items, errAt = -1) => `<div class="fld"><label>${t}</label><div class="rl">${items.map((r, i) => `<div class="rr"><div class="in ${errAt === i ? 'err' : ''}" style="flex:1"><span>${r}</span></div><button class="btn ic dg" aria-label="حذف القاعدة">${ic('x', 18)}</button></div>${errAt === i ? `<div class="cnt"><span class="e" role="alert">${ic('alert', 14)} القاعدة أطول من 200 حرف.</span><span>214 / 200</span></div>` : ''}`).join('')}</div><div class="sp" style="margin-block-start:8px"><button class="btn">${ic('plus', 18)} إضافة قاعدة</button><span class="hint">${items.length} / 10</span></div></div>`;
const profile = (o = {}) => `<div class="sec card"><h3>الأسلوب والتعليمات</h3><div class="help">يستخدمها «مصمم جرافيك» ليصمّم بصوت علامتك. كلها اختيارية.</div>
${field('الأسلوب البصري', 'مثال: بسيط ودافئ، مساحات بيضاء واسعة', 'دافئ وبسيط، مستوحى من القهوة المحمصة والخشب الطبيعي', 500)}
${field('النبرة', 'مثال: ودّية ومباشرة', 'ودّية ومباشرة، بلا مبالغة', 300)}
${field('شكل الخطوط', 'صف كيف تبدو خطوطك، مثال: خط عربي ناعم بحروف مستديرة', 'خط عربي ناعم بحروف مستديرة للعناوين، وخط واضح للنصوص', 300, { help: 'صف كيف تبدو خطوطك. لا نحتاج اسم الخط.' })}
<div class="inl"><div style="flex:1">${rules('افعل', ['استخدم اللون البني في العناوين', 'اترك مساحة فارغة حول الشعار', o.errRule ? 'اكتب الأسعار بأرقام غربية دائمًا وبجانبها رمز العملة وبخط عريض وأسفل المنتج مباشرة' : 'اكتب الأسعار بأرقام غربية'], o.errRule ? 2 : -1)}</div><div style="flex:1">${rules('تجنّب', ['لا تستخدم اللون الأحمر', 'لا تمدّد الشعار أو تدوّره'])}</div></div>
${field('ملاحظات', 'أي شيء آخر يجب أن يعرفه المصمم عن علامتك', 'نقدّم قهوة مختصة وحلويات منزلية. جمهورنا شباب من 20 إلى 35 سنة.', 2000, { ta: true })}
${o.dirty ? `<div class="sbar" role="status"><span style="display:flex;gap:8px;align-items:center">${ic('alert', 18)} لديك تغييرات غير محفوظة.</span><div class="a"><button class="btn">تجاهل التغييرات</button><button class="btn p">حفظ التغييرات</button></div></div>` : `<div class="sp" style="margin-block-start:4px">${o.saved ? `<span class="hint" style="color:var(--ok);display:flex;gap:6px;align-items:center" role="status">${ic('check', 16)} تم حفظ التغييرات.</span>` : '<span></span>'}<button class="btn off" disabled>حفظ التغييرات</button></div>`}</div>`;
const identity = (o = {}) => `<div class="sec card"><h3>الاسم</h3><div class="help">يظهر في قائمتك وللمصمم في المحادثة.</div><div class="fld" style="margin:0"><label>اسم العلامة التجارية</label><div style="display:flex;gap:12px;${o.m ? 'flex-direction:column' : ''}"><div class="in ${o.err ? 'err' : ''}" style="flex:1"><span>${o.err ? '' : 'مقهى الندى'}</span></div><button class="btn ${o.m ? 'full' : ''} ${o.err ? 'off' : ''}" ${o.err ? 'disabled' : ''}>حفظ الاسم</button></div><div class="cnt">${o.err ? `<span class="e" role="alert">${ic('alert', 14)} الاسم مطلوب، من 1 إلى 80 حرفًا.</span>` : '<span></span>'}<span>${o.err ? 0 : 11} / 80</span></div></div></div>`;
const danger = (m) => `<div class="sec card" style="border-color:var(--dan-b);margin-block-end:0"><h3 style="color:var(--dan)">حذف الهوية</h3><div class="help">تُحذف الهوية وجميع ملفاتها نهائيًا، ولا يمكن التراجع عن ذلك.</div><button class="btn dg ${m ? 'full' : ''}">${ic('trash', 18)} حذف هذه الهوية</button></div>`;
const kitHead = (draft = true) => `<a class="back" href="#">${ic('arr', 18)} علاماتي التجارية</a><div class="hd" style="margin-block-end:16px"><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><h2>مقهى الندى</h2>${draft ? '<span class="badge b-warn">مسودة</span>' : ''}</div></div>`;
const toastOk = (t) => `<div class="notice n-ok" role="status" style="margin-block-end:16px">${ic('check', 20)}<span>${t}</span></div>`;
const kitPage = (m, o = {}) => `${kitHead(o.draft !== false)}${o.toast || ''}${identity({ m })}${palette(o.pal || {})}${files({ m, ...(o.files || {}) })}${profile(o.prof || {})}${danger(m)}`;

const delBody = `<h3>حذف «مقهى الندى»؟</h3><p>ستُحذف هذه الهوية وجميع ملفاتها (8 ملفات) نهائيًا. لا يمكن التراجع عن ذلك.</p><div class="acts"><button class="btn dp">${ic('trash', 18)} حذف الهوية</button><button class="btn">إلغاء</button></div>`;
const delBusy = `<h3>حذف «مقهى الندى»؟</h3><p>ستُحذف هذه الهوية وجميع ملفاتها (8 ملفات) نهائيًا. لا يمكن التراجع عن ذلك.</p><div class="acts"><button class="btn off" disabled>${ic('spin', 18)} جارٍ الحذف…</button><button class="btn" disabled>إلغاء</button></div>`;
const leaveBody = `<h3>تغييرات غير محفوظة</h3><p>لديك تغييرات في «الأسلوب والتعليمات» لم تُحفظ. إذا غادرت الآن فستفقدها.</p><div class="acts"><button class="btn p">البقاء في الصفحة</button><button class="btn">المغادرة دون حفظ</button></div>`;
const nf = `<div class="card empty"><div class="eic">${ic('layers', 30)}</div><h3>لم نجد هذه الهوية</h3><p>ربما حُذفت أو أن الرابط غير صحيح.</p><button class="btn p">${ic('arr', 18)} العودة إلى علاماتي التجارية</button></div>`;

// ---- boards
const font = '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">';
const T = 'علاماتي التجارية';
const KT = 'مقهى الندى';
const df = (cls, t, n, body, ov, title = T) => fr(cls, t, n, dApp(title, body), ov);
const desktop = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>S24 علاماتي التجارية</title>${font}<style>${css}</style></head><body><div class="board">
<div><h1 class="bt">S24 · علاماتي التجارية (هويات العلامة التجارية)</h1><p class="note">لوحة تصميم: العناوين والملاحظات الصغيرة شرح للمراجعة وليست جزءًا من الواجهة. بيانات تجريبية. الصفحة مكان ثانوي لإدارة الهويات، والتجربة الرئيسية في المحادثة مع «مصمم جرافيك».</p></div>
${df('d', '1. القائمة /brands', 'أربع هويات: شعار، شعار، حرف أول (مسودة)، حرف أول', listBody(false, 'd'))}
${df('d', '1b. وصل إلى حد الباقة', 'الزر معطّل مع السبب ورابط الباقات (الحد من الباقة: [5])', listBody(true, 'd'))}
<div class="row">${df('h', '1c. لا توجد هويات', '', emptyB('h'))}${df('h', '1d. جارٍ التحميل', '', loadB('h'))}</div>
${df('d', '1e. تعذّر التحميل', '', errB('d'))}
<div class="row">${df('h', '2a. هوية جديدة', 'الاسم فقط، من 1 إلى 80 حرفًا', listBody(false, 'h'), ovD(newForm(false)))}${df('h', '2b. الاسم فارغ', 'بعد الإنشاء تُفتح صفحة الهوية', listBody(false, 'h'), ovD(newForm(true)))}</div>
${df('d', '3a. صفحة الهوية /brands/$id', 'هوية جديدة (مسودة). بعد رفع شعار تظهر «ألوان من شعارك»، ولا تُضاف تلقائيًا', kitPage(false, { pal: { sug: true } }), '', KT)}
${df('d', '3b. الملفات: الأخطاء والحالات', 'سحب فوق المنطقة، رفع جارٍ، تعذّر الرفع، أكبر من الحد، نوع غير مسموح، 40 ملفًا', files({ up: true, fail: true, hov: true, full: true, total: 40, e1: 'حجم الصورة أكبر من 10 ميغابايت.', e3: 'نوع الملف غير مسموح. المسموح: PNG أو JPG أو WebP.', e4: 'حجم ملف PDF أكبر من 20 ميغابايت.' }) + `<div class="notice n-warn">${ic('alert', 20)}<span>أرسلت طلبات كثيرة خلال وقت قصير. انتظر قليلًا ثم حاول مرة أخرى.</span></div>`, '', KT)}
${df('d', '3c. أخطاء الحقول وتغييرات غير محفوظة', 'الاسم فارغ، لون مكرر، قاعدة أطول من 200 حرف، شريط التغييرات غير المحفوظة', identity({ err: true }) + palette({ dup: true, n: 3 }) + profile({ dirty: true, errRule: true }), '', KT)}
${df('d', '3d. بعد الحفظ', 'لا شارة «مسودة»، رسالة نجاح، زر الحفظ معطّل حتى تتغير القيم', kitPage(false, { draft: false, toast: toastOk('تم حفظ الأسلوب والتعليمات.'), prof: { saved: true } }), '', KT)}
<div class="row">${df('h', '4a. تأكيد الحذف', 'من قسم «حذف الهوية» في آخر الصفحة', kitPage(true), ovD(delBody), KT)}${df('h', '4b. جارٍ الحذف', 'بعده يعود إلى القائمة', kitPage(true), ovD(delBusy), KT)}</div>
<div class="row">${df('h', '5a. مغادرة مع تغييرات غير محفوظة', '', kitPage(true, { prof: { dirty: true } }), ovD(leaveBody), KT)}${df('h', '5b. الهوية غير موجودة (404)', 'رابط لهوية محذوفة أو ليست لك', nf)}</div>
</div></body></html>`;
const fx = (h) => h.replace(/(\d+ \/ \d+)/g, '<bdi dir="ltr">$1</bdi>');
fs.writeFileSync(path.join(dir, 'desktop.html'), fx(desktop));

const mf = (t, n, body, ov, title = T) => fr('m', t, n, mApp(title, body), ov);
const mobile = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>S24 علاماتي التجارية (جوال)</title>${font}<style>${css}</style></head><body><div class="board">
<div><h1 class="bt">S24 · علاماتي التجارية (جوال 375px)</h1><p class="note">القائمة الجانبية تصبح درجًا من اليمين (زر القائمة أعلى اليمين). مناطق الإفلات تصبح «اختيار ملفات» و«التقاط صورة». النوافذ أوراق سفلية.</p></div>
<div class="row">
${mf('م1. القائمة', '', listBody(false, 'm'))}
${mf('م1b. حد الباقة', '', listBody(true, 'm'))}
${mf('م1c. فارغة', '', emptyB('m'))}
${mf('م1d. تحميل', '', loadB('m'))}
${mf('م1e. خطأ', '', errB('m'))}
${mf('م2. هوية جديدة', '', listBody(false, 'm'), ovM(newForm(false)))}
</div>
<div class="row">
${mf('م3a. الهوية (1/3): الاسم والألوان', 'مع ألوان من الشعار', kitHead() + identity({ m: true }) + palette({ sug: true }), '', KT)}
${mf('م3b. الهوية (2/3): الملفات', 'رفع جارٍ وأخطاء', files({ m: true, up: true, fail: true, e1: 'حجم الصورة أكبر من 10 ميغابايت.', e4: 'نوع الملف غير مسموح.' }), '', KT)}
${mf('م3c. الهوية (3/3): الأسلوب والحذف', 'تغييرات غير محفوظة', profile({ dirty: true }) + danger(true), '', KT)}
</div>
<div class="row">
${mf('م4. تأكيد الحذف', '', kitHead() + identity({ m: true }) + palette({}), ovM(delBody), KT)}
${mf('م5. مغادرة دون حفظ', '', kitHead() + identity({ m: true }) + palette({}), ovM(leaveBody), KT)}
${mf('م6. غير موجودة', '', nf)}
${mf('م7. الحد 40 ملفًا', '', files({ m: true, full: true, total: 40 }), '', KT)}
</div>
</div></body></html>`;
fs.writeFileSync(path.join(dir, 'mobile.html'), fx(mobile));
console.log('ok');
