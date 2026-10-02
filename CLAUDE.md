# Bayan frontend (SuperAI_frontend)

Arabic-first, right-to-left web app for the SuperCardAI chat platform, sold under the **بيان (Bayan)** brand and white-label ready. The backend is the sibling repo `../SuperAI_Backend` (NestJS).

## Read first
- [docs/FRONTEND_PLAN.md](docs/FRONTEND_PLAN.md) — scope, stack, routes, milestones, agents, open backend gaps
- [design/DESIGN.md](design/DESIGN.md) — design system v2 (tokens, components, content rules)
- `design/stitch/<screen>/` — approved Stitch screens and their `REVIEW.md`
- `../SuperAI_Backend/docs/API_CONTRACT.md` — binding API conventions and the chat stream (§6)
- `../SuperAI_Backend/docs/ERROR_CODES.md` — every error code

## Launch scope (do not build beyond it)
- **No payments.** No checkout, add-balance or top-up. Users ask the team for a plan or balance ("طلب رصيد" → contact options from the brand config).
- No pre-send cost estimate; actual cost shows after each answer.
- No conversation delete/rename, attachments or templates (the API has none).
- Users see **modes** (labels from `GET /modes`), never provider or model names.
- Build screens only after their Stitch design is approved.

## Stack
TanStack Start in **SPA mode** (client-only; `dist/client/_shell.html` serves every route) · TanStack Router (file routes in `src/routes`) · TanStack Query · HeyAPI client · `@supabase/auth-js` (GoTrue) · Tailwind CSS v4 · **shadcn/ui** (Radix; owned code in `src/components/ui`, mapped to our tokens) · react-hook-form + zod · lucide-react · sonner · i18next · decimal.js · Vitest + Testing Library · MSW · oxlint · Prettier.

shadcn components are ours once added: keep them on DESIGN.md tokens and logical (start/end) classes. Never re-run `shadcn add` over an existing component without re-applying those adaptations.

Never use Start server functions or server routes: the browser calls the API and GoTrue directly with a bearer token, and hosting stays static.

## Commands
| Command | Purpose |
|---|---|
| `npm run dev` | Dev server on http://localhost:3001 (allowed by the backend's `CORS_ORIGINS`) |
| `npm run build` / `npm run preview` | Production build / serve it |
| `npm run typecheck` · `npm run lint` · `npm test` | Checks run in CI |
| `npm run api:sync` | Regenerate `src/api/generated/` and `src/i18n/errors.*.json` from the backend's OpenAPI export |
| `npm run api:check` | Sync and fail if generated files changed (CI drift check) |

Local setup: Node 22+, `npm install`, `cp .env.example .env`, backend running (`npm run db:up` and `npm run start:dev` in `../SuperAI_Backend`).

## Layout
```
src/
  api/          client.ts (auth + session handling), query-client.ts, errors.ts, hey-api.ts
  api/generated/  HeyAPI output — never edit by hand; run `npm run api:sync`
  auth/         GoTrue client, sign-up helper
  brand/        BrandConfig per customer (name, monogram, brand colors, contact, legal)
  components/   shared components (Money, …)
  features/     feature folders: chat, balance, account, auth, plans, admin
  i18n/         ar.json (default), en.json, errors.{ar,en}.json (generated)
  lib/          env, money
  platform/     web/mobile adapters: storage, stream transport (Capacitor-ready)
  routes/       file routes (__root.tsx sets lang/dir/brand)
  styles/app.css  tokens from DESIGN.md (@theme)
design/         DESIGN.md and Stitch exports
```

## Conventions

### Right-to-left and Arabic
- `<html lang="ar" dir="rtl">`. Use logical utilities only: `ms-/me-/ps-/pe-/start-/end-/text-start/text-end/border-s/border-e/rounded-s/rounded-e`. Never `ml-/mr-/pl-/pr-/left-/right-/text-left/text-right`.
- The sidebar is on the **right**: it comes first in the DOM of an RTL flex row.
- Directional icons (arrows, send, chevrons) mirror; others don't.
- Never letter-space, italicise or monospace Arabic. Code blocks and code are `dir="ltr"`.
- Western digits everywhere.

### Tokens and brand
- Colors, radii and fonts come from `src/styles/app.css` (`bg-brand`, `text-fg-muted`, `border-border-control`, `bg-mode-1-container`, `text-danger`, …). No hex values in components.
- Brand name, monogram, brand colors and contact channels come from `src/brand`; copy uses `{{brandName}}`. Never hard-code "بيان" in components.
- Mode colors are assigned by position from the mode palette (`mode-1`, `mode-2`, …), not by mode name.

### Text
- Every user-visible string goes through i18next (`useTranslation`). Arabic is written first; keep `en.json` in sync.
- Errors are shown by `code` (`t('errors:CODE')`, see `src/api/errors.ts`); the API's `message` is a developer fallback only. Form fields highlight from `details`.

### Money
- API money is a USD decimal string (`"4.750000000"`). Never `parseFloat`, `Number()` or arithmetic on it; use `src/lib/money.ts` (decimal.js).
- Display money only with `<Money value={…} />`, which wraps it in `<bdi>` so `14.48$` reads correctly inside Arabic text.

### Data
- Use the generated HeyAPI options (`…Options`, `…InfiniteOptions`, `…Mutation`, `…QueryKey`) from `~/api/generated/@tanstack/react-query.gen`.
- Lists: `GET /conversations` paginates with `cursor`; messages, balance activity and the admin ledger with `before`. Items are newest first.
- Admin writes need a `reason`; money/subscription writes need a fresh `idempotencyKey` (UUID) per action, reused only on retry.
- The chat send endpoint is excluded from generation and implemented in `src/platform/stream` + `src/features/chat` per API_CONTRACT §6. Never auto-reconnect a stream; never auto-switch mode or auto-send on `INSUFFICIENT_BALANCE`.

### Auth
- GoTrue handles sign-up/sign-in/refresh/reset. The API client attaches the token, refreshes once on 401, and signs out on `ACCOUNT_SUSPENDED`/`ACCOUNT_DELETED`.
- Route guards run in `beforeLoad` in the browser; the API is the real guard. Prerendered/public pages must not read the session while rendering.

### States and accessibility
- Every page and data component has loading, empty (where it applies) and recoverable error states; preserve user input (drafts, forms) on recoverable errors.
- Semantic elements, labels on icon-only buttons, visible focus (`:focus-visible` ring from tokens), 44px touch targets, contrast per DESIGN.md, reduced motion respected.

### Code style
- Imports via the `~/` alias. TypeScript strict; no `any`.
- Comments explain why, not what. Match the surrounding code.
- Tests live next to the code (`*.test.ts(x)`).

## Agents (`.claude/agents/`)
`stitch-designer` (design one screen in Stitch) → user approves → `ui-builder` / `chat-engineer` (build) → `test-engineer` (tests) → `frontend-reviewer` (read-only review) → commit. `contract-sync` runs after backend API changes. Agents never commit.

## Git
- Default branch `main`. Commit only when asked. Line endings are LF (`.gitattributes`).
- Generated files (`src/api/generated/`, `src/i18n/errors.*.json`, `src/routeTree.gen.ts`) are committed.
