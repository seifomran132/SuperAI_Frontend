# F2 chat states board (desktop)

- Stitch project: `projects/15605789258921234837`
- Screen id: **none (hand-built)**
- Design system: Bayan Design System v2 (`assets/36af8002bd434fa8b291a1daf21f24ce`), source [design/DESIGN.md](../../DESIGN.md)
- Status: **approved by the user, 2026-10-04** (including the proposed copy)

## Provenance

Hand-built HTML in the same tokens as the Stitch screens (like the F1 states board); `desktop.png` is a local render (Edge headless, 1680px). Spec sheet, not a Stitch screen. Card captions and the small English code labels (error codes) are board annotations, not UI.

## Cards (right to left, row by row)

1. Preparing: three-dot pulse + «جاري الإعداد…»; send becomes «إيقاف»
2. Streaming: partial text + blinking caret; «إيقاف»; no cost yet
3. Stopped / cut: muted info line «توقف الرد قبل اكتماله» + cost footer
4. Failed: danger container «تعذّر إكمال الرد. حاول مرة أخرى.» + «إعادة المحاولة»
5. INSUFFICIENT_BALANCE with alternative: amber notice above the composer with estimate and balance; «التبديل إلى الوضع السريع (0.0030$ تقريبًا)»; draft kept; switches only
6. INSUFFICIENT_BALANCE, no alternative: «تواصل معنا لإضافة رصيد» (opens S14)
7. NO_ACTIVE_SUBSCRIPTION: «ليست لديك باقة نشطة. تواصل معنا للاشتراك.» + «تواصل معنا»
8. CONVERSATION_BUSY: «لا يزال الرد السابق قيد الكتابة.»
9. RATE_LIMITED: live countdown text + pill; send disabled
10. CONTEXT_TOO_LONG: error under the composer, danger border
11. MODE_NOT_AVAILABLE (extra): «هذا الوضع غير متاح في باقتك الحالية.»
12. Reopened mid-answer (extra): «جاري كتابة الرد…»

## Checked

- [x] RTL, send arrow mirrored, Plex Sans Arabic, Western digits, no letter-spacing/italics
- [x] Money `0.0120$` in `<bdi dir="ltr">`
- [x] Status = icon + text + color; danger `#BE123C`/`#FFF1F2`, warning `#B45309`/`#FFFBEB`
- [x] No model/provider names, attachments, templates, export, pre-send estimate, payment
- [x] Catalog text used where a code exists

## Copy to approve (differs from or is not in errors.ar.json)

- Busy: «لا يزال الرد السابق قيد الكتابة.» (catalog adds «انتظر حتى ينتهي.»)
- Rate limited: «أرسلت رسائل كثيرة خلال وقت قصير. حاول بعد 30 ثانية.» (catalog: «…انتظر قليلًا ثم حاول مرة أخرى.»; the countdown text replaces it)
- Insufficient balance sentence with estimate: from DESIGN.md §7; catalog is only «رصيدك غير كافٍ لهذه الرسالة.»
- Button «تواصل معنا» in the no-plan notice; «تواصل معنا لإضافة رصيد» as given
- «جاري كتابة الرد…» (card 12), MODE_NOT_AVAILABLE card text is the catalog text

## Implementation notes

- Notices: shared `ChatNotice` with `warning`/`danger` tones, `role="alert"`; the composer keeps the draft on every refusal.
- Rate-limit pill and sentence both use the countdown; announce only at start and end (not each second) for screen readers.
- Stop/send is one button that swaps; the textarea stays editable while streaming.
- Failed card: show cost only when `chargeUsd` is non-zero.
- Failure copy by code: `PROVIDER_*` and `CONTENT_BLOCKED` may use their catalog text instead of the generic line (to decide).

## Update 2026-10-04 (coordinator decisions)

- Card 4 (failed answer): the text is the catalog message for the error code. The card now shows CONTENT_BLOCKED: «تعذّر إكمال الرد بسبب سياسة المحتوى. جرّب صياغة مختلفة.». The fallback when a code has no message is «تعذّر إكمال الرد. حاول مرة أخرى.». This resolves the earlier open question.
- «يكتب…» (sidebar rows, see S4) is neutral muted text with animated dots; card 12 uses the same neutral style.
