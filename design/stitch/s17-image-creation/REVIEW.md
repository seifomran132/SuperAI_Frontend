# S17 Image creation (desktop board + mobile 375px)

- Stitch project: `projects/15605789258921234837`
- Screen ids: **none (hand-built)**. The Stitch MCP answered `get_project` in this session, but it generates one screen per prompt, not annotated multi-state boards; the approved S3, F2 and S15 boards were hand-built the same way, so this board follows them (no `generate_screen_from_text` call was made). Say if you want a Stitch run for any single frame.
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`), source [design/DESIGN.md](../../DESIGN.md). Markup reuses the head, tokens, sidebar, composer, mode menu, message cards, error card and viewer of S1, S3, f2-chat-states, f2-menus and S15.
- Status: **approved by the user, 2026-10-27**, with the recommendations: (1) add `mode-3` and `mode-4` tokens (mode colours by position; image modes are marked by the image icon + «صورة», not by colour); (2) show «أرفق صورة لتعديلها» in every image mode (image modes always have `supportsImages`); (3) lam7a brand values (monogram «ل», «لمحة AI»). Proposed copy accepted. Hand-built board accepted.
- Files: `desktop.html` / `desktop.png` (1560px render, Chrome headless), `mobile.html` / `mobile.png` (7 frames at 375x812). Sample image is a neutral SVG placeholder. Board titles and small notes are annotations, not UI.
- Brand values (monogram «ل», «لمحة AI») come from `src/brand/lam7a.ts`; the build must read them from the brand config. The mode name «تصميم» is an example; real labels come from `GET /modes`.

## Desktop board

1. Mode menu: image mode «تصميم» with a dark «صورة» badge (palette icon + text) next to the «يقرأ الصور» badge; text modes unchanged.
2. Composer in an image mode, ratio menu open: «تلقائي» (selected, default), «مربع 1:1», «عمودي 3:4», «أفقي 4:3», «طولي 9:16», «عريض 16:9», ratio glyph per row, 44px rows, `role="menuitemradio"`. 2b: closed chip showing the chosen ratio (glyph + `16:9`).
3. Answer while creating: streamed text + caret, 16:9 shimmer placeholder with «جارٍ إنشاء الصورة…» (`role="status"`, shimmer off under reduced motion), Stop in the composer, ratio chip disabled.
4. Answer with the image at column width, «فتح بالحجم الكامل» and «تنزيل» (44px, visible label + aria-label), footer «نسخ» only. 4b: viewer on the opaque `viewer-scrim`, close at the top end corner (left), download added beside it.
5. Blocked: CONTENT_BLOCKED catalog text «تعذّر إكمال الرد بسبب سياسة المحتوى. جرّب صياغة مختلفة.» in the f2 error card with «إعادة المحاولة».
6. Empty state: «صِف الصورة التي تريدها», hint «أرفق صورة لتعديلها», four chips.
7. Text-only answer from an image mode.
8. Stopped after the image: image kept, «توقف الرد قبل اكتماله» note.

## Mobile frames (375px)

2 ratio menu open, 2b closed chip, 3 creating, 4 image + actions, 4b viewer, 6 empty state, 5 blocked. Helper text hidden as in S3. The ratio menu opens toward the screen center (anchored to the chip's end edge) so it stays inside 375px.

## Checked

- [x] RTL, `<aside>` first in the flex row (right), logical classes only, Plex Sans Arabic, Western digits, no letter-spacing/italics; ratios in `<bdi dir="ltr">`
- [x] No price, cost or estimate anywhere (per-answer cost stays hidden); no provider/model names; no payments
- [x] Icon-only controls have aria-labels; touch targets 44px; focus ring visible on viewer close
- [x] Tokens only (neutral/brand/danger/viewer-scrim); no off-palette colors
- [x] Out of scope kept out: no edit/reuse button on created images, no gallery, no multi-image
- Not checked: Stitch export (none); disabled chip/send contrast (disabled controls).

## Proposed copy (new, for approval)

| Arabic | English | Where |
|---|---|---|
| صورة | Image | mode badge (given in the brief) |
| نسبة الصورة | Image ratio | ratio menu and chip aria-label |
| تلقائي / مربع 1:1 / عمودي 3:4 / أفقي 4:3 / طولي 9:16 / عريض 16:9 | Auto / Square / Portrait / Landscape / Tall / Wide | menu options (given) |
| جارٍ إنشاء الصورة… | Creating the image… | placeholder (given) |
| فتح بالحجم الكامل | Open full size | action (given) |
| تنزيل | Download | action, viewer (given) |
| صِف الصورة التي تريدها | Describe the image you want | empty headline (given) |
| أرفق صورة لتعديلها | Attach an image to edit it | empty hint (given) |
| ينشئ صورًا من وصفك. | Creates images from your description. | example mode description (comes from the API) |
| غروب هادئ على البحر | Calm sunset over the sea | sample alt text only; real alt: «صورة أنشأها المساعد» (proposal) |

Note: the «3:4 عمودي» and «9:16 طولي» names are both vertical shapes as given in the brief; the board keeps them as written.

## Implementation notes

- Chip and menu only when `generatesImages`; stored per conversation; «تلقائي» sends no `imageOptions`.
- Placeholder ratio = chosen ratio, else 1:1 for auto until the `image` event gives width/height; then swap with no layout jump.
- Download: fetch `?download=1` with the bearer token, save the blob; show a toast on failure (retry via the same button).
- Viewer reuses `ImageViewer` plus a download button; focus returns to the opener.
- Created images have no attach button (404 ATTACHMENT_NOT_FOUND).
- Update DESIGN.md (mode picker, message box, image section) once approved.

## Open questions

1. **Mode color:** the palette defines only mode-1 and mode-2. The image mode (position 3 here) uses neutral slate on the board. Add a `mode-3` token, or keep image modes neutral?
2. The empty-state hint is shown with the attach icon; confirm it should appear only when the plan has an image-reading mode (otherwise the attach button is hidden per S15).
3. Frame 8 keeps the image at max 560px for compactness; real cards use column width as in frame 4.
