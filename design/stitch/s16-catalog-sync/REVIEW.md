# S16 catalog sync (admin model discovery and price updates)

- Status: **approved by the user, 2026-10-15** (including the proposed copy, with the decisions below)
- Source: hand-built HTML (no Stitch screen id; Stitch MCP not used). Design system: Bayan v2 tokens as CSS variables, `base.mjs` is a verbatim copy of the head, tokens, icons and helpers of `../f4a-admin/build.mjs`. Regenerate with `node build.mjs && node render.mjs` (PNGs via Playwright + Chrome, 1280 px; boards at 1440 px; mobile 375 px).
- Spec: `docs/plans/F7_CATALOG_SYNC.md` §3.

## Files
| Frame | File |
|---|---|
| 1. Sidebar: badge 3, hidden at 0, `100+` fallback | `sidebar` |
| 2. Add model step 1 (picker) | `picker`, states in `picker-states` (loading, no key, invalid key, unreachable + retry, catalog unavailable, empty) |
| 3. Add model step 2 (prefilled form) | `model-form` |
| 4. Price updates page | `price-updates` (open tab: 3 kinds); `price-updates-states` (running, stale, applied tab with closed card, retired with no modes, empty per tab, loading/error) |
| 5. Sync summary card | `sync-summary` (normal, catalog unreachable) |
| 6. Dialogs | `dialogs` (apply, dismiss price kind, dismiss retired, run now, `CATALOG_FINDING_OUTDATED`) |
| Mobile 375 px | `mobile` |

Each has `.html` and `.png`.

## Checklist
- Sidebar first in DOM (renders on the right); `<aside>` before `<main>`. Logical CSS only (no `ml-/mr-/left/right`, no letter-spacing, no italics): grep-verified.
- IBM Plex Sans Arabic, Western digits. Prices as `2.50$` in `<bdi dir="ltr">`; ids in `.ltr` (isolate); `+62.50%` chip is `direction:ltr`. Change % is shown as given: no arithmetic anywhere. Null prices show `—`.
- Status by icon + text (badges, alerts). Danger tone only for retired models and errors. Token colors only (same palette as f4a; the board background `#CBD5E1` is the f4a dialogs backdrop, not UI).
- 44 px controls (buttons, inputs, nav, chips are 36 px, same as f4a `.btn.sm`; open question 6). Visible focus: ring drawn on the picker search field (`outline 2px brand`); use the global `:focus-visible` token ring.
- Provider names and model ids appear (admin-only, allowed). No payments, no export, no attachments.
- Annotations (dashed indigo boxes) are design notes, not product UI.

## Accessible names
- Sidebar item with count: `aria-label="تحديثات الأسعار، 3 بانتظار المراجعة"` (count N in words; `100+` becomes «أكثر من 100»). The visible number chip is `aria-hidden`. At 0 the label is just the text.
- Filter chip group `aria-label="نوع التحديث"`; sync summary `aria-label="نتيجة المزامنة"`; running button `aria-disabled` + `aria-busy`.

## Implementation notes
- Reuse `Section`, `ReasonDialog` (reason required, kept on recoverable errors, idempotency key per open), `Badge`, `ChatNotice` warning style, `<Money kind="exact">` for every price (no rounding: 4.0625$ is exact).
- Price rate block (`.rate`): 4 blocks in a row on desktop, 1 column on mobile; each has «الحالي» and «المقترح» lines, so it stacks without changing markup.
- Picker rows: selectable row is a button/link; the added row is `aria-disabled` with a «مضاف» badge and a link to the model.
- Step 2 submit opens one ReasonDialog (single create with optional `price`).
- Tab and kind chips are search params; counts from `status.openByKind` only on the open tab.
- Model form «الكتالوج» section is drawn with only the tier warning; the future «مزامنة السعر مع الكتالوج» switch goes in the same section (annotated, not drawn as a control).

