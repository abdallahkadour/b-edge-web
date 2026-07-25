# B-Edge Web

Angular 21 workspace for **B-Edge** — a beauty booking platform for Lebanon
and the wider MENA region, positioned as "Fresha for Lebanon." Talks to the
Go API in `b-edge-api`.

Launch partner is Rania, a beauty artist with two studios (Beirut Downtown,
Tripoli). The product is guest-first: customers book with name and phone
only, no account, confirmation over WhatsApp rather than email — a
deliberate fit for a cash/bank-transfer market rather than a card-on-file
one.

---

## Stack

| | |
|---|---|
| Framework | Angular 21 — standalone components, Signals, `inject()` |
| Styling | Tailwind 3 |
| Component library | Angular CDK 21 |
| Icons | lucide-angular (2px stroke, flat line) |
| Node | 22 via nvm |

---

## Workspace layout

```
projects/
  shared/            @bedge/shared — models, ApiService, per-domain data
                      services, auth store, interceptors, DI tokens
  artist-dashboard/   the artist-facing PWA (Rania's dashboard)
  customer-pwa/       the guest booking funnel
```

Three separate deployable apps sharing one library. `shared` is built as a
real Angular library (`ng build shared`) and consumed from `dist/shared`,
not from source — **any change inside `projects/shared` requires a rebuild
before `ng serve` picks it up.** Skipping this produces "my fix didn't
apply" confusion that looks like a caching bug and isn't one.

```bash
ng build shared
ng serve --project artist-dashboard --port 4200
ng serve --project customer-pwa --port 4200   # see CORS note below
```

Both apps default to `:4200`. The Go API's CORS allow-list
(`CLIENT_URL` in its `.env`) currently permits only one origin, so run one
app at a time unless the API is configured for multiple.

---

## `@bedge/shared`

Everything both apps need lives here, organized under `src/lib/`:

- **`core/`** — `api.service.ts` (thin typed wrapper over `HttpClient`,
  unwraps the `{ data, meta?, error? }` envelope every endpoint returns),
  per-domain data services (`artist-data.service.ts`,
  `booking-data.service.ts`, etc.), auth store, interceptors.
- **`models/`** — one file per domain, field names in snake_case to match
  the Go JSON wire format exactly. Barrel-exported via `models/index.ts`.
- **`tokens/`** — `API_CONFIG`, an `InjectionToken` each app provides at
  bootstrap with its own base URL, since a library can't read an app's
  environment file directly.

**`ApiService` has two list methods for a reason.** Go marshals an empty
slice as JSON `null`, not `[]`. `getArray()` and `getList()` both coalesce
that null into an empty array; `get()` is for single resources only and will
happily hand a component a `null` typed as `T[]` if used for a collection.

**Money fields are `string`, never `number`.** The Go backend uses
`shopspring/decimal`, which serializes to a quoted JSON string
(`"200.00"`) to preserve precision. `price`, `deposit_amount`,
`final_price`, and `rating` are all typed as `string` on the TypeScript
side — parsing them into floats for arithmetic is a precision bug waiting to
happen.

---

## The guest booking funnel (customer-pwa)

Routed at a single entry point, `/book/:artistId` — a real, shareable route,
since this is the link that goes in an artist's Instagram bio. Everything
past that is **not** individually routed: a step signal
(`'profile' | 'select-service' | 'pick-datetime' | 'details' | 'confirmed'`)
inside the container component drives which screen renders.

That split is deliberate, not an oversight. A slot hold is a live,
server-side 10-minute lock (`POST /bookings/guest/hold`); giving each step
its own URL would let browser back/forward land a customer on a stale step
holding an expired or already-submitted booking ID. One container owning the
whole draft avoids that class of bug entirely.

```
features/booking-funnel/
  booking-funnel.page.ts     container — owns data fetch + step signal
  booking-funnel.page.html
  screens/
    artist-profile-screen.component.ts      (+ .html)
    select-service-screen.component.ts      (+ .html)
    pick-datetime-screen.component.ts       (+ .html)
```

Screens are presentational — they take `input()`s and emit `output()`s, they
do not fetch. The container fetches artist, services, stores, and portfolio
once in `ngOnInit` and passes them down, so no two screens can show
inconsistent data.

