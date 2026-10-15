# F7: Admin model discovery and catalog price sync

**Status:** Built 2026-10-15 (design S16 approved, `frontend-reviewer` pass, fixes applied). §2's notes on run, `kind` and the badge fallback predate the final contract below, which wins.
**Brief:** [F7_CATALOG_SYNC_BRIEF.md](F7_CATALOG_SYNC_BRIEF.md) (from the backend). Backend reference: `../SuperAI_Backend/docs/IMPLEMENTATION_MODULES.md` §10.11, backend commit `1eff554`.
**Contract:** synced 2026-10-15 from backend `22cbd84`, with 5 new operations and 5 new error codes. Nothing broke, and typecheck, lint and the admin tests pass.
**Backend reply (2026-10-15):** the backend agreed to every ask in §6 (items 1–5), waiting for approval in that session. `run` becomes asynchronous: it returns `202 { runId }` and reports progress on the new status endpoint. The plan below is written for the agreed contract; the original fallbacks stay in §6 in case an item slips.
**Final contract (2026-10-15, synced from the backend working tree, not yet committed there):**
- `POST /admin/catalog-sync/run` → `202 { runId }`; `409 CATALOG_SYNC_RUNNING` while any run is going (also during an API shutdown).
- `GET /admin/catalog-sync/status` → `CatalogSyncStatusDto { openFindings, openByKind, running: { runId, startedAt, trigger } | null, lastRun: { runId, startedAt, finishedAt, trigger, summary | null, error | null } | null, nextRunAt }`.
  - `lastRun.error` is an English developer string; a failed run has `summary: null`.
  - Runs are capped at 20 min; one cut off by a deploy or a crash shows as failed.
- The findings list takes one `kind`, like `status`.
- `resolvedBy: { id, email: string | null } | null`.
- `CreateModelDto.price?: PriceRatesDto` is saved in the same transaction.

Poll `status` until `running` is null, then read `lastRun`.
**Size:** medium. Two admin screens and one navigation badge. Everything else reuses the F4 admin patterns: tables, `Section`, `ReasonDialog`, `Badge`, `BackLink`, form controls, and catalog invalidation.

## 1. What admins get

| # | Feature | Where |
|---|---|---|
| 1 | **Add a model from its provider**: pick from the models the provider really offers, see which are already added, and get the model and price forms prefilled from the public catalog | `/admin/models/new` |
| 2 | **Price updates**: price changes the sync held back for review, missing catalog prices, and retired models, each applied or dismissed with a reason; plus "run sync now" | `/admin/price-updates` (new) |
| 3 | **Badge** with the number of open findings in the admin sidebar. This is the only alert: the backend sends no email | Admin sidebar |

Admin-only screens may show provider and model names (brief §4).

## 2. Contract used (generated names)

| Use | Generated |
|---|---|
| Discovery | `adminProvidersAvailableModelsOptions({ path: { code } })` → `AvailableModelsDto` |
| Run sync now | `adminCatalogSyncRunMutation()`, body `{ reason }` → `CatalogSyncSummaryDto` |
| Findings list | `adminCatalogSyncListInfiniteOptions({ query: { status, limit } })` → `CatalogFindingPageDto { items, nextCursor: string \| null }` |
| Apply / dismiss | `adminCatalogSyncApplyMutation()`, `adminCatalogSyncDismissMutation()`, with path `id` and body `{ reason }` → `CatalogFindingDto` |
| Existing | `adminModelsCreateMutation`, `adminModelsSetPriceMutation`, `adminModesListOptions` (mode labels), `adminProvidersListOptions` |

