# 02 — UI Libraries & Component Strategy

**Authors:** Camilla (Frontend Architecture) · Javier (Angular)
**Date:** 2026-09-18

---

## 1. The finding that reframes this document

The shared component library was **built but never adopted**.

| Primitive | Uses | Files | Verdict |
|---|---|---|---|
| `bedge-button` | 104 | 25 | ✅ Adopted |
| `bedge-badge` | 25 | 15 | ✅ Adopted |
| `bedge-card` | 16 | 9 | ✅ Adopted |
| `bedge-star-rating` | 8 | 5 | ✅ Adopted |
| **`bedge-skeleton`** | **4** | **2** | ❌ **Abandoned** |
| **`bedge-empty-state`** | **1** | **1** | ❌ **Abandoned** |

Against that: **54 raw `animate-pulse` divs across 19 files**, every one of them
a hand-rolled skeleton of the exact shape `bedge-skeleton` renders:

```html
<div class="h-20 rounded-xl bg-gray-100 animate-pulse"></div>
```

**Camilla:** this is the most valuable thing in the audit and it needs no new
dependency. The components exist, they are tested-adjacent, they are exported —
somebody built the abstraction and then the migration stopped. Buttons and
badges made it; loading and empty states did not.

That also means the two components most responsible for how an app feels while
it is *working* — the states a user sees on every cold load and every empty
list — are the two that were skipped.

**Action 1, and the highest-leverage item in this report: migrate the 54
`animate-pulse` call sites to `bedge-skeleton`, and the hand-rolled empty
states to `bedge-empty-state`.** No library required.

---

## 2. Library recommendations

### 2.1 Angular CDK — already installed, barely used

`@angular/cdk@21.2.14` is a dependency. Measured usage: `cdkTrapFocus` (20
occurrences) and nothing else.

Meanwhile the app hand-rolls what CDK owns:

| Hand-rolled | Count | CDK equivalent |
|---|---|---|
| Manual `Escape` key handling | 10 files | `Overlay` + `OverlayConfig` |
| `fixed inset-0` backdrops | 12 | `cdk-overlay-backdrop` |
| `role="dialog"` on a div | 12 | `Dialog` / `CdkDialog` |
| Native `<dialog>` | **0** | — |
| Scroll-blocking while a modal is open | ad hoc | `ScrollStrategy` |

**Camilla:** twelve dialogs, each re-implementing backdrop, Escape, focus
return and scroll locking, is twelve chances to get one of them wrong — and
report 04 shows two already are.

**Javier, pushing back:** CDK `Dialog` is imperative — it opens components from
a service. This codebase is declarative and signal-driven; every modal is
currently `@if (showX()) { … }` in the template, which is readable and works
with zoneless change detection without ceremony. Wholesale migration to
`dialog.open()` would be a large diff that makes the templates *less* obvious.

**Where we landed:** adopt CDK **behaviour**, keep the declarative structure.
`cdkTrapFocus` is already proving the pattern. Add:

- `CdkTrapFocus` on every dialog (currently on some)
- `cdk-overlay` **only** for the notification panel, which is the one true
  popover with positioning requirements
- a shared `bedgeDialog` directive wrapping Escape + scroll-lock + focus return,
  applied to the existing `@if` blocks

That gets the correctness without the rewrite.

### 2.2 Native `<dialog>` — recommended over both

**Felix's contribution, recorded here:** `<dialog>` has had full baseline
support since 2022. It gives backdrop, Escape, focus trapping, inertness of the
background and `::backdrop` styling **for free, from the platform**, with no
library and no directive.

The only reason not to is that `showModal()` is imperative — which is the same
objection Javier raised against CDK, but at a fraction of the cost: one
`viewChild` and one call, versus a service and a component factory.

**Verdict: `<dialog>` for the 12 modals, CDK overlay for the 1 popover.**

### 2.3 Tailwind v4 — not now

