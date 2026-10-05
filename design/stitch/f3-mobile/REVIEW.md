# F3 mobile: S10 and S11 (390px)

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
Two 390x844 frames side by side. Header: menu button on the right (opens the drawer), title, balance chip. S10: full-width «طلب رصيد», compact activity rows (balance-after shown without the label to save width). S11: stacked cards; password card and «تسجيل الخروج» continue below the fold (scroll).

## Notes
Frames are cropped to the first viewport; password and session sections are not drawn on mobile but follow the desktop order.
