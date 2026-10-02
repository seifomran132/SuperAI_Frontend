# S7 Check your email (sign-up variant)

- Stitch project: `projects/15605789258921234837`
- Screen id: `0873935e4d684c73a7d54b8329b91213`
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`), source [design/DESIGN.md](../../DESIGN.md)
- Status: **approved by the user, 2026-10-02** (including the proposed copy)

## Checked

- [x] No sidebar; centered column; monogram + name; envelope icon in a 56px circle
- [x] `dir="rtl"`, Plex Sans Arabic, Western digits, no italics, no `tracking-*`
- [x] Target address in `<bdi dir="ltr">`; instruction and spam hint; «إعادة الإرسال» (secondary, enabled); «العودة لتسجيل الدخول» with the back arrow pointing right (mirrored)
- [x] No payments, social login, footer, or English UI text (except the sample address)
- [ ] "One primary action": this page has none by design (resend is secondary, back is a text link). Please confirm.

## Fixes

- Resend button focus ring changed from navy (`ring-brand`) to `#4F46E5` in the saved HTML.

## Reset variant

Same layout. Only copy differs (`?reason=reset`): line «أرسلنا رابط إعادة تعيين كلمة المرور إلى» and instruction «افتح الرسالة واضغط على الرابط لاختيار كلمة مرور جديدة. إن لم تجدها، تحقق من البريد غير المرغوب فيه.» (proposed). No separate Stitch screen.

## Implementation notes

- Email is held in memory, not in the URL. If the page is opened without it, hide the address line.
- Resend cooldown 60 s with a live countdown, tabular digits. Cooldown state is on [f1-auth-states](../f1-auth-states/).
- Brand name from config; tokens not hex.

## States still to design

Resend sent confirmation (e.g. «أُرسل الرابط مرة أخرى») and resend failure (rate limit uses the board copy).
