# S29 Admin design reports (desktop board + mobile 375px)

- Stitch project: `projects/15605789258921234837`
- Screen ids: **none (hand-built)**. Same method as S22/S23/S26: Stitch makes one screen per prompt and cannot keep the admin shell, tables, dialog and sheet patterns identical across 50+ frames, so no `generate_screen_from_text` call was made.
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`). Shell, table, badge, filter, dialog and sheet patterns are copied from S26's `build.mjs` (which copies S22/S23); KPI cards, attention cards and the usage block follow S18/S19.
- Status: **approved 2026-11-11**
- Files: `desktop.html` / `desktop.png` (1480px board, 29 frames), `mobile.html` / `mobile.png` (26 frames at 375px). `node build.mjs && node render.mjs` (Playwright, Chrome; the render checks that no frame overflows horizontally: pass). Board titles and dashed notes are annotations, not UI. Sample data is fictional. Model names (GPT-4.1 mini, GPT Image 1, GPT-4o mini) are samples; admins may see them.
- Plan: F15 §2 item 7, §3 decisions 7 and 8; brief §5. Contract: API_CONTRACT §11.3 (admin instructions), §11.4 (reports, `GET /admin/agent-runs`, `GET /admin/agent-runs/{id}`), `AdminAgentRunDto`, `AgentRunStepDto`, `AdminAgentDto` in `openapi.json`.

## Frames

Desktop
- 1a overview: new «تشغيلات تصميم للمراجعة» attention card (`designRunsToReview`, link to `/admin/agent-runs?status=reconciliation_required`) beside «طلبات مُعلَّمة» and «تحديثات أسعار»; row with two cards: «المحادثات» (the 4 money figures) and «التصاميم» (runs, designs, runs to review; charged, provider cost, margin, absorbed; link «عرض التشغيلات»). 1b no runs (zero attention card without link, zeros + sentence). 1c negative designs margin (danger + icon + text, U+2212).
- 2a user usage tab: the same «التصاميم» block with «عرض تشغيلات هذا المستخدم» (`?userId=`). 2b user with no designs.
- 3a runs list (filters, table, «تحميل المزيد»), 3b filtered to «تحتاج مراجعة», 3c filtered by user (from the usage link), 3d invalid user id, 3e loading more, 3f load-more error (rows kept), 3g loading, 3h empty (no runs yet), 3i empty with filter, 3j error + retry.
- 4a run detail done (7 steps, one image regenerated), 4b needs review (estimated usage, absorbed), 4c failed (two `failed` steps with error code + Arabic text), 4d running (check step in progress, «تحديث»), 4e loading, 4f `AGENT_RUN_NOT_FOUND`, 4g error.
- 5a agents list with new «التعليمات» column («مخصّصة» or «—»), 5b default. 5c dialog with «تعليمات متقدمة» collapsed (default, chip «الافتراضية»), 5d expanded with both defaults, 5e expanded with custom text (English prompt LTR, Arabic checker RTL), 5f after «استعادة الافتراضي» (pending, with «تراجع عن الاستعادة»), 5g over 4000 chars.

Phone: م1a/م1b overview, م2a/م2b user usage, م3a runs cards, م3b/م3c filtered, م3d loading, م3e empty, م3f empty with filter, م3g error, م4a-م4h run detail (top = banner, money tiles, facts; then step cards) for done, needs review, failed, running; م5a list card with «مخصّصة»; م5b-م5g bottom sheet sections (collapsed, defaults, custom top and bottom, restore pending, over limit).

## Checked against DESIGN.md

- [x] RTL; `<aside>` first in the flex row (renders on the right); logical CSS only (grep: no left/right/margin-left/padding-right/italic/letter-spacing)
- [x] IBM Plex Sans Arabic; Western digits; money in `<bdi dir="ltr">`, `0.2541$` style
- [x] Run and step amounts use the `<Money kind="cost">` rule (4 decimals below 1$, 2 from 1$); block totals use the normal rule (2 decimals)
- [x] Ids, error codes (`PROVIDER_TIMEOUT`), model names and provider codes, emails, dates are LTR-isolated; code in Plex Mono (code only)
- [x] Every status has icon + text: جارٍ (indigo), تمّ (green), فشل (danger), تحتاج مراجعة (amber); step statuses likewise; «تقديري» badge as in S19
- [x] Instruction text areas use `dir="auto"` (English prompt LTR, Arabic checker RTL), counter in `<bdi dir="ltr">` with `aria-live`, over-limit shown by danger border + icon + text
- [x] Interactive borders `#7C8799`; `#94A3B8` appears only as the board frame border, never as text
- [x] Read-only runs pages (decision 7): no actions; no payments, attachments, templates, export, encryption claims
- [x] 44px targets (buttons, filter fields, restore button, accordion row, copy buttons are 36px: see note)
- Not checked: real focus rings, keyboard order, long-email overflow in the cards.

## Copy (new, proposed; admin text)

