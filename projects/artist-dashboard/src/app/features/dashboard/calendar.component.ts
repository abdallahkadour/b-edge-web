import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';

import { ArtistDataService, BookingDataService } from '@bedge/shared';
import type { EnrichedBooking } from '@bedge/shared';
import { environment } from '../../../environments/environment';

/** The store's timezone - every appointment is positioned on the grid in
 * this zone, not the browser's local zone. Matches the exact convention
 * already established in customer-pwa's pick-datetime-screen. Hardcoded
 * for the same reason: every store is currently in Lebanon. */
const STORE_TIMEZONE = 'Asia/Beirut';

/** Grid covers 6 AM - 10 PM Beirut - comfortably wider than any business
 * hours seen in real data, without rendering a mostly-empty 24-hour grid. */
const GRID_START_HOUR = 6;
const GRID_END_HOUR = 22;
const HOUR_ROW_PX = 56;

interface WeekDay {
  dateStr: string; // YYYY-MM-DD, Beirut-local
  weekdayLabel: string; // "Mon"
  dayNum: number;
  isToday: boolean;
  hasBooking: boolean;
}

interface PositionedBooking {
  booking: EnrichedBooking;
  topPx: number;
  heightPx: number;
  startLabel: string;
  endLabel: string;
}

@Component({
  selector: 'bedge-calendar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  templateUrl: './calendar.component.html',
})
export class CalendarComponent implements OnInit {
  private readonly artistSvc = inject(ArtistDataService);
  private readonly bookingSvc = inject(BookingDataService);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  private readonly artistId = signal<string | null>(null);
  private readonly weekBookings = signal<EnrichedBooking[]>([]);
  /** Monday of the currently-viewed week, Beirut-local, YYYY-MM-DD. */
  private readonly weekStart = signal<string>(mondayOf(beirutToday()));

  readonly selectedDayIndex = signal<number>(beirutTodayWeekdayIndex());
  readonly selectedBooking = signal<EnrichedBooking | null>(null);

  protected readonly hours: number[] = Array.from(
    { length: GRID_END_HOUR - GRID_START_HOUR + 1 },
    (_, i) => GRID_START_HOUR + i,
  );

