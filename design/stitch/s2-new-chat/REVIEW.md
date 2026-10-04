# S2 New chat (empty state)

- Stitch project: `projects/15605789258921234837`
- Screen id: **none (hand-built)**. `generate_screen_from_text` timed out twice (compact prompt) and the new screen could not be located (`list_screens` is stale), so it was built by hand.
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`)
- Status: **approved by the user, 2026-10-04** (including the proposed copy)

## Checked

- [x] Sidebar first in the flex row (renders on the right), no active conversation
- [x] Header without a title: balance chip + account menu button on the left
- [x] Monogram tile, headline «كيف أساعدك اليوم؟», one line «اكتب سؤالك أو اختر فكرة للبدء.», 4 chips in 2x2
- [x] Mode selector inside the composer; helper text; no attachments/templates/estimate
- [x] Logical classes only; Western digits; no model names

## Proposed copy (needs approval)

Headline «كيف أساعدك اليوم؟» · line «اكتب سؤالك أو اختر فكرة للبدء.» · chips «لخّص لي نصًا طويلًا في نقاط» / «اكتب رسالة رسمية باحترافية» / «اشرح لي مفهومًا بطريقة بسيطة» / «ساعدني في كتابة كود بايثون».

## Implementation notes

- A chip click fills the composer (does not send); focus moves to the textarea.
- Monogram and brand come from brand config.
- No conversation exists until the first Send (`POST /conversations` then); the sidebar has no active row.
- Chips collapse to one column under 640px.
