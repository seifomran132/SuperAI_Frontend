// Parts copied unchanged from S24 (../s24-brand-kits/build.mjs): CSS, icons, colour row, drop zone, file tiles, so the chat inputs keep the approved look.
export const css = `
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
export const P = {
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
export const ic = (n, s = 20) => `<span style="display:inline-flex;flex-shrink:0"><svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg></span>`;
export const fileWord = (n) => (n === 0 ? 'لا ملفات' : n === 1 ? 'ملف واحد' : n <= 10 ? `${n} ملفات` : `${n} ملفًا`);
export const logoSvg = (k) => k === 'a'
  ? `<svg class="pv" viewBox="0 0 56 56"><rect width="56" height="56" fill="#F2E3CF"/><circle cx="28" cy="28" r="16" fill="#7A3E1D"/><circle cx="28" cy="28" r="8" fill="#F2E3CF"/></svg>`
  : `<svg class="pv" viewBox="0 0 56 56"><rect width="56" height="56" fill="#fff"/><path d="M10 42 28 12l18 30z" fill="#0B3C5D"/><circle cx="28" cy="34" r="6" fill="#D9B310"/></svg>`;
export const hex = (h) => `<span class="ltr" dir="ltr">${h}</span>`;
export const swRow = (i, h, first, last) => `<div class="cr"><span class="n">${i}</span><span class="sw" style="background:${h}" aria-hidden="true"></span><span class="hx">${hex(h)}</span>${i === 1 ? '<span class="badge b-pro">الأهم</span>' : ''}<span class="ca"><button class="btn ic" aria-label="تقديم ${h}" ${first ? 'disabled style="opacity:.45"' : ''}>${ic('up', 18)}</button><button class="btn ic" aria-label="تأخير ${h}" ${last ? 'disabled style="opacity:.45"' : ''}>${ic('down', 18)}</button><button class="btn ic dg" aria-label="حذف ${h}">${ic('x', 18)}</button></span></div>`;
export const xbtn = `<button class="x" aria-label="حذف الملف">${ic('trash', 18)}</button>`;
export const logoT = (k) => `<div class="fi" style="background:#fff">${logoSvg(k)}${xbtn}</div>`;
export const photoT = (c1, c2) => `<div class="fi"><svg class="pv" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"><rect width="100" height="100" fill="${c1}"/><circle cx="62" cy="40" r="22" fill="${c2}"/><rect y="70" width="100" height="30" fill="rgba(0,0,0,.18)"/></svg>${xbtn}</div>`;
export const pdfT = (n) => `<div class="fi pdf">${ic('file', 32)}<span class="ltr" dir="ltr" style="color:var(--ink);font-weight:500;word-break:break-all">${n}</span><span class="ltr" dir="ltr">PDF · 2.4 MB</span>${xbtn}</div>`;
export const upT = (p) => `<div class="fi">${ic('img', 28)}<div class="prog"><span>جارٍ الرفع… <bdi dir="ltr">${p}%</bdi></span><div class="bar"><i style="width:${p}%"></i></div></div></div>`;
export const failT = `<div class="fi" style="background:var(--dan-c);border-color:var(--dan-b);align-content:center;justify-items:center;gap:4px;text-align:center;padding:8px;color:var(--dan);font-size:13px">${ic('alert', 22)}<span>تعذّر الرفع</span><button class="btn" style="font-size:13px;padding-inline:10px;background:#fff">${ic('refresh', 14)} إعادة</button></div>`;
