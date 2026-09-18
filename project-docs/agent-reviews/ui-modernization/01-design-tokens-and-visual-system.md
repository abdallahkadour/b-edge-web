# 01 — Design Tokens & Visual System

**Authors:** Soren (Visual UI) · Nadia (CSS & Layout)
**Date:** 2026-09-18
**Scope:** `b-edge-web` — 53 templates, 65 components, 3 projects

> Every count below is measured from the workspace. Where the system is already
> right, we say so and move on — the point is to find what is inconsistent, not
> to rebuild what works.

---

## 1. What already exists and should not be touched

**Soren:** I expected to be proposing a token layer. There is one, and it is
better than most I audit.

`projects/shared/src/lib/styles/_theme.scss` defines the whole palette as CSS
custom properties in `R G B` triplet form, consumed by `tailwind.config.js` as
`rgb(var(--c-x) / <alpha-value>)`. That last detail is the one people get
wrong, and it is the reason `bg-white/95` and `bg-success/10` still work.

Three-state dark mode is correctly implemented: bare `:root` for light, a
`prefers-color-scheme` block guarded with `:not([data-theme="light"])`, and an
explicit `[data-theme="dark"]` block. The guard is what makes an in-app light
choice beat a dark OS, and it is missing from most implementations.

**Elevation ordering is preserved rather than inverted** in dark mode —
`gray-50` (ground) < `white` (card) < `gray-100` < `gray-200`. A naive
inversion makes cards read as holes punched in the page. Someone thought about
this.

**Verdict: the foundation is sound.** Everything below is about the surface
that sits on it.

---

## 2. Elevation — the real inconsistency

Measured shadow usage across all templates:

| Treatment | Uses | Verdict |
|---|---|---|
| `shadow-sm` | 19 | Canonical |
| `shadow-xl` | 11 | Canonical |
| `shadow-[0_1px_3px_rgba(0,0,0,0.06)]` | 3 | **Arbitrary** — a hand-written `shadow-sm` |
| `shadow-lg` | 1 | Orphan |
| `shadow-[0_4px_12px_rgba(0,0,0,0.15)]` | 1 | **Arbitrary** |
| `shadow-[0_2px_8px_rgba(10,10,10,0.08)]` | 1 | **Arbitrary** — note it uses `ink`, not black |
| `shadow-2xl` | 1 | Orphan |

**Nadia:** seven treatments for what should be three. Worse, three are
arbitrary values written inline, so they do not participate in dark mode at
all — a fixed `rgba(0,0,0,0.06)` over a `#1a1a1d` card is invisible, while
`rgba(10,10,10,0.08)` is a different lighting model from the other two.

### 2.1 The elevation scale we are standardising on

Three levels. A fourth is a sign something is wrong with the layout, not with
the shadow.

| Token | Value | Used for |
|---|---|---|
| `shadow-sm` | `0 1px 3px rgb(0 0 0 / 0.06)` | Cards, list rows, anything resting on the page |
| `shadow-lg` | `0 4px 16px rgb(0 0 0 / 0.10)` | Popovers, dropdowns, the notification panel |
| `shadow-xl` | `0 12px 32px rgb(0 0 0 / 0.16)` | Modals and sheets — the only things that float free |

**Dark mode is not the same shadow at a different opacity.** A shadow on a dark
ground reads as absence of light, not presence of shade; the same alpha
disappears. Elevation in dark mode is carried primarily by the surface step
(`gray-50` → `white` → `gray-100`), with shadow as reinforcement at roughly
2.5× the light-mode alpha.

```scss
// _theme.scss — to be added alongside the colour tokens
:root {
  --shadow-sm: 0 1px 3px rgb(0 0 0 / 0.06);
  --shadow-lg: 0 4px 16px rgb(0 0 0 / 0.10);
  --shadow-xl: 0 12px 32px rgb(0 0 0 / 0.16);
}
@mixin dark-tokens {
  --shadow-sm: 0 1px 3px rgb(0 0 0 / 0.40);
  --shadow-lg: 0 4px 16px rgb(0 0 0 / 0.55);
  --shadow-xl: 0 12px 32px rgb(0 0 0 / 0.70);
}
```

**Action:** replace the 5 arbitrary/orphan shadows with the three tokens.

---

## 3. Border radii

| Class | Uses | Resolved value | On scale? |
|---|---|---|---|
| `rounded-lg` | 227 | 0.75rem / 12px | ✅ canonical |
| `rounded-full` | 153 | 9999px | ✅ pills and avatars |
| `rounded-xl` | 55 | 1rem / 16px | ✅ |
| `rounded` | 50 | 0.5rem / 8px | ✅ (config `DEFAULT`) |
| `rounded-2xl` | 13 | 1.5rem / 24px | ⚠️ Tailwind default, not in our config |
| `rounded-md` | 3 | **0.375rem / 6px** | ❌ **off-scale** |

