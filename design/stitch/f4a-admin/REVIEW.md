# F4a admin (A1, A2, dialogs)

- Status: **approved by the user, 2026-10-04** (including the proposed copy)
- Source: hand-built HTML (no Stitch screen id). Design system: Bayan v2 tokens as CSS variables. Regenerate with `node build.mjs`; PNGs rendered with Edge headless.
- Files: `users`, `user-detail` (Balance tab), `user-tabs` (Overview + Subscription cards), `dialogs` (4 dialogs).

## Checklist
- Sidebar first in DOM (renders right), logical CSS only, no letter-spacing/italics, IBM Plex Sans Arabic, Western digits.
- Money in `<bdi dir="ltr">`, emails/ids/references in LTR spans. Status badges have icon + text. No payments, no model/provider names.
- Prev/next and breadcrumb chevrons mirrored for RTL.

## Implementation notes
- Use `<Money>` for all amounts; ledger sign comes from the decimal string (no number math). Amount input is a text field validated as a decimal string (`-?\d+(\.\d{1,9})?`).
- `ReasonDialog` carries `idempotencyKey` (UUID at open, reused on retry); payments are keyed by payment reference.
- Dialog errors: field error under the field (VALIDATION details), API-error alert from `t('errors:CODE')`.
- Row menu opens toward the table interior; reasons are required on all four dialogs.

## New copy
المستخدمون، الباقات، المزوّدون، النماذج، الأوضاع، الإعدادات، العودة إلى التطبيق، لوحة الإدارة، ابحث بالبريد الإلكتروني أو الاسم، الحالة/الصلاحية: الكل، نشط/موقوف/محذوف، مسؤول، فتح، تفعيل باقة، إضافة رصيد، البريد مؤكد، المتاح للإنفاق، الرصيد الكلي، محجوز لردود جارية، سجل العمليات، تحميل المزيد، إضافة أو خصم رصيد، تسجيل دفعة، مرجع الدفعة، السبب، يُسجَّل في سجل التدقيق، شهر واحد افتراضيًا، استخدم - للخصم، سينتهي كل رصيد المستخدم فورًا، إيقاف الحساب، إعادة التفعيل، منح صلاحية مسؤول، إزالة الصلاحية، إنهاء الباقة، سجل الاشتراكات, النظام / مسؤول: <email>.

## Open questions
1. "محجوز لردود جارية" label for reserved balance: OK?
2. Ledger type labels beyond the user-facing set (تسجيل دفعة, تعديل يدوي) need final names.
3. Subscription history "status" column assumes derivable from end date; confirm API fields.
4. Sub-pages for loading/empty states and the suspended variant (Reactivate shown instead of Suspend) are described in cards, not drawn.
5. Tablet layout (rail) not drawn.
