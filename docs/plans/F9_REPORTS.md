# F9 — Reports: admin dashboard, usage, requests to review, audit log, "My usage"

**Status:** Plan, 2026-11-05. Decisions 1, 2 and the My-usage totals confirmed by the user 2026-11-06. Designs S18–S20 in progress (§4): no screen is built before its design is approved.
**Brief:** [F9_REPORTS_BRIEF.md](F9_REPORTS_BRIEF.md). **Binding contract:** `../SuperAI_Backend/docs/API_CONTRACT.md` §7.
**Backend state:** commit `8810f86` on `main` (deploying; one migration, indexes only).
**Goal:** the admin can see how the service is doing for any period (users, money, usage, margin, what needs attention), drill into one user's usage, review flagged requests and read the audit log; a user can see what they used each month, by mode.

## 1. Contract sync

Done 2026-11-05 against backend `8810f86` (not committed). Additive only: no breaking change, **no new error codes** (54). Typecheck, lint and 515 unit tests pass.

| Endpoint | Generated | Params |
|---|---|---|
| `GET /admin/overview` | `adminReportsOverviewOptions` → `OverviewDto` | `from?`, `to?` (UTC `YYYY-MM-DD`; default to = today, from = to − 29 days; at most 366 days) |
| `GET /admin/users/{id}/usage` | `adminReportsUserUsageOptions` → `UserUsageDto` | `id`, `from?`, `to?`; `USER_NOT_FOUND` 404 |
| `GET /admin/chat-requests` | `adminReportsChatRequestsOptions` / `…InfiniteOptions` → `ChatRequestPageDto { items, nextCursor }` | `userId?`, `status?` (`reserved`, `settled`, `released`, `reconciliation_required`), `limit?` (1–100, default 50), `cursor?` |
| `GET /admin/audit` | `adminReportsAuditOptions` / `…InfiniteOptions` → `AuditPageDto { items, nextBefore }` | `from?`, `to?`, `actorId?` (uuid), `action?`, `resourceType?`, `resourceId?`, `limit?` (1–100, default 50), `before?` |
| `GET /me/usage` | `meUsageUsageOptions` → `MyUsageDto` | `month?` (`YYYY-MM`, UTC, default current; a future month is 400) |

Notes: every money field is a decimal string. In `AdminChatRequestDto`, `modelDisplayName`, `providerCode`, `providerModelId`, `userEmail`, the tokens and `chargedUsd` / `providerCostUsd` / `absorbedUsd` are nullable (null while `reserved`). `AuditEntryDto.actorType` is `user`, `admin`, `system` or `cli`; `oldValue` / `newValue` are objects or null.

## 2. Decisions

1. **Charts use Recharts through shadcn/ui's `chart` component** (user decision 2026-11-06: a library, because more complex charts will come). Why this one:
   - It fits the stack: shadcn's `chart` (`src/components/ui/chart.tsx`) wraps Recharts and takes its colours from CSS variables, so charts use our tokens (`--color-brand`, `mode-1…`) with no hex values, and the component is ours to adapt like the other shadcn parts.
   - It covers what's likely next: bar, line, area, stacked, combined bar + line, pie/donut, and two Y axes, all as React components, SVG, with tooltips and legends.
   - RTL: `XAxis reversed` puts the first day on the right (decision 2); the Y axis moves to the right with `orientation="right"`; tooltips and legends are our own components from the shadcn wrapper, so their text is Arabic and right-aligned.
   - Size: about 100 KB gzipped, loaded only with the report pages (admin chunk and the `/usage` route chunk), never on the first screen; `npm run size` keeps checking the shell. Not ECharts (canvas, ~300 KB+, styling outside our tokens) or Chart.js (canvas, not React).
   - Every chart still gets a table version for screen readers and exact values («عرض كجدول»), and animations are off when the user prefers reduced motion.
