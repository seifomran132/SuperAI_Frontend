# S1 Chat workspace — desktop

- Stitch project: `projects/15605789258921234837` ("Arabic AI Chat Platform")
- Screen: `eade2840998b4f818baf25edf63aa830` ("مساحة المحادثة - بيان (محدث)"), edited from `d5f25d148ec749379fd8145214f00750`
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`), source [design/DESIGN.md](../../DESIGN.md)
- Status: **review round 2, awaiting approval**

## Checked

- [x] RTL layout, send arrow points left
- [x] **Sidebar on the right** (round 3). Stitch first put `<main>` before `<aside>`, which in an RTL flex row puts the sidebar on the left. Fixed in Stitch by an edit; Stitch's HTML export hadn't refreshed yet, so `desktop.html` here was patched the same way (aside first) and checked in the browser: sidebar at x 1160–1440 of 1440. Screenshot to be re-exported from Stitch.
- [x] IBM Plex Sans Arabic loaded; Plex Mono only in the code block; no letter-spacing or italics on Arabic
- [x] Code block is LTR with copy button at its top-left
- [x] One mode selector, inside the message box; mode chip per answer; no model or provider names
- [x] Header: title, balance chip, avatar only (no add-balance, export, settings, version)
- [x] No attachments, templates or pre-send estimate
- [x] Cost + remaining balance footer per answer
- [x] Muted text raised from `#94A3B8` to `#64748B` (remaining `#94A3B8` is on the dark code block, where it passes)
- [x] Bottom padding and fade so the last message isn't hidden by the message box

## Notes for implementation

- **Money and bidi:** the HTML says `0.0015$`, but in the footer it renders as `$0.0015` because of how a neutral `$` resolves inside right-to-left text. In code, every amount goes through one money formatter and is wrapped in `<bdi>` so it renders the same everywhere.
- Mode chip colors come from the mode palette by mode key, not hard-coded per label.
- Timestamps use Western digits from `Intl.DateTimeFormat('ar', { numberingSystem: 'latn' })`.

## Still to design (separate screens / states)

Mode menu open · preparing + streaming with Stop · stopped / cut answer · failed answer · insufficient balance with Switch mode · no cheaper mode (request balance) · no active plan · busy · rate limited (countdown) · new chat empty state · mobile.
