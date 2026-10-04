# F2 — Chat workspace plan

**Status:** Approved 2026-10-04
**Screens:** S1 chat workspace (+ all answer and notice states) · S2 new chat (empty state) · S3 mobile chat · S4 conversation list (sidebar) · S14 request-balance dialog · account menu
**Branch:** `feature/f2-chat` from `dev`
**Contract:** `../SuperAI_Backend/docs/API_CONTRACT.md` §5–§6 is binding. Backend checked 2026-10-04: no API change since our last sync (backend `4b8fa75`).

## 1. What the user can do

- See their conversations in the right sidebar (newest first, loads more on scroll), open one, or start a new chat.
- Pick a **mode** (labels from `GET /modes`, only modes on their plan) per message; the conversation remembers the last one.
- Type a message, send it, watch the answer stream in, stop it, and see the **actual cost and remaining balance** when it finishes.
- Read older messages by scrolling up.
- Understand and recover from every refusal: not enough balance (switch to a cheaper mode, or request balance), no active plan, answer still being written, too many messages, message too long, mode not on the plan.
- Open the account menu (name, links to balance and account, **sign out**).

Out of scope (launch rules): rename/delete conversations, attachments, templates, pre-send estimate, search, model/provider names, add-balance purchase.

## 2. Data and API

| Need | API | Notes |
|---|---|---|
| Conversation list | `GET /conversations?limit=20&cursor=` | `conversationsControllerListInfiniteOptions`; newest first |
| Open conversation | `GET /conversations/{id}` | 404 `CONVERSATION_NOT_FOUND` → "not available" state + back to new chat |
| Messages | `GET /conversations/{id}/messages?limit=50&before=` | newest first → reversed for display; older pages on scroll up |
| Modes | `GET /modes` | plan-available modes with labels/descriptions; mode colour by position (`mode-1`, `mode-2`, …) |
| Balance | `GET /me/balance` | header chip; updated from `done`/`error` `balanceUsd` without refetch |
| Create conversation | `POST /conversations { modeKey }` | **only on the first Send** of a new chat, so no empty conversations pile up |
| Send + stream | `POST /conversations/{id}/messages` (SSE) | hand-written; not in the generated client |

### Stream (API_CONTRACT §6) — client behaviour

- New UUID `clientRequestId` per press of Send; reused only when retrying the same send after a network failure.
- Pre-stream errors are JSON (check `response.ok` + `Content-Type`). Events: `started` → `delta`* → exactly one `done` | `error`; ignore `:` comments.
- `started`: replace the optimistic user message with `userMessage`, add `assistantMessage` (streaming); a new chat navigates to `/chat/{id}` (replace, keeping the stream).
- `delta`: append text. `done`/`error`: replace with final `message`, show `chargeUsd`, set balance from `balanceUsd`, update the conversation in the list (title, `lastMessageAt`, move to top).
- **Stop** = `AbortController.abort()` via the active-streams registry, then refetch messages (server keeps a `partial` answer, `finishReason: "aborted"`). Switching conversations does **not** abort; the stream keeps writing into the cache (§3).
- Network drop / tab hidden then visible / app resume: refetch the open conversation's messages and the balance. **Never auto-reconnect.**
- Messages left `streaming` from an earlier visit are shown as "being written" and refetched until they settle.

### Refusals → UI

| Code | What the user sees | Draft |
|---|---|---|
| `INSUFFICIENT_BALANCE` | Amber notice above the composer: cost estimate and balance from `data`; one «التبديل إلى …» button per `data.alternatives` (switch only, **never sends**); no alternatives → «تواصل معنا لإضافة رصيد» opening the request-balance dialog | kept |
| `NO_ACTIVE_SUBSCRIPTION` | Notice + request-balance dialog («ليست لديك باقة نشطة…») | kept |
| `MODE_NOT_AVAILABLE` | Notice; refetch `/modes` and select the first available mode | kept |
| `CONVERSATION_BUSY` | Notice «لا يزال الرد السابق قيد الكتابة.»; refetch messages | kept |
| `RATE_LIMITED` | Notice with live countdown from `Retry-After` / `data.retryAfterSeconds`; Send disabled until 0 | kept |
| `CONTEXT_TOO_LONG` / `VALIDATION_FAILED` | Notice under the composer | kept |
| `DUPLICATE_REQUEST` | Silent: refetch messages | cleared |
| `PROFILE_INCOMPLETE` | Redirect to `/complete-profile` (guard should prevent it) | kept |
| `error` event (`PROVIDER_*`, `CONTENT_BLOCKED`) | Failed or partial answer card with the catalog message and the cost actually charged | — |
| `partial` + `finishReason: "length"` | Answer kept with a muted «توقف الرد قبل اكتماله» note | — |

