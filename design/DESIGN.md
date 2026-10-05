---
name: Bayan Design System v2
colors:
  # Brand layer (swappable per customer)
  brand: '#1E293B'
  brand-hover: '#0F172A'
  on-brand: '#FFFFFF'
  # Neutrals
  background: '#F8FAFC'
  surface: '#FFFFFF'
  surface-muted: '#F1F5F9'
  on-surface: '#0F172A'
  on-surface-muted: '#475569'
  border-subtle: '#E2E8F0'
  border-control: '#7C8799'
  # Modes (fixed layer; assigned per mode key)
  mode-fast: '#0F766E'
  mode-fast-container: '#F0FDFA'
  mode-fast-border: '#99F6E4'
  mode-professional: '#4F46E5'
  mode-professional-container: '#EEF2FF'
  mode-professional-border: '#C7D2FE'
  # Status (fixed layer)
  success: '#15803D'
  success-container: '#F0FDF4'
  warning: '#B45309'
  warning-container: '#FFFBEB'
  warning-border: '#FDE68A'
  danger: '#BE123C'
  danger-container: '#FFF1F2'
  danger-border: '#FECDD3'
  focus-ring: '#4F46E5'
typography:
  display:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 52px
  headline-lg:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 34px
  headline-sm:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 30px
  body-lg:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 30px
  body-md:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 28px
  body-sm:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 22px
  label-sm:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 20px
  code:
    fontFamily: IBM Plex Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
  gutter: 1.25rem
  margin: 1.5rem
---

# Bayan Design System v2

Arabic-first, right-to-left design system for an AI chat product. Calm, focused, trustworthy. This file is the single source of truth for both Stitch and the code (`src/styles/tokens.css`). All color pairs listed here were checked against WCAG 2.1 AA.

## 1. Brand layer (white-label)

The product is sold under different brands. Only these values change per customer:

| Slot | Bayan value |
|---|---|
| Product name | بيان (Arabic), Bayan (Latin) |
| Logo / monogram | Bayan monogram (placeholder until final logo) |
| `brand`, `brand-hover`, `on-brand` | `#1E293B`, `#0F172A`, `#FFFFFF` |
| Font (optional override) | IBM Plex Sans Arabic |
| Contact channels, legal links | Configured per customer |

Never write the brand name into reusable component text; screens show the configured name. Mode colors and status colors are **not** brand slots, so contrast and meaning stay the same for every customer.

## 2. Color roles

- **Brand (`#1E293B` navy ink):** primary buttons, active navigation, the send button, headings accents. White text on it (14.6:1).
- **Canvas `#F8FAFC`, surfaces `#FFFFFF`, muted surface `#F1F5F9`.** Text `#0F172A` (17:1); secondary text `#475569` (7.2:1).
- **Borders:** `#E2E8F0` for decorative card edges only; `#7C8799` for anything interactive (inputs, select, checkbox), which meets the 3:1 non-text contrast rule.
- **Modes.** Each mode the admin creates gets a color pair from the mode palette. The first two:
  - Fast (سريع): text/icon `#0F766E` on `#F0FDFA`, border `#99F6E4` (5.3:1).
  - Professional (احترافي): text/icon `#4F46E5` on `#EEF2FF`, border `#C7D2FE` (5.6:1).
  - Further modes take the next palette entry; never reuse status colors for modes.
- **Status:** success `#15803D` on `#F0FDF4` (4.8:1); warning `#B45309` on `#FFFBEB` (4.8:1); danger `#BE123C` on `#FFF1F2` (5.7:1).
- Color never carries meaning alone: every status also has an icon and text.
- Dark mode is a later phase; do not design dark screens yet.

## 3. Typography

- **IBM Plex Sans Arabic** for all UI and Arabic text, IBM Plex Sans for Latin fallbacks, IBM Plex Mono only for code blocks.
- Body text is **16px** minimum with line height 1.75; nothing below 13px. Arabic reads smaller than Latin at the same size.
- **Never apply letter-spacing to Arabic, never set Arabic in a monospace font, never use italics for Arabic** (they break letter joining and look wrong). Emphasis uses weight 600.
- **Digits:** Western digits (0–9) everywhere, including times, prices and dates, for consistency (configurable later). Never mix Western and Arabic-Indic digits on one screen.
- **Money:** always USD, written like `14.50$` in Arabic text or `$14.50` in isolation; show 2 decimals normally and up to 4 for sub-cent message costs (e.g. `0.0015$`). No other currency symbols.

## 4. Right-to-left rules

- Layout starts at the top-right. **The sidebar is always on the RIGHT edge** and content flows to the left. In HTML with `dir="rtl"`, the sidebar must come first in the flex row (first child renders on the right); never place it after the main area.
- Directional icons mirror (arrows, send, chevrons, back). Non-directional icons do not (lightning, sparkle, clock, check, search).
- Mixed text: each message and field uses automatic direction, so an English sentence inside an Arabic answer still reads correctly.
- **Code blocks are always left-to-right**, left-aligned, with the copy button at the block's top-left.
- Numbers, emails and URLs stay left-to-right inside Arabic sentences.

## 5. Layout