Notes from the sync:
- **Nullable fields are always present, as `null`.** The brief marks them optional (`displayName?`, `catalog?`, …), but the spec has them always present and `null` when empty, so code checks for `null`.
- **Findings come newest first**, ordered by id, and filter by `status` only (default `open`, `limit` up to 100). There is no `kind` filter (see §6).
- **The generated infinite options have no `getNextPageParam`.** We map `nextCursor` → `cursor` ourselves, as `conversationListOptions` does.
- **`usedByEnabledModes` holds mode keys of enabled modes, sorted by key** (confirmed by the backend). Labels and links come from the cached admin modes list.
- **`changePct` is a decimal string** (`"62.50"`, sign included). It is shown as is: no arithmetic, `dir="ltr"`, with a `%` sign.
- **One run at a time:** a second run while one is going is refused with `409` (code to be named by the backend). Each model is also synced under its own row lock.
- **Agreed additions (pending the backend export):**
  - `GET /admin/catalog-sync/status` → `{ openFindings, openByKind, lastRun: { startedAt, finishedAt, trigger, summary } | null, nextRunAt, running: { startedAt, trigger } | null }`
  - `POST …/run` → `202 { runId }`
  - a `kind` filter on findings
  - `resolvedBy: { id, email } | null`
  - an optional `price` on `CreateModelDto`

## 3. Screens

### 3.1 Add model from provider (`/admin/models/new`)

Today this page is an empty `ModelForm`. It becomes two steps. The new search params `provider` and `model` go in the route's `validateSearch`, so Back and a reload keep the selection.

**Step 1: pick.**
- **Provider list:** the providers from the existing list.
  - A provider without a key shows «أضف مفتاح الواجهة البرمجية أولًا» ("add the API key first") with a link to `/admin/providers`.
  - A provider whose key is set loads `available-models`.
- **Table:** provider model id (LTR), name, context window, max output, a price summary (input/output per 1M, via `<Money kind="exact">`), and badges:
  - «مضاف» (added): links to `/admin/models/$addedModelId`. The row can't be selected.
  - «متوقف من المزود» (deprecated): `catalog.deprecated`.
  - «سعر متدرّج» (tiered price): `catalog.hasContextTiers`.
  - «يقرأ الصور» (reads images): `catalog.supportsImages`.
- **Client-side search** by id or name. The list is one response with no paging.
- **No catalog** (`catalogAvailable: false`): a notice above the table says «تعذّر الوصول إلى الكتالوج العام؛ أدخل البيانات والأسعار يدويًا» ("couldn't reach the public catalog; enter the details and prices by hand"). Rows still list; nothing is prefilled.
- **Errors, by code:**
  - `PROVIDER_KEY_MISSING`: link to set the key.
  - `PROVIDER_KEY_INVALID`: link to replace the key.
  - `PROVIDER_NOT_FOUND`: back to the list.
  - `PROVIDER_KEY_NOT_USED`: the `mock` provider kind has no key and nothing to discover. The picker doesn't offer it; this message is a fallback.
  - 502 / `PROVIDER_UNAVAILABLE`: retry.
- **«إدخال يدوي» (manual entry)** always skips to an empty form, for models the provider doesn't list.

**Step 2: prefilled form.**
- **Model fields:** `ModelForm` in create mode gets `initial` values:
  - provider code and id are set and read-only, with a "change" link back to step 1;
  - display name = `catalog.name` ?? `displayName` ?? id;
  - `contextWindow` and `maxOutputTokens` = catalog ?? provider values;
  - `supportsImages` = `catalog.supportsImages ?? false`;
  - thinking keeps the default;
  - the model starts **disabled** (as today).
- **Price fields:** an initial-price section in the same form, prefilled from `catalog.price`. It can be left empty to set a price later.
  - Values are copied as strings, never parsed as numbers.
  - A field label shows «من الكتالوج» ("from the catalog") while it still holds the catalog value.
- **Warnings** (warning `ChatNotice` style), above the submit button:
  - `deprecated`: «المزود يوقف هذا النموذج؛ لا تعتمد عليه في الأوضاع الجديدة.» ("the provider is retiring this model; don't rely on it in new modes")
  - `hasContextTiers`: «يكلّف المزود أكثر فوق حجم سياق معيّن، ونحن نحتسب سعرًا واحدًا. اخفض نافذة السياق إلى حد الشريحة أو سعّر بالشريحة الأعلى.» ("the provider charges more above a certain context size, and we bill one rate; lower the context window to the tier limit or price at the higher tier"). See §5.
