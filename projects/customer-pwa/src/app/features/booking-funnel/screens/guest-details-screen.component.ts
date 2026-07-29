import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import type { Service } from '@bedge/shared';

/** The store's timezone. See pick-datetime-screen for why this isn't the browser's. */
const STORE_TIMEZONE = 'Asia/Beirut';

/** Lebanese mobile numbers run 7-8 digits after the +961 prefix, digits only. */
function isValidLocalPhone(digitsOnly: string): boolean {
  return /^\d{7,8}$/.test(digitsOnly);
}

/**
 * Step 4 of the guest funnel — contact details and final submit.
 *
 * The 10-minute slot hold already exists by the time this screen renders
 * (the container creates it on the transition from pick-datetime). This
 * component's job is entirely the form, the countdown, and communicating
 * expiry clearly — rather than letting a stale hold surface as a confusing
 * server error after the customer has typed everything in.
 */
@Component({
  selector: 'app-guest-details-screen',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './guest-details-screen.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestDetailsScreenComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly service = input.required<Service>();
  readonly storeName = input.required<string>();
  readonly startTime = input.required<string>(); // ISO 8601
  readonly heldUntil = input.required<string>(); // ISO 8601 — 10-minute hold deadline
  readonly submitting = input<boolean>(false);
  /** Set when the server rejects submit with HOLD_EXPIRED — a genuine race, not a form error. */
  readonly submitError = input<string | null>(null);

  /**
   * Seed values from the container. This component is destroyed and
   * recreated whenever the step switches away and back (e.g. hold expires ->
   * slot-unavailable -> customer picks a new time -> back here). Without
   * lifting the typed values up on every change, "your details have been
   * saved" on the Slot Unavailable screen would be a false promise — the
   * form would just be empty again.
   */
  readonly initialName = input<string>('');
  readonly initialPhone = input<string>('');
  readonly initialNotes = input<string>('');

  readonly back = output<void>();
  readonly submitDetails = output<{ name: string; phone: string; notes: string }>();
  /** Emitted once, the moment the local countdown reaches zero. */
  readonly holdExpired = output<void>();
  /** Emitted on every keystroke so the container can preserve values across a re-hold. */
  readonly nameChange = output<string>();
  readonly phoneChange = output<string>();
  readonly notesChange = output<string>();

  protected readonly name = signal('');
  protected readonly phoneDigits = signal('');
  protected readonly notes = signal('');
  protected readonly touched = signal(false);

  private readonly nowMs = signal(Date.now());
  private expiredEmitted = false;

  constructor() {
    this.name.set(this.initialName());
    this.phoneDigits.set(this.initialPhone());
    this.notes.set(this.initialNotes());

    const intervalId = setInterval(() => this.nowMs.set(Date.now()), 1000);
    this.destroyRef.onDestroy(() => clearInterval(intervalId));

    // Fire holdExpired exactly once, the moment the countdown hits zero —
    // not on every tick after. The container uses this to swap to the
    // slot-unavailable screen before the customer even attempts submit.
    effect(() => {
      if (this.isExpired() && !this.expiredEmitted) {
        this.expiredEmitted = true;
        this.holdExpired.emit();
      }
    });
  }

  protected readonly hasDeposit = computed(() => Number(this.service().deposit_amount) > 0);

  protected readonly secondsRemaining = computed(() => {
    const deadline = new Date(this.heldUntil()).getTime();
    return Math.max(0, Math.floor((deadline - this.nowMs()) / 1000));
  });

  protected readonly isExpired = computed(() => this.secondsRemaining() === 0);

  protected readonly countdownLabel = computed(() => {
    const s = this.secondsRemaining();
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem.toString().padStart(2, '0')}`;
  });

  /** True in the last minute — the point at which the countdown should read as urgent. */
  protected readonly isUrgent = computed(
    () => this.secondsRemaining() > 0 && this.secondsRemaining() <= 60,
  );

  protected readonly isPhoneValid = computed(() => isValidLocalPhone(this.phoneDigits()));
  protected readonly isNameValid = computed(() => this.name().trim().length > 0);
  protected readonly canSubmit = computed(
    () => this.isNameValid() && this.isPhoneValid() && !this.isExpired() && !this.submitting(),
  );

  protected readonly summaryLine = computed(() => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: STORE_TIMEZONE,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).formatToParts(new Date(this.startTime()));
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
    return `${get('weekday')}, ${get('day')} ${get('month')} \u00B7 ${get('hour')}:${get('minute')} ${get('dayPeriod')}`;
  });

  protected onNameInput(value: string): void {
    this.name.set(value);
    this.nameChange.emit(value);
  }

  protected onPhoneInput(raw: string): void {
    const digits = raw.replace(/\D/g, '');
    this.phoneDigits.set(digits);
    this.phoneChange.emit(digits);
  }

  protected onNotesInput(value: string): void {
    this.notes.set(value);
    this.notesChange.emit(value);
  }

  protected onSubmitClick(): void {
    this.touched.set(true);
    if (!this.canSubmit()) return;

    this.submitDetails.emit({
      name: this.name().trim(),
      phone: this.phoneDigits(),
      notes: this.notes().trim(),
    });
  }
}
