import fs from 'fs';
const OUT='F:/Projects/SuperCardAI/SuperAI_frontend/design/brand/logo';
const C={
 a:['أ','لام تحتضن نقطة','حرف «ل» بخط سميك مستدير، وفي تجويف القاعدة نقطة تيل: «لمحة» = بؤبؤ يلتقط الفكرة.'],
 b:['ب','لام عين','ساق «ل» تخرج من عين لوزية بها بؤبؤ: نظرة سريعة تفهم.'],
 c:['ج','فقاعة حوار بلام','فقاعة محادثة ذيلها نحو البداية (اليمين)، و«ل» مفرَّغة بداخلها.'],
 d:['د','لام وومضة','«ل» بقاعدة مسطحة وشرطة مائلة تيل كأنها لمعة/همزة فوق الساق.'],
};
const S=(f,w,h,bgc)=>`<img src="${f}" width="${w}" height="${h}" alt="">`;
const col=k=>{
 const ladder=[16,32,64,180].map(s=>`<figure><img src="concept-${k}-symbol.svg" width="${s}" height="${s}" alt=""><figcaption>${s}</figcaption></figure>`).join('');
 const ladderDark=[16,32,64].map(s=>`<img src="variants/concept-${k}-symbol-reverse.svg" width="${s}" height="${s}" alt="">`).join('');
 const v=(n,cls)=>`<div class="sw ${cls}"><img src="variants/concept-${k}-symbol-${n}.svg" width="72" height="72" alt=""></div>`;
 return `<section class="card"><h2><span>المفهوم ${C[k][0]}</span> ${C[k][1]}</h2><p>${C[k][2]}</p>
 <h3>سلّم الأحجام (px)</h3><div class="ladder">${ladder}</div>
 <div class="ladder small on-slate">${ladderDark}</div>
 <h3>الأيقونة المرصوفة</h3><div class="row">${v('reverse','')}${v('mono','white')}${v('dark','')}</div>
 <h3>الشعار الأفقي</h3>
 <div class="lock white"><img src="concept-${k}-lockup-ar.svg" height="56" alt=""></div>
 <div class="lock white" dir="ltr"><img src="concept-${k}-lockup-en.svg" height="56" alt=""></div>
 <div class="lock slate"><img src="variants/concept-${k}-lockup-ar-reverse.svg" height="64" alt=""></div>
 <div class="lock black"><img src="variants/concept-${k}-lockup-ar-dark.svg" height="64" alt=""></div>
 <div class="lock white"><img src="variants/concept-${k}-lockup-ar-mono.svg" height="40" alt=""></div><div class="lock white" dir="ltr"><img src="variants/concept-${k}-lockup-en-mono.svg" height="40" alt=""></div>
 </section>`;};
fs.writeFileSync(OUT+'/logo-concepts.html',`<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>لمحة AI — مفاهيم الشعار</title>
<style>
@font-face{font-family:'IBM Plex Sans Arabic';font-weight:600;src:url(_fonts/Plex-SemiBold.ttf)}
@font-face{font-family:'IBM Plex Sans Arabic';font-weight:700;src:url(_fonts/Plex-Bold.ttf)}
body{margin:0;background:#F8FAFC;color:#0F172A;font-family:'IBM Plex Sans Arabic',system-ui,sans-serif;padding:32px}
header h1{margin:0 0 4px;font-size:28px}header p{margin:0 0 24px;color:#475569}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.card{background:#fff;border:1px solid #E2E8F0;border-radius:16px;padding:20px}
h2{font-size:18px;margin:0 0 6px}h2 span{color:#0F766E;margin-inline-end:6px}
.card p{margin:0 0 12px;color:#475569;font-size:14px;line-height:1.7;min-height:48px}
h3{font-size:13px;margin:16px 0 8px;color:#475569}
.ladder{display:flex;align-items:flex-end;gap:14px;flex-wrap:wrap;direction:ltr;justify-content:flex-end}
figure{margin:0;text-align:center}figcaption{font-size:11px;color:#475569;margin-top:4px}
.ladder.small{margin-top:10px;padding:10px;border-radius:10px;align-items:center}
.on-slate{background:#1E293B}
.row{display:flex;gap:10px}
.sw{padding:12px;border-radius:12px;background:#1E293B;line-height:0}.sw.white{background:#fff;border:1px solid #E2E8F0}
.row .sw:nth-child(3){background:#0F172A}
.lock{padding:12px 14px;border-radius:12px;margin-bottom:8px;display:flex;gap:16px;align-items:center;justify-content:center;border:1px solid #E2E8F0;overflow:hidden}
.lock img{max-width:100%;height:auto}
.lock.white{background:#fff}.lock.slate{background:#1E293B;border-color:#1E293B}.lock.black{background:#0F172A;border-color:#0F172A}
footer{margin-top:20px;color:#475569;font-size:13px}
</style><header><h1>لمحة AI — مفاهيم الشعار</h1><p>أربعة مفاهيم؛ الألوان: #1E293B و#0F172A و#FFFFFF مع لمسة تيل #0F766E (على الفاتح) و#99F6E4 (على الداكن). بانتظار اختيار المستخدم.</p></header>
<div class="grid">${['a','b','c','d'].map(col).join('')}</div>
<footer>الخط: IBM Plex Sans Arabic Bold، محوَّل إلى مسارات. الرسم النهائي يدوي بالمتجهات؛ ستيتش استُخدم للاستكشاف فقط.</footer></html>`);
