import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { A11yModule } from '@angular/cdk/a11y';

import { ArtistDataService, BookingDataService, ButtonComponent } from '@bedge/shared';
import type { EnrichedBooking } from '@bedge/shared';

type QueueTab = 'pending' | 'received';

/**
 * Deposit Queue - the artist's list of bookings awaiting deposit
 * verification (approved, deposit not yet confirmed) and ones already
 * confirmed (received). Flagged in the project's own notes as the
 * highest-priority unbuilt screen; the backend action it drives
 * (PATCH /bookings/:id/confirm-payment) was built and live-verified
 * earlier - this screen is the first UI to actually call it.
 *
 * "Deposit" here specifically means bookings for a deposit-bearing
 * service (deposit_amount > 0). An approved booking for a $0-deposit
 * service still needs the same confirm-payment action to reach
 * "confirmed", but it doesn't belong in a screen about verifying money
 * transfers - those stay visible/actionable from the main Bookings list.
 *
 * The "pending" list also now includes bookings in the deposit_paid
 * status - the two-step edge case (markDepositReceived → confirmDeposit)
 * kept alongside the one-tap confirm-payment path for a partial payment
 * or disputed transfer that genuinely needs the steps apart. Before this,
 * deposit_paid had no UI trigger anywhere: no card could ever reach that
 * status, and if one somehow had, it would have vanished from every list
 * on this screen (matched by neither the 'approved' nor 'confirmed'
 * queries this component runs).
 */
@Component({
  selector: 'bedge-deposit-queue',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, ButtonComponent, A11yModule],
  templateUrl: './deposit-queue.component.html',
})
export class DepositQueueComponent implements OnInit {
  private readonly artistSvc = inject(ArtistDataService);
  private readonly bookingSvc = inject(BookingDataService);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  private readonly artistId = signal<string | null>(null);
  private readonly pendingAll = signal<EnrichedBooking[]>([]);
  private readonly depositPaidAll = signal<EnrichedBooking[]>([]);
  private readonly receivedAll = signal<EnrichedBooking[]>([]);

  readonly activeTab = signal<QueueTab>('pending');

  /** Approved + deposit_paid bookings with a real deposit, soonest deadline
   *  first - both still need an artist action to reach 'confirmed', so
   *  both belong in the same "needs attention" list. The template branches
   *  on item.status to show the right action per card. */
  readonly pending = computed(() =>
    [...this.pendingAll(), ...this.depositPaidAll()].sort((a, b) =>
      (a.deposit_deadline ?? '').localeCompare(b.deposit_deadline ?? ''),
    ),
  );

  /** Confirmed bookings with a real deposit, most recently confirmed first. */
  readonly received = computed(() =>
    [...this.receivedAll()].sort((a, b) =>
      (b.deposit_paid_at ?? '').localeCompare(a.deposit_paid_at ?? ''),
    ),
  );

  readonly pendingCount = computed(() => this.pending().length);
  readonly receivedCount = computed(() => this.received().length);

  /** A pending deposit is urgent once its deadline is under 24h away. */
  readonly hasUrgent = computed(() =>
    this.pending().some((b) => this.isUrgent(b)),
  );

  readonly urgentItem = computed(() => this.pending().find((b) => this.isUrgent(b)));

  // ── Verify modal ─────────────────────────────────────────────────────────

  readonly verifyingItem = signal<EnrichedBooking | null>(null);
  readonly verificationNotes = signal('');
  readonly verifying = signal(false);

  ngOnInit(): void {
    this.load();
  }

  selectTab(tab: QueueTab): void {
    this.activeTab.set(tab);
  }

  openVerify(item: EnrichedBooking): void {
    this.verifyingItem.set(item);
    this.verificationNotes.set('');
  }

  closeVerify(): void {
    if (this.verifying()) return; // don't let a stray click cancel an in-flight confirm
    this.verifyingItem.set(null);
  }

  confirmVerify(): void {
    const item = this.verifyingItem();
    if (!item || this.verifying()) return;

    this.verifying.set(true);
    const notes = this.verificationNotes().trim();

    this.bookingSvc.confirmPayment(item.id, notes || undefined).subscribe({
      next: () => {
        this.verifying.set(false);
        this.verifyingItem.set(null);
        this.load(); // re-fetch - item moves from pending to received
      },
      error: () => {
        this.verifying.set(false);
        this.errorMessage.set('Could not confirm this deposit. Please try again.');
      },
    });
  }

