# Manual test cases — F1 (auth) and F2 (chat)

**Covers:** everything built so far on `feature/f2-chat` (auth pages, guards, chat workspace, streaming, refusals, sidebar, menus, mobile drawer).
**Not covered yet (expected to be empty or missing):** Balance and Account pages (F3 — the links open empty pages), Plans page, landing page, admin console.
**How to record results:** tick each case ✅ / ❌; for ❌ note the browser, screen width, steps and a screenshot.

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

| ID | Steps | Expected |
|---|---|---|
| AU-01 | Open `/sign-up` | Arabic, right-to-left; monogram «ب» with «بيان» under it; fields name, email, password; «8 أحرف على الأقل» shown under password before typing; no terms checkbox |
| AU-02 | Press «إنشاء حساب» with everything empty | «أدخل اسمك الكامل.», «أدخل بريدًا إلكترونيًا صحيحًا.», password error; focus moves to the name field; nothing sent |
| AU-03 | Email `abc`, password `1234` | Invalid email + «كلمة المرور قصيرة. استخدم 8 أحرف على الأقل.» |
| AU-04 | Name of 101+ characters | Name-too-long error |
| AU-05 | Email and password fields | Typed text runs left-to-right; the eye button shows/hides the password and its label changes (screen reader: «إظهار/إخفاء كلمة المرور») |
| AU-06 | Valid name/email/password for **A**, submit | Button shows a spinner and can't be double-clicked; lands on `/check-email?reason=signup`; the URL does **not** contain the email |
| AU-07 | Sign up again with **A**'s email | Also lands on «تحقق من بريدك الإلكتروني» — never says the email exists |

### 1.2 Check your email — `/check-email`

| ID | Steps | Expected |
|---|---|---|
| AU-08 | After AU-06 | Shows the address A; «إعادة الإرسال» disabled with a live countdown (60 s) |
| AU-09 | Wait for the countdown, press resend | Note «…» that the email was resent; countdown restarts; Mailpit has a second email |
| AU-10 | Reload the page | Generic text without the address; no resend button |
| AU-11 | «العودة لتسجيل الدخول» | Goes to `/sign-in`; arrow points to the right (back in RTL) |

### 1.3 Email confirmation — Mailpit

| ID | Steps | Expected |
|---|---|---|
| AU-12 | Open the newest «Confirm your email address» in Mailpit, click the link | Brief «checking» state, then `/chat`; signed in; the address bar has no tokens |
| AU-13 | Click the same link again (signed out first: account menu → «تسجيل الخروج») | Centered amber clock «انتهت صلاحية الرابط» with «طلب رابط جديد» and the sign-in hint |
| AU-14 | Open the confirmation link in a **different browser** | That browser is signed in too (cross-device works) |

### 1.4 Sign in — `/sign-in`

