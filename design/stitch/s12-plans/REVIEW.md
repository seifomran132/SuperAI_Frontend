# S12 Plans (public, desktop)

- Stitch project: `projects/15605789258921234837`
- Screen id: **none (hand-built)**; Stitch generation not used (timeouts on recent screens)
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`)
- Status: **approved by the user, 2026-10-04** (including the proposed copy; «الرصيد المضمّن» replaced by «الرصيد الحالي»)
- Spec: `docs/plans/F3_BALANCE_ACCOUNT.md`

## Checklist
- [x] `dir="rtl"`, IBM Plex Sans Arabic, sidebar first in DOM (renders right), logical classes only, no tracking/italics
- [x] Tokens/hex from DESIGN.md only; Western digits; money in `<bdi dir="ltr">` as `14.48$`
- [x] No payment/add-balance UI, no model/provider names; touch targets >= 44px

## Contents
Auth-style public header (monogram, «تسجيل الدخول», «إنشاء حساب»), three cards: the real free plan «الباقة المجانية» (مجاني) and two bracketed placeholders ([اسم الباقة], [00.00$], [وصف مختصر للباقة]). The middle card carries «باقتك الحالية» (check icon + text, 2px brand border) to show the signed-in marking. Modes with their one-line descriptions, «تواصل معنا للاشتراك» on each card (opens S14, no checkout).

**Signed-in version:** same cards inside the app shell (sidebar right + header, as S10/S11) instead of the public header; the sign-in/sign-up links are dropped.

## New copy for approval
«الباقات» · «رصيد واحد مشترك لجميع الأوضاع، وتُحتسب تكلفة كل رد حسب الوضع والاستخدام الفعلي. الاشتراك وإضافة الرصيد عن طريق فريقنا.» · «الرصيد المضمّن:» · «/ شهريًا» · «مدة الباقة شهر واحد من التفعيل، وينتهي الرصيد بانتهائها.» · «باقتك الحالية» · «تواصل معنا للاشتراك»

## Implementation notes
Prerendered when signed out; do not read the session during render. Grid is 3 columns, 1 on mobile. The «مجاني» card still shows included balance as a placeholder.
