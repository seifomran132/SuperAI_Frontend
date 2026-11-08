# S18 Admin dashboard (overview): desktop board + mobile 375px

- Stitch project: `projects/15605789258921234837`
- Screen ids: **none (hand-built)**. Same method as the approved F4a, S15, S16 and S17 boards (annotated multi-state boards; the Stitch MCP generates one screen per prompt). No `generate_screen_from_text` call was made. Say if you want a Stitch run for any single frame.
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`), source [design/DESIGN.md](../../DESIGN.md). `base.mjs` is a copy of the head, tokens, icons and helpers of `../s16-catalog-sync/base.mjs`.
- Status: **approved by the user, 2026-11-06**, with the recommendations in `docs/plans/DESIGN_DECISIONS_F9_F10.md` (applied in the build, not redrawn). New copy in this file accepted unless that list changes it.
- Spec: `docs/plans/F9_REPORTS.md` (decisions §2, slice 2, §4 row S18, §7), `OverviewDto` in `src/api/generated/types.gen.ts`.
- Files: `desktop.html` / `desktop.png` (1560px board, 9 frames), `mobile.html` / `mobile.png` (10 frames at 375px). Regenerate with `node build.mjs && node render.mjs` (Chrome via Playwright; `render.mjs` also checks that no mobile frame scrolls horizontally and that no mobile target is under 44px: both pass). Board titles and dashed notes are annotations, not UI.
- Brand values («ل», «لمحة AI») come from `src/brand/lam7a.ts`; the build reads them from the brand config.

## Frames

| # | Desktop | Mobile |
|---|---|---|
| 1 | Default, last 30 days, tooltip on 20 Oct | M1 same, cards stacked, chart scrolls inside its card |
| 2 | Negative margin (−48.50$, danger colour + icon + text) | M2 |
| 3 | Series switch: requests, new users | M3 |
| 4 | «عرض كجدول» on | M4 |
| 5 | Custom range, valid | M5 |
| 6 | Custom range invalid: start after end; over 366 days | M6 |
| 7 | Loading (skeletons) | M7 |
| 8 | Period with no activity (zeros, empty chart message, empty lists) | M8 |
| 9 | Error with retry | M10 |
| - | - | M9 sidebar drawer (slides from the right) |

## Layout

- Sidebar (right, first in the flex row): نظرة عامة (active, first), المستخدمون, الباقات, المزوّدون, النماذج, الأوضاع, تحديثات الأسعار (badge 3, as approved in S16), الطلبات المُعلَّمة, سجل التدقيق (no badges), الإعدادات.
- Content order: period picker, «تحتاج إلى انتباه», four money cards (المحصَّل, تكلفة المزوّد, الهامش, المُمتَص), three cards (المستخدمون total/new/active; الباقات النشطة by plan name; الصور created/uploaded), daily chart, top modes and top models.
- Attention is two linked counters (a count, not a to-do queue). `requestsToReview` is "now, any period", and the card says so. No badge on the sidebar item.
- Chart: grouped bars (charged = brand, provider cost = mode-3), first day on the RIGHT (8 Oct) and today on the LEFT (6 Nov), Y axis on the right, legend, Arabic tooltip that opens toward the plot interior, series switch (المبالغ / الطلبات / مستخدمون جدد), «عرض كجدول» toggle (`aria-pressed`) with a scrollable, sticky-header table (oldest first).
- Mobile: single column; presets in a 2x2 grid (44px); the chart sits in a scroller with the Y axis fixed outside it (right) and a hint line; the page itself never scrolls horizontally.

## Checked

- [x] RTL, `<aside>` first in the flex row (renders right); logical properties in components (`inset-inline-*`, `margin-inline-*`, `text-align:start/end`); Plex Sans Arabic; Western digits; no letter-spacing/italics (SVG text sets `letter-spacing:normal`)
- [x] Money as `842.30$` inside `<bdi dir="ltr">`; negative margin with U+2212 sign (`−48.50$`), danger colour only when negative, plus icon and text (not colour alone); zero shows `0.00$` with no sign
- [x] Counts with `Intl` style separators (`1,240`); model keys and mode keys in LTR spans; model keys are shown as `provider/model` on this admin screen only, as the plan decided
- [x] Tokens only (brand, neutrals, mode-1..4 dots, danger/warning); text colours are `on-surface` or `on-surface-muted`, no `#94A3B8` text
- [x] 44px targets: presets, series switch, table toggle, date fields, buttons, attention cards
- [x] Out of scope kept out: no payments, export, period comparison, margin %, per-user drill-down links, requests "mark reviewed", provider names on user screens
- [x] All requested states present (loading, no activity, error + retry, invalid range x2, 375px)
- Hand-built markup uses two physical offsets that are board positioning only, not product code: the tooltip `left:` and the drawer `right:0`. The build must position the tooltip from Recharts and use `inset-inline-*` for the drawer.
- Not checked: Stitch export (none); real Recharts rendering (this board is hand-drawn SVG).

## Implementation notes