v4 is a real improvement (native cascade layers, `@theme`, no JS config). But
this workspace is on v3.4 with a working custom-property token layer that
already achieves most of what `@theme` provides.

**Deferred, deliberately.** It is a migration, not a polish pass, and it would
collide with every action in report 01. Revisit once the type scale lands.

### 2.4 Spartan UI / PrimeNG — declined

**Camilla:** I would normally push for a headless kit. Here I am arguing
against it, which is worth explaining.

The component surface this app actually needs is small — button, badge, card,
input, skeleton, empty state, star rating, toggle. Seven of the eight exist and
four are well adopted. Adding Spartan means adopting its theming model
alongside the CSS-custom-property layer that already works, and PrimeNG brings
a second design language that would have to be suppressed before it could be
used.

**The problem here is not a missing library. It is an unfinished migration.**
Importing one would leave 54 `animate-pulse` divs exactly where they are.

### 2.5 Lucide — already in use, one structural flaw

Icons are registered per-application via `LucideAngularModule.pick({...})`. A
shared component that names an icon renders **nothing** in whichever app forgot
to register it — silently, with no console error.

This already bit the theme toggle, which was built with inline SVG specifically
to avoid it. That workaround is correct but it is a workaround.

**Action:** move icon registration into a single shared `BEDGE_ICONS` set that
both apps spread into their `pick()`, so a shared component can rely on it.

---

## 3. Components to build

| Component | Replaces | Why |
|---|---|---|
| `bedgeDialog` directive **or** `<dialog>` adoption | 12 hand-rolled modals | Escape, focus return, scroll lock, inert background |
| `bedge-field` | 93 unassociated label/input pairs (report 03) | Generates the `id`/`for` link that is currently absent |
| `bedge-money` | Ad-hoc `${{ x }}` interpolation | `tabular-nums`, consistent decimals, one place to change currency |
| `bedge-list-row` | Repeated `flex items-start justify-between gap-3` | The single most duplicated layout in the codebase |

## 4. Components to delete

Nothing. There is no dead component — the problem is the opposite.

---

## 5. Angular modernity — Javier's assessment

I was briefed to modernise. There is very little to modernise.

| Measure | Count | Verdict |
|---|---|---|
| `*ngIf` / `*ngFor` | **0** | Fully migrated |
| `@if` / `@for` | 584 | ✅ |
| `ChangeDetectionStrategy.OnPush` | 62 of 65 components | ✅ |
| `signal()` / `computed()` / `input()` | 297 | ✅ |
| Zoneless change detection | enabled | ✅ |
| `| async` | 0 | Consistent with the signal model |

**The one real gap: 143 `.subscribe()` calls, 0 `takeUntilDestroyed`, 4
`ngOnDestroy`.**

Stated precisely, because "memory leak" would be wrong: these are almost all
`HttpClient` calls, which emit once and complete, so the subscription tears
itself down. There is no unbounded leak.

What *does* happen is a late callback: navigate away while a request is in
flight, the response arrives, and `.set()` runs against a signal belonging to a
destroyed component. Harmless today; the class of bug that produces
"cannot read property of undefined" the moment one of those callbacks starts
touching a `viewChild`.

**Action:** `.pipe(takeUntilDestroyed())` on the subscriptions in components
that can be navigated away from mid-request. Not all 143 — the ones in
`ngOnInit` data loads, which is roughly 40.

---

## 6. Ranked actions

| # | Action | Effort | Impact |
|---|---|---|---|
| 1 | Migrate 54 `animate-pulse` → `bedge-skeleton`; adopt `bedge-empty-state` | M | **High** |
| 2 | `bedge-field` to fix label association | M | **Blocker** (a11y) |
| 3 | `<dialog>` for the 12 modals | M | High |
| 4 | Shared `BEDGE_ICONS` registration | S | Medium |
| 5 | `takeUntilDestroyed` on ~40 load subscriptions | S | Medium |
| 6 | `bedge-money`, `bedge-list-row` | S | Medium |
| 7 | Tailwind v4 | L | Deferred |