- **Submit, with one `ReasonDialog` and one reason:** a single `adminModelsCreate` with the optional `price` (agreed, §6 item 4), so the model and its first price are saved together in one transaction and one audit entry. Then `invalidateCatalog` and navigate to `/admin/models/$id`.

  **If item 4 slips:** create, then `adminModelsSetPrice` with the same reason. If the price call fails, go to the model page anyway; its price form is prefilled with the values that didn't save (passed in navigation state), with the notice «أُنشئ النموذج لكن لم يُحفظ السعر» ("the model was created but the price wasn't saved").

### 3.2 Price updates (`/admin/price-updates`, new sidebar item «تحديثات الأسعار»)

- **Header:**
  - A short explanation: «تتم المزامنة كل 6 ساعات. تُطبَّق التغييرات حتى 50% تلقائيًا، والأكبر تنتظر مراجعتك.» ("the sync runs every 6 hours; changes up to 50% are applied automatically, larger ones wait for your review")
  - **«تشغيل المزامنة الآن»** (run sync now): opens a `ReasonDialog`. The run is asynchronous (`202 { runId }`; a run can take well over 30 s).
    - While `status.running` is set, the button is disabled and shows «جارٍ التحقق…» ("checking…") with the start time. This also covers runs started by the schedule or by another admin.
    - The status is polled every 3 s while running, otherwise every 10 minutes.
    - When the run ends, its summary appears as a result card (§3.3), and the findings and the badge refresh.
    - A `409` because a run is already going simply switches to the running state.
  - **Last run:** «آخر مزامنة: …» with its time and trigger (schedule or admin), and the next scheduled run.
  - **Failed last run** (`lastRun.error` set, `summary` null): a danger notice «فشلت آخر مزامنة» ("the last sync failed") with its time. A «التفاصيل» (details) disclosure shows the developer string in LTR, as the model test shows provider error details. Admins only.
  - **Stale warning:** if the last run finished more than 12 hours ago (two missed runs) or never happened, a warning says «لم تتم المزامنة منذ مدة؛ تحقّق من مهمة المزامنة» ("the sync hasn't run for a while; check the sync job"). Without this, a stopped job would look like "no updates".
- **Status tabs:** `open` (default), `applied`, `dismissed`, `superseded`. The selected tab is a search param.
- **Kind filter:** all, large change, missing price, retired. Sent to the server as `kind` (agreed, §6 item 2), and kept in a search param. The tab and filter chips show counts from `status.openByKind` on the open tab.
- **List:** cards rather than a wide table, because each finding compares two prices. «تحميل المزيد» (load more) uses the cursor. Each card shows:
  - the model display name, the provider and its id (LTR), and the kind badge;
  - for `large_change`: current price | proposed price for input, output, cached input and cache write (each via `<Money kind="exact">`, «—» when null), plus the change % chip;
  - for `catalog_price_missing`: the current price, and «لا يوجد سعر في الكتالوج» ("no price in the catalog");
  - for `model_retired`: a danger tone. «لم يعد المزود يقدّم هذا النموذج» ("the provider no longer offers this model"). **Modes using it**: chips linking to `/admin/modes/$key`, with labels from the admin modes list. When the list is empty: «لا تستخدمه أوضاع مفعّلة» ("not used by any enabled mode");
  - the dates first seen (`createdAt`) and last seen (`lastSeenAt`);
  - closed findings also show who resolved them (`resolvedBy.email`, linking to `/admin/users/$id`), when, and the reason;
  - a link to the model page.