**Nadia:** `rounded-md` is not defined in `tailwind.config.js`, so it falls
through to Tailwind's 6px. Our scale is 8 / 12 / 16. Six pixels is a value
nobody chose, appearing on three elements that sit next to 8px and 12px
siblings. It is exactly the kind of one-pixel wrongness that reads as "cheap"
without anyone being able to say why.

**Action:** `rounded-md` → `rounded` (3 occurrences). Add `2xl: 1.5rem` to the
config so the 13 uses become deliberate rather than inherited.

---

## 4. Typography — the largest finding in this document

**239 arbitrary pixel font sizes.**

| Size | Uses | Assessment |
|---|---|---|
| `text-[13px]` | 57 | Off-scale — no token equivalent |
| `text-[14px]` | 46 | **Identical to `text-sm`** |
| `text-[15px]` | 29 | Off-scale |
| `text-[10px]` | 29 | Off-scale |
| `text-[12px]` | 26 | **Identical to `text-xs`** |
| `text-[11px]` | 25 | Off-scale |
| `text-[9px]` | 6 | Off-scale — below the 12px minimum for body text |
| `text-[16px]` | 6 | **Identical to `text-base`** |

Distribution: **customer-pwa 175, artist-dashboard 61, shared 3.**

**Soren:** the split tells the story. The customer app was built to a pixel
specification — probably straight from a design file — and the dashboard was
built to the scale. Neither is wrong in isolation; having both means there is
no scale.

Two separate problems:

1. **78 are pure duplication.** `text-[12px]`, `text-[14px]` and `text-[16px]`
   are byte-for-byte what `text-xs`, `text-sm` and `text-base` already emit.
   Replacing them is mechanical, zero-risk, and removes a third of the problem.
2. **161 are genuinely off-scale** — 9, 10, 11, 13, 15px. These need a decision,
   not a find-and-replace.

### 4.1 The type scale

A five-step scale covering every real use. 13px and 15px are the two the
customer app genuinely needs (a dense list row and a comfortable body line),
so they become tokens rather than being snapped away.

| Token | Size / line-height | Role |
|---|---|---|
| `text-2xs` | 11px / 16px | Uppercase micro-labels, badge text. **The floor.** |
| `text-xs` | 12px / 16px | Secondary metadata, timestamps |
| `text-sm` | 13px / 18px | Dense list rows — *redefined from 14px* |
| `text-base` | 15px / 22px | Body copy — *redefined from 16px* |
| `text-lg` | 17px / 24px | Card titles |
| `text-xl` … | unchanged | Headings |

**9px is deleted.** Six uses, all micro-labels; they become `text-2xs`. Nine
pixels is below the threshold at which uppercase letterforms stay legible on a
phone at arm's length, and it is the single clearest "unfinished" tell in the
customer app.

**Soren:** redefining `sm` and `base` rather than adding `text-[13px]` as a
token is the deliberate call. It means the 46 `text-[14px]` become `text-sm`
and shift by one pixel, and the 6 `text-[16px]` become `text-base` and shift by
one. That is a real visual change, and it is the change that makes the app
internally consistent instead of internally 8-valued.

### 4.2 Font pairing

One family — Inter — with a real fallback stack, and that is correct for this
product. A display face would be a decision about the brand, not about the
interface, and there is no evidence the brand wants one. What is missing is
**`font-variant-numeric: tabular-nums` on money and times**: prices in a list
currently jitter column-to-column because Inter's default figures are
proportional. That is a two-line fix with a disproportionate effect on
perceived quality.

---

## 5. Spacing

Genuinely good. 14 arbitrary spacing values against 584 control-flow blocks —
the 4/8px grid is being followed. The arbitrary values that exist
(`pb-[140px]`, `max-w-[480px]`) are layout constants for the phone frame, which
is a legitimate use.

**No action.** Noted so a future audit does not re-open it.

---

## 6. Ranked actions

| # | Action | Effort | Impact |
|---|---|---|---|
| 1 | Add `focus-visible` tokens (see report 03 — this is a WCAG failure, not a polish item) | S | **Blocker** |
| 2 | Replace 78 duplicate pixel sizes with `text-xs`/`sm`/`base` | S | High |
| 3 | Introduce the 5-step scale; migrate the remaining 161 | M | High |
| 4 | Three-level shadow tokens; replace 5 arbitrary/orphan shadows | S | High |
| 5 | `rounded-md` → `rounded`; add `2xl` to config | XS | Medium |
| 6 | `tabular-nums` on money and time | XS | Medium |
