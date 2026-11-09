# S13 Landing page (`/`, public, desktop 1280 + mobile 375)

- Stitch project: `projects/15605789258921234837`
- Screen ids: **none (hand-built)**. `generate_screen_from_text` was called once with the first brief and timed out (no screen after about 8 minutes of polling); not retried. Built by hand like S12, S21 (Tailwind CDN markup with DESIGN.md tokens, rendered to PNG with Playwright).
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`), source `design/DESIGN.md`.
- Status: **approved by the user, 2026-11-09** (the user approved the hero direction and gave final decisions on 2026-11-09, applied in revision 4)
- Spec: `docs/plans/F11_LANDING.md` §1, §3
- Files: `desktop.html` / `desktop.png` (1280, full page), `mobile.html` / `mobile.png` (375, full page). Same responsive markup in both HTML files; also checked at 768 (stacked hero, no overflow).

## Revision 2 (user feedback: too simple, then "no patterns")
First version was plain cards. Second added a star pattern, wave dividers and a calligraphy-style swash; the user ruled out all patterns and decorative textures, so **all of that was removed** (grep for `pattern`/`url(#` is empty). Current version uses drawn scenes only, flat vector style, one stroke weight family, colors from variables.

## Revision 4 (final decisions from the user)
- **No free plan at launch; sign-up is free.** Free plan card removed; two paid placeholder cards remain (`[اسم الباقة]`, `[00.00$]`), both «تواصل معنا للاشتراك» linking to `#howto`. Kept «أنشئ حسابك مجانًا» (step 1) and «ابدأ بحساب مجاني» (closing); closing sub-line is now «أنشئ حسابك مجانًا، ثم اختر الباقة المناسبة لك.». No other text implies free chat.
- **Image mode added.** Third mode card in «أوضاع لكل مهمة»: «تصميم» chip (mode-3 tokens `#0369A1` / `#F0F9FF` / `#BAE6FD`, palette icon) plus the dark «صورة» badge (as S17), scene = picture frame with landscape, brush and paint dots (flat, `--m3*` variables), line «أنشئ صورًا من وصف تكتبه، وعدّل صورة ترفقها.» + «مناسب للتصاميم والمشاهد والأفكار المرئية.» (new copy). Three cards from 1024px, stacked below. Label «تصميم» is an example; the build reads labels from `GET /modes`, colors by position. No gallery, cost or provider claims.
- **Modes elsewhere:** «تصميم» is the third node in the balance drawing; FAQ «ما الفرق بين الأوضاع؟» now also mentions «والتصميم لإنشاء الصور». Plan-card mode chips stay placeholders.
- **Balance drawing redrawn:** three circles, one clean bus line with rounded corners and solid arrowheads, tank below with clear space (no crowding at 375).
- **FAQ balance answer:** «تحتاج كل رسالة إلى رصيد كافٍ. إذا لم يكفِ رصيدك، تواصل معنا لإضافة رصيد إلى حسابك.» (no auto-switch or top-up implied).
- **Hero:** teal disc removed; scene bleeds `-mx-3` on phones (about 7% larger at 375). The «ماذا يفعل» tile row is removed (it repeated the hero; the hero paragraph already lists تلخيص، كتابة، ترجمة، وشرح), so the page goes hero -> modes.
- Closing-section buttons set to `whitespace-nowrap` (they wrapped at 768).
- Total inline art SVG is now 8 SVGs, about 10.4 KB (hero about 3.9 KB, three mode scenes, balance, three steps).

## Revision 3 (hero illustration replaced)
The user did not like the person-at-a-desk hero. It is replaced by a no-people scene; nothing else on the page changed.

### Illustrations (8 inline SVGs, about 10.4 KB total; the hero is about 3.9 KB of that; no external files)
1. **Hero (new):** one large scene in the end column (left in RTL), 560px wide on desktop, full width on mobile, one SVG (viewBox 600x500, about 4.0 KB) with the chat preview as real HTML over it. A front view laptop slightly larger than life; its screen shows the chat preview (user bubble, assistant answer, composer with the «سريع» chip). Behind it two layered rounded shapes in the indigo container tones (`--m2c`, `--m2b`) and a small teal ring, and solid flat shadows (`--m2b`) under the laptop and each object. Four objects overlap the laptop edges at different sizes: a long document with a highlighted passage (summarising, left, largest), a pen writing on a page (writing, bottom end), two overlapping speech cards with «ع» and «A» as HTML text (translation, top end), a lightbulb (explaining, bottom start). The hero copy and buttons stay on the start side (right); the grid stacks below 1024px (copy first, scene below, centered, max 560px). The old side-by-side panel and the person are gone. At 375 the preview is simplified (user bubble, title + one list item, composer with chip and send button only) so text stays 14px; from 640px the second and third items and the placeholder appear. Floating objects only overlap the laptop bezel and the screen margins, never the preview text. The preview has `role="img"` + `aria-label`; the SVG is `aria-hidden`.
2. **Fast mode:** a phone showing a short exchange, plus a cup of coffee (a quick everyday question).
3. **Professional mode:** a stack of long document pages, one with a highlighted block, plus a summary bubble and pencil (working through a long document).
4. **One balance:** a tank holding a stack of coins, connected by dotted flow lines with arrowheads to two nodes (a document for Professional, a chat bubble for Fast), on the plain brand band. Labels and the `14.50$` chip are real HTML positioned over the SVG.
5-7. **Steps:** create an account (form window with a plus badge), send an email (envelope with an arrow badge that points left, i.e. forward in RTL), the balance arriving (card with coins and a check badge).

Rules kept: colors only via CSS variables (`--brand`, `--surface`, `--muted`, `--line`, `--ctl`, `--m1/--m1c/--m1b`, `--m2/...`, `--on-brand`) that mirror DESIGN.md tokens; no brand name or monogram inside any SVG; no Arabic drawn as paths (all text is HTML; bubbles use plain bars); every illustration `aria-hidden="true" focusable="false"`; no robots, brains, provider logos or image features; no gradients, no motion in the art (so nothing to disable for reduced motion).
Mirroring: scenes are drawn for RTL directly (assistant bubble toward the chat preview on the end side; arrows point left). Left-positioned labels over the balance scene use inline `left:%` on purpose because they track fixed SVG coordinates (not layout).
People: none anywhere in the art after revision 3 (the hero person was removed).

### Layout rhythm (no textures)
Canvas hero with a tinted panel, canvas task tiles, white band (modes), **brand-colored band (one balance)**, canvas plans, white band (steps), canvas FAQ, a brand-colored closing call to action «ابدأ بحساب مجاني» with «إنشاء حساب», muted footer.

### Other changes in this revision
- Hero: duplicate monogram and name removed (they stay in the top bar and footer). The hero is two columns (text on the start side, the laptop scene with the chat on its screen on the end side), stacked below 1024px.
- New short «ماذا يفعل» tiles (تلخيص، كتابة، ترجمة، شرح) with line icons.
- Free plan button now «إنشاء حساب» (to sign-up); paid plan buttons stay «تواصل معنا للاشتراك» and scroll to `#howto`.

## Checklist
- [x] `dir="rtl"`, IBM Plex Sans Arabic; no `ml-/mr-/left-/right-` classes, no tracking, no italics (grep 0)
- [x] Western digits; money in `<bdi dir="ltr">` (`14.50$`, `0.00$`, `[00.00$]`); email in `<bdi dir="ltr">`
- [x] Tokens only; text contrast per DESIGN.md (muted `#475569`; on the navy band body text is `#E2E8F0`, headings white); no `#94A3B8` text
- [x] No provider/model names, payment/checkout/add-balance, per-answer cost, estimates, testimonials, counts, logos, statistics or speed claims. The coins in the balance scene show a balance, not a payment.
- [x] 44px targets (measured: no link or summary under 44px); no horizontal scroll at 375, 768, 1280 (scrollWidth equals viewport)
- [x] Chat preview shows no per-answer cost

## Placeholders and decisions for the user
1. **Plan figures are placeholders** (`[اسم الباقة]`, `[00.00$]`, `[وصف مختصر للباقة]`, free plan `0.00$`), as in S12. The build reads live data from `GET /plans` through `<Money>`; prices never go into prerendered HTML.
2. **New copy for approval:** closing call to action («ابدأ بحساب مجاني» / «أنشئ حسابك وابدأ الكتابة بالعربية.»), the four task tiles and their lines, the mode example lines («مناسب لـ…»), the balance paragraph, the steps, and the FAQ answers. Verify the claims «ويمكنك أيضًا الكتابة بلغات أخرى» and «تتوقف الرسائل الجديدة حتى يُضاف رصيد».
3. **Mode labels** («سريع»/«احترافي») and their two description lines come from `GET /modes` at runtime. The illustrations and the «مناسب لـ…» line are static and tied to mode **position** 1 and 2 (teal, indigo). A third mode would need its own scene or a generic one.
4. **Hero scene:** no people. Decide if the four objects (document, pen, speech cards, lightbulb) are right, and if the teal disc and ring behind the laptop are too much.
5. Landing is for signed-out visitors; the signed-in redirect to `/chat` runs after mount (F11 §4).

## Implementation notes
- Build the scenes as small React SVG components in `src/features/landing` (about 9 KB; hero about 4 KB), `aria-hidden`, colors from CSS variables defined from the brand and mode tokens in `app.css`; no image requests.
- The chat preview is static markup with `role="img"` + `aria-label`, not the real chat components (keeps chat code out of the landing bundle).
- FAQ is native `<details>`; chevron rotates only; smooth scrolling off under reduced motion.
- Plans section still needs loading (skeleton cards) and error (text + link to `/plans`) states, not drawn.
- «عرض جميع الباقات» chevron points left (RTL forward).

## Not done
Stitch generation (timed out), hover and focus state sheet, plans-section loading and error states, Open Graph image.
