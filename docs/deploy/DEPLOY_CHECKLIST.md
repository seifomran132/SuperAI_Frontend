# Deployment checklist — frontend and backend

One Linux VPS (fresh Debian 13 or Ubuntu 24.04, 3 vCPU / 8 GB / 100 GB) runs **one environment — production** in Docker:
Caddy (HTTPS) → `/api/*` NestJS · `/auth/*` GoTrue · `/health/*` API health · `/*` static frontend; Postgres and Redis internal only.
No staging at the start. Before launch, production runs **privately** (pre-launch mode) and is wiped clean at launch.
Plan: [docs/plans/F5_HARDENING.md](../plans/F5_HARDENING.md) §4–6.

**Owner:** **You** = the user (accounts, server access, secrets, approvals) · **Claude** = files, code, verification.
Tick a box only when it has been checked, not just done.

### Secrets
- **Bitwarden Secrets Manager** (project `superai-prod`) holds every app secret. The server reads them with a read-only **machine token** at deploy time: `bws run --project-id … -- docker compose up -d`. No `.env` file of values on the server.
- **Bitwarden Password Manager** (same account, collection "Production") holds human logins, SSH keys, the machine token and an offline copy of `SECRETS_ENCRYPTION_KEY`.
- GitHub holds only `DEPLOY_SSH_KEY` and `DEPLOY_HOST`. Claude never sees secret values; scripts create and read them on the server.
- Local rehearsal uses a plain `.env` (no Bitwarden needed on your PC).

### Two modes of the same production server
| | Pre-launch (now) | Launched |
|---|---|---|
| Address | `<server-ip>.sslip.io` (no domain needed) | your domain |
| Access | Basic-auth password on the whole site | Public |
| Email | Mailpit on the server (caught, read in its web UI) | Brevo (real delivery) |
| Search engines | `noindex` | Indexed |
| Data | Test data, wiped at launch | Real users |

---

## 0. Decisions and accounts

| # | Item | Owner | Status |
|---|---|---|---|
| 0.1 | Server OS: Debian 13 (recommended) or Ubuntu 24.04 LTS — setup script supports both | You | [ ] |
| 0.2 | Email: pre-launch → Mailpit; launch → Brevo | You | [x] decided |
| 0.3 | Off-server backup target — **later**; until then nightly `pg_dump` stays on the server only | You | [ ] later |
| 0.4 | Only production at the start; pre-launch behind basic auth | You | [x] decided |
| 0.5 | GitHub repos configured: `seifomran132/SuperAI_frontend`, `seifomran132/SuperAI_Backend` | You | [x] |
| 0.6 | Secrets: Bitwarden Secrets Manager + Password Manager | You | [x] decided |
| 0.7 | Bitwarden account with 2FA (authenticator app); recovery code stored offline | You | [ ] |
| 0.8 | Organization "SuperCardAI": Password Manager collection "Production"; Secrets Manager project `superai-prod` | You | [ ] |
| 0.9 | Machine account `vps-prod` with **read** access to `superai-prod` only; its access token saved in the "Production" collection | You | [ ] |
| 0.10 | Personal access for secret creation: a second machine account `setup` with **write** access, used once by `gen-secrets` then revoked | You | [ ] |

## 1. Launch inputs (needed before going public, not before pre-launch)

| # | Item | Owner | Status |
|---|---|---|---|
| 1.1 | Brand: **لمحة AI / Lam7a AI**, domain **lam7ai.com** (app at the apex or `app.lam7ai.com` — decide before DNS) | You | [x] chosen |
| 1.2 | Brevo: account, add the domain, publish its SPF/DKIM/DMARC DNS records, create an SMTP key and add it as `GOTRUE_SMTP_PASS` in `superai-prod` | You | [ ] |
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
| 2.1 | `app.set('trust proxy', 1)` so rate limits and logs see the real client IP behind Caddy | Claude | [ ] |
| 2.2 | Production admin command (compiled `dist/cli/admin-role.js`, no `tsx`) | Claude | [ ] |
| 2.3 | Docker healthcheck and deploy use `/health/live` and `/health/ready` (exist today, outside `/api`) | Claude | [ ] |
| 2.4 | `CORS_ORIGINS` set to the app origin (same origin; local dev unchanged) | Claude | [ ] |

