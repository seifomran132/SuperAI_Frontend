# F11 brief: voucher batches for resellers

**From:** backend, 2026-11-09. **Status:** brief, ready to plan and build.
**Backend reference:** `../SuperAI_Backend/docs/API_CONTRACT.md` §7 ("Voucher batches"), `docs/REVIEW_FINDINGS.md` ("Voucher batches"). Backend commit `5be2cac` on `main` (waiting for deploy approval; migration `VoucherBatches`).

Start with `contract-sync`: new endpoints, DTOs and **one new error code**, `VOUCHER_BATCH_NOT_FOUND` (Arabic and English text in `docs/ERROR_CODES.md`).

Admin only. The user's "Have a code?" box from F10 does not change.

## What the backend does

- A **batch** is 3-100 **single-use** codes made together (default 10), either balance or trial, chosen per batch.
- Codes look like `LAM7A-7KQ2-XH9M`, or `EID-7KQ2-XH9M` with a prefix.
- A balance batch can total at most **$10,000** (`quantity` x `amountUsd`). Each code is still at most $1,000.
- One user may redeem any number of codes from a batch.
- All codes are created together or not at all.

## Endpoints

| Call | Notes |
|---|---|
| `POST /admin/voucher-batches` | `name` (1-100), `kind`; balance: `amountUsd`; trial: `planKey` + `trialDays` (1-365); optional `quantity`, `prefix` (2-12 letters or digits, stored upper case), `startsAt`, `endsAt`, `newUsersOnly`, `note`; `reason`, `idempotencyKey`. Returns `201 VoucherBatchDto`. Errors: `400 VALIDATION_FAILED` (including over the total cap, on field `amountUsd`), `404 PLAN_NOT_FOUND`, `409 PLAN_NOT_ACTIVE`, `409 IDEMPOTENCY_KEY_REUSED`, `409 VOUCHER_CODE_TAKEN` (generation failed; extremely rare, safe to retry with a new key). |
| `GET /admin/voucher-batches?status=active\|inactive&limit&cursor` | Newest first, with progress. |
| `GET /admin/voucher-batches/{id}` | `404 VOUCHER_BATCH_NOT_FOUND`. |
| `PATCH /admin/voucher-batches/{id}` | `isActive`, `endsAt` (null removes it; applies to every code), `note`; `reason`. Kind, value, quantity and start never change. |
| `GET /admin/voucher-batches/{id}/codes?status=used\|unused&limit&cursor` | `id`, `code`, `isActive`, `redeemedAt`, `redeemedByUserId`, `redeemedByEmail`. |
| `GET /admin/voucher-batches/{id}/export` | CSV download. See below. |

`VoucherBatchDto`: `id`, `name`, `kind`, `amountUsd`, `plan` (`key`, `nameAr`, `nameEn`), `trialDays`, `quantity`, `prefix`, `startsAt`, `endsAt`, `newUsersOnly`, `isActive`, `note`, `createdBy`, `createdAt`, `updatedAt`, `redeemedCount`, `totalValueUsd` (balance batches; `null` for trials), `creditedUsd` (balance actually credited so far).

**Idempotency:** generate `idempotencyKey` once when the form opens, and keep it across retries of the same submit. Sending it again returns the original batch. Make a new key after a success or when the form's values change (the same key with different values is `409 IDEMPOTENCY_KEY_REUSED`).

**CSV:** the request needs the bearer token, so fetch it and save the blob; a plain link will not work. Columns: `code, kind, amount_usd, plan_key, trial_days, starts_at, ends_at, status, redeemed_at`. `status` is `unused`, `redeemed`, `inactive` or `expired`. It has no user data, so it can go to the reseller. Each download is recorded in the audit log, as action `voucher_batch.exported`.

## Changes to the existing vouchers page

- `GET /admin/vouchers` **no longer lists batch codes**. They are only reachable through their batch.
- `VoucherDto` has a new `batchId` (`null` for codes made one by one).
- To turn off one leaked code, use `PATCH /admin/vouchers/{id}` with `isActive: false`, using the `id` from the codes list. It stays off even if the batch is switched off and on again.
- `maxRedemptions` cannot be changed on a batch code (`400 VALIDATION_FAILED`). If the voucher detail page opens for a code with a `batchId`, hide that field and link to the batch.

## Suggested screens

1. **Batches tab** on the Vouchers page: name, kind, value, redeemed / quantity, total value, status, end date.
2. **Create form:** name; kind switch; amount or plan + days; quantity (default 10, min 3, max 100); optional prefix with a live example of a code; optional dates, new users only, note; reason. **For balance batches, show the total (quantity x amount) before confirming**, and block submit above $10,000.
3. **Batch detail:** progress (redeemed / quantity, credited of total value); **Download CSV**; turn the batch off or on; change end date and note; codes table with used/unused filter, copy button, "turn off this code", and a link to the user who redeemed it.

Warn before download that the file contains live codes. All changes need a reason, like other admin forms.

## Rules

Money via `<Money>` and `src/lib/money.ts`, never arithmetic on strings (use the money helpers for the form's total); errors by `code`; RTL first. Show codes in a monospace, left-to-right span so dashes stay in order.
