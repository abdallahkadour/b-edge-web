# B-Edge — End-to-End Test Plan

> For a human tester. Every test case is driven **from the UI** — click, type,
> upload, exactly as a real artist or customer would. No `curl`, no direct API
> calls, except where explicitly marked **[NO UI PATH]**, meaning the backend
> endpoint exists but nothing on screen can trigger it yet — that's a finding
> to report, not a step to fake.
>
> Verified directly against the real routes and the real frontend code on
> 2026-08-21, not against old docs. B-Edge has **12 backend API domains** and
> **~90 endpoints** across two Angular PWAs: **customer-pwa** (`:4200`,
> mostly guest, no login required) and **artist-dashboard** (`:4300`,
> authenticated). Backend runs at `:3000`.
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

### `admin` (3 endpoints)

| Endpoint | UI trigger |
|---|---|
| `GET /admin/artists/pending` | artist-dashboard `/admin` page load |
| `POST /admin/artists/:id/approve` | **Approve** button on a pending-artist card |
| `POST /admin/artists/:id/reject` | **Reject** → confirm reason → **Reject** (two-tap, inline) |

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

**artist-dashboard routes to sweep**: `/login`, `/onboarding` (form, pending, and rejected states), `/admin`, `/dashboard/bookings`, `/calendar`, `/waitlist`, `/products`, `/orders`, `/deposits`, `/clients`, `/clients/:id`, `/earnings`, `/services`, `/hours`, `/profile`, `/this-does-not-exist` (404 page).

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

### 3.4 Auth/permission edges

- Try to reach every `/dashboard/*` URL directly, logged out → redirected to `/login`, and back to the originally-requested page after logging in
- Log in as a plain artist, try to navigate to `/admin` directly → redirected away, not shown an error page
- Let an access token expire mid-session (or simulate it) → confirm the silent-refresh works, or you're cleanly bounced to login — not stuck with broken API calls
- Try to view/edit another artist's booking, client, or product by editing the URL's ID directly → should be rejected (403/404), not served

### 3.5 Visual sweep at every required viewport

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

---

## 5. Sign-off

For each suite above, record: pass / fail / blocked, the build/commit tested, screenshots for anything visual, and a linked bug for every failure — not a verbal "mostly works." A suite with an unresolved **NO UI PATH** item is **blocked**, not skipped; it still needs a decision (build the screen, or explicitly accept the gap) before sign-off.
