import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { A11yModule } from '@angular/cdk/a11y';

import {
  BookingDataService,
  ButtonComponent,
  InputDirective,
  isValidLocalPhone,
  DEFAULT_PHONE_ISO,
  PhoneInputComponent,
  isValidNationalPhone,
  toE164,
} from '@bedge/shared';
import type { Store, TimeSlot } from '@bedge/shared';

/** One cell in the horizontal 28-day strip. */
interface DateCell {
  readonly iso: string; // YYYY-MM-DD
  readonly weekday: string; // MON
  readonly dayNum: number;
  readonly month: string; // Jul
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * How many days ahead the date strip runs.
 *
 * Was 28, then 90. Both were too short, and for the same reason: a number
 * that sounded far away, picked without checking it against what the
 * business actually sells.
 *
 * 28 meant the strip stopped dead four weeks out — reported as "booking is
 * only available for this month". 90 was chosen as "a quarter, which covers
 * the things people book far ahead — weddings, graduations, Eid". It does
 * not cover weddings. Brides book six to twelve months ahead; the launch
 * artist takes bridal 11–12 months out, and bridal is roughly double the
 * price of anything else she does. So for as long as this said 90, her
 * highest-value bookings could not be made through the funnel at all — they
 * arrived by DM and were keyed in by hand.
 *
 * 400 days is "next year, same date" plus slack. The server bounds this
 * independently at MaxBookingHorizon (550 days), which is a sanity bound
 * rather than a product rule — see internal/booking/model.go. When
 * services.max_advance_days lands, a regular session can go back to ~90
 * while bridal keeps the long horizon; until then one number serves both.
 *
 * A strip this long is far too much to scroll cell by cell, which is why
 * `monthJumps` exists below — and why its labels carry a year.
 */
const STRIP_DAYS = 400;

/**
 * The timezone appointment times are displayed in.
 *
 * Slot times arrive as UTC instants. They must render in the STORE's local
 * time, not the viewer's: an appointment at Beirut Downtown is at 6:00 AM
 * Beirut time whether the customer opens the link from Beirut, Dubai, or
 * Berlin. Using the browser's zone would show a different - and wrong - time
 * to anyone travelling or abroad.
 *
 * Hardcoded because every store is currently in Lebanon. When B-Edge expands
 * beyond one country this belongs on the store record as an IANA zone string.
 */
const STORE_TIMEZONE = 'Asia/Beirut';

/** Formats an instant in store-local time. Intl handles DST transitions. */
function storeParts(iso: string): Record<string, string> {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: STORE_TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(new Date(iso));

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

/** Store-local hour (0-23), for splitting morning from afternoon. */
function storeHour24(iso: string): number {
  const hour = new Intl.DateTimeFormat('en-US', {
    timeZone: STORE_TIMEZONE,
    hour: '2-digit',
    hour12: false,
  }).format(new Date(iso));
  return Number(hour) % 24;
}

/**
 * Step 3 of the guest funnel - choose a store, a date, and a slot.
 *
 * Slots are fetched per-date on tap rather than pre-loaded for the whole
 * strip. GET /bookings/slots runs a seven-step algorithm with several
 * sequential queries, so fanning it out 28 times on load would multiply
 * database load by visitor count. The trade-off is that fully-booked dates
 * cannot be greyed out in advance - they show "no availability" once tapped.
 * A bulk per-day endpoint is the pre-launch fix.
 */
@Component({
  selector: 'app-pick-datetime-screen',
  standalone: true,
  imports: [LucideAngularModule, A11yModule, ButtonComponent, InputDirective,
    PhoneInputComponent,
  ],
  templateUrl: './pick-datetime-screen.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickDatetimeScreenComponent {
  private readonly bookingApi = inject(BookingDataService);

  readonly artistId = input.required<string>();
  readonly serviceId = input.required<string>();
  readonly stores = input.required<Store[]>();
  /**
   * True while the container's POST /bookings/guest/hold request is in
   * flight, after Continue is tapped and before the screen switches to
   * details. Without this the button gives no feedback during that network
   * round trip and a second tap could fire a duplicate hold request.
   */
  readonly holding = input<boolean>(false);

  readonly back = output<void>();
  /** Emits the chosen store and slot start time (ISO 8601) on Continue. */
  readonly continueWith = output<{ storeId: string; startTime: string }>();

  // ── Waitlist (PRD §9.5) ──────────────────────────────────────────────────
  // Offered when a search for the selected date comes back with genuinely
  // no slots - the same event this screen already has (slots().length===0)
  // just needed a real action attached to it instead of a dead-end message.
  // Handled directly here, not routed through the container via an output,
  // matching this component's own established precedent (it already
  // injects BookingDataService for slot-fetching, so this isn't a new
  // deviation from "pure presentational" - it's consistent with what's
  // already here).
  protected readonly showWaitlistForm = signal(false);
  protected readonly waitlistName = signal('');
  protected readonly waitlistPhoneDigits = signal('');

  protected readonly waitlistPhoneIso = signal(DEFAULT_PHONE_ISO);
  protected readonly waitlistSubmitting = signal(false);
  protected readonly waitlistJoined = signal(false);
  protected readonly waitlistError = signal<string | null>(null);

  protected readonly isWaitlistPhoneValid = () => isValidNationalPhone(this.waitlistPhoneDigits(), this.waitlistPhoneIso());
  protected readonly isWaitlistNameValid = () => this.waitlistName().trim().length >= 2;

  openWaitlistForm(): void {
    this.waitlistError.set(null);
    this.showWaitlistForm.set(true);
  }

  closeWaitlistForm(): void {
    if (this.waitlistSubmitting()) return;
    this.showWaitlistForm.set(false);
  }

  onWaitlistPhoneInput(value: string): void {
    this.waitlistPhoneDigits.set(value.replace(/\D/g, '').slice(0, 8));
  }

  submitWaitlist(): void {
    const storeId = this.selectedStoreId();
    if (!storeId || !this.isWaitlistNameValid() || !this.isWaitlistPhoneValid() || this.waitlistSubmitting()) {
      return;
    }

    this.waitlistSubmitting.set(true);
    this.waitlistError.set(null);

    this.bookingApi
      .joinWaitlist({
        artist_id: this.artistId(),
        store_id: storeId,
        service_id: this.serviceId(),
        requested_date: this.selectedDate(),
        name: this.waitlistName().trim(),
        phone: toE164(this.waitlistPhoneDigits(), this.waitlistPhoneIso()),
      })
      .subscribe({
        next: () => {
          this.waitlistSubmitting.set(false);
          this.showWaitlistForm.set(false);
          this.waitlistJoined.set(true);
        },
        error: () => {
          this.waitlistSubmitting.set(false);
          this.waitlistError.set('Could not join the waitlist. Please try again.');
        },
      });
  }

  protected readonly selectedStoreId = signal<string | null>(null);
  protected readonly selectedDate = signal<string>(toIsoDate(new Date()));
  protected readonly selectedSlot = signal<string | null>(null);

  protected readonly slots = signal<TimeSlot[]>([]);
  protected readonly slotsLoading = signal(false);
  protected readonly slotsError = signal(false);

  /** 28 consecutive days starting today. */
  protected readonly dateCells = computed<DateCell[]>(() => {
    const today = new Date();
    const cells: DateCell[] = [];

    for (let i = 0; i < STRIP_DAYS; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      cells.push({
        iso: toIsoDate(d),
        weekday: WEEKDAYS[d.getDay()],
        dayNum: d.getDate(),
        month: MONTHS[d.getMonth()],
      });
    }
    return cells;
  });

  /** The scrollable strip, for jumping to a month. */
  private readonly strip = viewChild<ElementRef<HTMLDivElement>>('strip');

  /**
   * One chip per month the strip covers, pointing at that month's first
   * visible day. With 90 cells, scrolling to November by swiping is not a
   * realistic way to pick a date; this makes the far end of the range
   * reachable in one tap.
   */
  protected readonly monthJumps = computed(() => {
    const seen = new Set<string>();
    const out: { key: string; label: string; iso: string }[] = [];
    // A strip longer than a year contains the same month twice. Labelling
    // chips with the month alone then renders two chips both reading "Sep" —
    // distinct keys, identical labels, and no way for a customer to tell
    // next month from next year. The year is appended only when the strip
    // actually spans one, so the common case stays "Sep" not "Sep 26".
    const spansAYear = STRIP_DAYS > 365;

    for (const c of this.dateCells()) {
      const key = c.iso.slice(0, 7);
      if (seen.has(key)) continue;
      seen.add(key);
      const label = spansAYear ? `${c.month} ${c.iso.slice(2, 4)}` : c.month;
      out.push({ key, label, iso: c.iso });
    }
    return out;
  });

  /** True when the given month chip contains the selected date. */
  protected isActiveMonth(key: string): boolean {
    return (this.selectedDate() ?? '').slice(0, 7) === key;
  }

  /**
   * Scrolls the strip to a month's first day without selecting it.
   *
   * Jumping and selecting are deliberately separate: tapping "Nov" means
   * "show me November", not "book the 1st of November". Selecting on jump
   * would fire a slot fetch for a date the customer never chose.
   */
  protected jumpToMonth(iso: string): void {
    const el = this.strip()?.nativeElement.querySelector<HTMLElement>(`[data-date="${iso}"]`);
    el?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  }

  protected readonly activeMonthLabel = computed(() => {
    const cell = this.dateCells().find((c) => c.iso === this.selectedDate());
    return cell ? `${cell.month} ${cell.iso.slice(0, 4)}` : '';
  });

  /**
   * Slots are split by hour rather than by a fixed list, because the backend
   * generates them from each store's actual business hours.
   */
  protected readonly morningSlots = computed(() =>
    this.slots().filter((s) => storeHour24(s.start_time) < 12),
  );
  protected readonly afternoonSlots = computed(() =>
    this.slots().filter((s) => storeHour24(s.start_time) >= 12),
  );

  protected readonly canContinue = computed(
    () => this.selectedSlot() !== null && this.selectedStoreId() !== null && !this.holding(),
  );

  protected readonly ctaLabel = computed(() => {
    const slot = this.selectedSlot();
    if (!slot) return 'Continue';

    const part = storeParts(slot);
    return `Continue: ${part['weekday']} ${part['day']} ${part['month']}, ${this.formatTime(slot)}`;
  });

  constructor() {
    // Default to the artist's first store once the list arrives.
    effect(() => {
      const list = this.stores();
      if (list.length > 0 && this.selectedStoreId() === null) {
        this.selectedStoreId.set(list[0].id);
      }
    });

    // Refetch whenever store or date changes.
    effect(() => {
      const storeId = this.selectedStoreId();
      const date = this.selectedDate();
      if (!storeId) return;

      this.slotsLoading.set(true);
      this.slotsError.set(false);

      this.bookingApi
        .getAvailableSlots({
          artist_id: this.artistId(),
          store_id: storeId,
          service_id: this.serviceId(),
          date,
        })
        .subscribe({
          next: (slots) => {
            this.slots.set(slots);
            this.slotsLoading.set(false);
          },
          error: () => {
            this.slots.set([]);
            this.slotsError.set(true);
            this.slotsLoading.set(false);
          },
        });
    });
  }

  protected onStoreSelect(storeId: string): void {
    if (storeId === this.selectedStoreId()) return;
    this.selectedStoreId.set(storeId);
    this.selectedSlot.set(null); // availability differs per store
  }

  protected onDateSelect(iso: string): void {
    if (iso === this.selectedDate()) return;
    this.selectedDate.set(iso);
    this.selectedSlot.set(null);
    this.waitlistJoined.set(false);
    this.waitlistError.set(null);
  }

  protected onContinue(): void {
    if (this.holding()) return;
    const storeId = this.selectedStoreId();
    const startTime = this.selectedSlot();
    if (!storeId || !startTime) return;
    this.continueWith.emit({ storeId, startTime });
  }

  /**
   * Formats a slot's start time as "9:00 AM".
   *
   * Read in UTC deliberately. The backend builds slot times by combining a
   * store's local business hours with a date and stamping the result UTC, so
   * "09:00:00" opening hours become 09:00Z. Rendering those in the browser's
   * local zone would shift every slot by the UTC offset - in Beirut, a 9am
   * opening would display as noon.
   */
  protected formatTime(iso: string): string {
    const part = storeParts(iso);
    return `${part['hour']}:${part['minute']} ${part['dayPeriod']}`;
  }
}

/** Formats a Date as YYYY-MM-DD in local time. */
function toIsoDate(d: Date): string {
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

