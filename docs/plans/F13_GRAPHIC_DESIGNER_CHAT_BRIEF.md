# F13 brief: the graphic designer agent in the chat (stage 2)

**From:** backend, 2026-11-10. **Status:** brief, ready to plan and build. Builds on F12 (brand kits).
**Backend reference:** `../SuperAI_Backend/docs/API_CONTRACT.md` §11 (agents: inputs and steps), §10 (brand kits). Backend not committed yet; one migration `AgentConversations`.

Start with `contract-sync`: new endpoints, new fields on conversations (`agentKey`) and messages (`ui`, `answer`), and **five new error codes** (`docs/ERROR_CODES.md`).

## The experience (decided 2026-11-10)

The user picks **"مصمم جرافيك"** (graphic designer) in the chat page, next to the modes. The agent then talks in the chat, **one question per message**, with the right input under the newest question. It's systematic, but it should feel like a chat:

- A user **without a brand** is asked the brand name straight away, then logo, colours, style, fonts, and past designs or guidelines, then sees a summary.
- A user **with brands** first picks one as cards, or "New brand".
- Then comes the design request: format, topic, the exact text, an optional product or reference photo, and a summary. Confirming saves the request.
- In stage 4 the designs will appear in the same chat. For now the agent says the request is saved.

**The agent is switched off** for users until stage 4. To build and test it, an admin turns it on for a plan (Bruno `26-agents-setup`, or the admin UI below).

## Endpoints

| Call | Notes |
|---|---|
| `GET /agents` | Agents the plan offers, labels only. Show them in the chat picker. |
| `POST /conversations` `{ agentKey }` | Starts an agent conversation; then load its messages to show the first question. Not together with `modeKey`. |
| `GET /conversations/{id}/messages` | Agent messages have `ui`; replies have `answer`. |
| `POST /conversations/{id}/agent/answer` | `{ step, value, clientRequestId }` → `{ messages: [reply, nextQuestion], step }`. Append both to the chat. |
| `POST /me/brand-kits/{id}/assets?kind=` | Upload steps: upload each file first (F12), then answer with the returned ids. |

## Rendering

- Every agent message shows `content` (Arabic) or `ui.prompt.en` in English.
- **Only the newest agent message is interactive.** Older inputs are history: show the user's reply bubble instead.
- The input by `ui.type` (full shapes in API_CONTRACT §11.1):
  - **`brand_picker`:** brand cards (logo thumbnail from `logoAssetId`, name, a "draft" badge) plus "New brand" (disabled when `canCreate` is false).
  - **`text`:** a composer-like input with a character counter.
  - **`choices`:** chips; when `allowText`, also a free-text box ("or describe it").
  - **`upload`:** a drop zone or camera button inside the chat, with "Skip" when `optional`. Upload to `ui.brandKitId` with one of `ui.kinds`, show progress and previews, then send `{ assetIds }`.
  - **`colors`:** swatches of `current` plus chips of `suggested` ("Add these?"), add by picker or hex, reorder, up to `max`.
  - **`fields`:** headline and second line with counters; both may be empty ("no text").
  - **`summary`:** a card of `items`, with a "Looks good" button and "Change" on each editable item. The request summary also has "Another brand".
  - **`none`:** nothing to answer; show the message, which is about the plan limit, with a link to plans.
- Users can't type a normal chat message into an agent conversation; the composer is replaced by the current input. To chat normally they start a new conversation.

## Errors

| Error | Suggested UI |
|---|---|
| `409 AGENT_STEP_MISMATCH` (`data.step`) | The client is behind: reload the messages and show the latest question |
| `400 VALIDATION_FAILED` (field `value`) | Under the input |
| `409 AGENT_NOT_AVAILABLE` | The plan no longer offers the agent; explain and link to plans |
| `409 BRAND_KIT_LIMIT_REACHED` (`data.limit`) | At "New brand": explain the limit |
| `409 CONVERSATION_IS_AGENT` | Should not happen if the composer is hidden |

**Retries:** keep the same `clientRequestId` when retrying one answer after a network error. The server returns the same messages and doesn't apply the answer twice.

## Admin

**Agents page:** list (`GET /admin/agents`) with an on/off switch, labels, and plans (`PATCH /admin/agents/{key}` with `planKeys`). Changes need a reason, like other admin forms.

## Rules

RTL first; the `content` and `prompt` are bilingual. Errors by `code`. Hex colours shown left-to-right.
