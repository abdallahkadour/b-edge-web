# B-Edge — Booking state machine matrix

**v1.1, 2026-09-02.** Companion to `E2E-TEST-PLAN.md` §2.5.7. Extracted from
`internal/booking/service.go` and `repository.go`, not reasoned from memory.

> **v1.1 re-verified against code 2026-09-02.** v1 was written *before* the
> fixes it prescribes were applied, and then not re-read after — so it claimed
> 12 statuses and 108 cells when migration 032 (decision §4.3, in this very
> document) had dropped one, never learned about `MarkRefunded` (the action
> added to close §5.2), and still called `refund_due` a bug and `refunded`
> unreachable after both were fixed. Corrected throughout.
>
> Recorded rather than quietly patched, because it is the failure mode this
> repository keeps hitting: **a document that prescribes a change has to be
> re-read after the change lands**, or it becomes the most confidently wrong
> thing in the repo.

---

## 1. Why this document exists

`bookings.status` has **11 legal values** (12 until migration 032 dropped
`deposit_pending`). **Ten** service actions change it, plus two background
sweeps. That is **110 (status × action) cells**, of which **14 are legal** —
nine actions with a single legal source, plus `CancelBooking`, legal from all
five non-terminal states — and **96 must be rejected**.

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
| `deposit_paid` | `MarkDepositReceived` | no |
| `confirmed` | `ConfirmDeposit` **or** `ConfirmDepositReceived` | no |
| `completed` | `CompleteBooking` | yes |
| `cancelled` | `CancelBooking` | yes |
| `expired` | the two sweeps | yes |
| `no_show` | `MarkNoShow` | yes |
| `refund_due` | `CancelBooking(refundDue=true)` | no — `MarkRefunded` closes it (was a dead end until §5.2 was fixed) |
| `refunded` | `MarkRefunded` | yes |

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
| `MarkRefunded` | `refund_due` | none | `BOOKING_NOT_REFUND_DUE` |
| `CancelBooking` | any non-terminal | **`confirmed` only: start must be future** | `BOOKING_NOT_CANCELLABLE` · `BOOKING_ALREADY_STARTED` |

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

`MarkRefunded` is legal from `refund_due` only and rejects every other status
with `BOOKING_NOT_REFUND_DUE`. It is left out of the grid below purely to keep
the table readable, not because it is exempt.

| status ↓ / action → | Approve | MarkDepRcvd | ConfirmDep | ConfirmDepRcvd | Complete | NoShow |
|---|---|---|---|---|---|---|
| `held` | ✗ NOT_PENDING | ✗ NOT_APPROVED | ✗ NOT_DEPOSIT_PAID | ✗ NOT_APPROVED | ✗ NOT_CONFIRMED | ✗ NOT_CONFIRMED |
| `pending` | ✅ *(future only)* | ✗ NOT_APPROVED | ✗ NOT_DEPOSIT_PAID | ✗ NOT_APPROVED | ✗ NOT_CONFIRMED | ✗ NOT_CONFIRMED |
| `approved` | ✗ NOT_PENDING | ✅ ⚠️ | ✗ NOT_DEPOSIT_PAID | ✅ ⚠️ | ✗ NOT_CONFIRMED | ✗ NOT_CONFIRMED |
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
| `deposit_paid` | ✗ HOLD_EXPIRED | ✗ NOT_HELD | ✅ | — | — |
| `confirmed` | ✗ HOLD_EXPIRED | ✗ NOT_HELD | ✅ *(future only, §4.4)* | — | — |
| `completed` | ✗ HOLD_EXPIRED | ✗ NOT_HELD | ✗ NOT_CANCELLABLE | — | — |
| `cancelled` | ✗ HOLD_EXPIRED | ✗ NOT_HELD | ✗ NOT_CANCELLABLE | — | — |
| `expired` | ✗ HOLD_EXPIRED | ✗ NOT_HELD | ✗ NOT_CANCELLABLE | — | — |
| `no_show` | ✗ HOLD_EXPIRED | ✗ NOT_HELD | ✗ NOT_CANCELLABLE | — | — |
| `refund_due` | ✗ HOLD_EXPIRED | ✗ NOT_HELD | ✗ NOT_CANCELLABLE | — | — |
| `refunded` | ✗ HOLD_EXPIRED | ✗ NOT_HELD | ✗ NOT_CANCELLABLE | — | — |

---

## 4. Decisions the matrix surfaces

These are the `⚠️` cells. **They are product decisions, not bugs** — the code
is self-consistent; nobody has ever been asked the question.

### 4.1 The time-guard asymmetry — ✅ RESOLVED 2026-09-01: option 2

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

**Chose option 2.** The bookkeeping is legitimate; the message is not.
`announceConfirmed` returns early when `StartTime` is in the past, so both
routes still confirm but neither messages the customer or issues a calendar
link for a date that has gone.

### 4.2 Two paths to `confirmed` — ✅ RESOLVED 2026-09-01: keep both

