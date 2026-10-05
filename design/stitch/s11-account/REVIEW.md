# S11 Account and plan (desktop)

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
Two columns (profile + session on the right, plan + password on the left). Profile: name, phone (optional, LTR), email read-only with lock icon, «حفظ». Plan: name, description, «مجاني» price, start/end dates, mode chips (from /modes), expiry sentence, «تواصل معنا» (opens S14) and «عرض الباقات» link (chevron mirrored). Password: new + confirm, «8 أحرف على الأقل» as in S8b. «تسجيل الخروج» is secondary (not destructive, no confirmation, as in the account menu).

## New copy for approval
«الملف الشخصي» · «(اختياري)» · «لا يمكن تغيير البريد الإلكتروني من هنا.» · «الباقة» · «تاريخ البدء» / «تاريخ الانتهاء» · «الأوضاع المتاحة» · «ينتهي رصيدك بانتهاء الباقة. لتغيير الباقة أو تجديدها تواصل معنا.» · «عرض الباقات» · «تغيير كلمة المرور» · «حفظ كلمة المرور» · «الجلسة» · «سجّل خروجك من هذا الجهاز.»

## Implementation notes
- Plan card shows the price as «مجاني» only when 0; otherwise a placeholder price (no in-app payment). No-plan variant is in f3-states.
- On mobile the columns stack (see f3-mobile). Email input is readonly, `dir="ltr"`, lock icon on the start (right) side so it does not overlap the LTR text.
