# Enterprise UI Test Plan — Execution Report

**Date:** 2026-09-19
**Plan:** [Enterprise-UI-Test-Plan.md](./Enterprise-UI-Test-Plan.md) (founder-supplied, reproduced verbatim)
**Target:** `customer-pwa`, production bundle (`ng build --configuration production`), served statically
**Engines:** Playwright — Chromium 141 and **WebKit 26.5** (installed for this run)

---

## 0. Headline

**Eight defects found, eight fixed, across ten files.** Every one of them is
invisible on a desktop browser, and three were invisible in Chrome device
emulation too — they only appeared under a real WebKit build with an iPhone
user-agent.

The single most valuable finding was not in the plan's list at all. It fell out of
§4's throttling step: **on Fast 3G the app showed a completely blank white page for
2.5–3.0 seconds** on every route, because `<app-root>` was empty and nothing could
paint until the Angular bundle finished downloading and bootstrapping.

The plan's §3 tablet question turned out to be the second-biggest item: the app
was frozen at a **480px phone-width column at every size above 768px**, so a
1024 × 1366 iPad Pro rendered a narrow strip with 2-column grids and half the
screen empty. It now steps 2 → 3 → 4 columns. See §3.1.

Two sections of the plan — §5's real-device cloud and visual-regression tooling —
**cannot be executed in this environment at all**, and are reported as such rather
than approximated. See §5 below.

> **Correction to the first issue of this report.** Its §1 matrix was measured on
> the URLs `/discover`, `/bookings` and `/profile`. Those routes do not exist —
> discovery is served at `/`, and the real routes are `/my-bookings` and `/help` —
> so three of the four pages swept were the 404 page. The `/login` results were
> real; the rest were not. Every number below has been re-measured against the
> real routes, with the discovery API stubbed so the artist grid actually renders,
> and with `hasTouch` set on every mobile and tablet profile. Re-measuring is what
> exposed the iPad zoom gap in §2.1 and the tablet layout in §3.1. The §4 Fast 3G
> result was re-confirmed on `/` and is unchanged — it is a bootstrap property,
> not a route property.

---

## 1. Device & Viewport Targeting Matrix

Every profile in the plan's table was run, on the rendering engine that profile
actually ships. **Four real routes per profile** — `/` (discovery, with the artist
grid populated via a stubbed API), `/login`, `/my-bookings`, `/help` — measured for
horizontal overflow, sub-16px form controls, sub-44pt tap targets, and an explicit
assertion that the page is not the 404 screen.

| Device | Viewport | Engine | Frame | Grid | Ovf | Sub-16px | Tap < 44pt | |
|---|---|---|---|---|---|---|---|---|
| iPhone 16 Pro Max | 430 × 932 | WebKit | full | 2 col | 0 | 0 | 0 | ✅ |
| iPhone SE (3rd gen) | 375 × 667 | WebKit | full | 2 col | 0 | 0 | 0 | ✅ |
| Galaxy S24 Ultra | 360 × 800 | Chromium | full | 2 col | 0 | 0 | 0 | ✅ |
| Galaxy Z Fold 5 — folded | 344 × 882 | Chromium | full | 2 col | 0 | 0 | 0 | ✅ |
| Galaxy Z Fold 5 — open | 882 × 1134 | Chromium | 720px | 3 col | 0 | 0 | 0 | ✅ |
| iPad Air | 820 × 1180 | WebKit | 720px | 3 col | 0 | 0 | 0 | ✅ |
| iPad Air — landscape | 1180 × 820 | WebKit | 960px | 4 col | 0 | 0 | 0 | ✅ |
| iPad Pro 12.9" | 1024 × 1366 | WebKit | 960px | 4 col | 0 | 0 | 0 | ✅ |
| iPad Pro — landscape | 1366 × 1024 | WebKit | 960px | 4 col | 0 | 0 | 0 | ✅ |
| Desktop | 1600 × 1000 | Chromium | 960px | 4 col | 0 | 0 | 0 | ✅ |

