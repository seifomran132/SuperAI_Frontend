# Deployment checklist — frontend and backend

One Linux VPS (fresh Debian 13, 3 vCPU / 8 GB / 100 GB) runs **one environment — production** in Docker:
Caddy (HTTPS) → **app** `lam7ai.com` (+ `www` redirect) (static frontend) · **API** `api.lam7ai.com` (`/api/*` NestJS · `/auth/*` GoTrue · `/health/*`); Postgres and Redis internal only.
No staging at the start. Before launch, production runs **privately** (pre-launch mode) and is wiped clean at launch.
Plan: [docs/plans/F5_HARDENING.md](../plans/F5_HARDENING.md) §4–6.

**Owner:** **You** = the user (accounts, server access, secrets, approvals) · **Claude** = files, code, verification.
Tick a box only when it has been checked, not just done. `[~]` = written but not yet run or verified.

### Secrets (simple for now)
- All app secrets live in **one file on the server: `/srv/lam7a/.env`** (`chmod 600`, owner `deploy`), created by `deploy/gen-secrets.sh` with random values. Docker Compose reads it directly.
- Plain settings (domain, ports, limits, subjects) are in `deploy/config.env`, committed to git.
- GitHub holds only `DEPLOY_SSH_KEY` and `DEPLOY_HOST`. Claude never sees secret values; scripts create and check them on the server.
- **Offline copy** of the server `.env` on your personal PC (encrypted) — at least `SECRETS_ENCRYPTION_KEY` matters — without it, backups cannot decrypt the stored provider keys.
- **Later:** move secrets to Bitwarden Secrets Manager (`bws run`). The compose file reads secrets only from the environment, so the switch needs no app changes.

### Production from the first deploy
Public on `lam7ai.com` + `api.lam7ai.com`, real email through Brevo, indexed by search engines. No pre-launch mode, no test data to wipe: every account created is real.
`SITE_MODE=prelaunch` (site password, `noindex`, Mailpit) stays available in `deploy/config.env` for maintenance or a future staging setup.

---

## 0. Decisions and accounts

| # | Item | Owner | Status |
|---|---|---|---|
| 0.1 | Server OS: **Debian 13**, IP `80.209.232.164` | You | [x] |
| 0.2 | Email: Brevo from the first deploy | You | [x] decided |
| 0.3 | Off-server backup target — **later**; until then nightly `pg_dump` stays on the server only | You | [ ] later |
| 0.4 | Only production, public from the first deploy (no pre-launch mode) | You | [x] decided |
| 0.5 | GitHub repos configured: `seifomran132/SuperAI_frontend`, `seifomran132/SuperAI_Backend` | You | [x] |
| 0.6 | Secrets: `/srv/lam7a/.env` on the server for now; Bitwarden Secrets Manager later | You | [x] decided |
| 0.7 | Offline copy of the server `.env`: your personal PC, in an encrypted location (BitLocker drive or a password-protected 7-Zip/VeraCrypt file), plus a second copy (e.g. USB drive) | You | [x] decided |

## 1. Launch inputs (needed before the first deploy unless marked optional)

| # | Item | Owner | Status |
|---|---|---|---|
| 1.1 | Brand **لمحة AI / Lam7a AI**; domain **lam7ai.com** (app) + **api.lam7ai.com** (API), used from pre-launch | You | [x] |
| 1.2 | Brevo: account created; SMTP `smtp-relay.brevo.com:587` (STARTTLS), login `bcc942001@smtp-brevo.com` (goes in `deploy/config.env`). DNS verified public: `brevo-code` TXT ✓, DKIM `brevo1`/`brevo2` ✓, DMARC `p=none` ✓; SPF to merge (`include:spf.brevo.com` into the existing record). Still to do: sender `noreply@lam7ai.com`, new SMTP key (server `.env` as `GOTRUE_SMTP_PASS`), click tracking off | You | [~] |
| 1.3 | Contact channels: `contact@lam7ai.com`, phone `+972 56-751-8888` (in `src/brand/lam7a.ts`); `contact@` must deliver (Namecheap email forwarding) | You | [x] |
| 1.4 | Tagline (ar + en) — optional: not shown in the app yet | You | [ ] |
| 1.5 | Logo / favicon (optional; monogram works) | You | [ ] |
| 1.6 | Brand config `src/brand/lam7a.ts` (name, monogram ل, default brand) — contact and tagline still placeholders; production build check passes | Claude | [ ] |
| 1.7 | Arabic copy review done ([docs/copy/AR_COPY_REVIEW.md](../copy/AR_COPY_REVIEW.md)) and applied | You → Claude | [ ] |

