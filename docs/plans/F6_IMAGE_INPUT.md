# F6 — Image input in the composer

**Status:** Agreed 2026-10-11. Backend contract: `../SuperAI_Backend/docs/API_CONTRACT.md` §8 (binding; this plan follows it).
**Timing:** before launch. Runs before the F5d pre-launch gate; the gate then covers it.
**Order:** backend (B-img) → `contract-sync` → Stitch design (S15) → you approve it → frontend build → tests → review.
**Size:** medium. Most of the work is in the backend: storage, preprocessing, pricing and context.

## 1. Decisions

| # | Decision |
|---|---|
| 1 | **One image per message.** The API accepts an array (`attachments`) capped at 1, so raising the cap later needs no contract change. |
| 2 | **Max 5 MB per upload.** Allowed types: JPEG, PNG and WebP. No GIF, HEIC or SVG at launch. The backend reads the type from the file's bytes, not from the name or the header the client sends. |
| 3 | **The frontend does not resize.** It checks the type and the 5 MB limit for quick feedback, then uploads the original. |
| 4 | **The backend preprocesses every image before storing it** (§3), so each model call uses fewer tokens and stored images are small. Only the processed image is kept; the original is discarded. |
| 5 | **Images are stored by the backend** on the server, in a Docker volume behind a storage interface (§4). Moving to object storage (R2/S3) later only means swapping the driver. |
| 6 | **Retention:** an image is kept for as long as its conversation exists. Deleting a conversation, or deleting a user's data, removes its images. Uploads never attached to a message are deleted after 24 hours. |
| 7 | Images can only be sent to modes that can read them (`supportsImages`). The app never switches mode on its own; the user picks a mode that can. |
| 8 | Cost stays one USD number per answer. Image tokens are already part of the provider's reported input usage. |

### Why store images in the backend at all
- **Reloading history:** the user's message must still show its image after a refresh or on another device.
- **Context:** later turns of the conversation send earlier messages again, including images, to the model. Without a stored copy the conversation loses them.
- **Retries:** retrying with the same `clientRequestId` must send the same image without uploading it again.
- **Security:** a single server and the existing backups make the server disk the simplest safe choice before launch. Images are never public: they are served only to their owner through the API.

## 2. Backend — API contract (new)

### 2.1 Upload
```http
POST /api/v1/uploads
Authorization: Bearer <token>
Content-Type: multipart/form-data   (field: file)
```
→ `201 { "id": "upl_…", "mimeType": "image/webp", "width": 1568, "height": 1045, "bytes": 182340 }`. The width and height are after preprocessing.

- Allowed for signed-in users with a complete profile who are not suspended. Rate-limited like chat.
- The 5 MB limit is enforced while the file streams in (multer `limits.fileSize`), not after it is buffered.
- The upload belongs to its user: anyone else gets `404`.

### 2.2 Send a message
```json
{ "content": "ما الموجود في الصورة؟", "modeKey": "professional", "clientRequestId": "…", "attachments": [{ "uploadId": "upl_…" }] }
```
- `content` may be empty when there is an attachment. Otherwise the existing 1–20,000 character rule applies.
- `attachments`: optional, at most 1. The upload must belong to the user, must not already be attached to a message, and the mode must have `supportsImages`.
- A retry with the same `clientRequestId` and the same `uploadId` is the same request. The duplicate and replay rules from §6 are unchanged.

### 2.3 History and images
- `MessageDto.attachments: [{ id, mimeType, width, height }]`.
- `GET /api/v1/attachments/{id}` → the image bytes, with `Cache-Control: private, max-age=86400` and `X-Content-Type-Options: nosniff`. Bearer auth; other users get `404`. The frontend fetches it as a blob (§5). There are no public or signed URLs, so no link to an image can be shared.

### 2.4 Modes
`GET /modes` adds `supportsImages: boolean`, derived from the mode's model; admins set it on the model in `/admin/models` (an admin form field for F6 too). It must be `false` for models that can't read images (DeepSeek chat), and the model test in admin checks it with a small image.

### 2.5 New error codes (in ERROR_CODES.md, then translated via `api:sync`)
| Code | When |
|---|---|
| `ATTACHMENT_TOO_LARGE` (413) | File over 5 MB |
| `ATTACHMENT_TYPE_NOT_ALLOWED` (415) | Not JPEG, PNG or WebP, or the image can't be decoded |
| `ATTACHMENT_NOT_FOUND` (404) | Unknown upload, another user's upload, or one deleted after 24 h |
| `ATTACHMENT_ALREADY_USED` (409) | Upload already attached to a different message |
| `TOO_MANY_ATTACHMENTS` (422) | More than 1 |
| `MODE_NO_IMAGE_SUPPORT` (422) | Selected mode can't read images |

## 3. Backend — preprocessing (token saving)

`sharp` runs once, at upload time:

1. **Decode and validate:** read the type from the bytes, reject animated images and decompression bombs (`limitInputPixels`, for example 40 MP).
2. **Auto-rotate** from EXIF, then **strip all metadata**, including location and camera details.
3. **Downscale, never upscale**, to a longest edge of 1568 px and at most about 1.15 megapixels. That is the size Anthropic recommends (larger images are scaled down by the provider anyway and only add delay). It is also at or under the size where OpenAI and Gemini start charging for more tiles.
4. **Re-encode:** WebP at quality 82; lossless WebP for PNGs that have transparency or are text/screenshots. Screenshots are detected by a low unique-color count, so text stays sharp.
5. **Keep only the result**, plus its width, height, byte size and a content hash.

