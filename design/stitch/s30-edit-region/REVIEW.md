# S30 Mark an area on the uploaded design (desktop board + mobile 375px)

- Stitch project: `projects/15605789258921234837`
- Screen ids: **none (hand-built)**, same method as S21 to S29: the frames must match the approved S25 and S27 boards exactly (sidebar on the right, agent message with the «مصمم جرافيك» chip, the dock replacing the composer, the `edit_summary` card), and Stitch cannot keep that shell, so no `generate_screen_from_text` call was made.
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`), source [design/DESIGN.md](../../DESIGN.md).
- Status: **approved 2026-11-11**
- Plan and contract: [docs/plans/F15_EDIT_REGION_BRIEF.md](../../../docs/plans/F15_EDIT_REGION_BRIEF.md) (backend decision): `ui: { type: 'region', step, brandKitId, assetId, target: 'product' | 'logo', optional, width, height }`; answer `{ region: { x, y, width, height } }` (0 to 1, from the image's top-left, each side >= 0.03) or `{ skip: true }`.
- Files: `desktop.html` / `desktop.png` (1640px render, 27 frames), `mobile.html` / `mobile.png` (16 frames at 375px). `node build.mjs` then `node render.mjs`. `s25-css.mjs` and `s24-parts.mjs` are the approved files unchanged. Board titles and small notes are annotations. Sample data is fictional («مقهى الندى»); the uploaded design is a neutral SVG promo card (logo top-left, round product badge in the centre), content not UI.

## Desktop frames
- أ, ب: whole conversation with sidebar (product box placed after a marked logo; logo step empty with skip).
- 1 product (`edit_product_region`, required, no skip): 1a empty (pill «اسحب لرسم مربع», «متابعة» and «إعادة التحديد» disabled); 1b drawing (outside dimmed, crosshair, no handles); 1c placed (4 corner handles, whole box moves, «المنتج» tag, «متابعة» enabled); 1d too small («المربع صغير جدًا. اسحب مربعًا أكبر حول المنتج.», dashed red box, «متابعة» disabled); 1e sending (box locked, spinner); 1f portrait 3:4 design; 1g redo from the summary: previous box pre-filled and «متابعة» enabled; 1h loading: sized placeholder in the design's real shape from `width` / `height`.
- 2 logo (`edit_logo_region`, optional): 2a empty with «تخطَّ — سأجده بنفسي»; 2b drawing; 2c placed; 2d skipping (`{ skip: true }`, the skip button spins); 2e too small; 2f loading (skip stays enabled).
- 3 history: 3a user bubbles with a thumbnail of the design with the box (outside dimmed) and «حدّدت مكان الشعار» / «حدّدت مكان المنتج», then the next step (upload the new product); 3b skipped logo is a text-only bubble «تخطّيت تحديد الشعار».
- 4 `edit_summary`: 4a «مكان الشعار» and «مكان المنتج» each with a mini thumbnail and «محدَّد»; 4b logo skipped shows «تلقائي»; every row has «تعديل» that returns to the step with the previous box pre-filled (1g; for «تلقائي» the step opens empty, 2a); «إلغاء» / «عدّله» unchanged.
- 5 errors: 5a image failed to load (product; «إعادة المحاولة» inside the image's place); 5b same for the logo with skip still enabled; 5c `400 VALIDATION_FAILED` on `region` (message under the image, box kept); 5d network failure (box kept, retry by «متابعة»).
- 6 accessibility: 6a keyboard focus on the image (focus ring, pill «اضغط Enter لإنشاء مربع في الوسط», shortcuts panel open); 6b focus on the box; 6c handle anatomy (annotation).

## Phone frames
م1 empty, م2 drawing with one finger (44px touch circle), م3 placed, م4 too small, م5 sending, م6 logo empty + skip, م7 logo placed + skip, م8 skipping, م9 portrait design, م10 loading, م11 load failed, م12 `VALIDATION_FAILED`, م13 redo from the summary, م14 history, م15 and م15b summary (logo «تلقائي» / «محدَّد»).

## Accessibility proposal (item 7)
Dragging is never the only way. The image is a focusable `role="application"` group (`aria-roledescription="محدّد منطقة"`) with a visible focus ring.
1. `Enter` on the image creates a default box (30% of each side, centred). `Delete` resets.
2. On the box: arrows move 1% (with `Shift`, 5%); `Alt` + right/left arrows change the width, `Alt` + up/down change the height, by the same steps. Arrows follow the image as seen (left = toward the image's left; the image is not mirrored). Clamped to 0..1 and to the 0.03 minimum.
3. A visible button «اختصارات لوحة المفاتيح» (desktop) opens the list; the stage has `aria-describedby` pointing to it.
4. A polite live region announces on each change in words, e.g. «المربع في وسط الصورة، عرضه 34% وارتفاعه 46%» (position as top/middle/bottom and left/centre/right of the image).
5. The status line reserves its height (no layout jump); errors use an icon plus text, never colour alone; handles and box have a white/dark double edge so they read on any image.
Considered and not drawn: a 3x3 preset grid with size steps. It is extra UI; the keyboard path is enough for a drag gesture. Say if you want it.

## Checked against DESIGN.md
- [x] `dir="rtl"`, IBM Plex Sans Arabic; `<aside>` first in the flex row (sidebar on the right); the image stage alone is `direction:ltr` (coordinates from the image's top-left) and uses logical `inset-inline-start` / `inset-block-start` there
- [x] grep of both HTML files: no margin/padding left/right, no text-align left/right, no `left:` / `right:`, no letter-spacing, no italics, no monospace; `Enter`, `Alt`, `Shift`, `Tab` and percentages are `<bdi dir="ltr">` or `<kbd>`-style spans
- [x] No prices; money only «14.50$» in the header chip; Western digits; no model or provider names; no payments; images private (no URLs on the board)
- [x] Interactive borders `#7C8799`; disabled buttons as in S27; colours from the design system only (pro indigo for handles and focus, danger for errors, ok for «محدَّد»); no `#94A3B8` text; 44px buttons; handle hit areas 32px desktop and 44px phone (visible handle 16px)
- Not checked: real pointer and touch behaviour, Stitch export (none), contrast on arbitrary user images beyond the double-edge treatment.

