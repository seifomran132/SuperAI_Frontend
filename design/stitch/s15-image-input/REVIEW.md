# S15 Image input in the chat composer (desktop board + mobile 375px)

- Stitch project: `projects/15605789258921234837`
- Screen ids: **none (hand-built)**. The Stitch MCP failed on every call in this session ("Incompatible auth server: does not support dynamic client registration"), so no Stitch screen could be generated. Same hand-built route as S3 and F2 states.
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`), source [design/DESIGN.md](../../DESIGN.md). Markup reuses the head, tokens, composer, notice, mode-menu and message markup of S1, S3, f2-chat-states and f2-menus.
- Status: **approved by the user, 2026-10-11** (including the proposed copy, card 18 and the opaque viewer scrim; hand-built boards accepted, no Stitch regeneration needed)
- Files: `desktop.html` / `desktop.png` (board, 1560px render, Chrome headless), `mobile.html` / `mobile.png` (10 frames at 375x812). The sample picture is a neutral SVG placeholder. Board titles and the small English code labels are annotations, not UI.

## Desktop board

1. Chat workspace with the composer idle: attach button + mode chip at the start (right), send at the end. Helper text kept. Sent message shows image above text.
2. Attached and ready (thumbnail, remove, send enabled).
3. Drag-over: dashed drop zone over the chat area.
4. Full-screen viewer (dark overlay, close button with focus ring).
5. Uploading (ring + bar + percentage, send disabled, text stays editable)
6. Ready (text empty, send enabled)
7. Too large (remove only, no retry)
8. Wrong type (remove only)
9. Network failure (retry + remove)
10. Second image attempt (first image stays; amber notice)
11. Mode can't read images (amber notice above composer, image stays, send disabled)
12. Mode menu with «يقرأ الصور» badge (icon + text) on image-capable modes; text-only mode selectable
13. Sent message, image + text
14. Image-only message
15. History loading placeholder at the stored aspect ratio (4:3 shown)
16. History failed to load: «تعذّر تحميل الصورة» + retry
17. Conversation list row «صورة» (active)
18. No attach button when no mode on the plan reads images (approved, see below). Caption on the board «لا يوجد وضع يقرأ الصور في الباقة» is an annotation, not UI.

## Mobile frames (375px)

1 idle with attach, 2 uploading, 3 ready, 4 wrong type, 5 network error, 6 mode notice, 7 mode menu, 8 image-only + loading placeholder, 9 failed to load, 10 viewer. Helper text hidden on mobile as in S3. Drag-over is desktop only.

## Checked

- [x] RTL, sidebar first in the flex row (renders on the right), logical classes (`start-/end-/ps-/border-e`), Plex Sans Arabic, Western digits, no letter-spacing/italics
- [x] Attach button: icon-only, `aria-label="إرفاق صورة"`, 44x44, lucide `image-plus` not mirrored; send arrow still mirrored
- [x] Remove button: `aria-label="إزالة الصورة"`, 44x44 hit area around a 24px badge on the thumbnail corner
- [x] Viewer close: `aria-label="إغلاق"`, 44x44, visible white focus ring
- [x] Status = icon + text + color (danger `#BE123C`/`#FFF1F2`, warning `#B45309`/`#FFFBEB`, success `#15803D`)
- [x] Notice style identical to f2 (`role="alert"` warning container)
- [x] No model/provider names, no payments, no extra file types, no resize UI, no mode auto-switch
- [x] Thumbnail 72px, radius 12px (`rounded-xl`); bubble image max height 240px, radius 12px inside a 16px bubble
- [x] Money `<bdi dir="ltr">`
- Not checked: Stitch export (none). Contrast of the disabled send (opacity .4) is exempt as a disabled control.

## Copy

Given in the brief: «إرفاق صورة», «أفلت الصورة هنا», «إزالة الصورة», «إعادة المحاولة», «حجم الصورة أكبر من 5 ميغابايت.» (File too large), «هذا النوع من الملفات غير مدعوم. أرسل صورة JPG أو PNG أو WebP.» (Unsupported type), «تعذّر رفع الصورة. حاول مرة أخرى.» (Upload failed), «يمكنك إرفاق صورة واحدة فقط في كل رسالة.» (One image per message), «هذا الوضع لا يقرأ الصور. اختر وضعًا آخر لإرسال الصورة.» (Mode can't read images), «يقرأ الصور» (Reads images), «تعذّر تحميل الصورة» (Image failed to load), «إغلاق» (Close), «صورة» (Image, conversation title).

**Proposed copy (approved 2026-10-11):**
- «جاري رفع الصورة…» (Uploading the image…), also the progress aria-label
- «تم رفع الصورة» (Image uploaded), next to the ready thumbnail
- «صورة JPG أو PNG أو WebP، حتى 5 ميغابايت.» (drop zone sub-line)
- «عرض الصورة» (View image) as aria-label of the clickable bubble image
- «جاري تحميل الصورة» (Loading the image) as aria-label of the history skeleton
- Sample prompt «ما الموجود في هذه الصورة؟» and sample answer are placeholders, not UI copy.

## Implementation notes

- Retry is shown only for network/5xx. Too large and wrong type have no retry (it can't succeed); remove is the action. Use `errors:` catalog text by code where one exists.
- Client checks run before upload; the error appears on the tile in place of the thumbnail.
- Send disabled while uploading, on upload error, and when the mode has `supportsImages: false`. The notice appears as soon as the mode can't read the image and clears when the mode changes. The draft text and the image stay.
- Mode menu badge uses `supportsImages` from `GET /modes`; mode colors still by position.
- Progress ring is `role="progressbar"`; announce start and finish only, not every percent.
- Viewer (updated): fully opaque scrim `#0F172A` (viewer-scrim, proposed; nothing from the chat is readable behind it), image fitted to the width and centred vertically (`object-contain`), close button at the top end corner (left in RTL, 44px, same on desktop and mobile), focus trapped, Escape closes, focus returns to the bubble image.
- History image: placeholder sized from stored width/height with `aspect-ratio`, max height 240px; blob URL revoked on unmount.
- Pasting an image uses the same flow as the picker and the drop.
- Update DESIGN.md §Message box ("No attachments") when this is approved.

## Resolved (2026-10-11)

1. Hand-built boards are accepted; no Stitch screens are required.
2. The viewer uses a fully opaque scrim. Add a `viewer-scrim` token (slate-900 `#0F172A`) to `src/styles/app.css` and DESIGN.md when building.
3. The mode menu marks are only an example; real flags come from `supportsImages` in the API.

## Decision (approved 2026-10-11)

- When no mode on the user's plan has `supportsImages`, the attach button is hidden (card 18). No notice is shown, and dropping or pasting an image is ignored. If at least one mode can read images, the button is shown as designed and the mode notice handles text-only modes.
