import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { ArtistDataService, BookingDataService, MediaDataService, extractApiErrorMessage } from '@bedge/shared';
import type { Artist, Service, Store, MediaItem, Booking } from '@bedge/shared';

import { ArtistProfileScreenComponent } from './screens/artist-profile-screen.component';
import { SelectServiceScreenComponent } from './screens/select-service-screen.component';
import { PickDatetimeScreenComponent } from './screens/pick-datetime-screen.component';
import { GuestDetailsScreenComponent } from './screens/guest-details-screen.component';
import { SlotUnavailableScreenComponent } from './screens/slot-unavailable-screen.component';
import { BookingConfirmedScreenComponent } from './screens/booking-confirmed-screen.component';

type FunnelStep =
  | 'profile'
  | 'select-service'
  | 'pick-datetime'
  | 'details'
  | 'slot-unavailable'
  | 'confirmed';

/**
 * Container for the guest booking funnel. Routed at /book/:artistId.
 *
 * Owns the artist data and the entire in-progress booking draft, including
 * the slot hold's lifecycle. The screens below are presentational - they
 * receive data and emit intent, they do not call the booking API directly.
 * Centralising the hold here (rather than inside GuestDetailsScreen) means
 * the hold is created the instant a slot is chosen, not after a render
 * delay, and its expiry is handled the same way regardless of which screen
 * the customer is looking at when it happens.
 *
 * Deliberately NOT routed per-step: a live 10-minute slot hold should not be
 * addressable by URL, or browser back/forward lands the customer on a stale
 * step holding an expired booking ID.
 */
