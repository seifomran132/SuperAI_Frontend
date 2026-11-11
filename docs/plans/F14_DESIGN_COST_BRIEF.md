# F14 brief: design cost on the request summary (stage 3)

**From:** backend, 2026-11-10. **Status:** short note, builds on F13.
**Backend reference:** `../SuperAI_Backend/docs/API_CONTRACT.md` §11.3. Backend not committed yet; one migration `AgentRuns`.

Run `contract-sync`: new fields on the summary input, on balance activity and on admin agents.

## Request summary (`ui.type: 'summary'`, step `design_summary`)

`ui.estimate` is `null` while the agent can't price designs yet. Otherwise it has:
- **`aboutUsd`:** the usual cost.
- **`atMostUsd`:** the most it can cost; this amount is held when the design starts.
- **`variants`:** how many designs will be made.
- **`balanceUsd`:** spendable now.
- **`fitsVariants`:** how many variants the balance covers.

Suggested UI on the summary card:
- **Cost line:** "about $0.06 · at most $0.12" (use `<Money>`).
- **When `fitsVariants` is less than `variants` but more than 0:** a note such as "Your balance covers 1 design". The user can still confirm; stage 4 will make that many.
- **When `fitsVariants` is 0:** say the balance is too low and link to the balance page. Keep "Change" available.

## Balance activity

`GET /me/balance/activity` entries now have **`agent`** (`key`, `labelAr`, `labelEn`) on design charges, with `mode: null`. Show the agent label, for example "مصمم جرافيك", where chat charges show the mode, and link to `conversationId` as for chats.

## Admin agents page (from F13)

`PATCH /admin/agents/{key}` also takes:
- **`promptModelId`:** a text model.
- **`imageModelId`:** a model that creates images.
- **`checkModelId`:** a model that reads images.
- **`variants`:** 1-3, default 2.
- **`marginOverridePct`:** 0-500, or empty to use the models' margins.

`GET /admin/agents` returns the three models (`id`, `displayName`), `variants`, `marginOverridePct` and **`ready`**, which is true once all three models are set, switched on and priced. Show a "not ready" badge when it's false. The model pickers can filter the model list by capability (`generatesImages`, `supportsImages`).