---

## 2. Backend repo (`SuperAI_Backend`, branch `feature/deploy`)

### Code changes
| # | Item | Owner | Status |
|---|---|---|---|
| 2.1 | `TRUST_PROXY` env (Express `trust proxy` hop count; `1` behind Caddy) so audit logs record the client IP | Claude | [~] written, typecheck + lint pass |
| 2.2 | Production admin command: already compiled (`node dist/cli/admin-role.js grant …`); wrapped as `deploy/run.sh admin …` | Claude | [x] |
| 2.3 | Healthchecks: API image uses `/health/live`; Caddy proxies `/health/*` | Claude | [~] written |
| 2.4 | `CORS_ORIGINS=https://<APP_DOMAIN>` (the web app is the only allowed browser origin); local dev unchanged | Claude | [~] written |

### Deploy files
| # | Item | Owner | Status |
|---|---|---|---|
| 2.5 | `Dockerfile` — multi-stage, Node 22 alpine, prod deps only, non-root `node` user, healthcheck | Claude | [~] written, not built yet |
| 2.6 | `.dockerignore` | Claude | [~] written |
| 2.7 | `deploy/compose.yml` — caddy, postgres, db-init, redis (password), gotrue, api, mailpit (`prelaunch` profile); size-limited logs; healthchecks; only Caddy publishes ports | Claude | [~] written, `compose config` valid |
| 2.8 | `deploy/Caddyfile` — `/api` (no buffering), `/auth` (prefix stripped), `/health`, assets cached forever + real 404, shell `no-cache`, `/plans` prerendered, security headers, per-release CSP import; `prelaunch` snippet: basic auth (site only, not API/auth), `noindex`, robots, `/mail` → Mailpit | Claude | [~] written, not validated |
| 2.9 | GoTrue env: `API_EXTERNAL_URL=https://<API_DOMAIN>/auth`, JWT issuer the same, `SITE_URL`, `URI_ALLOW_LIST`, SMTP (Mailpit → Brevo), email confirmation on, pinned `v2.197.0` | Claude | [~] written (in compose.yml) |
| 2.9b | Branded auth emails: sender `لمحة AI <noreply@lam7ai.com>`, Arabic subjects (`GOTRUE_MAILER_SUBJECTS_*`), RTL HTML templates for confirm / recovery / email change served from the frontend (`/email-templates/*.html`, `GOTRUE_MAILER_TEMPLATES_*`) | Claude | [~] written: 3 Arabic RTL templates in `public/email-templates/`, subjects in `config.env` |
| 2.9c | Migration placeholder prompt says Lam7a AI (fresh databases only) | Claude | [ ] |
| 2.10 | `deploy/.env.example` (secret names, no values) + `deploy/config.env` (plain settings: domain, mode, SMTP, image) | Claude | [~] written |
| 2.10b | `deploy/gen-secrets.sh` — fills missing secrets with random values (`chmod 600`, single-quoted), never prints or overwrites; asks for the site password and stores only its bcrypt hash | Claude | [~] written |
| 2.10c | `deploy/run.sh` — loads `config.env` + `.env`; `check`, `migrate`, `admin`, `reload-caddy`, any compose command | Claude | [~] written |
| 2.11 | `deploy/server-setup.sh` — Debian 13/Ubuntu; updates + automatic security updates; users `admin` (you, sudo) and `deploy` (CI + Docker, no sudo), SSH keys only, root/password login off; Docker + compose (size-limited logs); ufw 22/80/443; fail2ban; 2 GB swap; `/srv/lam7a/{web/releases,backups,app}`. Only Caddy publishes ports (Docker bypasses ufw for published ports) | Claude | [x] ran on the server |
| 2.12 | `deploy/backup.sh` — `pg_dump -Fc` of the whole DB (app + auth) to `/srv/lam7a/backups`, 14 days; runs before every API deploy; nightly cron line in the script header | Claude | [~] written |
| 2.13 | `.github/workflows/deploy.yml` (backend): push to `main` or manual run from any branch → test → build + push `ghcr.io/seifomran132/superai-backend:<sha>` → approval (`production`) → rsync `deploy/` → `deploy/deploy-api.sh` (backup → postgres/redis → db-init → GoTrue healthy → migrate → up → health) → external check of `api.lam7ai.com/health/ready` | Claude | [~] written, YAML valid |
| 2.14 | `DEPLOY.md` — first install, deploy, rollback, restore, launch switch (§7), rotate secrets, grant admin | Claude | [ ] |

