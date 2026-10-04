# S3 Chat mobile (390px)

- Stitch project: `projects/15605789258921234837`
- Screen id: **none (hand-built)**; Stitch mobile generation was not attempted after desktop timeouts (same as F1 S5 mobile).
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`)
- Status: **approved by the user, 2026-10-04** (including the proposed copy)

## Frames

1. Chat: header (menu button on the right, truncated title, balance chip on the left), messages with the assistant cost footer, composer pinned to the bottom with mode chip and send.
2. Drawer open from the right: close button, brand, «محادثة جديدة», conversation list (active row with bar on the right), bottom links «الرصيد» / «الحساب». Chat dimmed behind.

## Checked

- [x] Menu button first in the header row (right in RTL); drawer slides from the right
- [x] Touch targets >= 44px; no horizontal overflow
- [x] Money `<bdi dir="ltr">`, Western digits, logical classes
- [x] No account menu on mobile header (avatar omitted for space): account is reached from the drawer link «الحساب»; sign-out location is an open question

## Implementation notes

- Drawer: Radix Dialog; closes on route change, Esc, backdrop.
- Composer: `100dvh` layout, `padding-bottom: env(safe-area-inset-bottom)`, helper text hidden on mobile to save space.
- Under 768px the sidebar leaves the layout entirely; 768-1279px uses the 72px rail (not designed here).

## Update 2026-10-04 (coordinator decisions)

- Drawer bottom now has «تسجيل الخروج» under «الرصيد» and «الحساب»: ghost button, danger text, log-out icon mirrored for RTL. This answers the sign-out open question for mobile.
- Tablet: no separate design. Below 1024px the sidebar becomes this same right-side drawer (so the 72px rail is not used).