344px — the folded Fold — is the narrowest viewport in real use and the one most
likely to break a fixed-width element. It is clean.

**These are the post-fix numbers.** Before the fixes below, the iPhone profiles
failed on sub-16px controls and tap targets, every tablet profile also failed on
sub-16px controls, and every tablet rendered a 480px strip.

---

## 2. Core UI Functional Testing

### 2.1 iOS auto-zoom on input focus — **4 defects found, all fixed**

The plan's requirement: input `font-size` ≥ 16px, or Mobile Safari zooms the
viewport on focus and does not zoom back out. The user is left mid-form on a page
wider than the screen.

A full-codebase sweep — parsing opening tags across line breaks, because the class
attribute is routinely wrapped and a line-based `grep` silently misses it — found
**52 form controls** (38 `input`, 7 `textarea`, 7 `select`) declaring `text-sm` or
`text-xs`.

Confirmed live on WebKit, not merely inferred from the class name:

```
select-one  font-size=14px  ✗ ZOOMS
tel         font-size=16px  ✓
```

**Fix 1 — the country-code select in `PhoneInputComponent`.** 14px, sitting
directly beside a correctly-sized 16px phone input. This is code written earlier
the same day; the mismatch was introduced with it.
`projects/shared/src/lib/ui/phone-input.component.ts` — `text-sm` → `text-base`.

**Fix 2 — the remaining 51.** Rewriting 51 call sites would have cost the
artist-dashboard the compact density it was designed with, on desktop, where no
zoom problem exists. Instead a single scoped rule raises them only where the
problem is real:

```scss
@media (pointer: coarse) {
  input.text-sm, input.text-xs,
  select.text-sm, select.text-xs,
  textarea.text-sm, textarea.text-xs { font-size: 1rem; }
}
```

**That media condition is a correction.** The rule first shipped as
`@media (max-width: 767px)`, on the assumption that zoom-on-focus is a phone
problem. It is not — **iPadOS Safari zooms by exactly the same rule**, and an iPad
Air reports 820px, so the rule stopped applying precisely where the tablet pass
then found the gap: 0 offending controls on every phone profile, **2 on every
tablet profile**. The condition that actually matters is whether a touch keyboard
can appear, which is what `pointer: coarse` asks. Verified directly:
`matchMedia('(pointer: coarse)')` is `false` for a desktop mouse and `true` for
touch, so the dashboard keeps its density on a real desktop at any window size.

Two further deliberate choices, both documented at the rule:

- **Element+class (0,1,1) beats Tailwind's bare `.text-sm` (0,1,0)**, so no
  `!important` is needed and nothing downstream has to fight this rule to override
  it on purpose.
- **It raises only the two small classes.** A blanket `input { font-size: 16px }`
  floor would also catch the one control that is intentionally *larger* — the OTP
  input at `text-2xl` — and shrink it. An accessibility fix that causes a visual
  regression is not a fix. That one control was found by sweeping for the opposite
  condition before writing the rule.

Checkbox and radio are excluded by construction: neither takes text input, so
neither triggers the zoom.

**Verified after the fix, on WebKit:** 0 sub-16px controls on all four phone
profiles *and* all four tablet profiles, with `pointer: coarse` resolving `false`
on a mouse-driven desktop. The dashboard keeps its density; touch devices stop
zooming.

### 2.2 Touch targets ≥ 44×44 (Apple HIG) — **3 defects found, all fixed**

**Fix 3 — back buttons, 28 × 28.** `p-1` on a bare icon. Two sites:
`customer-login.page.html` and `booking-detail.page.html`. Now `min-h-11 min-w-11`
(44px) with the icon optically left-aligned via `-ml-2`.

**Fix 4 — the install-prompt banner, 45 × 28.** This one is worth dwelling on,
because of *how* it was missed. The banner renders **only under an iOS
user-agent** — it is the "Add B-Edge to your home screen" prompt. An earlier sweep
under a default Chromium UA reported the page clean, because the element was never
rendered. It appeared the moment the context was given an iPhone UA string.

