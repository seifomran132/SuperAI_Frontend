# F14 + F15 — Design cost, creation, edits, gallery and export (stages 3–4)

**Status:** plan approved 2026-11-11; designs S27–S29 approved 2026-11-11 (answers in their REVIEW.md). Building.
**Briefs:** [F14_DESIGN_COST_BRIEF.md](F14_DESIGN_COST_BRIEF.md), [F15_DESIGN_CREATION_BRIEF.md](F15_DESIGN_CREATION_BRIEF.md). **Binding contract:** `../SuperAI_Backend/docs/API_CONTRACT.md` §11.1–11.4.
**Backend:** branch `p3-stage3-agent-runs` (stage 3 `7c45f8f`, stage 4 `ba55402`, `eb92107`, `9518db7`); its `main` is still at stage 2. Migrations `AgentRuns`, `DesignCreation`, `DesignEdits`. F13–F15 deploy only after that branch is merged and migrated on production.

## 0. Contract sync

Done 2026-11-11 against backend `9518db7` (branch `p3-stage3-agent-runs`). Additive: `/me/designs`, `/me/designs/{id}/export`, `/admin/agent-runs` (list and detail), designs in usage and overview, agent instructions, 4 new error codes (plus 11 agent and brand-kit texts the catalogue was missing). Breaking: the `design_saved` step is gone; its F13 chip branch and test were removed (results replace it in this build). `progress`, `results` and `choices.multiple` are not in OpenAPI (the `ui` payload is untyped) and are typed by hand from §11.1.

## 1. F14: what is already done

Built with F13 (2026-11-10): balance notes on the request summary (never prices, user decision), the agent label on design charges in balance activity, admin models, variants, margin and readiness. **Left:** a design charge links to its conversation, as the brief asks.

## 2. F15: what we build

