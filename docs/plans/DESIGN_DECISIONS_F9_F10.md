# Design decisions — S18–S22 (F9 reports, F10 vouchers)

Approved by the user on 2026-11-06 ("continue" after the list below, which was offered as "approve all with your recommendations"). The boards are not redrawn: builders apply these on top of each board's REVIEW.md.

| # | Screen | Decision |
|---|---|---|
| 1 | S18, S19 | Admin sidebar order: «نظرة عامة» first; then the existing items, with «الأكواد» after «الباقات»; «الطلبات المُعلَّمة» and «سجل التدقيق» last, after «الإعدادات». No badges on the new items. |
| 2 | S18 | Chart: provider cost uses a lighter second colour than charged (token, not hex), so the two series differ by lightness too. |
| 3 | S18 | Show margin % next to the margin amount (computed with `src/lib/money.ts`; hidden when charged is zero). |
| 4 | S18–S20 | On phone widths, a chart that scrolls inside its card opens scrolled to **today** (the left end). |
| 5 | S18, S19 | Date fields always show Western digits; check the native date input in an Arabic locale and fall back to a text field with a `YYYY-MM-DD` mask if it shows other digits. |
| 6 | S18 | Plans card: keep the total of active plans, with the per-plan list under it. |
| 7 | S19 | Flagged requests page gets an «الكل» chip (no `status`); it still opens on «مُعلَّمة». |
| 8 | S19 | Times in tables are local; «الأيام بتوقيت UTC» appears only with the period picker. |
| 9 | S19 | Tokens are «توكنات». |
| 10 | S20 | No «استهلاكي» in the chat sidebar; entry points are the balance page link and the account menu. |
| 11 | S20 | The amount label is «المبلغ المخصوم». |
| 12 | S21 | Rate limit on redeem shows «أدخلت أكواد خاطئة كثيرة. انتظر قليلًا ثم حاول مرة أخرى.» (redeem only; the `RATE_LIMITED` catalog text for chat is unchanged). |
| 13 | S21 | Keep the extra line in the needs-a-plan notice: «هذا الكود يضيف رصيدًا، والرصيد يحتاج إلى باقة نشطة.» |
| 14 | S21 | On `/plans`, the needs-a-plan notice hides «عرض الباقات». |
| 15 | S21 | Activity label for `voucher_credit` becomes «رصيد كود» (was «رصيد قسيمة»). |
| 16 | S22 | List filter is «مفعّل / موقوف» (`isActive`); the row badge still shows منتهي / لم يبدأ / مستنفد. |
| 17 | S22 | Only one way to stop a code: the header button «إيقاف الكود» / «تفعيل الكود»; no active toggle in the edit form. The badge shows the state. |
| 18 | S22 | After create: the result view with the code and copy button (not the detail page with a banner). |

Also from the boards: Arabic plural rules for day counts (S22); an empty current month in S20 offers «محادثة جديدة», a past empty month no action.