Its "Got it" dismiss button was 45 × 28 — the *only* control on the banner, below
the minimum, on a banner shown to every iOS visitor. The sibling "Install" button
(Android-only, so absent from the iOS run) was the same height and was fixed in the
same pass rather than left to be rediscovered from the other direction.

`projects/customer-pwa/src/app/shared/install-prompt.component.html` — both buttons
now `min-h-11 inline-flex items-center justify-center`.

### 2.3 Virtual keyboard deployment — **pass, one enhancement**

All 104 inputs audited by type. The correct keyboard is deployed natively by the
`type` attribute in every case that needs one — `type="tel"` gives the phone pad,
`type="email"` the email pad. `inputmode` is a refinement here, not a missing
requirement, and its absence on `type="email"` / `type="tel"` changes nothing.

The 10 `type="number"` fields that lack `inputmode` are **all in the
artist-dashboard** (price and duration entry). None sits on the customer booking
path. Worth `inputmode="decimal"` for money eventually; not a finding against this
plan, whose stated focus is the critical path to revenue.

**Fix 5 — OTP autofill.** The 6-digit code input was correctly `type="tel"`,
`inputmode="numeric"`, 24px. It was missing `autocomplete="one-time-code"`, which
is what lets iOS offer the SMS code straight from the notification banner. One
attribute, on the highest-intent step in the product — the point where a customer
has already asked to log in and is waiting on a text message.

### 2.4 Sticky elements vs the virtual keyboard — **pass, partially exercised**

At a 420px-tall viewport (a 390 × 844 phone with the keyboard up), `/login` has
zero fixed-position elements, nothing below the fold, and no fixed element
overlapping an input.

**Honest limit:** the funnel screens that *do* carry a sticky bottom CTA could not
be driven to a populated state in this pass — reaching them needs a seeded cart and
an authenticated session. A static read confirms `pick-datetime` is the one screen
combining a sticky footer with inputs. It should be checked on a real device before
this section is called done.

### 2.5 Bottom sheets, swipe-dismiss and pull-to-refresh — **1 defect found and fixed; 1 open**

11 files carry `role="dialog"`, so the semantics are right.

**Not a defect:** the plan warns about a modal's scroll reaching the browser and
triggering pull-to-refresh. In `customer-pwa` that specific path does not exist —
no modal has its own vertical scroll container; all `overflow` usage is horizontal
strips or `overflow-hidden`.

**But the underlying risk is worse than the plan assumed, at the page level.** The
booking funnel keeps its entire state — step, chosen slot, the live 10-minute hold,
and the name, phone and notes just typed — in in-memory signals on a single route.
Nothing in `customer-pwa` writes to `sessionStorage` or `localStorage` except the
install prompt. That in-memory design is deliberate and well-argued in the funnel's
own header comment: a live hold must not be URL-addressable, or browser
back/forward lands the customer on a stale step holding an expired booking ID.

The consequence is that **any reload mid-funnel discards everything**. And at the
top of the page, a downward drag is not a scroll — it is the browser's
pull-to-refresh. On a phone, during a form, that gesture is one careless thumb
away, and it costs the customer their booking.

**Fix 6 — remove the accidental trigger:**

```scss
body { overscroll-behavior-y: contain; }
```

Ordinary scrolling is untouched, and nothing is lost: B-Edge implements no
pull-to-refresh of its own, so the gesture had no meaning here except as a way to
destroy work in progress.

**Left open, deliberately —** this removes the accident, not the fragility. A
deliberate reload, an iOS tab eviction under memory pressure, or a crash still
loses the funnel. Making it durable means persisting state, which is a change to
booking-state semantics on the revenue path, and the existing code shows its author
reasoned carefully about exactly that staleness risk. The safe subset is to persist
**only the typed customer details** (name, phone, notes) and never the slot or
booking id — no staleness risk, and it removes the part that is genuinely annoying
to retype. **Recommended, not done: this is a product call, not a lint fix.**

**Also open:** bottom sheets are tap-to-dismiss only. One file in `customer-pwa`
handles touch gestures (a photo gallery swipe). No sheet supports swipe-down. The
plan asks for it; it is a real gap, and a larger piece of work than anything else
in this report.

