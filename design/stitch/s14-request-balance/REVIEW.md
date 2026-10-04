# S14 Request-balance dialog

- Stitch project: `projects/15605789258921234837`
- Screen id: **none (hand-built)**. Stitch generation timed out (one attempt, not retried; screen not locatable).
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`)
- Status: **approved by the user, 2026-10-04** (including the proposed copy)

## Checked

- [x] Dialog 480px, radius 24px, backdrop `rgba(15,23,42,.45)`, over the new-chat screen
- [x] Close button (44px) top-left + secondary «إغلاق»; `role="dialog"`, `aria-labelledby`
- [x] Explains the team adds balance; channels are bracketed placeholders: [البريد الإلكتروني], [رقم الهاتف], [رقم واتساب]
- [x] No prices, plan names, payment or checkout

## Proposed copy

Title «طلب رصيد» · «تتم إضافة الرصيد وتفعيل الباقات من فريقنا. تواصل معنا بإحدى الطرق التالية وسنساعدك.» · rows «البريد الإلكتروني» / «الهاتف» / «واتساب» · «إغلاق».

## Implementation notes

- Channels come from brand config; render only those configured (mailto:, tel:, wa.me links, new tab with `rel="noopener noreferrer"`).
- Opens from: notice buttons (no alternative, no plan), balance page later. Esc/backdrop close; focus returns to the trigger. Draft in the composer is untouched.
- Values are `dir="ltr"`.
