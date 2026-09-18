# 04 — QA, Usability & Edge-Case Report

**Author:** Maya (UX & QA Lead) · with Felix on conformance
**Date:** 2026-09-18
**Method:** live instrumentation of both applications in Chrome at 390×844 and
1440×900. Every number below was measured in the browser, not read off the
source.

---

## 1. What holds up

Starting here because it is unusual and it changes where the effort should go.

| Test | Result |
|---|---|
| Horizontal overflow at 390px — discover, help, login | **None on any screen** |
| Layout integrity at 1440×900 | Holds; the phone frame is deliberate and correct |
| Dark mode across every surface | Correct; no unreadable pairings found |
| Console errors on cold load | None, either app |
| Empty states | Present and worded well — "Nobody's waiting right now", "Nothing waiting on you" |

**Maya:** I came to break the responsive layout and could not. `contain: layout`
on the phone frame is doing real work — fixed-position children anchor to the
frame rather than escaping to the viewport, which is the bug I expected to find
and did not. Whoever wrote that comment understood the problem.

So this report is not about layout. It is about the details that make software
feel finished.

---

## 2. Friction log

### 🔴 Blocker — conformance failures

| # | Finding | Evidence | SC |
|---|---|---|---|
| B1 | **Keyboard focus is invisible on every input.** `outline-none` appears 28 times; `focus-visible:` zero times. The only indicator is a 1px border colour change. | `input.directive.ts` | 2.4.11 |
| B2 | **93 of 124 form controls have no programmatic label.** 102 `<label>` elements exist; only 23 are associated by `for`/`id`, 8 wrap their control, and **zero** use `aria-label`. | Static audit | 1.3.1, 4.1.2 |

**Maya:** B2 is the one I would escalate. Tapping a label does not focus its
field — that is not an accessibility nicety, it is a thing everybody does on a
phone, and right now it does nothing on 93 fields.

### 🟠 Major — measured, user-visible

| # | Finding | Evidence |
|---|---|---|
| M1 | **Touch targets below the 24×24 minimum.** Artist login: "Forgot password?" `115×17`, "Sign up" `50×17`. Customer help: Back button `29×16`. | Live measurement · SC 2.5.8 |
| M2 | **8px text on the discover screen.** The "New" badge renders at **8px**; "1 review" / "0 reviews" at 10px. Below the threshold where uppercase letterforms stay legible on a phone at arm's length. | Live measurement |
| M3 | **54 hand-rolled loading skeletons** across 19 files, while `bedge-skeleton` — built for exactly this — is used 4 times. Shapes and radii differ between screens, so the app shimmers differently depending on where you are. | Static audit |
| M4 | **Two different input styles.** `InputDirective` and `.bedge-input` disagree on padding (`px-3.5`/`px-3`), size (`text-[15px]`/`text-sm`), focus colour (`ink`/`gray-400`) and placeholder shade. Which one you get depends on which app you are in. | Static audit |
| M5 | **Thin long-text defences.** 20 `truncate`, 2 `line-clamp`, 1 `break-words` against 349 `<p>` and 282 `<span>`. Artist names, service names and store names are all user-supplied and mostly unguarded. | Static audit |

**M1 note, in fairness:** the customer help Back button is **mine**, added
earlier this session. It is a 16px-tall text link where it should be a proper
target. Reporting my own regression rather than quietly fixing it, because the
pattern — an underlined text link doing the job of a button — recurs across
both apps.

### 🟡 Polish

| # | Finding |
|---|---|
| P1 | **Prices jitter between rows.** Inter's default figures are proportional; no `tabular-nums` anywhere. Every list of money visibly shifts column-to-column. |
| P2 | **Seven shadow treatments**, three of them arbitrary inline values that do not participate in dark mode. |
| P3 | **`rounded-md` (6px)** on three elements, off the project's own 8/12/16 scale. |
| P4 | **Both PWAs fire a 401 on cold load** (`auth/refresh` with no session). Harmless, but it buries real 401s. |
| P5 | **239 arbitrary pixel font sizes**, 78 of which duplicate existing tokens exactly. |

