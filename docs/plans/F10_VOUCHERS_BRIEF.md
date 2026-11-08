# F10 brief: vouchers (balance and trial codes)

**From:** backend, 2026-11-06. **Status:** brief, ready to plan and build.
**Backend reference:** `../SuperAI_Backend/docs/API_CONTRACT.md` §7 ("Vouchers"), `docs/REVIEW_FINDINGS.md` ("Vouchers"). Backend commit `ed00631` on `main` (deploying; migration `Vouchers`).

Start with `contract-sync`: new endpoints, DTOs and **six new error codes** (Arabic and English text in `docs/ERROR_CODES.md`).

## What the backend does

- **Balance code** (e.g. `WELCOME5`): adds a USD amount to the balance. **Needs an active plan** (the balance expires with the plan, like any credit).
- **Trial code**: starts a plan for some days and credits that plan's included balance. **Refused while the user has another plan than the default one.**
- Each code **once per account**, and at most `maxRedemptions` in total. Optional start/end window, "new users only", internal note.
- After **5 wrong codes in 10 minutes**: `429 RATE_LIMITED` with `data.retryAfterSeconds`.
- Discount codes come later (need online payments).

## User side

`POST /me/vouchers/redeem` with `{ code }` (case and surrounding spaces do not matter) → `RedeemResultDto`:
`kind` (`balance` | `trial`), `creditedUsd`, `plan` (trials: `key`, `nameAr`, `nameEn`, `currentPeriodEnd`; else `null`), `balanceUsd` (spendable after).

| Error | When | Suggested UI |
|---|---|---|
| `404 VOUCHER_NOT_FOUND` | Unknown or deactivated code | Under the field |
| `409 VOUCHER_EXPIRED` | Outside its window | Under the field |
| `409 VOUCHER_USED_UP` | No redemptions left | Under the field |
| `409 VOUCHER_ALREADY_REDEEMED` | This account used it | Under the field |
| `409 VOUCHER_NOT_ELIGIBLE` | Trial while on another plan, or new-users-only | Under the field |
| `409 NO_ACTIVE_SUBSCRIPTION` | Balance code without a plan | Explain a plan is needed; link to plans / contact |
| `429 RATE_LIMITED` | Too many wrong codes | Show the wait (`retryAfterSeconds`) and disable the button |

Suggested: a **"Have a code?"** box in the balance area (and on the plans page): text field + "Redeem". On success, a confirmation: "+$5.00 added" or "«Pro» plan active until …", then refresh balance, subscription and activity (the credit shows as a `voucher_credit` entry in `GET /me/balance/activity`).

## Admin side

| Call | Notes |
|---|---|
| `POST /admin/vouchers` | `kind`; balance: `amountUsd` (≤ 1000); trial: `planKey` (active, not the default plan) + `trialDays` (1-365); `maxRedemptions`; optional `code` (4-40 letters, digits, dashes; stored upper case; omit to generate like `LAM7A-7KQ2-XH9M`), `startsAt`, `endsAt`, `newUsersOnly`, `note`; `reason`. `409 VOUCHER_CODE_TAKEN`, `404 PLAN_NOT_FOUND`, `409 PLAN_NOT_ACTIVE`. |
| `GET /admin/vouchers?status=active|inactive&limit&cursor` | Newest first. |
| `GET /admin/vouchers/{id}` | With `redemptionCount`. |
| `PATCH /admin/vouchers/{id}` | `isActive`, `endsAt` (null removes it), `maxRedemptions` (not below `redemptionCount`), `note`; `reason`. Kind, amount, plan and start never change. |
| `GET /admin/vouchers/{id}/redemptions?limit&cursor` | `userId`, `userEmail`, `redeemedAt`, `creditedUsd`, `subscriptionId`. |

Suggested screens: a **Vouchers** admin page (list with status, kind, value, used/limit, window), a create form (kind switch; generate or type a code; copy button), a detail page (edit, deactivate, redemptions list linking to users). All changes need a reason, like other admin forms.

## Rules

Money via `<Money>` and `src/lib/money.ts`; errors by `code`; RTL first.
