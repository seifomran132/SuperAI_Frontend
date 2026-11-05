# F6b brief: up to 3 images per message

**From:** backend, 2026-11-05. **Status:** brief, ready to build (small change to F6).
**Backend reference:** `../SuperAI_Backend/docs/API_CONTRACT.md` §8.2 and §8.6. Backend commit `c29e446` on `main` (deploying).

Start by running `contract-sync`: the error texts in `docs/ERROR_CODES.md` changed, so `src/i18n/errors.*.json` must be regenerated. No endpoint or shape changed: `attachments` was already a list.

## What changed in the backend

- A message can carry **up to 3 images** (was 1). Each is uploaded first (`POST /uploads`), then sent in `attachments: [{ uploadId }, …]`, in the order the user arranged them.
- **4 or more** is `422 TOO_MANY_ATTACHMENTS`. New text:
  - ar: «يمكنك إرفاق 3 صور كحد أقصى في كل رسالة.»
  - en: "You can attach up to 3 images per message."
- **The same upload twice** in one message is `400 VALIDATION_FAILED` (field `attachments`). The UI should never send that.
- Everything else per image is unchanged: 5 MB, JPEG/PNG/WebP, the mode must have `supportsImages`, each upload can be sent once, uploads expire after 24 h if not sent.
- Created images (image modes, F8) stay at **one per answer**.

## What the frontend needs

1. **Composer:** allow up to 3 images (today `attachment-draft.ts` keeps one and shows `TOO_MANY_ATTACHMENTS` on a second).
   - Show up to 3 preview tiles, each with its own upload progress, error and **remove** button.
   - Accept several files at once (file picker `multiple`, paste, drag and drop); take the first 3 and show the notice for the rest.
   - Never add the same upload twice.
   - Send only when every tile has finished uploading; a failed tile can be retried or removed.
2. **Tell the user the limit:** a hint near the attach button or in the empty composer, e.g. «يمكنك إرفاق حتى 3 صور» / "You can attach up to 3 images", and the regenerated `TOO_MANY_ATTACHMENTS` notice when they try a fourth.
3. **Messages:** show all of a user message's `attachments` (up to 3) in its bubble, in order (a small grid), each opening full size. History already returns them.
4. **Retry / draft:** a send refused before streaming (e.g. `INSUFFICIENT_BALANCE`) keeps all the draft's uploads, as today for one.
5. **Cost:** each image adds input tokens; no UI change needed (the reservation and `INSUFFICIENT_BALANCE` already account for it).

## Tests

Update `attachment-draft` and `ComposerImage` tests for 3 tiles, the fourth refused with the notice, remove one, duplicate prevention, and sending with all three.

## Status (frontend, 2026-11-05)

Built: the composer holds up to 3 image tiles (each with its own upload, progress, error, retry and remove; several files at once from the picker, paste or drop; the rest refused with the TOO_MANY_ATTACHMENTS notice; a file already attached is not added again); send waits for every tile and sends them in tile order; the hint «يمكنك إرفاق حتى 3 صور» (attach button tooltip, and under the tiles while there is room); a refused send keeps all tiles; user messages show several images side by side (140 px high each), each opening full size. Verified live against the backend `c29e446` with three images.

**Backend ask:** history returns a message's images by upload id, not in the order they were sent (all get the same `attachedAt`; ties sort by `id`). Three images picked at once upload in parallel, so after a reload their order can differ from the send order. Store the position from the request's `attachments` order and sort by it.