- **Actions, on open findings only:**
  - **«تطبيق السعر» (apply the price):** `large_change` only, since the API refuses the other kinds with `CATALOG_FINDING_NOT_APPLICABLE`.
  - **«تجاهل» (dismiss):** all kinds. A dismissal is permanent: that finding is never raised again for that model. The dialog says so:
    - price kinds: «لن يُعرض هذا الاقتراح مرة أخرى.» ("this proposal won't be shown again")
    - `model_retired`: «يخفي التجاهل هذا التنبيه نهائيًا. يبقى النموذج مفعّلًا، وقد يرفضه المزود بالفعل.» ("dismissing hides this warning for good; the model stays enabled, and the provider may already reject it"). The sync never disables models or modes; that stays an admin action, so the card also links to the model and to each mode using it.
  - Each opens a `ReasonDialog` (reason required). After it succeeds:
    1. invalidate the findings, the model (`adminModelsGet`, `adminModelsPrices`) and the badge count;
    2. `invalidateCatalog` after an apply, since the price changed;
    3. show a toast.
- **Errors, by code**, with the dialog kept open and the reason kept on recoverable errors:
  - `CATALOG_FINDING_OUTDATED`: the notice offers «تشغيل المزامنة الآن».
  - `CATALOG_FINDING_NOT_OPEN` / `NOT_FOUND`: refresh the list, then show a toast.
  - `CATALOG_FINDING_NOT_APPLICABLE`: should not happen because the button is hidden; it is shown by code anyway.
- **Empty states**, one per tab: «لا توجد تحديثات بانتظار المراجعة» ("no updates waiting for review"), and so on.

### 3.3 Sync summary card

Shown when a run finishes, from `status.lastRun.summary`. Every count is labelled.
- **Headline counts:** checked, applied automatically, unchanged, held for review, no catalog price, not in catalog.
- **Smaller line:** skipped, failed, providers checked / unreachable, ignored.
- **Danger line:** retired models, and retired models still used by enabled modes.

If `catalogAvailable` is false: «تعذّر الوصول إلى الكتالوج؛ لم تتغيّر أي أسعار» ("couldn't reach the catalog; no prices changed"). The card closes on navigation; it is not stored.

### 3.4 Sidebar badge

- A count chip on «تحديثات الأسعار» in `AdminSidebar`.
- Refetched every 10 minutes, on window focus, and after any apply, dismiss or run.
- Its accessible name says it in words: «تحديثات الأسعار، 3 بانتظار المراجعة» ("price updates, 3 waiting for review").
- Hidden at 0.
- The count is `status.openFindings` (agreed, §6 item 1). The same status query feeds the page header, so the sidebar and the page share one cache entry.
- **If item 1 slips:** `GET findings?status=open&limit=100`, showing `100+` when `nextCursor` is set.

## 4. Code layout

```
features/admin/catalog/
  pages/ModelsPages.tsx         ModelNewPage → picker + prefilled form
  pages/PriceUpdatesPage.tsx    new
  components/ModelPicker.tsx    provider select, available-models table, states
  components/FindingCard.tsx    one finding (kind-specific body, actions)
  components/SyncSummary.tsx    run result
  components/ModelForm.tsx      `initial` + optional initial-price section + warnings
  model/catalog-sync.ts         list options with getNextPageParam, status query (polling while running), invalidation, error → UI mapping
  model/prefill.ts              AvailableModelDto → form values (pure, unit-tested)
features/admin/components/AdminSidebar.tsx   badge
routes/_authed/admin/price-updates/index.tsx  thin route (validateSearch: status, kind)
routes/_authed/admin/models/new.tsx           validateSearch: provider, model
```

The new copy is Arabic first, in `ar.json` and `en.json` under `admin.priceUpdates.*` and `admin.models.picker.*`. Error codes come from `errors:`.

## 5. Room for what the backend has not built yet

- **"Don't sync" per model** (decision pending, backend next-step 2): a «مزامنة السعر مع الكتالوج» ("sync the price with the catalog") switch in a new «الكتالوج» (catalog) section of `ModelForm`. The section is created now with the tier warning only. The switch is added when the field exists.
- **Tiered prices** (backend next-step 3): the `hasContextTiers` warning in the picker, and on the model page when known. If the backend adds a context cap or a tier field, it goes in the same section.

