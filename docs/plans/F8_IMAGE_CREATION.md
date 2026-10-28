# F8 — Image creation (image modes)

**Status:** Plan, 2026-10-27. Design S17 **approved** 2026-10-27. Slice 0 done 2026-10-27; slice 1 done 2026-10-28 (verified end to end locally with the mock provider); slice 2 done 2026-10-28; slice 3 done 2026-10-28. **F8 frontend complete, not committed.**
**Brief:** [F8_IMAGE_CREATION_BRIEF.md](F8_IMAGE_CREATION_BRIEF.md). **Binding contract:** `../SuperAI_Backend/docs/API_CONTRACT.md` §9 (and §6 for the stream).
**Backend state:** built and tested in the backend working tree, not committed or deployed. The first slice runs against it locally.
**Builds on:** F6 image input (upload, `blob:` loading, `MessageImage`, `ImageViewer`), F7 catalog sync (model prefill).
**Goal of slice 1:** create an image locally end to end with the free `mock` provider: pick an image mode → describe → see a placeholder → see the image → open full size → download → reload and still see it.

## 1. Contract sync (done 2026-10-27, not committed)

`npm run api:sync` against the backend working tree. Result:

| Item | Generated as | Note |
|---|---|---|
| Image mode flag | `ModeDto.generatesImages: boolean` | Image modes also have `supportsImages: true`. |
| Aspect ratio | `ImageOptionsDto` is **not generated** | The chat send is excluded from generation; hand-write `imageOptions?: { aspectRatio?: '1:1' \| '3:4' \| '4:3' \| '9:16' \| '16:9' }` in `src/platform/stream` next to the other send types. |
| Created images | `MessageDto.attachments: AttachmentDto[]` (`{ id, mimeType, width, height }`) | Now filled for assistant messages too. |
| Download | `attachmentsDownload` query `download?: '1'` | `?download=1` → `Content-Disposition: attachment; filename="lam7a-<id>.webp"`. |
| Admin model toggle | `ModelDto.generatesImages` (required); `Create/UpdateModelDto.generatesImages?` | |
| Mode not ready | `AdminModeDto.notReadyReason` adds `IMAGE_GENERATION_UNSUPPORTED` | |
| Model test | `ModelTestResultDto.imageCreated: { mediaType, bytes, base64 } \| null` | |
| Discovery prefill | `CatalogSuggestionDto.generatesImages: boolean \| null` | |
| SSE `image` event | Not in OpenAPI (API_CONTRACT §6 table, §9.3) | `{ attachment: { id, mimeType, width, height } }`, at most once, after the text deltas, before `done`/`error`; already stored; repeated in the final `message.attachments`. |
| Error codes | No new codes | `CONTENT_BLOCKED`, `PROVIDER_ERROR`, `MODE_NO_IMAGE_SUPPORT` already exist. |

**Typecheck after the sync: 12 errors.**
- 8 come from the new required response fields in mock fixtures (`src/mocks/chat/fixtures.ts`, `src/mocks/admin-catalog.ts`, `prefill.test.ts`). Fix them by adding the fields in slice 0.
- 4 come from **unrelated backend changes in the same working tree** (§8, questions 1–2). They block committing the sync until answered.

Tests after the sync: 458 pass, 2 fail.
- `PlanDefaultBalance.test.tsx` fails because of the removed error code.
- `ModelPicker.test.tsx` "loading state" times out at 5 s. It looks unrelated; check it in slice 0.

## 2. Decisions

| # | Decision | Why |
|---|---|---|
| 1 | Image modes are marked in the mode picker with an image icon and the label «صورة», next to the existing «يقرأ الصور» badge. | Users choose a mode by what it does; no model names. |
| 2 | The aspect-ratio chooser appears **only in an image mode**, as a compact menu in the composer toolbar: «تلقائي» (default, sends nothing), «مربع 1:1», «عمودي 3:4», «أفقي 4:3», «طولي 9:16», «عريض 16:9». It is kept per conversation, like the selected mode. | Optional by contract; "automatic" lets the model follow an attached image. |
| 3 | **No price per image for users.** Per-answer cost is hidden since 2026-10-15; users only see their balance. The backend's optional per-image estimate is **not needed** now. | Matches the launch scope. |
| 4 | Admins keep per-1M-token prices. The model form shows a hint for image models: the output price is the image rate, so it looks high, and roughly one image ≈ the brief's per-image cost. | No new API field. |
| 5 | Created images render in the assistant card: a placeholder at the announced aspect ratio while loading, then the image (max width of the message column), with **open full size** (the F6 `ImageViewer`) and **download** (`?download=1`). | Reuses F6; the placeholder avoids layout jumps because the `image` event carries width and height. |
| 6 | A created image **cannot** be attached (`404 ATTACHMENT_NOT_FOUND`). There is no "edit" or "reuse" button on created images in v1; the empty-state hint says to describe the change in the same conversation. Reuse in another conversation means download, then upload. | Avoids a dead button. |
| 7 | Stop after the image keeps the image, and the answer shows the usual "cut" note. | Contract: `done` with `status: partial`. |
| 8 | Downloads use the API with the bearer token: fetch `?download=1` as a blob, then save with a temporary `<a download>`. A plain link can't carry the token. | Same rule as F6: images are never public. |
| 10 | Add **`mode-3` and `mode-4`** colour tokens (app.css + DESIGN.md). Mode colours stay by position; an image mode is marked by its icon and «صورة», not by a colour. | Approved with S17; any third mode needs a colour. |
| 9 | Empty state in an image mode: the headline «صِف الصورة التي تريدها» and image-oriented suggestion chips (e.g. «شعار بسيط لمقهى», «منظر غروب على البحر»); the hint «أرفق صورة لتعديلها». | Image modes need different prompts. |

