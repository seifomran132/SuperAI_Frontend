# F10 — Vouchers: balance and trial codes

**Status:** Plan, 2026-11-06. Designs S21–S22 in progress (§4): no screen is built before its design is approved.
**Brief:** [F10_VOUCHERS_BRIEF.md](F10_VOUCHERS_BRIEF.md). **Binding contract:** `../SuperAI_Backend/docs/API_CONTRACT.md` §7 ("Vouchers"), `docs/ERROR_CODES.md`.
**Backend state:** commit `ed00631` on `main` (deploying; migration `Vouchers`).
**Goal:** a user can type a code and get balance or a trial plan; an admin can create, list, edit, deactivate codes and see who used them.
**Not payments:** redeeming a code is not a purchase or top-up (launch scope: no payments). Discount codes come with online payments, later.

## 1. Contract sync

Done 2026-11-06 against backend `ed00631` (on top of the uncommitted F9 sync; not committed). Additive only, no breaking change. Typecheck, lint and 515 unit tests pass.

| Call | Generated | Notes |
|---|---|---|
| `POST /me/vouchers/redeem` `{ code }` | `meVouchersRedeemMutation` → `RedeemResultDto { kind, creditedUsd, balanceUsd, plan: { key, nameAr, nameEn, currentPeriodEnd } \| null }` | 404 `VOUCHER_NOT_FOUND`; 409 `VOUCHER_EXPIRED`, `VOUCHER_USED_UP`, `VOUCHER_ALREADY_REDEEMED`, `VOUCHER_NOT_ELIGIBLE`, `NO_ACTIVE_SUBSCRIPTION`; 429 `RATE_LIMITED` (`data.retryAfterSeconds`) |
| `POST /admin/vouchers` | `adminVouchersCreateMutation` (`CreateVoucherDto`: `reason`, `kind`, `maxRedemptions`; optional `code`, `amountUsd`, `planKey`, `trialDays`, `startsAt`, `endsAt`, `newUsersOnly`, `note`) | **No `idempotencyKey`.** 409 `VOUCHER_CODE_TAKEN`, `PLAN_NOT_ACTIVE`; 404 `PLAN_NOT_FOUND` |
| `GET /admin/vouchers` | `adminVouchersList(Infinite)Options` → `{ items: VoucherDto[], nextCursor }` | `status?` (`active` \| `inactive`), `limit?`, `cursor?` |
| `GET /admin/vouchers/{id}` | `adminVouchersGetOptions` → `VoucherDto` (with `redemptionCount`, `plan`, `createdBy`) | 404 `VOUCHER_NOT_FOUND` |
| `PATCH /admin/vouchers/{id}` | `adminVouchersUpdateMutation` (`reason`; optional `isActive`, `endsAt` (null removes), `maxRedemptions`, `note`) | 400 for a limit below `redemptionCount` |
| `GET /admin/vouchers/{id}/redemptions` | `adminVouchersRedemptions(Infinite)Options` → `{ items: VoucherRedemptionDto[], nextCursor }` | `userId`, `userEmail`, `redeemedAt`, `creditedUsd`, `subscriptionId` |

**Error text (generated):** the six new codes say «الكود» (e.g. «هذا الكود غير صحيح. تأكد منه وحاول مرة أخرى.»). The UI uses the same word: «لديك كود؟», «استخدام الكود» (decision 1). The `voucher_credit` activity type already has its label (decision 6 is done).

## 2. Decisions

