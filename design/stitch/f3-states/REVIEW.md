# F3 states board (desktop)

- Stitch project: `projects/15605789258921234837`
- Screen id: **none (hand-built)**; Stitch generation not used (timeouts on recent screens)
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`)
- Status: **approved by the user, 2026-10-04** (including the proposed copy; «الرصيد المضمّن» replaced by «الرصيد الحالي»)
- Spec: `docs/plans/F3_BALANCE_ACCOUNT.md`

## Checklist
- [x] `dir="rtl"`, IBM Plex Sans Arabic, sidebar first in DOM (renders right), logical classes only, no tracking/italics
- [x] Tokens/hex from DESIGN.md only; Western digits; money in `<bdi dir="ltr">` as `14.48$`
- [x] No payment/add-balance UI, no model/provider names; touch targets >= 44px

## Cards
1. Balance loading skeleton (card + 2 activity rows, `aria-busy`)
2. Activity empty
3. Activity error with retry; load-more error with retry (inline at list end)
4. Balance card, no-plan variant (warning container + «تواصل معنا»; reuses the DESIGN.md notice copy)
5. Account save success toast-style banner, save failure, field error (name required)
6. Plans empty, plans error with retry

## New copy for approval
«لا توجد عمليات بعد» (from the plan) · «ستظهر هنا عمليات رصيدك واستخدامك عند حدوثها.» · «تعذّر تحميل سجل العمليات. تحقق من اتصالك ثم حاول مرة أخرى.» · «تعذّر تحميل المزيد من العمليات.» · «إعادة المحاولة» · «تم حفظ التغييرات.» · «تعذّر حفظ التغييرات. حاول مرة أخرى.» · «الاسم مطلوب.» · «لا توجد باقات متاحة حاليًا» (from the plan) · «تواصل معنا لمعرفة الخيارات المتاحة.» · «تعذّر تحميل الباقات. حاول مرة أخرى.»

## Notes
Success is a sonner toast in production (shown inline here); field errors come from `details`. Preserve form input on failure.