  readonly weekDays = computed((): WeekDay[] => {
    const start = this.weekStart();
    const bookedDates = new Set(
      this.weekBookings().map((b) => beirutDateStr(b.start_time)),
    );
    const today = beirutToday();

    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(start, i);
      return {
        dateStr: d,
        weekdayLabel: new Date(d + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'short' }),
        dayNum: parseInt(d.split('-')[2], 10),
        isToday: d === today,
        hasBooking: bookedDates.has(d),
      };
    });
  });

  readonly weekRangeLabel = computed((): string => {
    const days = this.weekDays();
    if (days.length === 0) return '';
    const first = new Date(days[0].dateStr + 'T12:00:00Z');
    const last = new Date(days[6].dateStr + 'T12:00:00Z');
    const fmt = (d: Date) => d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
    return `${fmt(first)} – ${fmt(last)}`;
  });

  readonly selectedDayLabel = computed((): string => {
    const days = this.weekDays();
    const day = days[this.selectedDayIndex()];
    if (!day) return '';
    return `${day.weekdayLabel} ${new Date(day.dateStr + 'T12:00:00Z').toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}`;
  });

  /** Bookings for the selected day, positioned on the hourly grid. */
  readonly dayBookings = computed((): PositionedBooking[] => {
    const days = this.weekDays();
    const selectedDate = days[this.selectedDayIndex()]?.dateStr;
    if (!selectedDate) return [];

    return this.weekBookings()
      .filter((b) => beirutDateStr(b.start_time) === selectedDate)
      .map((b) => {
        const startHour = beirutHourDecimal(b.start_time);
        const endHour = beirutHourDecimal(b.end_time);
        const clampedStart = Math.max(startHour, GRID_START_HOUR);
        const clampedEnd = Math.min(endHour, GRID_END_HOUR + 1);
        return {
          booking: b,
          topPx: (clampedStart - GRID_START_HOUR) * HOUR_ROW_PX,
          heightPx: Math.max((clampedEnd - clampedStart) * HOUR_ROW_PX, 28),
          startLabel: formatBeirutTime(b.start_time),
          endLabel: formatBeirutTime(b.end_time),
        };
      })
      .sort((a, b) => a.topPx - b.topPx);
  });

  /** Only shown when the selected day is genuinely today, in Beirut terms. */
  readonly currentTimeTopPx = computed((): number | null => {
    const days = this.weekDays();
    const day = days[this.selectedDayIndex()];
    if (!day?.isToday) return null;
    const nowHour = beirutHourDecimal(new Date().toISOString());
    if (nowHour < GRID_START_HOUR || nowHour > GRID_END_HOUR + 1) return null;
    return (nowHour - GRID_START_HOUR) * HOUR_ROW_PX;
  });

  protected readonly currentTimeLabel = formatBeirutTime(new Date().toISOString());

  ngOnInit(): void {
    this.load();
  }

  selectDay(index: number): void {
    this.selectedDayIndex.set(index);
    this.selectedBooking.set(null);
  }

  openDetail(booking: EnrichedBooking): void {
    this.selectedBooking.set(booking);
  }

  closeDetail(): void {
    this.selectedBooking.set(null);
  }

  previousWeek(): void {
    this.weekStart.set(addDays(this.weekStart(), -7));
    this.selectedDayIndex.set(0);
    this.loadWeek();
  }

  nextWeek(): void {
    this.weekStart.set(addDays(this.weekStart(), 7));
    this.selectedDayIndex.set(0);
    this.loadWeek();
  }

  /** "Text client" opens a WhatsApp chat - real, functional, not a placeholder
   * alert like the reference design. WhatsApp's wa.me links need digits only. */
  whatsAppLink(phone: string): string {
    return `https://wa.me/${phone.replace(/\D/g, '')}`;
  }

  telLink(phone: string): string {
    return `tel:${phone}`;
  }

  /** Human label for a booking's real status - no false "via WhatsApp" claim,
   * since WhatsApp confirmation isn't actually wired up yet. */
  statusLabel(status: string): string {
    return status
      .split('_')
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(' ');
  }

  /** Human label for the detail slideout's slot row, e.g. "Thu 6 Aug, 1:00 PM" - Beirut time, matching every other time shown on this screen. */
  formatSlotLabel(iso: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: STORE_TIMEZONE,
      weekday: 'short', day: 'numeric', month: 'short',
      hour: 'numeric', minute: '2-digit', hour12: true,
    }).format(new Date(iso));
  }

  /**
   * "Send review request" - the manual stopgap for the guest review-link
   * feature. Automated delivery (WhatsApp on booking completion) isn't
   * wired up yet, so until it is, this is the only way the actual link
   * reaches a customer: the artist taps this after marking an appointment
   * complete, and it opens WhatsApp with the link pre-filled.
   */
  reviewRequestLink(booking: EnrichedBooking): string | null {
    if (!booking.review_token || !booking.customer_phone) return null;
    const reviewUrl = `${environment.customerPwaUrl}/review/${booking.review_token}`;
    const message = `Hi ${booking.customer_name}! Thanks for booking with us. We'd love to hear how it went - leave a quick review here: ${reviewUrl}`;
    return `https://wa.me/${booking.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.artistSvc.getMyProfile().subscribe({
      next: (profile) => {
        this.artistId.set(profile.id);
        this.loadWeek();
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 0 ? 'Cannot reach the server.' : 'Failed to load your profile.',
        );
      },
    });
  }

  private loadWeek(): void {
    const id = this.artistId();
    if (!id) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    this.bookingSvc.getArtistCalendar(id, this.weekStart()).subscribe({
      next: (result) => {
        this.weekBookings.set(result.items ?? []);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 0 ? 'Cannot reach the server.' : 'Failed to load your calendar.',
        );
      },
    });
  }
}

// ── Beirut-local date/time helpers ──────────────────────────────────────────
// All positioning math happens in Beirut local time, not the browser's local
// zone or raw UTC - an appointment at 09:00 Beirut must land on the 09:00 row
// regardless of what timezone the artist's own device is set to.

function beirutParts(iso: string): { year: number; month: number; day: number; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: STORE_TIMEZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(iso));
  const get = (type: string) => parseInt(parts.find((p) => p.type === type)?.value ?? '0', 10);
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute') };
}

function beirutDateStr(iso: string): string {
  const p = beirutParts(iso);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

function beirutHourDecimal(iso: string): number {
  const p = beirutParts(iso);
  return p.hour + p.minute / 60;
}

function beirutToday(): string {
  return beirutDateStr(new Date().toISOString());
}

function beirutTodayWeekdayIndex(): number {
  // Monday = 0 ... Sunday = 6
  const jsDay = new Date(beirutToday() + 'T12:00:00Z').getUTCDay(); // Sunday=0..Saturday=6
  return (jsDay + 6) % 7;
}

function mondayOf(dateStr: string): string {
  const jsDay = new Date(dateStr + 'T12:00:00Z').getUTCDay();
  const offset = (jsDay + 6) % 7; // days since Monday
  return addDays(dateStr, -offset);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatBeirutTime(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: STORE_TIMEZONE,
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(iso));
}
