# S19 Admin: user Usage tab, flagged requests, audit log (desktop board + mobile 375px)

- Stitch project: `projects/15605789258921234837`
- Screen ids: **none (hand-built)**. Same method as the approved f4a, S16 and S17 boards: annotated multi-state boards are not what `generate_screen_from_text` produces (one screen per prompt), so no Stitch call was made. Say if you want a Stitch run for any single frame.
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`), source [design/DESIGN.md](../../DESIGN.md). `base.mjs` is a verbatim copy of the head/tokens/icons of `../s16-catalog-sync/base.mjs` (itself from `../f4a-admin/build.mjs`). Regenerate with `node build.mjs && node render.mjs` (Chrome via Playwright; desktop 1440 px, mobile frames 375 px; `render.mjs` also checks that no mobile frame overflows horizontally: all 9 pass).
- Status: **approved by the user, 2026-11-06**, with the recommendations in `docs/plans/DESIGN_DECISIONS_F9_F10.md` (applied in the build, not redrawn). New copy in this file accepted unless that list changes it.
- Spec: `docs/plans/F9_REPORTS.md` §2 (decisions 1-11), slice 3, §4 row S19, §7. Brand from `src/brand/lam7a.ts` («ل», «لمحة AI»).
- Files: `desktop.html` / `desktop.png`, `mobile.html` / `mobile.png`. Titles and dashed boxes are annotations, not UI.

## Desktop frames
| Frame | Content |
|---|---|
| 1a | User detail, new tab «الاستهلاك» (after نظرة عامة / الاشتراك / الرصيد): period picker (7 / 30 / 90 + مخصّصة, range text, «الأيام بتوقيت UTC»), 9 totals (charged, provider cost, margin, requests, flagged, absorbed, input / cached / output tokens), table by mode, table by model (display name + `provider/model` LTR), daily bar chart (first day RIGHT, today LEFT, Y axis RIGHT, series switch, tooltip, «عرض كجدول»), recent requests with «تحميل المزيد» |
| 1b / 1c | loading skeleton; error with «إعادة المحاولة» (picker stays) |
| 1d | custom range with a field error (end before start) |
| 1e | period with no use (zeros) and the negative-margin card |
| 1f | «عرض كجدول» (chart as table) |
| 1g | recent requests: empty and error (totals unaffected) |
| 2a | «الطلبات المُعلَّمة» list: info note («عدّاد للطلبات المُعلَّمة وليس قائمة مهام…»), status chips (مُعلَّمة default / محجوزة / مُسوّاة / مُحرَّرة), table: time, user (link), mode, model, status, source (تقديري / من المزوّد), held, charged, provider cost, absorbed, «تحميل المزيد» |
| 2b / 2c / 2d / 2e | empty «لا توجد طلبات مُعلَّمة»; empty for another status; loading; error + a `reserved` row (nulls as —) |
| 3a | «سجل التدقيق»: filters (action, resource type, resource id, admin id, from, to; free text), rows newest first, one row expanded with old/new as LTR JSON blocks (old on the right) + reason |
| 3b / 3c / 3d / 3e | admin filter validation error (not a UUID); no matches + «مسح الفلاتر»; loading; error + an entry with an empty old value |

## Mobile frames (375px)
M1a totals 2-up cards and by-mode cards; M1b by-model cards, chart (scrolls inside its card for long periods), M1c recent requests cards + «تحميل المزيد»; M1d custom range error / loading / error; M2a flagged cards; M2b empty / loading / error; M3a filters panel; M3b audit cards with one expanded (old above new); M3c empty / error / loading. Tables become cards; chip rows and `pre` blocks scroll inside their own container; no page scroll. The app menu button opens the admin sidebar as in S16 (drawer not redrawn).

## Checklist
- [x] `<aside>` first in the flex row (renders on the right); logical CSS only (grep: no `ml/mr/pl/pr`, `left/right`, `tracking`, italics); IBM Plex Sans Arabic; Western digits; no letter-spacing.
- [x] Money `14.48$` in `<bdi dir="ltr">`; negative margin `−0.42$` (U+2212) in danger colour only when negative; positive margin shows `+`. Emails, ids, `provider/model`, action strings in LTR isolates. JSON in `<pre dir="ltr">` (mono font on code only).
- [x] Chart: first day on the right (8 أكتوبر), today on the left, Y axis on the right, text version («عرض كجدول»), `role="img"` + label; mobile chart is inside a card.
- [x] Status by icon + text; flagged uses the warning tone (not danger); danger only for errors and negative margin.
- [x] 44px controls (chips, buttons, expand toggles); tokens only. Muted text uses on-surface-muted.
- [x] Not shown: add balance, payments, export, "mark reviewed", message content, per-answer cost, provider names on user screens (admin only, allowed).
- Not checked: focus ring (global `:focus-visible` token ring applies), reduced-motion (no animation drawn).

## Proposed copy (new, for approval)
الاستهلاك · آخر 7 أيام / 30 يومًا / 90 يومًا · فترة مخصّصة · الأيام بتوقيت UTC · المحتسب على المستخدم · تكلفة المزوّد · الهامش · طلبات مُعلَّمة · تكلفة متحمَّلة («تجاوزت المبلغ المحجوز ولم تُحتسب عليه») · رموز الإدخال / مخزّنة / الإخراج · حسب الوضع / حسب النموذج · الاستهلاك اليومي · عرض كجدول / عرض كرسم · أحدث طلبات المستخدم («تظهر أحدث الطلبات بغض النظر عن الفترة المختارة») · الطلبات المُعلَّمة · مُعلَّمة / محجوزة / مُسوّاة / مُحرَّرة · تقديري / من المزوّد · المحجوز · لا توجد طلبات مُعلَّمة · لا توجد طلبات بهذه الحالة · لا يوجد استهلاك في هذه الفترة · سجل التدقيق · القيمة السابقة / القيمة الجديدة · لا توجد قيمة سابقة · لا توجد سجلات مطابقة · مسح الفلاتر · الأخطاء «تعذّر تحميل…». The sidebar order (نظرة عامة, الطلبات المُعلَّمة, سجل التدقيق, then the existing items) follows plan §2.5 literally.

## Implementation notes
- `?tab=usage&from=&to=` (or `?days=`) reuses the S18 `PeriodPicker`; the helper line and zod range check are shared. Requests list = `adminReportsChatRequestsInfiniteOptions({ userId })`, not filtered by period until the backend adds `from`/`to`; the screen says so in a sub-line (remove it then).
- `byMode` has only `modeKey` (no label): join `GET /admin/modes` for the label and fall back to the key for a removed mode. `byModel` rows come with `displayName` and `providerCode/providerModelId`.
- Flagged list: `status` is a search param (default `reconciliation_required`). The endpoint returns no total, so the page shows no count (the count is the dashboard card `requestsToReview`). No sidebar badge.
- Per-request money shows 4 decimals (e.g. `0.0042$`), totals 2; confirm `<Money>` kinds. Nulls (`reserved`) show «—».
- Audit: filters in URL; `actorId` must be a UUID (zod) until facets exist; expand toggle is a button with `aria-expanded`; `oldValue`/`newValue` pretty-printed with `JSON.stringify(…, null, 2)` in `<pre dir="ltr">`. Arabic string values inside JSON are data and stay in the LTR block (sample avoids them). Actor: `actorLabel` or `actorEmail`, `actorType` badge, `ShortId` of `actorId`.
- Chart: Recharts `XAxis reversed`, `YAxis orientation="right"`; mobile keeps the card and scrolls inside it for long periods.

## Open questions
1. Flagged page: add an «الكل» chip (omit `status`) or keep the four statuses as listed?
2. Times in tables: local time, while report periods are UTC days. Show «UTC» on times too?
3. Sidebar position of the three new items (top, as in the plan) versus grouping them after الإعدادات.
4. «رموز» as the label for tokens (alternative: «توكنات»).
5. Model names (e.g. GPT-4o) on the sample data are placeholders for the admin-only model table.
