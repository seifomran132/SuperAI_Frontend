# S28 My designs «تصاميمي» (desktop board + mobile 375px)

- Stitch project: `projects/15605789258921234837`
- Screen ids: **none (hand-built)**, same method as S21 to S26: many annotated states in the app shell, matched to the approved S24 and S20 markup, so no `generate_screen_from_text` call was made. Say if you want a Stitch run for any single frame.
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`), source [design/DESIGN.md](../../DESIGN.md).
- Status: **approved 2026-11-11**
- Plan: [docs/plans/F15_DESIGN_CREATION.md](../../../docs/plans/F15_DESIGN_CREATION.md) §2 items 4 to 6, §3 decisions 5 and 6. Contract: API_CONTRACT §11.4 (`GET /me/designs`, `GET /me/designs/{id}/export`) and §11.3 (`GET /me/usage` `designs[]`).
- Files: `desktop.html` / `desktop.png` (16 frames), `mobile.html` / `mobile.png` (14 frames at 375px), `build.mjs` (`node build.mjs --png` regenerates both; PNGs via Playwright/Chrome). Board titles and small notes are annotations. Sample data and the design artwork (SVG at the real shapes) are fictional.

## Desktop frames
1. Gallery `/designs`: title, one-line explanation, brand filter, 3-column grid of 9 designs in their real shapes (1:1, 9:16, 16:9, 3:4, and an edited upload at 4:3), «تحميل المزيد». Card: preview, brand name, `v2` badge, format label or «تصميم معدَّل», date, «تحقّق من النص» note, «فتح المحادثة», split «تنزيل».
   1b download menu: «تنزيل» downloads with the current choices; the chevron opens type (PNG default / JPG / WebP) and size (الحجم الأصلي / مقاس منصات التواصل, with pixels). 1c JPG + social size on a banner, with «يُوضع JPG على خلفية بيضاء.» 1d filter list open. 1e filtered to one brand. 1f brand with no designs.
2. Empty gallery (points to «مصمم جرافيك»). 3. Loading skeleton. 4. Error with retry (selected brand kept). 5. Load more: loading, and failure with retry (loaded cards stay). 6. Downloading state («جارٍ التنزيل…») with success and failure toasts.
7. Account menu with «تصاميمي» after «علاماتي التجارية». 8a/8b sidebar with and without the graphic designer on the plan (both items hidden together).
9. «استهلاكي» with the new «التصاميم» section: columns الوكيل / الطلبات / التصاميم / المبلغ, one row «مصمم جرافيك», note that designs are counted apart from the message totals. 9b: a month with designs and no messages (0 / 0.00$) shows the section instead of the empty card.

## Mobile frames
م1 gallery (two columns), م1b filtered, م1c brand empty, م2 empty, م3 loading, م4 error, م5 brand filter sheet, م6 download sheet (PNG, original), م7 download sheet (JPG, social size), م8 downloading + failure toast, م9 load more, م10 drawer with the new item, م11 usage with the designs section, م12 usage designs-only month. Measured in headless Chrome: nothing extends past any 375px frame.

## Checked against DESIGN.md
- [x] `dir="rtl"`, IBM Plex Sans Arabic; `<aside>` first in the flex row (renders right); logical CSS only (grep: no margin/padding/text-align left/right, no letter-spacing, no italics); sample artwork text is Arabic inside SVG
- [x] Western digits; money `1.12$` in `<bdi dir="ltr">`; pixels `1080×1920` and `v2` isolated LTR
- [x] Interactive borders `#7C8799`; status colours from the system (warning chip for «تحقّق من النص» with icon and text); no off-palette UI colours (artwork colours are content)
- [x] 44px targets on buttons, chevron, filter, sheet rows; one primary button per view (download buttons are secondary; the primary is the empty-state action, or «تنزيل» inside the mobile sheet)
- [x] No payments, no export beyond the three formats, no model/provider names, no per-design cost shown in the gallery
- [x] Chevrons: the usage month arrows copy S20 (previous on the right); no new directional icons
- Not checked: Stitch export (none); real thumbnails (blob URLs from `GET /attachments/{id}`); the native `<select>` look on a phone (drawn as a field plus a bottom sheet).

