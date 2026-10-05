# F4 — Admin console plan

**Status:** Approved 2026-10-04 (recommended options)
**Branch:** `feature/f4-admin` from `dev`
**Why it matters:** the launch is admin-funded. Every customer's plan and balance is set by an admin, so these screens are the team's daily tool (backend README "Operating the launch").
**Backend:** all endpoints exist (24 admin paths, unchanged since our sync). The per-user usage view and overview counts (backend 10.5) are **not** built yet.

## 1. Who and how

- Admins only (`GET /me` → `isAdmin`). Route guard in the browser; the API (`@Roles('admin')`) is the real guard. Non-admins get not-found, not "forbidden".
- Entry: «لوحة الإدارة» in the account menu, shown only to admins. Not in the user sidebar.
- **Every write asks for a reason** (stored in the audit log) in its confirmation dialog.
- **Money and subscription writes** carry a fresh `idempotencyKey` (UUID) created when the dialog opens and reused only when retrying that same action. Offline purchases are de-duplicated by their payment reference instead.
- Money inputs are decimal strings (validated as text, never converted to numbers); amounts shown with `<Money>`.
- Desktop-first, dense tables; usable on tablet; phone not a target.

## 2. Phases

### F4a — Daily operations (build first)

| Screen | Route | Content | API |
|---|---|---|---|
| A1 Users | `/admin/users` | Search by email/name (`q`), filters (status, admin), paged table (email, name, status, admin, last sign-in, created) | `GET /admin/users?q&status&isAdmin&page&pageSize` |
| A2 User detail | `/admin/users/:id` | Header (name, email, status badge, email confirmed). Tabs: **Overview**, **Subscription**, **Balance** | below |
| — Overview | | Profile facts; **Suspend / Reactivate** (status + reason); **Grant / Remove admin** (reason; backend blocks self and last admin) | `GET /admin/users/:id`, `PATCH …/status`, `PUT …/admin-role` |
| — Subscription | | Current plan and period end; history table; **Activate plan** (plan, optional end date — default one month, reason, idempotency key); **End plan** (reason, with a warning that all balance expires) | `GET/POST /admin/users/:id/subscriptions`, `POST …/subscriptions/end` |
| — Balance | | Balance, reserved, spendable; ledger table (type, amount, balance after, actor, reason, reference, date; `before` pagination); **Add / remove funds** (signed amount, reason, idempotency key); **Record offline payment** (amount, payment reference, reason) | `GET …/balance`, `GET …/ledger`, `POST …/balance/adjustments`, `POST …/balance/purchases` |

Shortcuts on A1 rows: open, activate plan, add funds.

### F4b — Catalog and settings

| Screen | Route | Content | API |
|---|---|---|---|
| A3 Plans | `/admin/plans`, `/admin/plans/:key` | List (name, price, included balance, modes, active/public/default, active subscriptions); create/edit form (key, names/descriptions ar+en, monthly price, included balance, sort, public, active); **modes on plan** (multi-select) | `/admin/plans*`, `PUT …/modes` |
| A4 Providers | `/admin/providers` | List (code, kind, enabled, key last 4); **set / remove API key** (checked by the backend before saving); add OpenAI-compatible provider (code, name, base URL); enable/disable | `/admin/providers*` |
| A5 Models | `/admin/models`, `/admin/models/:id` | List (provider, model id, display name, limits, margin, enabled, used by modes, current price); create/edit; **price history** + schedule a new price (input/output/cached/cache-write per 1M, effective from); **test model** (paid request; shows reply, usage, cost, timing — requires confirmation) | `/admin/models*` |
| A6 Modes | `/admin/modes`, `/admin/modes/:key` | List with **ready / not-ready reason**; create/edit (key, labels/descriptions ar+en, model, own system prompt, sort, enabled) | `/admin/modes*` |
| A7 Settings | `/admin/settings` | Default margin % (pricing settings); default system prompt (chat settings) | `/admin/pricing-settings`, `/admin/chat-settings` |

Admin errors are shown by code from the catalog (`USER_NOT_FOUND`, `LAST_ADMIN`, `CANNOT_MODIFY_SELF`, `IDEMPOTENCY_KEY_REUSED`, `PAYMENT_REFERENCE_REUSED`, `MODEL_IN_USE`, `PRICE_PERIOD_CONFLICT`, `PROVIDER_KEY_INVALID`, …).

## 3. Architecture

- Feature `src/features/admin/` with sub-areas `users/`, `catalog/`, `settings/` (each with `pages/`, `components/`, `model/`, `__tests__/`); `index.ts` + `ui.ts` (admin screens load lazily, so customers never download them).
- Routes: `src/routes/_authed/admin/route.tsx` (admin guard + admin shell: own sidebar with Users, Plans, Providers, Models, Modes, Settings, and «العودة إلى التطبيق»), children per screen.
- Shared admin components: data table (`@tanstack/react-table`), `ReasonDialog` (reason + confirm, carries the idempotency key), money input, status badges, key-value panels.
- Data via generated HeyAPI options; after each write, invalidate the affected queries (user, subscriptions, balance, ledger; and the customer-facing `/plans`, `/modes` when the catalog changes).

## 4. Process (lean)

| Step | Who | Output |
|---|---|---|
| D | `stitch-designer`, hand-built HTML | **One** board for F4a: admin shell, users table, user detail (three tabs) and the reason/confirm dialog. F4b reuses these patterns, so no separate designs |
| — | **You approve** | |
| B1 | `admin-builder` (new agent, defined in the original plan) | F4a |
| R1 | `frontend-reviewer` | F4a review → fixes → commit |
| B2 | `admin-builder` | F4b |
| R2 | `frontend-reviewer` | F4b review → fixes → commit |
| M | me | Browser check with the admin account; add admin cases to `MANUAL_TEST_CASES.md` |

## 5. Decisions (2026-10-04)

1. **Admin UI language:** Arabic, right-to-left, same design system.
2. **F4a first** (daily operations), then F4b (catalog and settings).
3. **Usage view:** ask the backend for it now (10.5); add it as a fourth tab in A2 when the endpoint exists.
4. **Model test button:** kept in the UI behind a confirmation that says it is a real paid request.
5. **Branching:** `feature/f4-admin` was cut from `feature/f3-balance-account` while F3 was still uncommitted (user choice), so F3 changes travel with this branch until F3 is committed.
6. **Builder:** `ui-builder` with the admin rules in its brief (the planned `admin-builder` agent is not created, to keep the agent set small).
7. **F4a designs approved (2026-10-04):** `design/stitch/f4a-admin/` (hand-built). Reserved balance label «محجوز لردود جارية»; admin ledger labels as the customer ones except purchase «تسجيل دفعة» and adjustment «تعديل يدوي»; subscription status from the API's `status`/`endedReason`; loading/empty/suspended states follow existing app patterns; tablet uses the drawer.
