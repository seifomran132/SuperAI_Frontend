# F11 — Landing page and legal pages

**Status:** Home page built 2026-11-09 from approved S13 on `landing-page`; share image, favicon, `robots.txt` and sitemap added 2026-11-10. Terms and Privacy drafted 2026-11-10 for Lam7a, Egypt ([terms](../legal/lam7a/terms.md), [privacy](../legal/lam7a/privacy.md)); **on hold until the company is registered and a lawyer reviews them** (user, 2026-11-10). Meanwhile a short interim privacy notice is live at `/privacy` (prerendered, text in `landing.privacy.*`), linked from the footer; the terms link stays hidden.
**Goal:** a visitor to `/` understands what the product is, what the modes and the shared balance mean, and can sign up or see plans. Search engines and link previews get real content.
**Backend:** none needed; `GET /plans` and `GET /modes` already exist.

## 1. Decisions (2026-11-09)

1. **Promise:** Arabic-first, one balance, the right mode for each task.
2. **Audience:** Arabic speakers who want one AI assistant in their own language rather than several separate tools.
3. **Tagline:** option 1 in §7, chosen 2026-11-09; it lives in `brand.tagline`, not in the page.
4. **Terms and Privacy:** build the pages now and publish only once the text is approved. Claude can draft from what the product does; a lawyer reviews it. Needs the legal entity name and country.
5. **Sequencing:** design and build now. The page does not go public until the deploy key and Brevo key are rotated and backups run with one tested restore (FRONTEND_PLAN §4b items 3 and 4).

## 2. Pages

| Page | Route | Rendering | Notes |
|---|---|---|---|
| Home (S13) | `/` | Prerendered | Replaces the redirect |
| Terms, Privacy | `/terms`, `/privacy` | Prerendered | One simple shared layout, text per brand |
| Plans | `/plans` | Prerendered (exists) | Linked from home; no change |

## 3. Home page content, in order

1. **Hero:** brand, tagline, main button «إنشاء حساب», sign-in link.
2. **What it does:** a real chat screenshot or a built mock-up, in Arabic.
3. **Modes:** what each is good for. Labels come from `GET /modes` or stay generic; never provider or model names.
4. **One shared balance:** how it works and how it is used across modes.
5. **Plans:** live prices from `GET /plans`, through `<Money>`, linking to `/plans`. Prices are never written into the copy or the prerendered HTML, so they cannot go stale. Needs loading and error states; on error the section still links to `/plans`.
6. **How to get a plan:** contact the team through the brand's channels. No checkout, add-balance or top-up.
7. **FAQ and footer:** contact and legal links from the brand config.

**Content rules:** no invented testimonials, user counts or logos. No per-answer cost or pre-send estimate. No speed promises until the fast-models item (§4b item 2) is closed. Every string through i18next; `{{brandName}}` for the name, so a white-label customer gets their own page.

## 4. Technical

- **Prerender:** add `/`, `/terms` and `/privacy` to `pages` in `vite.config.ts`. Replace `src/routes/index.tsx` with a thin route rendering the page from a new `src/features/landing` feature.
- **Signed-in visitors:** `/` still goes to `/chat` for them, but a prerendered page must not read the session while rendering, so the check runs after mount. Measure any flash of the landing page on a production build, and confirm React #418 is gone. Keep the redirect out of `beforeLoad` unless it hydrates cleanly.
- **Sign-in and guests:** `redirectFromHome` no longer sends signed-out visitors to `/sign-in`; update it and its tests.
- **Hosting:** verify `/` is served by the prerendered page under the Caddy rule (`try_files {path} {path}/index.html /_shell.html`) and that `scripts/csp.mjs` hashes its inline scripts.
- **Bundle:** its own budget in `scripts/check-bundle.mjs`. No chat, admin or chart code in this page's first load.
- **Search and sharing:** done 2026-11-10. Title and description from the tagline; `og:image` (`public/brand/<brand>/share.png`, the hero at 1200×630), canonical and `og:url` from `VITE_SITE_ORIGIN`; per-brand icons and `favicon.ico` (`scripts/brand-images.mjs`, re-run after the hero or brand colors change); `robots.txt` and `sitemap.xml` written at build by `scripts/site-files.mjs`.
- **Going public:** if the server's `prelaunch` site mode (basic auth, `noindex`) is on, it has to be switched off for this page to be reachable and indexed.
- **Sign-up:** add the terms checkbox with brand-config links once the legal pages are published (F1 decision). Fill `brand.legal`.
- **Mobile app:** the mobile target skips the landing page (§7b).
- **Docs:** remove "`/` redirects" from `CLAUDE.md` launch scope when this ships; add cases to `MANUAL_TEST_CASES.md`, which lists the landing page as not covered.

## 5. States and quality

Plans section: loading, error. Signed-in redirect: no broken intermediate screen. Right-to-left with logical classes, 44px targets, visible focus, reduced motion respected, Western digits, contrast per DESIGN.md.

## 6. Order of work

1. Pick the tagline (§7). Done.
2. Design S13, desktop and mobile; the user approves. Done (hand-built: Stitch timed out).
3. Build home, legal layout, redirect, search basics, bundle budget.
4. Unit tests, then Playwright on the five targets: content in the HTML, axe, RTL, overflow, signed-in redirect, no #418.
5. Legal pages once the text is approved; their footer links appear when `brand.legal` is filled.
6. Review, then deploy to `main`. Public only after §1 item 5 and approved legal text.

## 7. Tagline proposals (`brand.tagline`)

| # | Arabic | English |
|---|---|---|
| 1 (recommended) | مساعدك الذكي بالعربية، لكل مهمة وضعها المناسب | Your AI assistant in Arabic, with the right mode for every task |
| 2 | ذكاء اصطناعي يفهمك بلغتك | AI that understands you, in your language |
| 3 | رصيد واحد، ووضع مناسب لكل مهمة | One balance, the right mode for every task |
| 4 | اسأل بالعربية، وأنجز أكثر | Ask in Arabic, get more done |
| 5 | جوابك في لمحة | Your answer, at a glance |

Option 5 plays on the name and promises speed, so it fits only after the fast-models item is closed, and it would not carry over to a white-label brand without rewriting.