التصاميم · المحادثات · تشغيلات تصميم للمراجعة · «تحتاج مطابقة تكلفة خطواتها مع المزوّد. العدد الحالي لكل الفترات.» · لا توجد تشغيلات تصميم للمراجعة · عرض التشغيلات · عرض تشغيلات هذا المستخدم · تشغيلات المساعدين · statuses جارٍ / تمّ / فشل / تحتاج مراجعة · النوع (إنشاء / تعديل) · خطوات التشغيل: كتابة الوصف، إنشاء الصورة، فحص الصورة · محاولة أخرى · المحجوز / المحتسب / المُمتَص · تفاصيل الطلب · تحميل المزيد · تعذّر تحميل المزيد · «لا توجد تشغيلات بعد» · AGENT_RUN_NOT_FOUND uses the catalog text · تعليمات متقدمة · تعليمات كتابة الوصف · تعليمات الفحص · استعادة الافتراضي · تراجع عن الاستعادة · «سيُستعاد الافتراضي عند الحفظ.» · «لا تغيّر صيغة الرد: يجب أن يظل الفاحص يردّ بصيغة JSON التي يقرؤها المساعد. إذا غيّرتها فقد يتعطل فحص الصور.» · «الحد الأقصى 4000 حرف. أزل N حرفًا.» · «مخصّصة».

## Implementation notes

- Overview and user usage read `designs` (`runs`, `designs`, `flaggedRuns`, `chargedUsd`, `providerCostUsd`, `marginUsd`, `absorbedUsd`) and `designRunsToReview`. The tile shows `designs.flaggedRuns` (period) in the block and `designRunsToReview` (now, any period) in the attention card; the card says it counts all periods, as S18 does for chat requests.
- Runs list: `GET /admin/agent-runs?userId&status&cursor&limit`; filters live in the URL. Status mapping: `reserved` → جارٍ, `settled` → تمّ, `released` → فشل, `reconciliation_required` → تحتاج مراجعة. `chargedUsd`/`providerCostUsd` are null while running (shown «—»). «التصاميم» = `designs` of `variants`. «النوع» = `kind` + `variants`.
- Run detail: `GET /admin/agent-runs/{id}`; margin is computed with decimal.js (`chargedUsd` − `providerCostUsd`), never floats. «محاولة أخرى» is derived in the UI: an `image` step for a `variant` that already has an earlier `image` step. Duration = `finishedAt` − `startedAt`. «تقديري» when `usageSource` is `estimated`.
- Agent dialog: `promptInstructions` / `checkInstructions`, ≤4000, `null` restores the default, so «استعادة الافتراضي» sends `null` on save (nothing is sent until save). A field with empty text also saves as `null`. The list shows «مخصّصة» when either is non-null.
- Accordion is a real disclosure (`button` with `aria-expanded`, `aria-controls`); collapsed by default; opens automatically on a validation error inside it.
- Text goes to `src/i18n/admin.{ar,en}.json`.

## Deviations and open questions

1. **No brand/format in the list.** `AdminAgentRunDto` has no brand or format (only `kind`, `variants`, `designRequestId`), so the table shows «النوع» (إنشاء/تعديل + number of designs) instead. Adding `brandKitName` and `format` to the DTO would restore the column the brief asked for.
2. **No request summary and no conversation link in the detail.** The DTO gives `conversationId` and `designRequestId` only, so the header shows the short ids with copy buttons, not a summary or a link (there is no admin conversation page). Confirm, or add summary fields.
3. **«fix» step kind.** The API step kinds are `prompt`, `image`, `check` only; a fix is a second `image` step for the same variant, shown as «محاولة أخرى».
4. **Flagged designs.** The run DTO has no per-design `needsReview`, so flagging is per run (`reconciliation_required`) and per step (failed, estimated). Confirm that is enough.
5. **«فشل» for `released`.** `released` also covers runs that ended without charge for other reasons; the label may need «لم يكتمل». Confirm wording.
6. **Chat figures exclude designs** (assumed from «reported apart from chat»); the card says so. Confirm the overview chat totals really exclude design runs.
7. **Navigation.** Decision 7 links the runs page only from «للمراجعة» and the user usage. No new sidebar item was added; the page highlights «المساعدون» as its parent. Say if you want a nav entry or a link from the agents page.
8. **Default instruction text** is not shown (the API returns `null` for the default). The field shows a placeholder only. If admins should see the built-in text, the API must return it.
9. User filter takes a UUID (API takes `userId`); the email shown when arriving from a user page needs one user lookup. A search-by-email box would need a backend change.
10. Run/step amounts show 4 decimals below 1$ (`<Money kind="cost">`), e.g. `0.0000$` for a zero absorbed amount.
11. Copy buttons for ids are 36px (secondary action); the rest meet 44px.

## Approval (user, 2026-11-11)

Approved with these answers: «تنزيل» downloads with the chosen type and size in one click and a small arrow opens the options (on phones a sheet), as S28 draws it; results on phones in one column; clicking a design in the gallery opens the full-screen image viewer, and a design whose brand was deleted shows «علامة محذوفة»; the usage column is «مرات التصميم», no total row while there is one agent; admin runs show `released` as «لم يكتمل», no sidebar item (reached from the overview and user usage). Backend gaps noted: runs carry no brand, format or conversation link, and no per-design review flag.