### 2.6 Date & time pickers — **not executed**

Native-vs-custom picker rendering differs between iOS Safari and Samsung Internet
in ways that a headless engine does not reproduce: the picker is OS chrome, not
page content. 5 `type="date"` and 10 `type="time"` inputs exist, all in the
artist-dashboard. **Needs real devices.**

---

## 3. Visual & Responsive Layout Validation

### 3.1 Orientation switching and the tablet grid — **defect found, fixed**

No horizontal overflow at any profile or orientation in the §1 table.

**The defect.** The whole app was wrapped in `md:max-w-[480px]` — one phone-width
column at *every* size above 768px — with grids hardcoded to `grid-cols-2`. A
1024 × 1366 iPad Pro and an 820 × 1180 iPad Air both rendered a 480px strip with
2-column grids and roughly half the screen empty. This is the plan's §3 question
("transitioning … to a 2-column or 3-column masonry grid on an iPad") and the
answer was no.

**Fix 8 — a width ladder, not a removal.** The frame could not simply be deleted.
Its `md:[contain:layout]` is load-bearing: per the CSS Containment spec it makes
the frame the containing block for every `position: fixed` descendant — back
buttons, sticky bottom CTAs, bottom nav, banners — so they anchor to the frame
rather than escaping to the true viewport. Remove the frame and every fixed bar
stretches edge-to-edge across a desktop window. **So the frame widens, and the
fixed elements follow it.**

| Viewport | Frame | Grid | Card |
|---|---|---|---|
| < 768px | full width | 2 col | 146–189px |
| ≥ 768px — iPad portrait, Fold open | 720px | 3 col | 219px |
| ≥ 1024px — iPad Pro, iPad landscape, desktop | 960px | 4 col | 221px |

The two breakpoints are shared by the frame and the grids, chosen so the **card
size stays near-constant at ~220px** rather than ballooning with the viewport — the
layout gains columns instead of inflating cards. Time-slot grids step 3 → 4 → 6 on
the same breakpoints.

It deliberately stops at 960px. Past that the app is not trying to fill a desktop
monitor: a beauty booking flow sprawled across 1600px reads as an admin console,
not a storefront. Desktop gets the 960px frame centred.

Measured across all ten profiles — frame width, column count, card width and
overflow — in the §1 table. A stale comment in `my-bookings.page.html` that
justified a compact control because "the frame is 480px at its widest" was updated
in the same pass rather than left to mislead the next reader.

### 3.2 Safe-area insets — pass, and the intuitive "fix" would be a bug

The viewport meta is `width=device-width, initial-scale=1`, with **no
`viewport-fit=cover`**. Without it, iOS insets the web view itself, so content
cannot land under the notch or the home indicator. The app is safe *by default*.

This is worth recording because the obvious reading of the plan's bullet — "add
`viewport-fit=cover` and `env(safe-area-inset-*)`" — would **introduce** the bug it
is meant to prevent: `viewport-fit=cover` is what extends the page under the
hardware, and only then does every bottom-anchored element need an `env()` guard.

`env(safe-area-inset-*)` is supported by the engine (confirmed on WebKit) and the
single existing usage is inert under the current meta. Correct as-is.

### 3.3 Asset aspect ratios — pass

12/12 portfolio images: `object-fit: cover`, `loading="lazy"`, and explicit width +
height via `NgOptimizedImage`. No warping on any profile in the matrix.

---

## 4. Performance & Network Simulation

### 4.1 Stateful loading on Fast 3G — **the most serious finding; fixed**

Throttled to 1.6 Mbps / 150 ms RTT against the production bundle:

```
0.5s  BLANK      1.5s  BLANK      2.5s  BLANK
1.0s  BLANK      2.0s  BLANK      3.0s  content
```

**2.5–3.0 seconds of blank white page**, with no skeleton and no spinner.

