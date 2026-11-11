# S27 Designs in the chat (desktop board + mobile 375px)

- Stitch project: `projects/15605789258921234837`
- Screen ids: **none (hand-built)**, same method as S21 to S26: 39 desktop and 25 phone frames that must match the approved S25 board exactly, so no `generate_screen_from_text` call was made.
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`), source [design/DESIGN.md](../../DESIGN.md).
- Status: **approved 2026-11-11**
- Plan: [docs/plans/F15_DESIGN_CREATION.md](../../../docs/plans/F15_DESIGN_CREATION.md) §2 items 1 to 3 and 5, §3. Contract: API_CONTRACT §11.1 to §11.4.
- Files: `desktop.html` / `desktop.png` (1640px render, 39 frames), `mobile.html` / `mobile.png` (25 frames at 375px). `node build.mjs` then `node render.mjs`. `s25-css.mjs` is the S25 CSS unchanged; `s24-parts.mjs` is the S24 parts unchanged. Board titles and small notes are annotations. Sample data is fictional («مقهى الندى»); posters are neutral SVG placeholders (content, not UI).

## Desktop frames
- أ, ب: whole conversation with sidebar (results; progress). «تصاميمي» added to the sidebar nav (S28 designs it).
- 1 `design_summary`: 1a «أنشئ التصاميم»; 1b balance covers 1 of 2 («رصيدك يكفي لتصميم واحد من 2.» + «أنشئ تصميمًا واحدًا»); 1c 2 of 3 («لتصميمين من 3», «أنشئ تصميمين»; 3 would read «لـ3 تصاميم» / «أنشئ 3 تصاميم»); 1d none (existing warning, «الرصيد», «طلب رصيد», disabled button); 1e sending.
- 2 `progress`: 2a «جارٍ التصميم…» 1 من 2 (bar, one slot ready, one working, «يستغرق هذا عادةً نحو دقيقة.»); 2b 0 من 2; 2c edit «جارٍ تعديل التصميم…» 0 من 1. The dock is a note only («يمكنك مغادرة الصفحة والعودة لاحقًا…»), no input. Spinner and pulse stop under `prefers-reduced-motion`.
- 3 `results`: 3a two posts (design 2 «تحقّق من النص»); 3b two 9:16 stories; 3c two 16:9 banners; 3d edited design with «v2»; 3e nothing came out («لم يُحتسب من رصيدك إلا ما جرى تنفيذه فعلًا.», «حاول مرة أخرى» + «علامة أخرى»); 3f single card. Dock: «تصميم جديد» + «علامة أخرى».
- 4 older results: 4a «تعديل» disabled (`aria-disabled`) with «أكمل الخطوة الحالية أولًا.» under the grid, «تنزيل» still enabled, while the conversation asks the next topic; 4b current results with «تعديل» enabled.
- 5 download menu (popover under the design's «تنزيل»): 5a PNG + «الحجم الأصلي» (1024×1024); 5b JPG + «مقاس منصات التواصل» for a story (1080×1920) with the white-background note; 5c downloading («جارٍ التنزيل…», options disabled); 5d error with «إعادة المحاولة».
- 6 edit a delivered design: 6a `design_edit` «ماذا أغيّر؟»; 6b `edit_summary` («إلغاء» / «عدّله»); 6c not enough balance (disabled «عدّله»); 6d sending. Progress for one design is 2c; results with «v2» is 3d.
- 7 edit an uploaded design: 7a «تعديل تصميم موجود» as sixth format choice; 7b `edit_upload` empty; 7c file chosen (zone disabled at max 1); 7d `edit_changes` none chosen («متابعة» disabled); 7e two selected (fill, thick border, check icon); 7f description only; 7g `edit_product`; 7h `edit_text`; 7i `edit_summary`.
- 8 errors: 8a `AGENT_NOT_READY`; 8b `INSUFFICIENT_BALANCE` with `fitsVariants` 1 (button updates); 8c with 0; 8d `DESIGN_IN_PROGRESS` (note above the still-running progress).

## Phone frames
م1 to م1c create button (all, some, none); م2 progress, م2b DESIGN_IN_PROGRESS; م3 results one column (proposed), م3b swipe row (alternative), م3c stories, م3d banner with v2, م3e empty result; م4 older results; م5 to م5d download bottom sheet (default, JPG + standard, downloading, error); م6 to م6c edit text and edit summary; م7 to م7e «تعديل تصميم موجود», `edit_upload` (choose file + camera), multi-select (selected and empty), upload summary; م8, م8b errors.

## Checked against DESIGN.md
- [x] `dir="rtl"`, IBM Plex Sans Arabic; `<aside>` first in the flex row (sidebar on the right); send arrow mirrored
- [x] grep of both HTML files: no margin/padding left/right, no text-align left/right, no letter-spacing, no italics, no monospace; formats («PNG»), sizes («1080×1920») and `v2` are `<bdi dir="ltr">`
- [x] No prices anywhere; balance notes only. Money appears only as «14.50$» in the header chip. Western digits
- [x] No model or provider names; no payments (link «الرصيد» and «طلب رصيد» only); images private (the board shows no URLs; implementation fetches blobs with the bearer token)
- [x] Interactive borders `#7C8799`; chips selected state uses `pro` tokens plus an icon (not colour alone); 44px targets on all buttons, chips and segments; focus ring on the chip in 7a (as S25)
- [x] Warning text `#B45309` on `#FFFBEB` and `#78350F` notice text, as in the existing tokens; no `#94A3B8` text
- Not checked: Stitch export (none); real image proportions; swipe behaviour.

