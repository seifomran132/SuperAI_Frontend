# F1 auth states board (desktop)

- Stitch project: `projects/15605789258921234837`
- Screen id: **none** (hand-built, see Provenance)
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`), source [design/DESIGN.md](../../DESIGN.md)
- Status: **approved by the user, 2026-10-02** (including the proposed copy)

## Provenance

Stitch generation of this board timed out on 4 attempts (full and Flash-Lite models, long and trimmed prompts). `desktop.html` was built by hand with the same tokens and component styles as the Stitch auth pages, and `desktop.png` is a local render (Edge headless, 1680px). Treat it as a spec sheet, not a Stitch screen. Re-create it in Stitch if you need it there.

## Cards (right to left, row by row)

1. S5 wrong credentials: danger alert «البريد الإلكتروني أو كلمة المرور غير صحيحة.» (§5 verbatim)
2. S5 email not confirmed: warning alert «لم تؤكد بريدك الإلكتروني بعد. أرسلنا لك رابط التأكيد.» (§5 verbatim) + secondary «إعادة إرسال رابط التأكيد»
3. S6 field errors: «أدخل اسمك الكامل.» · «أدخل بريدًا إلكترونيًا صحيحًا.» · «كلمة المرور قصيرة. استخدم 8 أحرف على الأقل.» (proposed, not in §5)
4. S7 resend cooldown: disabled «إعادة الإرسال بعد 45 ثانية» (proposed)
5. S8b link expired: «انتهت صلاحية الرابط أو استُخدم من قبل. اطلب رابطًا جديدًا.» (§5 verbatim) + primary «طلب رابط جديد»
6. Network error: «تعذّر الاتصال. تحقق من اتصالك وحاول مرة أخرى.» (§5) + «إعادة المحاولة»
7. Too many attempts: «محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.» (§5)

## Checked

- [x] RTL, Plex Sans Arabic, Western digits, no letter-spacing or italics, LTR email/password inputs
- [x] Status uses icon + text + color (danger `#BE123C` on `#FFF1F2`, warning `#B45309` on `#FFFBEB`)
- [x] Field errors below the field with an icon; error border 2px `#BE123C`
- [x] No payments, social login, footer
- Inputs are 44px on the board (real pages use 48px)

## Implementation notes

- Shared Alert component with `danger` and `warning` tones, `role="alert"`. Field errors use `aria-invalid` and `aria-describedby`.
- Never clear typed email or password on recoverable errors.
- Mapping lives in `src/features/auth/errors.ts` -> i18n `authErrors`.
