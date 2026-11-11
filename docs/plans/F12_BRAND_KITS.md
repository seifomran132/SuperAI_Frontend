# F12 — Brand kits (graphic design agent, stage 1)

**Status:** built 2026-11-10 from approved S24 (answers in its REVIEW.md), uncommitted on branch `brand-kits`. Merge after the backend's `BrandKits` migration runs on production.
**Brief:** [F12_BRAND_KITS_BRIEF.md](F12_BRAND_KITS_BRIEF.md). **Binding contract:** `../SuperAI_Backend/docs/API_CONTRACT.md` §10, error codes in `docs/ERROR_CODES.md`.
**Backend:** `3596e5c` on `main` (pushed), migration `BrandKits`. Production must run it before this merges.
**Goal:** the data layer and parts the chat agent (F13) reuses, a light "My brands" page to manage kits, and the admin plan field. No AI and no cost.

## 1. Contract sync

Done 2026-11-10 against backend `b3e5498` (covers F12 and F13), uncommitted on branch `brand-kits`. Additive: 13 endpoints (`meBrandKits*`, `meAgentsList`, `meAgentsAnswer`, `adminAgents*`), 11 error codes. New required fields `ConversationDto.agentKey`, `MessageDto.ui`/`answer`, `PlanDto`/`PublicPlanDto.maxBrandKits` (backend default 5) were added to the hand-built objects in chat code and mocks; typecheck clean, tests pass.

**Wording:** the backend's error texts call a kit «هوية العلامة التجارية» and name a new one «علامتي التجارية». The screens use the same words: the page «علاماتي التجارية», one kit «هوية العلامة التجارية».

## 2. What we build

1. **Feature `src/features/brand-kits/`** (not `brand`: `src/brand` is the white-label config).
   - `model/`: queries and mutations from the generated client; `uploadBrandAsset(kitId, kind, file, onProgress, signal)` through `src/platform/upload` (the generated SDK cannot report progress, same as chat images); `useBrandAssetImage(kitId, assetId, variant)` fetching the file as a blob with the bearer token; client checks before upload (type, 10 MB / 20 MB, PDF only as guideline, 40 files); colour helpers (`#RGB` → `#RRGGBB`, no repeats, up to 12).
   - `components/` (exported through `ui.ts` for F13): `ColorPalette` (swatches, add by picker or hex, move earlier/later, remove, suggested colours as chips "Add these colours?"), `AssetDropZone` (drop, pick, camera on phones, progress, per-file errors), `AssetGrid` (previews, PDF tile, delete), `ProfileFields` (style, tone, font style, do's and don'ts as lists, notes, with counters).
   - `pages/`: `BrandKitsPage` (list) and `BrandKitPage` (one kit).
2. **Routes** under `_authed/_app`: `/brands`, `/brands/$brandKitId`.
3. **Admin plans form:** field "Brand kits" (`maxBrandKits`, 0-100).

## 3. Decisions (approved 2026-11-10)

1. **Where "My brands" appears:** a link «علاماتي التجارية» in the account menu and the sidebar footer, **only when `GET /agents` offers the graphic designer**. Kits are only useful for the agent, which stays off for users until stage 4; until then only plans an admin switched on see it. The same `GET /agents` query feeds the chat picker (F13).
2. **Public plans page:** do not show `maxBrandKits` until the agent launches (stage 4), so we don't advertise something users can't use.
3. **Version history:** not in v1 (optional in the brief).
4. **Reordering colours:** "move earlier / later" buttons, keyboard- and screen-reader-friendly, no drag-and-drop in v1. First colour = most important.
5. **Saving:** name, colours and profile save separately (each a `PATCH`, so a colour change doesn't overwrite an unsaved profile). The profile saves as one change, as the brief asks. Leaving with unsaved edits asks first.
6. **Suggested colours:** after a logo upload, shown as chips with "Add"; never added by themselves.
7. **Files are private:** previews are fetched with the bearer token, kept in memory only and dropped on sign-out (`session-reset`). No service worker or shared cache.
8. **Delete a kit:** confirmation dialog that says the kit and all its files are deleted; then back to the list.
9. **Limit:** "New brand kit" is disabled at `limit`, with the reason and a link to `/plans`; `409 BRAND_KIT_LIMIT_REACHED` shows the same message.
10. **Text:** a new `src/i18n/brand-kits.{ar,en}.json` loaded with these screens, so the first-screen bundle doesn't grow. Hex values `dir="ltr"`.

## 4. Screens (design S24, desktop and phone)

1. **List:** cards with logo thumbnail (`logoAssetId`, else monogram), name, first colours, file count, «مسودة» badge for `draft`; "New brand kit"; empty state that points to the graphic designer in the chat; loading, error, load more.
2. **New:** a small dialog with the name; opens the kit page.
3. **Kit page:** sections Identity (name), Colours, Files (one drop zone and grid per kind: logos, past designs, product photos, guidelines), Profile; delete at the bottom. Errors per field and under each drop zone (`413`, `415`, `409 BRAND_ASSET_LIMIT_REACHED`, `429`). `404` → back to the list with a message.

## 5. Tests

Unit: colour helpers, file checks, upload errors by code, palette add/move/remove/suggested, profile save and validation, list states and limit, delete confirmation, `404`. MSW handlers in `src/mocks/brand-kits.ts`. Playwright (`BK-` cases, local stack): create, upload a logo and add suggested colours, save profile, delete a file, the limit, delete a kit. Manual cases in `MANUAL_TEST_CASES.md`.

## 6. Order of work

1. Contract sync. Done.
2. User approves §3.
3. Design S24 with `stitch-designer`; the user approves.
4. Build, tests, review, browser check.
5. Merge after the backend's `BrandKits` migration runs on production.

## 7. Build notes (2026-11-10)

- Feature `src/features/brand-kits/` (`index.ts` for the model, `ui.ts` for screens and the parts F13 reuses: `ColorPalette`, `AssetDropZone`, `AssetTile`, `PendingTile`, `KitThumbnail`, `DraftBadge`, `useAssetUploads`). Text in `src/i18n/brand-kits.{ar,en}.json`, loaded with these screens.
- `GET /agents` lives in the chat model (`useAgents`, `useBrandKitsAvailable`); the sidebar and account menu show «علاماتي التجارية» only when it offers `graphic_designer`. This adds one small request to the first screen (shell 211.5 of 240 KB).
- Assets have no file name in the API, so the PDF tile shows «PDF · size».
- A draft keeps its badge after saves on this page; only the chat agent finishes it (S24 REVIEW, answer 2).
- **Gap to raise with the backend:** in the chat, picking a `ready` kit goes straight to the design request, so the guided steps can finish a draft but not fill gaps in a ready kit.
- Tests: 32 unit tests in the feature plus the admin plan form; Playwright BK-01 to BK-08 pass on Chromium, Firefox, WebKit and both phone widths (40 of 40) against the local stack.