## 6. Missing from the API (sent to the backend)

| # | Ask | Why | Without it (fallback) |
|---|---|---|---|
| 1 | **`GET /admin/catalog-sync/status`** → `{ openFindings: number, openByKind: { large_change, catalog_price_missing, model_retired }, lastRun: { startedAt, finishedAt, trigger: 'schedule' \| 'admin', summary: CatalogSyncSummaryDto } \| null, nextRunAt }` | The badge needs a count. Admins also need to see that the scheduled sync runs at all: it is the only alert, and a silently failing job would look like "no updates". | The badge pages through findings (up to `100+`). No "last run" and no warning when the job stops. |
| 2 | **`kind` query filter** on `GET /admin/catalog-sync/findings` | The brief asks for a kind filter, and client-side filtering breaks across pages. | Client-side filter on the loaded pages only. |
| 3 | **`resolvedBy` documented**, plus a readable name: `resolvedByEmail` or `{ id, email }` | `resolvedBy` is an undocumented string (probably a user id); the history should say who resolved a finding. | Show the short id (`ShortId`) linking to `/admin/users/$id`. |
| 4 | *(Nice to have)* **Optional `price` on `CreateModelDto`**, saved in the same transaction and audit entry | Prefilled creation then becomes one call: no half-created model, and one reason. | Two calls, with the partial-failure recovery in §3.1. |
| 5 | **Doc fixes in OpenAPI:** (a) the new write operations don't list 400 `VALIDATION_FAILED` (missing `reason`); (b) describe `usedByEnabledModes` as mode keys | The generated docs say what clients can rely on. | — |
| 6 | **Answered:** a run is usually a few seconds but can pass 30 s (catalog download up to 20 s, 15 s per provider list, 15 s per missing model, run one after another). The backend changes `run` to `202 { runId }`, with progress on the status endpoint. | — | — |
| 7 | **Answered:** a dismissed `model_retired` finding is never raised again for that model, even if it reappears and retires again. The sync never disables models or modes. | — | — |

**Status (2026-10-15):** the backend agreed to items 1–5, waiting for approval in that session; item 3 becomes `resolvedBy: { id, email } | null`. The frontend re-runs `contract-sync` after the backend's export.

## 7. Order of work

1. **Backend builds §6 items 1–5** (approval in the backend session), then `contract-sync` again.
2. **Design**, needs your decision (§8 item 1).
3. **Build:** `ui-builder` builds the picker and the price-updates page; I build the model layer (`catalog-sync.ts`, `prefill.ts`).
4. **Tests** (`test-engineer`):
   - **unit tests:** `prefill`, error mapping and `getNextPageParam`;
   - **component and page tests with MSW:**
     - picker states (no key, invalid key, no catalog, added, deprecated, tiered, empty)
     - prefilled create, plus the partial-failure path
     - findings per kind and status, and apply/dismiss with reason
     - `OUTDATED`
     - the run summary
     - the badge count and `100+`
   - **Playwright admin flow** on the local stack, without paid calls: `available-models` calls the provider's model list, which is free, but needs a key.
5. **`frontend-reviewer` pass**, then commit.

## 8. Decisions (2026-10-15)

1. **Design:** the S16 board in `design/stitch/s16-catalog-sync/` was **approved 2026-10-15**, with the decisions in its REVIEW.md. It reuses the F4a admin patterns.
2. **Picker location:** `/admin/models/new` replaces the empty form, and each provider row on `/admin/providers` gets an «إضافة نموذج» (add model) button linking to `/admin/models/new?provider=<code>`.
3. **Dismissal is permanent**, as the backend built it: a dismissed finding is never raised again for that model.
4. **Backend:** approved to build §6 items 1–5. The frontend runs `contract-sync` after its export.