- **Bidi:** every amount through `<Money>` (`bdi`); `signed` for margin; numbers in `<bdi dir="ltr">`; SVG axis tick text is LTR (`direction:ltr`, numbers with `$` after, e.g. `10$`).
- **Chart (shadcn chart / Recharts):** `XAxis reversed` (first day right), `YAxis orientation="right"`, two `Bar`s for charged then cost (first series sits on the right of each pair), colours from CSS variables (`--color-brand`, `--color-mode-3`, requests `mode-professional`, users `mode-fast`), custom Arabic tooltip, `role="img"` with an `aria-label`, animations off under `prefers-reduced-motion`. The table version is the accessible source of exact values. X labels: every 5th day, month name on the first label, on a month change and on the last day. 366 bars: thin bars and thinned labels.
- **Mobile chart:** the plot has a minimum width (about 640px for 30 days) inside a scroller (`overflow-x:auto`, `tabindex=0`, labelled); the Y axis is a separate fixed column on the right. Scroll starts at the first day (right end).
- **Period:** URL params `?days=7|30|90` or `?from&to` (decision 3). «فترة مخصصة» reveals two native date fields; «تطبيق» is disabled while the zod check fails; the report keeps showing the last valid period. API `VALIDATION_FAILED` details map onto the same fields.
- **Date fields:** native `<input type="date">` may show non-Western digits in an Arabic browser locale. Check in the build; if so, set `lang="en"` on the field or use a masked text field.
- **Loading:** `aria-busy` on the data region, `role="status"` text «جارٍ تحميل التقرير…»; shimmer off under reduced motion; the picker stays active.
- **Empty period:** `users.total` and `subscriptions` are not period-bound, so they keep their values; period metrics are zero.
- **Data mapping:** users card from `users`; plans from `subscriptions[].nameAr` / `active` (total = sum, computed with integer addition, not money); money from `usage.chargedUsd`, `providerCostUsd`, `marginUsd`, `absorbedUsd`; images from `imagesCreated` / `imagesUploaded`; attention from `requestsToReview` and `openCatalogFindings`; chart from `byDay[]` (oldest first, reversed by the axis, not by sorting); tops from `topModes` / `topModels`. `money` (purchases, credits, adjustments, expired) is not shown: not requested for v1.

## New copy (for approval)

| Arabic | Where |
|---|---|
| نظرة عامة | sidebar item, page title |
| الطلبات المُعلَّمة، سجل التدقيق | sidebar items |
| آخر 7 أيام / آخر 30 يومًا / آخر 90 يومًا / فترة مخصصة | period presets (given) |
| من 8 أكتوبر إلى 6 نوفمبر 2026 · 30 يومًا | selected period summary |
| الأيام بتوقيت UTC | note under the picker (given) |
| من / إلى / تطبيق | custom range fields and button |
| يجب أن يكون تاريخ البداية قبل تاريخ النهاية أو مساويًا له. | start after end |
| أقصى فترة هي 366 يومًا. قصّر الفترة وحاول مرة أخرى. | over 366 days |
| آخر فترة صالحة: من … إلى … | summary while the range is invalid |
| تحتاج إلى انتباه | section title (given) |
| طلبات مُعلَّمة: محسوبة من تقدير أو تحمّلنا جزءًا من تكلفتها. العدد الحالي لكل الفترات. | attention card help |
| تحديثات أسعار مفتوحة: تغييرات في أسعار النماذج بانتظار مراجعتك. | attention card help |
| عرض الطلبات / عرض تحديثات الأسعار | card links |
| لا توجد طلبات مُعلَّمة / لا توجد تحديثات أسعار مفتوحة | zero counts |
| المحصَّل: ما خُصم من أرصدة المستخدمين | card help |
| تكلفة المزوّد: ما دفعناه للمزوّدين | card help |
| الهامش: المحصَّل ناقص تكلفة المزوّد؛ أقل من التكلفة في هذه الفترة | margin help, negative variant |
| المُمتَص: تكلفة زادت عن المبلغ المحجوز وتحمّلناها | card help |
| المستخدمون: إجمالي الحسابات غير المحذوفة، جدد في الفترة، نشطون في الفترة | users card |
| الباقات النشطة: اشتراكات نشطة الآن | plans card |
| الصور: صور أُنشئت في الفترة، صور رفعها المستخدمون | images card |
| المحصَّل مقابل تكلفة المزوّد / الطلبات اليومية / المستخدمون الجدد يوميًا | chart titles |
| المبالغ / الطلبات / مستخدمون جدد | series switch |
| عرض كجدول / عرض كرسم بياني | table toggle |
| لا نشاط في هذه الفترة / لم تُسجَّل أي رسائل بين 8 أكتوبر و6 نوفمبر. | empty chart |
| مرّر أفقيًا لعرض باقي الأيام. | mobile chart hint |
| أكثر الأوضاع استخدامًا / أكثر النماذج استخدامًا، أعلى 10 | top lists |
| الوضع / النموذج / الطلبات / المحصَّل | table headers |
| لا توجد بيانات في هذه الفترة | empty top list |
| جارٍ تحميل التقرير… / تعذّر تحميل التقرير / تحقق من اتصالك ثم أعد المحاولة. / إعادة المحاولة | loading, error |

## Open questions

1. **Sidebar order:** F9 plan §2.5 says «نظرة عامة» first, then «الطلبات المُعلَّمة». The board puts the two new items after «تحديثات الأسعار», before «الإعدادات», and keeps the existing order otherwise. Prefer the plan's order (flagged requests right after overview)?
2. **Bar colours:** charged is the brand slate and provider cost is `mode-3` blue; their lightness is close, so the legend, the tooltip and the table carry the meaning. Prefer a lighter second colour?
3. **Margin %:** not shown (not in the brief). Add a «نسبة الهامش» line from a `money.ts` helper?
4. **Mobile chart start:** the scroller opens on the first day (right). Opening on today (left end) is arguably more useful on a phone; say which.
5. **Mode names in tops:** `topModes.key` is a mode key (`fast`), shown as-is until the backend adds `label` (proposal 3 in §7). Mode dots follow position colours, not names.
6. **Date format in the fields:** `dd/mm/yyyy` on the board; confirm, or use `yyyy-mm-dd` to match the URL.
7. **Plans card total (211):** a sum of `subscriptions[].active`. Keep the total, or list the plans only?