@Component({
  selector: 'app-booking-funnel-page',
  standalone: true,
  imports: [
    ArtistProfileScreenComponent,
    SelectServiceScreenComponent,
    PickDatetimeScreenComponent,
    GuestDetailsScreenComponent,
    SlotUnavailableScreenComponent,
    BookingConfirmedScreenComponent,
  ],
  templateUrl: './booking-funnel.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingFunnelPage implements OnInit {
  private readonly artistApi = inject(ArtistDataService);
  private readonly mediaApi = inject(MediaDataService);
  private readonly bookingApi = inject(BookingDataService);
  private readonly router = inject(Router);

  readonly artistId = input.required<string>();

  /**
   * The real artist UUID, once resolved. artistId() may be a public handle
   * (e.g. "rania") rather than a UUID - the backend resolves either form
   * transparently for GET /artists/:id, but downstream calls that expect a
   * genuine UUID (guest hold's artist_id, media's portfolio endpoint
   * neither accepts a handle) need the resolved value, not the raw route
   * param. Resolved once here, reused everywhere below, rather than each
   * downstream call re-resolving independently.
   */
  readonly resolvedArtistId = signal<string | null>(null);

  // ── Loaded data ────────────────────────────────────────────────────────────
  protected readonly artist = signal<Artist | null>(null);
  protected readonly services = signal<Service[]>([]);
  protected readonly stores = signal<Store[]>([]);
  protected readonly portfolio = signal<MediaItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);

  // ── Booking draft ──────────────────────────────────────────────────────────
  protected readonly step = signal<FunnelStep>('profile');
  protected readonly selectedServiceId = signal<string | null>(null);
  protected readonly selectedStoreId = signal<string | null>(null);
  protected readonly selectedStartTime = signal<string | null>(null);

  // ── Slot hold ──────────────────────────────────────────────────────────────
  protected readonly holdBookingId = signal<string | null>(null);
  protected readonly heldUntil = signal<string | null>(null);
  protected readonly holdingSlot = signal(false);

  // ── Guest contact details - lifted so they survive a re-hold cycle ────────
  protected readonly customerName = signal('');
  protected readonly customerPhone = signal('');
  protected readonly customerNotes = signal('');

  // ── Submit ─────────────────────────────────────────────────────────────────
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly confirmedBooking = signal<Booking | null>(null);

  protected readonly selectedService = computed(
    () => this.services().find((s) => s.id === this.selectedServiceId()) ?? null,
  );
  protected readonly selectedStore = computed(
    () => this.stores().find((s) => s.id === this.selectedStoreId()) ?? null,
  );

  /**
   * Loads in ngOnInit rather than a constructor effect.
   *
   * artistId is bound by the router via withComponentInputBinding(), and on a
   * lazily-loaded route an effect created in the constructor can run before
   * the router has written that input - which throws NG0950 on a required
   * input. ngOnInit is guaranteed to run after inputs are set.
   */
  ngOnInit(): void {
    const id = this.artistId();

    this.artistApi.getArtistById(id).subscribe({
      next: (artist) => {
        this.artist.set(artist);
        this.loading.set(false);

        // The backend always returns the real UUID in the response body,
        // regardless of whether the request used a handle or a UUID
        // capture it here so everything downstream uses a genuine UUID.
        this.resolvedArtistId.set(artist.id);

        this.artistApi.getServicesByArtist(artist.id).subscribe({
          next: (services) => this.services.set(services),
        });

        this.artistApi.getStoresByArtist(artist.id).subscribe({
          next: (stores) => this.stores.set(stores),
        });

        this.mediaApi.getPortfolio(artist.id).subscribe({
          next: (res) => this.portfolio.set(res.photos ?? []),
        });
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  /**
   * Tapping a specific service row on the profile skips select-service and
   * jumps straight to pick-datetime with that service chosen. Tapping the
   * bottom CTA instead lands on select-service with nothing pre-selected.
   */
  protected onProfileContinue(preSelectedServiceId?: string): void {
    if (preSelectedServiceId) {
      this.selectedServiceId.set(preSelectedServiceId);
      this.step.set('pick-datetime');
    } else {
      this.step.set('select-service');
    }
  }

  /** Navigates to the product shop for this artist. Uses the raw
   *  artistId() route param, not resolvedArtistId() - the shop resolves
   *  its own salon_id from either a handle or a UUID, same as this page
   *  does, so there is no reason to wait for that resolution to finish
   *  just to leave the page. */
  protected onOpenShop(): void {
    this.router.navigate(['/shop', this.artistId()]);
  }

  /**
   * A slot was chosen on pick-datetime. Creates the 10-minute hold
   * immediately, before switching screens - so the customer never sees the
   * details form for a slot that turned out to already be taken.
   */
  protected onSlotChosen(choice: { storeId: string; startTime: string }): void {
    this.selectedStoreId.set(choice.storeId);
    this.selectedStartTime.set(choice.startTime);

    const service = this.selectedService();
    const artistId = this.resolvedArtistId();
    if (!service || !artistId) return; // guarded by canContinue upstream; defensive only

    this.holdingSlot.set(true);

    this.bookingApi
      .holdGuestSlot({
        artist_id: artistId,
        store_id: choice.storeId,
        service_id: service.id,
        start_time: choice.startTime,
      })
      .subscribe({
        next: (hold) => {
          this.holdBookingId.set(hold.booking_id);
          this.heldUntil.set(hold.held_until);
          this.holdingSlot.set(false);
          this.step.set('details');
        },
        error: () => {
          // Covers SLOT_UNAVAILABLE (409, someone else took it in the last
          // few seconds) and any other hold failure. Treated the same way
          // deliberately - whatever the cause, the customer's only useful
          // next action is picking a different time.
          this.holdingSlot.set(false);
          this.step.set('slot-unavailable');
        },
      });
  }

  /** The local countdown reached zero before the customer submitted. */
  protected onHoldExpired(): void {
    this.step.set('slot-unavailable');
  }

  protected onDetailsSubmit(details: { name: string; phone: string; notes: string }): void {
    const bookingId = this.holdBookingId();
    if (!bookingId) return;

    this.submitting.set(true);
    this.submitError.set(null);

    this.bookingApi
      .submitGuestBooking(bookingId, {
        name: details.name,
        phone: details.phone,
        special_requests: details.notes || undefined,
      })
      .subscribe({
        next: (booking) => {
          this.submitting.set(false);
          this.confirmedBooking.set(booking);
          this.step.set('confirmed');
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          const code = (err.error as { error?: { code?: string } })?.error?.code;

          if (code === 'HOLD_EXPIRED') {
            this.step.set('slot-unavailable');
            return;
          }

          this.submitError.set(
            extractApiErrorMessage(err, 'Something went wrong sending your request. Please try again.'),
          );
        },
      });
  }

  /** From Slot Unavailable - back to picking a time, keeping service and contact details. */
  protected onChooseAnotherTime(): void {
    this.holdBookingId.set(null);
    this.heldUntil.set(null);
    this.submitError.set(null);
    this.step.set('pick-datetime');
  }

  /** From Slot Unavailable - abandon the booking attempt entirely. */
  protected onSlotUnavailableBackToProfile(): void {
    this.resetDraft();
    this.step.set('profile');
  }

  /** From Booking Confirmed - start fresh. */
  protected onConfirmedBackToProfile(): void {
    this.resetDraft();
    this.step.set('profile');
  }

  private resetDraft(): void {
    this.selectedServiceId.set(null);
    this.selectedStoreId.set(null);
    this.selectedStartTime.set(null);
    this.holdBookingId.set(null);
    this.heldUntil.set(null);
    this.customerName.set('');
    this.customerPhone.set('');
    this.customerNotes.set('');
    this.submitError.set(null);
    this.confirmedBooking.set(null);
  }
}
