# B-Edge — End-to-End Test Plan

> For a human tester. Every test case is driven **from the UI** — click, type,
> upload, exactly as a real artist or customer would. No `curl`, no direct API
> calls, except where explicitly marked **[NO UI PATH]**, meaning the backend
> endpoint exists but nothing on screen can trigger it yet — that's a finding
> to report, not a step to fake.
>
> Verified directly against the real routes and the real frontend code on
> 2026-08-21, not against old docs. B-Edge has **13 backend API domains** and
> **~100 endpoints** across two Angular PWAs: **customer-pwa** (`:4200`,
> mostly guest, no login required) and **artist-dashboard** (`:4300`,
> authenticated). Backend runs at `:3000`.
>
> **Update, 2026-08-29 (billing + enforcement pass):** The `internal/billing`
> domain shipped (migrations 023-025: `plans`, `subscriptions`, `invoices`),
> all three billing UI screens were built (`/pricing`, `/dashboard/billing`,
> admin Billing/Plans/Artists tabs), and Phase 4 enforcement was wired:
> `past_due`/`suspended` artists hidden from Discover via
> `subscriptionVisibleCond` in `discovery/repository.go`; mutating requests
> on `/api/v1/artists`, `/api/v1/products`, `/api/v1/media` blocked for
> `suspended` artists via `RequireActiveSubscription` middleware; grace/
> past_due/suspended banners added to the dashboard layout. The billing
> coverage map and Suite 8 below were added in this pass. All existing artists
> (Rania + test accounts) are `comped` -> `active`, so enforcement does not
> affect live data. To test non-active subscription states, manipulate dates
> directly in the DB (see Suite 8 setup notes).
>
> **Update, same day:** Gaps G1-G5 below are now closed - artist-dashboard
> gained a sign-up screen, an Add Store modal (Hours), a Reviews screen
> (list + hide/show), the two-step deposit edge case (Deposit Queue), and
> full password recovery + freeze/delete account (Profile). Building the
> real UI paths surfaced **three previously-undetected backend bugs**, each
> now fixed and covered by new tests: (1) `CreateUser` auto-provisioned an
> `artists` row defaulting to `status='active'`, so every new artist
> registration silently bypassed onboarding and admin review entirely - a
> real security-relevant gap, not just a UI one; (2) `GetReviewsByArtist`
> (the artist's own moderation view) filtered `is_visible = TRUE`, the same
> filter the *public* endpoint correctly uses - meaning a hidden review
> could never be shown again, the "show" half of hide/show was dead code
> from day one; (3) `UpdateUserStatus` (backing freeze/unfreeze/delete)
> 500'd on every single call with a Postgres parameter-type error
> (`SQLSTATE 42P08`) - the whole feature was unusable until a live UI call
> finally exercised the real SQL, since the existing test suite is
> mock-based and never runs the real query against a real database. This is
> exactly the class of bug this document exists to catch: none of the
> three had any UI path to reach them before, so nothing had ever run them
> for real.
>
> **Update, second pass (2026-08-21):** Suites 2 and 3 below were then
> actually executed live against the running stack (not just read), which
> surfaced three more real bugs, now fixed and verified live: (4)
> artist-dashboard had **no cancel action anywhere** for any booking — added
> an inline-confirm Cancel button to the Bookings screen
> (`bookings.component.ts`/`.html`), verified a `held` booking correctly
> transitions to `cancelled`; (5) **product photo uploads silently
> discarded** — the Save button on the product form wasn't disabled while
> the Cloudinary upload was still in flight, so a fast click sent the
> create/update request before `imageUrl` was patched with the uploaded
> URL, saving the product with no image despite both requests returning 200
> (`products.component.ts`'s `isFormValid()` now also requires
> `!uploading()`); (6) the **Clients CRM list wrongly excluded customers
> without a completed booking** — `internal/client/repository.go`'s
> `ListClients`/`GetClient` required `b.status = 'completed'` for a
> customer to appear at all, so a customer with only a pending/approved
> booking (i.e. a client-to-be) never showed up; fixed by splitting
> membership (any real booking, excluding only `held`/`expired`) from
> metrics (`bookings_count`/`total_spent`/`last_visit` still computed via
> `FILTER` over completed bookings only, preserving the original "reflect
> money actually earned" intent). A fourth report — "new store missing
> from Profile's store list" — turned out to be a **stale test-plan
> wording bug, not an app bug**: Profile never had a store list; Hours'
> store-tab switcher is the only place stores are listed, by original
> design. Suite 2.1's acceptance criterion and the coverage-map row for
> `GET /artists/salon/stores` below have been corrected accordingly.
>
> **Update, third pass (2026-08-22): Suite 3 fully live-executed.** All nine
> guest-booking journeys (3.1–3.9, including the cross-store travel-buffer
> differentiator) were driven end to end against the real stack — real UI
> clicks, real API calls, real DB checks after every state change. The
> travel buffer, hold-expiry handling (both the client-side countdown and
> the server-side race), the 0-star client-side rating block, review-token
> reuse/invalid-token handling, and the customer/artist cancellation-refund
> split all passed exactly as documented. This pass also found and fixed
> **four more real bugs**, all in the same family as the approve-past-booking
> fix from earlier today - a status transition with no check on whether the
> appointment time makes sense for that transition: (7) `MarkNoShow` had no
> `start_time` guard at all - a confirmed booking **days in the future**
> could be marked no-show, with the "No show" button not even hidden
> client-side; (8) `CompleteBooking` had the identical gap - a booking could
> be marked complete (firing its review-request WhatsApp message) before the
> appointment had even happened; both now reject with `BOOKING_NOT_STARTED`
> server-side, and both action buttons are correctly hidden client-side
> until start_time has passed. (9) A deposit-window bug distinct from the
> earlier past-approval one: approving a *legitimately future* pending
> request whose appointment is sooner than the service's configured deposit
> window (e.g. a 24h-deposit service approved 10h before the appointment)
> produced a `deposit_deadline` that was **already in the past** at the
> moment of approval, and a WhatsApp message claiming "24 hours" while the
> real deadline had already lapsed - fixed with a capped grace-window
> fallback (`depositGraceWindow`, `internal/booking/service.go`) that's
> always between now and the appointment, with the message text now
> reporting the real remaining time, not the nominal one. (10) Abandoned
> holds (a guest who picked a slot and never submitted) permanently blocked
> their slot forever, since nothing ever ran the existing
> `ReleaseExpiredHolds` cleanup - confirmed live with 9 real stale holds
> sitting in the DB, some from over a month earlier. Fixed with lazy expiry
> on read: every `GetAvailableSlots` call now sweeps this artist's expired
> holds first, self-healing on the same request that would otherwise have
> seen a falsely-blocked slot - no new background process needed.
>
> **Update, fourth pass (2026-08-22): Suite 4 fully live-executed, zero bugs
> found.** All six product-store cases (4.1-4.6) were driven end to end:
> adding a product with a real 15MB+ image (server-side resize offer,
> verified against a genuine ~30MB random-noise PNG, not a fake), the
> malware-defense upload check (a plain-text file renamed `.jpg` was
> correctly rejected server-side via content sniffing + decode,
> `INVALID_IMAGE`), stock-zero sold-out behaviour and restock, product
> deactivation (correctly hidden from the public shop, still visible in
> the dashboard behind "Show inactive"), guest checkout with a real
> dropped delivery pin (confirmed `delivery_lat`/`delivery_lng` populated
> in the DB, and the order-confirmed screen correctly shows payment
> instructions without a login wall - the once-fixed regression stayed
> fixed), the full confirm→ship→deliver fulfillment path (verified live
> from the customer's own My Orders view after each step, not just the
> dashboard side), and order cancellation (a `placed` order cancels
> cleanly to the Cancelled tab with a second-tap confirmation; a `shipped`
> order correctly has no cancel option at all). Everything matched the
> suite's documented expectations exactly - this is the first full suite
> pass this session with no bugs to report.
>
> **Update, fifth pass (2026-08-22): Suites 5-7 fully live-executed - all
> 7 end-to-end suites in this document have now been driven for real at
> least once.** Suite 5 (logged-in customer account): phone/OTP login,
> the Upcoming/Past split re-verified correctly with a genuine past-due
> pending booking, the booking-detail back button, My Orders
> expand/collapse (full item list + delivery note + timeline), a
> cancelled order correctly showing its cancellation reason instead of a
> timeline, and sign-out/re-login correctly clearing then restoring
> session and history - all passed, zero bugs. Suite 6 (Client CRM): the
> broadened client-list membership from the earlier Clients bug re-verified
> live via the dashboard UI (not just the API this time), a client's own
> detail page correctly scoped to their own history only, and note editing
> confirmed as genuine full-replace (`PUT`), not append - all passed, zero
> bugs. Suite 7 (Earnings): the revenue total was cross-checked against a
> manual `SUM(final_price)` query for completed/no-show bookings in the
> period and matched exactly ($385.50 → displayed $386, 3 bookings, correct
> by-service breakdown) - passed. Every suite in this document has now been
> live-executed against the real stack at least once this session, finding
> and fixing 10 real bugs total (see the update notes above) plus 2 stale
> test-plan wording corrections. The remaining open item is the §3
> exhaustive stress pass, explicitly out of scope for these five passes.
>
> **Update, final session (2026-08-22): a persistent multi-persona test
> roster was built and exercised creatively across regions, products, and
> concurrency - closing out this document's live-testing effort.** 10
> customer accounts (`user1`-`user10`, phone `71900001`-`71900010`, dev-bypass
> OTP login) and 4 artist accounts (`mkup1`-`mkup4`, real email+password,
> one per category: lashes/makeup/hair/nails) were created as **permanent**
> fixtures - unlike every other account this document has used, these are
> not cleaned up and are meant to stay for future testing. `mkup2` was
> expanded to 3 branches (Beirut, Zahle/Bekaa, Halba/Akkar) using the real
> "Add store" feature, and the cross-region travel buffer was verified
> precisely across all three - a Beirut booking correctly blocked both
> distant regions until exactly the buffer boundary (150min weekday), and
> cancelling that booking correctly released the block on both, confirmed
> live. 11 new services were added using realistic real-world names and
> pricing (Airbrush Makeup, Balayage, Volume Lash Extensions, etc. -
> researched, not invented). A full guest product purchase was driven to
> completion (browse → cart, stock-cap held correctly under both rapid-click
> UI abuse and a direct over-limit API call → real dropped pin → placed →
> confirmed with a payment reference → shipped → delivered, verified live
> from the artist's Orders screen at every step) and a confirmed makeup
> booking was cancelled artist-side with a real reason. Service price
> boundaries ($0 allowed, negative rejected) and Arabic/RTL + emoji input
> were also exercised live, not just assumed safe.
>
> This pass found **2 more real bugs**, both severe: (11) the self-service
> onboarding flow created the artist, salon, store, and service, but never
> inserted the `artist_stores` link - every artist who onboarded through
> the real flow was invisible on Discover and completely unbookable (the
> booking funnel's own store picker depends on the same table), confirmed
> by onboarding 4 fresh artists and finding none of them reachable; fixed
> in the same transaction, verified against a fresh throwaway artist, then
> repaired in place for `mkup1`-`mkup4`. (12) `special_requests` (allergies,
> access notes, preferences a customer writes at booking time) was fully
> present in the backend response and the TS model, but never rendered
> anywhere in artist-dashboard - discovered by booking with a realistic
> Arabic allergy note and finding it simply didn't appear on the artist's
> own Bookings card; fixed with a clearly-labeled note block, RTL-aware
> (`dir="auto"`).
>
> Combined with the concurrency and boundary-condition audit done the same
> day (not tracked in this document - see `bedge-backend-reviewer.md` and
> the `internal/booking` commit history): the guarded-atomic-UPDATE
> concurrency pattern was proven safe under 6 real concurrent
> approve-vs-cancel races, not just assumed from reading the SQL, and a
> stale pending booking now lazily expires on the same read path that would
> otherwise have shown it forever. **Total across every live-testing pass
> this session: 12 real bugs found and fixed**, plus 2 stale test-plan
> wording corrections, plus the concurrency/timezone audit. The only
> remaining unexecuted item in this entire document is the §3 exhaustive
> stress pass (every button, every boundary value, 3 viewports) -
> deliberately out of scope throughout, given its lower observed bug-yield
> against real end-to-end journeys.

---

## 0. Before you start

**Environment**
- Backend up: `curl http://localhost:3000/api/v1/health` → `200`
- customer-pwa up: `http://localhost:4200`
- artist-dashboard up: `http://localhost:4300`
- Postgres reachable via `docker exec bedge-postgres psql -U postgres -d bedge`

**Test accounts you'll need**
- One artist account, already past onboarding (`status: active`) — e.g. `rania@bedge.com` / `password123` if seeded, or create your own (see Gap G1 below — there's no self-serve way to get the *first* account today).
- A second, fresh artist account **not yet onboarded**, to run the onboarding journey (Suite 1) without disturbing the first.
- Two customer phone numbers you control the OTP for (see below).

**Permanent multi-persona roster (added 2026-08-22, do not delete)** — for
any test needing more than one real artist/customer at once (cross-store
travel-buffer, CRM with real history, concurrency), these already exist and
are meant to stay:
- Customers `user1`-`user10` — phone `71900001`-`71900010`, log in via
  `/login` → phone → the dev-bypass OTP code (`326321`, see below). No
  passwords; customers never have them in this app.
- Artists `mkup1` (lashes, Jounieh) / `mkup2` (makeup, Beirut **+ Zahle +
  Halba** — a genuine 3-region traveling artist, good for travel-buffer
  tests) / `mkup3` (hair, Tripoli) / `mkup4` (nails, Beirut) — email
  `mkup<N>@test.bedge.com`, password `password<N>`. All `status: active`,
  all with real, researched services already added.
- These accounts already have real booking/order history (a confirmed
  booking, a cancelled/`refund_due` booking, a delivered product order) —
  don't be surprised to see it; it's expected, not test debris to clean up.

**Getting a customer OTP code without WhatsApp**
WhatsApp isn't wired to a live provider yet — codes are queued but not delivered. Request a code from the login screen as normal, then read the plaintext code the backend queued:
```sql
SELECT payload FROM notifications
WHERE recipient_phone = '<the phone you entered>'
ORDER BY created_at DESC LIMIT 1;
```
Rate limit: 3 requests per phone per 5 minutes. If you burn through it during repeated test passes, insert a row directly instead of waiting:
```sql
-- code below is plaintext '123456'; hash is sha256(code)
INSERT INTO customer_otps (phone, otp_hash, expires_at)
VALUES ('<phone>', '<sha256 hex of your chosen code>', now() + interval '15 minutes');
```

**Data hygiene**
Prefix anything you create with `QATEST_` (names, bios, product names) so it's identifiable, and clean it up after each pass — cancel test bookings/orders, delete test reviews, deactivate test products/stores. Don't leave test data behind for the next person.

**Viewports to repeat every suite at**
customer-pwa is mobile-first — run each customer-facing suite at **390×844** (phone) at minimum, then spot-check at **768×1024** and **1440×900**. artist-dashboard should be run at **390×844** (mobile bottom nav / "More" sheet) and **1440×900** (desktop sidebar) at minimum.

---

## 1. API → UI coverage map

Every real route in the codebase, and exactly what on screen triggers it. Use this to make sure nothing gets skipped. **⚠️ NO UI PATH** means: don't invent a workaround, don't call the API directly to "test" it — report it as a gap.

### `auth` — artist email/password (10 endpoints)

| Endpoint | UI trigger |
|---|---|
| `POST /auth/login` | artist-dashboard **Login** screen |
| `POST /auth/refresh` | automatic, on app load (not user-triggered) |
| `POST /auth/logout` | **Sign out** link, dashboard sidebar / mobile "More" sheet footer |
| `POST /auth/register` | `/register` — **"Sign up"** link from `/login`. Fixed alongside: `CreateUser` no longer auto-provisions an `active` artists row (see update note above) — registering now correctly lands on the real onboarding form. |
| `POST /auth/forgot-password` | `/forgot-password` — **"Forgot password?"** link from `/login` (that link already existed; the page behind it didn't) |
| `POST /auth/reset-password` | `/reset-password?token=...` — the link sent via the forgot-password flow |
| `PATCH /auth/change-password` | Profile → **Account security** → **Change password** |
| `PATCH /auth/freeze-account` | Profile → **Danger zone** → **Freeze**. Fixed alongside: `UpdateUserStatus` 500'd on every call before this (see update note above). |
| `PATCH /auth/unfreeze-account` | Profile → **Danger zone** → **Unfreeze** (only reachable within the same session that froze it — see the component's own doc comment) |
| `DELETE /auth/delete-account` | Profile → **Danger zone** → **Delete account** → type your email to confirm → **Permanently delete** |

### `onboarding` (2 endpoints)

| Endpoint | UI trigger |
|---|---|
| `POST /onboarding/complete` | artist-dashboard `/onboarding` — the one-page form's **submit** |
| `GET /onboarding/status` | automatic, on every dashboard load (redirects to pending/rejected state or `/onboarding` itself) |

### `admin` — artist approvals (3 endpoints)

| Endpoint | UI trigger |
|---|---|
| `GET /admin/artists/pending` | artist-dashboard `/admin` page load (Approvals tab) |
| `POST /admin/artists/:id/approve` | **Approve** button on a pending-artist card |
| `POST /admin/artists/:id/reject` | **Reject** → confirm reason → **Reject** (two-tap, inline) |

### `billing` — artist-facing (3 endpoints)

| Endpoint | UI trigger |
|---|---|
| `GET /billing/plans` | public `/pricing` page load (no auth required) |
| `GET /billing/subscription` | dashboard `/dashboard/billing` load; also triggered silently on every dashboard page load by the layout component (drives the grace/past_due/suspended banners) |
| `GET /billing/invoices` | dashboard `/dashboard/billing` load (invoice history + outstanding invoice) |
| `POST /billing/invoices/:id/submit` | Billing → outstanding invoice section → **I've paid** → optional reference → **Submit** modal |

### `billing` — admin-facing (5 endpoints)

| Endpoint | UI trigger |
|---|---|
| `GET /admin/billing/invoices?status=submitted` | `/admin` → **Billing** tab load (confirmation queue) |
| `GET /admin/billing/overview` | same Billing tab load (full artist roster, sorted by outstanding amount) |
| `POST /admin/billing/invoices/:id/confirm` | Billing tab → confirmation queue → **Confirm paid** on a submitted invoice card |
| `POST /admin/billing/invoices/:id/void` | Billing tab → **Void** → required reason textarea → **Confirm void** |
| `PATCH /admin/billing/subscriptions/:id` | **Artists** tab → artist card → **Edit** (plan/seats/trial/period dates) or **Cancel** / **Reinstate** (separate one-tap actions, not in the edit form) |
| `GET /admin/plans` | **Plans** tab load |
| `POST /admin/plans` | Plans → **New plan** → fill form → **Create plan** |
| `PATCH /admin/plans/:code` | Plans → **Edit** on an existing plan card → change fields → **Save changes** |

### `artist` (17 endpoints)

| Endpoint | UI trigger |
|---|---|
| `GET /artists/me` | dashboard **Profile** load |
| `PATCH /artists/:id` | Profile → edit bio/instagram → **Save changes**; also avatar upload/remove |
| `GET /artists/:id` , `/:id/services`, `/:id/stores` | customer-pwa artist profile screen (`/book/:handle`) load |
| `GET /artists/salon/stores` | dashboard **Hours** page → store-tab switcher (Profile has no store list) |
| `POST /artists/salon/stores` | dashboard **Hours** page → **Add store** (top-right of the page, next to the store tabs) |
| `PATCH /artists/stores/:store_id` | store settings edit (active toggle, name, etc.) |
| `GET/POST /artists/salon/services` | dashboard **Services** page load / **Add service** |
| `PATCH /artists/salon/services/:service_id` | Services → tap a service → edit → **Save** |
| `DELETE /artists/salon/services/:service_id` | Services → **Delete** on a service card |
| `GET/POST /artists/stores/:store_id/hours` | dashboard **Hours** page → weekly grid → **Save** |
| `GET/POST /artists/stores/:store_id/exceptions` | Hours → **Add exception** (blackout date) |
| `DELETE /artists/stores/:store_id/exceptions/:date` | Hours → **Remove** on an exception row |

### `booking` (18 endpoints)

| Endpoint | UI trigger |
|---|---|
| `GET /bookings/slots` | customer-pwa **pick-datetime** screen, date/store tab change |
| `POST /bookings/guest/hold` | pick-datetime → tap a time slot |
| `PATCH /bookings/guest/:id/submit` | guest-details screen → **Confirm booking** |
| `POST /bookings/waitlist` | pick-datetime, no slots → **Notify me if a spot opens up** |
| `POST /bookings` | logged-in customer booking (if/where this path exists — verify; guest is the primary path) |
| `PATCH /bookings/:id/submit` | logged-in customer's own submit step, if applicable |
| `PATCH /bookings/:id/approve` | dashboard Bookings → **Approve** on a pending card |
| `PATCH /bookings/:id/confirm-payment` | dashboard Bookings → **Verify Payment** (the one-tap deposit confirm — this is the real, live path) |
| `PATCH /bookings/:id/deposit-received` | dashboard **Deposits** → Verify modal → **"Only part of it arrived? Mark as partially received"** (secondary text link, deliberately less prominent than the primary Verify flow) |
| `PATCH /bookings/:id/confirm-deposit` | dashboard **Deposits** → a card in `deposit_paid` status shows **Confirm booking** directly (no modal needed, nothing left to verify) |
| `PATCH /bookings/:id/cancel` | dashboard Bookings **and** customer-pwa My Bookings, both have a **Cancel** action |
| `PATCH /bookings/:id/complete` | dashboard Calendar/Bookings → **Mark complete** (fires the review-request WhatsApp message) |
| `PATCH /bookings/:id/no-show` | dashboard Bookings → **No-show** |
| `GET /bookings/artist/:id` | dashboard Bookings list load |
| `GET /bookings/artist/:id/calendar` | dashboard Calendar load |
| `GET /bookings/artist/:id/waitlist` | dashboard Waitlist load |
| `GET /bookings/customer/me` | customer-pwa My Bookings load (requires login) |

### `product` (12 endpoints)

| Endpoint | UI trigger |
|---|---|
| `GET /products/salons/:id/products` | customer-pwa Shop page load |
| `POST /orders` | Cart → **Place order** |
| `GET /orders/me` | customer-pwa My Orders load (requires login) |
| `GET /orders/:id` | Order-confirmed screen load |
| `PATCH /orders/:id/cancel` | My Orders → **Cancel order** |
| `POST /artists/products` | dashboard Products → **Add product** |
| `PATCH /artists/products/:id` | Products → edit modal → **Save** (also used for the active/inactive toggle — there is no delete endpoint, deliberately: deactivating is the "take it off sale" action) |
| `GET /artists/products` | dashboard Products load |
| `GET /artists/orders` | dashboard Orders load |
| `PATCH /artists/orders/:id/confirm-payment` | Orders → **Confirm payment** |
| `PATCH /artists/orders/:id/ship` | Orders → **Mark shipped** |
| `PATCH /artists/orders/:id/deliver` | Orders → **Mark delivered** |

### `review` (8 endpoints)

| Endpoint | UI trigger |
|---|---|
| `POST /reviews` | Deliberately still no UI — the guest-token flow below is the one live review-creation path for every customer, logged in or not; a second authenticated path would be redundant, not a gap |
| `GET /reviews/artist/:id` | dashboard **Reviews** screen load (in the mobile "More" sheet, full sidebar item on desktop). Fixed alongside: this query used to filter `is_visible = TRUE`, the same filter the *public* endpoint correctly uses — see the update note above. Also note: no ownership check exists server-side on this endpoint (any authenticated artist can view another artist's full review list by ID) — flagged, not fixed, out of scope for the UI gap this closes. |
| `DELETE /reviews/:id` | Deliberately still no UI — this is customer-owned (only the review's author or an admin may call it per `review/service.go`), not an artist action, and there's no "my reviews" customer surface to hang it off yet |
| `PATCH /reviews/:id/hide` | dashboard **Reviews** → **Hide from profile** |
| `PATCH /reviews/:id/show` | dashboard **Reviews** → **Show on profile** |
| `GET /reviews/by-token/:token` | customer-pwa `/review/:token` page load |
| `POST /reviews/by-token/:token` | `/review/:token` → star rating → **Submit review** |
| `GET /public/reviews/artist/:id` | customer-pwa artist Reviews screen load |

### `media` (11 endpoints)

| Endpoint | UI trigger |
|---|---|
| `GET /media/portfolio/:artist_id` | customer-pwa artist profile, portfolio section |
| `GET /media/products/:product_id/photos` | Shop → product detail, gallery section |
| `GET /media/my` | dashboard Profile → Portfolio section load |
| `POST /media/upload` | any of the three upload entry points below (avatar, portfolio, product photo) |
| `POST /media` | Profile → Portfolio → **Add photo**, after upload |
| `PATCH /media/reorder` | Portfolio grid reorder |
| `POST /media/products/:id/photos` | Products → edit → **Additional photos** → **Add photo** |
| `PATCH /media/products/:id/photos/reorder` | product gallery reorder |
| `DELETE /media/product-photos/:id` | product gallery → **Delete** |
| `DELETE /media/:id` | Portfolio → **Delete** |
| `PATCH /media/:id/cover` | Portfolio → **Set as cover** |

### `discovery`, `client`, `earnings`, `customerauth` (10 endpoints)

| Endpoint | UI trigger |
|---|---|
| `GET /discovery/artists` | customer-pwa Discover page load, search/filter |
| `GET /discovery/artists/:id` | Discover → tap an artist card |
| `GET /clients` | dashboard Clients list load |
| `GET /clients/:customer_id` | Clients → tap a client |
| `PUT /clients/:customer_id/notes` | Client detail → notes field → **Save** |
| `GET /earnings/summary` | dashboard Earnings load |
| `POST /customer-auth/request-otp` | customer-pwa Login → **Send code** |
| `POST /customer-auth/verify-otp` | Login → code entry → **Verify** |
| `POST /customer-auth/refresh` | automatic on app load |
| `POST /customer-auth/logout` | My Bookings/My Orders → **Sign out** |

---

## 2. End-to-end journeys

Given/When/Then, numbered, each ending in a concrete pass/fail check against the **real** database or a **real** screenshot — not "looks right."

### Suite 1 — Bring a new artist from zero to bookable

**1.1 — Create the underlying account**
- `/login` → **Sign up** → fill name, email, password, confirm → **Create account**
- Then you land on `/onboarding`, already authenticated, with the real onboarding form showing — not the dashboard. (This used to skip straight to the dashboard, bypassing onboarding and admin review entirely — a real bug, fixed; re-verify this specifically if you ever touch `CreateUser` or the onboarding gate again.)

**1.2 — Log in for the first time**
- Given a freshly registered, not-yet-onboarded artist account
- When you enter the email/password on `/login` and submit
- Then you land on `/onboarding` automatically (not `/dashboard`) — the redirect guard, not a manual nav, should do this

**1.3 — Complete self-service onboarding**
- Given the one-page onboarding form
- When you fill: handle, bio, category, salon name, first store name/city/address, first service name/duration/price, and submit
- Then the screen shows a **pending review** state, not the dashboard
- And in the DB: a `salons` row, one `stores` row, one `artists` row with `status = 'pending'`, one `services` row exist
- Test the validation too: submit with an empty handle, a duplicate handle, a negative price, a zero-duration service — each should show a field-level error, not a generic failure

**1.4 — Try to skip ahead while pending**
- Given the same account, still pending
- When you manually navigate to `/dashboard/bookings`, `/dashboard/services`, any dashboard URL
- Then you're redirected back to `/onboarding` — every dashboard screen except Profile should be unreachable while pending (Profile is intentionally allow-listed so photos can be added early)

**1.5 — Admin approves**
- Given a second browser session logged in as admin
- When you open `/admin`, find the pending artist, tap **Approve**
- Then the artist row becomes visible on the pending queue no longer, and an audit log entry is written
- Also test **Reject**: with a second pending artist, tap Reject, type a reason, confirm — check the artist's `/onboarding` screen shows the generic rejected state ("Your application wasn't approved... get in touch with us"). The reason you typed is intentionally **not** shown to the artist — it's written only to the admin audit log (`admin/service.go`'s `Reject`), never to the `artists` table or `GetStatus`, so there's nothing for the frontend to display even if it tried. Don't expect to see your typed reason anywhere outside the admin side.

**1.6 — First real login as an active artist**
- Given the now-approved account
- When you log in
- Then you land on `/dashboard/bookings`, the full sidebar/bottom-nav is available, and the "still under review" banner is gone

### Suite 2 — Build out the salon: stores, hours, services

**2.1 — Add a second store/branch**
- Given an active artist with one store
- When you open **Hours** → **Add store** → fill name, city (address/phone optional) → **Add store**
- Then the new store appears as a new tab on Hours immediately, auto-selected. (Profile has no separate store list — Hours' store-tab switcher is the only place stores are listed; don't expect it on Profile.)

**2.2 — Set business hours for both stores**
- For each store, each day of the week: toggle open/closed, set open/close time, save
- Edge case: try an open time *after* the close time — should be rejected with a clear message, not silently accepted
- Edge case: submit `09:00` instead of `09:00:00` in any raw-input path — the API expects `HH:MM:SS`; the UI should never let this reach the API malformed, so if it does, that's a bug to report

**2.3 — Add a blackout/exception date**
- Hours → Add exception → pick a date, mark closed (or custom hours) → save
- Then that date's slots disappear from the customer-facing pick-datetime screen for that store
- Delete the exception → confirm slots return

**2.4 — Add, edit, and delete a service**
- Services → **Add service**: name, duration, price, deposit amount → save → appears in the list and on the public artist profile
- Edit the same service: change price and duration → save → both the dashboard and the public profile reflect the new values
- Delete it → confirm it's gone from both, and that any *existing* booking that already referenced it is untouched (don't cascade-break history)
- Edge case: try to delete a service that has a future confirmed booking against it — decide what *should* happen (block it? warn? allow it?) and check the actual behavior matches something defensible, not silently allowed

### Suite 3 — Guest books an appointment, end to end

**3.1 — Discover the artist**
- customer-pwa `/` → search/filter by city and category → tap the artist card
- Then you land on `/book/:handle`

**3.2 — Pick a service and a slot**
- Tap **Book an appointment** → pick a service → pick a store tab → pick a date → pick a time slot
- Then a 10-minute hold is created — verify in DB: a `bookings` row with `status = 'held'`, `held_until` ~10 minutes out
- Edge case: open the same slot in a second browser/incognito tab simultaneously — the second attempt should fail cleanly (slot taken), not double-book

**3.3 — Submit guest details**
- Fill name, phone, optional notes → **Confirm booking**
- Then `status` flips to `pending`, the hold countdown UI disappears
- Edge case: let the hold visibly expire (wait it out, or manipulate `held_until` in a throwaway row) → confirm the UI shows the "slot expired, choose again" state, not a silent failure

**3.4 — Artist approves and the customer pays a deposit**
- Dashboard Bookings → find the pending booking → **Approve**
- Then status → `approved`, and (if the service has a deposit) a deposit-deadline is set
- Simulate the OMT/Whish transfer landing → **Verify Payment**
- Then status → `confirmed`

**3.5 — Cross-store travel-buffer conflict** (this is B-Edge's real differentiator — test it deliberately, don't skip it)
- Given the same artist has a confirmed booking at Store A ending at, say, 10:00
- When a guest tries to book Store B for a time inside the travel-buffer window after 10:00 (150min weekday / 90min weekend by default)
- Then that slot must not appear as available at Store B
- And a slot *outside* the buffer window must appear normally

**3.6 — Complete the booking and leave a review**
- Dashboard → **Mark complete**
- Then a review-request WhatsApp message is queued (check `notifications` table if WhatsApp isn't live) with a real `review_token`
- Open `/review/:token` → rate it, leave a comment → **Submit review**
- Then it appears on the artist's public Reviews screen and profile rating updates
- Edge case: reopen the same `/review/:token` URL again → should show "already reviewed," not a blank editable form
- Edge case: try an invalid/garbage token → clean "link isn't valid" message with a way back to Discover, not a dead end

**3.7 — Cancellation, both directions**
- As the customer, cancel a different confirmed booking from My Bookings, inside the 24h window → check the fee/refund messaging shown matches the actual policy
- As the artist, cancel a booking from the dashboard → status should reflect `refund_due` where appropriate, not just `cancelled`

**3.8 — No-show**
- Dashboard Bookings → a confirmed booking whose time has passed → **No-show**
- Then status → `no_show`, confirm it shows correctly under the customer's My Bookings history too

**3.9 — Waitlist**
- Pick-datetime with a fully-booked day → **Notify me if a spot opens up** → enter phone/name
- Then a `waitlist` entry exists and appears on the dashboard Waitlist screen

### Suite 4 — Product store, guest checkout to delivery

**4.1 — Add a product**
- Dashboard Products → **Add product**: name, category, price, stock quantity, image upload → save
- Then it appears in the artist's shop, live, with the uploaded photo
- Edge case: upload a non-image file renamed with a `.jpg` extension → must be rejected server-side even though it may pass a naive client-side check (this is the malware-defense path — confirm the real backend message appears, not a generic failure)
- Edge case: upload an image over 15MB → confirm the "resize and upload for you?" offer appears, accept it, confirm the resized upload succeeds

**4.2 — Edit stock and price; test sold-out behavior**
- Set stock to 0 → confirm the product shows **Sold out** on the customer-facing shop and the add-to-cart control disappears
- Restore stock → confirm it's purchasable again

**4.3 — Deactivate a product**
- Products → toggle inactive → confirm it disappears from the customer shop but still shows (behind an "include inactive" toggle) in the dashboard — there's no hard delete, by design; check that's really how it behaves

**4.4 — Guest checkout, real delivery pin**
- Shop → add 1-2 products to cart → Cart → fill name/phone → **drop a real pin** on the delivery map (not skip it) → optional delivery notes → **Place order**
- Then you land on the order-confirmed screen showing payment instructions — **not** a login wall (this exact regression was fixed once already; re-verify it stays fixed)
- Check DB: an `orders` row with `delivery_lat`/`delivery_lng` populated from the pin, not null

**4.5 — Artist fulfills the order**
- Dashboard Orders → find it → **Confirm payment** → **Mark shipped** → **Mark delivered**
- After each step, reload My Orders as the guest/customer and confirm the status + timeline stepper advances to match — don't just trust the dashboard side

**4.6 — Cancel an order**
- From My Orders, cancel a `placed` or `confirmed` order → confirm it moves to the Cancelled tab
- Confirm a `shipped` order has **no** cancel option available — physical goods in transit shouldn't be cancellable from the UI

### Suite 5 — Logged-in customer account

**5.1 — Phone/OTP login**
- customer-pwa `/login` → enter phone → **Send code** → enter the real code from the DB (see §0) → **Verify**
- Then you land on My Bookings, logged in

**5.2 — My Bookings tabs**
- Confirm Upcoming only shows bookings that are both a non-terminal status *and* in the future — a `pending` booking whose time has already passed should show under Past, not Upcoming (this was a real bug fixed once — re-verify)
- Tap into a booking's detail screen; confirm the back button has an accessible label and actually returns you to the list

**5.3 — My Orders, expand/collapse**
- Tap an order card → confirm it expands in place to show the full item list, delivery note, and a status timeline (not just the one-line summary)
- Confirm a `cancelled` order shows the cancellation reason instead of the timeline

**5.4 — Sign out and back in**
- Sign out from both My Bookings and My Orders (both have the control) → confirm you land on `/`
- Log back in with the same phone → confirm your booking/order history is still there

### Suite 6 — Client CRM (artist side)

**6.1** — Dashboard Clients → confirm every customer who's ever booked appears, with visit count/history
**6.2** — Tap into a client → confirm full booking history for that specific person, not the whole business
**6.3** — Add a note on a client → save → reload the page → confirm the note persisted (this is a `PUT`, full-replace — editing and re-saving should overwrite cleanly, not append)

### Suite 7 — Earnings

**7.1** — Dashboard Earnings → confirm the summary reflects real completed/confirmed bookings for a known test period, not just "a number shows up." Cross-check the total against a manual sum of a few real bookings' `final_price`.

### Suite 8 — Billing, subscription enforcement, and admin billing console

> **Setup note.** All current artists are `comped` → `active`. To test non-active
> states you must manipulate subscription dates directly in the DB. Use these
> snippets — they are safe to run repeatedly against the `mkup1` test account
> and safe to undo:
>
> ```sql
> -- Find mkup1's subscription ID
> SELECT sub.id, sub.plan_code, sub.current_period_end
> FROM subscriptions sub JOIN artists a ON a.id = sub.artist_id
> JOIN users u ON u.id = a.user_id WHERE u.email = 'mkup1@test.bedge.com';
>
> -- Put mkup1 into grace (windows are 21/45 as of Aug 31 2026 - 3 days is well inside grace):
> UPDATE subscriptions SET current_period_end = NOW() - INTERVAL '3 days',
>   plan_code = 'starter', monthly_price = 7.00 WHERE id = '<sub_id>';
>
> -- Put mkup1 into past_due (must now be >21 days; 12 days is GRACE since Aug 31 2026):
> UPDATE subscriptions SET current_period_end = NOW() - INTERVAL '30 days'
>   WHERE id = '<sub_id>';
>
> -- Put mkup1 into suspended (must now be >45 days; 25 days is PAST_DUE since Aug 31 2026):
> UPDATE subscriptions SET current_period_end = NOW() - INTERVAL '60 days'
>   WHERE id = '<sub_id>';
>
> -- Restore mkup1 to comped/active:
> UPDATE subscriptions SET plan_code = 'comped', monthly_price = 0,
>   current_period_end = NULL WHERE id = '<sub_id>';
> ```
>
> Run the restore snippet when done. Do not leave mkup1 in a non-active state
> between test passes or it will confuse the next tester.

**8.1 — Comped artist billing screen (the normal state for all current artists)**
- Log in as Rania (`rania@bedge.com`) → `/dashboard/billing`
- Then: plan shows "Comped" with an Active badge, no invoice section, no "I've paid" button, no payment instructions
- No banner anywhere in the dashboard (comped = active = no enforcement)
- DB confirm: Rania's `subscriptions` row has `plan_code = 'comped'`, `monthly_price = 0`

**8.2 — Public pricing page**
- Open `http://localhost:4300/pricing` in an incognito window (not logged in)
- Then: 4 tier cards render (Starter, Growth, Studio, Multi-location) with real prices read from the API — not hardcoded
- Growth card has a "Recommended" badge; no Comped card visible (is_public = false)
- FAQ section visible; CTA links to `/register`
- DB confirm: `SELECT * FROM plans ORDER BY sort_order` — prices match what the page shows

**8.3 — Outstanding invoice: submit payment reference**
- Set mkup1 to `starter` with `current_period_end` 3 days ago (grace state, see setup)
- Log in as mkup1 → `/dashboard/billing`
- Then: amber "payment is overdue" banner visible on the billing screen AND in the dashboard layout (every page)
- Outstanding invoice card visible with the correct amount and due date
- "I've paid" button enabled → tap it → reference input modal opens
- Enter a realistic reference ("Whish #99821") → **Submit**
- Then: invoice status flips to `submitted`, button disappears, card updates to "Awaiting confirmation" copy, reference shown
- DB confirm: `SELECT status, payment_reference, submitted_at FROM invoices WHERE artist_id = '<mkup1_artist_id>'` — status = 'submitted', reference = 'Whish #99821'

**8.4 — Admin confirms payment**
- Log in as admin → `/admin` → **Billing** tab
- Then: mkup1's invoice appears in the "Needs confirmation" section with the submitted reference
- Tap **Confirm paid** → confirm it disappears from the queue immediately
- DB confirm: invoice `status = 'paid'`, `paid_at` is set, `confirmed_by` = admin's user_id
- Also confirm: mkup1's `current_period_end` in `subscriptions` advanced by one month
- Log back in as mkup1 → billing screen → subscription status badge = Active, no outstanding invoice, past invoice appears in history as "paid"
- Edge case: tap **Confirm paid** a second time on an already-paid invoice (simulate via direct API call or find another submitted one) → must return a visible error, not silently extend the period again (the backend returns a 409 for this — verify the admin UI surfaces it)

**8.5 — Admin voids an invoice**
- Create a second test invoice in `submitted` state (manipulate dates to trigger lazy generation, or insert directly)
- Admin Billing tab → **Void** → leave the reason blank → **Confirm void** should be disabled
- Enter a reason → **Confirm void** → invoice disappears from queue
- DB confirm: `status = 'void'`, `void_reason` populated
- Log in as mkup1 → billing screen → voided invoice appears in history with "void" badge

**8.6 — Discovery enforcement: past_due artist hidden from Discover**
- Set mkup1 to past_due (**30** days overdue - see setup; 12 days is grace since the Aug 31 2026 window change)
- customer-pwa Discover → search for mkup1 by name or city → must not appear in results
- Navigate directly to `/book/mkup1` (if mkup1 has a handle) → must return a not-found state, not the artist profile
- Log in as mkup1 → dashboard still fully accessible (only read from Discover is blocked, not dashboard access) → amber "past due" banner visible on every page, including the layout
- Restore mkup1 to active → Discover search → mkup1 appears again immediately (no cache to clear, status is derived at read time)

**8.7 — Write enforcement: suspended artist cannot mutate services/products/media**
- Set mkup1 to suspended (25 days overdue, see setup)
- Log in as mkup1 → red "suspended" banner visible on every dashboard page
- Try to add a new service: Services → **Add service** → fill form → **Save** → must fail with a clear error message (backend returns SUBSCRIPTION_SUSPENDED, frontend should surface it — check that `extractApiErrorMessage` picks it up, not a generic "something went wrong")
- Try to edit an existing service → same result
- Try to add a product → same result
- Try to upload a portfolio photo → same result
- Confirm reads still work: Bookings list loads, Calendar loads, Clients list loads, Earnings loads — suspended = read-only, not locked out
- Confirm **Billing screen** still works: `/dashboard/billing` loads, outstanding invoice visible, "I've paid" submit still works (billing routes are excluded from the write-block deliberately)
- Booking lifecycle: if mkup1 has an existing confirmed booking, approve/complete/cancel it from the dashboard → must succeed (existing bookings are honored regardless of subscription state)

**8.8 — Admin Plans tab: create and edit a tier**
- Admin → **Plans** tab → **New plan** → fill: code=`enterprise`, name=`Enterprise`, monthly price=`75`, seat price=`8`, included seats=`5`, a description, 3 feature lines (one per line in the textarea) → **Create plan**
- Then it appears in the Plans list immediately
- Tap **Edit** on the new plan → change the price to `80` → **Save changes**
- DB confirm: `SELECT * FROM plans WHERE code = 'enterprise'` — name, price, features match
- Verify the "affects new signups only" note is visible inline on the edit form — this is a key communication, not a decoration
- Note: the `comped` plan is visible in the Plans tab (is_public=false → shows a "Hidden" badge) but does NOT appear on the public `/pricing` page — verify both

**8.9 — Admin Artists tab: edit a subscription**
- Admin → **Artists** tab → search "mkup" → confirm mkup1-mkup4 all appear
- Tap **Edit** on mkup1 → change plan to `growth`, seats to `2` → **Save changes**
- DB confirm: `subscriptions` row for mkup1 has `plan_code = 'growth'`, `seats = 2`
- Log in as mkup1 → billing screen → plan name shows "Growth", seat count shows 2
- Tap **Cancel** (subscription cancel) → confirm inline confirm text appears → **Confirm cancel** → mkup1's status flips to `cancelled` in the Artists tab
- Tap **Reinstate** → status returns to `active` (or the appropriate derived state based on period_end dates)
- Restore mkup1 to `comped` via the setup SQL before finishing

**8.10 — Invoice history**
- Log in as mkup1 (after running 8.3-8.5 above so there are real invoices)
- `/dashboard/billing` → invoice history section → confirm paid and voided invoices both appear with the correct badge colours (paid = green, void = muted grey)
- Confirm the period dates (period_start, period_end) and amounts match the DB

---

### Suite 9 — Open/Closed status and store map pins

**Added Aug 31, 2026.** Covers `internal/pkg/openinghours`, `discovery.StoreCard.open_status`,
and migration 027's store coordinates.

**Timezone is the whole point of this suite.** Business hours are stored as wall-clock
`TIME` with no zone and resolved against the store's IANA zone *per date*. Testing only
from a Beirut-local machine at midday will pass while the interesting cases go unchecked.

**9.1 — Badge reflects real trading state**
- As an artist, set a store's hours to a window that is currently OPEN (e.g. 09:00–23:00)
- Open the customer artist profile → the store shows an **Open now** badge (green) and a
  "Closes HH:MM" line
- Narrow the hours to a window that has already ended today → reload → badge becomes
  **Closed** (muted), and the "Opens…" line is **absent** (the API deliberately does not
  point at tomorrow)
- Set hours starting later today → badge Closed, but now an "Opens HH:MM" line appears

**9.2 — Times render in the STORE's zone, not the device's**
- Change your machine's timezone (or run the browser with `TZ=America/New_York`)
- Reload the profile → the "Closes"/"Opens" time must be **unchanged**, still the salon's
  local time
- This is the diaspora case: a customer browsing from abroad must not see Beirut hours
  shifted into their own zone

**9.3 — Holiday exception vs. non-trading weekday**
- Add a dated exception closing the store today → badge Closed
- Separately, mark today's weekday as not trading → badge Closed
- Both look the same to the customer, but `open_status.reason` differs (`holiday` vs
  `closed_today`) — check the network response, not just the pixels

**9.4 — Unknown state renders NO badge (the important one)**
- Find or create a store with **no** `business_hours` rows at all
- The store card must render with **no badge whatsoever** — not "Closed"
- Rationale: telling a customer a salon is shut when nobody filled in the hours costs the
  artist real bookings. A "Closed" pill here is a bug, not a cosmetic issue.

**9.5 — A failed hours read must not break the profile** *(method corrected
2026-09-01 — the original could not work)*
- The profile must still render, with every store reporting `unknown`
- A customer losing access to a salon's page because opening hours would not load is a far
  worse outcome than a missing badge
- **Do NOT "stop Postgres mid-request".** That was this case's original method and it
  cannot test anything: the artist and store queries run *before* `buildStoreCards`, so a
  total outage fails the request earlier for an unrelated reason and returns a clean 500.
  There is no profile left to degrade. Executing it that way measures the wrong thing and
  looks like a failure.
- The behaviour needs **query-level** fault injection — fail `GetStoreHours` while
  everything else succeeds. That is a unit test, and it already exists:
  `TestBuildStoreCards_HoursReadFails_ProfileStillRenders`. Both error branches in
  `buildStoreCards` (hours *and* exceptions) swallow to `nil`, so this is verified rather
  than assumed.
- What the live outage *did* usefully confirm: a total database failure returns
  `500 INTERNAL_ERROR` with a generic message and no internal detail leaked, and the API
  recovers on its own once Postgres returns — no restart needed.

**9.6 — Map pin, and the half-pin guard**
- Artist dashboard → store edit → drop a pin → save → reload → pin persists
- Customer profile → map renders with a "Get directions" link → tapping opens the device's
  native maps app
- A store with **no** pin must render **no map** (not a default location)
- Via API: `PATCH /artists/stores/:id` with only `latitude` → **400 INCOMPLETE_LOCATION**
- With `latitude`, `longitude` AND `clear_location: true` → **400 CONFLICTING_LOCATION**
- With `clear_location: true` alone → pin removed (this is the only way to remove one)

**9.7 — DST boundary**
- Set a store's hours to 09:00–17:00
- Query availability for a date in January and one in July
- The same "09:00" must resolve to **07:00Z in winter** and **06:00Z in summer**
- If both return the same UTC instant, the zone is not being applied per-date

---

### Suite 10 — Portfolio tagged to services

**Added Aug 31, 2026.** Covers migration 028, `PUT /media/:id/services`, and the customer
gallery filter.

**10.1 — Tag a photo (artist)**
- Dashboard → Profile → Portfolio → hover a photo → the `#` button (only present when the
  salon has services)
- Select two services → Save → the tile caption lists both service names
- Reload → tags persist

**10.2 — Clearing tags**
- Reopen the editor, deselect everything, Save → caption disappears
- An empty list is a real replace, not a no-op — confirm via `GET /media/my` that
  `service_ids` is `[]`

**10.3 — Cross-salon rejection, and what the error must NOT say**
- As mkup1, call `PUT /media/:id/services` with a service ID belonging to mkup2's salon
- → **400 INVALID_SERVICE_ID**
- **The message must not name which service failed** — naming it would confirm that
  another salon's service ID exists. Read the actual response body.
- Confirm nothing was written: the photo's existing tags are unchanged

**10.4 — Ownership is a 404, not a 403**
- Call `PUT /media/:id/services` for a photo belonging to another artist
- → **404 MEDIA_NOT_FOUND**, same as a genuinely missing photo, so IDs cannot be enumerated
- Try the same against a **product** photo → also 404 (a product photo shows merchandise,
  not a service)

**10.5 — Customer filter chips**
- Open the customer artist profile for an artist with tagged photos
- Chips appear above the gallery: "All" plus **only** services that actually have a tagged
  photo — a chip must never lead to an empty gallery
- Tap a chip → gallery narrows; tap the same chip again → filter clears

**10.6 — "Browse the look, book the look"**
- With a filter active, tap a photo → the funnel opens on **that** service
- With no filter, tap a photo tagged to exactly one service → funnel opens on it
- With no filter, tap a photo tagged to **several** services → **nothing happens**, by
  design (guessing would send someone into a booking for the wrong treatment)
- Untagged photos are not tappable at all

**10.7 — Reorder**
- Hover a photo → left/right arrows appear (hidden at the ends, not disabled)
- Move a photo → order persists after reload
- Moving a photo into position 0 **changes the cover** — this is intended, since cover *is*
  `display_order` 0

---

### Suite 11 — Share link previews

**Added Aug 31, 2026.** Covers `internal/share` and `GET /a/:handle`. See
`b-edge-api/project-docs/B-Edge-Share-Previews-Decision-v1.md`.

**This suite cannot be verified by looking at a browser.** The whole feature exists for
clients that do not run JavaScript. Use `curl` and real messaging apps.

**11.1 — Tags are present and correct**
- `curl -s http://localhost:3000/a/rania | grep -E 'og:|twitter:'`
- Expect `og:title`, `og:description`, `og:image`, `og:url`, `og:site_name`,
  `twitter:card=summary_large_image`
- `og:url` must point at the **customer app**, not the API

**11.2 — Both link forms work**
- `/a/rania` (handle) and `/a/<uuid>` must both resolve
- Links generated before an artist set a handle must keep working

**11.3 — The image is the resized card**
- `og:image` must contain `c_fill,g_auto,w_1200,h_630`
- An artist with **no** portfolio photo still gets an `og:image` (the branded fallback) —
  an empty `og:image` renders worse than none

**11.4 — Hidden artists are not previewable (security)**
- Set an artist's `current_period_end` to 60 days ago (→ suspended)
- `curl -o /dev/null -w '%{http_code}' http://localhost:3000/a/<handle>` → **302**, not 200
- A suspended artist must not get a rich preview for a profile that is itself hidden
- Restore afterwards

**11.5 — Failure degrades to a redirect, never a 500**
- Request an unknown slug → **302** to the app home
- Stop Postgres and request a valid slug → still **302**, not a 500
- A shared link is the first thing a prospective customer touches

**11.6 — Escaping**
- Set an artist bio to `</title><script>alert(1)</script>`
- `curl` the preview → the script must appear **escaped** (`&lt;script&gt;`), not live

**11.7 — Real-world preview (the actual acceptance test)**
- Paste the link into a WhatsApp chat with yourself, and an Instagram DM
- The card must render with title, description and image
- **This is the only step that proves the feature works.** Everything above proves the
  server is doing its part; only a real crawler proves the card appears.
- ⚠️ In production this requires the reverse proxy to route `/a/*` to the **API**, not the
  static bundle (T10.4, not yet done). On localhost it works without a proxy, so a passing
  local test says nothing about production.

---

### Suite 12 — Bulk schedule shift preview

**Added Sep 1, 2026.** Covers `POST /bookings/schedule/shift-preview`, the pure
`evaluateShift` evaluator, and migration 029's deferrable overlap constraint.

The endpoint **writes nothing**, so it is safe to hammer. Be aggressive here —
this is the dry run that decides whether a destructive bulk write is offered.

**12.1 — The constraint, at the database level**

Migration 029 is the load-bearing change and is invisible from the UI. Test it
directly in `psql`:

- Two adjacent bookings (09:00–10:00, 10:00–11:00), one `UPDATE` adding 10
  minutes → **must succeed**. Before 029 this failed with `23P01`.
- Insert a booking that genuinely overlaps an existing one → **must still fail
  immediately**. The guarantee must not have been traded away.
- Inside a transaction with `SET CONSTRAINTS ... DEFERRED`, create a real
  overlap and commit → **must fail at commit**.
- Shift a day **one booking per statement**, no `SET CONSTRAINTS` → **must
  fail**. Deferrable-immediate is checked per statement, not per transaction.

**12.2 — Boundary values on `shift_minutes`**

| Input | Expected |
|---|---|
| `0` | **Check this deliberately.** Go's `validate:"required"` rejects a zero value, so 0 is likely a 422 rather than a no-op. Decide which is correct and pin it. |
| `1` / `-1` | Accepted |
| `240` / `-240` | Accepted — exact bound |
| `241` / `-241` | 422 |
| `2147483648` | 422, not an integer overflow panic |
| `"10"` (string) | 422 |
| `10.5` | 422 or truncation — pin which |
| omitted | 422 |

**12.3 — Date parsing, adversarially**

`"2026-9-16"` (no zero pad), `"16-09-2026"`, `"2026-02-30"` (impossible),
`"2026-02-29"` (2026 is not a leap year), `"0000-01-01"`, `"99999-01-01"`,
`""`, `null`, `"2026-09-16T10:00:00Z"`, and a date **50 years out**. Each must
be a clean 400, never a panic or a zero-time query scanning the whole table.

**12.4 — Off-by-one at the trading edges**

- Booking ending **exactly** at closing → shift +1 → must block.
- Booking ending one minute **before** closing → shift +1 → must pass.
- Booking starting **exactly** at opening → shift −1 → must block.
- Booking starting **exactly at `now`** → must be skipped as in-progress, not
  moved.
- Booking starting **one second after `now`** → must be movable.

**12.5 — Timezone and DST, aggressively**

- Store in `Asia/Beirut`, request from a machine set to `America/New_York` →
  identical result.
- Run at **23:30 UTC**: the store-local date is already tomorrow. Preview
  "today" and confirm it previews the store's day, not the server's.
- A day containing Lebanon's **DST transition** (late March / late October).
  A +60 shift across the jump must move wall-clock time by 60 minutes, not by
  a UTC hour that lands an hour off.
- A store whose `timezone` is deliberately corrupted to `"Not/AZone"` → falls
  back to UTC without a 500.

**12.6 — Volume**

A day with **50 bookings**. Response must stay under a second and must not
issue one query per booking — watch the query log. This is the N+1 the
enriched day query exists to prevent.

**12.7 — Concurrency (the aggressive one)**

- Fire **20 concurrent previews** for the same day. All must agree; none may
  error.
- While a preview is in flight, create a guest booking on that day. The
  preview is read-only so a stale answer is acceptable — but it must not
  return a **half-updated** picture (some bookings shifted, others not).
- Preview a day while another session cancels one of its bookings.

**12.8 — Authorisation**

- mkup1 previews Rania's store → `movable: []`, `skipped: []`. **Verified once
  already; re-verify after any change**, this is the highest-yield bug class in
  this codebase.
- A store ID that is a valid UUID but does not exist → 404.
- A store belonging to the caller's *salon* but not assigned to them.
- No token, expired token, customer token, admin token.

---

### Suite 13 — In-app notification centre

**Added Sep 1, 2026.** Covers `internal/inbox`, migration 030, and the
dead-letter producer in the notification worker.

**13.1 — Bundling, pushed hard**

- File **100** notifications with the same `group_key` in a tight loop →
  **exactly one row**, `item_count: 100`, badge shows **1**.
- Two **concurrent** inserts with the same group key → one row, no
  `unique_violation` surfacing to the caller. `ON CONFLICT` must absorb it.
- Mark read → file another → **new row**, badge 1. The old row must not be
  resurrected.
- Archive → file another → new row.
- Same kind, **different** group keys → separate rows.
- `group_key = NULL` → never bundles; ten inserts give ten rows.

**13.2 — Read/archive state machine**

Every transition, including the silly ones:

| From | Action | Expected |
|---|---|---|
| unread | read | read, badge −1 |
| read | read again | **204, idempotent** — a double-tap must not 404 |
| unread | archive | archived **and** read (badge must not stick) |
| archived | read | 404 or no-op — pin which |
| archived | archive again | 404 |
| unread | read-all | all read, badge 0 |
| (none) | read-all | 204, not an error |

**13.3 — Pagination bounds**

`limit` of `0`, `-1`, `1`, `50`, `51`, `10000`, `"abc"`, and omitted. Must
clamp to 1..50 and never return the whole table.

**13.4 — Authorisation**

- mkup1 reads/archives Rania's notification → **404, not 403** (verified once;
  re-verify).
- mkup1's feed never contains Rania's rows.
- `read-all` as mkup1 must not clear Rania's badge — **run this one
  specifically**, a missing `user_id` predicate on a bulk UPDATE is exactly the
  bug that would clear everyone's.

**13.5 — The dead-letter producer**

- Force a delivery failure (invalid `TWILIO_WHATSAPP_FROM`), let the worker
  exhaust `maxAttempts` → an `action_required` notification appears **for the
  artist**, not the customer.
- Notification with **no booking** (customer OTP) dies → **no** inbox row, and
  nothing crashes.
- Booking deleted between the failure and the alert → no crash, no orphan row.
- Ten failures across the same artist's bookings → **one** bundled row.
- Inbox insert itself fails → the notification is still correctly marked
  `dead`. The alert is best-effort and must never roll back the delivery
  record.

**13.6 — Content safety**

Title and body render in the dashboard. Inject into each:
`<script>alert(1)</script>`, `<img src=x onerror=alert(1)>`, `{{7*7}}`, and a
string of 10,000 characters. Must render as inert text and must not break the
panel layout. `title` is `VARCHAR(200)` — confirm a longer value is rejected
cleanly rather than truncated mid-character.

**13.7 — The bell and panel (added Sep 1, 2026, after the UI shipped)**

13.1–13.6 test the API. Until the bell existed the feature was only reachable
over curl, so none of it was verified as a *product*. These cases need a real
browser — half of them are invisible to any assertion made on JSON.

- Badge reflects unread **rows**, not occurrences: a bundled row with
  `item_count: 4` contributes **1**. Above 9 the badge reads `9+`.
- Badge disappears entirely at zero rather than rendering `0`.
- **Unread styling on every row, not just the first.** Read the *computed*
  `border-left-color`, do not eyeball it — see finding 4.
- Dismiss (`×`) removes the row and decrements the badge, and is a **sibling**
  of the row button, never nested inside it.
- Row click marks read **and** navigates when the notification has a link;
  marks read and stays put when it does not.
- **Escape closes the panel and returns focus to the bell** — check
  `document.activeElement`, not just that the panel vanished (finding 5).
- Outside click closes; the backdrop must not dim the page (dropdown, not
  modal).
- At 390px the panel stays inside the viewport and `document.documentElement.
  scrollWidth` does not exceed the window — a dropdown anchored on the wrong
  side is the classic way to introduce a horizontal body scroll on a phone.
- **After every optimistic update, re-read the database.** The panel updates
  before the request settles by design, so the UI agreeing with itself proves
  nothing.
- Polling stops when the tab is hidden and fires immediately on return.
- Sign out with the panel open → no further `/unread-count` requests.

**13.7 — Cascade**

Delete a user with unread notifications → rows removed by
`ON DELETE CASCADE`, no orphans, no error on the next feed request.

---

### Suite 14 — "Add to calendar" links

**Added Sep 1, 2026.** Covers `internal/calendar`, migration 031, and the
calendar link in the `booking_confirmed` message.

Read first, because it determines what is even testable: **an `.ics` cannot
be attached to a WhatsApp message.** Twilio restricts `text/calendar` to MMS.
The customer always fetches it from a link, so every case below is about a
URL, never an attachment.

**14.1 — Token lifecycle**

| Booking state | Expected |
|---|---|
| pending (never approved) | `calendar_token` **NULL**; no link anywhere |
| approved | token minted, 64 lowercase hex |
| approved → confirmed | link appears in the `booking_confirmed` message |
| approved, deposit never paid → expired | token exists but **was never sent** |
| approved twice (if a path ever allows it) | token **unchanged** — `COALESCE` guards it; a new token would kill every link already sent |
| completed | token still resolves; the appointment happened |

Confirm the link is **not** in the `booking_approved` message. An approved
booking whose deposit never arrives would otherwise leave a ghost event the
customer has to clear themselves.

**14.2 — RFC 5545 conformance**

Do not eyeball the file. Parse it with a real implementation (`python-
icalendar`, or `ical4j`) and assert on the parsed object.

- Every line ends **CRLF**; zero bare LF. Some desktop clients reject a
  bare-LF file outright rather than degrading.
- **No line exceeds 75 octets**, continuations included.
- Folding **never splits a UTF-8 sequence**. Test with Arabic (2 octets/char)
  and emoji (4 octets/char) — in an Arabic-first product a naive byte slice
  corrupts output almost every time, not rarely.
- Unfolding returns the original line **exactly**.
- `SUMMARY` with a comma, a semicolon and a backslash round-trips. Backslash
  must be escaped first, or later escapes get double-escaped.
- A newline inside a store name becomes `\n`, not a real break — one
  multi-line value otherwise turns the rest of the file into garbage
  properties.
- `URL` is **not** escaped: a query string containing a comma must survive.

**14.3 — Timezone, and Lebanon's DST specifically**

- `DTSTART`/`DTEND` are **UTC instants** (trailing `Z`), never floating local
  time.
- Parse the file and convert back: the instant must equal the booked slot in
  the store's zone.
- A booking either side of a **Lebanon DST transition** resolves to the right
  wall-clock time. This is not academic — Lebanon has moved its DST dates by
  government decree mid-season, and a floating time would shift the
  appointment by an hour on every device whose tz database lagged.
- A store whose `timezone` is unloadable falls back to **UTC**, not to the
  server's local time. A wrong time with no sign it is wrong is the worst
  available failure.
- The landing page shows the **store's** local time, not the viewer's — a
  customer checking this from abroad before travelling must not read a
  converted one.

**14.4 — Reschedule and SEQUENCE ⚠ the load-bearing case**

This is where the feature does real damage if it is wrong.

- Shift a booking, then re-fetch: **UID identical, SEQUENCE strictly higher,
  DTSTART moved.**
- Import the first file into a real calendar, then the second: the event
  **moves**. It must not appear twice.
- Same SEQUENCE with a changed time → the client ignores the update. Confirm
  this is what a missing increment actually costs.
- **Bulk shift a whole day** once that write path exists, then check *every*
  affected booking's sequence incremented. One missed row is one customer
  with two appointments.
- Regression guard to keep permanently: any code path writing `start_time` or
  `end_time` without touching `calendar_sequence` is a bug. Grep for it.

**14.5 — Cancellation and withdrawal**

| Status | Expected |
|---|---|
| cancelled / expired / refunded / refund_due | resolves, `METHOD:CANCEL`, `STATUS:CANCELLED`, **same UID** |
| soft-deleted (`deleted_at`) | same as cancelled |
| completed / no_show | **`METHOD:PUBLISH`** — withdrawing a past event rewrites the customer's history |

- A cancelled booking must **never 404**. That would strand the stale
  appointment in the customer's calendar permanently — worse than the problem
  this feature solves.
- The cancelled landing page still offers the file, because that file is what
  performs the removal.
- Import the event, then import the cancellation: it **disappears**.

**14.6 — Authorisation**

The token is the only credential, so this is the whole security surface.

- Wrong length, uppercase hex, non-hex, empty, `../../etc/passwd`, a UUID,
  and another booking's `review_token` → all **404**, all identical, and
  none reach the database.
- A well-formed unknown token returns the **same** 404 as a malformed one. A
  caller must not be able to distinguish "wrong shape" from "no such
  booking" by status, body or timing.
- The token is **not** in the guest funnel's `BookingResponse` and not in any
  public discovery payload. Artist-facing only.
- The page sends `noindex, nofollow` and `Cache-Control: no-store`. A private
  appointment link must never be indexed, and a cached `.ics` hands the
  customer a stale event exactly when they are trying to fix one.

**14.7 — The landing page**

- Renders at **390px** with no horizontal scroll.
- Both buttons work: Google opens `calendar.google.com/render`, the other
  downloads the file.
- Artist-supplied store and service names are **HTML-escaped** — this is one
  of only two raw-HTML surfaces in the product.
- Bidi overrides stripped from the page, the `.ics` **and** the Google deep
  link. Check the percent-encoded form too: `%E2%80%AE` must not appear.
- Arabic store and service names render correctly in all three.

**14.8 — Real-client acceptance ⚠ cannot be automated**

Suite 11 has the same shape: the only honest test is the real client.

Import the file into **Apple Calendar (iOS), Google Calendar (Android) and
Outlook**, and confirm the event lands at the right time with the right
title and location. Then reschedule and re-import into each, and record
which ones update in place versus duplicating.

Expected, and worth writing down rather than discovering later: the
**Google deep link cannot update**. An event added that way carries Google's
own id, not our UID, so a rescheduled booking gives that customer a second
entry. Apple/Outlook users who took the `.ics` do get in-place updates.
Fixing it would mean OAuth into the customer's Google account.

**14.9 — Adversarial**

- Store name at exactly 200 characters, and 200 Arabic characters, folded
  into the file — parse it back and compare.
- `<script>`, `{{7*7}}`, `${7*7}`, and a 10,000-character name into service
  and store names. Inert everywhere.
- A booking whose `end_time` precedes its `start_time` (if the data ever
  allows it) — the file must not claim a negative duration.
- 50 concurrent fetches of the same token → identical bytes, no errors.

### Suite 15 — Service buffer / cleanup time

**Added Sep 3, 2026.** Covers migration 033, `services.buffer_min`,
`bookings.blocked_until`, and the release on early completion.

**Sprint 5's interval algebra has no suite here, deliberately.** It shipped
zero user-visible change — that was the point — so there is nothing to drive
through a UI. Its safety net is `slots_golden_test.go`, which pins the exact
slot output, plus `occupancy_test.go` at 100%. Inventing E2E cases for it
would be theatre.

**15.1 — The artist sets it, the customer never sees it**

- Dashboard → Services → edit → **Cleanup after (min)** → set 30 → save →
  reload → persists.
- Customer funnel for that service → every slot still advertises the
  **service duration**, never duration+buffer. Read the actual `end_time` in
  the network response, not the rendered label.
- The word "cleanup", "buffer" or the number must appear **nowhere** in the
  customer PWA. Search the rendered DOM.

**15.2 — It actually reserves time**

- Book a slot, then re-query availability.
- The next offered start must be at or after `end_time + buffer`, rounded up
  to the 15-minute grid.
- A slot ending exactly when the buffer window begins is still offered —
  half-open, same as everywhere.

**15.3 — The database is the guard, not the application ⚠**

The point of `blocked_until` being a stored column. Bypass the API entirely:

- `INSERT` a booking starting inside another's cleanup window → must fail
  with **`23P01`**, the exclusion constraint.
- One starting exactly when cleanup ends → accepted.
- Confirm `CHECK (blocked_until >= end_time)` rejects an inverted value.

If these pass only through the API and not through raw SQL, the guard has
been demoted to an application rule and a race can walk through it.

**15.4 — Release on early completion**

- Book with a 30-minute buffer, mark the appointment **complete** before its
  `end_time` has passed... which `CompleteBooking` refuses
  (`BOOKING_NOT_STARTED`). So: complete it *after* the start but while the
  buffer would still be running.
- `blocked_until` collapses toward `NOW()`, never below `end_time`.
- Re-query availability → the freed minutes are **immediately** bookable, on
  the next read, with no scheduler.
- This is what separates a buffer from padding. If it fails, the artist is
  being punished for finishing early.

**15.5 — Boundaries and configuration**

- `buffer_min` of `-1` and `121` → rejected by both the form and the API
  (`CHECK (0..120)`).
- `0` is valid and is the default — a zero buffer must behave exactly as
  before migration 033.
- Change a service's buffer **after** a booking exists → the existing
  booking's `blocked_until` is **unchanged**. It is a snapshot.

---

### Suite 16 — Waitlist cascade and sweep

**Added Sep 3, 2026.** Covers the cascade on every slot-freeing event, and
the background sweep for stalled queues.

**16.1 — Every event that frees a slot cascades**

Until Sep 3 only cancellation did. Each row below frees real time:

| Event | Expect |
|---|---|
| Cancel | next waiting entry → `notified` |
| **No-show** | same |
| **Complete** (releases unused cleanup) | same |
| **Hold expiry** (lazy sweep on read) | same |
| **Deposit-deadline expiry** (lazy sweep) | same |

Drive each through the real API, then read `waitlist_entries.status`. The
last two fire on the read path of an availability query, so trigger them by
querying slots after letting a hold lapse.

**16.2 — The stall the sweep exists for ⚠**

The case lazy cascading **cannot** reach:

- Seed a queue: person A `notified` with `confirm_deadline` in the past,
  person B `waiting` behind them.
- Do **nothing else** — no cancellation, no new slot for that
  (artist, store, service, date).
- Wait for the sweep (≤5 min) or invoke it directly.
- A → `expired`, B → `notified` with a **fresh** deadline.

Without the sweep this queue stays frozen forever, which is exactly what
migration 016 predicted.

**16.3 — The sweep is safe to run forever**

- Nothing stalled → no writes, no notifications.
- One group failing (delete its artist mid-sweep) → the **other** groups
  still cascade. A single bad row must not freeze every queue.
- Run the sweep twice in a row → the second is a no-op, not a second
  notification to a second person for one slot.

**16.4 — The message**

`waitlist_slot_open` is enqueued with the confirm window and a booking link.
Verify the row lands in `notifications` with the right `user_id` and a body
naming the date and the minutes remaining.

**Delivery is D8-blocked** — the row queues and sends when a sender exists.
The confirm-window UI needs customer login, also D8. Both are written here so
they are not forgotten, and marked unrunnable until then.


## 2.5 Adversarial hardening pass — applies to EVERY suite above

**Added Sep 1, 2026 after auditing this document against its own standards.**

An honest audit of this plan found it weaker than the system deserves. Counting
mentions across all 970 lines before this section was added:

| Technique | Occurrences |
|---|---|
| injection / fuzzing / overflow / idempotency / retry / timeout | **0 each** |
| **unicode** | **0** |
| malformed input, simultaneous access | 1 each |
| concurrent | 2 |

Those are the categories that produce the expensive failures — the industry's
canonical disasters (Knight Capital, Ariane 5, CrowdStrike) all trace back to
missing negative tests for boundaries, input validation or fault handling, not
to a broken happy path. The suites above test that features *work*. This
section is about trying to *break* them.

Run each subsection against **every** applicable endpoint, not just the newest.

### 2.5.1 Unicode, RTL and Arabic — the largest gap

**This had zero coverage, in a product whose strategy documents call it
"the first Arabic-first platform for Lebanon" and whose schema carries
`name_ar` on stores, services and categories.** Arabic input is the single
most likely thing to break string handling and layout, and nothing tested it.

Into **every** free-text field — artist bio, service name, store name, review
comment, `special_requests`, delivery notes, customer name, product
description, notification title:

| Input | What it breaks if unhandled |
|---|---|
| `صالون الجمال` | Basic Arabic. Must store, retrieve and render intact. |
| Mixed `Rania صالون 2026` | Bidirectional reordering; check the *rendered* order, not just the stored bytes. |
| `‮` (U+202E RTL override) | Can visually reverse surrounding text — a spoofing vector in a shared link preview. |

**Standing rule, added Sep 1, 2026 after this was found twice.** The U+202E
case was written against *one* surface (the share card) and found there. The
second surface — a customer-supplied name interpolated into a notification
body the **artist** reads — was found by accident while building unrelated
UI, not by this plan. A third (service and store names inside an `.ics`
rendered by the customer's own calendar app) was only caught because someone
went looking.

So test the *class*, not the instance. Whenever user-supplied text is
rendered to a **different person**, that surface needs the bidi case, and
escaping never covers it — a bidi override is not markup, so neither
`html.EscapeString` nor Angular interpolation touches it. Current surfaces:
Open Graph tags, notification titles and bodies, `.ics` SUMMARY/LOCATION,
and the Google Calendar deep link. Any new one inherits the case.
| `​` zero-width space | Bypasses naive "is it empty" and profanity checks. |
| `👰🏽‍♀️💄` (ZWJ emoji) | Multi-codepoint graphemes; naive truncation splits them into garbage. |
| `José` as NFC vs NFD | Two byte sequences, one visual string — breaks equality and dedup. |
| `Ⅷ` (Roman numeral) / `ﬁ` (ligature) | Unicode normalisation and case-folding surprises. |
| 200 Arabic chars in a `VARCHAR(200)` | **Postgres counts characters, Go's `len()` counts bytes.** Arabic is 2 bytes/char in UTF-8, so a Go-side length check will disagree with the column. Test the exact boundary. |

Then verify each **round-trips**: stored → API JSON → rendered in both PWAs →
and, for the artist bio, into the `/a/:handle` Open Graph tags where WhatsApp
renders it.

### 2.5.2 Boundary values — test the edge, not the middle

For every numeric or length-bounded field, test: `min-1`, `min`, `min+1`,
`max-1`, `max`, `max+1`, `0`, `-1`, and the type's own limit.

Specific to B-Edge: `shift_minutes` (±240), `limit` (1..50), `seats` (min 1),
`duration_min` (15..480), `buffer_min` (0..120), `item_count`, prices against
`NUMERIC(10,2)` (**99999999.99** exactly, then one more), latitude (±90),
longitude (±180), `rating` (1..5), portfolio photos (20 cap), product photos
(8 cap), `service_ids` per photo (20 cap).

Money deserves its own pass: `0`, `0.001`, `10.999` (**known to be silently
rounded** — pinned by a characterization test), `-0.01`, `1e3`, `Infinity`,
`NaN`, and `99999999.999`.

### 2.5.3 Concurrency — races, not sequences

This plan tested sequences and called them concurrency. A race needs requests
**genuinely in flight together** — Burp Turbo Intruder or a small script, not
two `curl`s in a row.

For each: fire N=20 simultaneously and assert the invariant.

| Race | Invariant |
|---|---|
| Same slot, N guest holds | Exactly one succeeds |
| Last product unit, N orders | Exactly one; stock never negative |
| One invoice, N confirms | One succeeds; period advances **once** |
| One booking, approve vs cancel | One wins; no intermediate state persists |
| Same `group_key`, N notifications | One row, `item_count` = N |
| `read-all` while marking one read | Badge is consistent; no negative count |
| Bulk preview while a booking is created | No half-updated picture |
| Same OTP, N verifications | One succeeds; attempts counted correctly |

### 2.5.4 Fault injection — break the dependencies

Test what happens when things the app depends on fail, mid-request:

- **Stop Postgres** during: a booking write, a feed read, an invoice confirm.
  Expect a clean 5xx, never a hang or a partial write.
- **Kill the API** mid-transaction → no half-applied booking shift.
- **Cloudinary unreachable** → upload fails cleanly, no orphan `media` row.
- **Twilio 429 / 500 / timeout** → retried; **invalid number** → failed
  immediately without burning retries.
- **Clock skew**: set the server 25 hours ahead → deposit deadlines and
  subscription status behave sanely.
- **Kill the notification worker mid-send** → the lease expires and the row is
  reclaimed, not stranded.
- **Fill the disk** → graceful failure.

### 2.5.5 Idempotency and replay

Every mutating endpoint, called **twice with the identical payload**:

- Two identical bookings → two bookings, or one? Pin the answer.
- Two identical confirms → 409 on the second (verified for invoices).
- Two identical shifts → **the reason `idempotency_key` is in the write-path
  design**; without it a double-tap shifts the day twice.
- Replay a captured request 10 minutes later → rejected or handled.
- Browser back button after submit → no duplicate.

### 2.5.6 Malformed input and fuzzing

Against every endpoint: empty body, `null`, `[]` where an object is expected,
deeply nested JSON (1,000 levels), a 10 MB body, duplicate JSON keys, wrong
`Content-Type`, truncated JSON, `\x00` in a string, and a UUID field
containing a SQL fragment.

Also: **10,000 `service_ids`** on one photo, **10,000 IDs** in a reorder call.

### 2.5.7 State-machine abuse

For the booking state machine, attempt **every illegal transition**, not just
the plausible ones: complete a pending booking, approve a cancelled one,
no-show a completed one, confirm a deposit on an expired booking, cancel
twice, refund an unpaid booking. Each must be a clean 409 naming the current
state.

Build the full matrix — 11 statuses × 8 actions — and tick off every cell.
Untested cells are where the next bug lives.

**The matrix now exists.** `B-Edge-Booking-State-Machine-Matrix-v1.md`
enumerates all 108 (status x action) cells with the expected outcome for each,
extracted from the code rather than reasoned from memory. Execute that rather
than inventing cases here.

Writing it produced two confirmed defects before a single test ran: one of the
two paths to `confirmed` sends the customer no notification at all (so whether
they are told their booking is confirmed - and now whether they get the
calendar link - depends on which button the artist pressed), and `refund_due`
is a terminal state with no way out, with two bookings stuck in it today, one
holding a $30 deposit that was actually paid.

Two assertion rules from that document worth repeating here, because they
apply to every suite: assert the exact **error code**, not merely non-200 -
today zero tests assert any of the `BOOKING_NOT_*` codes, so a rejection with
the wrong code cannot fail anything - and assert the row **did not move**, since
a rejected action that still writes is the worst outcome and the easiest to
miss.

### 2.5.8 What "aggressive" means for a tester here

- **Assume the developer only tested the happy path.** They mostly did.
- **A test that passes first time taught you nothing.** Push until something
  breaks, then decide whether it matters.
- **Ambiguity is a failure.** "Probably fine" is not a result.
- **Test the thing the comment says is safe.** Every "this can't happen"
  comment in this codebase is a hypothesis.
- **When you find one bug, look for its siblings.** Both real bug classes
  found here — route-group leakage and cross-tenant IDOR — appeared in six
  places each, not one.

---

## 3. Bring it to the edge — exhaustive UI stress pass

Do this as its own pass, after the journeys above pass. The goal is: **every clickable element on every screen gets clicked at least once**, including the ones that should do nothing dramatic (disabled buttons, already-in-that-state toggles) and the ones at the edges of input ranges.

### 3.1 Every screen, every button

Go screen by screen (use the route lists below) and click **every** button, link, icon-button, tab, chip, and toggle at least once. For each:
- Does it do what its label says?
- If it's disabled, is it *visibly* disabled (not just non-functional-looking-active)?
- If it opens a modal/sheet, does the close button (**and** the backdrop tap, **and** Escape) all close it?
- If it's destructive (delete, cancel, remove), does it require a second confirming tap, not fire immediately?

**customer-pwa routes to sweep**: `/`, `/book/:handle` (all funnel steps: profile → select-service → pick-datetime → details → confirmed, plus the slot-unavailable branch), `/book/:handle/reviews`, `/shop/:handle`, `/shop/:handle/products/:id`, `/shop/:handle/cart`, `/shop/:handle/confirmed/:orderId`, `/login` (both phone and code steps), `/my-bookings`, `/my-bookings/:id`, `/my-orders`, `/review/:token` (valid, invalid, and already-used token), `/this-does-not-exist` (404 page).

**artist-dashboard routes to sweep**: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/onboarding` (form, pending, and rejected states), `/pricing` (public — open in incognito), `/admin` (all 4 tabs: Approvals, Billing, Plans, Artists), `/dashboard/bookings`, `/dashboard/calendar`, `/dashboard/waitlist`, `/dashboard/products`, `/dashboard/orders`, `/dashboard/deposits`, `/dashboard/billing` (comped state, outstanding invoice state, history state), `/dashboard/clients`, `/dashboard/clients/:id`, `/dashboard/earnings`, `/dashboard/services`, `/dashboard/hours`, `/dashboard/profile`, `/this-does-not-exist` (404 page).

### 3.2 Boundary values to actually try, not assume

- Service price: `0`, negative, a huge number, a value with 3+ decimal places
- Service duration: `0` minutes, 1 minute, a multi-day value in minutes
- Deposit amount: equal to the full price, greater than the full price
- Product stock: `0`, exactly `1` then buy it, a negative number
- Cart quantity: `0`, exceeding available stock, rapid-fire clicking + repeatedly on the stepper
- Review rating: try to submit with 0 stars selected (should be blocked client-side — confirm it actually is)
- Comment/notes fields: exactly at the character limit, one over it, emoji, right-to-left Arabic text, a very long paste
- Phone number fields: too short, too long, letters, an already-registered number, a number with a `+961` already typed in
- Image uploads: a valid image, a non-image renamed to look like one, an exactly-15MB file, a 15.1MB file, a 0-byte file, a corrupted/truncated image
- Dates: booking a slot exactly at the edge of "today," the very last slot of a business day, a date with a business-hours exception set

### 3.3 Interruption and race conditions

- Double-click every submit button — confirm it doesn't double-submit (double-book, double-charge, duplicate the record)
- Start a guest booking, open the same artist in a second tab, book the *same* slot in both — only one should win
- Let a guest hold expire mid-form-fill, then submit anyway — confirm the "expired, pick again" path, not a corrupted booking
- Go offline (devtools network throttling → Offline) mid-submit on a few key forms — confirm a real error message appears, not an infinite spinner
- Refresh mid-flow on every multi-step screen (booking funnel, onboarding, checkout) — confirm you don't lose so much state that it's unusable, and don't end up in a broken half-state

### 3.4 Billing enforcement edges

These require DB date manipulation (see Suite 8 setup). Run them after Suite 8's journeys pass.

- **Grace → past_due boundary:** Windows changed from 7/21 to **21/45** on Aug 31, 2026 (decision D2 - see `internal/pkg/subscription/status.go`'s `GraceDays` comment for why). Set `current_period_end` to exactly **21** days ago → artist should be `past_due` (hidden from Discover), not `grace`. Set to 20 days ago → `grace` (still visible). Verify the dashboard banner copy changes correctly between the two.
- **Past_due → suspended boundary:** Set to exactly **45** days ago → `suspended` (writes blocked); the comparison is exclusive `Before`, so the boundary instant belongs to the LATER state. Set to 44 days ago → `past_due` (writes still allowed). Note the middleware no longer names statuses itself - it reads `subscription.Enforce(status).CanModifyAccount`, so this and the booking block are now driven by one policy function.
- **Comped always passes:** Set a comped artist's `current_period_end` to 90 days ago — status must still be `active`, no banner, Discover still shows them, writes still work. Comped is handled before any date check in `DeriveStatus`.
- **Cancelled subscription:** Set `cancelled_at` to any past timestamp → artist should be `cancelled`. Verify whether Discover hides them (per the spec, cancelled is not explicitly in the hide-list — check the actual behavior and decide if it's correct).
- **Submit while suspended:** Submit a payment reference from `/dashboard/billing` as a suspended artist → must succeed (billing routes are excluded from the write-block). This is the intended escape hatch — if it's blocked, that's a bug.
- **Admin confirm while artist is in a stale state:** Run the admin confirm on an invoice after resetting the artist back to `comped` — the invoice should still confirm cleanly (invoices are addressed by ID, not by subscription state at confirm time).
- **Double-click Confirm paid:** Click **Confirm paid** twice in quick succession (or confirm, then manually set the invoice back to `submitted` in the DB and click again) — must surface a visible error, not silently extend the period twice. The backend returns a 409 for this; the admin UI must not swallow it.
- **Void reason required:** Leave the void-reason textarea blank → **Confirm void** button must stay disabled. This is enforced both client-side (button `[disabled]`) and server-side (VoidInvoiceRequest validation) — verify both.
- **Concurrent subscription state changes:** While one admin tab is loading the Billing overview, change the subscription dates in a second tab → refresh the first tab → confirm the new state renders, not a stale cached view.

### 3.5 Auth/permission edges (was 3.4)

- Try to reach every `/dashboard/*` URL directly, logged out → redirected to `/login`, and back to the originally-requested page after logging in
- Log in as a plain artist, try to navigate to `/admin` directly → redirected away, not shown an error page
- Let an access token expire mid-session (or simulate it) → confirm the silent-refresh works, or you're cleanly bounced to login — not stuck with broken API calls
- Try to view/edit another artist's booking, client, or product by editing the URL's ID directly → **404, and byte-identical to a nonexistent ID**. Not 403: since 2026-09-05 every ownership failure returns the same error as not-found, so a 403 here is now a regression, not an acceptable alternative. Compare the two responses, don't just check it was refused.

### 3.6 Visual sweep at every required viewport

At minimum 390×844, 768×1024, and 1440×900 for every screen in §3.1:
- No horizontal scroll on the page itself (check `document.documentElement.scrollWidth` vs `clientWidth`)
- No element clipped by a sibling fixed-position element
- Every loading skeleton, every empty state, and every error state actually triggered and looked at — not just the happy path with data

---

## 4. Known gaps — status

All five originally-confirmed gaps are now closed (2026-08-21) — see the update note at the top of this document for what shipped and the three backend bugs found while wiring up real UI paths to them. Kept here for the record and because closing a gap is exactly when regression is most likely:

- **G1 — Sign-up screen.** ✅ Closed: `/register`. Also fixed a real bypass this surfaced — see update note.
- **G2 — Password recovery + account management.** ✅ Closed: `/forgot-password`, `/reset-password`, Profile → Change password / Freeze / Delete account. Also fixed: `ForgotPassword` never actually delivered its token (dead TODO), and `UpdateUserStatus` 500'd on every call.
- **G3 — Two-step deposit flow.** ✅ Closed: Deposit Queue → Verify modal's secondary "partially received" link, and a direct "Confirm booking" action for `deposit_paid` cards.
- **G4 — Review management UI.** ✅ Closed (hide/show only, by design — see the coverage-map row above for why delete and authenticated-create stayed out of scope): dashboard **Reviews** screen. Also fixed: the artist's own review list was filtering out hidden reviews, making "show" unreachable in practice.
- **G5 — "Add store" screen.** ✅ Closed: Hours → Add store.

**New, still open, out of scope for this pass:** `GetReviewsByArtist` has no ownership check — any authenticated artist can view another artist's full review list (including hidden reviews) by guessing/enumerating an artist ID. Found while fixing G4's visibility-filter bug; not fixed, since it's a backend authorization hardening task, not a missing-UI gap.

**Suite execution status (2026-09-01):**

| Suites | Status |
|---|---|
| 1–8 | Live-executed at least once. 12 real bugs found and fixed. |
| 9–10 | **Executed 2026-09-01.** Pass, 1 finding, fixed. 9.5's *method* was corrected — it could not work as written. |
| 11 | **Written, NOT executed.** Cannot be automated: the acceptance test is pasting a link into WhatsApp. |
| **12–13** | **Executed 2026-09-01.** Pass, with 5 findings, all fixed. Suite 13 re-run against the real UI after the bell shipped later the same day. |
| **15–16** | **Written 2026-09-03**, same day the features shipped. 15.1/15.2/15.4 and 16.1/16.2 verified live during development; the raw-SQL guard cases (15.3) and the sweep-safety cases (16.3) are written but **not yet run as a suite**. 16.4's delivery half is D8-blocked. |
| **14** | **Partially executed 2026-09-01**, same day it was written — 14.1–14.6 verified live, including a real RFC 5545 parse. **14.7 partially, 14.8 not at all** (needs three physical devices), 14.9 unrun. |
| **§2.5 (partial)** | **Executed 2026-09-01** for Unicode/RTL, injection, boundary values, concurrency and idempotency **against the newest surfaces only**. 1 real finding. Fault injection, fuzzing and the state-machine matrix remain unrun. |

**Update — 2026-09-05 (API-level re-execution).** Suites re-run by driving the
API directly rather than the browser, so this covers request/response contracts
and not rendering. Read it as complementary to the 2026-09-01 UI pass, not a
replacement for it.

| Suite | 2026-09-05 result |
|---|---|
| **9** | **12/12 at API level**, including **9.7 (DST)** which had not been executed before: the same 09:00 store-local opening resolves to **07:00Z in January and 06:00Z in July**, so the zone really is applied per date. All four `open_status.reason` values distinguished (`open`, `outside_hours`, `holiday`, `closed_today`), `opens_at` present only when the store opens later the same day, and both 9.6 pin guards (`INCOMPLETE_LOCATION`, `CONFLICTING_LOCATION`) firing. |
| **3** | Guest hold → submit → approve, live. `special_requests` persisted and readable. |
| **14** | **14/14 at API level.** RFC 5545 details re-verified byte-wise: CRLF endings, longest line 74 octets, `UID` + `SEQUENCE` present, UTC instants, and a forged calendar token → 404. |
| **12, 16** | Read paths pass; waitlist cross-tenant correctly refused. |
| **10** | **Could not run.** No artist in the roster has any portfolio photos, so there is nothing to tag. Needs a Cloudinary upload first — this is a fixture gap, not a defect. |
| **15** | See the structural note below. |

**Two plan-wide adjustments, both from changes made 2026-09-05:**

1. **Ownership failures are now 404 everywhere, byte-identical to not-found.**
   This plan already expected 404 in 10.4 and 13, which turned out to be the
   correct posture all along — but bookings, stores and services were returning
   403 until a security pass found it. Any case that accepts "403 *or* 404" is
   now too loose: assert 404 **and** compare the body against a nonexistent ID.
2. **`GET /artists/:id/services` returns fewer fields.** It is unauthenticated,
   so it now omits `buffer_min`, `salon_id`, `is_active` and
   `active_duration_min`. Suite 15's regression guard — "the customer funnel
   shows `duration_min` only, never duration+buffer" — is therefore no longer
   only a UI convention: the field is **absent from the public payload**, so a
   template cannot render it even by mistake. 15's UI cases still matter for
   the artist-facing screens, where `buffer_min` legitimately appears.

Money validation also tightened: any case sending a price with **more than 2
decimal places, scientific notation, a leading `+`, or `NaN`/`Infinity` now
expects a `400`, where several used to be silently accepted and rounded. See
§2.5.2's boundary tables — the price rows there are now stricter than written.

### Execution results — 2026-09-01

Run against the live dev stack. Every seeded row was removed afterwards and
the artist bio and store name restored; verified zero leftovers.

**Passed outright**

- **12.1 Constraint (migration 029).** Single-statement bulk shift succeeds; a
  genuine overlap still fails immediately; a per-statement shift without
  `SET CONSTRAINTS` still fails. The guarantee was not traded away.
- **12.4 Trading edges.** All four off-by-ones exact: a booking ending
  *exactly* at close blocks on +1; one minute earlier passes; starting
  *exactly* at open blocks on −1.
- **12.7 Concurrency.** 20 simultaneous previews returned identical results,
  no errors.
- **13.1 Bundling.** 100 inserts sharing a group key → **1 row,
  `item_count: 100`, badge 1**. A `NULL` group key correctly never bundles.
- **13.2 State machine.** Read is idempotent (204 twice); archiving an unread
  row also marks it read, so **the badge does not stick**.
- **13.3 Pagination.** With 60 rows present, `limit` of 50 / 51 / 10000 all
  returned exactly 50. No unbounded page.
- **13.4 Ownership.** `read-all` as mkup1 left Rania's badge at 2. Foreign
  read/archive → **404**, and her row stayed unread.
- **§2.5.1 Unicode round-trip.** Arabic, mixed LTR/RTL, zero-width space, ZWJ
  emoji, NFD, and 50 stacked combining marks all round-trip byte-identical.
- **§2.5.2 The byte-vs-char trap did NOT materialise.** 200 Arabic characters
  (400 bytes) into a `VARCHAR(200)` with Go `max=200` → accepted; 201 →
  rejected. Go's validator counts runes, so the two agree. Worth having
  measured rather than assumed.
- **§2.5.3 Race.** 20 concurrent inserts on one group key → 1 row,
  `item_count: 20`, zero `unique_violation` errors surfaced.
- **§2.5.6 Injection.** `</title><script>`, `"><img onerror>`, `{{7*7}}`,
  `${7*7}` into the artist bio, rendered at `/a/:handle` — the codebase's only
  raw-HTML surface. All escaped, no script executed, no template evaluated.

**Second pass — 13.7, the UI, executed 2026-09-01 after the bell shipped**

Driven in headless Chrome over the DevTools Protocol against the live API, not
asserted on JSON.

- **Badge counts rows, not occurrences.** A row with `item_count: 4` and two
  others → badge `3`, `aria-label="Notifications, 3 unread"`. Badge absent at
  zero.
- **Dismiss** removed the row and took the badge 3 → 2.
- **Mark all read** cleared the badge and every accent stripe in one action.
- **Row click** navigated to the notification's link and closed the panel.
- **Server truth re-read from psql after all of the above**: all three rows
  `read`, the dismissed one `archived`. The optimistic updates were real, not
  just local.
- **Layout at 390px**: panel spans x=10..330 in a 390px viewport, nothing
  off-screen either side, `scrollWidth == innerWidth` — no horizontal body
  scroll.
- **Zero console errors** across the whole run.

**FINDING 4 — the unread stripe was invisible on every row but the first
(Medium) — FIXED 2026-09-01**

Rows carried `border-l-2` with `border-ink` bound to the unread state, inside a
`<ul class="divide-y divide-gray-100">`.

Tailwind's `divide-<color>` emits a plain `border-color` — which sets **all four
edges**, not just the divided one — under a `> * + *` selector that outranks a
utility class on the child. So every row after the first had its unread accent
repainted `gray-100`.

Computed `border-left-color` with three unread rows:

    row 1  rgb(10, 10, 10)     <- ink, correct
    row 2  rgb(244, 244, 245)  <- gray-100, wrong
    row 3  rgb(244, 244, 245)  <- gray-100, wrong

Worth recording **how** this was found: the screenshot looked completely
correct, because in the first run only the top row was unread. It only appeared
by reading computed styles. This is the argument for 13.7's "read the computed
value, do not eyeball it" — a visual check would have signed this off.

The failure mode is also the wrong way round: the unread marker vanishes
precisely when there is more than one thing to notice.

**Fixed** by dropping `divide-*` and using side-specific utilities
(`border-t-gray-100` for the separator, `border-l-ink` / `border-l-transparent`
for the stripe), which cannot collide.

**FINDING 5 — Escape did not close the panel (Low) — FIXED 2026-09-01**

`(keydown.escape)` was bound on the panel element, with `cdkTrapFocus
cdkTrapFocusAutoCapture` expected to put focus inside it. Focus never moved:

    focus is inside panel: false | activeElement: BODY

A keydown on `body` never reaches a handler on the panel, so Escape did
nothing. The design was also self-contradictory — the panel declares
`aria-modal="false"` while trapping focus like a modal, which would mean Tab
could never leave a dropdown.

**Fixed**: the focus trap is gone; the panel takes `tabindex="-1"` and is
focused on open (so Tab walks the notifications), and Escape is bound at the
**document**, closing the panel and returning focus to the bell. Verified:
`focus is inside panel: true`, and a real CDP key event now closes it.

**FINDING 1 — U+202E survives into Open Graph tags (Low/Medium) — FIXED 2026-09-01**

Setting a bio to `Book now ‮moc.live//:sptth` produces:

    og:description content="Book now \u202emoc.live//:sptth"

The right-to-left override is preserved, so a WhatsApp link preview renders
that as `Book now https://evil.com`. The `og:url` still points at the real
profile, so the **link** is honest and only the **displayed text** is spoofed —
but the preview card is the most trusted-looking surface B-Edge has, and this
is user-controlled text reaching it.

HTML escaping does not help: bidi controls are not HTML-special. The fix is
to strip `U+202A–U+202E` and `U+2066–U+2069` from any text bound for a meta
tag. Predicted by §2.5.1 and confirmed on the first attempt.

**Fixed** by `stripBidiControls` in `internal/share`, applied before HTML
escaping. U+200E/U+200F (directional *marks*) are deliberately KEPT — they are
weak hints rather than overrides and are legitimately used to disambiguate a
phone number inside an Arabic sentence, so stripping them would degrade the
Arabic typography this product is meant to be good at. Retested: the override
is gone, the visible text survives, and `صالون الجمال في بيروت` still renders
correctly in the card.

**FINDING 2 — `shift_minutes: 0` is a 422 (Low) — FIXED 2026-09-01**

The field is `min=-240,max=240`, which implies 0 is in range, but Go's
`validate:"required"` rejects a zero value. A UI slider resting at 0 would
produce a confusing validation error rather than a no-op preview. Decide
whether 0 means "no shift" or is genuinely invalid, and make the contract say
so.

**Fixed**: the field is now `*int`, so "you sent 0" and "you sent nothing" are
distinguishable. Zero returns `400 SHIFT_MINUTES_ZERO` with a message naming
the valid range; omitting the field still returns `422`.

**FINDING 3 — no date sanity range (Low) — FIXED 2026-09-01**

`date: "0000-01-01"` returns **200**. Harmless on a read-only endpoint that
returns an empty day, but there is no lower bound; `99999-01-01` is rejected
only because Go's parser fails on the width. A `[today − 2y, today + 2y]`
range would be more honest.

**Fixed**: `validateScheduleDate` bounds the date to ±2 years of today,
returning `400 DATE_OUT_OF_RANGE`. Two years either side covers rebuilding
last season and booking a wedding well ahead, while excluding the values that
only ever arrive by accident. Retested: `0000-01-01` and `2076-09-16` now
rejected, `2026-09-16` still accepted.

**Finding 1's vector also existed on a second surface, closed the same day.**
Building the notification bell surfaced that `alertArtistOfDeadLetter`
interpolates a **customer-supplied name** into a body the **artist** reads —
the same shape as the share card, different screen. Angular's interpolation
does not help either: a bidi override is not markup. `stripBidiControls` was
therefore extracted from `internal/share` into the leaf package
`internal/pkg/bidi` and applied at both producers, rather than left as two
copies of a security rule that would drift.

**Third pass — Suite 14, calendar links, executed 2026-09-01**

Written and partially executed the same day the feature shipped.

- **14.1 Token lifecycle.** A guest booking was made through the real funnel
  and approved through the real API; `calendar_token` appeared only at
  approval, 64 hex characters.
- **14.2 RFC conformance.** The document was parsed by **python-icalendar**,
  a real RFC 5545 implementation, not by hand-rolled assertions. 429 bytes,
  zero bare LF, ends CRLF, **max 71 octets per line**. Folding measured
  separately against Arabic (2 octets/char) and emoji (4 octets/char): never
  over 75, and multi-byte runes correctly force earlier breaks at 74 and 72.
- **14.3 Timezone.** The parser resolved `DTSTART` back to
  `Wednesday 14 October 2026, 09:00` in `Asia/Beirut` — exactly the booked
  slot — from `20261014T060000Z`. An unknown zone fell back to UTC.
  **The DST-boundary case was NOT run.**
- **14.4 Reschedule.** Shifting the booking kept the UID and took SEQUENCE
  **0 → 1**, DTSTART moving with it. **The real-client half — import, shift,
  re-import, confirm it moves rather than duplicating — was NOT run.**
- **14.5 Cancellation.** Cancelling through the API produced `METHOD:CANCEL`
  / `STATUS:CANCELLED` with the same UID, and the page switched to
  "Remove from calendar" while still offering the file.
- **14.6 Authorisation.** Malformed tokens (short, long, non-hex, uppercase,
  path traversal) and a well-formed unknown one all returned an identical
  404.

**Not executed, and the gap is real:** 14.8 needs the file imported into
Apple Calendar, Google Calendar and Outlook on physical devices. Like Suite
11, the feature's actual acceptance test cannot run in CI — the whole point
is what a client we do not control does with the file. Until that runs, the
claim "a rescheduled booking updates in place" is **reasoned, not
observed**.

**Fourth pass — Suites 9 and 10, executed 2026-09-01**

Driven against the live stack: API by direct request, UI in headless Chrome
over CDP with real timezone overrides.

**Suite 9 — Open/Closed and map pins**

- **9.1** All three trading states exact: past closing → `outside_hours` with
  **no** `opens_at` (deliberately does not point at tomorrow); open →
  `closes_at`; opening later today → `outside_hours` **with** `opens_at`.
- **9.2 — the diaspora case, and the sharpest pass here.** Rendered at
  `Asia/Beirut`, `America/New_York` and `Asia/Tokyo`. **"Closes 11:59 PM" in
  all three**, including Tokyo where the device clock had already rolled to
  the next day. The component reads the offset off the string rather than
  handing it to `toLocaleTimeString`, which is what makes it hold.
- **9.3** `closed_today` is distinct from `outside_hours` in the payload,
  though both render the same to the customer.
- **9.4** A store with no hours reports `unknown`, and the UI renders **no
  badge**: two stores on screen, `badgeCount: 1`, and the word "Closed"
  appears nowhere in the document. This is the one that costs the artist
  bookings if it regresses.
- **9.5** Method corrected — see the case above. Behaviour verified by unit
  test, not by outage.
- **9.6** All four location guards exact: `INCOMPLETE_LOCATION` for either
  coordinate alone, `CONFLICTING_LOCATION` for pin + `clear_location`,
  `clear_location` alone removes the pin, latitude 91 rejected. In the UI a
  pinned store renders map + "Get directions"; an unpinned one renders
  **neither**.
- **9.7 — DST.** `09:00` local resolved to **07:00Z on 2027-01-13** and
  **06:00Z on 2027-07-14**, matching Python `zoneinfo` ground truth exactly.
  The zone is applied per-date, not once.

**Suite 10 — Portfolio tagged to services**

- **10.1 / 10.2** Tags save and persist; an empty list is a real replace to
  `[]`, not a no-op.
- **10.3** A cross-salon service is rejected `INVALID_SERVICE_ID` with *"One
  or more services do not belong to your salon"* — the failing ID appears
  **nowhere** in the response, and nothing was written.
- **10.4** A foreign photo and a nonexistent one return **byte-identical**
  404 bodies, so IDs cannot be enumerated. A product photo also 404s. (No
  other artist had media, so one was seeded for this and removed after.)
- **10.5** Chips were exactly `All`, `Bridal makeup`, `nails` — the artist's
  other two services have no tagged photos and correctly got no chip. Filter
  narrowed 4 → 2 and cleared back to 4.
- **10.6 — verified by the outgoing request, not by the screen.** Tapping a
  photo fires `/bookings/slots?service_id=…`, which is unambiguous evidence
  of which service the funnel opened on. All four rules held: one-tag photo →
  that service; both-tagged photo under a `nails` filter → nails; under a
  `Bridal makeup` filter → Bridal makeup; and with **no** filter a
  both-tagged photo and an untagged photo are **not interactive at all** —
  the deliberate no-op, since guessing would start a booking for the wrong
  treatment.
- **10.7** Reorder returns 204 and moving a photo to position 0 **changes the
  cover**. A bogus ID and a partial list both return `400 INVALID_REORDER`
  and leave the order untouched.

**FINDING 6 — the back button covers the artist's name (Medium) — FIXED
2026-09-01**

On the customer artist profile, the back button is `fixed top-4 left-4`,
designed to float over a 300px photo hero. But the hero is omitted entirely
when the artist has no avatar — so the button lands directly on the artist's
name. Measured overlap **28px at every viewport from 320 to 1280**, which is
why the name rendered as "nia" instead of "Rania".

The existing comment had anticipated the no-avatar case for *contrast*
("works over both the photo hero and the plain background") but not for
*collision*.

It matters more than a cosmetic nudge: the name is the single most important
text on a screen whose entire job is answering "is this the right person?",
and the profile is the landing page for every shared Instagram link.

**Fixed** by making the content block's top padding conditional on the hero
rendering. Re-measured: clear at all five viewports.

**Environment restored:** business hours, the store pin, portfolio tags and
photo order were all returned to the state they were found in, and the three
seeded photos and one seeded foreign photo removed. Verified, not assumed.

**Inconsistency noted, not filed as a bug:** archiving twice returns 404,
but marking an archived notification read returns 204. Read is idempotent by
design and archive is strict. Defensible, but the asymmetry should be
deliberate rather than incidental.

The §2.5 gap is the important one. Suites 1–13 verify that features work;
§2.5 is the first section that tries to break them, and it is where the
expensive bugs will be if they exist.

**Billing domain — known gaps (2026-08-29, revised 2026-08-31):**
- ~~**`internal/billing` has zero tests.**~~ **Closed 2026-08-31.** 59 service-layer
  tests added; `DeriveStatus` and `ensureInvoicesUpTo` are at 100%. Repository tests
  remain deliberately out of scope — this codebase has no database test infrastructure
  (`TEST_DB_NAME` is vestigial, read only by `cmd/migrate`), so the SQL guards themselves
  are untested and only the service's mapping of their errors is covered.
- **Two billing behaviours are known-wrong and pinned by characterization tests rather
  than fixed**, because both are product decisions:
  1. `ensureInvoicesUpTo`'s doc comment and the monetization spec §12 both claim an unpaid
     subscription never accumulates more than one outstanding invoice. **It does** — four
     unpaid months produce five invoices.
  2. Go's `AddDate` normalizes rather than clamps, so a period starting Jan 31 rolls to
     **Mar 3**, not Feb 28, and the billing day then shifts forward permanently. Anyone on
     the 29th–31st is affected.
- **Enforcement windows changed 7/21 → 21/45 on 2026-08-31** (decision D2). Any test
  fixture using a hardcoded day count needs re-checking; the setup SQL above is updated.
- **No automated dunning notifications.** When an invoice becomes overdue, no WhatsApp message is sent to the artist. The WhatsApp worker and billing templates are planned (Phase 5) but not built; Twilio also isn't live yet. Until both land, the only signal an artist receives is the in-dashboard banner — which requires them to actively log in.
- **No pre-due reminder.** The current flow generates invoices lazily and the artist's first signal is an overdue banner. A "your invoice will be due soon" message before the period ends is not implemented.
- **Plan selection in onboarding not built.** New artists are assigned `comped` by admin via the Artists tab or manually; there is no plan-picker step in the self-service onboarding flow. This is a Phase 3 gap.
- **`apply-to-existing` not built.** `POST /admin/plans/:code/apply-to-existing` (audited bulk re-price of existing subscribers) was deliberately deferred — no paying subscribers exist to re-price yet. Not a UI gap to report; a planned Phase 3 feature.
- **Cancelled subscription enforcement ambiguity — STILL OPEN, and now has a second
  reader.** `DeriveStatus` returns `Cancelled` for `cancelled_at IS NOT NULL`, but
  `subscriptionVisibleCond` (duplicated in discovery, artist and share) treats
  `cancelled_at IS NOT NULL` as *visible*, so a cancelled artist still appears on Discover.
  As of 2026-08-31 the new `subscription.Enforce(Cancelled)` says the **opposite**
  (`VisibleInDiscovery: false`). That field is currently read by nothing, so there is no
  live inconsistency — but wiring it without resolving this would silently change behaviour
  for cancelled artists. The question is a product one: does cancelling remove your listing
  immediately, or at the end of the period you already paid for? (Fresha does the latter.)
  Test case 3.4 covers the current behaviour.

---

## 5. Sign-off

For each suite above, record: pass / fail / blocked, the build/commit tested, screenshots for anything visual, and a linked bug for every failure — not a verbal "mostly works." A suite with an unresolved **NO UI PATH** item is **blocked**, not skipped; it still needs a decision (build the screen, or explicitly accept the gap) before sign-off.

### Suite 17 — Payer capture and the refund gate

**Added Sep 21, 2026.** Covers migration 044, `depositPayerMismatch`, the
`REFUND_PAYER_MISMATCH` conflict, and the deposit-verify field.

B-Edge holds no money: deposits move customer-to-artist over OMT and Whish,
and a refund is the same transfer in reverse with **no chargeback**. An
error here is somebody out of pocket, so this suite is deliberately hostile.

**17.1 — Recording the payer**

- Confirm a deposit with the payer field **empty** → `deposit_payer_phone`
  stays NULL. This is the normal case and must not become mandatory noise.
- Confirm with a local-format number (`71 999 888`) → stored **E.164**.
- Confirm with junk (`abc`, `+++`, a 40-digit string) → **422**, and the
  deposit is **not** confirmed. A payer number that cannot be read back is
  worse than none, because the mismatch check treats unparseable as
  "cannot tell".
- Re-confirm with a different number → the new one replaces it. Confirm
  again with the field empty → the previous number is **kept**, not wiped.

**17.2 — The gate, pushed**

| Payer | Customer phone | `customer_contacted` | Expected |
|---|---|---|---|
| different | valid E.164 | omitted | `409 REFUND_PAYER_MISMATCH`, status unchanged |
| different | valid E.164 | `false` | same |
| different | valid E.164 | `"true"` (string) | rejected — a string is not a boolean |
| different | valid E.164 | `true` | refunded |
| same number, two formats | valid | omitted | **refunded** — `70 123 456` and `+96170123456` are one number |
| none recorded | valid | omitted | refunded — unknown is not a mismatch |
| different | unparseable | omitted | refunded, and **this is the known hole** — see FRAUD-09 |
| different | valid | `true`, twice | second attempt `409 BOOKING_NOT_REFUND_DUE` |

**17.3 — What the artist sees**

- A mismatched booking shows **both numbers** and disables the confirm
  button until the box is ticked.
- A matching booking shows no warning and needs no extra click.
- The warning must never appear on a booking with no payer recorded — a
  false alarm on the common case is how the real one gets clicked through.

---

### Suite 18 — Delivery truth

**Added Sep 21, 2026.** Covers migration 045, `provider_message_id`,
`delivery_status`, the reconciler, and `delivery_looks_broken`.

The premise: **`sent` never meant delivered.** It meant Twilio returned 2xx.
The platform ran at 0% delivery for six weeks while every query reported
success.

**18.1 — The SID is captured and used**

- Send any notification → `provider_message_id` is populated with `SM…`.
- Provider accepts but returns no sid → the row is still `sent`, a warning
  is logged, and the row is simply never reconcilable. Must not be treated
  as a send failure.
- The SID must appear in **no API response** (see DATA-01).

**18.2 — Reconciliation**

- A message Twilio reports `undelivered` → `delivery_status='undelivered'`,
  `error_message` carries the provider code, `status` **stays `sent`**. The
  two columns answer different questions and must not be collapsed.
- `delivered` → recorded, and the row is never re-queried.
- `queued` → re-queried on a later sweep.
- Twilio unreachable → `delivery_checked_at` unchanged, no status written,
  no crash. **Verified 2026-09-21 by an actual network outage.**
- Zero deliveries across a sweep → `WARN … NOTHING is reaching recipients`.

**18.3 — Telling the customer the truth**

- Channel failing → `request-otp` returns `delivery_looks_broken: true` and
  copy that offers guest booking.
- Channel healthy → the ordinary message.
- Health query errors → reported **healthy**. Cannot-tell must not announce
  an outage.
- **The response must be identical for an artist's number and a
  customer's**, in both states. See AUTH-12 — this is the enumeration
  property, and it is the reason the check is platform-wide.

---

### Suite 19 — Subscription enforcement at every surface

**Added Sep 21, 2026.** Covers `subscription.Enforce` and its three call
sites.

The policy is at 100% coverage and was never the problem. **Enforcement was
inconsistent**: `Enforce(cancelled)` said hidden while the discovery SQL
said visible, and slot generation consulted no gate at all — so a cancelled
artist was listed, offered 33 bookable times, and refused at the final tap.

For **each** of trialing, active, grace, past_due, suspended, cancelled,
and comped, check **all four** surfaces:

| Surface | trialing / active / grace / comped | past_due / suspended / cancelled |
|---|---|---|
| Discovery listing | visible | hidden |
| `GET /bookings/slots` | slots offered | `ARTIST_NOT_ACCEPTING_BOOKINGS` |
| Guest hold | accepted | refused |
| Share preview `/a/:handle` | renders | **unverified — check this** |

Boundaries worth their own cases: **one day inside grace** (21 days) must
still be fully sold, and **one day past it** must not. Cutting an artist off
for being slightly late on a payment they are still allowed to make is its
own defect.

---

### Suite 20 — Hours, calendar and the booking horizon

**Added Sep 21, 2026.** Covers bulk hours, the 90-day strip, and three
rendering defects that reached the launch artist.

**20.1 — Apply to all days**

- Sets the times on all seven days and **changes no day's open/closed
  flag**. Opening a never-open Sunday in bulk would take real bookings.
- Close time ≤ open time → refused before any request is sent.
- Partial failure (one day 400s) → says so, and does not report success.
- The grid renders **Monday first**, matching Calendar, while each row still
  carries the API's `day_of_week` (0 = Sunday). Verify against the database,
  not by eye.

**20.2 — Rendering, in WebKit at 390px and 320px**

These are regression cases for defects found in front of the artist, and
**none was visible in desktop Chrome**:

- Calendar hour labels fully on screen — they rendered as a single "M".
- A one-hour appointment block shows its content without clipping.
- Time inputs show `07:08 AM` complete — Safari renders 12-hour and the
  value was cut to `07:08 AI`.
- The store tab strip scrolls rather than pushing the page sideways — four
  stores added 66px of horizontal page overflow.

**20.3 — Booking horizon**

- 90 dates offered, month chips for each month spanned.
- Tapping a chip **scrolls, does not select**. "Show me November" is not
  "book the 1st of November".
- The last bookable start still respects closing time at every duration.

---

### Suite 21 — Draft survival

**Added Sep 21, 2026.** Covers funnel draft persistence.

- Type name, phone and notes; reload → all three restored.
- Reload → the funnel returns to the **artist profile**, not the slot. The
  hold is very likely expired and must not be resurrected.
- Complete a booking → the draft is cleared. On a shared phone the next
  customer must not see the previous one's details.
- Abandon and start a different artist → no cross-contamination; the draft
  is keyed per artist.
- Private browsing / storage disabled → booking still works. A draft is a
  convenience and must never block a booking.

---

### Suite 22 — Multi-artist salons

**Added Sep 21, 2026. EXECUTED Sep 21, 2026 — 14 pass, 0 fail.**
Automated as `make e2e-suite22` (`scripts/e2e-suite22.py`), so it is a
regression gate rather than a one-off. Three harness bugs were found and
fixed during the first runs, none of them product defects: a direct booking
insert omitted `blocked_until` (NOT NULL, and the upper bound of the
tstzrange the GIST exclusion constraint guards); cleanup tried to hard-delete
a user that `audit_events.actor_id` legitimately references; and `psql -tA`
appends an `INSERT 0 1` status line after `RETURNING id`, which produced a
baffling "invalid input syntax for type uuid" naming the correct uuid.
 Covers salon membership, the owner/member
authorisation boundary, and per-artist working hours.

**Read 22.5 first.** It is the only case in this suite that applies to
anyone using B-Edge today, and it is the one most likely to be quietly
broken by everything else here.

**22.1 — Invite and accept**

- Owner opens Team, invites a mobile number. The invitation appears under
  "Waiting to accept" and **the link is shown with a Copy button**.
  Delivery is blocked on Meta business verification, so a run that only
  checks for a queued notification proves nothing — check for the link.
- Open the link in a clean session: the salon's name and the inviter's name
  render, and **nothing else**. No roster, no other invitees, no numbers.
- Accept with a handle: the joiner lands on a confirmation that says their
  profile is **awaiting approval**, and Team now lists them as
  "Awaiting approval". An invitation does not bypass platform review.
- The same link opened a second time shows "This link is not valid".
- A revoked link, an expired link and a fabricated one must be
  **indistinguishable** — same wording, same status, no timing tell.
  This route is public, so a difference tells a stranger which tokens
  once existed.

**What the automated run covers, and what it does not**

`make e2e-suite22` drives the **API**: invite, preview, accept, the role
boundary, the rota reaching slot generation, removal, and 22.5. It renders
nothing. Every assertion below about what a screen *shows* is still manual
and still unexecuted — and this project's defect history is almost entirely
things that were invisible in desktop Chrome and obvious in WebKit at 390px.
Three new screens shipped with this feature and **none has been opened in a
browser**.

**22.2 — The boundary, seen from the dashboard**

Sign in as the member:

- Nav shows **no** Services, Store hours, Promos, Products or Team.
- Nav **does** show My hours, Bookings, Calendar, Clients, Earnings.
- Typing `/dashboard/services` redirects to Bookings rather than rendering
  a screen whose every control would fail.
- Hiding is not the boundary. Call `PATCH /artists/salon/services/:id`
  directly with the member's token and confirm **403
  SALON_ROLE_FORBIDDEN**, then re-read the row and confirm it is unchanged.
  A 403 that still wrote is worse than no guard.

**22.3 — Per-artist hours reach the customer**

- My hours opens saying **"You are bookable whenever <store> is open"**.
  That is the correct state for an artist who has set nothing, not an
  empty form. A run that reports "no hours configured" has misread it.
- Set Tue–Thu 12:00–17:00, save. The customer funnel for that artist now
  offers **no morning slots** on those days and **nothing at all** on
  Monday.
- The store's own hours are unchanged for the owner — narrowing one
  artist must not narrow the salon.
- Add a day off; that date offers nothing for this artist and is
  unaffected for the owner.
- "Use store hours instead" clears the rota and restores the full window.

**22.4 — Removal refuses to strand a customer**

- A member holding an upcoming booking shows the count on their row and
  **no Remove control**. Force the call anyway: 409 `HAS_FUTURE_BOOKINGS`.
- Cancel the booking, then remove: the member goes, and their past
  bookings, reviews and earnings are **still there**.
- The owner cannot be removed and cannot leave without transferring.
- Transfer ownership, then confirm **both** parties are signed out. The
  role is baked into the access token at issue, so a session that survives
  keeps the old permissions.

**22.5 — A solo artist notices nothing** ⚠️ **the acceptance criterion**

Sign in as an artist who is the only member of their own salon — which is
every artist on B-Edge today:

- Nav is **exactly** as before: no Team, no member language, no seats.
- Every screen that worked before still works, with the same controls.
- My hours says they are bookable whenever their store is open.
- **Their customer-facing booking availability is byte-identical.** Verified
  mechanically, not by eye:

  ```bash
  # before the change ships
  python3 scripts/capture-slot-baseline.py > project-docs/slot-baseline-pre-046.json
  # after
  python3 scripts/capture-slot-baseline.py --compare project-docs/slot-baseline-pre-046.json
  ```

  Run the comparison against a **snapshot binary on its own port**, not the
  `air`-managed dev server: air rebuilds and restarts on every Go file save,
  and a restart mid-run turns in-flight requests into errors. Prove the
  snapshot actually contains the change first — insert one rota row and
  confirm the slot count moves — or the comparison compares old code with
  old code and passes having tested nothing.

**22.6 — The three new screens, in WebKit at 390px and 320px** — **EXECUTED**

**Sep 22, 2026 — 14 pass, 0 fail**, automated as
`node scripts/e2e-suite22-6.mjs` (WebKit, 390px and 320px, `isMobile`).
**It found three defects, all invisible to every prior test because nothing
had ever rendered these screens:**

1. **Two nav entries rendered blank.** `Team` and `Store hours` appeared in
   the mobile "More" sheet as links with no label at all. The app registers
   lucide icons explicitly via `LucideAngularModule.pick({…})`, and the two
   new entries referenced `users-round` and `calendar-clock`, which were
   never added to that list. Both icons exist in the package; they simply
   were not picked. Fixed by registering them.

2. **The My hours day row overflowed the page** — 52px at 390px, 122px at
   320px. Same shape suite 20 found when four store tabs added 66px. Fixed
   by wrapping the row.

3. **WebKit clipped the meridiem in every time input** — `09:00 AM` drew as
   `09:00 AN`. This is the defect suite 20 recorded as `07:08 AM` →
   `07:08 AI`, and **no numeric check catches it**: the element is not
   overflowing, the glyphs are cut. `scrollWidth > clientWidth` reported
   clean while the screenshot showed it plainly. Fixed with a 7.5rem floor
   on the inputs, which then meant two of them could not share a line at
   320px — measured at 9px past the card edge — so they stack below 360px.

The harness now measures three things a passing page can still fail:
element width against a legibility floor, spill past the containing card
(page overflow stays 0 because the card clips it), and page overflow.

**Not covered, and stated rather than skipped:** reload survival and
"typing an owner-only URL redirects". Both need a real page load, and the
refresh cookie is `Secure: true` unconditionally (`auth/handler.go:327`), so
WebKit never stores it over plain HTTP and any reload bounces to `/login`.

Original scope: Suites 20 and 21
exist because every defect that reached the launch artist was a rendering or
alternate-flow problem at phone width. A new screen tested only through
`curl` has been tested in the one place defects have never been found.

*Team* (`/dashboard/team`, owner only):

- Roster rows do not overflow at 320px with a long display name and a
  handle. Names wrap or truncate; the page does not scroll sideways.
- The status chip reads **"Awaiting approval"** for a pending member, not
  "pending" — an artist who has just joined should not be shown a database
  value.
- After inviting, the link panel appears and the **link is selectable and
  fully visible**. A `break-all` code block at 320px is exactly where a
  token gets visually truncated, and a half-copied link fails silently.
- **Copy** puts the whole link on the clipboard and the button confirms.
  Then: with clipboard access denied (Safari private browsing), the button
  must not appear to succeed, and the link must still be selectable by hand.
- "Remove" is absent on the owner's own row and on any member with upcoming
  bookings, and the upcoming-booking count is visible on the row either way.

*My hours* (`/dashboard/my-hours`, every member):

- Opens saying **"You are bookable whenever <store> is open"**. This is the
  state every artist is in and it is correct, not an unfinished form. A
  reviewer who reports "no hours configured" has misread the screen — and so
  has the design, if that reading is available.
- Time inputs show `02:00 PM` complete at 320px. Suite 20 found Safari
  rendering 12-hour and clipping `07:08 AM` to `07:08 AI`; these are the
  same input type.
- The store tab strip **scrolls** with four stores rather than pushing the
  page sideways. Suite 20 found four store tabs adding 66px of page overflow.
- Unticking every day and saving restores the store-hours state and the
  banner returns. This is the way out and it must be reachable.
- A day whose end is before its start blocks Save and says why on that row.

*Join* (`/join/:token`, public, unauthenticated):

- Renders with **no session at all** — the one screen a person reaches
  before they have an account.
- An invalid, expired or revoked token shows the same wording in every case.
  If the copy ever distinguishes them it has undone AUTH-16 and FRAUD-11 in
  the security plan.
- Handle validation reports the rule while typing, and the preview line
  `b-edge.com/book/<handle>` updates live.
- After accepting, the confirmation says the profile is **awaiting review**.
  Someone who joins and then cannot take bookings must not have to guess why.
- Opening the same link a second time shows "This link is not valid".

*Nav, as a member:*

- No Services, Store hours, Promos, Products or Team — in the desktop
  sidebar, the mobile bottom bar, **and the "More" sheet**. All three derive
  from `navItems()`, but the bar and the sheet filter it again, so a
  regression could land in one and not the others.
- My hours, Bookings, Calendar, Clients and Earnings are all present.
- Typing `/dashboard/services` redirects to Bookings.

If 22.5 fails, the feature is not ready regardless of how well 22.1–22.4
pass. Five of five salons on this platform have exactly one member, and the
launch artist is one of them.

---

---

### Suite 23 — A salon over time, with an adversary in it

**Added and EXECUTED Sep 21, 2026 — 17 pass, 0 fail, 2 to decide.**
Automated as `make e2e-suite23`. **It found a real hole on the money path:**
`artists.status` was filtered by discovery, handle lookup, UUID lookup and
the share preview, and by nothing on the booking path — so with a live
subscription an artist an admin had **rejected** could still have a slot
held and a deposit requested. Fixed the same day; tracked as FRAUD-13 in
`B-Edge-Security-Test-Plan-v1.md`.

**A second finding, FIXED the same day:** `internal/onboarding` created a
store and **no `business_hours` rows**, so a newly-founded salon was
completely unbookable and nothing said so — the store read as closed on every
date, forever. This was the gap the launch artist raised: *"a makeup artist
should have a default for opening hours, she should not go day by day."*

Migration 049 adds `stores.default_open_time` / `default_close_time`
(09:00–18:00), and onboarding seeds all seven days from them inside the same
transaction. Verified end to end: a freshly registered artist, onboarded and
approved through the real endpoints, is offered **33 slots, 09:00–18:00**.

Case **23.0** now *asserts* this rather than papering over it. The suite used
to seed hours itself in setup; a fixture that quietly repairs the thing under
test is how a regression hides.

Existing stores are deliberately **not** backfilled — `mkup3` and `mkup4`
stay as they are. A migration that invents opening hours for a salon already
trading can put an artist on Discover at a time they are not there.

**Added Sep 21, 2026.** Every other suite tests one action in isolation.
This one runs a salon's first year as a single continuous story, with six
people in it, because the defects that reached the launch artist were never
broken happy paths — they were alternate flows, and an alternate flow only
exists once state has accumulated.

**The cast**

| | Who | What they do |
|---|---|---|
| **Amal** | founder | Creates the salon. Sole artist at the start and at the end. |
| **Bassima** | second artist | Joins, takes real bookings, tries to leave while holding them, eventually leaves. |
| **Carine** | third artist | Joins after Bassima. Still there at the end. |
| **Dana** | customer | Books with Amal. |
| **Elias** | customer | Books with Bassima — and is still holding that appointment when Bassima tries to walk out. |
| **Mallory** | adversary | Wants the deposits. Not a hypothetical: on this platform money moves out of band over OMT and Whish, so whoever controls the salon's payment reference controls the money. |

**Why Mallory is the point of this suite**

B-Edge never touches a customer's money. A customer reads
`GET /api/v1/salons/:salon_id/payment-methods` and sends a deposit to the
OMT or Whish number it returns. There is no gateway to compromise and no
balance to drain — **the entire financial attack surface is one string**.
Change it and every deposit for that salon goes to the attacker, with the
platform confirming the payment instructions as if nothing were wrong. The
customer has no way to tell.

That makes `salon_payment_methods` the highest-value row in the database,
and 23.7 attacks it from every angle a real attacker would have.

---

**23.0 / 23.0b — A new salon is bookable, and the default actually works**

- Onboarding leaves the store with **seven days of `business_hours`** seeded
  from `stores.default_open_time` / `default_close_time` (09:00–18:00).
  Asserted, not seeded by the fixture: a fixture that quietly repairs the
  thing under test is how a regression hides.
- Changing the default to 10:00 moves **every day** to 10:00.
- A day the artist deliberately **closed stays closed**. The times move;
  which days the salon trades does not. Opening a Sunday she had shut
  because she adjusted a time would put her on Discover on a day she is not
  there.

**23.1 — One artist, one salon**

- Amal onboards. Exactly one artist, and she is `salons.owner_id`.
- Her token carries `salon_role=owner`.
- No Team screen would be worth showing: the roster is one row.

**23.2 — Bassima joins**

- Amal invites, Bassima accepts, an admin approves.
- Two artists in the salon; Bassima's token says `member`.
- **Bassima is refused every owner-only write**, and the row is unchanged
  afterwards — the check is on the effect, not the status code.

**23.3 — Carine joins, making three**

- Three artists, one owner, two members.
- Each member sees the roster and **only their own** earnings.
- Carine narrows her hours; **Amal's and Bassima's availability is
  untouched**. Three artists is where a rota keyed on the wrong column
  starts leaking between people, and two artists would not have caught it.

**23.4 — Two customers book**

- Dana books Amal. Elias books Bassima.
- Each booking is attributed to the right artist, and both are visible to
  the owner.
- **Dana's appointment does not appear in Bassima's calendar**, and vice
  versa.

**23.5 — Bassima tries to leave while holding Elias's booking** ⚠️

The case this suite exists for.

- `POST /artists/salon/members/leave` → **409 `HAS_FUTURE_BOOKINGS`**.
- Bassima is **still in the salon** afterwards.
- **Elias's appointment is untouched** — same artist, same time, same
  status. A customer must never discover their appointment evaporated
  because of a staffing decision they were not party to.
- The same refusal applies when the *owner* removes her, not only when she
  leaves voluntarily. Two routes, one rule.

**23.6 — Bassima leaves properly**

- Elias's booking is resolved (cancelled or completed).
- She leaves: `artists.salon_id` becomes NULL.
- **Her history survives** — the booking row, its customer, its price.
  Removing someone from a roster is not deleting what they did.
- The salon is back to two artists, and Amal is still the owner.
- Bassima can no longer read the salon's services.

**23.7 — Mallory** ⚠️ **the money**

Each of these is a separate, independent attempt on the deposit reference.

- **a. Walk in the front door.** Mallory registers as an artist and calls
  `PUT /artists/salon/payment-methods`. She has no salon → **403
  `NO_SALON`**, and the salon's row is unchanged.
- **b. Join, then redirect.** Mallory gets herself invited and accepts,
  becoming a legitimate member. She calls the same endpoint → **403
  `SALON_ROLE_FORBIDDEN`**. *A member of the salon must not be able to
  redirect the salon's money.* Re-read the row: unchanged.
- **c. Point at someone else's salon.** As a member of her own salon,
  Mallory sends Amal's `salon_id` in the body and the path. The salon is
  taken from her token and never from a request, so this must be inert.
  Verify by re-reading **Amal's** row, not by the status code.
- **d. Steal the invitation.** Mallory obtains a token issued to someone
  else and accepts it. Decide deliberately: the token is the credential, so
  this likely succeeds by design — but then **the owner must be able to see
  who actually joined**, and removal must work. An invitation that can be
  intercepted and silently redeemed by a stranger is a phishing primitive.
- **e. Impersonate by handle.** Mallory registers and onboards with a handle
  confusable with Amal's. She is `status='pending'` until an admin approves,
  so she is invisible on Discover and unbookable. **Confirm she cannot take
  a single booking while pending** — this is the only thing standing between
  the platform and a fake artist collecting deposits under a real one's name.
- **f. Outlive removal.** Mallory is removed from the salon. Her captured
  access token is still valid for up to 15 minutes (`RevokeAllForUser`
  revokes refresh tokens only). Enumerate exactly what it still reaches, and
  confirm it is **not** the payment method. Cross-referenced as AUTH-14 in
  the security plan.
- **g. Read the customers.** As a member — and again as a removed member —
  Mallory tries to read another artist's bookings and her client phone
  numbers. Customer contact details are the second most saleable thing here
  after the deposit reference.

**23.8 — The salon survives its own history**

After all of it:

- Amal is still the owner; the salon has Amal and Carine.
- **Amal's customer-facing availability is byte-identical to 23.1** —
  before anyone joined, booked, attacked or left.
- Every booking ever made still exists, attributed to the artist who took
  it, including Bassima's after she left.
- `salon_payment_methods` holds exactly what Amal set, unchanged by seven
  attempts to move it.
- The audit trail shows every membership change, with the actor on each.

---

### Suite 24 — Plans, ceilings and message delivery

**Added Sep 23, 2026** for everything that shipped with the pricing decision
(`B-Edge-Pricing-Decision-v1.md`) and migrations 049–050.

**24.1 and 24.3 are executed and passing** (via `make verify-security-salon`
and `make e2e-suite23` cases 23.0/23.0b). **24.2, 24.4 and 24.5 are written
and not yet automated** — 24.4 cannot be until `TWILIO_SMS_FROM` is
provisioned, and it must **skip loudly** rather than report a delivery path
that has never sent anything.

**Why this suite exists:** the price ladder went from $7–$80 to $45–$249 and
per-seat billing was rejected in favour of **ceilings** — `included_seats` is
now the most artists a salon on that tier may have, and `seat_price` is 0
everywhere. A ceiling that nothing enforces is a price list with no prices,
so 24.1 is the case that matters most in this suite.

**24.1 — The artist ceiling is enforced** — **FIXED AND PASSING** Sep 23

- A salon on **Solo** (ceiling 1) has one artist. Inviting a second is
  **refused**, with an error that names the upgrade rather than a generic
  limit.
- A salon on **Studio** (ceiling 4) can hold four and is refused the fifth.
- **`comped` (ceiling 999) is never limited.** The launch artist and the
  internal roster run on it, and a ceiling there would be a self-inflicted
  outage.
- Verify the **effect**, not the status code: after a refused invite,
  re-read `salon_invitations` and confirm nothing was written.
- An owner already **over** a ceiling — because the plan was downgraded
  beneath them — keeps every existing artist. Enforcement applies to
  *adding*, never to removing people already working.

Found and fixed 2026-09-23. `included_seats` had been read only by the
billing CRUD endpoints, so a $45 Solo salon could invite unlimited artists
and every tier above the entry price was unsellable. Automated as FRAUD-14 in
`make verify-security-salon`; 5 unit tests cover the boundary, the
pending-invitation case and the never-bind rule for `comped`.

**24.2 — A new artist lands on the right plan**

- Register, onboard, get approved → the subscription is **`solo`**, not the
  retired `starter`.
- `GET /billing/plans` returns exactly the four public tiers in `sort_order`:
  Solo $45, Studio $109, Salon $189, Multi $249.
- `starter`, `growth`, `enterprise` and `comped` are **absent from the public
  list but still resolvable** — `subscriptions.plan_code` is a foreign key,
  and the six live comped subscriptions must keep working.
- **`seat_price` is 0 on every plan**, public or retired. A non-zero value is
  a regression against a decision, not a data-entry slip.

**24.3 — Store default hours** — *partly covered by 23.0 / 23.0b*

- Onboarding seeds **seven days** from `stores.default_open_time` /
  `default_close_time` (09:00–18:00), so a new artist is bookable the moment
  they are approved.
- `PATCH /artists/stores/:id` with a new default **moves every day's times**.
- A day the artist **closed stays closed**. The times move; which days the
  salon trades does not.
- **Existing stores are not backfilled.** `mkup3` and `mkup4` still have zero
  `business_hours` rows, deliberately — a migration that invents opening
  hours for a trading salon puts an artist on Discover when she is not there.
- Invalid defaults (`close <= open`) are refused by
  `stores_default_hours_check`.

**24.4 — Message delivery survives WhatsApp being blocked** ⚠️

The reason this matters is commercial, not technical: charging while
reminders do not send makes *"it doesn't message my clients"* the churn
reason for every customer, and it would be true.

- With **only `TWILIO_SMS_FROM`** set, a queued notification is **delivered
  by SMS** and `notifications.channel` records `sms`.
- With **both** set, WhatsApp is used and `channel` records `whatsapp`.
- With **both set and WhatsApp rejecting** (Meta 63051), the message falls
  through to SMS **exactly once** — not twice, not a retry storm.
- With **neither** set, the failure names `TWILIO_SMS_FROM` so the way out is
  in the error.
- **SKIP LOUDLY if `TWILIO_SMS_FROM` is unprovisioned.** It is procurement,
  not code, and a silent skip here would report a working delivery path that
  has never sent anything.

**24.5 — An invitation actually queues a message**

Regression for a bug that hid for a full day: the INSERT failed on a missing
`::text` cast inside `jsonb_build_object` (Postgres 42P18) and the caller
discarded the error with `_ =`, so queueing had **never once succeeded** and
nothing said so.

- Inviting an artist writes exactly **one** `notifications` row,
  `template_name = 'salon_invitation'`, carrying the invitation id.
- The queued message contains a **working link**.
- Once the invitation is spent — accepted, declined, revoked or expired —
  the payload is **redacted** and the raw token is no longer recoverable.
- A notifier failure **must not** prevent the invitation being created. The
  copyable link is the channel that works today.

---

### Suite 25 — Aggressive booking chaos

**Added and EXECUTED Sep 23, 2026 — 16 pass, 0 fail, 5 informational.**
`make chaos-booking`. Derived from an external hostile-testing brief; the
parts that do not apply to B-Edge are listed below rather than quietly
dropped.

**Topology built each run:** 3 salons × (3, 3, 2) artists, 2 solo artists,
20 customers. A "standalone" artist is the owner of a one-person salon —
B-Edge has no artist without a salon, and that is the model, not a
workaround.

**25.1 — the state machine under attack**

| Case | Result |
|---|---|
| Price mutated to `0.00` in the request | Stored **150.00**. Price is read from the service row, never accepted from the body |
| Two terminal transitions fired simultaneously | One final state, no deadlock |
| Reschedule into the past | Refused; slot unmoved |
| Forged client timestamp (`client_time: 2020`) claiming free cancellation | Ignored; server time decided |
| Customer hits the artist-only `complete` endpoint | 401 unauthenticated / **404** for another artist — indistinguishable from absent |
| 5 concurrent refunds on one booking | Exactly **1** accepted |
| Simultaneous `no_show` and `cancel` | One terminal state |
| Artist cancels 48h out vs 30 min out | Both release the slot |

**25.2 — cascading day shift**

- `shift-preview` **writes nothing** — verified by comparing the day before
  and after previewing.
- A +15 min cascade that pushes a booking past closing time is **refused
  all-or-nothing**, naming the booking: *"would finish at 19:15, after the
  store closes at 18:00."* Nothing moves. Tested with a client cancelling
  **concurrently**; 0 overlaps afterwards.
- The source brief expected automatic refund, re-routing and fee-free
  cancellation. **None of that exists** and it is not reported as passing.

**25.3 — the 20-client siege**

All 20 customers hold the same slot at the same instant: **1 × 201, 19 ×
409**, one row holds the slot, **0 overlaps in the database**. This is the
test that proves migration 001's claim about the GIST exclusion constraint
being "the final atomic guard".

**25.4 — money precision**

`33.333`, `1e3`, `NaN`, `-10.00` all rejected **422** by
`internal/pkg/money`'s whitelist. Zero NaN prices stored anywhere. There is
no ledger to reconcile — B-Edge moves no money — so this is the strongest
financial assertion the architecture permits.

**25.5 — horizon and defaults**

- A booking **305 days out was accepted**, and the slots endpoint offered
  26 slots that day. **The API had no horizon cap**; the 90 days was
  `STRIP_DAYS` in the customer PWA's date picker only.
  **CLOSED 2026-09-23 — and the fix went the other way.** The cap was set at
  **550 days** and the picker **raised to 400**, because bridal is booked
  11-12 months ahead and a tight cap would have refused the highest-value
  bookings on the platform. The picker's 90 days had been silently blocking
  them. Re-verify with: past → `BOOKING_IN_PAST`; 365 and 548 days → `201`;
  551 and 3650 days → `BOOKING_TOO_FAR_AHEAD`. All seven verified live.
- Service defaults: deposit 0.00, deadline 48h, duration 60min.
  Store defaults: same-day notice 4h, buffers 150/90, early-bird fee 0.00.
- Onboarding seeds **7 days at 09:00–18:00**; a new artist is bookable
  without touching the hours screen.

**What this suite reports NOT APPLICABLE, never as a pass**

Gateway pre-auth, wallets, commission splits, a payouts ledger, escrow,
webhook idempotency, reliability scoring and automated compensation. Verified
absent from the schema: `payouts`, `ledger`, `commissions`, `escrow`,
`payment_intents`, `wallets`. B-Edge holds no money by design — customers pay
deposits directly to the salon's own OMT or Whish number.

**The defect this suite found**

`CancelBooking` decided `refundDue` from `DepositAmount.IsPositive()` alone —
the amount *required*, set at creation, not the amount *paid*. Cancelling
from `pending`, `approved`, `deposit_paid` or `confirmed` with
`deposit_paid_at` NULL produced `refund_due` in all four cases, putting
bookings nobody had paid for into the artist's "Refund due" filter and
telling her to send money to a customer who never sent her any. On a platform
with no gateway, that refund is a manual OMT transfer out of her own pocket
that does not come back.

**Two existing unit tests were asserting the defective behaviour.** The suite
was green and agreeing with the bug.