---

## 3. Edge-case scenarios and expected behaviour

For regression-testing the redesign. Each has a pass condition, not a vibe.

### 3.1 Text overflow

| # | Scenario | Pass condition |
|---|---|---|
| T1 | Artist name of 120 characters on a discover card | Truncates with ellipsis; card height unchanged; no horizontal scroll |
| T2 | Service name of 200 characters in the booking funnel | Wraps to at most 2 lines then clamps; the price stays visible and on the same line it started |
| T3 | Store name of 80 characters in the deposit-instructions block | Wraps; the account number never wraps mid-number |
| T4 | Arabic / RTL text in a bio (schema supports `bio_ar`) | Renders RTL without breaking the surrounding LTR layout |
| T5 | A single 60-character unbroken token (no spaces) in a review | `break-words` engages; the card does not widen |

### 3.2 Empty, loading and error

| # | Scenario | Pass condition |
|---|---|---|
| E1 | Artist with zero services opens the booking funnel | Empty state, not a blank panel with a dead CTA |
| E2 | Discovery with network throttled to Slow 3G | Skeletons matching the final layout's shape; **no layout shift when data lands** |
| E3 | API returns 500 mid-list | Inline error with a retry affordance; already-rendered rows are not blanked |
| E4 | Offline, then back online | Cached shell renders; a retry recovers without a reload |
| E5 | Empty search result | "Nothing matched X" naming the query, not a bare empty box |

### 3.3 Interaction stress

| # | Scenario | Pass condition |
|---|---|---|
| I1 | Double-tap "Send report" / "Confirm" | Exactly one request. Button disables on first press |
| I2 | Rapid tab-switching in admin during a load | No stale render; the late response for the abandoned tab is discarded |
| I3 | Submit a form, navigate away before the response | No console error; no `.set()` on a destroyed component |
| I4 | Keyboard-only traversal of the booking funnel | Every control reachable; **a visible focus indicator at every stop**; no trap outside a dialog |
| I5 | Escape inside every modal | Closes it and returns focus to the element that opened it |
| I6 | Screen reader on My Bookings | Announces "list, N items"; each row is one coherent item |

### 3.4 Viewport

| # | Scenario | Pass condition |
|---|---|---|
| V1 | 320px (iPhone SE) | No horizontal scroll; all targets ≥ 24×24 |
| V2 | 390×844 | Baseline — currently passes for overflow |
| V3 | 1440×900 | Phone frame centred; fixed children anchored to the frame |
| V4 | 200% browser zoom | No content loss, no two-dimensional scrolling — SC 1.4.10 |
| V5 | `prefers-reduced-motion: reduce` | Skeleton pulse and transitions suppressed |

---

## 4. Ranked remediation

| Priority | Item | Report |
|---|---|---|
| 🔴 1 | `focus-visible` indicator on all controls | 03 §1.1 |
| 🔴 2 | `bedge-field` — associate 93 labels | 03 §1.2 |
| 🟠 3 | Touch targets to ≥ 24×24 (start with the 3 measured) | here, M1 |
| 🟠 4 | 8px → 11px floor; adopt the type scale | 01 §4 |
| 🟠 5 | Migrate 54 skeletons to `bedge-skeleton` | 02 §1 |
| 🟠 6 | Reconcile `InputDirective` / `.bedge-input` | 03 §1.1 |
| 🟡 7 | `tabular-nums`, shadow tokens, `rounded-md` | 01 §2, §3, §4.2 |

**Maya's closing note:** this application is in better shape than the brief
implied. The layout is solid, the empty-state copy is good, dark mode is
genuinely well built, and there is no `*ngIf` anywhere in a 65-component
codebase. What is missing is the last five percent — the focus ring, the label
association, the one font size that is 8px, the skeleton that was built and
never adopted. That five percent is the entire difference between software that
works and software that feels finished.
