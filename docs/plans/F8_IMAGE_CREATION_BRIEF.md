# F8 brief: image creation (image modes)

**From:** backend, 2026-10-27. **Status:** brief, to be planned (plan only, don't build yet).
**Backend reference:** `../SuperAI_Backend/docs/API_CONTRACT.md` §9 (binding), `docs/IMPLEMENTATION_MODULES.md` §10.12.
**Backend state:** built and tested, **not committed or deployed yet**. To develop against it, run the backend from its working tree (`npm run migration:run`, then `npm run start:dev`); the generated contract (`openapi/openapi.json`) is already updated there.

Start by running `contract-sync` against the backend working tree. Then write the plan (e.g. `docs/plans/F8_IMAGE_CREATION.md`), use `stitch-designer` for screens if useful, and send back the plan plus anything the API is missing. The goal of the first slice is **to test image creation locally end to end**.

## What the backend does

- An **image mode** is a mode whose model creates images (`generatesImages: true`). It uses the **same chat endpoint and stream** as text modes.
- The user describes an image, or attaches one (F6 upload flow) to edit it or to make one like it. Follow-ups such as "make it brighter" edit the last created image in the conversation.
- The answer is usually a short text plus **one image**. The model may also answer with text only (for example it declines).
- Created images are stored privately (WebP, full resolution up to 4096 px) and deleted with their conversation.

## Contract changes

| What | Where | Notes |
|---|---|---|
| `generatesImages: boolean` | `ModeDto` (`modes_list`) | Mark image modes in the mode picker. Image modes also have `supportsImages: true`. |
| `imageOptions?: { aspectRatio?: '1:1' \| '3:4' \| '4:3' \| '9:16' \| '16:9' }` | `chat_send` body (`ImageOptionsDto`) | **Optional.** Omitted means the model decides (follows an attached image, otherwise square). Ignored by text modes. Another value is `400 VALIDATION_FAILED`. |
| SSE `image` event | `chat_send` stream | `{ attachment: { id, mimeType, width, height } }`, at most once, after the text and before `done`. |
| Assistant `attachments` | `MessageDto` in `done`, `error` and `conversations_messages` | Created images. Previously always `[]` for assistant messages. |
| `?download=1` | `attachments_download` | `Content-Disposition: attachment; filename="lam7a-<id>.webp"`. Without it: `inline` as before. |
| `generatesImages` | `ModelDto`, `CreateModelDto`, `UpdateModelDto` (admin) | New toggle. An image model needs `maxOutputTokens` ≥ 2,500 (`400 VALIDATION_FAILED` on `maxOutputTokens` otherwise). |
| `notReadyReason: 'IMAGE_GENERATION_UNSUPPORTED'` | `AdminModeDto` | An image mode on a provider without an image path (only Gemini and the test `mock` provider have one). |
| `imageCreated?: { mediaType, bytes, base64 }` | `ModelTestResultDto` (`adminModels_test`) | For image models the test asks the model to draw; `ok` is false when no image came back. Show the base64 as a preview. |
| `catalog.generatesImages` | `CatalogSuggestionDto` (F7 discovery) | Prefill the new toggle. Image models are no longer hidden from discovery. |

### Stream example (image mode)

```text
event: started
data: {…}

event: delta
data: {"text":"تفضل، هذه صورتك:"}

event: image
data: {"attachment":{"id":"01a1…","mimeType":"image/webp","width":2048,"height":1152}}

event: done
data: {"status":"complete","finishReason":"stop","message":{…,"attachments":[{"id":"01a1…",…}]},"chargeUsd":"0.055000000","balanceUsd":"…"}
```

### Behaviour to handle

- **No image in the answer**: no `image` event; show the text only.
- **Blocked image**: `error` with `CONTENT_BLOCKED` (Arabic and English text in ERROR_CODES.md).
- **Image could not be stored**: `error` with `PROVIDER_ERROR`; it may still cost something (`chargeUsd` above zero).
- **Stop after the image**: the image is kept; `done` with `status: partial`, and it is charged.
- **A created image cannot be attached as an upload** (`404 ATTACHMENT_NOT_FOUND`). To edit it, the user just asks in the same conversation. To reuse it in another conversation, they download it and upload it.
- **Insufficient balance**: for an image request, `alternatives` lists only other image modes (and a text request only text modes). Keep the existing "switch mode" UI.
- **Cost**: billed as output tokens. Roughly per image, margin included: Gemini 2.5 Flash Image about $0.055, Gemini 3 Pro Image about $0.19. `pricing.outputPerMtok` of an image mode is its image rate, so a per-1M-token price looks high; consider showing an approximate price per image instead (needs a decision; the backend can add a per-image estimate field if wanted).

## Suggested scope

1. **Chat (users)**
   - The mode picker marks image modes (an icon or a label such as «صورة»).
   - In an image mode, an optional aspect-ratio chooser next to the composer (default: none, "automatic"). The attach-image button stays (edit or reference).
   - Handle the `image` event: show a placeholder while the answer streams, then the image (fetched with the bearer token as a `blob:` URL, like F6).
   - Assistant messages render `attachments` (history reload too), with **open full size** and **download** (`?download=1`).
   - The behaviour list above (no image, blocked, failed, stopped, alternatives).
   - Empty states and hints for image modes, e.g. "Describe the image you want" or "Attach an image to edit it".
2. **Admin**
   - Model form: a `generatesImages` toggle (prefilled from discovery). Hint: also set `supportsImages`, and use the image output rate as the output price. Show the 2,500 minimum on `maxOutputTokens`.
   - Model test: show the `imageCreated` preview and "no image returned" when `ok` is false.
   - Modes list: show `IMAGE_GENERATION_UNSUPPORTED` as a readable reason.
3. **Rules**: money via `<Money>` and `src/lib/money.ts`; errors by `code`; users never see provider or model names (admin screens may); RTL first.

## Testing locally

- **Offline, free:** the `mock` provider has an image path. In the admin, create a model on provider `mock` with `supportsImages` and `generatesImages` on, `maxOutputTokens` ≥ 2,500 and any price. Point a mode at it, enable it and add it to your plan. Every answer is "Echo: <your message>" plus a small 4×4 red image, so the whole UI flow can be exercised without paying. Enable the mock provider in the admin if it is off.
- **Real Gemini (paid, about $0.04-0.19 per image):** set the Google key, add `gemini-2.5-flash-image` (or `gemini-3-pro-image`) with both image flags and the image output rate (the catalog shows it). Run the admin model test first.

## Coming from the backend (not built yet)

- ~~OpenAI `gpt-image-2` image modes~~ **built 2026-10-27** (branch `feature/image-creation`). Same stream and events, with two differences: no `delta` events (the answer is the image only, `content` empty), and the aspect ratio is approximated to square, portrait (1024×1536) or landscape (1536×1024). Handle an image answer with no text.
- Possibly a per-image price estimate on `ModeDto`, if the UI wants it (tell us).
