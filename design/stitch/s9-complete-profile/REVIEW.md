# S9 Complete profile

- Stitch project: `projects/15605789258921234837`
- Screen id (desktop): `a5e3767b27e144b8bc5d332c81b419cc` (the stored prompt text is a leftover footer-removal edit, but the content is the Complete profile page)
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`), source [design/DESIGN.md](../../DESIGN.md)
- Status: **approved by the user, 2026-10-02** (including the proposed copy)

## Checked

- [x] No sidebar; centered column; monogram + name; no footer
- [x] `dir="rtl"`, Plex Sans Arabic, no italics, no `tracking-*`
- [x] Title «أكمل ملفك», subtitle «أكمل ملفك قبل بدء المحادثة.»
- [x] الاسم الكامل (required, RTL input)
- [x] رقم الجوال with the tag «اختياري», `dir="ltr"` input, `autocomplete="tel"`, placeholder and hint `+966 50 123 4567` (hint number in `<bdi dir="ltr">`)
- [x] One primary action «متابعة»; no skip link; no payments or social login

## Mobile (390px)

`mobile.html` is the desktop HTML with responsive card padding; `mobile.png` is a local 390px render (Stitch mobile generation timed out).

## Implementation notes

- `PATCH /me { fullName, phoneNumber }`; highlight the field from `VALIDATION_FAILED.details`. The backend normalises spaces and dashes, so show what the user typed.
- Brand name from config; tokens not hex.

## States still to design

Submitting; empty-name error; invalid-phone error (server `details`).
