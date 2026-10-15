# F7 brief: admin UI for model discovery and catalog price sync

**From:** backend, 2026-10-15. **Status:** brief, to be planned (plan only, don't build yet).
**Backend reference:** `../SuperAI_Backend/docs/IMPLEMENTATION_MODULES.md` §10.11. Deployed in backend commit `1eff554`.

Start by running `contract-sync`: these endpoints are not in the generated client yet. Then write the plan (e.g. `docs/plans/F7_CATALOG_SYNC.md`), use `stitch-designer` for screens if useful, and send back the plan plus anything the API is missing.

## What the backend does

- Prices come from the public catalog [models.dev](https://models.dev/api.json).
- Every 6 hours (00, 06, 12, 18 UTC) the job `sync-model-catalog` compares each model's price with the catalog:
  - a change within 50 % is **applied automatically** (audited as `model.price_set`);
  - a larger change, or a zero or missing catalog price, is **held as a finding** for an admin.
- The same run checks that every enabled model is still offered by its provider; one that disappeared opens a `model_retired` finding, with `usedByEnabledModes` showing which modes depend on it.
- Models are never added automatically. Admins add them from a discovered list.

## Endpoints (all admin)

| operationId | Call | Notes |
|---|---|---|
| `adminProviders_availableModels` | `GET /admin/providers/{code}/available-models` | `AvailableModelsDto { providerCode, catalogAvailable, models[] }`. Errors: 404, 409 `PROVIDER_KEY_MISSING` / `PROVIDER_KEY_INVALID`, 502. |
| `adminCatalogSync_run` | `POST /admin/catalog-sync/run` `{ reason }` | Returns `CatalogSyncSummaryDto`. |
| `adminCatalogSync_list` | `GET /admin/catalog-sync/findings?status&limit&cursor` | `{ items: CatalogFindingDto[], nextCursor? }` |
| `adminCatalogSync_apply` | `POST /admin/catalog-sync/findings/{id}/apply` `{ reason }` | 409 `CATALOG_FINDING_OUTDATED` if our price changed since the finding was raised. |
| `adminCatalogSync_dismiss` | `POST /admin/catalog-sync/findings/{id}/dismiss` `{ reason }` | A dismissed proposal is not raised again. |

### Shapes

- `AvailableModelDto`: `providerModelId`, `displayName?`, `contextWindow?`, `maxOutputTokens?`, `addedModelId?` (set when already added), `catalog?: CatalogSuggestionDto`.
- `CatalogSuggestionDto`: `catalogModelId`, `name?`, `contextWindow?`, `maxOutputTokens?`, `supportsImages?`, `price?: { inputPerMtok, outputPerMtok, cachedInputPerMtok?, cacheWritePerMtok? }`, `hasContextTiers`, `deprecated`.
- `CatalogSyncSummaryDto`: `catalogAvailable`, `checked`, `applied`, `unchanged`, `held`, `ignored`, `noCatalogPrice`, `notInCatalog`, `skipped`, `failed`, `providersChecked`, `providersUnreachable`, `retired`, `retiredInUse`.
- `CatalogFindingDto`: `id`, `kind` (`large_change` | `catalog_price_missing` | `model_retired`), `status` (`open` | `applied` | `dismissed` | `superseded`), `modelId`, `providerCode`, `providerModelId`, `modelDisplayName`, `catalogModelId?`, `usedByEnabledModes[]`, `currentPrice?`, `proposedPrice?`, `changePct?`, `createdAt`, `lastSeenAt`, `resolvedAt?`, `resolvedBy?`, `resolutionReason?`.

All prices are USD decimal strings per million tokens.

## Suggested scope

1. **"Add model from provider" picker** (providers or models page):
   - List available models; mark ones already added (link via `addedModelId`).
   - Selecting one opens the existing model and price forms **prefilled from `catalog`** (name, limits, `supportsImages`, prices).
   - Warn on `deprecated`, and on `hasContextTiers` ("costs more above a context size; we charge one rate").
   - Handle `catalogAvailable: false` (no prefill) and the key errors (link to setting the key).
2. **"Price updates" page:**
   - Open findings first; filter by status and kind.
   - Current price next to proposed price, change %, modes using the model.
   - Apply and dismiss, each with a required reason.
   - `model_retired`: emphasise `usedByEnabledModes` and link to edit those modes.
   - "Run sync now" with a reason, then show the summary counts.
3. **Visibility:** an open-findings badge in the admin navigation. It is the only alert for now; the backend does not email admins.
4. **Rules:** money via `<Money>` and `src/lib/money.ts`, never arithmetic on strings; errors by `code`; admin-only screens may show provider and model names.

## Coming from the backend (not built yet)

- A per-model "don't sync" flag (decision pending).
- Protection against tiered prices (capping the context window for `hasContextTiers` models).

Leave room for both in the model form.
