# F15 brief: design creation, edits, gallery and export (stage 4)

**From:** backend, 2026-11-11. **Status:** brief, ready to plan and build. Builds on F13 (agent in the chat) and F14 (cost on the summary).
**Backend reference:** `../SuperAI_Backend/docs/API_CONTRACT.md` §11 (inputs and steps, §11.1–11.2), §11.3 (cost), §11.4 (designs and export). Backend branch `p3-stage3-agent-runs` (not on `main` yet; migrations `DesignCreation`, `DesignEdits`).

Run `contract-sync`: new steps, the new inputs `progress` and `results`, `multiple` choices, `/me/designs`, report fields, admin runs, and new error codes (`AGENT_NOT_READY`, `DESIGN_IN_PROGRESS`, `DESIGN_NOT_FOUND`, `AGENT_RUN_NOT_FOUND`).

**Change from F13:** the `design_saved` step no longer exists. Confirming the request summary now **makes the designs**.

## 1. Creating designs

- **Confirm:** "Create" on the request summary sends `{ action: 'confirm' }`. When `estimate.fitsVariants` is less than `estimate.variants` (but not 0), offer "Create N designs" with `{ action: 'confirm', variants: N }`.
- **While it works:** the reply is an agent message with `ui.type: 'progress'` (`done`, `total`). Show a working state, for example "Designing… 1 of 2", and **poll `GET /conversations/{id}/messages` every 2 seconds** until a message with `ui.type: 'results'` arrives. It usually takes about a minute.
  - Hide the composer while it works. An answer sent meanwhile gets `409 DESIGN_IN_PROGRESS`.
  - Closing the app doesn't stop it. When the user comes back, the results are in the conversation.
- **Results:**
  - **Designs:** `ui.designs[]` (`outputId`, `attachmentId`, `width`, `height`, `variant`, `version`, `needsReview`, `editable`), in order. They are also the message's `attachments`. Show them as a grid or carousel with blob URLs from `GET /attachments/{attachmentId}`, as for created images.
  - **`needsReview: true`:** show a small note: "تحقّق من النص" / "The text may need a look".
  - **Buttons per design:** **Edit** (§2) and **Download** (§4).
  - **Then:** `ui.options`: "A new design" (`new_design`), "Another brand" (`change_brand`). When nothing came out (`designs: []`), the options are "Try again" (`try_again`) and "Another brand". Only what ran was charged.
- **Errors at confirm:** `409 AGENT_NOT_READY` (designs can't be made now) and `409 INSUFFICIENT_BALANCE` (`data.fitsVariants`, `data.estimatedCostUsd`).

## 2. Editing a delivered design

1. "Edit" on a design sends `{ action: 'edit', outputId }` to step `design_results`. This works for **any** design shown in the conversation, not only the latest results.
2. `design_edit`: a text input, "What should I change?".
3. `edit_summary`: a summary card with `estimate` (one design). "Edit it" sends `{ action: 'confirm' }`; "Cancel" sends `{ action: 'cancel' }`.
4. Then the same progress and results as above, with one design whose `version` is one higher. Show "v2", "v3" and so on.

## 3. Editing an uploaded design

1. The "What are we making?" choices now include **"Edit an existing design"** (`edit_existing`).
2. `edit_upload`: upload one file of kind `design` to `ui.brandKitId`, then send `{ assetIds: [id] }`.
3. `edit_changes`: **multi-select** chips (`ui.multiple: true`): replace the logo, replace the product, change the text, plus an "or describe it" text box. Send `{ choices: [...], text }`.
4. `edit_product` (only when replacing the product): upload one `product` file, then send `{ assetIds: [id] }`.
5. `edit_text` (only when changing the text): headline and second line.
6. `edit_summary`, then results as above. The design keeps its own shape.

## 4. My designs and download

- **Gallery** ("My designs", for example under the agent or in the account menu): `GET /me/designs?limit&cursor&brandKitId`, newest first. Each design has `attachmentId` (thumbnail), `version`, `kind`, `aspectRatio`, `conversationId` (link back to the chat), `needsReview`.
- **Download menu:**
  - **Type:** PNG (default), JPG or WebP.
  - **Size:** "Original" or "Standard for social media" (`size=standard`, for example 1080×1920 for a story).
  - **Call:** `GET /me/designs/{id}/export?format=&size=`, with the bearer token: fetch as a blob and save it. The filename is in `Content-Disposition`.
- **From the chat:** the results give `outputId`, which is the design `id` for export.

## 5. Usage and admin

- **`/me/usage`:** new `designs[]` by agent label (`runs`, `designs`, `chargedUsd`), apart from the message totals. Show them as a "Designs" line in the monthly statement.
- **Admin overview and user usage:** new `designs` block (runs, designs, flagged, charged, provider cost, margin, absorbed); the overview also has `designRunsToReview`.
- **Admin runs page:** `GET /admin/agent-runs?userId&status&cursor` lists runs; `GET /admin/agent-runs/{id}` gives `stepList` (each model call with its model, status, usage, cost, charge and error). Link to it from "to review".
- **Admin agents page (from F13/F14):** `promptInstructions` and `checkInstructions` text areas. The list shows only "custom" or null; empty restores the default.

## Rules

RTL first; errors by `code`; money via `<Money>`. Images are private: always fetch with the bearer token, never by URL.