**Slot times render in the store's timezone, not the browser's.** The API
returns UTC instants; an appointment at Beirut Downtown is 6:00 AM Beirut
time whether the customer opens the link from Beirut or from a layover in
Dubai. `pick-datetime-screen.component.ts` uses `Intl.DateTimeFormat` with
an explicit `timeZone: 'Asia/Beirut'` — hardcoded for now since every store
is currently in Lebanon; it belongs on the store record once that's no
longer true.

**Availability is fetched per-date, not pre-loaded for a date range.**
`GET /bookings/slots` runs a multi-step query per call; fanning that out 28
times to pre-grey a month of dates would multiply database load by visitor
count. The date strip instead fetches on tap and shows "no availability"
for empty days. A bulk per-day endpoint is the correct long-term fix and is
tracked as a pre-launch item.

---

## Design system — "Restrained Elegance"

Enterprise-restrained, closer to Uber or Airbnb than to a spa. No script
fonts, no gold, no blue, no purple. Monochrome plus a single functional
green.

```
ink        #0A0A0A    primary actions, headings, selected states
white      #FFFFFF    card surfaces
gray-50    #FAFAFA    page background
gray-100   #F4F4F5    inset dividers, inactive chips
gray-200   #E4E4E7    all structural borders
gray-400   #A1A1AA    placeholders, meta text
gray-500   #71717A    secondary body
success    #16A34A    terminal states only, never decorative
```

These are registered as named Tailwind colors (`bg-ink`, `text-gray-500`,
etc.) in the root `tailwind.config.js`, which scans all three projects plus
`shared`. Templates use the tokens directly rather than arbitrary hex values.

Inter throughout. Headlines 600 weight with negative letter-spacing; body
400; small labels 600 uppercase with `0.05em` tracking. Cards: 12px radius
(`rounded-lg`), 1px `gray-200` border, `0 1px 3px rgba(0,0,0,0.06)` shadow.
Buttons and inputs: 8px radius (`rounded`, the Tailwind default here).
Mobile target viewport 390px. Bottom CTAs: 52px, full width.

Icons: Lucide only, flat-line, 2px stroke, no emoji in the UI. Registered
once per app in `app.config.ts` via `importProvidersFrom(LucideAngularModule.pick({...}))`
— never inside a component's own `imports` array, which breaks Angular's
AOT static analysis of that array.

---

## Angular conventions

- Standalone components, `ChangeDetectionStrategy.OnPush`.
- Signals for local state; template control flow (`@if`, `@for`, `@switch`, `@let`).
- `inject()` with an explicit type annotation under strict mode:
  `private readonly svc: MyService = inject(MyService)`.
- Router-bound inputs need `withComponentInputBinding()` passed to
  `provideRouter()` — without it, a component's `input.required<string>()`
  bound to a route param throws `NG0950` because the router never writes it.
- **Load data in `ngOnInit`, not a constructor `effect()`, for any component
  whose inputs come from the router.** A required input bound via
  `withComponentInputBinding()` on a lazily-loaded route is not guaranteed
  set yet when a constructor-scoped effect first runs — this threw `NG0950`
  in the funnel container until the load moved to `ngOnInit`. Template-bound
  inputs on child components don't have this problem, which is what made it
  confusing to diagnose.
- Pagination metadata from the API is snake_case: `meta.has_more`,
  `meta.next_cursor`.

---

## Environment

Each app provides its own `API_CONFIG` at bootstrap:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api/v1',
};
```

`customer-pwa` intentionally has **no auth interceptor** — the guest funnel
never holds a JWT, so there's no token to attach and no 401 to recover from.
`artist-dashboard` does, plus a `provideAppInitializer` that tries to
restore a session from the httpOnly refresh cookie on boot.

---

## Documentation

`CLAUDE.md` in the repo root is the single source of truth for continuing
work in a new session — current screen status, live test data, footguns,
and open product decisions. Deeper specs (booking domain, PWA architecture,
competitor analysis, infra plan) live alongside it as reference docs.

---

## Live test data (development)

```
Rania (launch artist)
  artist_id         378cd76e-6c75-4c63-9d38-6f8fa211f1e5
  Beirut Downtown   24869c23-b5be-48d1-a22a-08fed461010c
  Tripoli           135c6b9e-04fe-4822-8446-726bbb6c9e4a
```

Funnel entry point in dev: `http://localhost:4200/book/378cd76e-6c75-4c63-9d38-6f8fa211f1e5`

---

*B-Edge · Beauty at the Edge*