## 3. Slices

### Slice 0 — sync clean-up ✅ done 2026-10-27
Synced against backend `2d8a45e` (image creation committed). The free trial is gone (`source: trial` removed, no starting credit) and the default-plan balance cap is dropped: removed the trial label (account), the trial hints and the cap error handling (admin plan form), their tests and copy. Added the new fields to the mocks. `ModelPicker` "loading state" was a race (the mock answered before the test looked): the mock now has `availableDelayMs`. Typecheck, lint, 457 tests, build and size pass.

- Add `generatesImages` / `imageCreated` to the mock fixtures and test data.
- Resolve the unrelated breaking changes once the backend answers §8 questions 1–2 (remove the `trial` case in `PlanCard` and the mock, and drop or replace the default-plan cap error UI in `PlanForm`).
- Check the `ModelPicker` loading test (it times out at 5 s).
- Commit the regenerated files together with these fixes, so `main` always typechecks.

### Slice 1 — chat, local end to end with the `mock` provider ✅ done 2026-10-28
Verified against the backend working tree with a mock image mode («تصميم»): image empty state → 16:9 chosen (`imageOptions` sent only then) → streamed answer → created image (`blob:`) → full-size viewer → download (`lam7a-<id>.webp`) → reload keeps the image; 375px: RTL, no horizontal scroll. Created images are capped at ~512px high (`imageBox`), so tall ratios stay on screen. The chosen ratio lives in memory only (back to «تلقائي» after a reload). The "Stop after the image" data test runs in its own file: a request left over from an earlier test in the same file could fail its POST.

Owner: `chat-engineer` (stream and cache) + `ui-builder` (cards, picker, composer). Needs the S17 design approved first (§4).
1. **Stream:**
   - add `image` to `stream-events.ts` (`KNOWN` set and type)
   - in `send-message.ts`, write the attachment into the streaming assistant message in the cache (`attachments: [attachment]`) on `image`; `done`/`error` then replace it with the final message as today
   - send `imageOptions` only when the user picked a ratio
2. **Mode picker:** the image badge (decision 1). `useSelectedMode` exposes `generatesImages`.
3. **Composer:** the aspect-ratio menu in image modes (decision 2), stored in `chat-store` per conversation. The attach button stays: image modes have `supportsImages`.
4. **Assistant card:** render `attachments` with a new `GeneratedImage` component. It wraps `MessageImage`, adding the aspect-ratio placeholder, open full size and download (decisions 5 and 8). It also renders on history reload, from `conversations_messages`.
5. **Behaviour:**
   - **text only** (no `image` event): nothing extra
   - **`CONTENT_BLOCKED`**: the catalog text in the error card
   - **`PROVIDER_ERROR` with a charge**: the existing error card
   - **Stop after the image**: keep it, with the cut note
   - **`INSUFFICIENT_BALANCE`**: unchanged UI; alternatives are already image modes only
6. **Empty state and hints** for image modes (decision 9); «أرفق صورة لتعديلها» shows in every image mode. Arabic first; keep `en.json` in sync.
7. **Tokens:** `mode-3` and `mode-4` (decision 10).

**Done when**, with the mock model locally:
- a prompt shows the placeholder and then the 4×4 red image
- open full size and download both work
- after a reload the image is still there
- Stop, a blocked image and text-only answers render correctly
- RTL holds at 375/768/1280 px

### Slice 2 — admin ✅ done 2026-10-28
Verified locally: «ينشئ الصور» toggle (turns on and locks «يقرأ الصور», image-rate hint, 2,500 minimum checked before saving), model test preview of the created image on the mock model, «ينشئ الصور» badge in the models list (no horizontal scroll at 1280/768), readable `IMAGE_GENERATION_UNSUPPORTED` reason. **Not built:** an image badge in the modes list — `ModeModelSummaryDto` has no `generatesImages` (backend ask in §8).

Original scope:
Owner: `ui-builder`. No new design: it reuses the existing form and test patterns (as in F4b).
1. **Model form:**
   - a `generatesImages` toggle, prefilled from discovery (`catalog.generatesImages`)
   - turning it on also turns on `supportsImages`, with a hint
   - the hint about image output rates (decision 4)
   - `maxOutputTokens` shows the 2,500 minimum when the toggle is on; `400 VALIDATION_FAILED` details highlight the field