```
approved ──MarkDepositReceived──▶ deposit_paid ──ConfirmDeposit──▶ confirmed
approved ──────────────ConfirmDepositReceived──────────────────▶ confirmed
```

Two routes to the same state is a standing invitation for behaviour to be
wired to one and not the other — which is exactly what happened (§5.1).

**Both stay.** The two-step is not legacy - it was built deliberately, and
`deposit-queue.component.ts` says why: *"a partial payment or disputed
transfer that genuinely needs the steps apart."* It is wired as a secondary
"mark partial" action beside the primary Verify button, and an earlier
session specifically fixed `deposit_paid` bookings vanishing from every list
on that screen. Deleting it would remove a working feature.

That settles §5.1's fix too: if the two-step exists for partial payments,
reaching `confirmed` that way is a real confirmation and the customer must be
told. The announcement now lives in one shared `announceConfirmed`, so
anything wired to "the booking became confirmed" cannot attach to one route
and miss the other.

### 4.3 Two statuses nothing can ever produce — ✅ RESOLVED 2026-09-01

`deposit_pending` and `refunded` **were** in the `bookings_status_check`
constraint and referenced by zero write paths. `refunded` is *especially*
suspicious given §5.2 — it looks like the missing half of the refund flow.

**`deposit_pending` dropped** (migration 032) — no write path ever set it and
zero rows ever held it. **`refunded` kept**, because §5.2's fix gave it a
writer, so it is now a real state rather than a vestigial one. The status
count is 12 → 11, and the matrix loses 9 cells that existed only to prove an
impossible status rejects everything.

### 4.4 Cancelling a booking after it has started — ✅ RESOLVED 2026-09-01, narrower than proposed

`CancelBooking` has no time guard, so a booking can be cancelled at any point
— including mid-appointment or a week afterwards. `CompleteBooking` and
`MarkNoShow` both require the start to be past; cancel is the only one of the
three that does not care.

The obvious answer — block cancel once the start time passes — is **wrong as
a blanket rule**, and working through the consequences is what caught it.

Only `held` and `approved` have an expiry sweep. `pending` has none and
cannot be approved once its start time passes (`BOOKING_TIME_PASSED`), so
cancel is its *only* disposal; `deposit_paid` has no sweep either. A blanket
guard would have turned both into permanent dead ends — creating exactly the
class of bug §5.2 was about, while fixing a cosmetic one.

**Scoped to `confirmed` only.** There the appointment genuinely happened and
`completed`/`no_show` are the honest outcomes, and recording it as
"cancelled" also misreports earnings. Everything else stays cancellable at
any time. A test asserts the *narrowness* explicitly, so widening the guard
later fails rather than silently stranding rows.

---

## 5. Confirmed defects — found by writing this document

### 5.1 One of the two confirmation paths tells the customer nothing 🐞 — FIXED 2026-09-01

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

**Fixed.** Both routes now call one shared `announceConfirmed`. A test
asserts the two messages are byte-identical - *"a customer must not be able to
tell which button the artist pressed"* - rather than leaving that implied by
two separate tests passing.

### 5.2 `refund_due` is a dead end, with money in it 🐞 — FIXED 2026-09-01

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

**Fixed.** `PATCH /bookings/:id/refunded` transitions `refund_due →
refunded`, guarded on that status, with an optional reference mirroring
`ConfirmDepositReceived`'s. No customer message: they were already told about
the cancellation, and announcing an out-of-band bank transfer they either
have or have not received would raise more questions than it answers.

Verified live against the two stuck rows. Rania's closed (200, reference
recorded); the second returned **403** because it belongs to `mkup2` - the
ownership guard working, not a failure. A replay returned
`BOOKING_NOT_REFUND_DUE`.

---

## 6. Execution — ✅ BUILT 2026-09-01

`internal/booking/statematrix_test.go` is this table as data plus one loop:
**7 actions × 11 statuses × 2 time positions = 154 cells**, every one
asserted. Adding a status or an action is a row or a column, not a new
hand-written test somebody has to remember.

It enforces both rules below, neither of which the suite had before: the
exact **error code**, and that a rejected action **did not write the row**.
The mock repository re-implements the SQL's own status guard, so a *missing*
service-layer guard surfaces as the repository being reached with the wrong
status rather than passing silently.

**Mutation-tested rather than assumed.** 154 cells passing first time is
exactly the shape of a vacuous test, so three deliberate defects were
introduced and the matrix caught all three:

| Mutation | Caught |
|---|---|
| Removed `CompleteBooking`'s status guard | ✅ 6 failing cells |
| Removed `MarkNoShow`'s *time* guard, status guard intact | ✅ `confirmed (future appointment): timing must be enforced` |
| Correct rejection, **wrong error code** | ✅ `wrong rejection code` |

The third is the one no previous test in this codebase could have caught.

### The original plan, kept for the parts not yet done

Build it as a **runnable script**, not a manual checklist — the value is that
it stays a regression suite once the bulk-shift write path starts adding
transitions to this same machine.

For each of the 110 cells: seed a booking in the row's status, call the
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