### Deploy files
| # | Item | Owner | Status |
|---|---|---|---|
| 2.5 | `Dockerfile` — multi-stage, Node 22 alpine, prod deps only, non-root, `node dist/main.js` | Claude | [ ] |
| 2.6 | `.dockerignore` | Claude | [ ] |
| 2.7 | `deploy/compose.yml` — caddy, postgres, redis, api, gotrue, mailpit (pre-launch profile); log size limits; healthchecks; only Caddy has public ports | Claude | [ ] |
| 2.8 | `deploy/Caddyfile` — routes, `/auth` prefix strip, no buffering on chat stream, caching, security headers; pre-launch: basic auth + `noindex` + `/mail` → Mailpit UI | Claude | [ ] |
| 2.9 | GoTrue env: `API_EXTERNAL_URL=<origin>/auth`, `SITE_URL`, `URI_ALLOW_LIST`, SMTP (Mailpit → Brevo), email confirmation on, pinned `v2.197.0` | Claude | [ ] |
| 2.9b | Branded auth emails: sender `لمحة AI <no-reply@lam7ai.com>`, Arabic subjects (`GOTRUE_MAILER_SUBJECTS_*`), RTL HTML templates for confirm / recovery / email change served from the frontend (`/email-templates/*.html`, `GOTRUE_MAILER_TEMPLATES_*`) | Claude | [ ] |
| 2.9c | Migration placeholder prompt says Lam7a AI (fresh databases only) | Claude | [ ] |
| 2.10 | `deploy/.env.example` — every variable with no values; marks each as secret (Bitwarden) or plain config (`deploy/config.env`, committed) | Claude | [ ] |
| 2.10b | `deploy/gen-secrets.sh` — generates random values and creates them in `superai-prod` with `bws secret create` (never prints them); skips ones that exist | Claude | [ ] |
| 2.10c | `deploy/run.sh` — wraps every compose command in `bws run --project-id … --`; fails clearly if the token or a required secret is missing (names only, never values) | Claude | [ ] |
| 2.11 | `deploy/server-setup.sh` — updates, unattended upgrades, `deploy` user, SSH keys only, ufw 22/80/443 (and Docker can't bypass it), Docker + compose, `bws` CLI (pinned version, checksum), fail2ban, 2 GB swap, `/srv/lam7a/` | Claude | [ ] |
| 2.12 | `deploy/backup.sh` + cron — nightly `pg_dump`, 14 days on the server; off-server copy added later (0.3) | Claude | [ ] |
| 2.13 | `.github/workflows/deploy.yml` — on `main` with approval: test → build image → push `ghcr.io` → SSH → backup → migrate → `up -d api` → wait for `/health/ready` | Claude | [ ] |
| 2.14 | `DEPLOY.md` — first install, Bitwarden setup, deploy, rollback, restore, launch switch (§7), rotate secrets, revoke the machine token, grant admin | Claude | [ ] |

## 3. Frontend repo (`SuperAI_frontend`)

| # | Item | Owner | Status |
|---|---|---|---|
| 3.1 | Same-origin config: API at `<origin>/api`, GoTrue at `<origin>/auth` (relative values allowed in `src/lib/env.ts`) | Claude | [ ] |
| 3.2 | `.env.production` template (no secrets — the frontend has none) | Claude | [ ] |
| 3.3 | Build fails on missing env; a `LAUNCH=1` build also fails with no contact channel or a placeholder tagline | Claude | [ ] |
| 3.4 | Per-brand favicon + meta description; `robots.txt` (pre-launch: disallow all) | Claude | [ ] |
| 3.5 | `.github/workflows/deploy.yml` — on `main` with approval: checks → build → rsync to `/srv/lam7a/web/releases/<sha>` → switch `current` → keep 5 | Claude | [ ] |
| 3.6 | Post-deploy smoke e2e (sign-in page, `/plans`, health) | Claude | [ ] |
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
| 5.1 | Note the server IP (provider backups optional, see 0.3) | You | [ ] |
| 5.2 | Run `deploy/server-setup.sh` as root once | You | [ ] |
| 5.3 | Add your SSH public key for `deploy`; confirm password and root login are off | You | [ ] |
| 5.4 | Create a deploy SSH key pair; public key on the server, private key as GitHub secret `DEPLOY_SSH_KEY` in **both** repos; `DEPLOY_HOST` secret | You | [ ] |
| 5.5 | GitHub environment `production` in both repos with required reviewer = you | You | [ ] |
| 5.6 | Put the `vps-prod` token in `/srv/lam7a/.bws-token` (`chmod 600`, owner `deploy`) | You | [ ] |
| 5.7 | Run `gen-secrets.sh` once with the `setup` token (creates all secrets + the pre-launch basic-auth password), then revoke the `setup` machine account | You | [ ] |
| 5.8 | Copy `SECRETS_ENCRYPTION_KEY` from Secrets Manager into the Password Manager "Production" collection (offline safety copy) | You | [ ] |
| 5.9 | `deploy/run.sh config` shows every required secret is present (names only) | Claude | [ ] |

## 6. Pre-launch (private, on `<server-ip>.sslip.io`)

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
| 7.2 | DNS `A` record for the domain → server IP | You | [ ] |
| 7.3 | `deploy/config.env`: domain and `LAUNCH=1` (removes basic auth, `noindex` and Mailpit); Brevo SMTP key already in `superai-prod` (1.2) | You + Claude | [ ] |
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
- [ ] Change a secret: edit it in Secrets Manager → `deploy/run.sh up -d` on the server. Nothing to copy by hand.
- [ ] Someone with access leaves: remove them from the organization, rotate the `vps-prod` token, rotate secrets they could read (`SECRETS_ENCRYPTION_KEY` keeps the old value in `SECRETS_ENCRYPTION_PREVIOUS_KEYS`).
- [ ] Server compromised: revoke `vps-prod` in Bitwarden first, then rotate every secret in `superai-prod`.
- [ ] Add a staging environment later if releases get frequent or risky (the compose file and Caddyfile are written so a second site can be added).