2. **Model test:** when `imageCreated` is present, show a preview (`data:` URL from `base64`, `mediaType`, size). Show «لم يُرجع النموذج صورة» when the test model generates images and `ok` is false.
3. **Modes:** a readable Arabic/English reason for `IMAGE_GENERATION_UNSUPPORTED`, and the image badge in the modes list.
4. **Models list:** an image badge next to the model name.

### Slice 3 — tests and review ✅ done 2026-10-28
- `tests/image-creation.spec.ts` (6 tests, local stack, mock provider; own `e2e-design` mode, non-public `e2e-images` plan and a fresh user — the `free` plan and existing modes are untouched): empty state + ratio menu, 16:9 sent as `imageOptions`, image renders, viewer, download, reload, automatic sends no options, axe/RTL + no horizontal scroll at 375px. All pass.
- Unit: 496 pass (incl. PROVIDER_ERROR with a charge in an image mode, retry keeps the ratio, one download at a time).
- `frontend-reviewer` findings fixed: retry of a failed image answer kept no ratio (medium); hard-coded brand in the download fallback name; double status while creating; repeated downloads from the viewer; viewer alt text for created images; ratio not carried over on DUPLICATE_REQUEST of a new chat; byte unit not translated.
- Known flake, unrelated: `refusals.test.tsx` rate-limit countdown can time out under full-suite load (passes alone).

Original scope:
Owner: `test-engineer`, then `frontend-reviewer`.
- **Unit tests:**
  - `image` event parsing and cache update
  - the placeholder, then the image
  - download builds `?download=1` and saves the blob
  - the aspect ratio is sent only when chosen
  - blocked, text-only and stopped answers
  - admin toggle, minimum and test preview
- **MSW mock:** an `image` scenario for the chat send handler, with a tiny WebP blob for `/attachments/{id}`.
- **Playwright** (local stack, `mock` provider): one image-mode flow including reload, plus the route sweep for the new states (axe, RTL, no horizontal scroll).
- **CSP:** nothing to change: `img-src 'self' data: blob:` (added in F6) already covers created images, and production serves it. Admin test previews use `data:`, which is also allowed.

## 4. Design (Stitch)

**S17 Image creation** (`design/stitch/s17-image-creation/`; S16 is the catalog-sync screen), one screen with states, by `stitch-designer` and then your approval:
1. the mode picker with an image mode marked
2. the composer in an image mode with the aspect-ratio menu open
3. an assistant answer with the loading placeholder
4. the answer with the created image, open and download actions
5. a blocked-image error
6. the empty state for an image mode

Mobile at 375 px for states 2 and 4. Admin screens need no design.

## 5. Testing locally

1. Run the backend from its working tree (`npm run migration:run`, `npm run start:dev`).
2. In `/admin`:
   - enable the `mock` provider
   - create a model on `mock` with `supportsImages` + `generatesImages`, `maxOutputTokens` ≥ 2,500 and any price
   - make a mode use it, enable it, and add it to your plan
3. Every answer is `Echo: <message>` plus a 4×4 red image, for free.
4. **Real Gemini (paid, about $0.04–0.19 per image):** use `gemini-2.5-flash-image` with the image output rate, and run the admin model test first.

## 6. Out of scope (v1)
- More than one image per answer
- Image editing tools in the UI (masks, crops)
- A gallery of created images
- Reusing a created image as an attachment without download and upload
- A per-image price for users
- OpenAI `gpt-image-2` (coming from the backend; no UI difference expected)

## 7. Risks
| Risk | Mitigation |
|---|---|
| Full-resolution WebP (up to 4096 px) is several MB on mobile for every message in history | Ask the backend for a display size (§8, question 3); until then, load created images lazily (only near the viewport) |
| Image answers take tens of seconds (real Gemini) | The placeholder starts at `started` with a «جارٍ إنشاء الصورة…» line; Stop stays available |

## 8. Questions and asks for the backend
1. ✅ Answered: removed on purpose. **`source: 'trial'` removed** from plan/subscription DTOs in the working tree. Is that intended, and part of this release? `PlanCard.tsx` and the chat mock still use it.
2. ✅ Answered: the cap is dropped. **`DEFAULT_PLAN_BALANCE_TOO_HIGH` removed.** The frontend shipped the default-plan balance cap UI on 2026-10-26 (`4de7d48`). Was the cap dropped, or replaced by another code?
3. **Display size for created images** (recommended before launch): e.g. `GET /attachments/{id}?size=display` (max 1024 px). Full size stays for open and download. Without it, a conversation with a few images loads tens of MB.
4. **Document the 2,500 `maxOutputTokens` minimum** for image models in API_CONTRACT §9 (and, if possible, OpenAPI). Only the brief states it now.
5. **Placeholder before the `image` event:** is the aspect ratio of the coming image known at `started` (when the user picked one)? If the backend echoed `imageOptions` in `started`, the placeholder could take the right shape right away. Optional; otherwise the frontend uses the chosen ratio, or square for "automatic".
6. No per-image price estimate on `ModeDto` is needed for now (decision 3).
7. **`generatesImages` on `ModeModelSummaryDto`** (admin modes list), so the modes list can mark image modes. Small; not blocking.