## New copy (Arabic / English) — "proposed" = invented here
Sidebar and page: تحديثات الأسعار / Price updates (plan); تشغيل المزامنة الآن / Run sync now (plan); جارٍ التحقق… / Checking… (plan); آخر مزامنة / Last sync (plan); التشغيل: تلقائي / Trigger: scheduled (proposed; admin variant «بطلب من مسؤول», proposed); المزامنة القادمة / Next sync (proposed); لم تتم المزامنة منذ مدة؛ تحقّق من مهمة المزامنة (plan); تتم المزامنة كل 6 ساعات… (plan).
Tabs (proposed): بانتظار المراجعة / Awaiting review (was مفتوحة); مطبّقة / Applied; متجاهلة / Dismissed; لم تعد سارية / No longer valid (was ملغاة بالمزامنة).
Kinds (proposed): الكل، تغيير كبير / Large change، سعر مفقود / Missing price، نموذج متوقف / Retired model. Plan copy: لا يوجد سعر في الكتالوج، لم يعد المزود يقدّم هذا النموذج، لا تستخدمه أوضاع مفعّلة.
Cards (proposed): أول رصد / First seen; آخر رصد / Last seen; الحالي / Current; المقترح / Proposed; الإدخال، الإخراج، الإدخال المخزّن، كتابة الذاكرة المؤقتة / input, output, cached input, cache write; عرض النموذج / View model; أوضاع مفعّلة تستخدمه / Enabled modes using it; طُبِّق السعر بواسطة … / Price applied by …; السبب: … / Reason; لا يعرض… نص: السعر الحالي: … لن يتغيّر السعر تلقائيًا / Price won't change automatically; قد تفشل الردود عليه… المزامنة لا توقف النماذج ولا الأوضاع؛ هذا قرار يتخذه المسؤول.
Actions (plan): تطبيق السعر / Apply the price; تجاهل / Dismiss; تحميل المزيد / Load more.
Empty (proposed except first): لا توجد تحديثات بانتظار المراجعة (plan) + ستظهر هنا…; لا توجد تحديثات مطبّقة / متجاهلة / لم تعد سارية. Errors (proposed): تعذّر تحميل التحديثات / Couldn't load updates; إعادة المحاولة / Retry.
Summary (all labels proposed, to match DTO fields): نتيجة المزامنة / Sync result; تم فحصه / Checked; طُبّق تلقائيًا / Applied automatically; دون تغيير / Unchanged; بانتظار المراجعة / Held for review; بلا سعر في الكتالوج / No catalog price; غير موجود في الكتالوج / Not in catalog; تخطّي / Skipped; فشل / Failed; مزوّدون تم فحصهم / Providers checked; تعذّر الوصول إلى مزوّدين / Providers unreachable; تم تجاهله / Ignored; نماذج متوقفة عند المزود / Retired models; منها N مستخدم في أوضاع مفعّلة / of which N used by enabled modes; تعذّر الوصول إلى الكتالوج (title, proposed) + لم تتغيّر أي أسعار (plan).
Picker (plan unless noted): مضاف، متوقف من المزود، سعر متدرّج، يقرأ الصور، إدخال يدوي، أضف مفتاح الواجهة البرمجية أولًا, تعذّر الوصول إلى الكتالوج العام؛ أدخل البيانات والأسعار يدويًا. Proposed: اختيار النموذج / البيانات والسعر (steps); المزود، بحث، ابحث بالمعرّف أو الاسم؛ معرّف النموذج عند المزود، نافذة السياق، أقصى إخراج، سعر الإدخال/الإخراج لكل مليون رمز، ملاحظات; الانتقال إلى المزوّدين؛ مفتاح الواجهة البرمجية مرفوض (+ استبدال المفتاح); تعذّر الوصول إلى المزود (+ إعادة المحاولة); لا توجد نماذج مطابقة…; جارٍ جلب النماذج المتاحة…
Form (plan: من الكتالوج, تغيير, both warnings): النموذج، المزود، المعرّف عند المزود، الاسم المعروض، نافذة السياق، أقصى رموز الإخراج، يقرأ الصور (proposed labels, reuse existing ModelForm labels); السعر الأولي، سعر الإدخال، سعر الإخراج، سعر الإدخال المخزّن مؤقتًا، سعر كتابة الذاكرة المؤقتة، اختياري، «بالدولار لكل مليون رمز. يمكن ترك الحقول فارغة وتحديد السعر لاحقًا.» (proposed); الكتالوج; إضافة النموذج.
Dialogs: لن يُعرض هذا الاقتراح مرة أخرى (plan); يخفي التجاهل هذا التنبيه نهائيًا… (plan); proposed: تطبيق السعر body «يصبح السعر المقترح هو السعر الحالي للنموذج من الآن، ولا يغيّر تكلفة الرسائل السابقة.»; تجاهل التحديث; تجاهل تنبيه النموذج المتوقف; تجاهل دائم; تجاهل نهائيًا; تشغيل المزامنة body «يتحقق من الكتالوج العام وقوائم المزودين. قد يستغرق أكثر من 30 ثانية…»; OUTDATED: هذا الاقتراح لم يعد مطابقًا للكتالوج / تغيّر السعر منذ رصده. شغّل المزامنة للحصول على اقتراح محدّث. (proposed; final text should come from `errors:CATALOG_FINDING_OUTDATED`).

## States still to design / not drawn
- Toasts after apply/dismiss/run; 409-already-running simply switches to the running state (no new frame).
- `PROVIDER_NOT_FOUND`, `PROVIDER_KEY_NOT_USED` fallbacks, `NOT_OPEN`/`NOT_FOUND` toast copy.
- Provider list row «إضافة نموذج» button on `/admin/providers` (plan §8.2).
- Mobile drawer navigation, mobile picker table, and mobile form (only the findings list is drawn).
- Model page notice «أُنشئ النموذج لكن لم يُحفظ السعر» (only if API item 4 slips).

## Decisions (approved 2026-10-15)
1. Tabs: «بانتظار المراجعة / مطبّقة / متجاهلة / لم تعد سارية» (open / applied / dismissed / superseded).
2. Summary labels are matched to the `CatalogSyncSummaryDto` field names when building. Small counts at zero are hidden; the headline counts (checked, applied, unchanged, held, no catalog price, not in catalog) always show.
3. The sidebar badge is amber (warn), not danger.
4. Apply: the new price takes effect now and earlier messages keep the price they were charged at (backend: new price row with `effectiveFrom: now`; charges use the price snapshot). The dialog copy stands.
5. The retired card links to the model and to the modes using it. There is no disable button there; disabling happens on the model page.
6. Filter chips and «تحميل المزيد» are 44 px high (touch-target rule), not 36 px.
7. The «مضاف» row keeps the extra «عرض النموذج» link.

## Build notes from the review
- On mobile the kind chips go in a horizontal scroller inside the page, or wrap. The page itself never scrolls sideways (the board clips the last chip).
- The picker lists every model the provider returns, including non-chat ones such as embeddings, shown as is. The backend may filter them later.
- The admin header's «بيان» / `admin@bayan.com` is sample content from f4a; the app uses the brand config.
