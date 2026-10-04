# F2 menus: mode menu and account menu (desktop)

- Stitch project: `projects/15605789258921234837`
- Screen id: **none (hand-built board)**
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`)
- Status: **approved by the user, 2026-10-04** (including the proposed copy)

## Cards

1. Mode menu (opens above the composer, anchored at the mode chip on the right): label, one-line description, colour dot per mode (by position), check on the current one. Two modes shown; the menu works for any number.
2. Account menu (opens under the header avatar, on the left): avatar, name, email (LTR), «الرصيد» (with balance), «الحساب», divider, «تسجيل الخروج».

## Checked

- [x] No model/provider names; descriptions are mode copy from DESIGN.md §7
- [x] Rows >= 44px; `role="menu"`/`menuitemradio`; colour never alone (check mark + label)
- [x] Money `<bdi dir="ltr">`; email `dir="ltr"`
- [x] No settings, upgrade or add-balance entries

## Proposed copy

Descriptions come from the mode API in production (placeholders here): «إجابات سريعة للاستخدام اليومي، بتكلفة أقل.» / «تفكير أعمق للمهام المعقدة، بتكلفة أعلى.» Name/email are sample data.

## Implementation notes

- Use shadcn DropdownMenu (account) and a Radix Popover/RadioGroup menu (modes); keyboard: arrows, Enter, Esc; focus returns to the trigger.
- Sign out: no confirmation dialog (non-destructive); clears the session and goes to /sign-in.
- Account menu is anchored `end` (left in RTL); mode menu `start`.