**Also when building context (`context-builder.ts`):**
- Images from earlier turns cost tokens again on every turn. **Only the images from the last 3 user turns are sent.** Older images are replaced by the text `[صورة سابقة]` / `[earlier image]`, so the model knows one existed.
- **Token estimate for the balance reservation (`token-estimate.ts`)**, per provider, using the processed width and height:
  - Anthropic: ≈ `w·h / 750`
  - OpenAI: `85 + 170 × tiles` (512 px tiles after its own scaling)
  - Gemini: 258 tokens per 768 px tile

  The actual charge still comes from the provider's reported usage.

## 4. Backend — storage, deletion and backups

- **Storage interface** (`put`, `get`, `delete`) with a disk driver at launch: an `uploads` volume in `deploy/compose.yml`, mounted only into `api`. Paths are `<userId>/<uploadId>.webp`, never derived from the uploaded filename.
- **Table** `attachments(id, user_id, message_id NULL, conversation_id NULL, mime_type, width, height, bytes, sha256, created_at)`.
- **Deletion:**
  - **Conversation deleted** → `DELETE /conversations/{id}` is a soft delete (backend, in progress), but its images are removed for good: the rows are marked deleted at once (so `GET /attachments/{id}` returns `404`) and a job deletes the files.
  - **User data deleted** → the same cascade.
  - **Unused uploads** older than 24 h are deleted by a nightly job.
  - Files are removed by a job after the rows are removed, so a failed file delete is retried and never blocks the user.
- **Backups:** `deploy/backup.sh` also archives the `uploads` volume, and the restore test covers it. Watch disk use: at about 200 KB per processed image, 10,000 images ≈ 2 GB.
- **Caddy:** raise the request body limit for `/api/v1/uploads` only, to just over 5 MB.

## 5. Frontend

### Design (S15, Stitch, needs approval before building)
- **Composer:** an attach button (image icon, `aria-label`) placed at the start side of the action row. A drop zone shown while a file is dragged over the chat. Pasting an image from the clipboard attaches it too.
- **Attached image:** one thumbnail above the text field with upload progress, a remove (×) button, and an error state with retry.
- **Mode notice:** when the selected mode can't read images, an inline notice «هذا الوضع لا يقرأ الصور. اختر وضعًا آخر لإرسال الصورة.» appears, Send is disabled, and the image stays attached. The modes that can read images are marked in the selector.
- **Message bubble:** the user's image above their text, with rounded corners and a fixed maximum height. Tapping it opens a full-screen viewer with a close button, focus trapped inside, and Escape to close.
- States: uploading, uploaded, failed, too large, wrong type, history image loading, history image failed to load. Desktop and mobile.

### Build
| Part | Where | Notes |
|---|---|---|
| Upload call | `features/chat/model/upload-image.ts` | Generated HeyAPI mutation if multipart generation is clean; otherwise a small hand-written `fetch` with `XMLHttpRequest`-based progress. Uses the same auth/refresh handling as the API client. |
| Composer state | `chat-store.ts` / `Composer.tsx` | The draft holds `{ file preview URL, uploadId, status }`. Upload starts as soon as an image is attached. Send is disabled until it finishes. The draft and its `uploadId` survive send errors, and retrying the send reuses them. |
| Client checks | `upload-image.ts` | Type and ≤ 5 MB before uploading, shown with the same error messages as the API codes. No resizing. |
| Stream request | `src/platform/stream` + `send-message.ts` | Add `attachments` to the body. An empty `content` is allowed when an image is attached. |
| Mode guard | `ModeSelector.tsx` | Uses `supportsImages`. Text-only modes stay selectable but show the notice. Nothing switches automatically. |
| History images | `MessageCard.tsx` + `useAttachmentImage` | Fetches `/attachments/{id}` with the bearer token → `URL.createObjectURL`, cached in TanStack Query, and the object URL is revoked on unmount. While loading, a placeholder at the stored width/height ratio, so the layout doesn't shift. |
| Optimistic message | `cache-updates.ts` | The sent message shows the local preview at once; it is replaced by the server attachment after `done`. |
| CSP | `scripts/csp.mjs` | Add `blob:` to `img-src`. |
| Copy | `ar.json`, `en.json` | Every new state and label, Arabic first. Error codes arrive through `errors.*.json`. |
| Scope docs | `CLAUDE.md`, `design/DESIGN.md` §Composer | Update "no attachments" once S15 is approved. |

Bundle: the viewer and upload code load lazily with the chat screen (`~/features/chat/ui`), and `npm run size` must still pass.

## 6. Tests
- **Backend:**
  - preprocessing: rotation, metadata stripped, downscale limits, never upscales, rejects a fake type or a decompression bomb
  - 5 MB limit while streaming
  - ownership `404`
  - `ATTACHMENT_ALREADY_USED`
  - `MODE_NO_IMAGE_SUPPORT`
  - retry with the same `clientRequestId`
  - context builder keeps only the last N images
  - token estimate per provider
  - conversation and user delete cascade
  - cleanup of unused uploads
- **Frontend (Vitest + MSW):**
  - attach by picker, drop and paste
  - progress, remove and retry
  - each error code
  - mode notice
  - draft kept after a send error
  - history image loading and failure
  - object URLs revoked
- **Playwright on the local stack:**
  - attach, send and see the answer with its cost
  - reload and still see the image
  - another user can't load the image URL (`404`)
  - axe check on the composer with an image attached, and on the viewer

## 7. Checklist additions (DEPLOY_CHECKLIST)
- `uploads` volume in compose, included in backup and restore (2.7, 2.12, 4.7).
- Caddy body limit for `/api/v1/uploads` (2.8).
- Local rehearsal: upload and chat with an image through Caddy (4.3).
- Admin: set `supportsImages` per mode and run the model test with an image (6.4).

## 8. Resolved
1. The model sees images from the last 3 user turns (agreed 2026-10-11).
2. A conversation whose first message has an image and no text is titled «صورة» (agreed 2026-10-11).
