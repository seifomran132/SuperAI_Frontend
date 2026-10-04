# S1 Chat workspace — desktop

- Stitch project: `projects/15605789258921234837` ("Arabic AI Chat Platform")
- Screen: `eade2840998b4f818baf25edf63aa830` ("مساحة المحادثة - بيان (محدث)")
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`), source [design/DESIGN.md](../../DESIGN.md)
- Status: **approved by the user, 2026-10-04** (including the proposed copy)
- Files: `desktop.html` (patched Stitch export), `desktop.png` (**local render**, Edge headless 1440px; not a Stitch screenshot)

## Provenance of this round

`edit_screens` ran twice. The second call succeeded and reported moving `<aside>` before `<main>` (DOM operations insert-before + remove), but `get_screen` still returns the old export (same download URLs; the Stitch screenshot still shows the sidebar on the left). This is the known export lag. So:
- the same structural fix was applied to the saved `desktop.html` (aside first; verified in the browser, sidebar at x 1160-1440);
- the Stitch PNG is stale, so `desktop.png` is a local render of the patched HTML;
- re-export from Stitch when it catches up and diff against this file.

## Changes in this round

- Sidebar is the first flex child (renders on the right).
- Logical classes: `border-l` -> `border-e`, active bar `right-0 rounded-l-full` -> `start-0 rounded-e-full`, `pr-*` -> `ps-*`, table `text-right` -> `text-start`, `tracking-normal` removed.
- Header avatar is now a button (`aria-haspopup="menu"`, `aria-label="قائمة الحساب"`) with a chevron: opens the account menu (see [f2-menus](../f2-menus/)).
- Money wrapped in `<bdi dir="ltr">` so `0.0015$` renders as written (before, it rendered `$0.0015`).
- Sidebar bottom keeps «الرصيد» and «الحساب».

## Checked

- [x] RTL, send arrow points left, sidebar on the right
- [x] IBM Plex Sans Arabic; Plex Mono only in the code block; no letter-spacing or italics on Arabic
- [x] Code block LTR, copy button top-left
- [x] One mode selector inside the message box; mode chip per answer; no model/provider names
- [x] Header: title, balance chip, account menu button only
- [x] No attachments, templates, pre-send estimate, export, add-balance
- [x] Cost + remaining balance footer per answer
- [x] Contrast: muted text `#64748B`/`#475569`; `#94A3B8` only on the dark code block

## Implementation notes

- Money: one formatter + `<bdi dir="ltr">` (via `<Money>`).
- Mode chip colors by position from the mode palette.
- Timestamps: `Intl.DateTimeFormat('ar', { numberingSystem: 'latn' })`.
- The cost footer shows only for answers sent in this session (backend gap, deferred).
- The saved HTML uses Tailwind CDN hex values as a prototype; code uses tokens.

## States

All other states: [f2-chat-states](../f2-chat-states/), [f2-menus](../f2-menus/), [s2-new-chat](../s2-new-chat/), [s3-chat-mobile](../s3-chat-mobile/), [s4-conversation-list](../s4-conversation-list/).
