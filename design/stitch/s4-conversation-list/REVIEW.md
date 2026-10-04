# S4 Conversation list states

- Stitch project: `projects/15605789258921234837`
- Screen id: **none (hand-built board)**
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`)
- Status: **approved by the user, 2026-10-04** (including the proposed copy)

## Cards

1. Loading: 6 skeleton rows (`#F1F5F9`), `role="status"`
2. Empty: «لا توجد محادثات بعد» + «ابدأ محادثتك الأولى وستظهر هنا.» (the action is the «محادثة جديدة» button above)
3. Load error: danger container «تعذّر تحميل المحادثات. حاول مرة أخرى.» + «إعادة المحاولة»
4. A conversation answering in the background shows pulsing dots + «يكتب…» in place of the time (neutral `fg-muted` text (`#475569`) with animated dots (not teal or a mode colour)); skeleton rows at the bottom while loading more

## Checked

- [x] Active row: `#F1F5F9` + 3px brand bar on the right edge
- [x] Rows >= 44px; muted text `#64748B`; Western digits in relative times
- [x] No delete/rename/search/pin

## Proposed copy

«لا توجد محادثات بعد» · «ابدأ محادثتك الأولى وستظهر هنا.» · «تعذّر تحميل المحادثات. حاول مرة أخرى.» · «يكتب…» · «جاري تحميل المحادثات» / «جاري تحميل المزيد» (aria-labels).

## Implementation notes

- The `يكتب…` row reads from the active-streams registry; it clears on done/error/abort.
- Infinite query with `cursor`; load more on scroll; error on a later page shows a small inline retry (not designed).
- Relative time via `Intl.RelativeTimeFormat('ar', { numberingSystem: 'latn' })`.