- **Desktop ≥ 1280px:** right sidebar 280px (collapsible to 72px icon rail), chat column centered, max reading width 860px.
- **Tablet 768–1279px:** sidebar collapses to the 72px rail.
- **Mobile < 768px:** sidebar becomes a drawer from the right (menu button top-right); the message box sticks to the bottom above the keyboard with safe-area padding.
- Touch targets at least 44×44px. Spacing scale: 4, 8, 16, 24, 36px.

## 6. Elevation and shape

- Depth by tonal layers and hairline borders, not heavy shadows.
- Assistant message: white card, `#E2E8F0` border. User message: `#F1F5F9`, no border. Message box: white, `#7C8799` border, soft shadow `0 4px 6px -1px rgba(15,23,42,.04)`.
- Dialogs: white, radius 24px, backdrop `rgba(15,23,42,.45)`.
- Radius: 8px buttons and inputs, 16px cards and message bubbles, 24px dialogs and message box, full pills for badges and mode chips.

## 7. Components

### App header (chat)
Conversation title on the right, balance chip and account menu on the left. Nothing else. No version labels, export or settings buttons.

### Balance chip
Neutral pill showing the spendable USD balance, e.g. `الرصيد 14.50$`. Clicking opens the balance page. There is **no "add balance" or "recharge" button**: users request balance from the team through a "طلب رصيد" (request balance) action that opens the contact options. No automatic low-balance threshold; warnings appear only when a message is refused for balance.

### Mode selector
One selector, placed inside the message box (bottom-right). Shows the current mode's label and color; opens a small menu listing the modes on the user's plan, each with its label and one-line description (Fast: quick everyday answers, lower cost. Professional: deeper reasoning for complex tasks, higher cost). Works for any number of modes. The choice applies to the next message only and never rewrites earlier messages. No other mode toggles in the header or sidebar.

### Message box
Multi-line field (placeholder «اكتب رسالتك…»), mode selector, send button (brand navy, arrow mirrors for RTL). While an answer streams, the send button becomes a **Stop** button (إيقاف). Enter sends, Shift+Enter adds a line. Small helper text under it: «تُحتسب تكلفة كل رد من رصيدك حسب الوضع المستخدم.» No attachments, no templates, no cost estimate before sending.

### Messages
- User message: right-aligned bubble, `#F1F5F9`.
- Assistant message: white card with a small mode chip (e.g. «سريع») — never a model or provider name. Full markdown: headings, lists, tables, LTR code blocks with copy.
- After an answer completes, a quiet footer line: `التكلفة 0.0015$ · الرصيد المتبقي 14.48$` plus a copy action. No latency, temperature, or token inspector.
- Timestamps only on hover or as small muted text, Western digits.

### Answer states
- **Preparing:** three-dot pulse with «جاري الإعداد…».
- **Streaming:** text appears progressively with a blinking caret; Stop visible.
- **Stopped by user / cut at length limit (partial):** text kept, with a muted note «توقف الرد قبل اكتماله» and the cost charged.
- **Failed:** danger container «تعذّر إكمال الرد. حاول مرة أخرى.» with a retry button; shows the cost only if non-zero.

### Insufficient balance warning
Appears above the message box only when sending is refused. Warning container (amber). Text: «رصيدك غير كافٍ لهذه الرسالة في الوضع الاحترافي (التكلفة المتوقعة 0.0120$، رصيدك 0.0040$).» Then one button per cheaper mode that fits, e.g. «التبديل إلى الوضع السريع (0.0030$ تقريبًا)». The button only switches the mode; the user presses Send again. If no mode fits: «تواصل معنا لإضافة رصيد» with the request-balance action.

### Other notices (same container style)
- No active plan: «ليست لديك باقة نشطة. تواصل معنا للاشتراك.» + request action.
- Busy: «لا يزال الرد السابق قيد الكتابة.»
- Too many messages: «أرسلت رسائل كثيرة خلال وقت قصير. حاول بعد 30 ثانية.» with a live countdown.

### Sidebar
Brand monogram and name at the top, «محادثة جديدة» primary button, list of recent conversations (title, relative time), then at the bottom: navigation to الرصيد (balance) and الحساب (account). Active conversation: `#F1F5F9` background with a 3px brand bar on the right edge.

### Buttons
Primary: brand fill, white text. Secondary: white with `#7C8799` border. Ghost: text only. Destructive: danger text, confirmation dialog required. One primary button per view.

### Forms
Label above the field, helper/error text below, error in danger color with an icon. Visible focus ring: 2px `#4F46E5` with 2px offset on every interactive element.

### Feedback
Loading skeletons in `#F1F5F9`; empty states with a short headline, one sentence and one action; errors say what happened and what to do next, never technical details.

## 8. Content rules

- Natural Modern Standard Arabic, friendly and short. No English in the UI except code and proper names.
- Users never see provider or model names (no GPT, Claude, Gemini, "v2.4", "deep reasoning model"). They see modes only.
- No claims that aren't true (no "end-to-end encrypted", no speed guarantees).
- Use placeholders in square brackets for anything not decided yet: plan names, prices, contact channels, legal text.

## 9. Motion

Short and functional: 150–200ms ease-out for menus, mode chip and dialogs. Respect reduced motion (no pulse, no caret blink).
