# F3 — Balance, Account and Plans plan

**Status:** Approved 2026-10-04
**Screens:** S10 Balance and activity · S11 Account and plan · S12 Plans
**Branch:** `feature/f3-balance-account` from `dev` (after F2 is merged)
**Size:** small — read-mostly pages, one form, no streaming. Lean process: one design run, one build run, one review.

## 1. Launch rules these pages must explain

- One shared USD balance; each answer is charged by mode and actual use.
- No in-app payments. Plans and balance are added by the team → «طلب رصيد» / «تواصل معنا» opens the existing request-balance dialog (S14).
- A plan lasts one month from activation unless the team sets another end date. **All balance expires when the plan ends.** Renewal = the team activates the plan again (remaining balance is kept and the plan's included balance is added).
- Users see modes, never models.

## 2. Pages

### S10 Balance — `/balance` (inside the app shell)

| Part | Content | API |
|---|---|---|
| Balance card | Spendable balance, large (`<Money>`), «طلب رصيد» button | `GET /me/balance` |
| Plan line | Plan name; «ينتهي رصيدك بانتهاء الباقة في {date}» when there is an end date; no-plan notice + «تواصل معنا» when there is no subscription | `GET /me/subscription` |
| Activity | Newest first, loads older on scroll («before» cursor). Each row: type label, signed amount (+ green / − neutral), balance after, date and time | `GET /me/balance/activity?limit=30&before=` |

Activity type labels (new copy for approval):

| Type | Arabic |
|---|---|
| `subscription_credit` | رصيد الباقة |
| `purchase` | إضافة رصيد |
| `usage_charge` | استخدام المحادثة |
| `voucher_credit` | رصيد قسيمة |
| `refund` | استرداد |
| `adjustment` | تعديل من الفريق |
| `expiry` | انتهاء الرصيد |

States: loading skeleton, empty («لا توجد عمليات بعد»), error with retry, load-more error with retry.
Known gap (backend): activity rows don't link to a conversation or mode, so usage rows show only «استخدام المحادثة».

### S11 Account — `/account` (inside the app shell)

| Part | Content | API |
|---|---|---|
| Profile | Full name and phone (optional, `dir="ltr"`) editable; email read-only; «حفظ» with success toast; server field errors from `details` | `GET /me`, `PATCH /me` |
| Plan | Plan name and description, start and end dates, price («مجاني» when 0), enabled modes (labels from `/modes`); «تواصل معنا» to change or renew; link to the Plans page | `GET /me/subscription`, `GET /modes` |
| Security | «تغيير كلمة المرور» (decision 1) | GoTrue `updateUser` |
| Session | «تسجيل الخروج» | existing `signOut` |

States: loading, error with retry, no-plan variant, save pending/success/failure.

### S12 Plans — `/plans` (public)

- Cards from `GET /plans`: name, description, monthly price (or «مجاني»), included balance, enabled modes with their descriptions, «تواصل معنا للاشتراك».
- Signed in: the current plan is marked «باقتك الحالية» and the page sits in the app shell; signed out: auth-style layout with sign-in / sign-up links (decision 2).
- No checkout or prices to pay in-app.
- States: loading, empty («لا توجد باقات متاحة حاليًا»), error with retry.

## 3. Architecture

- New feature folders following CLAUDE.md: `src/features/balance/`, `src/features/account/`, `src/features/plans/` (each `index.ts`, `pages/`, `components/`, `model/`, `__tests__/`).
- Routes: fill the existing empty `_authed/_app/balance.tsx` and `account.tsx`; add `/plans` (public).
- Data only through generated HeyAPI options; balance shares the cache key with the chat header chip, so updates from chat show here without refetching.
- Reuse: `RequestBalanceDialog` and `ContactChannels` move from the chat feature to `src/components` (shared by three features).
- Dates: `Intl.DateTimeFormat('ar', { numberingSystem: 'latn' })`, absolute dates for plan end, relative for activity rows in the last week.

## 4. Work breakdown (lean)

| Step | Who | Output |
|---|---|---|
| D | `stitch-designer` (hand-built HTML if Stitch times out) | S10, S11, S12 desktop + one mobile board; states on one board |
| — | **You approve** designs + copy | |
| B | `ui-builder` | Three features, routes, copy, focused component tests |
| R | `frontend-reviewer` | One review |
| M | me | Browser check with your funded account, add cases to `docs/testing/MANUAL_TEST_CASES.md`, commit |

## 5. Decisions (2026-10-04)

1. **Change password on the Account page:** yes — new + confirm fields via GoTrue `updateUser`, same rules and errors as reset.
2. **Plans page:** public and prerendered for signed-out visitors; inside the app shell for signed-in users.
3. **Landing page (S13):** not now — finish the app functionality first.
4. **Activity type labels:** approved as in §2.
