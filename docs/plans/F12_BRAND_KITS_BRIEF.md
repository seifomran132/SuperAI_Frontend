# F12 brief: brand kits (graphic design agent, stage 1)

**From:** backend, 2026-11-10. **Status:** brief, ready to plan and build.
**Backend reference:** `../SuperAI_Backend/docs/API_CONTRACT.md` §10 (brand kits), `docs/IMPLEMENTATION_MODULES.md` §5b (P3 agents and decisions). Backend commit `3596e5c` on `main` (not pushed yet; one migration `BrandKits`).

**Important, UX decided 2026-11-10:** the main way users will set up a brand and ask for designs is **inside the chat page**. They pick the "graphic designer" agent, and the agent asks one question per message with an input under it: text, choices, upload, colour chips, confirmation. Those guided steps come with backend stage 2 and a separate brief (F13). This brief (F12) covers only the brand kit **data layer**:
- `contract-sync` and an API client for the endpoints below. F13's chat steps call the same upload endpoint.
- Shared components the chat steps will reuse: file drop zone with previews, colour swatches and chips, profile fields.
- A simple **"My brands"** page (list, edit, delete) as a secondary place to manage kits. Keep it light, because the chat is the primary flow.
- The admin plans field (`maxBrandKits`).

Start with `contract-sync`: new endpoints, DTOs and **six new error codes** (Arabic and English text in `docs/ERROR_CODES.md`).

## Context

The first agent is a graphic design agent: users describe a social media post or product image and get professional designs in their brand. Stage 1 lets users set up a **brand kit** per client. No AI runs yet, and nothing costs money; design generation comes in later stages.

## Endpoints (user)

| Call | Notes |
|---|---|
| `POST /me/brand-kits` | `name` (1-80), optional `colors` and `profile`. `409 BRAND_KIT_LIMIT_REACHED` with `data.limit`. |
| `GET /me/brand-kits?limit&cursor` | Newest first; each item has `assetCount` and `logoAssetId` (thumbnail); the page has `limit` (kits the plan allows). |
| `GET /me/brand-kits/{id}` | The kit with `assets` (newest first). |
| `PATCH /me/brand-kits/{id}` | `name`, `colors`, `profile` (replaces the whole profile). Colour or profile changes raise `version`. |
| `DELETE /me/brand-kits/{id}` | `204`. Confirm first: the kit and all its files are deleted. |
| `GET /me/brand-kits/{id}/versions` | History of colours and profile, newest first. |
| `POST /me/brand-kits/{id}/assets?kind=logo\|reference\|product\|guideline` | Multipart field `file`. Returns `{ asset, suggestedColors }`. |
| `GET /me/brand-kits/{id}/assets/{assetId}/file?variant=original\|preview` | Bearer token required, so fetch as a blob, like chat images. `preview` (WebP, up to 512 px) for grids; a PDF has no preview. |
| `DELETE /me/brand-kits/{id}/assets/{assetId}` | `204`. |

**Profile fields:** `style` (≤500), `tone` (≤300), `fontStyle` (≤300), `dos` and `donts` (lists of up to 10 rules, each ≤200), `notes` (≤2000).

**Files:** JPEG, PNG, WebP or SVG up to 10 MB; PDF up to 20 MB, guidelines only; at most 40 files per kit. Uploads share the chat rate limit (`429 RATE_LIMITED`, `Retry-After`).

| Error | When | Suggested UI |
|---|---|---|
| `409 BRAND_KIT_LIMIT_REACHED` | Plan limit (`data.limit`) reached | Explain the limit; link to plans |
| `409 BRAND_ASSET_LIMIT_REACHED` | 40 files in the kit | Ask to delete some first |
| `413 BRAND_ASSET_TOO_LARGE` | Image over 10 MB, PDF over 20 MB | Under the drop zone |
| `415 BRAND_ASSET_TYPE_NOT_ALLOWED` | Other types, a PDF not as guideline, an SVG that links to outside files | Under the drop zone; suggest exporting as PNG |
| `404 BRAND_KIT_NOT_FOUND` / `BRAND_ASSET_NOT_FOUND` | Deleted or unknown | Back to the list |

## Suggested screens ("My brands", secondary to the chat flow)

1. **Brand kits list:** cards with the logo thumbnail, name and colours; "New brand kit" (disabled with an explanation at the plan limit, `limit` from the list).
2. **Brand kit page**, in sections:
   - **Identity:** name.
   - **Colours:** swatches; add with a picker or hex; reorder (first is most important); up to 12. After a logo upload, offer `suggestedColors` as chips ("Add these colours?"); never add them automatically.
   - **Files:** one drop zone per kind (logos, past designs, product photos, guidelines), grids of previews, delete per file.
   - **Profile:** style, tone, font style ("describe how your fonts look"), do's and don'ts as lists, notes. Save as one change.
   - **History:** versions list (optional in v1).
3. **Admin plans form:** new field "Brand kits" (`maxBrandKits`, 0-100). The public plans page can show it (`GET /plans` → `maxBrandKits`).

## Rules

Errors by `code`; RTL first; hex colours shown left-to-right. Brand kits are private to the user, so never cache their files in shared places.