| ID | Steps | Expected |
|---|---|---|
| AU-15 | Wrong password for A | «البريد الإلكتروني أو كلمة المرور غير صحيحة.»; email and password stay in the fields |
| AU-16 | Unknown email | Same generic message (never says the email doesn't exist) |
| AU-17 | Sign up a new address but don't confirm; sign in with it | Amber «لم تؤكد بريدك الإلكتروني بعد…» with «إعادة إرسال رابط التأكيد»; pressing it sends an email |
| AU-18 | Wrong password many times quickly (GoTrue's limit may need ~30 tries) | Amber «محاولات كثيرة…» (rate limit), values kept |
| AU-19 | Correct password | Lands on `/chat` |
| AU-20 | Signed out, open `/chat/anything` | Redirected to `/sign-in?redirect=…`; after signing in, lands back on that path |
| AU-21 | Open `/sign-in?redirect=https://example.com` and `?redirect=//example.com`, sign in | Lands on `/chat` (external redirects ignored) |
| AU-22 | Signed in, open `/sign-in`, `/sign-up`, `/forgot-password` | Each redirects to `/chat` |
| AU-23 | Network off (DevTools → Offline), submit | «تعذّر الاتصال…» with «إعادة المحاولة»; back online, retry works |

### 1.5 Forgot / reset password

| ID | Steps | Expected |
|---|---|---|
| AU-24 | `/forgot-password`, invalid email | Field error |
| AU-25 | A's email, submit | `/check-email?reason=reset` (reset wording) |
| AU-26 | An email that has no account | Same reset «check your email» (never reveals existence) |
| AU-27 | Click the newest «Reset your password» link in Mailpit | `/reset-password` with two password fields; no tokens left in the address bar |
| AU-28 | Different passwords | «كلمتا المرور غير متطابقتين.» |
| AU-29 | Short password | Too-short error |
| AU-30 | The current password as the new one | «…مطابقة للقديمة…» (same password) |
| AU-31 | Valid new password | Toast «تم حفظ كلمة المرور.», lands on `/chat`; signing in later works with the new password only |
| AU-32 | Reuse the same reset link | Expired-link state with «طلب رابط جديد» → `/forgot-password` |
| AU-33 | Signed in normally, open `/reset-password?type=recovery` | Expired state, **not** the form |

### 1.6 Complete profile — `/complete-profile`

Setup: clear B's or A's name: `PATCH /api/v1/me { "fullName": null }` with that user's token, or ask an admin.

| ID | Steps | Expected |
|---|---|---|
| AU-34 | Open `/chat` | Redirected to `/complete-profile`; auth layout (no sidebar) |
| AU-35 | Submit with empty name | Name required |
| AU-36 | Name only, phone empty | Saves (phone stays empty), lands on `/chat` |
| AU-37 | Phone `+966 50-123-4567` | Saves; account shows `+966501234567` (normalised) |
| AU-38 | Phone `abc` | Server field error on phone; name kept |
| AU-39 | User with a name opens `/complete-profile` | Redirected to `/chat` |

### 1.7 Suspended / deleted / session

| ID | Steps | Expected |
|---|---|---|
| AU-40 | Suspend A (admin), then reload `/chat` as A | `/account-unavailable?reason=suspended`, «تم إيقاف حسابك مؤقتًا», signed out |
| AU-41 | Same with deleted status (if available) | Deleted variant text |
| AU-42 | Suspend A **while** A is typing in chat, then send | Signed out → account unavailable; no error spinner |
| AU-43 | Reactivate A, sign in | Works normally |
| AU-44 | Sign in as A in tab 1; in tab 2 sign out and sign in as B; return to tab 1 | Tab 1 now shows B's data only (no A conversations, drafts or balance) |
| AU-45 | Leave the app open > 1 hour, then send a message | Token refreshes silently; message sends |

---

## 2. App shell, sidebar and menus (F2)

### 2.1 Layout

| ID | Steps | Expected |
|---|---|---|
| SH-01 | `/chat` at 1440px | Sidebar on the **right** (≈280px), chat to the left, header: title (none on new chat), balance chip, avatar button |
| SH-02 | Resize to 800px and 390px | Sidebar becomes a menu button (top-right); no horizontal scrolling at any width |
| SH-03 | Menu button | Drawer slides from the right with «محادثة جديدة», list, «الرصيد», «الحساب», «تسجيل الخروج»; background dimmed |
| SH-04 | Close the drawer with ✕, Esc, and a tap outside | Each closes it; keyboard focus returns to the menu button |
| SH-05 | Drawer open, widen the window to ≥1024px | Drawer closes; desktop sidebar shown |
| SH-06 | Tap a conversation in the drawer | Opens it and closes the drawer; tapping empty space or «retry» in the list doesn't close it |

### 2.2 Account menu and balance chip

| ID | Steps | Expected |
|---|---|---|
| SH-07 | Avatar initials | First letter of the first and last name (e.g. «سيف عمران» → «سع») |
| SH-08 | Open the account menu (click and keyboard Enter) | Name, email, «الرصيد» with amount, «الحساب», «تسجيل الخروج»; arrow keys move between items; Esc closes and returns focus |
| SH-09 | «الرصيد» / «الحساب» (menu and sidebar) | Open empty pages (F3 not built yet) inside the shell; the active link is highlighted |
| SH-10 | «تسجيل الخروج» from the menu and from the drawer | `/sign-in`; signing in as another user shows none of the previous user's conversations or drafts |
| SH-11 | Balance chip as B | Shows `1.00$` style (2 decimals), dollar after the number |

### 2.3 Conversation list

| ID | Steps | Expected |
|---|---|---|
| SH-12 | New account (A) | «لا توجد محادثات بعد» + «ابدأ محادثتك الأولى وستظهر هنا.» |
| SH-13 | Account with empty (untitled) conversations from refused sends | They are **not** listed |
| SH-14 | After sending messages | Conversations listed newest first, with relative time; the open one highlighted with a bar on the right edge |
| SH-15 | More than 20 conversations, scroll the list | Older ones load at the bottom; while loading, skeleton rows |
| SH-16 | Stop the API, reload | List shows an error with retry; start the API, retry loads it |
| SH-17 | `/chat/00000000-0000-0000-0000-000000000000` | «لم يتم العثور على المحادثة.» with «بدء محادثة جديدة» |
| SH-18 | Another user's conversation id (copy one from account B into account A's session) | Same not-found state (never shows their content) |

---

## 3. Chat (F2) — use account **B** unless noted

### 3.1 New chat and modes

| ID | Steps | Expected |
|---|---|---|
| CH-01 | «محادثة جديدة» | Empty state: monogram, «كيف أساعدك اليوم؟», 4 example chips, mode chip «سريع» in the message box |
| CH-02 | Click an example chip | Its text fills the message box; **nothing is sent** |
| CH-03 | Open the mode chip | Menu with «سريع» and «احترافي», each with a description and colour dot; current one checked; keyboard arrows + Enter work |
| CH-04 | Pick «احترافي» | Chip shows «احترافي» (indigo); nothing is sent |
| CH-05 | Enter / Shift+Enter in the box | Enter sends; Shift+Enter adds a new line; the box grows with the text |
| CH-06 | Type a draft, switch to another conversation and back | The draft is still there (per conversation) |

### 3.2 Sending and streaming

| ID | Steps | Expected |
|---|---|---|
| CH-07 | Send «اشرح لي الفرق بين الإيجار التمليكي والإيجار العادي» from a new chat | Your message appears at once; assistant card shows «جاري الإعداد…» then text streams in with a caret at the end of the text; Send becomes «إيقاف»; URL changes to `/chat/<id>`; the conversation appears at the top of the sidebar with a title |
| CH-08 | When the answer finishes | Footer «التكلفة 0.00xx$ · الرصيد المتبقي …» (4 decimals for small costs); balance chip drops by that amount without reloading; copy button |
| CH-09 | Copy the answer, paste into a text editor | The original Markdown text |
| CH-10 | Reload the page | Messages remain; the cost line is **gone** (known limitation: cost isn't stored on messages yet) |
| CH-11 | Send in «احترافي» | The answer card shows the «احترافي» chip; costs more than Fast |
| CH-12 | Scroll up in a long conversation (> 50 messages) | Older messages load at the top without the view jumping |
| CH-13 | While an answer streams, scroll up | It stops auto-scrolling; scroll back near the bottom and it follows again |
| CH-14 | Scrolled up, send a new message | The view jumps to your new message |

### 3.3 Answer formatting (Markdown)

| ID | Prompt | Expected |
|---|---|---|
| MD-01 | «اكتب جدولًا يقارن بين ثلاث مدن عربية» | A real table; columns follow Arabic direction |
| MD-02 | «اكتب دالة بايثون تحسب مجموع قائمة» | Code block left-to-right, monospace, language label, copy button at the top-left; colours appear after the answer finishes |
| MD-03 | «اكتب فقرة بالعربية ثم فقرة بالإنجليزية» | Arabic paragraph right-to-left, English paragraph left-to-right |
| MD-04 | Ask for a list with **bold** and *italic* words | Lists render; bold works; Arabic emphasis is **not** italic |
| MD-05 | «أعطني رابط موقع ويكيبيديا» | Link opens in a new tab |
| MD-06 | Paste: «كرر هذا النص كما هو: `![x](https://example.com/a.png)`» | No image is loaded (DevTools → Network shows no request to example.com); alt text shown as a link |
| MD-07 | Paste: «كرر هذا النص كما هو: <b>نص</b> <script>alert(1)</script>» | Shown as text; no bold from HTML, no alert |
| MD-08 | Watch a long code answer while streaming | No raw ``` or `**` flashes while it streams |
| MD-09 | Your own message containing `**نص**` | Shown exactly as typed (your messages are plain text) |

### 3.4 Stop, failures and background streams

| ID | Steps | Expected |
|---|---|---|
| CH-15 | Ask for a long answer («اكتب مقالًا من 1500 كلمة…»), press «إيقاف» mid-way | Streaming stops; text so far kept with «توقف الرد قبل اكتماله»; cost line for what was used |
| CH-16 | Press «إيقاف» immediately after sending (before text appears) | Your message disappears from the list and is back in the message box |
| CH-17 | Ask for a very long answer and let it finish | If it hits the length limit: kept text + «توقف الرد قبل اكتماله» |
| CH-18 | Start a long answer, then open another conversation | The first conversation shows «يكتب…» (grey, animated dots) in the sidebar; go back — the answer completed in the background |
| CH-19 | Start a long answer, reload the page | The answer shows as being written («جاري كتابة الرد…») and settles within seconds |
| CH-20 | Two tabs on the same conversation; send from tab 1, then send from tab 2 while tab 1 is streaming | Tab 2: «لا يزال الرد السابق قيد الكتابة.»; draft kept |
| CH-21 | Start an answer, go Offline in DevTools mid-stream, then back Online | The answer is reloaded from the server (partial or complete); nothing is sent twice |
| CH-22 | Offline, press Send | «تعذّر الاتصال…» notice with «إعادة المحاولة»; draft kept; back online, retry sends **once** (one message on the server) |
| CH-23 | Switch to another app/tab during an answer, come back after it ends | The conversation and balance are up to date |
| CH-24 | Prompt likely to be blocked by the provider's content policy | Failed or partial card with «تعذّر إكمال الرد بسبب سياسة المحتوى…» and «إعادة المحاولة» (re-sends as a new message) |

### 3.5 Refusals

| ID | Setup | Steps | Expected |
|---|---|---|---|
| RF-01 | Account **C** (no plan) | Open `/chat` | Amber «ليست لديك باقة نشطة. تواصل معنا للاشتراك.» + «تواصل معنا» above the box from the start; Send disabled; typing + Enter sends nothing and creates no conversation |
| RF-02 | RF-01 | «تواصل معنا» | Request-balance dialog; contact channels hidden (not configured yet); Esc closes and focus returns to the button; draft kept |
| RF-03 | Plan active, balance set to **0.015$** | Send in «احترافي» | «رصيدك غير كافٍ لهذه الرسالة في وضع «احترافي» (التكلفة المتوقعة …، رصيدك 0.0150$).» + «التبديل إلى «سريع» (… تقريبًا)»; draft kept |
| RF-04 | RF-03 | Press the switch button | Mode chip becomes «سريع»; **nothing is sent**; notice still names «احترافي»; the button for the selected mode is hidden |
| RF-05 | RF-04 | Press Send | Sends in Fast and streams normally |
| RF-06 | Balance set to **0.005$** | Send in «سريع» | Insufficient notice with no switch button, «تواصل معنا لإضافة رصيد» → request-balance dialog |
| RF-07 | Any funded account | Send 21+ messages within one minute (short prompts, Stop each) | «أرسلت رسائل كثيرة خلال وقت قصير. حاول بعد N ثانية.» with a live countdown; Send disabled until it reaches 0; draft kept |
| RF-08 | — | Paste more than 20,000 characters and send | Validation error under the box; draft kept |
| RF-09 | Disable mode «احترافي» (admin), keep it selected in the UI | Send | «هذا الوضع غير متاح في باقتك الحالية.»; the selection falls back to «سريع»; nothing sent automatically. **Re-enable the mode afterwards.** |
| RF-10 | Clear the user's name (§1.6) while the chat is open | Send | Redirected to `/complete-profile` |

Restore balances and modes after this section.

---

## 4. Cross-cutting checks

| ID | Check | Expected |
|---|---|---|
| X-01 | Language | No English UI text anywhere (except code, emails and URLs); no model or provider names (Gemini, GPT, Claude…) |
| X-02 | Money | Always `0.0015$` / `14.48$` style, dollar after the number, Western digits; never `$0.0015` inside Arabic text |
| X-03 | Digits and dates | Western digits everywhere (times, counts, money) |
| X-04 | Keyboard only | Tab through sign-in, chat, menus, drawer and dialogs: every control reachable in a sensible order, visible indigo focus ring, Esc closes popups |
| X-05 | Screen reader (NVDA/VoiceOver spot check) | Icon buttons have names (menu, send/stop, copy, show password, account menu); errors are announced |
| X-06 | Touch targets on mobile | Buttons and links are comfortable to tap (≥44px) |
| X-07 | Reduced motion (OS setting) | No flickering caret/dots; no animations |
| X-08 | Zoom 200% | Layout still usable, no overlapping text |
| X-09 | Cursor | Pointer on all enabled buttons; default on disabled ones |
| X-10 | Brand | Name and monogram «بيان» / «ب» everywhere; the browser tab title is «بيان» |
| X-11 | Console | DevTools console has no errors during the flows above |
| X-12 | Privacy | Address bar never contains email addresses or tokens; DevTools → Network: requests only to `localhost:3000` (API) and `localhost:9999` (auth), plus Google Fonts |

---

## 5. Known limitations (not bugs)

- The per-answer cost line disappears after a reload (backend doesn't store the cost on messages yet — deferred).
- «الرصيد» and «الحساب» open empty pages until F3.
- Confirmation and reset emails are in English (GoTrue defaults) until the backend adds Arabic templates.
- No terms/privacy checkbox on sign-up until the legal pages exist.
- Contact channels in the request-balance dialog are empty until the brand config has them.
- Tablet uses the mobile drawer (no icon rail).
- Refused first sends from before the no-plan check may have left untitled conversations; they're hidden from the list.