## 3. Architecture

Feature folder `src/features/chat/` (CLAUDE.md shape):

```
features/chat/
  index.ts
  pages/        ChatPage (new chat and existing conversation)
  components/   AppShell, Sidebar, ConversationList, ChatHeader, BalanceChip, AccountMenu,
                MessageList, MessageCard, Markdown, CodeBlock, Composer, ModeSelector,
                ChatNotice, RequestBalanceDialog, EmptyState
  model/        active-streams (registry), send-message (runs a stream, writes the cache),
                useSendMessage, useConversation, useMessages, useConversations, useModes,
                chat-store (Zustand: selected mode + draft per conversation, drawer),
                sse-parser, stream-events (types), cache-updates, useResumeRefresh
src/platform/stream/   ChatStreamTransport interface + fetch/ReadableStream implementation
src/mocks/chat/        MSW: stream scenarios and every refusal
```

- **State ownership — no separate global store for conversations.** The TanStack Query cache is the single shared store:

  | State | Owner |
  |---|---|
  | Conversation list, each conversation, its messages, modes, balance | TanStack Query cache (the only copy) |
  | The live streaming answer | Written **into the same cache** as events arrive: `started` adds the user + assistant messages and moves the conversation to the top, `delta` appends text, `done`/`error` sets the final message, the cost and the balance |
  | Streams in progress | `model/active-streams.ts`: a module-level registry `conversationId → { abortController, status }` (not React state). Lets Stop work from any component, blocks a second send in the same conversation, and lets the sidebar show «يكتب…» |
  | UI-only state | Zustand `chat-store`: selected mode and unsent draft per conversation, mobile sidebar open |
  | Session and user | Unchanged from F1 (auth-js, `/me` in Query) |

  Consequences: **switching conversations or navigating away does not stop an answer** — it keeps streaming in the background and is complete when the user returns; only the Stop button (or closing/reloading the page) aborts. After `done` there is nothing to merge, because there is only one copy. `useSendMessage` is a thin hook over the registry + cache, not a store of its own.
- **Routes:** a pathless app-shell layout so chat, balance and account share the sidebar and header, while complete-profile keeps the auth layout:
  ```
  routes/_authed/route.tsx            (guard, existing)
  routes/_authed/_app/route.tsx       AppShell (sidebar + header + Outlet)
  routes/_authed/_app/chat/index.tsx  /chat            new chat
  routes/_authed/_app/chat/$conversationId.tsx         /chat/:id
  ```
