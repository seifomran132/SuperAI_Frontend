# S20 My usage - استهلاكي (desktop board + mobile 375px)

- Stitch project: `projects/15605789258921234837`
- Screen ids: **none (hand-built)**. Same method as the approved S10, S15 and S17 boards: annotated multi-state boards in the app shell, not a `generate_screen_from_text` run (Stitch makes one screen per prompt). Say if you want a Stitch run for any single frame.
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`), source [design/DESIGN.md](../../DESIGN.md). Shell, header chip, balance page and account menu reuse S10, S1 and f2-menus markup. Brand «ل» / «لمحة AI» from `src/brand/lam7a.ts`.
- Status: **approved by the user, 2026-11-06**, with the recommendations in `docs/plans/DESIGN_DECISIONS_F9_F10.md` (applied in the build, not redrawn). New copy in this file accepted unless that list changes it.
- Spec: `docs/plans/F9_REPORTS.md` (decisions 1, 2, 6, 7, 8, 11; slice 4; §4 row S20). Data shape: `MyUsageDto` (`GET /me/usage?month=YYYY-MM`).
- Files: `desktop.html` / `desktop.png` (1560px board, 10 frames), `mobile.html` / `mobile.png` (10 frames at 375px). Board titles and notes are annotations, not UI. Sample numbers are made up (November 2026 is consistent: 49 messages, 3.59$; October is computed from its daily data). "Today" is 6 Nov 2026.

## Desktop frames
1. Page, current month: title «استهلاكي» in the shell header; month picker (previous / month button / next), totals «الرسائل» and «المبلغ المحسوم», «حسب الوضع», daily chart «الاستهلاك اليومي» with series switch «المبلغ | الرسائل». First day on the right, today («اليوم») on the left, Y axis on the right, Arabic tooltip (date, المبلغ, الرسائل) on day 3. Current month stops at today.
2. Month picker open on أكتوبر 2026 (31 days, series «الرسائل», labels thinned to 1, 5, 10…). List runs from the account creation month (أغسطس 2026) to the current month, no future months; «next» disabled on the current month, «previous» on the first month.
3. «عرض كجدول» (table replaces the chart, button becomes «عرض كرسم بياني»); 3b with 31 days: table scrolls inside the card, sticky header.
4. Month with no use (أغسطس 2026): zeros (`0`, `0.00$`) and one friendly empty card with the single action «العودة إلى هذا الشهر».
5. Removed mode: `labelAr: null` shows «وضع محذوف» in muted text with a neutral dot and bar (no mode colour), kept in charged order.
6. Loading skeletons (`aria-busy`, role status); picker stays visible.
7. Error with «إعادة المحاولة» (danger container, same card as f3-states); selected month kept.
8. Entry point: link «عرض الاستهلاك» (chart icon + arrow pointing to the left) beside «سجل العمليات» on the S10 balance page.
9. Entry point: new item «استهلاكي» in the account menu between «الرصيد» and «الحساب».

## Mobile frames (375px)
1 current month, 2 October (31 bars: the chart scrolls inside its card, Y axis stays fixed on the right), 3 picker open, 4 table, 5 no use, 6 removed mode, 7 loading, 8 error, 9 balance page with the link, 10 drawer with the new item «استهلاكي». Measured in headless Chrome: no element extends past the 375px frame outside the chart's own scroll area (no page horizontal scroll). The by-mode rows stack (label + charged, share bar, «الرسائل: n»).

## Checked
- [x] `dir="rtl"`, IBM Plex Sans Arabic, `<aside>` first in the flex row (renders right), no `ml-/mr-/pl-/pr-/left-/right-`, no `tracking-*` or italics (HTML grep: 0 hits); chart is a flex row in DOM order so day 1 is on the right
- [x] Western digits; money `3.59$` in `<bdi dir="ltr">`; counts in `<bdi dir="ltr">`; no per-answer cost; no payments or add-balance; no provider or model names
- [x] Tokens only (neutral, brand, danger, mode-1..3); mode colour by position in `GET /modes` (متقدم = mode-2, سريع = mode-1, تصميم = mode-3), colour never the only cue (label text beside every dot)
- [x] 44px targets for the picker, series switch, table button, retry, menu items; the balance chip in the header is 36px as in the approved S10/S3 (existing pattern)
- [x] Text contrast: `faint` `#64748B` (4.7:1) only for axis ticks and dates on white; no `#94A3B8` text
- [x] Out of scope kept out: no export, no period comparison, no token counts (DTO has `inputTokens` / `outputTokens`; not shown), no per-day cost per answer
- Not checked: Stitch export (none); live Recharts rendering (tooltip placement follows the cursor in the real chart).

