# B-Edge — Booking state machine matrix

**v1, 2026-09-01.** Companion to `E2E-TEST-PLAN.md` §2.5.7. Extracted from
`internal/booking/service.go` and `repository.go` at commit `bb776b1`, not
reasoned from memory.

---

## 1. Why this document exists

`bookings.status` has **12 legal values**. Nine service actions change it,
plus two background sweeps. That is **108 (status × action) cells**, of which
**9 are legal transitions** and **99 must be rejected**.

The existing test suite covers happy paths, ownership checks, and a handful
of wrong-status cases. Nobody has ever enumerated the 99. So for most cells
the honest answer is *unknown*, not *known good*.

That matters because this codebase's own bug history is concentrated here.
Of the twelve bugs found in earlier live passes, **three were exactly this
class** — approving, completing or no-showing a booking whose appointment
time made no sense for that action. None were found by a test. They were
found by someone clicking around, and `ApproveBooking`'s `BOOKING_TIME_PASSED`
guard exists *because* of one of them.

The point of a matrix rather than more test cases: you write tests for the
cases you thought of, and the cases you thought of are the ones you already
handled in the code. **The bugs live in the cells nobody considered.** Filling
in every cell forces a decision on questions like "what should happen if an
artist marks a *cancelled* booking as a no-show?" — which nobody has been
asked before.

Writing this document already produced two confirmed defects (§5), before a
single test was run.

---

## 2. The actors

### Statuses (12)

| Status | Reached by | Terminal? |
|---|---|---|
| `held` | `HoldGuestSlot` | no |
| `pending` | `SubmitGuestBooking` / `SubmitBooking` | no |
| `approved` | `ApproveBooking` | no |
| `deposit_pending` | **nothing** — see §4.3 | — |
| `deposit_paid` | `MarkDepositReceived` | no |
| `confirmed` | `ConfirmDeposit` **or** `ConfirmDepositReceived` | no |
| `completed` | `CompleteBooking` | yes |
| `cancelled` | `CancelBooking` | yes |
| `expired` | the two sweeps | yes |
| `no_show` | `MarkNoShow` | yes |
| `refund_due` | `CancelBooking(refundDue=true)` | **yes — and that is a bug, §5.2** |
| `refunded` | **nothing** — see §4.3 | — |

### Actions (9) and their guards, as they exist today

| Action | Requires status | Time guard | Rejection code |
|---|---|---|---|
| `SubmitGuestBooking` | `held` + guest placeholder | none | `HOLD_EXPIRED` |
| `SubmitBooking` | `held` + owner | none | `BOOKING_NOT_HELD` |
| `ApproveBooking` | `pending` | **start must be future** | `BOOKING_NOT_PENDING` |
| `MarkDepositReceived` | `approved` | none | `BOOKING_NOT_APPROVED` |
| `ConfirmDeposit` | `deposit_paid` | none | `BOOKING_NOT_DEPOSIT_PAID` |
| `ConfirmDepositReceived` | `approved` | none | `BOOKING_NOT_APPROVED` |
| `CompleteBooking` | `confirmed` | **start must be past** | `BOOKING_NOT_CONFIRMED` |
| `MarkNoShow` | `confirmed` | **start must be past** | `BOOKING_NOT_CONFIRMED` |
| `CancelBooking` | any non-terminal | none | `BOOKING_NOT_CANCELLABLE` |

### Sweeps (2) — lazy, on read, no scheduler

| Sweep | From | Condition | To |
|---|---|---|---|
| `ReleaseExpiredHolds` | `held` | `held_until < NOW()` | `expired` |
| `ExpireDeadlineBookings` | `approved` | `deposit_deadline < NOW()` | `expired` |

---

## 3. The matrix

`✅` legal · `✗ CODE` rejected with that code · `⚠️` current behaviour is
questionable, decision needed (§4)

### 3a. Artist actions

