# F11b — Voucher batches for resellers

**Status:** Built 2026-11-09 from approved S23, on branch `voucher-batches`, not merged.
**Brief:** [F11_VOUCHER_BATCHES_BRIEF.md](F11_VOUCHER_BATCHES_BRIEF.md). **Binding contract:** `../SuperAI_Backend/docs/API_CONTRACT.md` §7 ("Voucher batches").
**Backend state:** commit `5be2cac` on `main`; the routes answer on production.
**Goal:** an admin creates 3-100 single-use codes together, downloads them for a reseller, follows redemption, and can turn off the batch or one leaked code.
**Numbering:** the landing page is F11 ([F11_LANDING.md](F11_LANDING.md)), so this is F11b.
**Not payments:** a reseller's codes are ordinary vouchers; nothing is bought in the app.

## 1. Contract sync

Done 2026-11-09 against backend `5be2cac`. Additive: six batch calls, `VoucherDto.batchId`, error `VOUCHER_BATCH_NOT_FOUND`. It also brings the three F9 additions (audit facets, overview `label`, chat-request dates). Using those is separate work; only the mocks change here.

## 2. Screens (design S23)

1. **Batches tab** on `/admin/vouchers` beside single codes, the tab in the URL: name, kind, value, redeemed / quantity, total value, status, end date; status filter; load more; empty and error states.
2. **Create** `/admin/vouchers/batches/new`: name; kind; amount, or plan + days; quantity (default 10, 3-100); optional prefix with a live example code; optional dates, new users only, note; reason. Balance batches show quantity × amount before confirming, and block above $10,000.
3. **Created result:** the batch page, with the live-codes notice and Download CSV at the front.
4. **Detail** `/admin/vouchers/batches/$batchId`: redeemed / quantity, credited of total value; Download CSV; turn on or off; change end date and note; codes table with used/unused filter, copy, turn off one code, link to the user who redeemed it.
5. **Single voucher detail**, when a code has `batchId`: hide the redemption limit and link to the batch.

## 3. Decisions

1. **Reuse:** `DateTimeField`, the plan picker and validation from the single-voucher form, `RetryAlert`, `Section`, reason handling. Move shared parts within `features/admin/vouchers`; no new feature folder.
2. **Money:** the total is computed with `src/lib/money.ts` (decimal.js) and shown with `<Money>`. A browser-side block is a convenience: `400 VALIDATION_FAILED` on `amountUsd` is still shown on that field.
3. **Idempotency:** one UUID when the form opens, kept across retries of the same values; a new one after a success or any change to the values. `IDEMPOTENCY_KEY_REUSED` makes a new key and asks the admin to submit again.
4. **`VOUCHER_CODE_TAKEN`:** the generic error with a retry that uses a new key.
5. **CSV:** fetched with the bearer token and saved as a blob, named from the batch name. A dialog warns that the file contains live codes before every download. Failure keeps the page and shows an error.
6. **Turning off one code:** `PATCH /admin/vouchers/{id}` with `isActive: false` and a reason. It is shown as off even when the batch is on. Used codes offer no turn-off.
7. **Codes in the UI:** monospace, `dir="ltr"`, in a `<bdi>`, so dashes stay in order.
8. **Prefix:** letters and digits, shown upper case, 2-12. With no prefix the example shows the brand default the backend uses (`LAM7A-`), labelled as an example.
9. **Text:** all in `src/i18n/admin.{ar,en}.json`, using «كود» as the vouchers screens do.
10. **Audit:** none needed; the audit log shows raw action names.
11. **After approval:** a turned-off code can be turned back on; a batch code hides its end date as well as its limit; on phones the codes come right after progress.

## 4. Tests

Unit: total calculation and the $10,000 block, prefix example, idempotency key lifecycle, list, detail and code states, CSV success and failure, turn off one code, batch-code voucher detail. Playwright against the local stack: `VC-` cases for create, download, redeem one code, turn off a code, turn off a batch. New manual cases in `MANUAL_TEST_CASES.md`.

## 5. Order of work

1. Contract sync. Done.
2. Design S23, desktop and mobile; the user approves. Done (hand-built).
3. Build, then tests, review and browser check.
4. Merge after the backend's production deploy is confirmed by opening the batches list, because a route answering does not prove the migration ran.
