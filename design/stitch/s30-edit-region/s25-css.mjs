// CSS of the approved S25 board (lines copied unchanged from ../s25-agent-chat/build.mjs).
import { css as baseCss } from './s24-parts.mjs';
export const css = baseCss + `.fr.c{width:760px}
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
