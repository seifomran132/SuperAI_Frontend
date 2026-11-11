import opentype from 'opentype.js';
import fs from 'fs';
const OUT='F:/Projects/SuperCardAI/SuperAI_frontend/design/brand/logo';
fs.mkdirSync(OUT+'/variants',{recursive:true});
const load=p=>{const b=fs.readFileSync(p);return opentype.parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));};
const ar=load('font/Plex-Bold.ttf'), la=ar;

const SLATE='#1E293B', DARK='#0F172A', WHITE='#FFFFFF', TEAL='#0F766E', TEAL_L='#99F6E4';
// glyph(c): c = {g: glyph colour, a: accent colour, bg: colour that "knocks out"}, id for masks
const concepts = {
 a:{name:'Lam + pupil', glyph:(c,id)=>`
  <path d="M43 10V37C43 46 37 51 29 51C21 51 16 47 14 41" fill="none" stroke="${c.g}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="28" cy="35" r="5.5" fill="${c.a}"/>`},
 b:{name:'Lam eye', glyph:(c,id)=>`
  <path d="M45 10V43M45 43C40 35 33 31 26 31C19 31 13 36 10 43C13 50 19 55 26 55C33 55 40 51 45 43" fill="none" stroke="${c.g}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="27" cy="43" r="5.5" fill="${c.a}"/>`},
 c:{name:'Bubble lam', glyph:(c,id)=>`
  <defs><mask id="m${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64"><rect width="64" height="64" fill="#fff"/>
   <path d="M38 17V29C38 36 34 39 29 39C24 39 21 36 20 32" fill="none" stroke="#000" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></mask></defs>
  <g mask="url(#m${id})"><rect x="8" y="8" width="48" height="38" rx="14" fill="${c.g}"/></g>
  <path d="M36 43L53 58L54 38Z" fill="${c.a}" stroke="${c.a}" stroke-width="3" stroke-linejoin="round"/>`},
 d:{name:'Lam + glint', glyph:(c,id)=>`
  <path d="M42 12V37C42 45 38 50 31 50H18" fill="none" stroke="${c.g}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M22 24L30 14" fill="none" stroke="${c.a}" stroke-width="6" stroke-linecap="round"/>`},
};
const pal={
 color:{tile:SLATE,g:WHITE,a:TEAL_L,text:SLATE,acc:TEAL,bg:null},          // full colour on white
 reverse:{tile:null,g:WHITE,a:TEAL_L,text:WHITE,acc:TEAL_L,bg:SLATE},       // white on slate
 mono:{tile:null,g:'#000',a:'#000',text:'#000',acc:'#000',bg:null},         // single colour black
 dark:{tile:WHITE,g:SLATE,a:TEAL,text:WHITE,acc:TEAL_L,bg:DARK},            // dark surface
};
let uid=0;
const sym=(k,v,size=64)=>{const p=pal[v];const id=k+v+(uid++);
 return `<g>${p.tile?`<rect width="64" height="64" rx="14" fill="${p.tile}"/>`:''}${concepts[k].glyph({g:p.g,a:p.a},id)}</g>`;};
const symbolSvg=(k,v)=>{const p=pal[v];const bg=p.bg?`<rect width="64" height="64" rx="${v==='color'?0:14}" fill="${p.bg}"/>`:'';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Lam7a AI">${bg}${sym(k,v)}</svg>\n`;};
const f2=n=>Math.round(n*100)/100;
function lockup(k,v,lang){
 const p=pal[v], pad=p.bg?16:0;
 let body='', W;
 if(lang==='ar'){
  const s=46, a=ar.getPath('لمحة',0,0,s), ab=a.getBoundingBox(), aw=ab.x2-ab.x1, ah=-ab.y1;
  const base=32+ah/2;
  const S=40, ai=la.getPath('AI',0,0,S), ib=ai.getBoundingBox(), iw=ib.x2-ib.x1;
  const gap=16, gap2=10;
  W=iw+gap2+aw+gap+64;
  // order left->right: AI, لمحة, symbol
  const aiX=-ib.x1, arX=iw+gap2-ab.x1, symX=iw+gap2+aw+gap;
  const aiP=la.getPath('AI',aiX,base,S), arP=ar.getPath('لمحة',arX,base,s);
  body=`<g transform="translate(${f2(symX)} 0)">${sym(k,v)}</g><path d="${arP.toPathData(2)}" fill="${p.text}"/><path d="${aiP.toPathData(2)}" fill="${p.acc}"/>`;
 } else {
  const s=44, t=la.getPath('Lam7a',0,0,s), tb=t.getBoundingBox(), tw=tb.x2-tb.x1;
  const S=44, ai=la.getPath('AI',0,0,S), ib=ai.getBoundingBox(), iw=ib.x2-ib.x1;
  const capH=-tb.y1, base=32+capH/2-1, gap=16, sp=12;
  W=64+gap+tw+sp+iw;
  const tP=la.getPath('Lam7a',64+gap-tb.x1,base,s), aP=la.getPath('AI',64+gap+tw+sp-ib.x1,base,S);
  body=`<g>${sym(k,v)}</g><path d="${tP.toPathData(2)}" fill="${p.text}"/><path d="${aP.toPathData(2)}" fill="${p.acc}"/>`;
 }
 const w=f2(W+pad*2), h=64+pad*2;
 const bg=p.bg?`<rect width="${w}" height="${h}" rx="${v==='reverse'||v==='dark'?12:0}" fill="${p.bg}"/>`:'';
 return {w,h,svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${lang==='ar'?'لمحة AI':'Lam7a AI'}">${bg}<g transform="translate(${pad} ${pad})">${body}</g></svg>\n`};
}
const sizes={};
for(const k of Object.keys(concepts)){
 fs.writeFileSync(`${OUT}/concept-${k}-symbol.svg`,symbolSvg(k,'color'));
 for(const l of ['ar','en']){const r=lockup(k,'color',l);fs.writeFileSync(`${OUT}/concept-${k}-lockup-${l}.svg`,r.svg);sizes[k+l]=r;}
 for(const v of ['reverse','mono','dark']){
  fs.writeFileSync(`${OUT}/variants/concept-${k}-symbol-${v}.svg`,symbolSvg(k,v));
  for(const l of ['ar','en'])fs.writeFileSync(`${OUT}/variants/concept-${k}-lockup-${l}-${v}.svg`,lockup(k,v,l).svg);
 }
}
fs.writeFileSync('sizes.json',JSON.stringify(Object.fromEntries(Object.entries(sizes).map(([a,b])=>[a,[b.w,b.h]]))));