- **Markdown (assistant answers only):**
  - `react-markdown` + `remark-gfm` (headings, bold, lists, tables, task lists, links, code). Raw HTML is never rendered; links open in a new tab with `rel="noopener noreferrer"`.
  - **While streaming**, the text is re-rendered on each delta (batched per animation frame). Unfinished syntax is closed temporarily before rendering (an open ``` fence, an unclosed `**`), so a half-written code block or bold text doesn't flash as raw characters.
  - **Arabic/RTL:** each block gets `dir="auto"` so Arabic paragraphs read right-to-left and English ones left-to-right; list bullets and table columns follow the block direction; inline code is isolated with `<bdi dir="ltr">`; code blocks are `dir="ltr"` with a copy button (top-left) and a language label. Typography uses DESIGN.md (16px body, 1.75 line height, no italics for Arabic — `*emphasis*` renders as weight 600).
  - Syntax highlighting with `shiki` loaded lazily (decision 3). Math (LaTeX) is not rendered at launch.
  - **User messages are plain text** (newlines kept, no Markdown), so what they typed is shown exactly.
  - Copy action copies the original Markdown text.
- **Lists:** paginated with infinite queries; no virtualization in F2 (add `@tanstack/react-virtual` only if long conversations measure slow).
- **Mobile:** sidebar becomes a drawer from the right (Radix Dialog); composer sticks to the bottom with safe-area padding and `100dvh`.
- **Money:** every amount through `<Money>`; costs are decimal strings end to end.

## 4. Work breakdown

| Step | Who | Output | Gate |
|---|---|---|---|
| D1 | `stitch-designer` | Fix S1 in Stitch (sidebar right, HTML export), then a **chat states board** (preparing, streaming + Stop, stopped/cut, failed, insufficient balance with switch buttons, no alternatives, no plan, busy, rate-limit countdown, too long), **S2 new chat** (empty state, mode picker), **mode menu open**, **account menu open**, **S14 request-balance dialog**, **S3 mobile** chat + drawer, **S4** list loading/empty/error | **You approve** |
| B1 | `chat-engineer` (in parallel with D1 — no UI) | `src/platform/stream`, SSE parser, `useSendMessage` state machine, data hooks, cache updates, resume refresh, MSW stream mocks, unit tests for every §6 case | tests green |
| B2 | `ui-builder` (after D1 approval) | App shell, sidebar + list, header + balance chip + account menu (sign out), composer, mode selector, message list/card + markdown, notices, request-balance dialog, routes, copy | typecheck/lint/build |
| T | `test-engineer` | Component tests for every state; Playwright: send → stream → cost/balance, stop, insufficient balance switch (doesn't send), rate limit, reload mid-stream; axe + RTL | green |
| R | `frontend-reviewer` | Both checklists, stream rules (§6) | APPROVE |
| M | me | Manual run against the local backend with a real provider; commit | — |

## 5. Local backend prerequisites (for B1 manual check, T and M)

A real streamed answer needs, in `../SuperAI_Backend`:
1. A provider API key (dev modes run on **Google Gemini**): `PUT /api/v1/admin/providers/google/api-key` (Bruno folder 13). Real requests cost a little.
2. Modes ready and on a plan (Bruno 7 and 9 — already seeded if `GET /modes` returns modes).
3. The test user with an **active plan and balance** (Bruno 9: activate a plan, 11: add funds).
Without these, only MSW tests can run; refusals (`NO_ACTIVE_SUBSCRIPTION`, `INSUFFICIENT_BALANCE`) can be checked live.

Checked 2026-10-04: `GET /modes` returns `fast` and `professional`; the local test user is on the default **free** plan with **no subscription** and balance `0`. So a live send today is refused with `NO_ACTIVE_SUBSCRIPTION`. The Google provider key status is not yet verified.

## 6. Backend gaps that affect F2

1. **Cost isn't stored on messages.** `MessageDto` has no `chargeUsd` / token counts, so the cost line shows only for answers sent in the current session and disappears after reload. **Deferred (2026-10-04):** adding `chargeUsd` to `MessageDto` is postponed. For F2, the footer shows cost when known and nothing otherwise.
2. Conversation rename/delete — out of launch scope; no UI.
3. **Default system prompt — updated on the local backend (2026-10-04)** through `PUT /admin/chat-settings` (audited). Neither mode has its own prompt, so it applies to both. New text: "You are Bayan (بيان), a helpful assistant. Reply in the language the user writes in (Arabic by default). Be clear, accurate and concise. If you are not sure about something, say so. Format answers in Markdown: short paragraphs, headings and lists where helpful, tables for comparisons, and fenced code blocks with a language tag." **Staging and production need the same change by an admin**, and each white-label customer needs its own brand name in this prompt.

## 7. Decisions (2026-10-04)

1. **Sidebar links to Balance and Account (F3):** approved — F3 is built right after F2; in F2 the links point to empty routes (render nothing, like `/chat` did in F1) so navigation and the active state work.
2. **Retry on a failed answer:** approved — «إعادة المحاولة» re-sends the same text as a new message (new `clientRequestId`, charged only for what is used).
3. **Code highlighting:** approved — `shiki`, lazy-loaded with a small language set (js/ts, python, json, bash, sql, html/css).
4. ~~Backend gap 1~~ — **decided: deferred.** The cost line shows only for answers sent in the current session.
5. **System prompt:** approved and applied locally (§6.3).
