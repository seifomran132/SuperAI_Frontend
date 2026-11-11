# Manual test cases — F1 (auth) and F2 (chat)

**Covers:** everything built so far (F1 auth, F2 chat, F3 balance, account and plans, F4 admin console, F8 image creation, F9 reports, F10 vouchers, F11 landing page).
**How to record results:** in each case's **Result** column change `[ ]` to `[x]` when it passes, `[!]` when it fails, or `[-]` when skipped. Use **Notes** for anything worth keeping: for `[!]` the browser, screen width, what happened and the screenshot name; for `[-]` why it was skipped. Keep notes on one line (no `|`; use `<br>` for a line break).

### Automated coverage

Most cases also run as Playwright tests in `tests/cases/<file>.spec.ts`, titled with the case ID. The tests run against the local stack, on Chromium, Firefox, WebKit and two phone sizes. The **Notes** column says which file runs each case:
- **auto** `<file>`: fully automated.
- **auto, partly** `<file>`: only the part named is automated; check the rest by hand.
- **auto (fixme)** `<file>`: the test is written but marked `test.fixme` (right now only the mode-chip part of IC-14, listed as partly), used when the app doesn't do this yet or a product decision is open. It doesn't fail the run.
- No mark: manual only (AU-44, AU-45, IC-03, IC-04, IC-25). RP-20, RP-21 and VC-21 are marked manual with the reason.

Run them with `npm run test:e2e` (Chromium) or `npm run test:e2e:all` (every browser), then `npm run test:e2e:report`. The chat and image tests use local `e2e-*` modes and plans on the backend's free mock provider, which the tests create themselves. No real provider is called. Some error paths that the screen can't reach are tested with mocked API answers (AD-07 last admin, AD-18, AD-20, IC-28).

