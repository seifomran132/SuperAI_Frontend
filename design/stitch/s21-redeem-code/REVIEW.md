# S21 Redeem a code («لديك كود؟») (desktop board + mobile 375px)

- Stitch project: `projects/15605789258921234837`
- Screen ids: **none (hand-built)**, like the approved S10, S12 and S17 boards (annotated multi-state boards; no `generate_screen_from_text` call was made).
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`), source [design/DESIGN.md](../../DESIGN.md). Markup reuses the S10 balance card and activity rows and the S12 plan cards. Brand «ل» / «لمحة AI» from `src/brand/lam7a.ts`.
- Status: **approved by the user, 2026-11-06**, with the recommendations in `docs/plans/DESIGN_DECISIONS_F9_F10.md` (applied in the build, not redrawn). New copy in this file accepted unless that list changes it.
- Spec: `docs/plans/F10_VOUCHERS.md` §2 (decisions 1-5), brief `F10_VOUCHERS_BRIEF.md`.
- Files: `desktop.html` / `desktop.png` (1560px board, 9 frames), `mobile.html` / `mobile.png` (6 phone frames at 375px on one board). Board titles and grey notes are annotations, not UI.

## Desktop frames
1. Collapsed «لديك كود؟» (text button with ticket icon, 44px) in the full balance page (sidebar on the right), under the balance card.
2. Open: label «الكود», LTR field (`WELCOME5` placeholder, upper-case display), «استخدام الكود», hint «لا يهم حجم الأحرف.». 2b: sending, spinner + «جارٍ التحقق…», button disabled, field read-only, code kept.
3. VOUCHER_NOT_FOUND under the field (danger border + icon + text, code kept); the other four codes as a list of texts.
4. NO_ACTIVE_SUBSCRIPTION: warning notice with «عرض الباقات» and «طلب رصيد».
5. RATE_LIMITED: catalog text + «يمكنك المحاولة بعد 42 ثانية.», button disabled.
6. Success, balance code: «أُضيف +5.00$ إلى رصيدك.», balance card 19.48$ (green), «رصيد قسيمة» row at the top of the activity, «استخدام كود آخر».
7. Success, trial code: «تم تفعيل باقة «احترافي» حتى 20 نوفمبر 2026.», card shows the plan and new expiry.
9. Plans page: box under the plan cards, open with VOUCHER_NOT_ELIGIBLE. The collapsed state there is the same button as frame 1.

## Mobile frames (375px)
1 collapsed, 2 open, 3 error, 4 needs a plan, 5 rate limit wait, 6 success (balance). Field and buttons full width, stacked.

## Checked
- [x] `dir="rtl"`, IBM Plex Sans Arabic, `<aside>` first in the flex row (renders right); logical classes only (grep for ml-/mr-/tracking/italic: none)
- [x] Western digits; money `5.00$` in `<bdi dir="ltr">`; no letter-spacing/italics; code field `dir="ltr"`, no monospace
- [x] Error/rate/needs-plan texts are verbatim from `src/i18n/errors.ar.json`
- [x] Tokens only; text colors meet contrast (warning notice text uses #78350F on warning-bg; disabled controls not checked)
- [x] No payments or top-up (CTA is «طلب رصيد»), no model/provider names, no per-answer cost
- [x] 44px targets (collapsed button, close, buttons, field); `role="alert"` on errors, `role="status"` on success/wait, `aria-invalid` + `aria-describedby` on the field
- Not checked: Stitch export (none).

## Decisions for the user
1. **RATE_LIMITED catalog text says «أرسلت رسائل كثيرة…»** (written for chat). For wrong codes it reads oddly. Used verbatim as asked; suggest a voucher-specific text: «أدخلت أكواد خاطئة كثيرة. انتظر قليلًا ثم حاول مرة أخرى.»
2. **NO_ACTIVE_SUBSCRIPTION** shows the catalog text plus one new line explaining why. Drop the extra line if you want catalog text only.
3. **Frame 4 balance card** with no plan shows «باقتك: —» and no expiry line (the no-plan state of S10 is not designed there).
4. The collapsed text button sits under the balance card with the same 44px target as other text links.

## New copy (for approval)
| Arabic | Where |
|---|---|
| لديك كود؟ | collapsed button, box title (given) |
| استخدام الكود | submit (given) |
| الكود | field label |
| لا يهم حجم الأحرف. | hint under the open field |
| جارٍ التحقق… | button while sending |
| إغلاق | collapses the box |
| هذا الكود يضيف رصيدًا، والرصيد يحتاج إلى باقة نشطة. | needs-plan notice, second line |
| يمكنك المحاولة بعد {{n}} ثانية. | rate-limit countdown |
| أُضيف +5.00$ إلى رصيدك. / تم تفعيل باقة «احترافي» حتى 20 نوفمبر 2026. / استخدام كود آخر | success (from F10 §2.4) |

## Implementation notes
- `RedeemCodeBox` in `src/features/balance`, exported via `ui.ts`; on `/plans` hide «عرض الباقات» (same page).
- Field: `dir="ltr"`, `autocomplete="off"`, `autocapitalize="characters"`, max 40; upper-case by CSS on the Latin value only; the API ignores case and spaces.
- Success clears the field, shows the message in place (`role="status"`), invalidates balance, subscription, activity and plans queries. The balance number turning green is a board hint; the build may skip the colour.
- Spinner animation only under `prefers-reduced-motion: no-preference`.
- The countdown from `data.retryAfterSeconds` uses the chat countdown hook; the field returns when it ends.

## States still to design
Network/other error with retry (generic error card pattern from f2); the no-plan variant of the balance card.