| status ↓ / action → | Approve | MarkDepRcvd | ConfirmDep | ConfirmDepRcvd | Complete | NoShow |
|---|---|---|---|---|---|---|
| `held` | ✗ NOT_PENDING | ✗ NOT_APPROVED | ✗ NOT_DEPOSIT_PAID | ✗ NOT_APPROVED | ✗ NOT_CONFIRMED | ✗ NOT_CONFIRMED |
| `pending` | ✅ *(future only)* | ✗ NOT_APPROVED | ✗ NOT_DEPOSIT_PAID | ✗ NOT_APPROVED | ✗ NOT_CONFIRMED | ✗ NOT_CONFIRMED |
| `approved` | ✗ NOT_PENDING | ✅ ⚠️ | ✗ NOT_DEPOSIT_PAID | ✅ ⚠️ | ✗ NOT_CONFIRMED | ✗ NOT_CONFIRMED |
| `deposit_pending` | ✗ NOT_PENDING | ✗ NOT_APPROVED | ✗ NOT_DEPOSIT_PAID | ✗ NOT_APPROVED | ✗ NOT_CONFIRMED | ✗ NOT_CONFIRMED |
| `deposit_paid` | ✗ NOT_PENDING | ✗ NOT_APPROVED | ✅ ⚠️ **silent** | ✗ NOT_APPROVED | ✗ NOT_CONFIRMED | ✗ NOT_CONFIRMED |
| `confirmed` | ✗ NOT_PENDING | ✗ NOT_APPROVED | ✗ NOT_DEPOSIT_PAID | ✗ NOT_APPROVED | ✅ *(past only)* | ✅ *(past only)* |
| `completed` | ✗ NOT_PENDING | ✗ NOT_APPROVED | ✗ NOT_DEPOSIT_PAID | ✗ NOT_APPROVED | ✗ NOT_CONFIRMED | ✗ NOT_CONFIRMED |
| `cancelled` | ✗ NOT_PENDING | ✗ NOT_APPROVED | ✗ NOT_DEPOSIT_PAID | ✗ NOT_APPROVED | ✗ NOT_CONFIRMED | ✗ NOT_CONFIRMED |
| `expired` | ✗ NOT_PENDING | ✗ NOT_APPROVED | ✗ NOT_DEPOSIT_PAID | ✗ NOT_APPROVED | ✗ NOT_CONFIRMED | ✗ NOT_CONFIRMED |
| `no_show` | ✗ NOT_PENDING | ✗ NOT_APPROVED | ✗ NOT_DEPOSIT_PAID | ✗ NOT_APPROVED | ✗ NOT_CONFIRMED | ✗ NOT_CONFIRMED |
| `refund_due` | ✗ NOT_PENDING | ✗ NOT_APPROVED | ✗ NOT_DEPOSIT_PAID | ✗ NOT_APPROVED | ✗ NOT_CONFIRMED | ✗ NOT_CONFIRMED |
| `refunded` | ✗ NOT_PENDING | ✗ NOT_APPROVED | ✗ NOT_DEPOSIT_PAID | ✗ NOT_APPROVED | ✗ NOT_CONFIRMED | ✗ NOT_CONFIRMED |

### 3b. Customer / system actions

| status ↓ / action → | SubmitGuest | Submit | Cancel | ReleaseHolds | ExpireDeadline |
|---|---|---|---|---|---|
| `held` | ✅ | ✅ | ✅ | ✅ *(if expired)* | — |
| `pending` | ✗ HOLD_EXPIRED | ✗ NOT_HELD | ✅ | — | — |
| `approved` | ✗ HOLD_EXPIRED | ✗ NOT_HELD | ✅ | — | ✅ *(if past deadline)* |
| `deposit_pending` | ✗ HOLD_EXPIRED | ✗ NOT_HELD | ✅ | — | — |
| `deposit_paid` | ✗ HOLD_EXPIRED | ✗ NOT_HELD | ✅ | — | — |
| `confirmed` | ✗ HOLD_EXPIRED | ✗ NOT_HELD | ✅ ⚠️ | — | — |
| `completed` | ✗ HOLD_EXPIRED | ✗ NOT_HELD | ✗ NOT_CANCELLABLE | — | — |
| `cancelled` | ✗ HOLD_EXPIRED | ✗ NOT_HELD | ✗ NOT_CANCELLABLE | — | — |
| `expired` | ✗ HOLD_EXPIRED | ✗ NOT_HELD | ✗ NOT_CANCELLABLE | — | — |
| `no_show` | ✗ HOLD_EXPIRED | ✗ NOT_HELD | ✗ NOT_CANCELLABLE | — | — |
| `refund_due` | ✗ HOLD_EXPIRED | ✗ NOT_HELD | ✗ NOT_CANCELLABLE ⚠️ | — | — |
| `refunded` | ✗ HOLD_EXPIRED | ✗ NOT_HELD | ✗ NOT_CANCELLABLE | — | — |

---

## 4. Decisions the matrix surfaces

These are the `⚠️` cells. **They are product decisions, not bugs** — the code
is self-consistent; nobody has ever been asked the question.

### 4.1 The time-guard asymmetry ⚠️ *(decide)*

`ApproveBooking` refuses a booking whose appointment already passed, with a
comment explaining that approving it would compute a deposit deadline already
in the past and message a customer about an appointment that already
happened.

**The very next step in the same flow has no such guard.** On today's code an
artist can `ConfirmDepositReceived` on a booking whose appointment was three
weeks ago, silently sending "You're all confirmed for *last month*. See you
then!" — and now a calendar link for a date in the past.

Three options, in order of preference:

1. **Mirror the approve guard.** Reject confirmation once the appointment has
   passed. Simplest, consistent, and matches the reasoning already written
   down in `ApproveBooking`.
2. **Allow it, but suppress the notification and the calendar link.** Lets an
   artist reconcile a late bank transfer without lying to the customer.
   Slightly more code, arguably the truer behaviour.
3. **Leave it.** Only defensible if late reconciliation is common, and it
   still needs the message suppressed — so it is really option 2.

