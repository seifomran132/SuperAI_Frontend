# S8a Forgot password

- Stitch project: `projects/15605789258921234837`
- Screen id: `05a19fbf1c7f439c8519d244516ce29c`
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`), source [design/DESIGN.md](../../DESIGN.md)
- Status: **approved by the user, 2026-10-02** (including the proposed copy)

## Checked

- [x] No sidebar; centered column; monogram + name; no footer
- [x] `dir="rtl"`, Plex Sans Arabic, no italics, no `tracking-*`; email input `dir="ltr"`
- [x] One field, one primary action «إرسال رابط إعادة التعيين», text link «العودة لتسجيل الدخول» with the arrow mirrored
- [x] Always continues to S7 (reset variant); copy never says whether the account exists
- [x] No payments, social login, or English UI text (except the placeholder)

## Fixes (saved HTML only)

- Placeholder `#8B95A7` -> `#64748B`; focus ring `#1E293B` -> `#4F46E5`. `desktop.png` is the original Stitch export, so the placeholder looks slightly lighter in the image than in the HTML.
- Subtitle is 14px here versus 16px on the other pages. Use 16px (body-md) in code.

## Implementation notes

- Brand name from config; tokens not hex; inline error and rate-limit copy from F1_AUTH §5.

## States still to design

Submitting; invalid email error; rate limited (board copy).