Re-run with the API stubbed to answer instantly: **identical**. So this is not a
slow endpoint — it is bundle download plus bootstrap, and `<app-root></app-root>`
was empty, so the browser had nothing to paint.

The critical consequence: **no Angular skeleton component can fix this**, because
the framework that would render the skeleton is the thing still downloading. Only
code already present in the HTML can paint in that window.

**Fix 7 — an inline first-paint splash** in `index.html`: brand wordmark, centred,
on the app's real ground colour, with a gentle opacity pulse. Angular clears the
host element's children on bootstrap, so it disappears by itself with nothing to
clean up. ~0.6 KB inline, no extra request, no bundle impact.

It is theme-aware in all three states, following the convention already established
by the pre-paint theme script directly above it in the same file — bare `:root` for
light, `prefers-color-scheme: dark` guarded with `:not([data-theme="light"])` for
an unstamped document following a dark OS, and `[data-theme="dark"]` so an explicit
choice wins. It honours `prefers-reduced-motion`. Verified rendering in both
themes: light `rgb(250 250 250)` on `rgb(10 10 10)`, dark `rgb(18 18 20)` on
`rgb(250 250 250)`.

After:

```
0.5s  content   1.5s  content   2.5s  (bootstrap handover)
1.0s  content   2.0s  content   3.0s  app
```

First paint moves from ~2.5 s to immediate. The residual gap at 2.5 s is the single
frame where Angular swaps in the real view.

### 4.2 Double-submit during latency — pass

Six rapid taps on "Send code" against a deliberately delayed response produced
**exactly 1 request**. The button is `disabled` while in flight (an initial reading
suggested otherwise; that check had sampled after the request completed, and the
corrected measurement shows `disabled=true`, `opacity=0.9`).

Minor: the label does not change during flight — it stays "SEND CODE" rather than
"SENDING…". The guard is correct; only the feedback is thin.

### 4.3 Image lazy-loading and CLS — pass

**CLS 0.0000.** 12/12 images defer off-screen and carry explicit dimensions, which
is why there is no shift as they populate.

---

## 5. Enterprise Execution Strategy — **cannot be executed here**

This section is reported as unexecuted rather than approximated, because
approximating it is precisely what the plan warns against.

**Real device cloud (BrowserStack / Sauce Labs / AWS Device Farm).** No account or
credentials are available in this environment. Not attempted.

**Automated visual regression (Applitools / Percy).** Same. No baseline exists, and
a visual-regression suite without an approved baseline reports noise.

**What was done instead, and what it is worth.** The plan's own justification for a
device cloud is that "emulation cannot replicate iOS Safari's WebKit rendering
engine." That is the half of the objection this run *can* answer: WebKit 26.5 was
installed and every iOS-profile result above was measured on the real engine, not
on Chromium wearing an iPhone viewport. That is a genuine upgrade over emulation,
and it is what caught the install-prompt banner.

**It is not a substitute, and the gap is specific.** Playwright's WebKit is the
engine, not Mobile Safari: it has none of the UIKit chrome. So the zoom-on-focus
*behaviour* itself is still inferred from the ≥16px rule rather than observed —
what was observed is the input sizes that trigger it. The same limit applies to
native date/time pickers, real touch and momentum scrolling, the actual keyboard
inset, and memory-pressure tab eviction. **Those need real hardware.**

---

## 6. Changes made

Eight fixes across ten files. All three apps build clean.

| # | File | Change |
|---|---|---|
| 1 | `shared/…/ui/phone-input.component.ts` | country select `text-sm` → `text-base` (iOS zoom) |
| 2 | `shared/…/styles/_theme.scss` | `pointer: coarse` floor raising 51 remaining controls to 16px |
| 3 | `customer-pwa/…/customer-login.page.html`, `…/booking-detail.page.html` | back button 28×28 → 44×44 |
| 4 | `customer-pwa/…/shared/install-prompt.component.html` | both banner buttons → 44pt min height |
| 5 | `customer-pwa/…/customer-login.page.html` | OTP `autocomplete="one-time-code"` |
| 6 | `shared/…/styles/_theme.scss` | `body { overscroll-behavior-y: contain }` |
| 7 | `customer-pwa/src/index.html` | inline first-paint splash |
| 8 | `customer-pwa/…/app.html` + `discover`, `shop`, `pick-datetime`, `my-bookings` | tablet width ladder: frame 480 → 720/960, grids 2/3/4, slots 3/4/6 |