## Deviations
1. Hand-built, not generated (see above).
2. Phone summary: the scroll cap of the rows list is raised from 380px to 560px on this board so the two new rows are visible; confirm the cap in the build.
3. A few stage rules exist only for this input (dim via a layer, handles, pill); all use existing tokens.

## Implementation notes
- Sizes: the stage uses `width` / `height` from `ui` for `aspect-ratio` before the blob loads (shimmer stops under `prefers-reduced-motion`). Desktop max width 520px; phone fills the dock width, shrinking (max height about half the viewport) for portrait designs. Image fetched like other kit files with the bearer token; revoke the blob on unmount.
- Coordinates: pointer position relative to the displayed image rect divided by its size, clamped to 0..1, from the top-left. Sent as `{ region: { x, y, width, height } }`; never mirrored by RTL. Pointer Events with `setPointerCapture` and `touch-action: none` on the image only, so the page scrolls elsewhere. Pointer down outside the box starts a new box; on a box smaller than 0.03 on any side show «المربع صغير جدًا» and keep «متابعة» disabled (no handles on a too-small box: draw again).
- Handles: corner hit areas can overlap on a small box (logo); the nearest to the pointer wins. Offset them inward at the image edge so they stay inside the screen.
- Answer: `edit_logo_region` skip sends `{ skip: true }`; `edit_product_region` has no skip. `VALIDATION_FAILED` highlights nothing else: message under the image, box stays. Errors by `code` (`t('errors:CODE')`).
- Summary: «محدَّد» / «تلقائي» rows from the contract; mini thumbnail redraws the stored box. «تعديل» opens the step with the stored box.
- History bubble: thumbnail plus «حدّدت مكان …» is drawn from the stored answer (client-side), the server `content` text for it is to be confirmed.
- Tokens: `--pro` for handles/focus, `--dan` for too-small and failures, `--ok` for «محدَّد»; no hex in components.

## Open questions
1. Skip wording: «تخطَّ — سأجده بنفسي» (as requested) reads as the user finding the logo, while the contract means the designer finds it («تلقائي» in the summary). Suggest «تخطَّ — يجده المصمم بنفسه».
2. Minimum size: the contract says 0.03 per side (about 15px on the desktop image); a stricter UX minimum (for example 0.05) would give fewer useless boxes.
3. Should the product step show the already marked logo box faintly so the two do not overlap? Not drawn (not in the contract).
4. Does the server's `content` for the answer bubble say «حدّدت مكان المنتج»? Drawn as is; the thumbnail is client-side.
5. Phone summary scroll cap (deviation 2).

## Approval (user, 2026-11-11)

Approved with these answers: skip reads «تخطَّ — يجده المصمم»; the client uses the contract minimum (0.03 per side); the product step shows the already-marked logo box faintly; the answer bubble uses the server text with the thumbnail drawn client-side; the raised summary scroll cap on phones is fine. Contract changes after the board: a bad box is `400 VALIDATION_FAILED` on field `value`; the step carries `current` for redrawing.