2. **Time runs right to left in RTL charts:** the first day of the period is on the right and today is on the left, matching the reading direction and the RTL layout. *(Approved by the user, 2026-11-06.)*
3. **The period lives in the URL** (`?from=YYYY-MM-DD&to=YYYY-MM-DD`, or `?days=7|30|90`), so a report can be reloaded and shared. Presets 7 / 30 / 90 days, plus a custom range made of two native date fields (no date-picker library). With no period, the API's default (last 30 days) applies and the picker shows «آخر 30 يومًا».
4. **Periods are UTC days**; the page says so once under the picker («الأيام بتوقيت UTC»). A range the API refuses (`VALIDATION_FAILED`: start after end, over 366 days) is caught in the form first (zod) and, if it still comes back, shown on the picker fields from `details`.
5. **Admin home becomes the dashboard:** `/admin` → `/admin/overview` (today it redirects to `/admin/users`). The sidebar gets «نظرة عامة» first, then «الطلبات المُعلَّمة» (no badge: nothing can be marked reviewed until P1-07, see §7) and «سجل التدقيق».
6. **Routes:**
   - `/admin/overview` — dashboard
   - `/admin/users/$userId?tab=usage` — new Usage tab (with the same period search params)
   - `/admin/requests` — requests to review (`status=reconciliation_required`); a status filter allows the other statuses too
   - `/admin/audit` — audit log with filters in the URL
   - `/usage` — "My usage", inside the app shell; linked from the balance page («عرض الاستهلاك») and the account menu. `?month=YYYY-MM`, current month by default.
7. **Money and counts:** every amount through `<Money>`; margin can be negative and shows the sign (`signed`), in the danger colour only when negative. Token counts use Western digits with thousands separators (`Intl.NumberFormat('en')`, as elsewhere). No arithmetic on money strings: percentages (e.g. margin %) come from `src/lib/money.ts` helpers, added if missing.
8. **Privacy:** admin screens show metadata and money only (the API never sends content). "My usage" shows mode labels only; a removed mode (`labelAr: null`) shows «وضع محذوف». Never a provider or model name on a user screen.
9. **Lists page like the rest of admin:** chat requests with `cursor`, audit with `before`, newest first, «تحميل المزيد» (infinite query), same loading / empty / error states as the ledger.
10. **Audit values:** `oldValue` / `newValue` are JSON; a row expands to show them side by side as LTR code blocks (pretty-printed), plus the reason. Actor shows the label or email, with the id via `ShortId`.
11. **Mode colours by position** (`mode-1…`) in "My usage" and admin top modes, as in chat. Model rows in admin use the neutral colour.
12. **One new dependency:** `recharts` (added by `npx shadcn add chart`, then adapted to our tokens and logical classes). Nothing else beyond the stack.

## 3. Slices

### Slice 0 — contract sync
- `npm run api:sync`; fix fixtures and types; record the result in §1. Commit only when asked.

### Slice 1 — shared parts (no screen yet)
- `npx shadcn add chart` (adds `recharts` and `src/components/ui/chart.tsx`), adapt it to our tokens and RTL; then `src/components/charts/` with `DailyChart` (bars or bars + line, reversed X axis) and `ChartTable` (the table version), `PeriodPicker` (admin) and `MonthPicker` (user), period search validation (zod), number formatting helper. Unit tests for RTL order, empty data (all zeros), long periods (366 bars → thin bars, labels thinned), reduced motion.
- MSW handlers for the five endpoints (`src/mocks/reports.ts`), with zeros, normal and large data sets.

### Slice 2 — admin dashboard (after S18 is approved)
- `/admin/overview`: period picker; cards (users total/new/active, active plans by plan, charged, provider cost, margin, absorbed, images created/uploaded); daily chart (charged vs provider cost; requests; new users) with series switch; top modes and top models; «تحتاج إلى انتباه»: flagged requests (count, «طلبات مُعلَّمة») → `/admin/requests`, open catalog findings → `/admin/price-updates`.
- `/admin` redirect and sidebar items.

### Slice 3 — user Usage tab, requests to review, audit log (after S19 is approved)
- Usage tab: totals, by mode, by model, daily chart, the user's recent requests (`chat-requests?userId=`), paged.
- `/admin/requests`: table (time, user → link, mode, model, status, usage source estimated/provider, held, charged, provider cost, absorbed), status filter, paging. Phone width: rows become cards.
- `/admin/audit`: filters (action, resource type, resource id, admin, from/to), expandable rows.

