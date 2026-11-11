# Brief for the backend: edit an existing design (graphic designer agent)

**From:** frontend, 2026-11-10, from the user's request. **Status:** proposal; needs backend steps and run logic. No new frontend screens: every step below uses an input type that S25 already designs and F13 builds.
**Contract today:** `../SuperAI_Backend/docs/API_CONTRACT.md` §11 (steps), §11.3 (runs), §9.5 (image edits).

## The task

The user has a finished design (e.g. a product post with a seller logo in a corner and an icon in the middle) and wants it changed, not a new one made. Example from the user: "replace the icon in the centre with any other icon that contains no text, and keep or replace the seller logo at the top left".

## Proposed steps (after `brand_pick`, before the request steps)

| Step | `ui.type` | Content | Answer |
|---|---|---|---|
| `design_task` | `choices` | «تصميم جديد» / «تعديل تصميم موجود» | `{ choice: 'new' \| 'edit' }` (new → today's `design_format`) |
| `edit_source` | `upload` | The design to edit, one image (`kinds: ['reference']`, `maxFiles: 1`, not optional) | `{ assetIds: [id] }` |
| `edit_change` | `text` | What to change, e.g. «استبدل الأيقونة في المنتصف بأيقونة أخرى بلا نص» (≤500) | `{ text }` |
| `edit_logo` | `choices` | The logo already in the design: «إبقاؤه كما هو» / «استبداله بشعار علامتي» / «إزالته» | `{ choice: 'keep' \| 'replace' \| 'remove' }` |
| `edit_text` | `choices`, `allowText` | Text in the design: «إبقاء النص» / «بدون نص» / or write new text | `{ choice }` or `{ text }` |
| `edit_summary` | `summary` | Items above, editable; with `estimate` like `design_summary` | `confirm` / `edit` / `change_brand` |

Then `design_saved` as today. "Replace with my logo" uses the kit's newest logo; with no logo in the kit the option is hidden or the step explains it.

## Run (stage 4)

One image-edit call per variant with the source image (and the kit logo when replacing), the instruction built from the answers and the kit profile, then the same check step (no unwanted text, logo as asked). Same hold, steps and single charge as §11.3.

## Questions for the backend

1. Does the image model behind the agent accept an input image for edits (as image modes do in §9.5)? If not, which one should `imageModelId` point to for this task?
2. Should `edit_source` also accept a design made earlier in the same conversation (stage 4), not only an upload?
3. Variants for edits: same `variants` setting, or always 1?
