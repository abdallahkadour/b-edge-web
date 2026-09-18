# 03 — HTML, CSS & Angular Refactoring Guide

**Authors:** Felix (Semantics & a11y) · Nadia (CSS) · Javier (Angular)
**Date:** 2026-09-18

---

## 1. Two WCAG 2.2 AA failures

These are not polish. They are conformance failures with named success
criteria, and they are both fixable in the shared primitives.

### 1.1 Keyboard focus is not visible — SC 2.4.11 Focus Appearance

Measured: **`outline-none` appears 28 times. `focus-visible:` appears 0 times.**

The shared input directive:

```ts
// projects/shared/src/lib/ui/input.directive.ts — BEFORE
'w-full px-3.5 rounded-lg border text-[15px] outline-none transition-colors',
this.invalid() ? 'border-danger' : 'border-gray-200 focus:border-ink',
```

The only focus indicator is a **1px border colour change**. SC 2.4.11 requires
an indicator at least as large as a 2px perimeter with ≥3:1 contrast against
adjacent colours. A 1px border does not meet it.

Two further problems in that one line:

- `focus:` fires on **mouse click as well as keyboard**, which is why people
  remove focus styling in the first place. `focus-visible:` is the fix.
- `.bedge-input` in `artist-dashboard/styles.scss` is a **second, divergent
  implementation** of the same control: `px-3` vs `px-3.5`, `text-sm` vs
  `text-[15px]`, `focus:border-gray-400` vs `focus:border-ink`,
  `placeholder-gray-300` vs `placeholder:text-gray-400`. Two input styles that
  disagree with each other.

**After:**

```ts
// projects/shared/src/lib/ui/input.directive.ts — AFTER
protected readonly classes = computed(() =>
  [
    'w-full px-3.5 rounded-lg border text-base transition-colors',
    'placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-400',
    // SC 2.4.11: a 2px ring offset from the control, keyboard-only.
    // outline-none is kept ONLY because focus-visible replaces it — never
    // on its own.
    'outline-none focus-visible:outline-2 focus-visible:outline-offset-2',
    'focus-visible:outline-ink',
    this.invalid() ? 'border-danger' : 'border-gray-200 focus:border-ink',
  ].join(' '),
);
```

`outline` rather than `ring`: it is not affected by `overflow-hidden` on a
parent, which is what silently clips ring-based focus indicators inside cards.

### 1.2 93 of 124 form controls have no programmatic label — SC 1.3.1 / 4.1.2

| | Count |
|---|---|
| Form controls (`input`/`select`/`textarea`) | 124 |
| With an `id` matched by a `<label for>` | 23 |
| Wrapped inside their `<label>` | 8 |
| With `aria-label` / `aria-labelledby` | **0** |
| **With no programmatic label at all** | **93** |

There are 102 `<label>` elements. They are almost all this shape:

```html
<!-- BEFORE — visually labelled, programmatically invisible -->
<label class="block text-xs text-gray-400 mb-1">Account name</label>
<input bedgeInput [value]="name()" (input)="name.set($any($event.target).value)" />
```

**Felix:** a sighted user sees a labelled field. A screen-reader user hears
"edit text, blank". The label is decoration. Tapping the label also fails to
focus the input, which is a usability loss for everyone, not just AT users.

**The fix is a component, not 93 edits.**

```ts
// projects/shared/src/lib/ui/field.component.ts
@Component({
  selector: 'bedge-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-3">
      <label [attr.for]="fieldId" class="block text-xs text-gray-400 mb-1">
        {{ label() }}
        @if (required()) { <span aria-hidden="true">*</span> }
      </label>
      <ng-content />
      @if (hint(); as h) {
        <p [id]="fieldId + '-hint'" class="text-xs text-gray-400 mt-1">{{ h }}</p>
      }
      @if (error(); as e) {
        <p [id]="fieldId + '-error'" role="alert" class="text-xs text-danger-dark mt-1">{{ e }}</p>
      }
    </div>
  `,
})
export class FieldComponent {
  readonly label = input.required<string>();
  readonly required = input(false);
  readonly hint = input<string>();
  readonly error = input<string>();
  // Generated once per instance. Callers must not have to invent unique ids,
  // because that is exactly the step that gets skipped.
  readonly fieldId = `f${Math.random().toString(36).slice(2, 9)}`;
}
```

```html
<!-- AFTER -->
<bedge-field label="Account name" [error]="nameError()">
  <input bedgeInput [id]="..." [value]="name()" (input)="..." />