## 3. Frontend repo (`SuperAI_frontend`)

| # | Item | Owner | Status |
|---|---|---|---|
| 3.1 | `.env.production`: `VITE_API_ORIGIN=https://api.lam7ai.com`, `VITE_GOTRUE_URL=https://api.lam7ai.com/auth` (same for pre-launch and launch) | Claude | [~] written, build verified |
| 3.2 | `.env.production` committed (no secrets) | Claude | [~] written |
| 3.2b | `scripts/csp.mjs` runs after `vite build`: hashes the shell's inline scripts into `dist/client/_caddy/csp.caddy` and the API origin into `connect-src` (strict CSP without `unsafe-inline` scripts) | Claude | [~] written, build verified |
| 3.3 | Build fails on missing env; a `LAUNCH=1` build also fails with no contact channel or a placeholder tagline | Claude | [ ] |
| 3.4 | Per-brand favicon + meta description; `robots.txt` (pre-launch: disallow all) | Claude | [ ] |
| 3.5 | `.github/workflows/deploy.yml` (frontend): push to `main` or manual run → checks + build + size → approval (`production`) → rsync to `/srv/lam7a/web/releases/<sha>` → atomic `current` switch → keep 5 → Caddy reload (new CSP) | Claude | [~] written, YAML valid |
| 3.6 | Post-deploy smoke: `lam7ai.com` answers 401 (pre-launch) or 200; API health from outside | Claude | [~] in the workflows |
| 3.7 | Done in F5a/F5b: e2e + a11y sweep, error screens, offline banner, bundle budget (`npm run size`) | Claude | [x] |

## 4. Local rehearsal (your PC, before touching the server)

| # | Item | Owner | Status |
|---|---|---|---|
| 4.1 | Production compose runs on localhost (Caddy on `localhost`, Mailpit as SMTP) | Claude | [ ] |
| 4.2 | Fresh DB: bootstrap-auth → GoTrue migrations → API migrations | Claude | [ ] |
| 4.3 | Sign up → confirm email → complete profile → chat streams through Caddy (not buffered) | Claude | [ ] |
| 4.4 | Admin: grant first admin, add funds, set provider key, model test | Claude | [ ] |
| 4.5 | Refresh on a deep link (`/chat/<id>`, `/admin/users`) serves the app; `/plans` serves the prerendered page | Claude | [ ] |
| 4.6 | Headers checked: no CSP violations in the console, HSTS, caching on `assets/` vs HTML | Claude | [ ] |
| 4.7 | Backup + restore round trip works | Claude | [ ] |
| 4.8 | Rollback: previous frontend release and previous API image restored in one step each | Claude | [ ] |

## 5. Server — first install