  /** ID of the booking a two-step action is in flight for, for per-card
   *  loading state on the two edge-case actions below. */
  readonly actingOnId = signal<string | null>(null);

  /**
   * Edge case, not the common path: a partial transfer or a disputed
   * amount that shouldn't be confirmed as a full deposit yet, but is worth
   * recording as "something arrived" separately from the eventual final
   * confirm. approved → deposit_paid. Deliberately a plain text action
   * next to the primary Verify button in the modal, not a second button of
   * equal visual weight - this should be reached for rarely.
   */
  markPartial(): void {
    const item = this.verifyingItem();
    if (!item || this.verifying()) return;

    this.verifying.set(true);
    this.bookingSvc.markDepositReceived(item.id).subscribe({
      next: () => {
        this.verifying.set(false);
        this.verifyingItem.set(null);
        this.load();
      },
      error: () => {
        this.verifying.set(false);
        this.errorMessage.set('Could not mark this deposit as partially received. Please try again.');
      },
    });
  }

  /** deposit_paid → confirmed. The second half of the two-step path -
   *  no amount left to verify at this point, so a direct action rather
   *  than reopening the Verify modal. */
  confirmFinal(item: EnrichedBooking): void {
    if (this.actingOnId()) return;

    this.actingOnId.set(item.id);
    this.bookingSvc.confirmDeposit(item.id).subscribe({
      next: () => {
        this.actingOnId.set(null);
        this.load();
      },
      error: () => {
        this.actingOnId.set(null);
        this.errorMessage.set('Could not confirm this booking. Please try again.');
      },
    });
  }

  /** Initials for the avatar circle, e.g. "Maya J." → "MJ". */
  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  formatBookingTime(iso: string): string {
    return new Date(iso).toLocaleString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: 'numeric', minute: '2-digit',
    });
  }

  formatDueDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  isUrgent(item: EnrichedBooking): boolean {
    if (!item.deposit_deadline) return false;
    const hoursLeft = (new Date(item.deposit_deadline).getTime() - Date.now()) / 3_600_000;
    return hoursLeft <= 24;
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    const id = this.artistId();
    if (id) {
      this.loadBookings(id);
      return;
    }

    this.artistSvc.getMyProfile().subscribe({
      next: (profile) => {
        this.artistId.set(profile.id);
        this.loadBookings(profile.id);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 0 ? 'Cannot reach the server.' : 'Failed to load your profile.',
        );
      },
    });
  }

  private loadBookings(artistId: string): void {
    forkJoin({
      approved: this.bookingSvc.getArtistBookings(artistId, undefined, 100, 'approved'),
      depositPaid: this.bookingSvc.getArtistBookings(artistId, undefined, 100, 'deposit_paid'),
      confirmed: this.bookingSvc.getArtistBookings(artistId, undefined, 100, 'confirmed'),
    }).subscribe({
      next: ({ approved, depositPaid, confirmed }) => {
        // getArtistBookings is typed for Booking (the base list result type)
        // but /bookings/artist/:id actually returns the enriched shape
        // same cast bookings.component.ts already relies on for this
        // endpoint, not something new introduced here.
        const approvedItems = (approved.items as unknown as EnrichedBooking[]) ?? [];
        const depositPaidItems = (depositPaid.items as unknown as EnrichedBooking[]) ?? [];
        const confirmedItems = (confirmed.items as unknown as EnrichedBooking[]) ?? [];

        const hasDeposit = (b: EnrichedBooking) =>
          parseFloat(b.deposit_amount) > 0;

        this.pendingAll.set(approvedItems.filter(hasDeposit));
        // Every deposit_paid booking has, by definition, a real deposit -
        // reaching that status at all requires markDepositReceived, which
        // only exists as an action on deposit-bearing bookings in the
        // first place - no hasDeposit filter needed here.
        this.depositPaidAll.set(depositPaidItems);
        // "Received" specifically means a deposit that was actually
        // confirmed via this flow - deposit_paid_at set - not just any
        // confirmed booking for a deposit-bearing service, since older
        // data or a different confirmation path might not have it.
        this.receivedAll.set(
          confirmedItems.filter((b) => hasDeposit(b) && !!b.deposit_paid_at),
        );

        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 0 ? 'Cannot reach the server.' : 'Failed to load deposits.',
        );
      },
    });
  }
}
