# Launch day: plans, modes and production setup

**Date:** 2026-10-15. **Status:** agreed plan, to be configured in production `/admin`.
Related: [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md), [FRONTEND_PLAN.md](../FRONTEND_PLAN.md) §4b.

## 1. How plans work (what the system supports)

- **What a plan is:** a monthly price, an **included balance** (USD) and the **modes** it unlocks.
- **What users see:** only modes, never providers or models.
- **How answers are charged:** each answer is charged from the balance at the model's price plus the margin (40% by default).
- **When balance expires:** all balance expires when the plan ends (one month). Say this clearly on `/plans`.
- **No in-app payments:** admins activate paid plans from `/admin` after payment is arranged outside the app.

## 2. Plans

| Key | Arabic name | English name | Price / month | Included balance | Modes |
|---|---|---|---|---|---|
| `free` (default) | **المجانية** | Free | $0 | **$0.25** free trial, once per account | سريع |
| `basic` | **الأساسية** | Basic | $10 | $10.00 | سريع، ذكي |
| `advanced` | **المتقدمة** | Advanced | $25 | $27.50 (+10%) | سريع، ذكي، احترافي |
| `professional` | **الاحترافية** | Professional | $50 | $57.50 (+15%) | سريع، ذكي، احترافي، خبير |

The bonus balance on المتقدمة and الاحترافية rewards the larger plans; the 40% margin covers it.

**Proposed descriptions** (Arabic first; review them):

| Plan | Arabic | English |
|---|---|---|
| المجانية | ابدأ مجانًا وجرّب المساعد بالوضع السريع. | Start free and try the assistant in Fast mode. |
| الأساسية | للاستخدام اليومي: إجابات سريعة وذكية بسعر مناسب. | For everyday use: quick, smart answers at a fair price. |
| المتقدمة | للعمل الجاد: وضع احترافي لمهام الكتابة والتحليل، ورصيد إضافي 10%. | For serious work: Professional mode for writing and analysis, plus 10% extra balance. |
| الاحترافية | كل الأوضاع، بما فيها وضع الخبير للمسائل المعقدة، ورصيد إضافي 15%. | Every mode, including Expert for complex problems, plus 15% extra balance. |

### Free trial (option A, approved 2026-10-15; backend building it)

**Decided:**
- **Who:** new sign-ups only. Accounts created before the change ships never get the trial; the migration records a cutoff time.
- **When:** granted on the first signed-in request, so only after the email is confirmed.
- **Once per email, ever:** +tags are stripped for every domain, and dots too for gmail.com and googlemail.com.
- **Visible in the UI:** the subscription carries `source: 'trial' | 'admin'`, and the plan card will show «تجربة مجانية» (free trial).

Today the default plan gives modes but no balance, so a new user's first message is refused with «ليست لديك باقة نشطة». The backend will give every new account **one** subscription to المجانية with **$0.25**, once per account.
- **Amount:** taken from the plan's included balance in `/admin`.
- **Abuse:** proposed to start only after the email is confirmed, so throwaway sign-ups can't farm it.
- **After it ends:** the user stays on المجانية with no balance, and the «تواصل معنا» (contact us) flow takes over.

**Blocking:** without this change the free plan cannot chat.

## 3. Modes and models

Choose the exact model ids and prices with **«إضافة نموذج» → choose the provider** (F7). It shows what each provider offers today and its catalog price.
- **Pick fast models first:** after adding them, run the model test in `/admin/models/<id>` and compare the time to the first word. The first Gemini Flash with default thinking took 35–55 s.
- **Images:** turn on «يقرأ الصور» for each model that reads them. It's prefilled from the catalog.

| Mode | Arabic label | Role | First choice | Alternatives | Thinking |
|---|---|---|---|---|---|
| `fast` | **سريع** | Everyday questions; first word in 1–2 s | Gemini Flash-Lite (latest) | GPT-5 nano class, `deepseek-flash` (reads images) | off |
| `smart` | **ذكي** | Better answers, still quick | GPT-5 mini class | Gemini Flash (latest), Claude Haiku (latest) | low |
| `pro` | **احترافي** | Writing, analysis, code | Claude Sonnet (latest) | GPT-5.x | low |
| `expert` | **خبير** | Hard reasoning, long documents | GPT-5.x (top) | Gemini Pro (latest), Claude Opus class | default |

**Notes:**
- **Tiered prices (money risk):** Gemini Pro is priced higher above 200K tokens of context, and GPT-5.4 above 272K. The picker warns «سعر متدرّج». For those models, set the context window to the tier limit, because we bill one rate.
- **DeepSeek:** it bills peak and off-peak rates. Price at the peak rate, and only `deepseek-flash` reads images. Confirm with a `provider:smoke` run that its `max_tokens` includes reasoning before using it in a mode.
- **Mode descriptions:** one short line each, saying what the mode is good for and its relative cost. No provider or model names.
- **Rough cost per answer** (2K tokens in, 800 out, with margin; real prices come from the catalog):
  - سريع ≈ $0.001–0.003
  - ذكي ≈ $0.003–0.01
  - احترافي ≈ $0.02–0.04
  - خبير ≈ $0.03–0.06

## 4. Production setup order

| # | Step | Where | Who |
|---|---|---|---|
| 1 | Deploy F7 (frontend `3d0ae71`; backend `d4ebeb4` already deployed?) | GitHub approval | Team |
| 2 | Provider keys: OpenAI, Anthropic, Gemini, DeepSeek | `/admin/providers` | Team |
| 3 | Add the models from §3 with «إضافة نموذج» (catalog prices), then run the model test for each | `/admin/models` | Team (+ Claude) |
| 4 | First catalog sync: «تحديثات الأسعار» → run now, then review what it held back | `/admin/price-updates` | Team |
| 5 | Create the four modes from §3, and set the لمحة AI system prompt (no provider or model names) | `/admin/modes`, `/admin/settings` | Team |
| 6 | Create the four plans from §2, and make المجانية the default with $0.25 included | `/admin/plans` | Team |
| 7 | Free-trial backend change deployed | Backend | Backend + Team |
| 8 | Run-through: sign up → confirm email → trial balance → chat in سريع, with and without an image → activate الأساسية for a test user → chat in ذكي → check cost and balance | lam7ai.com | Team |
| 9 | Before real money: rotate the deploy SSH key and the Brevo SMTP key; nightly backup cron, off-server copy, one restore test (now including the uploads volume) | Server | Team + Claude |

## 5. Open

- Final review of the plan and mode descriptions (Arabic).
- Choose the exact models after comparing speed in step 3.