| # | Item | Owner | Status |
|---|---|---|---|
| 5.0 | Namecheap DNS → `80.209.232.164`: `@` ✓, `api` ✓, `www` ✓ (on Namecheap's nameservers; public resolvers catch up within about an hour) | You | [x] |
| 5.1 | Server IP: `80.209.232.164` | You | [x] |
| 5.2 | SSH keys created on your PC (personal + `lam7a_deploy`) | You | [x] |
| 5.3 | `server-setup.sh` ran; `ssh admin@… sudo whoami` → root ✓; `ssh deploy@… docker ps` → to confirm | You | [~] |
| 5.4 | GitHub secrets in **both** repos: `DEPLOY_SSH_KEY` (contents of the private `lam7a_deploy` file), `DEPLOY_HOST` (server IP); then delete the private CI key from your PC or keep it with the `.env` copy | You | [ ] |
| 5.5 | GitHub, **both repos**: Settings → Environments → `production` (required reviewer: you); Secrets → `DEPLOY_SSH_KEY` (private `lam7a_deploy` file contents), `DEPLOY_HOST` = `80.209.232.164` | You | [ ] |
| 5.6 | Run `deploy/gen-secrets.sh` on the server (creates `/srv/lam7a/.env`) | You | [x] |
| 5.7 | Copy the server `.env` to your PC with `scp` into the encrypted location (0.7); never email, chat or cloud-sync it unencrypted | You | [ ] |
| 5.8 | `deploy/run.sh check` shows every required variable is set (names only) — also the first step of every API deploy | Claude | [~] |
| 5.9 | Nightly backup cron for `deploy` (`crontab -e`, line in `deploy/backup.sh`) after the first deploy | You | [ ] |

## 6. First production deploy

| # | Item | Owner | Status |
|---|---|---|---|
| 6.0 | **Blockers before the first deploy:** Brevo sender `noreply@lam7ai.com` + new SMTP key in the server `.env` (`GOTRUE_SMTP_PASS`) + click tracking off (1.2) | You | [ ] |
| 6.1 | Backend deploy (approve in GitHub); `https://api.lam7ai.com/health/ready` is 200 | You + Claude | [ ] |
| 6.2 | Frontend deploy; HTTPS certificates for `lam7ai.com`, `www`, `api` issued; `/email-templates/*.html` reachable | You + Claude | [ ] |
| 6.3 | Sign up with your real email: Arabic confirmation email arrives via Brevo (inbox, not spam); link opens the app | You | [ ] |
| 6.4 | Grant your account admin (`deploy/run.sh admin grant …`); set provider keys, prices, plans, modes; default system prompt at `/admin/settings` (Lam7a AI identity, no provider/model names) | You + Claude | [ ] |
| 6.5 | Smoke test: plan via admin, chat in each mode, cost shows, balance updates; password reset email works | You + Claude | [ ] |
| 6.6 | Headers: CSP without console violations, HSTS, caching; `robots.txt` | Claude | [ ] |
| 6.7 | Playwright suite (non-destructive parts) against production | Claude | [ ] |
| 6.8 | Nightly backup cron (5.9) ran; one restore tested into a throwaway container | Claude | [ ] |
| 6.9 | Lighthouse on `/plans` and `/chat` | Claude | [ ] |
| 6.10 | Optional uptime check on `https://api.lam7ai.com/health/ready` (e.g. UptimeRobot) | You | [ ] |
| 6.11 | Off-server backups (0.3) — before real money is in the ledger | You | [ ] |

## 7. After launch (routine)

- [ ] Deploys: merge to `main` → approve in GitHub. Backend before frontend when the API changes. Test locally first (no staging yet).
- [ ] Rollback: frontend → point `current` at the previous release; backend → redeploy the previous image tag (migrations are forward-only; restore from the pre-deploy backup if one must be undone).
- [ ] Weekly: check disk space, backup files, `docker compose ps`.
- [ ] Monthly: restore test into a throwaway local container; review OS updates and image versions (Postgres, Redis, GoTrue, Caddy).
- [ ] Change a secret: edit `/srv/lam7a/.env` → `deploy/run.sh up -d` → update the offline copy.
- [ ] Someone with access leaves: remove their SSH key and GitHub access, rotate the secrets they could read (`SECRETS_ENCRYPTION_KEY` keeps the old value in `SECRETS_ENCRYPTION_PREVIOUS_KEYS`).
- [ ] Server compromised: rotate every secret in `.env`, the deploy SSH key and the AI provider keys.
- [ ] Later: move secrets to Bitwarden Secrets Manager (machine token on the server, `bws run -- docker compose …`); delete `.env` values after the switch.
- [ ] Add a staging environment later if releases get frequent or risky (the compose file and Caddyfile are written so a second site can be added).