**Recommend option 2.** The bookkeeping is legitimate; the message is not.

### 4.2 Two paths to `confirmed` ⚠️ *(decide, then delete one)*

```
approved ──MarkDepositReceived──▶ deposit_paid ──ConfirmDeposit──▶ confirmed
approved ──────────────ConfirmDepositReceived──────────────────▶ confirmed
```

Two routes to the same state is a standing invitation for behaviour to be
wired to one and not the other — which is exactly what happened (§5.1).

Decide whether `deposit_pending`/`deposit_paid` are a real workflow the artist
wants (mark money seen → confirm separately) or a legacy two-step that the
one-step call replaced. Then **delete the loser**, rather than maintaining
both and re-discovering this.

### 4.3 Two statuses nothing can ever produce ⚠️ *(decide)*

`deposit_pending` and `refunded` are in the `bookings_status_check`
constraint and are referenced by zero write paths. `refunded` is *especially*
suspicious given §5.2 — it looks like the missing half of the refund flow.

Either wire them or drop them from the CHECK. A status that cannot occur is a
cell every future reader has to think about and then discover is dead.

### 4.4 Cancelling a `confirmed` booking after it has started ⚠️ *(decide)*

`CancelBooking` has no time guard, so a booking can be cancelled at any point
— including mid-appointment or a week afterwards. `CompleteBooking` and
`MarkNoShow` both require the start to be past; cancel is the only one of the
three that does not care.

Probably wants a boundary: after the appointment starts, the honest outcomes
are *completed* or *no_show*, not *cancelled*.

---

## 5. Confirmed defects — found by writing this document

### 5.1 One of the two confirmation paths tells the customer nothing 🐞

| Path | `enqueueNotification` calls |
|---|---|
| `ConfirmDepositReceived` (approved → confirmed) | **1** — sends `booking_confirmed` |
| `ConfirmDeposit` (deposit_paid → confirmed) | **0** — sends nothing |

Both produce `status = confirmed`. So whether the customer is told their
booking is confirmed depends entirely on **which button the artist pressed**.

Since 2026-09-01 this also decides whether they receive the **"add to
calendar" link**, because that rides on the same message.

Severity is bounded today only because WhatsApp delivery is not live (D8) —
which means it would have shipped silently and surfaced as "some customers
never get confirmations" once Twilio was switched on.

**Fix:** move the notification to wherever the transition to `confirmed`
actually happens, so it cannot be attached to one route and not the other.
Resolving §4.2 first may delete the problem instead.

### 5.2 `refund_due` is a dead end, with money in it 🐞

`CancelBooking(refundDue=true)` writes `refund_due`. Then:

- No action transitions out of it. `refunded` exists in the CHECK constraint
  and is written by **nothing**.
- `CancelBooking`'s own guard lists `refund_due` as non-cancellable.
- No endpoint exists to record that the refund was paid.

**The artist has no way to say "I sent the money."** The booking sits in
`refund_due` permanently.

This closes a loop that the notification centre opened: `inbox.KindRefundDue`
exists and tells the artist a refund is owed — but there is nothing they can
then do to clear it, so the reminder is unresolvable by construction.

Live data confirms it is not theoretical: **two bookings are stuck in
`refund_due` right now**, one of them with a **$30 deposit actually paid**
(`deposit_paid_at` set), cancelled 2026-08-22.

Refunds are out-of-band bank transfers in Lebanon, so the platform can only
ever record the artist's assertion — but recording it is the entire point.
This is the same gap `B-Edge-Bulk-Schedule-Operations-Spec-v1.md` §8 flagged
from the other direction.

**Fix:** an artist action `refund_due → refunded`, with an optional
reference, mirroring `ConfirmDepositReceived`'s reference field. Small, and it
makes the refund notification actionable.

---

## 6. How to execute this

Build it as a **runnable script**, not a manual checklist — the value is that
it stays a regression suite once the bulk-shift write path starts adding
transitions to this same machine.

For each of the 108 cells: seed a booking in the row's status, call the
column's action as the correct role, assert the exact status code **and error
code** from §3, then re-read the row and assert the status did or did not
change.

Two things the assertions must cover that a naive pass would miss:

- **Assert the error CODE, not just non-200.** Today zero tests assert any of
  `BOOKING_NOT_PENDING`, `BOOKING_NOT_APPROVED`, `BOOKING_NOT_DEPOSIT_PAID`,
  `BOOKING_NOT_CONFIRMED` or `BOOKING_NOT_CANCELLABLE`. A rejection with the
  wrong code is a bug the client sees, and it currently cannot fail a test.
- **Assert the row did not move.** A rejected action that returns the right
  error while still writing the row is the worst outcome and the easiest to
  miss.

Run the whole grid at both time positions — appointment in the future and in
the past — since §4.1 and §4.4 are only visible on the second axis. That is
**216 assertions**, which is why it should be generated rather than typed.