</bedge-field>
```

**Javier:** the id has to reach the projected input. Cleanest is for
`InputDirective` to accept it from the parent field via DI rather than the
template threading it through — the directive already exists and already owns
the input's host bindings.

---

## 2. Semantic structure

| Element | Count |
|---|---|
| `<div>` | 987 |
| All semantic landmarks combined | **18** |
| `<main>` | 6 · `<header>` 5 · `<section>` 4 · `<nav>` 2 · `<aside>` 1 |
| `<article>`, `<footer>`, `<dialog>`, `<figure>` | **0** |

**55 divs per landmark.** Also telling: 3 `<ul>` and 4 `<li>` for an app that
is almost entirely lists — bookings, services, products, orders, reviews are
all rendered as stacks of divs.

**Felix:** screen-reader users navigate by landmark and by list. "List, 12
items" is how you know how much is there before reading any of it. Right now
every list is an undifferentiated run of text.

```html
<!-- BEFORE — booking list -->
<div class="min-h-screen bg-gray-50">
  <div class="bg-white border-b border-gray-200 px-5 pt-6 pb-4">
    <div class="flex items-center justify-between">
      <div><h1 class="text-xl font-bold text-ink">My Bookings</h1></div>
    </div>
  </div>
  <div class="px-5">
    @for (b of bookings(); track b.id) {
      <div class="bg-white rounded-lg border border-gray-200 p-4 mb-3">…</div>
    }
  </div>
</div>
```

```html
<!-- AFTER — same visual result, navigable structure -->
<main class="min-h-screen bg-gray-50">
  <header class="bg-white border-b border-gray-200 px-5 pt-6 pb-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold text-ink">My Bookings</h1>
    </div>
  </header>
  <section class="px-5" aria-labelledby="upcoming-heading">
    <h2 id="upcoming-heading" class="sr-only">Upcoming appointments</h2>
    <ul class="list-none p-0 m-0 flex flex-col gap-3">
      @for (b of bookings(); track b.id) {
        <li>
          <article class="bg-white rounded-lg border border-gray-200 p-4">…</article>
        </li>
      }
    </ul>
  </section>
</main>
```

Note the wrapper div around the `h1` disappears — it existed only to be a flex
child, and the `h1` can be that itself. **A third of the 987 divs are this
pattern.**

---

## 3. Dialogs — 12 hand-rolled, 0 native

```html
<!-- BEFORE — repeated 12 times, each slightly different -->
<div class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
     role="dialog" aria-modal="true">
  <div class="bg-white rounded-xl p-5 max-w-md w-full">…</div>
</div>
```

What this does not do: trap focus (on most instances), return focus on close,
make the background inert, lock scroll, or close on Escape without a hand-written
`@HostListener`.

```html
<!-- AFTER — the platform does all of it -->
<dialog #confirmDialog class="bedge-dialog" (close)="onClose()">
  <article class="bg-white rounded-xl p-5 max-w-md w-full">…</article>
</dialog>
```

```scss
// Escape, focus trap, inert background and scroll lock come from showModal().
.bedge-dialog {
  border: 0; padding: 0; background: transparent;
  max-width: min(28rem, calc(100vw - 2rem));
  &::backdrop { background: rgb(0 0 0 / 0.40); }
}
```

```ts
private readonly confirmDialog = viewChild.required<ElementRef<HTMLDialogElement>>('confirmDialog');
protected open(): void  { this.confirmDialog().nativeElement.showModal(); }
protected close(): void { this.confirmDialog().nativeElement.close(); }
```

---

## 4. Reactive hygiene

```ts
// BEFORE — 143 of these, 0 with teardown
ngOnInit(): void {
  this.api.listMine().subscribe({
    next: (list) => { this.rows.set(list); this.loading.set(false); },
    error: () => { this.loading.set(false); this.error.set('…'); },
  });
}
```

```ts
// AFTER
private readonly destroyRef = inject(DestroyRef);

ngOnInit(): void {
  this.api.listMine()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({ … });
}
```

**Javier, being precise:** this is not fixing a leak. `HttpClient` completes
after one emission, so nothing accumulates. It prevents a *late callback* —
navigating away mid-request, then `.set()` running against a destroyed
component's signal. Harmless now; the class of bug that becomes a crash the
moment one of those callbacks touches a `viewChild`.

Apply to the ~40 `ngOnInit` data loads, not all 143.

---

## 5. Remediation checklist

| # | Item | SC | Effort |
|---|---|---|---|
| 1 | `focus-visible` outline in `InputDirective`, `.bedge-input`, `ButtonComponent` | 2.4.11 | S |
| 2 | Reconcile `.bedge-input` with `InputDirective` — delete one | — | S |
| 3 | `bedge-field` + migrate 93 controls | 1.3.1, 4.1.2 | M |
| 4 | `<main>`/`<header>`/`<section>`/`<ul>` in the 12 list screens | 1.3.1 | M |
| 5 | `<dialog>` for the 12 modals | 2.1.2, 2.4.3 | M |
| 6 | `takeUntilDestroyed` on ~40 loads | — | S |
| 7 | `aria-live` on async status messages | 4.1.3 | S |