1. **Where users redeem:** a «لديك كود؟» box on `/balance` (under the balance card) and on `/plans` (under the plan cards). One shared component, `RedeemCodeBox`, in `src/features/balance` (exported from `ui.ts`, so the plans page imports it from there). Collapsed by default to a text button «لديك كود؟»; opens to a field + «استخدام الكود».
2. **The field:** LTR, upper-case display (`text-transform` is not used on Arabic; the value is LTR Latin), no autocomplete/autocorrect, `inputmode="text"`, max 40. Spaces and case are left to the API (it ignores them); the form only rejects an empty value.
3. **Errors by code (from the brief's table):**
   - `VOUCHER_NOT_FOUND`, `VOUCHER_EXPIRED`, `VOUCHER_USED_UP`, `VOUCHER_ALREADY_REDEEMED`, `VOUCHER_NOT_ELIGIBLE`: under the field (`t('errors:CODE')`), the code stays in the field.
   - `NO_ACTIVE_SUBSCRIPTION`: an inline notice explaining that a balance code needs a plan, with «عرض الباقات» (`/plans`) and «طلب رصيد» (the existing contact dialog).
   - `RATE_LIMITED`: the wait from `data.retryAfterSeconds` as a countdown, button disabled until it ends (same countdown hook as chat).
   - Network/other: the generic error with retry; the code is kept.
4. **Success:** the box shows a success state in place:
   - balance code: «أُضيف <Money signed value=creditedUsd/> إلى رصيدك.»
   - trial code: «تم تفعيل باقة «{{plan}}» حتى {{date}».» (plan name in the UI language, date in Western digits).
   Then invalidate the balance, `/me` subscription, balance activity (the `voucher_credit` row) and the plans page's current-plan query. The field clears; «استخدام كود آخر» reopens it.
5. **No double submit:** the button shows a spinner and is disabled while the request runs (a code is single-use per account, so a double click would only produce `VOUCHER_ALREADY_REDEEMED`, but it must not show an error after a success).
6. **Activity list:** `voucher_credit` gets its own label and icon in the balance activity — already labelled (see §1).
7. **Admin routes:** `/admin/vouchers` (list, filter active/inactive, paged with `cursor`), `/admin/vouchers/new` (create), `/admin/vouchers/$voucherId` (detail: edit, deactivate/activate, redemptions paged). Sidebar item «الأكواد» after «الباقات».
8. **Admin create form:** kind switch (balance / trial). Balance: amount (USD, ≤ 1000, decimal string, validated with `src/lib/money.ts`). Trial: plan picker (active plans except the default) + days (1–365). Both: max redemptions, code (optional; empty = generated, shown after creation with a copy button), start/end (date-time, local time shown, sent as ISO UTC), «للمستخدمين الجدد فقط», internal note, and the **reason** (required, like every admin write). `VOUCHER_CODE_TAKEN` on the code field; `PLAN_NOT_FOUND` / `PLAN_NOT_ACTIVE` on the plan field.
9. **Admin edit:** only what the API allows: active, end (or remove it), max redemptions (not below used; validated in the form too), note; with a reason. Kind, value, plan and start are read-only.
10. **Status shown in the list:** derived for display only: «فعّال», «متوقف» (`isActive: false`), «منتهي» (past `endsAt`), «لم يبدأ» (future `startsAt`), «مستنفد» (used = limit). Used/limit as «3 / 100».
11. **Idempotency:** the create endpoint takes a `reason` only (no `idempotencyKey` in the brief). A voucher is not money until redeemed, so a duplicate create is only a second code; the button is disabled while the request runs. *(Confirm in the sync: if the DTO has `idempotencyKey`, use one per action as elsewhere.)*

## 3. Slices

### Slice 0 — contract sync
- `npm run api:sync`; check the six error codes' Arabic text; fix fixtures; record in §1.

### Slice 1 — user redeem (after S21 is approved)
- `RedeemCodeBox` on `/balance` and `/plans`, all states (§2.3–2.5), cache refresh, activity label.
- MSW handlers for every outcome; component tests per error code, countdown, success (both kinds), double click.

### Slice 2 — admin vouchers (after S22 is approved)
- List, create, detail/edit, redemptions; reason dialogs; field errors from `details`.
- Component tests: validation (amount, days, code format, limit below used), each error code, generated code + copy.

### Slice 3 — tests and review
- Playwright (`playwright-tester`): admin creates a balance code and a trial code; a fresh user redeems each; balance and plan update; reuse is refused; 5 wrong codes → countdown. RTL and axe.
- `frontend-reviewer`; manual cases in `docs/testing/MANUAL_TEST_CASES.md` (new §3f).

## 4. Design (Stitch) — needed before building

| Screen | Content | States |
|---|---|---|
| **S21 redeem code** | the box on `/balance` and `/plans` (collapsed, open) | sending, each error, needs a plan, rate limited countdown, success (balance), success (trial), phone width |
| **S22 admin vouchers** | list; create form (balance / trial); detail with edit and redemptions | loading, empty, error, generated code with copy, deactivated, used up, phone width |

## 5. Out of scope (v1)
- Discount codes (need payments), bulk code generation, CSV export of redemptions, deleting a code (deactivate instead).

## 6. Risks
- The balance code needs an active plan; users without one (no plan yet) will hit `NO_ACTIVE_SUBSCRIPTION` often. The notice must make the next step obvious (plans / contact).
- Rate limit is per account: the countdown must survive a reload? The API answers with the remaining time again on the next try, so no local storage is needed.

## 7. Questions and asks for the backend
1. **Redemptions `status` param:** `GET /admin/vouchers/{id}/redemptions` documents `status`, but it does nothing there (the list's query DTO is reused). Please drop it from that endpoint's OpenAPI. We won't send it.
2. **Redeem with an empty or over-long code:** the spec lists no 400 for redeem. We expect `VALIDATION_FAILED`; please document it (the form blocks empty codes anyway).
3. **Create without an idempotency key:** confirm this is intended. A retried create after a lost response makes a second code; acceptable, since a code is not money until redeemed.
