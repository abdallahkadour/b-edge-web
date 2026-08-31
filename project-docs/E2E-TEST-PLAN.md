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

**9.5 — A failed hours read must not break the profile**
- Simulate by stopping Postgres mid-request, or temporarily break the hours query
- The profile must still render, with every store reporting `unknown`
- A customer losing access to a salon's page because opening hours would not load is a far
  worse outcome than a missing badge

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

**13.7 — Cascade**

Delete a user with unread notifications → rows removed by
`ON DELETE CASCADE`, no orphans, no error on the next feed request.

---

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
- Try to view/edit another artist's booking, client, or product by editing the URL's ID directly → should be rejected (403/404), not served

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
| 9–13 | **Written, NOT executed.** Do not read a passing build as a passing suite. |
| §2.5 adversarial pass | **Never run.** Added after auditing this document against its own standards and finding zero coverage of injection, fuzzing, overflow, idempotency, retry, timeout or Unicode. |

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
