# F13 — The graphic designer agent in the chat (stage 2)

**Status:** plan approved 2026-11-10; designs S25 and S26 approved 2026-11-10. Building. Edit-a-design task proposed to the backend: [F13_EDIT_DESIGN_BRIEF.md](F13_EDIT_DESIGN_BRIEF.md).
**Brief:** [F13_GRAPHIC_DESIGNER_CHAT_BRIEF.md](F13_GRAPHIC_DESIGNER_CHAT_BRIEF.md). **Binding contract:** `../SuperAI_Backend/docs/API_CONTRACT.md` §11 (agents), §10 (brand kits).
**Backend:** `b3e5498` on `main` (pushed), migration `AgentConversations`. The agent is off for users until stage 4; an admin turns it on per plan.
**Depends on:** F12 (upload, colour palette, profile parts, `GET /agents` query).
**Goal:** the user picks «مصمم جرافيك» in the chat, answers one question per message with the right input, and ends with a saved design request. No AI runs and nothing is charged.

## 1. What we build

1. **Picker:** the mode menu in the composer gets a second group, agents from `GET /agents` (label and description, never a model name).
2. **Starting:** choosing an agent calls `POST /conversations { agentKey }`, opens `/chat/$id` and loads its messages; the first question appears.
3. **Agent conversation view** (`conversation.agentKey` set):
   - Messages render as now; agent messages show `content` (Arabic) or `ui.prompt.en` (English). The user's replies are normal user bubbles.
   - **Only the newest agent message is interactive**; its input replaces the composer at the bottom. Older questions are history.
   - The header shows the agent's label; "New chat" leads back to a normal conversation (agent conversations take no free text).
4. **Inputs** in `features/chat/components/agent/`, one per `ui.type`: `brand_picker` (cards with logo thumbnail, name, «مسودة» badge, "New brand", disabled when `canCreate` is false), `text` (counter), `choices` (chips, plus "or describe it" when `allowText`), `upload` (F12 drop zone inside the chat, to `ui.brandKitId` with one of `ui.kinds`, up to `maxFiles`, "Skip" when `optional`), `colors` (F12 palette with `current`, `suggested` and `max`), `fields` (headline and second line with counters; both may be empty), `summary` (items card, "Looks good", "Change" per editable item, "Another brand" on the request summary), `none` (the message plus a link to plans), and `design_saved` actions ("New design", "Another brand").
5. **Answer call** `POST /conversations/{id}/agent/answer` (`model/agent-answer.ts`): a new `clientRequestId` per answer, reused when retrying the same answer after a network error; append the returned `[reply, nextQuestion]` to the messages cache; refresh the conversation title.
6. **Admin agents page** `/admin/agents`: list (`GET /admin/agents`) with on/off, labels, descriptions, order and plans (`PATCH /admin/agents/{key}`, reason required, audited).

## 2. Errors

| Error | UI |
|---|---|
| `409 AGENT_STEP_MISMATCH` | Reload messages; show the latest question with a short note |
| `400 VALIDATION_FAILED` (`value`) | Under the input; the answer stays filled in |
| `409 AGENT_NOT_AVAILABLE` | Notice where the input was, link to plans |
| `409 BRAND_KIT_LIMIT_REACHED` | At "New brand": the limit and a link to plans |
| `409 CONVERSATION_IS_AGENT` | Not reachable (no composer); falls back to reloading |
| Network error | Retry button that resends with the same `clientRequestId` |
| Upload errors | As in F12, under the drop zone |

## 3. Decisions (approved 2026-11-10)