Every non-obvious choice is documented at the code, with the measurement that
motivated it, so the next reader does not have to re-derive it — in particular why
the font-size rule keys on `pointer: coarse` rather than a width, why the frame
widens rather than being removed, and why `viewport-fit=cover` must *not* be
added.

---

## 7. Open items — for a product decision, not a lint pass

1. **Funnel state is not durable.** §2.5. Recommended: persist typed customer
   details (name / phone / notes) to `sessionStorage`, never the slot or booking id.
2. **No swipe-down dismissal on bottom sheets.** §2.5. Real gap, largest remaining
   item in this report.
3. **No in-flight label change on the primary CTA** ("SEND CODE" throughout). §4.2.
4. **Sticky-footer-vs-keyboard unverified on populated funnel screens.** §2.4.
5. **Native date/time picker rendering unverified.** §2.6. Needs real devices.

**Closed since the first issue.** The 2-column tablet grid (§3.1) is fixed. The 87
off-scale font sizes (13px / 15px) are **accepted as-is** — reviewed and judged not
a problem, so they are closed rather than carried.

### A finding outside the plan's scope

**The web test suite does not run.** `npx vitest run` → **19 failed / 6 passed**.
Every failure is configuration, not assertion:

- `Cannot find package '@bedge/shared'` — the `tsconfig` path alias is not mapped
  in the Vitest resolver
- `Cannot find package '@playwright/test'` — not installed
- `Need to call TestBed.initTestEnvironment() first` — no setup file
- `'PlatformLocation' needs to be compiled using the JIT compiler` — `@angular/compiler` absent
- `localStorage is not defined` — running in `node`, not `jsdom`

**Confirmed pre-existing:** stashing all seven changes and re-running gives exactly
19 failed / 6 passed. Unrelated to this work — but it means the frontend currently
has no automated regression net, which is the thing that would otherwise catch the
defects in this report before they shipped.

---

## 8. Method notes

Three process facts, recorded because each one produced a wrong reading first:

**A stale dev server invalidated an entire verification round.** A leftover
`http-server` from earlier in the session was still serving an old `dist`, so a fix
that was correct in source read as "not applied" in the browser. Every subsequent
verification in this run was done on a freshly started server on a new port, with
the served CSS grepped for the expected rule before trusting any measurement.

**`@bedge/shared` resolves to `./dist/shared`, not to source.** Editing anything
under `projects/shared/src/` and rebuilding only the app silently uses the old
library. `ng build shared` must run first. This cost one full debugging cycle and
is the most likely trap for the next person editing the design system.

**Assert the page is the page before measuring it.** The first issue's matrix
swept `/discover`, `/bookings` and `/profile`. None of those routes exist —
discovery is at `/` — so three quarters of that sweep measured the 404 screen and
reported it as clean. A render check is not an identity check. Every sweep here
asserts the page is not the 404 screen, and the discovery sweep additionally
asserts the artist grid has more than one column. **This is the second time in
this engagement that a "clean" result turned out to be the wrong page**, so the
assertion is now part of the harness rather than a thing to remember.

**Playwright matches the most recently registered route first.** A `**/api/v1/**`
catch-all added *after* a specific `**/discovery/artists**` stub silently swallowed
it, and the page rendered "No artists found" — which reads exactly like a layout
bug when the thing being measured is a grid. Register catch-alls first.

**A finding that appears on one route and not another is usually the harness, not
the app.** An early differential reported a WebKit-only `position: fixed` element
on three routes; a direct re-query found nothing on either engine. It was a
transient captured mid-load. It was dropped rather than reported. The
install-prompt banner went the other way — absent under a default UA, real under an
iPhone one. **Both directions are worth a second look before writing anything down.**