1. **Creating designs (chat).** «يبدو جيدًا» on the request summary becomes «أنشئ التصاميم»; when the balance covers fewer (`fitsVariants` < `variants`, > 0) the button makes that many (`{ action: 'confirm', variants: N }`). Then:
   - `progress`: the dock shows «جارٍ التصميم… 1 من 2» and the conversation's messages are polled every 2 s until `results` arrives; no input meanwhile. Leaving and coming back resumes polling.
   - `results`: the designs as a grid inside the agent message (blob URLs from `GET /attachments/{id}`), «v2» for later versions, «تحقّق من النص» when `needsReview`; per design «تعديل» and «تنزيل». The dock offers «تصميم جديد», «علامة أخرى», or «حاول مرة أخرى» when nothing came out.
   - Errors at confirm: `AGENT_NOT_READY` (notice, can't make designs now), `INSUFFICIENT_BALANCE` (balance note from `data.fitsVariants`, no prices), `DESIGN_IN_PROGRESS` (reload and keep polling).
2. **Editing a delivered design:** «تعديل» → `design_edit` (text) → `edit_summary` («عدّله» / «إلغاء») → progress → results with the next version.
3. **Editing an uploaded design:** the «تعديل تصميم موجود» choice → `edit_upload` (one `design` file) → `edit_changes` (**multi-select** chips plus text) → `edit_product` / `edit_text` when chosen → `edit_summary` → results.
4. **«تصاميمي» gallery** `/designs`: every delivered design, newest first, filter by brand, link back to its conversation, download.
5. **Download menu:** PNG (default) / JPG / WebP; «الحجم الأصلي» / «مقاس منصات التواصل»; fetched as a blob with the bearer token, saved under the server's filename.
6. **«استهلاكي»:** a «التصاميم» line by agent (runs, designs, charged).
7. **Admin:** overview and user usage get a designs block (runs, designs, flagged, charged, provider cost, margin, absorbed) and «للمراجعة» → a runs page `/admin/agent-runs` (filter by user and status) with a run detail (each model call: model, status, usage, cost, charge, error); the agent dialog gets `promptInstructions` and `checkInstructions` (≤4000, empty = default).

## 3. Decisions (approved 2026-11-11)

1. **No prices, still** (decided 2026-11-10): the request and edit summaries show balance notes only; «أنشئ تصميمًا واحدًا» when the balance covers fewer.
2. **Where results live:** in the agent message (they stay in the history); the dock holds only the next-step buttons.
3. **«تعديل» on older results:** shown on every design, but enabled only while the conversation is at its results step; otherwise it explains «أكمل الخطوة الحالية أولًا». (The API refuses a step that isn't current.)
4. **Polling:** every 2 s while the newest agent message is `progress` and the page is visible; paused when the tab is hidden, resumed on return. No timeout on our side (the server ends stuck runs within 30 minutes).
5. **Gallery entry:** «تصاميمي» next to «علاماتي التجارية» in the sidebar and account menu, shown under the same condition (the plan offers the graphic designer).
6. **Download:** a small menu on each design (type + size, PNG and original selected); one click on «تنزيل» downloads with those choices.
7. **Admin runs page:** list and detail only, linked from the overview's «للمراجعة» and from a user's usage; no actions on runs.
8. **Instructions:** two text areas in the agent dialog, collapsed under «تعليمات متقدمة», with «استعادة الافتراضي».

## 4. Designs

- **S27 — Designs in the chat:** create button (and «أنشئ تصميمًا واحدًا»), progress, results grid (versions, review note, edit/download), download menu, «حاول مرة أخرى», edit flows (`design_edit`, `edit_summary`, upload a design, multi-select changes), the errors; desktop and phone.
- **S28 — «تصاميمي»:** gallery, brand filter, empty/loading/error, download; the «التصاميم» line on «استهلاكي».
- **S29 — Admin design reports:** designs block on the overview and user usage, runs list and detail, instructions in the agent dialog.

## 5. Tests

Unit: polling start/stop, results rendering and versions, confirm with fewer variants, multi-select answer shape, edit from results, download (format/size, filename, error), gallery states and filter, usage designs line, admin runs list/detail and instructions. Playwright on the local stack once the backend's stage 4 migrations run: the AG cases from F13 plus create → results → download, edit a delivered design, edit an uploaded design, gallery.

## 6. Order of work

1. Contract sync (running).
2. User approves §3.
3. Designs S27–S29 with `stitch-designer`; the user approves.
4. Build, tests, review, browser check.
5. Merge after the backend's stage 3–4 branch is on `main` and migrated on production.

## 7. Build notes (2026-11-11)

- **Chat:** `progress` and `results` inputs, `choices.multiple`; the request summary creates («أنشئ التصاميم», or as many as the balance covers with `variants`), the edit summary has «عدّله» / «إلغاء». `useDesignPolling` re-reads the messages every 2 s while the newest agent message is `progress` and the tab is visible. Results render in the agent message (lazy `AgentResults`) with «تعديل» (enabled only at the results step) and «تنزيل». `ChatPage` owns the answer state so the dock and the results share it. New errors: `AGENT_NOT_READY`, `INSUFFICIENT_BALANCE` (balance note, no price), `DESIGN_IN_PROGRESS` (reload).
- **Feature `designs`:** «تصاميمي» at `/designs`, `DesignCard`, `DesignPreview`, `DesignDownload` (one-click download, arrow for options, a sheet on phones), export via `GET /me/designs/{id}/export`. Download helpers moved to `src/lib/download.ts`; the chat's image viewer is exported from `~/features/chat/ui`.
- **«استهلاكي»:** «التصاميم» section; the empty card only when there are neither messages nor designs.
- **Balance activity:** a charge links to its conversation (F14).
- **Admin:** designs block on the overview and user usage, «تشغيلات تصميم للمراجعة» → `/admin/agent-runs` (opens on «تحتاج مراجعة», like requests) and `/admin/agent-runs/$runId`; agent dialog «تعليمات متقدمة» with restore default, «مخصّصة» in the list.
- **Tests:** all 765 unit tests pass (21 new for F15). Playwright against the local stack (backend `9518db7`): AG-01 to AG-06 and DS-07, DS-09, DS-10 pass on Chromium, Firefox, WebKit and both phones; BK-01 to BK-08 on Chromium. DS-01 to DS-06 stay manual: making a design needs priced image models, which the local stack lacks (AG-01 checks the create step answers «لا يمكن إنشاء التصاميم الآن» or starts).
