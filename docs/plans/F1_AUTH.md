# F1 — Auth pages plan

**Status:** Draft for review, 2026-10-02
**Screens:** S5 sign in · S6 sign up · S7 check your email · S8 forgot / reset password · S9 complete profile · part of S15 (account unavailable)

## 1. How auth works with our backend (facts that shape the UI)

From `../SuperAI_Backend/docker-compose.yml` and API_CONTRACT §2:

- The browser talks to **GoTrue** directly (`@supabase/auth-js`); the API only verifies the token.
- **Email + password only.** Email confirmation is **required** (`GOTRUE_MAILER_AUTOCONFIRM=false`). Password minimum **8 characters**.
- Email links (confirm, recovery) go through GoTrue's `/verify` and then redirect back to the app. Allowed redirects: `http://localhost:3001/**` (dev); production needs its own `GOTRUE_SITE_URL` / allow list.
- Sign-up sends the full name as `full_name` metadata; a database trigger copies it into the profile. `PATCH /me { fullName }` changes it later.
- The chat endpoint refuses users without a name (`PROFILE_INCOMPLETE`).
- A suspended or deleted account still signs in at GoTrue, but every API call returns `403 ACCOUNT_SUSPENDED` / `ACCOUNT_DELETED`.
- Local emails land in Mailpit (http://localhost:8025). **Email templates are GoTrue's English defaults**; Arabic templates are backend work (IMPLEMENTATION_MODULES 10.7).

Two consequences for UX:

1. **Duplicate email can't be shown.** With confirmation on, GoTrue answers a sign-up for an existing email with a normal-looking success (to avoid revealing which emails exist). So sign-up always ends on "check your email". The UI brief's "duplicate email" state is dropped.
2. **Password reset never reveals whether an account exists** (same reason, and the brief asks for it).

## 2. Flows

```
Sign up ──► Check your email ──(link)──► /auth/callback ──► signed in ──► /chat
                │ resend                         │ link expired/used ──► "link expired" + resend
Sign in ──► (GET /me) ──► fullName empty? ──► Complete profile ──► /chat
   │            └── 403 suspended/deleted ──► sign out ──► Account unavailable
   └── "email not confirmed" ──► resend confirmation ──► Check your email
Forgot password ──► Check your email ──(link)──► /reset-password ──► new password ──► signed in ──► /chat
```

After sign-in we return to the page the user came from (`?redirect=`), but only to an internal path.

## 3. Routes

| Route | Screen | Access |
|---|---|---|
| `/sign-in` | S5 | signed-out only (signed-in users go to `/chat`) |
| `/sign-up` | S6 | signed-out only |
| `/check-email?reason=signup\|reset&email=` | S7 | public. Email kept in memory, **not** in the URL (privacy rule); the query only carries `reason` |
| `/forgot-password` | S8a | public |
| `/reset-password` | S8b | only with a recovery session from the email link; otherwise shows "link expired" |
| `/auth/callback` | — | handles the email-link redirect (success or `error_code=otp_expired`) |
| `/complete-profile` | S9 | signed in, name empty |
| `/account-unavailable?reason=suspended\|deleted` | S15 part | public |

All auth pages share one layout: centered card on the canvas, brand monogram + name, language stays Arabic, no sidebar.

## 4. Screen contents and states

**S5 Sign in:** email, password (show/hide), «تسجيل الدخول», links «نسيت كلمة المرور؟» and «إنشاء حساب».
States: submitting; wrong email or password (one generic message, never which one); email not confirmed (+ «إعادة إرسال رابط التأكيد»); too many attempts; network/server error with retry; account unavailable (redirect).

**S6 Sign up:** full name, email, password (show/hide, "8 أحرف على الأقل" shown before typing), «إنشاء حساب», link to sign in. No terms checkbox until the legal pages exist (added before launch; links come from brand config).
States: field validation in Arabic (empty name, invalid email, short password); submitting; weak password from GoTrue; too many attempts; network error. Success → S7.

**S7 Check your email:** which address we sent to, what to do next, «إعادة الإرسال» with a cooldown (60 s), «العودة لتسجيل الدخول». Variant for reset requests (same layout, different copy). Note to check spam.

**S8a Forgot password:** email, «إرسال رابط إعادة التعيين». Always goes to S7 (never says whether the account exists).
**S8b Reset password:** new password + confirm (show/hide, rules shown), «حفظ كلمة المرور». States: mismatch, too short, link expired/used (→ request a new link), success → signed in → `/chat`.

**S9 Complete profile:** short explanation («أكمل ملفك قبل بدء المحادثة»), full name (required), phone number (optional, marked «اختياري», `dir="ltr"`, `autocomplete="tel"`, hint with the international format e.g. `+966 50 123 4567`; the backend normalises spaces and dashes), «متابعة». Uses `PATCH /me { fullName, phoneNumber }`; `VALIDATION_FAILED.details` highlights the field.

**Account unavailable:** icon, «تم إيقاف حسابك مؤقتًا» / «تم حذف هذا الحساب», contact options from brand config, «العودة».

Every page: visible focus, labels above fields, errors below with an icon, autofill-friendly `autocomplete` attributes (`email`, `current-password`, `new-password`, `name`), `dir="ltr"` on the email and password inputs (typed content is Latin), touch targets ≥ 44px.

## 5. GoTrue errors → Arabic copy

GoTrue errors are not in our backend's catalog; we map them in `src/i18n/ar.json` under `authErrors`:

| GoTrue `error_code` | Arabic (draft) |
|---|---|
| `invalid_credentials` | البريد الإلكتروني أو كلمة المرور غير صحيحة. |
| `email_not_confirmed` | لم تؤكد بريدك الإلكتروني بعد. أرسلنا لك رابط التأكيد. |
| `weak_password` | كلمة المرور ضعيفة. استخدم 8 أحرف على الأقل. |
| `over_email_send_rate_limit`, `over_request_rate_limit` | محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى. |
| `otp_expired` | انتهت صلاحية الرابط أو استُخدم من قبل. اطلب رابطًا جديدًا. |
| `same_password` | كلمة المرور الجديدة مطابقة للقديمة. اختر كلمة مختلفة. |
| anything else / network | تعذّر الاتصال. تحقق من اتصالك وحاول مرة أخرى. |

## 6. Technical design (no UI)

**State: no Zustand for auth or user info.** Each piece of state has exactly one owner:

| State | Owner | How components read it |
|---|---|---|
| Session (tokens, signed in or not) | auth-js (`GoTrueClient`): persists it, refreshes it, emits `onAuthStateChange` | `useSession()` — `useSyncExternalStore` over auth-js events; route guards call `auth.getSession()` |
| User info (`/me`: name, phone, status, `isAdmin`) | TanStack Query (server state) | `useQuery(meControllerGetOptions())`; `PATCH /me` updates the cache; guards use `queryClient.ensureQueryData` |
| UI-only state (selected mode, drafts, sidebar open) | Zustand, later (F2) | small stores per feature |

Copying session or `/me` into Zustand would create a second source of truth that can drift (refresh in another tab, profile update, sign-out). On sign-out we clear the query cache so no user data survives.

- `src/features/auth/`
  - `session.ts` — `useSession()` over `auth.onAuthStateChange`; on `SIGNED_OUT` clear the query cache.
  - `me.ts` — `ensureMe(queryClient)` for guards: empty `fullName` → `/complete-profile`; 403 suspended/deleted → sign out → `/account-unavailable`.
  - `errors.ts` — GoTrue error → i18n key (table above).
  - `redirect.ts` — validate `?redirect=` (internal paths only).
- Route guards in `beforeLoad`: `_authed` layout (needs session + profile complete) and `_guest` layout (redirects signed-in users).
- Email links: `emailRedirectTo` / `redirectTo` point to `${origin}/auth/callback` and `${origin}/reset-password`. Recovery is detected from the `PASSWORD_RECOVERY` event.
- **Auth flow type (decision):** keep auth-js's default implicit flow, so a confirmation link opened on another device (sign up on laptop, open email on phone) still signs the user in there. PKCE is stricter but fails in that cross-device case; revisit with the security review (P0-17).
- Forms: plain controlled forms with a small validation helper (no form library yet); server field errors from `details`.

## 7. Work breakdown

| Step | Who | Output | Gate |
|---|---|---|---|
| 1 | `stitch-designer` | S5, S6, S7, S8a/b, S9, account-unavailable — desktop + mobile, all states above | **You approve** in Stitch |
| 2 | `ui-builder` | Auth layout, pages, form components (text field, password field, button, inline alert), `src/features/auth` logic, routes, i18n | Typecheck, lint, tests |
| 3 | `test-engineer` | MSW handlers for GoTrue (`/token`, `/signup`, `/recover`, `/resend`, `/user`) and `/me`; component tests for every state; one Playwright flow sign-up → Mailpit link → callback → complete profile (runs against local backend) | Green |
| 4 | `frontend-reviewer` | Review against both checklists | APPROVE |
| 5 | me | Manual run against local GoTrue + Mailpit, commit | — |

Shared components built here (text field, password field, button, alert, auth layout) become the base for every later screen, so step 2 starts with them.

## 8. Decisions (2026-10-02)

1. **Terms and privacy:** legal pages come later. No checkbox in sign-up for now; add it (with brand-config links) before launch.
2. **Phone number:** not in sign-up; optional field on Complete profile (S9).
3. **Email templates:** GoTrue's English defaults for now; Arabic templates before launch (backend 10.7).
4. **Auth flow type:** implicit (works when the email link is opened on another device); revisit in the security review.
5. **State:** session in auth-js, user info in TanStack Query, no Zustand for either (§6).
