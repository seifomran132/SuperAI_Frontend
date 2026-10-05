# S10 Balance and activity (desktop)

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
Balance card (14.48$, «طلب رصيد» opens S14), plan line with expiry sentence, activity list with all 7 types from the plan table. Credits: + in success green on a green icon disc; debits: − in ink on a neutral disc (sign and label carry meaning, not colour). Each row: label, date/time, signed amount, «الرصيد بعد العملية».

## New copy for approval
«الرصيد المتاح» · «تُحتسب تكلفة كل رد من هذا الرصيد حسب الوضع المستخدم.» · «باقتك:» · «سجل العمليات» · «الرصيد بعد العملية» · «اليوم/أمس HH:mm», older as «2 أكتوبر 2026 · 18:30». Plan name is the placeholder [اسم الباقة]. Sample activity numbers are approximate.

## Implementation notes
- Minus is U+2212 inside the same bdi as the amount; the Money component needs a signed variant.
- Rows use `<ul>`; load older on scroll (`before` cursor) with a sentinel; states are in f3-states.
- Header chip, sidebar item «الرصيد» active (aria-current).
