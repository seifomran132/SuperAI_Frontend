# F9 brief: admin reports and "my usage"

**From:** backend, 2026-11-05. **Status:** brief, ready to plan and build.
**Backend reference:** `../SuperAI_Backend/docs/API_CONTRACT.md` §7 (endpoint lists, monthly statement), `docs/IMPLEMENTATION_MODULES.md` P1-01. Backend commit `8810f86` on `main` (deploying; one migration, indexes only).

Start with `contract-sync`: the new endpoints and DTOs are in `openapi/openapi.json`.

## Endpoints

| operationId (expected) | Call | Shape |
|---|---|---|
| `adminReports_overview` | `GET /admin/overview?from&to` | `OverviewDto` |
| `adminReports_userUsage` | `GET /admin/users/{id}/usage?from&to` | `UserUsageDto` |
| `adminReports_chatRequests` | `GET /admin/chat-requests?userId&status&limit&cursor` | `{ items: AdminChatRequestDto[], nextCursor }` |
| `adminReports_audit` | `GET /admin/audit?actorId&action&resourceType&resourceId&from&to&limit&before` | `{ items: AuditEntryDto[], nextBefore }` |
| `meUsage_usage` | `GET /me/usage?month=YYYY-MM` | `MyUsageDto` |

- **Periods** (`from`, `to`): UTC days `YYYY-MM-DD`, both included. Default: the last 30 days. At most 366 days. `from` after `to`, a bad date or too long a period is `400 VALIDATION_FAILED`.
- **Money:** USD decimal strings (9 places). Use `<Money>` and `src/lib/money.ts`; never arithmetic on strings.
- **Privacy:** admin reports show metadata and money only, **never message content**. `/me/usage` shows modes by label only (`labelAr`, `labelEn`), never providers or models.

### Shapes (short)

- `UsageTotalsDto`: `requests`, `flaggedRequests`, `inputTokens`, `cachedInputTokens`, `outputTokens`, `chargedUsd`, `providerCostUsd`, `marginUsd` (charged − cost, can be negative), `absorbedUsd` (cost above the hold that we paid).
- `UserUsageDto`: `userId`, `from`, `to`, `totals`, `byMode[]` (+`modeKey`), `byModel[]` (+`modelId`, `providerCode`, `providerModelId`, `displayName`), `byDay[]` (+`date`; every day, zeros included).
- `OverviewDto`: `from`, `to`; `users { total, new, active }`; `subscriptions[] { planKey, nameAr, nameEn, active }`; `money { purchasesUsd, subscriptionCreditsUsd, voucherCreditsUsd, adjustmentsUsd, expiredUsd }`; `usage` (totals); `imagesCreated`, `imagesUploaded`; `openCatalogFindings`; `requestsToReview`; `topModes[]` and `topModels[]` `{ key, requests, chargedUsd }`; `byDay[] { date, requests, chargedUsd, providerCostUsd, newUsers }`.
- `AdminChatRequestDto`: `requestId`, `createdAt`, `settledAt`, `userId`, `userEmail`, `conversationId`, `modeKey`, `modelId`, `modelDisplayName`, `providerCode`, `providerModelId`, `status` (`reserved` | `settled` | `released` | `reconciliation_required`), `usageSource` (`provider` | `estimated`), tokens, `reservedUsd`, `chargedUsd`, `providerCostUsd`, `absorbedUsd`.
- `AuditEntryDto`: `id`, `occurredAt`, `actorType`, `actorId`, `actorEmail`, `actorLabel`, `action`, `resourceType`, `resourceId`, `oldValue`, `newValue` (JSON), `reason`.
- `MyUsageDto`: `month`; `totals { messages, chargedUsd, inputTokens, outputTokens }`; `byMode[] { modeKey, labelAr, labelEn, messages, chargedUsd }` (labels `null` if the mode was removed); `byDay[] { date, messages, chargedUsd }` (every day of the month up to today).

## Suggested screens

1. **Admin dashboard (overview):** period picker (presets 7 / 30 / 90 days and custom), cards (users, active plans, charged, provider cost, margin, absorbed, images), a daily chart (charged vs provider cost, requests, new users), top modes and models, and two "needs attention" counters linking to the lists below (requests to review, open catalog findings).
2. **User detail → Usage tab:** the same period picker; totals; tables by mode and by model; a daily chart; the user's recent requests (`chat-requests?userId=`), paged.
3. **Requests to review:** `chat-requests?status=reconciliation_required`, newest first, with user, mode, model, estimated vs provider usage, held, charged, absorbed; link to the user.
4. **Audit log:** filters (action, resource type and id, admin, dates), newest first, expandable old/new values and reason.
5. **User side — "My usage" page** (balance area): month picker (current by default, no future months), totals, by mode (labels), a daily chart.

Charts: follow the existing chart conventions if there are any; RTL first.

## Coming next from the backend

P1-03 vouchers (balance and trial codes): admin voucher management and a user "redeem code" box. A separate brief will follow.
