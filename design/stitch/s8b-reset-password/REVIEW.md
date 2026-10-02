# S8b Reset password

- Stitch project: `projects/15605789258921234837`
- Screen id: `9e458069fe9940499867723e2ed7bdc6`
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`), source [design/DESIGN.md](../../DESIGN.md)
- Status: **approved by the user, 2026-10-02** (including the proposed copy)

## Checked

- [x] No sidebar; centered column; monogram + name; no footer
- [x] `dir="rtl"`, Plex Sans Arabic, no italics, no `tracking-*`; password inputs `dir="ltr"`
- [x] Two fields (new + confirm), each with show/hide; «8 أحرف على الأقل» visible before typing; one primary action «حفظ كلمة المرور»
- [x] Link expired state is on [f1-auth-states](../f1-auth-states/)
- [x] No payments, social login, or English UI text

## Fixes

- Stitch put `pe-11` on `dir="ltr"` password inputs, so the dots ran under the eye icon (visible in the original export). Changed to `pe-4 ps-12` in the saved HTML. `desktop.png` is a local render of the fixed HTML (Edge headless), not a Stitch export. The Stitch screen itself still has the overlap.

## Implementation notes

- Inline errors: mismatch «كلمتا المرور غير متطابقتين.» (proposed), too short and `same_password` from F1_AUTH §5.
- Recovery session required; otherwise show the link-expired state.
- Brand name from config; tokens not hex.

## States still to design

Mismatch, same-password, submitting.