1. **Picker placement:** agents as a second group in the existing mode menu, under a heading such as «مهام متخصصة». Also an agent card in the new-chat empty state, so it's discoverable. Picking an agent in an existing conversation starts a new one.
2. **No confirmation before starting:** an agent conversation costs nothing and is a normal conversation in the list.
3. **Composer:** replaced by the step input in agent conversations; no free-text messages. The input sits where the composer is, so it stays at the bottom on phones with the keyboard.
4. **History:** older questions show only their text; the reply bubble shows what was answered (from the server's `content`/`answer`). Thumbnails for uploaded files and colour swatches in the reply, where the answer holds them.
5. **Optimistic display:** none; the reply bubble appears with the next question when the call returns (answers are fast and there is no stream). The input shows a busy state meanwhile.
6. **Admin:** one page with a dialog per agent (switch, labels, descriptions, order, plans as checkboxes, reason), like other catalogue forms.
7. **Text:** chat strings in `ar.json`/`en.json` (the chat is already in the first-screen bundle; the inputs load lazily with the agent conversation), admin text in `admin.{ar,en}.json`.

## 4. Designs

- **S25 — Agent in the chat** (desktop and phone): picker with the agents group; empty-state card; one frame per input type; summary; history above the active input; busy, validation error, step mismatch, not available, network retry; `none` (blocked).
- **S26 — Admin agents:** list and edit dialog.

## 5. Tests

Unit: answer call (retry keeps the id, mismatch reloads, validation under the input), each input's value shape against §11.1, only the newest message interactive, composer hidden, picker groups. MSW `src/mocks/agents.ts` with a scripted step sequence. Playwright (`AG-` cases, local stack with the agent turned on for a test plan): new user sets up a brand and saves a request; user with a brand picks it; edit from a summary; skip optional uploads; limit 0 → blocked; step mismatch from a second tab; admin turns the agent off → not available.

## 6. Order of work

1. F12 built (shared parts).
2. User approves §3; designs S25 and S26; the user approves.
3. Build, tests, review, browser check.
4. Merge after the backend's `AgentConversations` migration runs on production. The agent stays off for users until stage 4.

## 7. Stage 3 additions (2026-11-10)

Backend `7c45f8f` (F14 brief) adds `ui.estimate` on the request summary, `agent` on balance activity and models, variants, margin and `ready` on admin agents. Contract re-synced; no new endpoints or error codes.

- **User decision:** the request summary shows **no prices** (launch rule). Only balance notes from `ui.estimate`: fewer variants than requested → an info note; none → a warning with links to the balance page and «طلب رصيد», confirm disabled. `null` → nothing.
- **Balance activity:** design charges show the agent label where chat charges show the mode (part of this build).
- **Admin agents (S26):** «النماذج والتكلفة» section with the three model pickers, variants 1–3 and the margin override (empty = each model's own margin, per the contract), and «جاهز» / «غير جاهز» status. Turning the agent on while not ready warns but is allowed (admins test it).
- **To confirm with the backend:** `ui.estimate` money fields are decimal strings (they are not in OpenAPI; the UI uses only `variants` and `fitsVariants`).

## 8. Build notes (2026-11-10)

- **Chat:** agents group in the mode menu and a card on the new-chat screen (props from `ChatPage`, so the composer stays presentational); agent questions and answers in `MessageList`; the step input (`components/agent/AgentDock`, loaded lazily) replaces the composer. Model in `model/agent.ts`: `useStartAgent`, `useAgentAnswer` (one `clientRequestId` per answer, reused only by «إعادة المحاولة»; `AGENT_STEP_MISMATCH` reloads the messages). Inputs reuse the F12 parts.
- **Value shapes** follow `graphic-designer-flow.ts`: `design_saved` chips answer `{ action }`; optional text answers `{ text: '' }`.
- **Balance activity:** design charges read «… · مصمم جرافيك».
- **Admin:** `/admin/agents` (`features/admin/agents`), «المساعدون» in the admin menu; model pickers optional; plans sent only once the plans list has loaded.
- **Tests:** 16 chat unit tests, 1 admin, 1 balance; all 745 unit tests pass. Playwright AG-02 to AG-06 pass on Chromium; on the other browsers 5 passed before the local backend broke (below).
- **Local backend blocked further e2e (2026-11-10):** the backend's working tree has uncommitted stage 4 work (`design_running` step, migration `DesignCreation`) that the dev API reloaded. Until that migration runs: confirming a request fails (`agent_sessions_step_check`) and `/admin/agents` answers 500. AG-01 and the remaining browsers need a re-run then. The e2e left the agent on for the local default plan.
- **Backend gaps to raise:** picking an existing brand doesn't retitle the conversation («label · brand»); the edit-a-design task ([F13_EDIT_DESIGN_BRIEF.md](F13_EDIT_DESIGN_BRIEF.md)); finishing a ready kit's gaps in the chat (F12 §7).
