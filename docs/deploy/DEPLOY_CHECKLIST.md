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

### Two modes of the same production server
| | Pre-launch (now) | Launched |
|---|---|---|
| Address | `lam7ai.com` + `api.lam7ai.com` (unannounced) | same |
| Access | Basic-auth password on the whole site | Public |
| Email | Mailpit on the server (caught, read in its web UI) | Brevo (real delivery) |
| Search engines | `noindex` | Indexed |
| Data | Test data, wiped at launch | Real users |

---

## 0. Decisions and accounts

| # | Item | Owner | Status |
|---|---|---|---|
| 0.1 | Server OS: **Debian 13**, IP `80.209.232.164` | You | [x] |
| 0.2 | Email: pre-launch → Mailpit; launch → Brevo | You | [x] decided |
| 0.3 | Off-server backup target — **later**; until then nightly `pg_dump` stays on the server only | You | [ ] later |
| 0.4 | Only production at the start; pre-launch behind basic auth | You | [x] decided |
| 0.5 | GitHub repos configured: `seifomran132/SuperAI_frontend`, `seifomran132/SuperAI_Backend` | You | [x] |
| 0.6 | Secrets: `/srv/lam7a/.env` on the server for now; Bitwarden Secrets Manager later | You | [x] decided |
| 0.7 | Offline copy of the server `.env`: your personal PC, in an encrypted location (BitLocker drive or a password-protected 7-Zip/VeraCrypt file), plus a second copy (e.g. USB drive) | You | [x] decided |

## 1. Launch inputs (needed before going public, not before pre-launch)

| # | Item | Owner | Status |
|---|---|---|---|
| 1.1 | Brand **لمحة AI / Lam7a AI**; domain **lam7ai.com** (app) + **api.lam7ai.com** (API), used from pre-launch | You | [x] |
| 1.2 | Brevo: account created; SMTP `smtp-relay.brevo.com:587` (STARTTLS), login `bcc942001@smtp-brevo.com` (goes in `deploy/config.env`). DNS verified public: `brevo-code` TXT ✓, DKIM `brevo1`/`brevo2` ✓, DMARC `p=none` ✓; SPF to merge (`include:spf.brevo.com` into the existing record). Still to do: sender `no-reply@lam7ai.com`, new SMTP key (server `.env` as `GOTRUE_SMTP_PASS`), click tracking off | You | [~] |
| 1.3 | Contact channels (WhatsApp / email / phone) — the only way users get a plan or balance | You | [ ] |
| 1.4 | Tagline (ar + en) | You | [ ] |
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
| 2.9b | Branded auth emails: sender `لمحة AI <no-reply@lam7ai.com>`, Arabic subjects (`GOTRUE_MAILER_SUBJECTS_*`), RTL HTML templates for confirm / recovery / email change served from the frontend (`/email-templates/*.html`, `GOTRUE_MAILER_TEMPLATES_*`) | Claude | [ ] |
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
| 5.6 | Run `deploy/gen-secrets.sh` on the server (creates `/srv/lam7a/.env`, sets the pre-launch site password) | You | [ ] |
| 5.7 | Copy the server `.env` to your PC with `scp` into the encrypted location (0.7); never email, chat or cloud-sync it unencrypted | You | [ ] |
| 5.8 | `deploy/run.sh check` shows every required variable is set (names only) — also the first step of every API deploy | Claude | [~] |
| 5.9 | Nightly backup cron for `deploy` (`crontab -e`, line in `deploy/backup.sh`) after the first deploy | You | [ ] |

## 6. Pre-launch (private, on `lam7ai.com` behind the site password)

| # | Item | Owner | Status |
|---|---|---|---|
| 6.1 | First backend deploy; `/health/ready` is 200 | Claude | [ ] |
| 6.2 | First frontend deploy; HTTPS certificate issued | Claude | [ ] |
| 6.3 | Grant admin to your account; set provider keys; modes ready | You + Claude | [ ] |
| 6.4 | Sign-up email appears in Mailpit (`/mail`) and its link opens the app | You | [ ] |
| 6.5 | Playwright suite against the server | Claude | [ ] |
| 6.6 | Manual test cases ([MANUAL_TEST_CASES.md](../testing/MANUAL_TEST_CASES.md)) | You | [ ] |
| 6.7 | Lighthouse on `/plans` and `/chat` | Claude | [ ] |
| 6.8 | Nightly backup ran; one restore tested | Claude | [ ] |
| 6.9 | Fixes from 6.5–6.8 deployed and re-checked | Claude | [ ] |
| 6.10 | Final `frontend-reviewer` pass; you approve the launch | Claude → You | [ ] |

## 7. Launch (switch to public)

| # | Item | Owner | Status |
|---|---|---|---|
| 7.1 | Section 1 complete (domain, Brevo, brand, contact, tagline, copy) | You | [ ] |
| 7.2 | (moved to 5.0 — DNS is needed from the first deploy) | — | — |
| 7.3 | `deploy/config.env`: domain and `LAUNCH=1` (removes basic auth, `noindex` and Mailpit); Brevo SMTP key added to the server `.env` (1.2) | You + Claude | [ ] |
| 7.4 | **Wipe test data**: back up, then recreate the database (fresh migrations) so no test users or balances remain | Claude (you approve) | [ ] |
| 7.5 | Deploy backend then frontend (approve in GitHub) | You | [ ] |
| 7.6 | HTTPS on the domain; HSTS on; `robots.txt` allows indexing | Claude | [ ] |
| 7.7 | Grant the admin; set provider keys, prices, plans and modes; set the default system prompt at `/admin/settings` (Lam7a AI identity, no provider/model names) | You + Claude | [ ] |
| 7.8 | Smoke test: sign up with a real email (arrives via Brevo, not in spam), get a plan via admin, chat in each mode, check balance and cost | You + Claude | [ ] |
| 7.9 | Optional uptime check on `/health/ready` (e.g. UptimeRobot) | You | [ ] |
| 7.10 | Off-server backups set up (0.3) — before real money is in the ledger | You | [ ] |

## 8. After launch (routine)

- [ ] Deploys: merge to `main` → approve in GitHub. Backend before frontend when the API changes. Test locally first (no staging yet).
- [ ] Rollback: frontend → point `current` at the previous release; backend → redeploy the previous image tag (migrations are forward-only; restore from the pre-deploy backup if one must be undone).
- [ ] Weekly: check disk space, backup files, `docker compose ps`.
- [ ] Monthly: restore test into a throwaway local container; review OS updates and image versions (Postgres, Redis, GoTrue, Caddy).
- [ ] Change a secret: edit `/srv/lam7a/.env` → `deploy/run.sh up -d` → update the offline copy.
- [ ] Someone with access leaves: remove their SSH key and GitHub access, rotate the secrets they could read (`SECRETS_ENCRYPTION_KEY` keeps the old value in `SECRETS_ENCRYPTION_PREVIOUS_KEYS`).
- [ ] Server compromised: rotate every secret in `.env`, the deploy SSH key and the AI provider keys.
- [ ] Later: move secrets to Bitwarden Secrets Manager (machine token on the server, `bws run -- docker compose …`); delete `.env` values after the switch.
- [ ] Add a staging environment later if releases get frequent or risky (the compose file and Caddyfile are written so a second site can be added).
