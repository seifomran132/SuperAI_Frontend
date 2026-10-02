# Account unavailable (suspended variant)

- Stitch project: `projects/15605789258921234837`
- Screen id: `30817933bded44c4b5d87cd2520dc350`
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`), source [design/DESIGN.md](../../DESIGN.md)
- Status: **approved by the user, 2026-10-02** (including the proposed copy)

## Checked

- [x] No sidebar; centered column; monogram + name; no footer
- [x] `dir="rtl"`, Plex Sans Arabic, no italics, no `tracking-*`
- [x] Pause icon in a `#FFFBEB` circle (`#B45309`), title «تم إيقاف حسابك مؤقتًا», explanation, «طرق التواصل» as bracketed placeholders (channels come from brand config), one primary «العودة» (to sign-in)
- [x] No add-balance or payment; no English UI text

## Fixes (saved HTML)

- `text-right` -> `text-start`; contact-row icons moved to the start side; button height 44 -> 48px to match the other pages. `desktop.png` is a local render of the fixed HTML (Edge headless), not a Stitch export.

## Deleted variant (not drawn)

Same layout. Title «تم حذف هذا الحساب», text «لم يعد هذا الحساب متاحًا. تواصل معنا إن كنت تعتقد أن هذا خطأ.» (proposed), neutral icon in `#F1F5F9`/`#475569` (deleted is not a warning).

## Implementation notes

- Reached after sign-out on `403 ACCOUNT_SUSPENDED` / `ACCOUNT_DELETED`; `?reason=suspended|deleted`.
- Contact rows become real links (`mailto:` / `https:`) from brand config. Brand name from config; tokens not hex.