### Slice 4 — "My usage" (after S20 is approved)
- `/usage`: month picker (current month default, no future months, back to the account's first month or 12 months), totals (messages, charged), by mode with labels, daily chart; links from the balance page and account menu.

### Slice 5 — tests and review
- Component tests per screen (loading, empty, error with retry, data, invalid period); Playwright: dashboard and My usage against the local stack with the mock provider (`playwright-tester`), RTL and axe; `frontend-reviewer`.
- Manual cases added to `docs/testing/MANUAL_TEST_CASES.md` (new §3e).

## 4. Design (Stitch) — needed before building

| Screen | Content | States |
|---|---|---|
| **S18 admin dashboard** | period picker, cards, daily chart, top modes/models, needs-attention | loading, no activity in the period (zeros), error, negative margin, phone width |
| **S19 admin usage, requests, audit** | user Usage tab; requests-to-review table; audit log with filters and an expanded row | loading, empty («لا توجد طلبات مُعلَّمة»), error, phone width (cards) |
| **S20 My usage** | month picker, totals, by mode, daily chart, link from balance | loading, a month with no use, a removed mode, error, phone width |

## 5. Out of scope (v1)
- CSV export, comparing two periods, time zones other than UTC, per-hour charts.
- Message content anywhere in reports.
- Vouchers (P1-03): separate brief; the dashboard already shows `voucherCreditsUsd`.

## 6. Risks
- 366 daily bars on a phone: bars get very thin; the chart scrolls horizontally inside its card instead of the page (no page scroll at 375 px).
- `/me/usage` cost per message is shown as a month total only; per-answer cost stays hidden (launch scope, 2026-10-15). Monthly and per-mode totals are fine to show (user, 2026-11-06).

## 7. Questions and asks for the backend
**Backend answers (2026-11-05):**
- **Answered, no API change:**
  - *6, definitions:* `users.total` = accounts not deleted; `users.new` = created in the period (even if deleted since); `users.active` = distinct users with at least one chat request in the period; `flaggedRequests` = `reconciliation_required` requests in that report's period and scope; `requestsToReview` = all `reconciliation_required` requests now, any date.
  - *7:* the month picker goes back to the `createdAt` month (earlier months return zeros; only future or malformed months are refused).
  - *3, in part:* `topModels.key` is `providerCode/providerModelId` (e.g. `google/gemini-2.5-flash`), not a model id; `topModes.key` is the mode key.
- **Proposed by the backend, waiting for the user's OK:** `GET /admin/audit/facets` (actions, resource types, admins with id and email) for 1 and 2; a `label` on `topModes` / `topModels` for 3; `from` / `to` on `/admin/chat-requests` for 5. Until they're live: audit filters are free text, top models show the key, and the Usage tab's request list is not filtered by period.
- **Later (P1-07):** "mark reviewed" for 4. Until then `requestsToReview` is shown as a **count of flagged requests**, not a to-do queue: the sidebar item has no badge and the dashboard card reads «طلبات مُعلَّمة».

The questions as sent:

1. **Audit filter values:** `action` and `resourceType` are free strings. Dropdowns need the list: an enum in the OpenAPI, or `GET /admin/audit/facets` returning the distinct values. Until then the filters are free-text fields.
2. **Filter audit by admin:** `actorId` takes a uuid only. Could it also accept `actorEmail` (or the facets include the admins), so the filter can be a picker?
3. **Top modes and models labels:** `OverviewCountDto` has only `key`. Is `key` the `modelId` for models? Adding `label` (mode `labelAr` / model `displayName`) saves joining `/admin/modes` and `/admin/models` and covers removed ones.
4. **Requests to review, any action?** The list is read-only. Will there be a way to mark a request as reviewed, so `requestsToReview` goes down? Otherwise it only grows.
5. **Chat requests by date:** `/admin/chat-requests` has no `from` / `to`, so the user Usage tab's request list ignores the chosen period. Add them?
6. **Definitions for help text:** `users.active` (at least one request in the period?), `users.new` (signed up in the period?), and `flaggedRequests` vs `requestsToReview`.
7. **My usage months:** the picker goes back to the account's creation month (`/me` `createdAt`). OK, or another limit?