## Deviations and implementation notes
- **Grid, not masonry:** every card has a fixed-height preview well (240px desktop, 174px phone) with the design inside at its true aspect ratio and no cropping. Keeps "newest first" reading order and equal rows; a 9:16 story is simply narrower in its well.
- **Phone download:** no split button; «تنزيل» opens a bottom sheet with type, size and a «تنزيل» button (the sheet needs a confirm because there is no popover). Desktop follows plan decision 6 (one click downloads; the menu only changes the choices).
- Filter: label «العلامة التجارية» plus a select (listbox on desktop, sheet on phone). Options from `GET /me/brand-kits` names; filter uses `brandKitId`.
- Sizes in the menu come from the design's own `width`/`height` (original) and the shape's standard size (1:1 1080×1080, 3:4 1080×1440, 4:3 1440×1080, 9:16 1080×1920, 16:9 1920×1080). Sample originals are made up.
- Format label from `format`: منشور إنستغرام, ستوري إنستغرام, منشور فيسبوك, بانر, صورة منتج; `format: null` (edited upload) shows «تصميم معدَّل». «v2» shown when `version > 1`.
- Usage: section drawn only when `designs[]` is non-empty. The empty-month card (S20) appears only when there are no messages and no designs. Share bars are not used (one agent); if more agents come they list in the same table.
- Shell uses the 280px sidebar from DESIGN.md (S24's board used 260px).
- Tokens: none added. Date format «11 نوفمبر 2026» (Western digits), same as S20 month names.

## New copy (proposed)
تصاميمي، التصاميم التي سلّمها لك «مصمم جرافيك»، الأحدث أولًا.، العلامة التجارية، كل العلامات، فتح المحادثة، تنزيل، خيارات التنزيل، نوع الملف، الحجم، الحجم الأصلي، مقاس منصات التواصل، بكسل، يبقى شكل التصميم كما هو دون قصّ.، يُوضع JPG على خلفية بيضاء.، جارٍ التنزيل…، بدأ تنزيل التصميم.، تعذّر تنزيل التصميم.، تحميل المزيد، جارٍ التحميل…، تعذّر تحميل المزيد. حاول مرة أخرى.، لا توجد تصاميم بعد، اطلب من «مصمم جرافيك» في المحادثة أن يصمّم لك منشورًا أو ستوري أو بانرًا، وستجد تصاميمك هنا.، لا توجد تصاميم لعلامة «…»، لم يسلّم لك «مصمم جرافيك» تصاميم لهذه العلامة بعد. اختر علامة أخرى أو ابدأ تصميمًا جديدًا في المحادثة.، عرض كل العلامات، التحدث مع مصمم جرافيك، تعذّر تحميل تصاميمك. تحقق من الاتصال وحاول مرة أخرى.، التصاميم (قسم استهلاكي)، الوكيل، الطلبات، تُحسب التصاميم بشكل منفصل عن إجمالي الرسائل أعلاه.

## Implementation notes
- Route `/designs`, `useInfiniteQuery` on `GET /me/designs` (cursor), filter in the URL search (`?brand=<brandKitId>`); thumbnails fetched as blobs with the bearer token, aspect-ratio box from `width`/`height` before load. «فتح المحادثة» links to `/chat/$conversationId`.
- Download: blob with the bearer token from `/export?format&size`, saved under the server's filename (`Content-Disposition`); disable the button while pending; errors by code (`DESIGN_NOT_FOUND`) through sonner. Menu choices default to PNG and original per card.
- Entry points use the same condition as «علاماتي التجارية» (plan offers the graphic designer, `GET /agents`).

## Open questions
1. Gallery of a deleted brand kit: the API gives `brandKitId` that may no longer resolve. Proposal: show «علامة محذوفة» as the name (not drawn).
2. Should a click on the preview open the full-screen viewer (S15 pattern)? Not drawn; proposed yes, same viewer.
3. Column label «الطلبات» for runs (alternative: «مرات التصميم»).
4. Should the usage designs section carry a total row once more agents exist? Not needed with one agent.

## Approval (user, 2026-11-11)

Approved with these answers: «تنزيل» downloads with the chosen type and size in one click and a small arrow opens the options (on phones a sheet), as S28 draws it; results on phones in one column; clicking a design in the gallery opens the full-screen image viewer, and a design whose brand was deleted shows «علامة محذوفة»; the usage column is «مرات التصميم», no total row while there is one agent; admin runs show `released` as «لم يكتمل», no sidebar item (reached from the overview and user usage). Backend gaps noted: runs carry no brand, format or conversation link, and no per-design review flag.