Open questions from automation (the expected text is unchanged until decided):
- **IC-12 / IC-13:** after sending at 16:9, a new chat still shows 16:9 instead of «تلقائي». Decide what a new chat starts with.
- **X-12:** arriving from the email link, `/auth/callback#access_token=…` is briefly in the address bar (GoTrue's implicit flow) until the app replaces it. The test allows that moment only.

### Test run

| Field | Value |
|---|---|
| Date | |
| Tester | |
| Environment | local / production (https://lam7ai.com) |
| Frontend commit | |
| Backend commit | |
| Browsers and widths | |
| Summary | passed 0 · failed 0 · skipped 0 · not run 0 |

---

## 0. Setup

### 0.1 Services

| Service | URL | Start with |
|---|---|---|
| Frontend | http://localhost:3001 | `npm run dev` in `SuperAI_frontend` |
| API | http://localhost:3000 | `npm run db:up` then `npm run start:dev` in `SuperAI_Backend` |
| GoTrue (auth) | http://localhost:9999 | started by `db:up` |
| Mailpit (emails) | http://localhost:8025 | started by `db:up` |

The Google provider key must be set and both modes ready (already true locally).

### 0.2 Accounts

| Name | What it is | How to get it |
|---|---|---|
| **A — new user** | Created during the tests (§1) | Sign up with a fresh address, e.g. `qa-<date>-1@test.local` |
| **B — funded user** | Active plan + balance | Your account (`free` plan active, $1.00 added) |
| **C — no plan** | Active account, no subscription | Account A right after sign-up, or the local test user |

Admin actions (Bruno, folder in brackets, or the admin API with the admin account from `bruno/.env`):
- Activate a plan: `POST /api/v1/admin/users/{id}/subscriptions` `{ reason, planKey: "free", idempotencyKey }` [9]
- Add / remove balance: `POST /api/v1/admin/users/{id}/balance/adjustments` `{ reason, amountUsd: "0.015000000" | "-0.005000000", idempotencyKey }` [11]
- Suspend / reactivate: `PATCH /api/v1/admin/users/{id}/status` [3]
- Disable a mode: `PATCH /api/v1/admin/modes/{key}` `{ isEnabled: false, reason }` [7] — re-enable after the test.

Reservation sizes (for the balance cases): a message reserves its input estimate plus up to 4,000 output tokens. Customer prices: **Fast** ≈ 0.35 / 2.10 USD per 1M tokens (in/out) → about **0.009$** per short message; **Professional** ≈ 1.05 / 5.25 → about **0.022$**.

### 0.3 Browsers and widths

Run §1–§3 at least once in **Chrome desktop (1440px)** and once on **mobile width (390px)** (DevTools device mode or a phone). Spot-check Firefox, Safari and Edge for §2.1–§2.3. Tablet (800px) for §2.1 only.

---

## 1. Auth (F1)

### 1.1 Sign up — `/sign-up`

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| AU-01 | Open `/sign-up` | Arabic, right-to-left; monogram «ل» with «لمحة AI» under it; fields name, email, password; «8 أحرف على الأقل» shown under password before typing; no terms checkbox | [x] | **auto** `auth` |
| AU-02 | Press «إنشاء حساب» with everything empty | «أدخل اسمك الكامل.», «أدخل بريدًا إلكترونيًا صحيحًا.», password error; focus moves to the name field; nothing sent | [x] | **auto** `auth` |
| AU-03 | Email `abc`, password `1234` | Invalid email + «كلمة المرور قصيرة. استخدم 8 أحرف على الأقل.» | [x] | **auto** `auth` |
| AU-04 | Name of 101+ characters | Name-too-long error | [x] | **auto** `auth` |
| AU-05 | Email and password fields | Typed text runs left-to-right; the eye button shows/hides the password and its label changes (screen reader: «إظهار/إخفاء كلمة المرور») | [x] | **auto** `auth` |
| AU-06 | Valid name/email/password for **A**, submit | Button shows a spinner and can't be double-clicked; lands on `/check-email?reason=signup`; the URL does **not** contain the email | [x] | **auto** `auth` |
| AU-07 | Sign up again with **A**'s email (after A confirmed it) | Stays on sign-up; under the email field «هذا البريد الإلكتروني مسجّل بالفعل. سجّل الدخول أو استعد كلمة المرور.»; the field is focused and the values are kept; no email is sent | [ ] | **auto** `auth`<br>Decided 2026-11-06: say the email exists (it was «تحقق من بريدك الإلكتروني»). Sign-up attempts are limited per IP by GoTrue (see AU-18). |

### 1.2 Check your email — `/check-email`

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| AU-08 | After AU-06 | Shows the address A; «إعادة الإرسال» disabled with a live countdown (60 s) | [x] | **auto** `auth` |
| AU-09 | Wait for the countdown, press resend | Note «…» that the email was resent; countdown restarts; Mailpit has a second email | [x] | **auto** `auth` |
| AU-10 | Reload the page | Generic text without the address; no resend button | [x] | **auto** `auth` |
| AU-11 | «العودة لتسجيل الدخول» | Goes to `/sign-in`; arrow points to the right (back in RTL) | [x] | **auto** `auth` |

### 1.3 Email confirmation — Mailpit

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| AU-12 | Open the newest «Confirm your email address» in Mailpit, click the link | Brief «checking» state, then `/chat`; signed in; the address bar has no tokens | [x] | **auto** `auth` |
| AU-13 | Click the same link again (signed out first: account menu → «تسجيل الخروج») | Centered amber clock «انتهت صلاحية الرابط» with «طلب رابط جديد» and the sign-in hint | [x] | **auto** `auth` |
| AU-14 | Open the confirmation link in a **different browser** | That browser is signed in too (cross-device works) | [x] | **auto** `auth` |

### 1.4 Sign in — `/sign-in`

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| AU-15 | Wrong password for A | «البريد الإلكتروني أو كلمة المرور غير صحيحة.»; email and password stay in the fields | [x] | **auto** `auth` |
| AU-16 | Unknown email | Same generic message (never says the email doesn't exist) | [x] | **auto** `auth` |
| AU-17 | Sign up a new address but don't confirm; sign in with it | Amber «لم تؤكد بريدك الإلكتروني بعد…» with «إعادة إرسال رابط التأكيد»; pressing it sends an email | [ ] | **auto** `auth` |
| AU-18 | Wrong password about 31 times quickly (GoTrue allows 30, then about one more every 2 s per IP). Locally the limit needs an `X-Real-IP` header, so use the e2e test or send it with a tool; in production Caddy sets it | Amber «محاولات كثيرة…» (rate limit), values kept | [ ] | **auto** `auth`<br>Was: more than 60 tries and no limit. Fixed 2026-11-06: `GOTRUE_RATE_LIMIT_HEADER=X-Real-IP` (GoTrue applies no per-IP limit without it) |
| AU-19 | Correct password | Lands on `/chat` | [x] | **auto** `auth` |
| AU-20 | Signed out, open `/chat/anything` | Redirected to `/sign-in?redirect=…`; after signing in, lands back on that path | [x] | **auto** `auth` |
| AU-21 | Open `/sign-in?redirect=https://example.com` and `?redirect=//example.com`, sign in | Lands on `/chat` (external redirects ignored) | [x] | **auto** `auth` |
| AU-22 | Signed in, open `/sign-in`, `/sign-up`, `/forgot-password` | Each redirects to `/chat` | [x] | **auto** `auth` |
| AU-23 | Network off (DevTools → Offline), submit | «تعذّر الاتصال…» with «إعادة المحاولة»; back online, retry works | [x] | **auto** `auth` |

### 1.5 Forgot / reset password

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| AU-24 | `/forgot-password`, invalid email | Field error | [x] | **auto** `auth` |
| AU-25 | A's email, submit | `/check-email?reason=reset` (reset wording) | [x] | **auto** `auth` |
| AU-26 | An email that has no account | Same reset «check your email» (never reveals existence) | [x] | **auto** `auth` |
| AU-27 | Click the newest «Reset your password» link in Mailpit | `/reset-password` with two password fields; no tokens left in the address bar | [x] | **auto** `auth` |
| AU-28 | Different passwords | «كلمتا المرور غير متطابقتين.» | [x] | **auto** `auth` |
| AU-29 | Short password | Too-short error | [x] | **auto** `auth` |
| AU-30 | The current password as the new one | «…مطابقة للقديمة…» (same password) | [x] | **auto** `auth` |
| AU-31 | Valid new password | Toast «تم حفظ كلمة المرور.», lands on `/chat`; signing in later works with the new password only | [x] | **auto** `auth` |
| AU-32 | Reuse the same reset link | Expired-link state with «طلب رابط جديد» → `/forgot-password` | [x] | **auto** `auth` |
| AU-33 | Signed in normally, open `/reset-password?type=recovery` | Expired state, **not** the form | [x] | **auto** `auth` |


### 1.7 Suspended / deleted / session

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| AU-40 | Suspend A (admin), then reload `/chat` as A | `/account-unavailable?reason=suspended`, «تم إيقاف حسابك مؤقتًا», signed out | [x] | **auto** `auth` |
| AU-43 | Reactivate A, sign in | Works normally | [ ] | **auto** `auth` |
| AU-44 | Sign in as A in tab 1; in tab 2 sign out and sign in as B; return to tab 1 | Tab 1 now shows B's data only (no A conversations, drafts or balance) | [x] |  |
| AU-45 | Leave the app open > 1 hour, then send a message | Token refreshes silently; message sends | [x] |  |

---

## 2. App shell, sidebar and menus (F2)

### 2.1 Layout

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| SH-01 | `/chat` at 1440px | Sidebar on the **right** (≈280px), chat to the left, header: title (none on new chat), balance chip, avatar button | [x] | **auto** `app-shell` |
| SH-02 | Resize to 800px and 390px | Sidebar becomes a menu button (top-right); no horizontal scrolling at any width | [x] | **auto** `app-shell` |
| SH-03 | Menu button | Drawer slides from the right with «محادثة جديدة», list, «الرصيد», «الحساب», «تسجيل الخروج»; background dimmed | [x] | **auto** `app-shell` |
| SH-04 | Close the drawer with ✕, Esc, and a tap outside | Each closes it; keyboard focus returns to the menu button | [x] | **auto** `app-shell` |
| SH-05 | Drawer open, widen the window to ≥1024px | Drawer closes; desktop sidebar shown | [x] | **auto** `app-shell` |
| SH-06 | Tap a conversation in the drawer | Opens it and closes the drawer; tapping empty space or «retry» in the list doesn't close it | [x] | **auto** `app-shell` |

### 2.2 Account menu and balance chip

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| SH-07 | Avatar initials | First letter of the first and last name (e.g. «سيف عمران» → «سع») | [x] | **auto** `app-shell` |
| SH-08 | Open the account menu (click and keyboard Enter) | Name, email, «الرصيد» with amount, «الحساب», «تسجيل الخروج»; arrow keys move between items; Esc closes and returns focus | [x] | **auto** `app-shell` |
| SH-09 | «الرصيد» / «الحساب» (menu and sidebar) | Open the Balance and Account pages (§3b); the active link is highlighted | [x] | **auto** `app-shell` |
| SH-10 | «تسجيل الخروج» from the menu and from the drawer | `/sign-in`; signing in as another user shows none of the previous user's conversations or drafts | [x] | **auto** `app-shell` |
| SH-11 | Balance chip as B | Shows `1.00$` style (2 decimals), dollar after the number | [x] | **auto** `app-shell` |

### 2.3 Conversation list

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| SH-12 | New account (A) | «لا توجد محادثات بعد» + «ابدأ محادثتك الأولى وستظهر هنا.» | [x] | **auto** `app-shell` |
| SH-13 | Account with empty (untitled) conversations from refused sends | They are **not** listed | [x] | **auto** `app-shell` |
| SH-14 | After sending messages | Conversations listed newest first, with relative time; the open one highlighted with a bar on the right edge | [x] | **auto** `app-shell` |
| SH-15 | More than 20 conversations, scroll the list | Older ones load at the bottom; while loading, skeleton rows | [x] | **auto** `app-shell` |
| SH-16 | Stop the API, reload | List shows an error with retry; start the API, retry loads it | [x] | **auto** `app-shell` |
| SH-17 | `/chat/00000000-0000-0000-0000-000000000000` | «لم يتم العثور على المحادثة.» with «بدء محادثة جديدة» | [x] | **auto** `app-shell` |
| SH-18 | Another user's conversation id (copy one from account B into account A's session) | Same not-found state (never shows their content) | [x] | **auto** `app-shell` |

---

## 3. Chat (F2) — use account **B** unless noted

### 3.1 New chat and modes

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| CH-01 | «محادثة جديدة» | Empty state: monogram, «كيف أساعدك اليوم؟», 4 example chips, mode chip «سريع» in the message box | [x] | **auto** `chat` |
| CH-02 | Click an example chip | Its text fills the message box; **nothing is sent** | [x] | **auto** `chat` |
| CH-03 | Open the mode chip | Menu with «سريع» and «احترافي», each with a description and colour dot; current one checked; keyboard arrows + Enter work | [x] | **auto** `chat` |
| CH-04 | Pick «احترافي» | Chip shows «احترافي» (indigo); nothing is sent | [x] | **auto** `chat` |
| CH-05 | Enter / Shift+Enter in the box | Enter sends; Shift+Enter adds a new line; the box grows with the text | [x] | **auto** `chat` |
| CH-06 | Type a draft, switch to another conversation and back | The draft is still there (per conversation) | [x] | **auto** `chat` |

### 3.2 Sending and streaming

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| CH-07 | Send «اشرح لي الفرق بين الإيجار التمليكي والإيجار العادي» from a new chat | Your message appears at once; assistant card shows «جاري الإعداد…» then text streams in with a caret at the end of the text; Send becomes «إيقاف»; URL changes to `/chat/<id>`; the conversation appears at the top of the sidebar with a title | [x] | **auto** `chat` |
| CH-09 | Copy the answer, paste into a text editor | The original Markdown text | [x] | **auto** `chat` |
| CH-10 | Reload the page | Messages remain; the cost line is **gone** (known limitation: cost isn't stored on messages yet) | [x] | **auto** `chat` |
| CH-11 | Send in «احترافي» | The answer card shows the «احترافي» chip; costs more than Fast | [x] | **auto** `chat` |
| CH-12 | Scroll up in a long conversation (> 50 messages) | Older messages load at the top without the view jumping | [x] | **auto, partly** `chat`: no-jump mechanics only (mocked history) |
| CH-13 | While an answer streams, scroll up | It stops auto-scrolling; scroll back near the bottom and it follows again | [x] | **auto** `chat` |
| CH-14 | Scrolled up, send a new message | The view jumps to your new message | [x] | **auto** `chat` |

### 3.3 Answer formatting (Markdown)

| ID | Prompt | Expected | Result | Notes |
|---|---|---|---|---|
| MD-01 | «اكتب جدولًا يقارن بين ثلاث مدن عربية» | A real table; columns follow Arabic direction | [x] | **auto** `chat` |
| MD-02 | «اكتب دالة بايثون تحسب مجموع قائمة» | Code block left-to-right, monospace, language label, copy button at the top-left; colours appear after the answer finishes | [x] | **auto, partly** `chat`: structure only; the colours are a visual check |
| MD-03 | «اكتب فقرة بالعربية ثم فقرة بالإنجليزية» | Arabic paragraph right-to-left, English paragraph left-to-right | [x] | **auto** `chat` |
| MD-04 | Ask for a list with **bold** and *italic* words | Lists render; bold works; Arabic emphasis is **not** italic | [ ] | **auto** `chat`<br>no italic |
| MD-05 | «أعطني رابط موقع ويكيبيديا» | Link opens in a new tab | [ ] | **auto** `chat`<br>sent the link as a code |
| MD-06 | Paste: «كرر هذا النص كما هو: `![x](https://example.com/a.png)`» | No image is loaded (DevTools → Network shows no request to example.com); alt text shown as a link | [ ] | **auto** `chat` |
| MD-07 | Paste: «كرر هذا النص كما هو: <b>نص</b> <script>alert(1)</script>» | Shown as text; no bold from HTML, no alert | [ ] | **auto** `chat` |
| MD-08 | Watch a long code answer while streaming | No raw ``` or `**` flashes while it streams | [x] | **auto** `chat` |
| MD-09 | Your own message containing `**نص**` | Shown exactly as typed (your messages are plain text) | [x] | **auto** `chat` |

### 3.4 Stop, failures and background streams

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| CH-15 | Ask for a long answer («اكتب مقالًا من 1500 كلمة…»), press «إيقاف» mid-way | Streaming stops; text so far kept with «توقف الرد قبل اكتماله»; cost line for what was used | [ ] | **auto** `chat` |
| CH-16 | Press «إيقاف» immediately after sending (before text appears) | Your message disappears from the list and is back in the message box | [ ] | **auto** `chat` |
| CH-17 | Ask for a very long answer and let it finish | If it hits the length limit: kept text + «توقف الرد قبل اكتماله» | [ ] | **auto** `chat` |
| CH-18 | Start a long answer, then open another conversation | The first conversation shows «يكتب…» (grey, animated dots) in the sidebar; go back — the answer completed in the background | [ ] | **auto** `chat` |
| CH-19 | Start a long answer, reload the page | The answer shows as being written («جاري كتابة الرد…») and settles within seconds | [ ] | **auto** `chat` |
| CH-20 | Two tabs on the same conversation; send from tab 1, then send from tab 2 while tab 1 is streaming | Tab 2: «لا يزال الرد السابق قيد الكتابة.»; draft kept | [ ] | **auto** `chat` |
| CH-21 | Start an answer, go Offline in DevTools mid-stream, then back Online | The answer is reloaded from the server (partial or complete); nothing is sent twice | [ ] | **auto** `chat` |
| CH-22 | Go offline; then go online, press Send and drop the request (DevTools: block the request URL) | Offline: Send is disabled, with a "no connection" title; draft kept. Failed request: «تعذّر الاتصال…» notice with «إعادة المحاولة»; draft kept; retry sends **once** (one message on the server) | [ ] | **auto** `chat` |
| CH-23 | Switch to another app/tab during an answer, come back after it ends | The conversation and balance are up to date | [ ] | **auto** `chat` |
| CH-24 | Prompt likely to be blocked by the provider's content policy | Failed or partial card with «تعذّر إكمال الرد بسبب سياسة المحتوى…» and «إعادة المحاولة» (re-sends as a new message) | [ ] | **auto, partly** `chat`: CONTENT_BLOCKED card only (mocked); a real block needs a person |

### 3.5 Refusals

| ID | Setup | Steps | Expected | Result | Notes |
|---|---|---|---|---|---|
| RF-01 | Account **C** (no plan) | Open `/chat` | Amber «ليست لديك باقة نشطة. تواصل معنا للاشتراك.» + «تواصل معنا» above the box from the start; Send disabled; typing + Enter sends nothing and creates no conversation | [x] | **auto** `chat` |
| RF-02 | RF-01 | «تواصل معنا» | Request-balance dialog with one contact link (email, `mailto:` from the brand config; WhatsApp and phone removed for now); Esc closes and focus returns to the button; draft kept | [x] | **auto** `chat` |
| RF-03 | Plan active, balance set to **0.02$** (above the Fast reservation, below Professional) | Send in «احترافي» | «رصيدك غير كافٍ لهذه الرسالة في وضع «احترافي» … رصيدك 0.02$» + «التبديل إلى «سريع»…»; nothing streams; draft kept. Amounts under 0.01$ show 4 decimals, others 2 | [ ] | **auto** `chat` |
| RF-04 | RF-03 | Press the switch button | Mode chip becomes «سريع»; **nothing is sent**; notice still names «احترافي»; the button for the selected mode is hidden | [x] | **auto** `chat` |
| RF-05 | RF-04 | Press Send | Sends in Fast and streams normally | [x] | **auto** `chat` |
| RF-06 | Balance set to **0.005$** | Send in «سريع» | Insufficient notice with no switch button, «تواصل معنا لإضافة رصيد» → request-balance dialog | [x] | **auto** `chat` |
| RF-07 | Any funded account | Send 21+ messages within one minute (short prompts, Stop each) | «أرسلت رسائل كثيرة خلال وقت قصير. حاول بعد N ثانية.» with a live countdown; Send disabled until it reaches 0; draft kept | [ ] | **auto** `chat` |
| RF-08 | — | Paste more than 20,000 characters and send | Validation error under the box; draft kept | [x] | **auto** `chat` |
| RF-09 | Disable mode «احترافي» (admin), keep it selected in the UI | Send | «هذا الوضع غير متاح في باقتك الحالية.»; the selection falls back to «سريع»; nothing sent automatically. **Re-enable the mode afterwards.** | [x] | **auto** `chat` |
| RF-10 | Chat open; clear the user's name on the server (admin, or `PATCH /me` with a blank `fullName`) | Send | Goes to `/complete-profile` and stays there until the name is saved; then back to the chat | [ ] | **auto** `chat` |

Restore balances and modes after this section.

---

## 3b. Balance, Account and Plans (F3)

### Balance — `/balance`

| ID | Setup / steps | Expected | Result | Notes |
|---|---|---|---|---|
| BA-01 | Account **B** (plan + balance) | Large spendable balance (same as the header chip), «طلب رصيد», plan name and «ينتهي رصيدك بانتهاء الباقة في {date}» | [x] | **auto** `balance-account` |
| BA-02 | B's activity list | Newest first; each row: type label + icon, signed amount (+ green, − neutral, e.g. `−0.0015$`), «الرصيد بعد العملية», «اليوم/أمس HH:mm» or full date | [x] | **auto** `balance-account` |
| BA-03 | Labels | Plan credit «رصيد الباقة», admin adjustment «تعديل من الفريق», chat use «استخدام المحادثة» (plus «إضافة رصيد», «انتهاء الرصيد», «استرداد», «رصيد قسيمة» when present) | [x] | **auto** `balance-account` |
| BA-04 | Send a chat message, return to `/balance` | New «استخدام المحادثة» row; balance equals the header chip | [x] | **auto** `balance-account` |
| BA-05 | Account with > 30 activity rows, scroll down | Older rows load; on failure, retry button | [x] | **auto** `balance-account` |
| BA-06 | Account **C** (no plan) | No-plan notice with «تواصل معنا»; «لا توجد عمليات بعد» for a new account | [x] | **auto** `balance-account` |
| BA-07 | «طلب رصيد» / «تواصل معنا» | Request-balance dialog; Esc returns focus | [x] | **auto** `balance-account` |
| BA-08 | 390px | Rows show amount + date only; no horizontal scroll | [x] | **auto** `balance-account` |

### Account — `/account`

| ID | Setup / steps | Expected | Result | Notes |
|---|---|---|---|---|
| AC-01 | Open as B | Profile (name, phone optional LTR, email read-only with lock and note), plan card (name, start/end dates, «مجاني» when price 0, mode chips), change password, session card | [ ] | **auto** `balance-account` |
| AC-02 | Change name, «حفظ» | Toast «تم حفظ التغييرات.»; the account menu / avatar initials update without reload | [ ] | **auto** `balance-account` |
| AC-03 | Clear the name, save | «أدخل اسمك الكامل.»; nothing saved | [ ] | **auto** `balance-account` |
| AC-04 | Clear the phone, save | Saved as empty; `abc` as phone → server field error | [ ] | **auto** `balance-account` |
| AC-05 | Change password: mismatch / short / same as current | Matching errors; nothing changed | [ ] | **auto** `balance-account` |
| AC-06 | Change password: valid | Success; you stay signed in; sign out and sign in with the new password works | [ ] | **auto** `balance-account` |
| AC-07 | «تسجيل الخروج» on the session card | Signed out to `/sign-in` | [ ] | **auto** `balance-account` |
| AC-08 | Account **C** | Plan card shows the no-plan notice; «تواصل معنا» opens the dialog | [ ] | **auto** `balance-account` |
| AC-09 | 390px | Order: profile → plan → password → session (sign-out last) | [ ] | **auto** `balance-account` |

### Plans — `/plans`

| ID | Setup / steps | Expected | Result | Notes |
|---|---|---|---|---|
| PL-01 | Signed out, open `/plans` | Header with «تسجيل الدخول» / «إنشاء حساب»; plan cards from the backend (name, description, price or «مجاني», modes with descriptions); expiry note; «تواصل معنا للاشتراك» opens the dialog | [ ] | **auto** `balance-account` |
| PL-02 | A plan with 0 included balance | No «الرصيد الحالي» line on that card | [ ] | **auto** `balance-account` |
| PL-03 | Signed in as B | Page inside the app shell; B's plan marked «باقتك الحالية» | [ ] | **auto** `balance-account` |
| PL-04 | Signed in as C (no subscription) | No card marked «باقتك الحالية» | [ ] | **auto** `balance-account` |
| PL-05 | View source of `/plans` (signed out) | Page content is present in the HTML (prerendered) | [ ] | **auto** `balance-account` |

---

## 3b-2. Landing page (F11) — `/`

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| LP-01 | Open `/` signed out | The page stays at `/`, right-to-left, no sideways scroll, no accessibility violations | [ ] | **auto** `landing` |
| LP-02 | Read the modes and plans sections | Fast, Professional and Design cards; paid plans only, with live prices | [ ] | **auto** `landing` |
| LP-03 | Press «تواصل معنا للاشتراك» on a plan | Scrolls to «كيف أحصل على باقة؟», heading not hidden under the top bar | [ ] | **auto** `landing` |
| LP-04 | Press «إنشاء حساب» and «تسجيل الدخول» | Each opens its page | [ ] | **auto** `landing` |
| LP-05 | Open `/` with the plans request failing | Error with retry; the rest of the page stays | [ ] | **auto** `landing` |
| LP-06 | Open and close a question | The answer shows and hides | [ ] | **auto** `landing` |
| LP-07 | Open `/` signed in | Goes to `/chat`; note how visible the landing page is first | [ ] | **manual** |
| LP-08 | View the source of `/` on the production build | Headline and description are in the HTML; no React #418 in the console | [ ] | **manual** |
| LP-09 | Paste the site link into a messaging app | The preview shows the name, tagline and share image | [ ] | **manual** |
| LP-10 | Open «سياسة الخصوصية» in the footer | `/privacy` shows the interim notice, right-to-left, no sideways scroll, no accessibility violations | [ ] | **auto** `landing` |

## 3c. Admin console (F4) — sign in as the admin account

Every write asks for a reason (3–500 characters). Use a **test** user as the target; restore what you change.

### Access and users

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| AD-01 | Signed in as a normal user, open `/admin/users` | «الصفحة غير موجودة»; account menu has no «لوحة الإدارة» | [ ] | **auto** `admin` |
| AD-02 | As admin, account menu → «لوحة الإدارة» | Admin shell with its own right-side sidebar; «العودة إلى التطبيق» goes to `/chat` | [ ] | **auto** `admin` |
| AD-03 | Users: search by part of an email/name, filter status and role, page | Results update; filters stay in the URL (reload keeps them); «1–20 من N» | [ ] | **auto** `admin` |
| AD-04 | Row menu → «تفعيل باقة» / «إضافة رصيد» | Opens that user with the dialog open | [ ] | **auto** `admin` |
| AD-05 | `/admin/users/<unknown id>` | User not found state | [ ] | **auto** `admin` |

### User detail

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| AD-06 | Overview → suspend a test user with a reason | Status «موقوف»; that user is signed out on their next request (AU-40); reactivate restores it | [ ] | **auto** `admin` |
| AD-07 | Try to suspend yourself / remove admin from the only admin | «لا يمكنك تنفيذ هذا الإجراء على حسابك.» (the only admin acting on themself always gets this; «لا يمكن إزالة آخر مسؤول.» is reachable only by another admin, so the test mocks it) | [ ] | **auto** `admin` |
| AD-08 | Subscription → «تفعيل باقة» (no end date) | Active, ends one month later; included balance credited (see Balance tab) | [ ] | **auto** `admin` |
| AD-09 | Activate with a custom end date | That end date shown | [ ] | **auto** `admin` |
| AD-10 | «إنهاء الباقة» | Danger confirm with «سينتهي كل رصيد المستخدم فورًا»; after it, the user's balance is 0 and the ledger shows «انتهاء الرصيد» | [ ] | **auto** `admin` |
| AD-11 | Balance → «إضافة أو خصم رصيد» `0.5` then `-0.2` | Balance +0.50 then −0.20; ledger rows «تعديل يدوي» with «مسؤول: <first 8 characters of your id>» (copy button) and the reason; the user's own Balance page matches | [ ] | **auto** `admin` |
| AD-12 | Amount `abc`, `1.2.3`, empty reason | Field errors; nothing sent | [ ] | **auto** `admin` |
| AD-13 | «تسجيل دفعة» amount + reference `INV-TEST-1` | Ledger «تسجيل دفعة»; repeating the same reference with a different amount → «رقم الدفعة هذا مسجّل بالفعل…» | [ ] | **auto** `admin` |
| AD-14 | Ledger reference / actor ids | Shortened to 8 characters, full value on hover, copy button works | [ ] | **auto** `admin` |
| AD-15 | Adjust your **own** balance as admin, then open `/balance` | Customer balance already updated (no reload needed) | [ ] | **auto** `admin` |

### Catalog and settings

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| AD-16 | Plans list | Price, included balance, mode **labels**, active/public/default, subscriber count | [ ] | **auto** `admin` |
| AD-17 | Create a test plan (key `qa-plan`), set its modes; try key `new` and a duplicate key | Created and listed; `/plans` (customer) shows it if public; `new` rejected; duplicate → «توجد باقة بهذا المفتاح بالفعل.» | [ ] | **auto** `admin` |
| AD-18 | Make the default plan non-default with no other default | The default plan's «الباقة الافتراضية» and «نشطة» boxes are locked, so it can't be made non-default from the screen; the API answers `DEFAULT_PLAN_REQUIRED` («يجب أن تكون هناك باقة افتراضية دائمًا.») | [ ] | **auto** `admin` |
| AD-19 | Providers | Keys only as `••••1234` or «لا يوجد مفتاح»; mock/dev providers visible to admins only | [ ] | **auto** `admin` |
| AD-20 | Set a provider key that is invalid (e.g. `invalid-key-123`) | «رفض المزوّد مفتاح الواجهة البرمجية.»; the field is cleared; the key never appears again | [ ] | **auto** `admin` |
| AD-21 | Models list at 1440px | All columns visible incl. current price; margin like `40%`; mode labels | [ ] | **auto** `admin` |
| AD-22 | Model detail → schedule a price in the future; then one overlapping an existing period | Listed in history with date and time; overlap → «يتعارض هذا السعر مع سعر آخر مجدول.» | [ ] | **auto** `admin` |
| AD-23 | Model test: prompt > 500 chars or tokens > 256 | Blocked before the paid confirmation | [ ] | **auto** `admin` |
| AD-24 | Model test with a short prompt, confirm the paid-request dialog | Reply, finish reason, usage, timings, provider cost and customer charge with full precision (e.g. `0.000092$`) — **costs real money** | [ ] | **auto** `admin` |
| AD-25 | Modes list | «جاهز» or the not-ready reason; disable a mode → customers lose it in the mode menu (RF-09); re-enable | [ ] | **auto** `admin` |
| AD-26 | Mode own system prompt / Settings default prompt | Counter, max 10,000; empty default prompt rejected; text `dir="auto"` | [ ] | **auto** `admin` |
| AD-27 | Settings → margin `35` | Saved; models list margin and customer `/modes` prices reflect it; **restore 40** | [ ] | **auto** `admin` |

---

## 3d. Image creation (F8) — image modes

**Setup.** Free (mock): in `/admin`, enable the `mock` provider, add a model on it with «يقرأ الصور» + «ينشئ الصور», max output ≥ 2,500 and any price, point an image mode at it (e.g. «تصميم»), enable it and add it to your plan. Every answer is «Echo: …» plus a small red square image. 💲 = needs a real image model (e.g. `gemini-2.5-flash-image`, about $0.04–0.19 per image); run the admin model test first.

### Creating images

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| IC-01 | Pick the image mode; open the mode menu | Image modes show the image icon + «صورة»; the empty state reads «صِف الصورة التي تريدها» with «أرفق صورة لتعديلها» and 4 idea chips (chips fill the box, never send) | [ ] | **auto** `image-creation` |
| IC-02 | For each ratio (1:1, 3:4, 4:3, 9:16, 16:9) send a prompt | While creating, the placeholder «جارٍ إنشاء الصورة…» has that shape; 💲 the image comes back in that shape | [ ] | **auto, partly** `image-creation`: placeholder shape only; the returned shape needs a real model |
| IC-03 | 💲 «تلقائي», attach a portrait photo, «اجعلها بأسلوب كرتوني» | The result follows the photo's shape | [ ] |  |
| IC-04 | 💲 In the same conversation: «اجعلها أكثر إشراقًا» | The last image is edited, not a new unrelated one | [ ] |  |
| IC-05 | An answer with an image and no text | Only the image and its actions; no empty text block, no «يكتب…» | [ ] | **auto** `image-creation` |
| IC-06 | 💲 A request the model answers with text only | A normal answer card; the creating placeholder disappears | [ ] | **auto** `image-creation` |
| IC-07 | 💲 A clearly disallowed image request | Red card with the CONTENT_BLOCKED text, «إعادة المحاولة»; the box is empty (the message was sent) and «إعادة المحاولة» resends the same prompt | [ ] | **auto** `image-creation` |
| IC-08 | Press Stop immediately after sending, before the server starts answering (as CH-16) | Your message disappears from the list and is back in the message box; nothing is sent again. Stop after the image arrived is IC-09 | [ ] | **auto** `image-creation` |
| IC-09 | 💲 Press Stop after the image arrived (slow model) | The image stays; the "cut" note shows | [ ] | **auto, partly** `image-creation`: the returned shape needs a real model |
| IC-10 | After a failed image answer (IC-07), press «إعادة المحاولة» | It sends again with the same ratio (16:9 stays 16:9) | [ ] | **auto** `image-creation` |

### Mode and composer

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| IC-11 | Switch from the image mode to «سريع», then back | The ratio chip hides in text modes and comes back with this conversation's last choice | [ ] | **auto** `image-creation` |
| IC-12 | Conversation A: 16:9; conversation B: «تلقائي»; switch between them | Each keeps its own ratio | [ ] | **auto** `image-creation` |
| IC-13 | New chat: choose 16:9, send | The new conversation keeps 16:9 | [ ] | **auto** `image-creation` |
| IC-14 | While an image is being created | Ratio chip, mode chip and Send are disabled; Stop is available | [ ] | **auto, partly** `image-creation`: ratio chip and Send automated; mode chip is fixme (suspected app bug) |
| IC-15 | In the image mode, attach a photo | Attaching works as in text modes that read images | [ ] | **auto** `image-creation` |

### Viewing and download

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| IC-16 | «فتح بالحجم الكامل»; close with Escape, then with the close button | Full-screen viewer; focus returns to «فتح بالحجم الكامل» | [ ] | **auto** `image-creation` |
| IC-17 | «تنزيل» from the card, then from the viewer; click several times fast | Saves `lam7a-<id>.webp` that opens in the system viewer; one copy per download (the button is disabled while saving) | [ ] | **auto** `image-creation` |
| IC-18 | Reload; open the conversation from the sidebar; sign out and in | Images load each time (placeholder first) | [ ] | **auto** `image-creation` |
| IC-19 | As another user, open the first user's `/chat/<id>` | «لم يتم العثور على المحادثة.» with «بدء محادثة جديدة»; no image is shown or downloadable | [ ] | **auto** `image-creation` |

### Balance and limits

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| IC-20 | Watch the balance chip around an image answer | It drops after each image (mock: tiny; 💲 about $0.04–0.19); no per-answer price is shown | [ ] | **auto** `image-creation` |
| IC-21 | Balance near zero (admin), send in the image mode | INSUFFICIENT_BALANCE: alternatives list only image modes (in a text mode, only text modes); nothing sends or switches by itself | [ ] | **auto** `image-creation` |
| IC-22 | Send many messages quickly | Rate-limit countdown; the draft is kept | [ ] | **auto** `image-creation` |

### Mobile (375 px) and accessibility

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| IC-23 | Phone width: open the ratio menu, create a 9:16 image | Menu fully visible; no sideways scroll; the image fits the screen height (capped at about 512 px) | [ ] | **auto** `image-creation` |
| IC-24 | Keyboard only: Tab to the ratio chip, Enter, arrows, Enter; then open and download | Everything reachable with a visible focus ring | [ ] | **auto** `image-creation` |
| IC-25 | Screen reader (NVDA / VoiceOver) while creating, then on the image | «جارٍ إنشاء الصورة…» announced once; the image reads «صورة أنشأها المساعد» | [ ] |  |

### Admin

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| IC-26 | New model: turn on «ينشئ الصور»; set max output 2000, save | «يقرأ الصور» turns on and locks (with the reason); the image-rate price hint shows; save is refused: «الحد الأدنى 2,500 عند إنشاء الصور» | [ ] | **auto** `image-creation` |
| IC-27 | Model test on the mock image model; then on a model that returns no image | A preview with its size in بايت; otherwise «لم يُرجع النموذج صورة» | [ ] | **auto** `image-creation` |
| IC-28 | An image mode on a provider without an image path (not Gemini / mock) | Modes list: «مزوّد هذا النموذج لا يدعم إنشاء الصور.» | [ ] | **auto** `image-creation` |
| IC-29 | Look through the mode menu, image cards and errors as a user | No provider or model name anywhere | [ ] | **auto** `image-creation` |

---

## 3e. Reports (F9) — admin dashboard, requests, audit, «استهلاكي»

Use a user who has sent at least one message this month, so the reports have data.

### Admin overview — `/admin/overview`

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| RP-01 | Open `/admin` | Goes to `/admin/overview`: «تحتاج إلى انتباه», money, users, plans and images cards; «عرض الطلبات» opens `/admin/requests` | [ ] | **auto** `reports` |
| RP-02 | Press «آخر 7 أيام»; open «فترة مخصصة»; set one day; «تطبيق»; reload | `?days=7` and a summary with «7 أيام»; the custom fields open filled with the shown period; `?from&to` stays after reload | [ ] | **auto** `reports` |
| RP-03 | Custom range: start after end; then over 366 days; then type Arabic digits | «يجب أن يكون تاريخ البداية…»; «أقصى فترة هي 366 يومًا…»; «تطبيق» off for both; the digits become Western | [ ] | **auto** `reports` |
| RP-04 | Look at the chart; switch to «الطلبات»; «عرض كجدول» | First day on the right, today on the left; Y axis numbers on the right, not cut off; title changes; table with exact values; «عرض كرسم بياني» returns | [ ] | **auto** `reports` |
| RP-05 | Look at the margin card | «نسبة الهامش: 28.6%» with the number before the sign | [ ] | **auto** `reports` |
| RP-06 | Open at 375 px | No sideways page scroll; the chart scrolls inside its card and opens at today (left end) | [ ] | **auto** `reports` |

### Requests and audit

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| RP-07 | Open `/admin/requests`; press «مُسوّاة», then «الكل» | Opens on «مُعلَّمة» with the "not a to-do list" note; `?status=settled` shows settled requests; «الكل» shows every status | [ ] | **auto** `reports` |
| RP-08 | `/admin/audit`: filter by action and resource id; expand a row; «مسح الفلاتر» | Filters in the URL; only matching rows, with the reason; old and new values as LTR code; clear resets | [ ] | **auto** `reports` |
| RP-09 | Audit: admin id `not-a-uuid` and an incomplete date; «تطبيق» | Field errors; nothing applied; no-date hint says the whole log is shown | [ ] | **auto** `reports` |
| RP-10 | User detail, tab «الاستهلاك» | Totals, the mode, the daily chart, recent requests with the note that they ignore the period | [ ] | **auto** `reports` |
| RP-11 | As a normal user open `/admin/overview`, `/admin/requests`, `/admin/audit` | Not found | [ ] | **auto** `reports` |

### «استهلاكي» — `/usage`

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| RP-12 | Open with usage this month | Messages, «المبلغ المخصوم», by mode with its label, daily chart, «يُحسب الشهر بتوقيت UTC.»; no provider or model name | [ ] | **auto** `reports` |
| RP-13 | At 375 px with a full month | No sideways page scroll; chart opens at today, «اليوم» on the left | [ ] | **auto** `reports` (mocked month) |
| RP-14 | New account, current month | «لا يوجد استهلاك في هذا الشهر» with «محادثة جديدة» | [ ] | **auto** `reports` |
| RP-15 | Open `?month=2026-01` with no use | Same message, no button | [ ] | **auto** `reports` |
| RP-16 | New account: month arrows and list; Esc | Both arrows off; one month listed; Esc closes and focus returns to the month button | [ ] | **auto** `reports` |
| RP-17 | Load fails, then «إعادة المحاولة» | Error with retry; the page recovers | [ ] | **auto** `reports` (mocked failure) |
| RP-18 | «عرض الاستهلاك» on `/balance`; account menu (drawer on phones) | Both open `/usage` | [ ] | **auto** `reports` |

### Accessibility and judgement

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| RP-19 | Run axe on the report pages | RTL; no serious or critical violations | [ ] | **auto** `reports` |
| RP-20 | Compare a day's chart and table with the ledger for a known user | The figures match | [ ] | manual: needs a judgement over the data |
| RP-21 | Screen reader on the chart | Reads the chart's description and offers the table | [ ] | manual: needs a screen reader |

---

## 3f. Vouchers (F10) — redeem box and admin codes

### Redeeming — `/balance` and `/plans`

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| VC-01 | Press «لديك كود؟»; «إغلاق» | Opens with focus in an LTR field; closing returns focus to the button | [ ] | **auto** `vouchers` |
| VC-02 | Submit empty; type `abc123` | «اكتب الكود أولًا.», nothing sent; shows `ABC123` | [ ] | **auto** `vouchers` |
| VC-03 | Redeem a balance code | «أُضيف +2.50$ إلى رصيدك.»; balance up by that amount; «رصيد كود» in the activity; «استخدام كود آخر» reopens the field | [ ] | **auto** `vouchers` |
| VC-04 | Redeem a trial code | «تم تفعيل باقة «…» حتى …»; the plan shows after reload | [ ] | **auto** `vouchers` |
| VC-05 | Redeem the same code again | «لقد استخدمت هذا الكود من قبل.»; the code stays in the field | [ ] | **auto** `vouchers` |
| VC-06 | Wrong code; code not started; used-up code | Each code's own message under the field | [ ] | **auto** `vouchers` |
| VC-07 | New-users-only code on a user with a plan | «لا يمكنك استخدام هذا الكود على حسابك.» | [ ] | **auto** `vouchers` |
| VC-08 | Balance code with no active plan on `/balance` | Notice with the extra line, «عرض الباقات» and «طلب رصيد» (opens the contact dialog) | [ ] | **auto** `vouchers` |
| VC-09 | Same on `/plans` | Notice without «عرض الباقات» | [ ] | **auto** `vouchers` |
| VC-10 | Enter wrong codes until refused | «أدخلت أكواد خاطئة كثيرة…» with a countdown; button off until it ends | [ ] | **auto** `vouchers` |
| VC-11 | Lose the network, submit, restore, «إعادة المحاولة» | Error with retry; code kept; the retry succeeds | [ ] | **auto** `vouchers` (mocked failure) |

### Admin — `/admin/vouchers`

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| VC-12 | Create a balance code with the code left empty | Result view with the generated code and «نسخ الكود»; the code is in the list | [ ] | **auto** `vouchers` |
| VC-13 | Amount over 1000, limit over 1,000,000, bad code, no reason | Each field's error; nothing sent | [ ] | **auto** `vouchers` |
| VC-14 | Dates: type Arabic digits; 31 Feb; end before start | Western digits as `YYYY-MM-DD HH:mm`; «التاريخ غير صحيح.»; «يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء.» | [ ] | **auto** `vouchers` |
| VC-15 | Create with a code that exists | «يوجد كود بهذا الاسم بالفعل.» | [ ] | **auto** `vouchers` |
| VC-16 | Create a trial code | Plan and days instead of amount; result view | [ ] | **auto** `vouchers` |
| VC-17 | Detail: limit 0; then a valid limit and note, with a reason | Field error; the dialog lists the changes; saved after reload | [ ] | **auto** `vouchers` |
| VC-18 | «إيقاف الكود»; redeem it; «تفعيل الكود» | Banner; the user gets "not found"; works again once activated | [ ] | **auto** `vouchers` |
| VC-19 | List filter «مفعّل» / «موقوف»; open a used code | Filter in the URL; the user who redeemed is listed | [ ] | **auto** `vouchers` |
| VC-20 | Run axe on the box and admin screens, at each width | RTL; no serious or critical violations; no sideways page scroll | [ ] | **auto** `vouchers` |
| VC-21 | Copy a new code; paste it in another browser | Pastes the exact code | [ ] | manual: needs a real clipboard across browsers |

---

## 3g. Voucher batches (F11b) — `/admin/vouchers?tab=batches`, as admin

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| VB-01 | Open the Batches tab, open a batch | Listed with progress; opens its page | [ ] | **auto** `voucher-batches` |
| VB-02 | Create a balance batch with a prefix | Live example and total; opens with the live-codes notice | [ ] | **auto** `voucher-batches` |
| VB-03 | Enter a total above 10,000.00$ | Message shown, submit blocked | [ ] | **auto** `voucher-batches` |
| VB-04 | Download the CSV | Warning first; file has every code | [ ] | **auto** `voucher-batches` |
| VB-05 | Download with the request failing | Error in the dialog; retry available | [ ] | **auto** `voucher-batches` |
| VB-06 | Turn one code off, then on | Off: redeeming fails. On: it works | [ ] | **auto** `voucher-batches` |
| VB-07 | Redeem a code, open the batch | Progress moves; code shows its user, no action | [ ] | **auto** `voucher-batches` |
| VB-08 | Turn the batch off | Banner; codes stop; CSV still available | [ ] | **auto** `voucher-batches` |
| VB-09 | Open a batch code's voucher page | No limit or end date; link to the batch | [ ] | **auto** `voucher-batches` |
| VB-10 | Send the CSV to a phone and open it | Arabic batch name and codes read correctly | [ ] | **manual** |

---

## 3h. Brand kits (F12) — `/brands`, any signed-in user

The «علاماتي التجارية» link shows only on plans that offer the graphic designer; open `/brands` directly otherwise.

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| BK-01 | Open `/brands` with no kits; create one by name | Empty state; the dialog asks for the name; the kit page opens; no draft note | [ ] | **auto** `brand-kits` |
| BK-02 | Upload a logo | Preview appears; «ألوان من شعارك» offers its colours; nothing is added until «إضافة» and «حفظ الألوان» | [ ] | **auto** `brand-kits` |
| BK-03 | Fill tone and a «افعل» rule; save the profile | Saved as one change; counters stay left-to-right | [ ] | **auto** `brand-kits` |
| BK-04 | Upload a PDF as a product photo, then as a guideline | Refused under the product drop zone; kept as a guideline (PDF tile with size) | [ ] | **auto** `brand-kits` |
| BK-05 | Delete a file | It disappears and is gone after reload | [ ] | **auto** `brand-kits` |
| BK-06 | Change the name, then leave by the back link | «مغادرة دون حفظ؟»; «البقاء» keeps the page, «المغادرة دون حفظ» leaves | [ ] | **auto** `brand-kits` |
| BK-07 | Delete the kit | Confirmation first; back to the list | [ ] | **auto** `brand-kits` |
| BK-08 | Reach the plan's kit limit | «هوية جديدة» disabled with the reason and «عرض الباقات» | [ ] | **auto** `brand-kits` |
| BK-09 | On a phone, «التقاط صورة» in logos | The camera opens; the photo uploads | [ ] | manual: needs a real phone camera |
| BK-10 | Open a draft made by the graphic designer | «مسودة» badge and the note linking to the chat | [ ] | manual until F13 |

---

## 3i. Graphic designer in the chat (F13) — `/chat`, agent on for the user's plan

Turn the agent on for a test plan on `/admin/agents` (or Bruno `26-agents-setup`) first.

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| AG-01 | New user without brands: start «مصمم جرافيك», answer every step, confirm both summaries | One question per message; the input replaces the composer; the kit is ready; «تم حفظ طلبك»; no prices anywhere | [ ] | **auto** `agent-chat` |
| AG-02 | Upload a logo at the logo step | Preview, then the colours step offers «ألوان من شعارك» | [ ] | **auto** `agent-chat` |
| AG-03 | User with a ready brand: start the agent, pick it | Goes straight to «ماذا نصمم؟» | [ ] | **auto** `agent-chat` |
| AG-04 | «تعديل» on the brand summary | Back to that question, then to the summary with the new value | [ ] | **auto** `agent-chat` |
| AG-05 | Admin switches the agent off, then answer | «هذا المساعد غير متاح في باقتك.» with a link to plans | [ ] | **auto** `agent-chat` |
| AG-06 | Open `/admin/agents`, edit | List with status, plans and readiness; dialog with models and cost; reason required | [ ] | **auto** `agent-chat` |
| AG-07 | Request summary with little balance | «رصيدك يكفي لتصميم واحد من 2»; with none, the warning and «يبدو جيدًا» disabled | [ ] | manual: needs a priced agent |
| AG-08 | Answer in a second tab, then in the first | «تغيّرت المحادثة، فعرضنا السؤال الأخير.» and the latest question | [ ] | manual |
| AG-09 | Phone: run the brand setup | Inputs stay above the keyboard; no sideways scroll | [ ] | manual |

---

## 3j. Designs (F15) — chat, «تصاميمي», «استهلاكي», admin

Needs the graphic designer on for the user's plan, ready (models set, on and priced) and the backend's stage 4 migrations.

| ID | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| DS-01 | Request summary → «أنشئ التصاميم» | «جارٍ التصميم… 0 من 2», no input; results after about a minute, in their shapes | [ ] | manual: needs priced image models |
| DS-02 | Leave the chat while it works, come back later | The results are in the conversation | [ ] | manual |
| DS-03 | Balance covers 1 of 2 | Note «رصيدك يكفي لتصميم واحد من 2»; button «أنشئ تصميمًا واحدًا» makes one | [ ] | manual (unit-tested) |
| DS-04 | «تعديل» on a design, describe the change, «عدّله» | One new design with «v2» | [ ] | manual |
| DS-05 | «تعديل تصميم موجود»: upload a design, pick changes (several), finish | The edited design keeps its shape | [ ] | manual |
| DS-06 | «تنزيل» on a design (PNG, original); then JPG, social media size | Files save with the server's name; JPG on white; social sizes as listed | [ ] | manual (unit-tested) |
| DS-07 | Open «تصاميمي», filter by brand, open a design, «فتح المحادثة» | Gallery newest first; viewer; the right conversation | [ ] | **auto** `designs` (empty gallery) |
| DS-08 | «استهلاكي» for a month with designs | «التصاميم» section apart from the messages | [ ] | manual (unit-tested) |
| DS-09 | Admin overview → «تشغيلات تصميم للمراجعة»; open a run | Runs list (needs review), run detail with every model call | [ ] | **auto** `designs` |
| DS-10 | Admin agent dialog → «تعليمات متقدمة», change and restore | «مخصّصة» in the list; restoring sends the default | [ ] | **auto** `designs` |

---

## 4. Cross-cutting checks

| ID | Check | Expected | Result | Notes |
|---|---|---|---|---|
| X-01 | Language | No English UI text anywhere (except code, emails and URLs); no model or provider names (Gemini, GPT, Claude…) | [ ] | **auto** `cross-cutting` |
| X-02 | Money | Always `0.0015$` / `14.48$` style, dollar after the number, Western digits; never `$0.0015` inside Arabic text | [ ] | **auto** `cross-cutting` |
| X-03 | Digits and dates | Western digits everywhere (times, counts, money) | [ ] | **auto** `cross-cutting` |
| X-04 | Keyboard only | Tab through sign-in, chat, menus, drawer and dialogs: every control reachable in a sensible order, visible indigo focus ring, Esc closes popups | [ ] | **auto** `cross-cutting` |
| X-05 | Screen reader (NVDA/VoiceOver spot check) | Icon buttons have names (menu, send/stop, copy, show password, account menu); errors are announced | [ ] | **auto, partly** `cross-cutting`: names and announcements only; the screen-reader pass stays manual |
| X-06 | Touch targets on mobile | Buttons and links are comfortable to tap (≥44px) | [ ] | **auto** `cross-cutting` |
| X-07 | Reduced motion (OS setting) | No flickering caret/dots; no animations | [ ] | **auto, partly** `cross-cutting`: emulated in the browser; the OS setting stays manual |
| X-08 | Zoom 200% | Layout still usable, no overlapping text | [ ] | **auto, partly** `cross-cutting`: no sideways scroll and controls reachable; overlap is a visual check |
| X-09 | Cursor | Pointer on all enabled buttons; default on disabled ones | [ ] | **auto** `cross-cutting` |
| X-10 | Brand | Name and monogram «لمحة AI» / «ل» everywhere; the browser tab title is «لمحة AI» | [ ] | **auto** `cross-cutting` |
| X-11 | Console | DevTools console has no errors during the flows above | [ ] | **auto** `cross-cutting` |
| X-12 | Privacy | Address bar never contains email addresses or tokens; DevTools → Network: requests only to `localhost:3000` (API) and `localhost:9999` (auth), plus Google Fonts | [ ] | **auto** `cross-cutting` |

---

## 5. Known limitations (not bugs)

- The per-answer cost line disappears after a reload (backend doesn't store the cost on messages yet — deferred).

- Confirmation and reset emails are in English (GoTrue defaults) until the backend adds Arabic templates.
- No terms/privacy checkbox on sign-up until the legal pages exist.
- Contact channels in the request-balance dialog are empty until the brand config has them.
- Tablet uses the mobile drawer (no icon rail).
- Refused first sends from before the no-plan check may have left untitled conversations; they're hidden from the list.
- **Image creation (F8):** the chosen aspect ratio is kept in memory only, so after a reload the chip shows «تلقائي» again. The `mock` provider always returns a small square image whatever ratio is chosen. Created images are full size (up to 4096 px), so long image conversations load slowly on mobile until the backend adds a display size.
