# S6 Sign up

- Stitch project: `projects/15605789258921234837`
- Screen id (desktop): `e226e119037440009cfb7062fb2a7b77`
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`), source [design/DESIGN.md](../../DESIGN.md)
- Status: **approved by the user, 2026-10-02** (including the proposed copy)

## Checked

- [x] No sidebar; centered column max 440px; monogram + name above the card
- [x] `dir="rtl"`, IBM Plex Sans Arabic, Western digits, no italics, no `tracking-*`
- [x] Fields: الاسم الكامل, البريد الإلكتروني (LTR), كلمة المرور (LTR, show/hide) with «8 أحرف على الأقل» visible before typing
- [x] **No terms checkbox**, no phone field; «لديك حساب بالفعل؟ تسجيل الدخول»
- [x] One primary action «إنشاء حساب»; no payments, social login, or English UI text

## Fixes

1. Stitch added a footer (الشروط والأحكام · سياسة الخصوصية · المساعدة والدعم and «© 2025 بيان (Bayan)»). It is out of scope (no legal pages yet, brand name hard-coded). An `edit_screens` call to remove it timed out and the export did not change, so the footer was removed from the saved HTML and the body re-centered. **The Stitch canvas may still show the footer.** `desktop.png` is a local render of the corrected HTML (Edge headless), not a Stitch export.
2. The password input had `pe-12` on a `dir="ltr"` input while the toggle sits at the left, so padding was on the wrong side. Changed to `ps-12 pe-4`.

## Mobile (390px)

`mobile.html` is the desktop HTML (already responsive, `sm:p-9`); `mobile.png` is a local 390px render. A Stitch mobile screen was generated with Flash-Lite (`9bdab03fc1a346a8b149f626cec5596f`) but rejected: title centered instead of start-aligned, `text-right` on LTR inputs, `left-3`/`pl-12`/`ml-1`, a 32px toggle, a `#c5c6cd` placeholder, link outside the card. Its files were not kept.

## Implementation notes

- Brand name from brand config; tokens not hex; toggle `aria-label` switches text.
- Field error copy on the board (empty name, invalid email, short password) is a proposal and is not in F1_AUTH.md §5. GoTrue `weak_password` uses the §5 text.
- Success always goes to S7, even for an existing email (GoTrue does not reveal duplicates).

## States still to design

Submitting. Field errors and weak password are on [f1-auth-states](../f1-auth-states/).
