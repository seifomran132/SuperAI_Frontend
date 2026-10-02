# S5 Sign in

- Stitch project: `projects/15605789258921234837`
- Screen id: **not recoverable** (see Provenance). Folder holds desktop.html, desktop.png, mobile.html, mobile.png.
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`), source [design/DESIGN.md](../../DESIGN.md)
- Status: **approved by the user, 2026-10-02** (including the proposed copy)

## Provenance

This screen came from an interrupted earlier run. `list_screens` and `get_project` do not return it (both are stale and return an inconsistent subset of the project's screens), so its Stitch id could not be found. The saved HTML and PNG were reviewed and kept. Look in Stitch for a screen titled «تسجيل الدخول - بيان». It is the structural template for all other auth pages.

## Checked

- [x] No sidebar; centered column max 440px; monogram «ب» + «بيان» above the card
- [x] `dir="rtl"`, IBM Plex Sans Arabic, Western digits, no italics, no `tracking-*` on Arabic
- [x] Email and password inputs `dir="ltr"`, labels above
- [x] Title «تسجيل الدخول», subtitle «مرحبًا بعودتك. أدخل بياناتك للمتابعة.», «نسيت كلمة المرور؟» on the password label row, «إنشاء حساب» link
- [x] One primary action; show/hide toggle (44px)
- [x] Contrast: subtitle `#475569`, placeholders `#64748B`, focus ring `#4F46E5`
- [x] No payments, social login, phone sign-in, footer, or English UI text (except the email placeholder)
- The rule «8 أحرف على الأقل» is intentionally not on sign-in (it appears on sign-up and reset)

## Fixes applied to the saved HTML

- Toggle `left-0` -> `end-0`, `rounded-s` -> `rounded-e`; inputs `text-left` -> `text-start`; removed `tracking-normal`; card padding responsive (`p-6 sm:p-[36px]`).

## Mobile (390px)

`mobile.html` is the same responsive HTML as desktop; `mobile.png` is a local render at 390px (Edge headless). Stitch mobile generation timed out repeatedly, so there is no Stitch mobile screen for S5.

## Implementation notes

- Brand name and monogram come from brand config (`{{brandName}}`), never hard-coded in components.
- Tokens, not hex (`bg-brand`, `border-border-control`, `text-danger`). The Stitch HTML uses Tailwind CDN hex values as a prototype only.
- Password toggle sits at `end-0` inside a `dir="ltr"` input, so the input needs `ps-12` (left padding). `aria-label` switches between «إظهار كلمة المرور» and «إخفاء كلمة المرور».
- Error alert goes above the fields (`role="alert"`); see the states board. Keep typed values on recoverable errors.

## States still to design

Submitting (disabled button + spinner). All other states are on [f1-auth-states](../f1-auth-states/).
