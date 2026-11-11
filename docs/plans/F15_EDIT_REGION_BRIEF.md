# Brief for the backend: "edit an existing design" replaced the wrong element

**From:** frontend, 2026-11-11, from the user's test. **Status:** proposal for the backend; the frontend part (a new input) waits for the backend's contract and a Stitch design.
**Contract today:** `../SuperAI_Backend/docs/API_CONTRACT.md` §11.1–11.2 (`edit_upload`, `edit_changes`, `edit_product`, `edit_summary`), §11.3 (runs and the check step).

## What happened

The uploaded design was a promo card:
- **Top left:** the seller's logo, a rounded-square "SUPER CARD" app icon.
- **Centre:** the product, a round badge (polar bear, "1st Anniversary") on a dark square tag with a gold ring.

The user chose `replace_product` and uploaded a new product icon (a rounded-square "Da / Dammo" app icon). The result:
- put the new icon in the **top-left logo** spot, with an invented "Dammo" label and a gold podium under it;
- left the **centre product unchanged** (only restyled: gold rim, brighter yellow);
- kept the background.

The image model matched the new product by shape (an app icon looks like the corner logo) and added elements nobody asked for. As far as we can tell it was delivered without `needsReview`.

The frontend sent exactly what the user chose (`edit_changes { choices: ['replace_product'], text? }`, then `edit_product { assetIds }`). The gap: the run gives the image model no location for the product.

## Proposals

1. **Let the user mark the product.** A new step after `edit_upload` (or inside the flow when `replace_product` is chosen): the user drags a box on the uploaded design. Suggested shape: `ui.type: 'region'` with `{ brandKitId, assetId }` (the uploaded design) and a `label`; answer `{ region: { x, y, width, height } }` normalised 0–1. The run edits only that area (a masked edit where the image model supports it; otherwise crop, regenerate and composite). The same input can later mark the logo when `replace_logo` is chosen.
2. **Protect what wasn't chosen:** unless `replace_logo` is chosen, the logo area stays as it was; no new text, labels or props.
3. **A stronger check for edits:** the vision check compares before and after: the marked area changed, the logo is identical, nothing was added. A result like this one comes back `needsReview: true` or is fixed once, not delivered as finished.
4. **A tighter edit prompt:** "change only the chosen parts; do not add elements, labels, podiums or text; keep the layout, background, logo and every other element unchanged".

## Frontend part

When the backend agrees and adds the step to the contract: `contract-sync`, a Stitch design for the "mark the area" input (desktop and phone, touch-friendly box), then build and test. No change is needed before that.

Related, already fixed on the frontend (uncommitted at the time of writing): `edit_upload` now uploads with kind `design`.

## Backend decision (2026-11-11)

Yes to all four. Proposal 1 is done by the image model (no masks or compositing for now): it gets the region as normalised coordinates in the prompt plus a copy of the design with the box drawn on it, and the check verifies the change stayed inside the box. Proposals 2–4 are backend only.

**Contract (to be written into API_CONTRACT §11.1–11.2 when built):**
- New steps: `edit_logo_region` (when `replace_logo` is chosen, optional: skip = "find the logo yourself") and `edit_product_region` (required when `replace_product` is chosen, before `edit_product`).
- Order: `edit_upload` → `edit_changes` → [`edit_logo_region`] → [`edit_product_region` → `edit_product`] → [`edit_text`] → `edit_summary`.
- `ui`: `{ type: 'region', step, brandKitId, assetId, target: 'product' | 'logo', optional }`; `assetId` is the uploaded design (a kit file, fetched like the others).
- Answer: `{ region: { x, y, width, height } }`, normalised 0–1 from the top left of the image as shown; each side ≥ 0.03; inside 0..1; otherwise `400 VALIDATION_FAILED` on `region`. Optional: `{ skip: true }`.
- `edit_summary` gets items for the marked areas («محدَّد»), editable to redo a box. No price change.
- Delivered designs (`design_edit`) get no region this round.

**Frontend:** design S30 (the region input) now; build after the backend's branch has it and `contract-sync` runs.

**Additions (backend, 2026-11-11):**
- The region `ui` also has `width` and `height` (the uploaded design's pixels), so the input lays out the image in its shape before it loads.
- `edit_summary` region items: `field` `product_region` / `logo_region`, `value` shown as-is («محدَّد», or «تلقائي» when the logo step was skipped), listed in `editable`; «تعديل» sends `{ action: 'edit', field }` and returns to that step with the box kept; the item carries `region: { x, y, width, height } | null` to pre-fill it.
- The backend build waits for the user's go-ahead.

**Built on the backend (2026-11-11, `p3-stage3-agent-runs` at `5b699b7`, local only):** as agreed, plus: the region `ui` has `current` (the earlier box or null when redrawing from the summary); a bad box is `400 VALIDATION_FAILED` on field **`value`** (not `region`); answer texts in the chat «حدّدت المكان» / «ابحث عنه بنفسك»; migration `EditRegions`. Contract synced the same day (two new steps in the enum; typecheck clean). Frontend build waits for the user's approval of S30.

**Frontend built (2026-11-11, uncommitted):** `region` input (`components/agent/RegionInput.tsx`, geometry in `model/region.ts`), reply thumbnail with the box, faint logo box on the product step, keyboard and touch support; the message list is now a focusable region (axe `scrollable-region-focusable` in agent conversations). Tests: 13 new unit tests; Playwright AG-07 (draw a box with the mouse against backend `5b699b7`) passes on all five targets. Summary rows show the backend's text without a thumbnail (the item has the box but not the image).