## Deviations from S25 / DESIGN.md
1. The summary copy «راجع طلب التصميم قبل أن ننشئه.» replaces «قبل حفظه» (no `design_saved` step any more); `design_saved` frames of S25 (3r, م9) are obsolete.
2. Results are a card grid inside the agent message, with the title «تصاميمك جاهزة» in the success colour on a white message (not the green success tint, which would clash with the images).
3. «تنزيل» on a card opens the menu (type, size, «تنزيل»); decision 6 says one click on «تنزيل» downloads with the chosen options, which this follows inside the menu. The card button carries a chevron to show it opens a menu.
4. Sidebar gains «تصاميمي» (plan §3 decision 5).

## Implementation notes
- Poll messages every 2 s only while the newest agent message is `progress` and the tab is visible. Progress `done` / `total` use `<bdi dir="ltr">`; `role="status"` and `aria-live="polite"` on the progress message; the bar has `role="progressbar"`.
- Grid: square 300px, story 214px (9:16), banner full width (16:9), each with its own aspect ratio from `width` / `height`; blob URLs from `GET /attachments/{id}`; revoke on unmount. Phone: one column (stories 230px), or the swipe row.
- Edit button: enabled only on the newest `results` message while the conversation is at `design_results`; otherwise `aria-disabled="true"` plus the line «أكمل الخطوة الحالية أولًا.». Tab order and the accessible name «تعديل التصميم n».
- Download: `GET /me/designs/{outputId}/export?format&size`; size labels show px: original from `width`×`height` of the design, standard by shape (1:1 1080×1080, 3:4 1080×1440, 4:3 1440×1080, 9:16 1080×1920, 16:9 1920×1080). The «تنزيل» button shows a spinner while the blob is fetched; saved under the server's filename; errors by code. Phone uses a bottom sheet (focus trap, close button).
- Multi-select chips: `role="checkbox"` with `aria-checked`; answer `{ choices: [...], text? }`; «متابعة» enabled with at least one choice or text.
- Counts: «تصميم واحد» / «تصميمين» / «لـ3 تصاميم» in the note; buttons «أنشئ تصميمًا واحدًا» / «أنشئ تصميمين» / «أنشئ 3 تصاميم».

## Open questions
1. Download card: menu opens from «تنزيل» (as drawn), or should the card have a quick «تنزيل» plus a separate options chevron? (Decision 6 wording.)
2. Phone results: one column (م3, proposed) or the swipe row (م3b)?
3. `design_edit` max length: drawn 500 (the contract gives none).
4. The user bubble for «تعديل» (drawn «تعديل التصميم 1») and for «أنشئ التصاميم» comes from the server's `content`; confirm the text.
5. The «يستغرق هذا عادةً نحو دقيقة.» line and the AGENT_NOT_READY copy are invented.

## Approval (user, 2026-11-11)

Approved with these answers: «تنزيل» downloads with the chosen type and size in one click and a small arrow opens the options (on phones a sheet), as S28 draws it; results on phones in one column; clicking a design in the gallery opens the full-screen image viewer, and a design whose brand was deleted shows «علامة محذوفة»; the usage column is «مرات التصميم», no total row while there is one agent; admin runs show `released` as «لم يكتمل», no sidebar item (reached from the overview and user usage). Backend gaps noted: runs carry no brand, format or conversation link, and no per-design review flag.