## Proposed copy (new, for approval)
| Arabic | Where |
|---|---|
| استهلاكي | page title, account menu, drawer |
| الرسائل / المبلغ المحسوم | totals, table headers |
| حسب الوضع / الوضع / المبلغ | by-mode card |
| وضع محذوف | removed mode |
| الاستهلاك اليومي | chart card |
| المبلغ / الرسائل | series switch |
| عرض كجدول / عرض كرسم بياني | table toggle |
| اليوم | today marker |
| يُحسب الشهر بتوقيت UTC. / الأيام بتوقيت UTC | notes |
| الشهر السابق / الشهر التالي / اختيار الشهر / الأشهر | picker aria-labels |
| لا يوجد استهلاك في هذا الشهر | empty headline |
| لم ترسل أي رسالة في {الشهر}. اختر شهرًا آخر أو ابدأ محادثة جديدة. | empty sentence |
| العودة إلى هذا الشهر | empty action |
| تعذّر تحميل استهلاكك. تحقق من اتصالك ثم حاول مرة أخرى. | error |
| عرض الاستهلاك | link on the balance page |

## Implementation notes
- Route `/usage?month=YYYY-MM` (zod-validated, default current UTC month); future or malformed month falls back to the current month. Picker months: from `/me` `createdAt` month to the current month; `Intl` with `ar` month names but Western digits (`numberingSystem: 'latn'`), or a fixed month-name table.
- «Previous» uses the right-pointing chevron and «next» the left-pointing one in RTL (mirrored directional icons).
- Money through `<Money>` (decimal.js, no arithmetic on strings); counts with `Intl.NumberFormat('en')`. Share bar width needs a percentage helper in `src/lib/money.ts`, not float math on money strings.
- By-mode rows come most-charged first from the API; colour = index of `modeKey` in `GET /modes` (mode-1..), removed mode (`labelAr: null`) neutral. Never show `labelEn` or keys.
- Chart: shadcn `chart` + Recharts `BarChart`, `XAxis reversed`, `YAxis orientation="right"`, bars `--color-brand`, animation off under reduced motion; `byDay` has every day up to today (the current month has fewer than 28 bars); label thinning for 29 to 31 days; at 375px give the plot a min width (about 560px) inside an `overflow-x-auto` wrapper with the Y axis outside it, `tabIndex=0` and an aria-label. Table version is a real `<table>` with `<caption>`.
- Empty month: when `totals.messages === 0` show the empty card instead of by-mode and chart. In the current month with zero use the action should be «محادثة جديدة» instead of «العودة إلى هذا الشهر».
- Mobile account entry is the drawer item (no avatar menu on mobile, per S3). The desktop sidebar has no item for the page, so none is active there.
- Loading: month change keeps the picker and shows the skeleton; error keeps the selected month and preserves it on retry.

## Open questions
1. Add «استهلاكي» to the desktop sidebar too, or keep it to the balance link and the account menu as specified?
2. The empty month shows zeros plus the empty card (as asked). Confirm that a month before the account existed is still selectable (the backend returns zeros; the picker stops at the creation month).
3. «المبلغ المحسوم» as the label for charged: alternatives «المبلغ المخصوم» or «التكلفة».
