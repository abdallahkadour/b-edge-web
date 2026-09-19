import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { A11yModule } from '@angular/cdk/a11y';

import {
  ArtistDataService,
  ButtonComponent,
  InputDirective,
  extractApiErrorMessage,
} from '@bedge/shared';
import type {
  Store,
  BusinessHours,
  BusinessHoursException,
  SetBusinessHoursRequest,
  CreateExceptionRequest,
  CreateStoreRequest,
  UpdateStoreRequest,
} from '@bedge/shared';

/** Working state for the "Add store" modal form. */
interface NewStoreForm {
  name: string;
  nameAr: string;
  city: string;
  address: string;
  phone: string;
}

const EMPTY_NEW_STORE: NewStoreForm = {
  name: '',
  nameAr: '',
  city: '',
  address: '',
  phone: '',
};

/** Working state for the "Edit store" modal form. */
interface EditStoreForm {
  name: string;
  isActive: boolean;
  /** "HH:MM" as an <input type="time"> produces it, or '' for "no surcharge". */
  earlyBirdCutoff: string;
  /** Decimal as a string, matching how money crosses the wire everywhere. */
  earlyBirdFee: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Local types
// ─────────────────────────────────────────────────────────────────────────────

/** Index 0–6 matching the API day_of_week (Sunday=0 … Saturday=6). */
const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/**
 * The editable, per-row state for a single day of the week.
 * Mutable counterpart to the read-only BusinessHours API type.
 */
interface DayRow {
  /** 0=Sunday … 6=Saturday */
  dayOfWeek: number;
  /** Human-readable label */
  label: string;
  /** Whether this day is open */
  isOpen: boolean;
  /** HH:MM (24-hour) — stripped from the API's HH:MM:SS */
  openTime: string;
  /** HH:MM (24-hour) */
  closeTime: string;
  /** True once the user has edited any field; enables the Save button */
  dirty: boolean;
  /** True while the save API call is in flight */
  saving: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert "HH:MM:SS" (from API) → "HH:MM" (for <input type="time">).
 * If the value is already "HH:MM" it is returned as-is.
 */
function toTimeInput(apiTime: string): string {
  return apiTime ? apiTime.slice(0, 5) : '09:00';
}

/**
 * Convert "HH:MM" (from <input type="time">) → "HH:MM:SS" (for API).
 */
function toApiTime(inputTime: string): string {
  return inputTime ? `${inputTime}:00` : '09:00:00';
}

/**
 * Build a full 7-day row array, merging API data where it exists.
 * Days with no API record default to closed with 09:00–18:00 placeholders.
 */
function buildDayRows(apiHours: BusinessHours[]): DayRow[] {
  // Index by day_of_week for O(1) lookup
  const byDay = new Map<number, BusinessHours>(
    apiHours.map((h) => [h.day_of_week, h]),
  );

  return DAY_NAMES.map((label, i) => {
    const h = byDay.get(i);
    return {
      dayOfWeek: i,
      label,
      isOpen: h?.is_open ?? false,
      openTime: h ? toTimeInput(h.open_time) : '09:00',
      closeTime: h ? toTimeInput(h.close_time) : '18:00',
      dirty: false,
      saving: false,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hours screen for the artist dashboard.
 *
 * Displays a per-store, 7-day business-hours grid and a special-hours
 * exceptions list. Each day row has an independent Save button that lights
 * up only when something on that row has changed, avoiding the need for a
 * global "save everything" submit.
 *
 * Store tabs load fresh hours and exceptions from the API on every switch so
 * the two stores stay fully independent.
 *
 * Plain signals with `[value]`/`(input)` bindings, not `FormsModule`/
 * `ngModel` - converted Aug 15, 2026 to match the pattern every other
 * migrated screen in this codebase uses (onboarding, products, and now
 * this). The previous version's ngModel handlers mutated a DayRow object
 * in place and relied on a later spread to pick up the mutation; the
 * setter methods below go through `updateRow` directly instead.
 */
@Component({
  selector: 'bedge-hours',
  standalone: true,
  imports: [ButtonComponent, InputDirective, LucideAngularModule, A11yModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hours.component.html',
})
export class HoursComponent implements OnInit {
  private readonly artistService = inject(ArtistDataService);

  // ── Stores ────────────────────────────────────────────────────────────────

  /** All stores that belong to this artist's salon. */
  readonly stores = signal<Store[]>([]);

  /** The currently selected store. */
  readonly selectedStore = signal<Store | null>(null);

  /** True while the stores list is loading. */
  readonly storesLoading = signal(true);

  /** Top-level error, e.g. "Could not load stores". */
  readonly storesError = signal<string | null>(null);

  /** "Add store" modal state — lives here since this is where the store
   *  list is actually loaded and rendered (as tabs), not on Profile. */
  readonly addStoreOpen = signal(false);
  readonly newStore = signal<NewStoreForm>({ ...EMPTY_NEW_STORE });
  readonly addingStore = signal(false);
  readonly addStoreError = signal<string | null>(null);

  /** "Edit store" modal state - rename the selected store or toggle it
   *  active/inactive. Was a real gap: PATCH /artists/stores/:id existed on
   *  the backend with no UI trigger anywhere - once added, a store could
   *  never be renamed or deactivated again. */
  readonly editStoreOpen = signal(false);
  readonly editStoreForm = signal<EditStoreForm>({
    name: '',
    isActive: true,
    earlyBirdCutoff: '',
    earlyBirdFee: '',
  });
  readonly savingStoreEdit = signal(false);
  readonly editStoreError = signal<string | null>(null);

  // ── Business hours ────────────────────────────────────────────────────────

  /** Editable rows for the 7 days of the week, for the selected store. */
  readonly dayRows = signal<DayRow[]>([]);

  /** True while hours are loading for the selected store. */
  readonly hoursLoading = signal(false);

  // ── Apply-to-all-days ─────────────────────────────────────────────────────
  //
  // Rania's words: she "should not go day by day". A salon almost always
  // keeps one set of hours across the week and varies only WHICH days it
  // opens, so editing seven identical pairs of times by hand is the wrong
  // default. These two fields set the times once.
  //
  // It deliberately does NOT touch each day's open/closed flag. Opening
  // every day would silently make Sunday bookable for a salon that has
  // never opened on a Sunday, and an accidental open day takes real
  // bookings from real customers. Times are safe to overwrite in bulk;
  // availability is not.
  readonly bulkOpenTime = signal('09:00');
  readonly bulkCloseTime = signal('18:00');
  readonly bulkApplying = signal(false);
  readonly bulkError = signal<string | null>(null);
  readonly bulkSavedAt = signal<number | null>(null);

  /** Per-save inline error keyed by day_of_week. */
  readonly saveErrors = signal<Record<number, string>>({});

  // ── Exceptions ────────────────────────────────────────────────────────────

  /** Special-hours exceptions for the selected store. */
  readonly exceptions = signal<BusinessHoursException[]>([]);

  /** True while exceptions are loading. */
  readonly exceptionsLoading = signal(false);

  /** Inline error for exceptions. */
  readonly exceptionsError = signal<string | null>(null);

  // ── New-exception form fields ──────────────────────────────────────────────

  /** ISO date string "YYYY-MM-DD" for the new exception form. */
  readonly newExceptionDate = signal('');

  /** Whether the new exception is fully closed or has custom hours. */
  readonly newExceptionIsClosed = signal(true);

  /** Open time for a custom-hours exception. */
  readonly newExceptionOpenTime = signal('09:00');

  /** Close time for a custom-hours exception. */
  readonly newExceptionCloseTime = signal('18:00');

  /** Optional reason for the new exception. */
  readonly newExceptionReason = signal('');

  /** True while the "Add exception" API call is in flight. */
  readonly addingException = signal(false);

  /** Error shown below the add-exception form row. */
  readonly addExceptionError = signal<string | null>(null);

  /** ID of an exception currently being deleted (for per-row loading state). */
  readonly deletingExceptionId = signal<string | null>(null);

  // ── Computed: whether the add-exception button should be enabled ───────────

  /** True only when a date has been picked — the minimum to submit. */
  readonly canAddException = computed(() => this.newExceptionDate().length > 0);

  // ─────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.artistService.getStoresBySalon().subscribe({
      next: (stores) => {
        this.stores.set(stores);
        this.storesLoading.set(false);
        if (stores.length > 0) {
          this.selectStore(stores[0]);
        }
      },
      error: () => {
        this.storesError.set('Could not load your stores. Please refresh.');
        this.storesLoading.set(false);
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Store selection
  // ─────────────────────────────────────────────────────────────────────────

  /** Switch the active store tab and reload hours + exceptions. */
  selectStore(store: Store): void {
    this.selectedStore.set(store);
    this.saveErrors.set({});
    this.addExceptionError.set(null);
    this.loadHours(store.id);
    this.loadExceptions(store.id);
  }

  /** Whether this store is the currently selected tab. */
  isSelected(store: Store): boolean {
    return this.selectedStore()?.id === store.id;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Add store
  // ─────────────────────────────────────────────────────────────────────────

  openAddStore(): void {
    this.newStore.set({ ...EMPTY_NEW_STORE });
    this.addStoreError.set(null);
    this.addStoreOpen.set(true);
  }

  closeAddStore(): void {
    if (this.addingStore()) return;
    this.addStoreOpen.set(false);
  }

  patchNewStore<K extends keyof NewStoreForm>(key: K, value: NewStoreForm[K]): void {
    this.newStore.update((f) => ({ ...f, [key]: value }));
  }

  /** Name and city are the only required fields on the backend
   *  (CreateStoreRequest) - matches that, not a stricter invented rule. */
  canSubmitNewStore(): boolean {
    const f = this.newStore();
    return f.name.trim().length >= 2 && f.city.trim().length >= 2;
  }

  submitAddStore(): void {
    if (!this.canSubmitNewStore() || this.addingStore()) return;

    const f = this.newStore();
    const req: CreateStoreRequest = {
      name: f.name.trim(),
      name_ar: f.nameAr.trim() || undefined,
      city: f.city.trim(),
      address: f.address.trim() || undefined,
      phone: f.phone.trim() || undefined,
    };

    this.addingStore.set(true);
    this.addStoreError.set(null);

    this.artistService.createStore(req).subscribe({
      next: (store) => {
        this.addingStore.set(false);
        this.addStoreOpen.set(false);
        this.stores.update((list) => [...list, store]);
        this.selectStore(store);
      },
      error: (err: HttpErrorResponse) => {
        this.addingStore.set(false);
        this.addStoreError.set(extractApiErrorMessage(err, 'Could not add this store. Please try again.'));
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Edit store (rename / activate-deactivate)
  // ─────────────────────────────────────────────────────────────────────────

  openEditStore(): void {
    const store = this.selectedStore();
    if (!store) return;
    this.editStoreForm.set({
      name: store.name,
      isActive: store.is_active,
      // The API returns TIME as "HH:MM:SS"; <input type="time"> wants "HH:MM"
      // and silently renders nothing at all if given the seconds.
      earlyBirdCutoff: (store.early_bird_cutoff ?? '').slice(0, 5),
      // A zero fee is the same as no surcharge to an artist reading this
      // form, so it shows as empty rather than as a meaningless "0.00".
      earlyBirdFee:
        store.early_bird_fee && Number(store.early_bird_fee) > 0 ? store.early_bird_fee : '',
    });
    this.editStoreError.set(null);
    this.editStoreOpen.set(true);
  }

  closeEditStore(): void {
    if (this.savingStoreEdit()) return;
    this.editStoreOpen.set(false);
  }

  patchEditStore<K extends keyof EditStoreForm>(key: K, value: EditStoreForm[K]): void {
    this.editStoreForm.update((f) => ({ ...f, [key]: value }));
  }

  canSubmitEditStore(): boolean {
    return this.editStoreForm().name.trim().length >= 2;
  }

  submitEditStore(): void {
    const store = this.selectedStore();
    if (!store || !this.canSubmitEditStore() || this.savingStoreEdit()) return;

    const f = this.editStoreForm();
    const cutoff = f.earlyBirdCutoff.trim();
    const fee = f.earlyBirdFee.trim();

    const req: UpdateStoreRequest = {
      name: f.name.trim(),
      is_active: f.isActive,
      // Empty string is the documented "switch it off" value - the API
      // turns '' into NULL. Sending undefined would mean "leave unchanged",
      // so clearing the field in the UI has to survive as '' all the way
      // down or the surcharge could be turned on and never off again.
      early_bird_cutoff: cutoff ? `${cutoff}:00` : '',
    };

    // Only sent when there is something to send. With no cutoff the fee is
    // inert, and omitting it keeps the previous amount so switching the
    // surcharge back on does not mean re-typing it.
    if (fee) req.early_bird_fee = fee;

    this.savingStoreEdit.set(true);
    this.editStoreError.set(null);

    this.artistService.updateStore(store.id, req).subscribe({
      next: (updated) => {
        this.savingStoreEdit.set(false);
        this.editStoreOpen.set(false);
        this.stores.update((list) => list.map((s) => (s.id === updated.id ? updated : s)));
        this.selectedStore.set(updated);
      },
      error: (err: HttpErrorResponse) => {
        this.savingStoreEdit.set(false);
        this.editStoreError.set(extractApiErrorMessage(err, 'Could not save these changes. Please try again.'));
      },
    });
  }

  /** Days that would actually change if the bulk hours were applied. */
  private bulkTargets(): DayRow[] {
    const o = this.bulkOpenTime();
    const c = this.bulkCloseTime();
    return this.dayRows().filter((r) => r.openTime !== o || r.closeTime !== c);
  }

  canApplyToAll(): boolean {
    return (
      !this.bulkApplying() &&
      this.bulkCloseTime() > this.bulkOpenTime() &&
      this.bulkTargets().length > 0
    );
  }

  /**
   * Writes the bulk times onto every day, then saves each changed day.
   *
   * Saves are issued one per day because the API is per-day
   * (`setBusinessHours` takes a single day_of_week) — there is no bulk
   * endpoint, and inventing one for seven rows would be more backend than
   * the problem deserves.
   *
   * Partial failure is reported rather than hidden. If three days save and
   * one 400s, saying "saved" would leave the artist believing a week is set
   * when it is not — and the day that failed is the one that will take a
   * booking at the wrong time.
   */
  applyToAllDays(): void {
    const store = this.selectedStore();
    if (!store || !this.canApplyToAll()) return;

    const openTime = this.bulkOpenTime();
    const closeTime = this.bulkCloseTime();
    const targets = this.bulkTargets();

    this.bulkError.set(null);
    this.bulkSavedAt.set(null);
    this.bulkApplying.set(true);

    let done = 0;
    let failed = 0;

    for (const row of targets) {
      this.updateRow(row.dayOfWeek, { openTime, closeTime, dirty: true, saving: true });
      this.clearSaveError(row.dayOfWeek);

      this.artistService
        .setBusinessHours(store.id, {
          day_of_week: row.dayOfWeek,
          open_time: toApiTime(openTime),
          close_time: toApiTime(closeTime),
          // Preserved, never forced - see the note on bulkOpenTime.
          is_open: row.isOpen,
        })
        .subscribe({
          next: () => {
            this.updateRow(row.dayOfWeek, { dirty: false, saving: false });
            if (++done + failed === targets.length) this.finishBulk(failed, targets.length);
          },
          error: (err: HttpErrorResponse) => {
            this.updateRow(row.dayOfWeek, { saving: false });
            this.setSaveError(row.dayOfWeek, extractApiErrorMessage(err, 'Save failed.'));
            if (done + ++failed === targets.length) this.finishBulk(failed, targets.length);
          },
        });
    }
  }

  private finishBulk(failed: number, total: number): void {
    this.bulkApplying.set(false);
    if (failed > 0) {
      this.bulkError.set(
        `${total - failed} of ${total} days saved. The rest are marked below — fix and save them individually.`,
      );
    } else {
      this.bulkSavedAt.set(Date.now());
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Hours grid
  // ─────────────────────────────────────────────────────────────────────────

  /** Sets whether a day is open, and marks the row dirty. */
  setIsOpen(row: DayRow, isOpen: boolean): void {
    this.updateRow(row.dayOfWeek, { isOpen, dirty: true });
  }

  /** Sets a day's open time, and marks the row dirty. */
  setOpenTime(row: DayRow, openTime: string): void {
    this.updateRow(row.dayOfWeek, { openTime, dirty: true });
  }

  /** Sets a day's close time, and marks the row dirty. */
  setCloseTime(row: DayRow, closeTime: string): void {
    this.updateRow(row.dayOfWeek, { closeTime, dirty: true });
  }

  /**
   * Save a single day row. Builds the API request and calls setBusinessHours.
   * The row's save error is cleared on success and set on failure.
   */
  saveRow(row: DayRow): void {
    const store = this.selectedStore();
    if (!store) return;

    this.clearSaveError(row.dayOfWeek);

    // Client-side pre-check, mirroring the backend's own rule (see
    // SetBusinessHours's validation) - fails fast on the obviously wrong
    // input rather than round-tripping to the API to find out. The
    // backend still enforces this independently; this is a UX shortcut,
    // not the actual guard. Only checked while the day is open - a
    // closed day's open/close times are unused placeholders. A day open
    // 19:00–10:00 used to save with a 204 and no error at all - this
    // (plus the matching backend check) is the fix.
    if (row.isOpen && row.closeTime <= row.openTime) {
      this.setSaveError(row.dayOfWeek, 'Close time must be after open time.');
      return;
    }

    this.updateRow(row.dayOfWeek, { saving: true });

    const req: SetBusinessHoursRequest = {
      day_of_week: row.dayOfWeek,
      open_time: toApiTime(row.openTime),
      close_time: toApiTime(row.closeTime),
      is_open: row.isOpen,
    };

    this.artistService.setBusinessHours(store.id, req).subscribe({
      next: () => {
        this.updateRow(row.dayOfWeek, { dirty: false, saving: false });
      },
      error: (err: HttpErrorResponse) => {
        this.updateRow(row.dayOfWeek, { saving: false });
        this.setSaveError(row.dayOfWeek, extractApiErrorMessage(err, 'Save failed. Try again.'));
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Exceptions
  // ─────────────────────────────────────────────────────────────────────────

  /** Format an ISO date string "YYYY-MM-DD" to a readable "14 Jun 2026". */
  formatExceptionDate(isoDate: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(isoDate));
  }

  /** Submit the new-exception form row. */
  addException(): void {
    const store = this.selectedStore();
    if (!store || !this.canAddException()) return;

    this.addingException.set(true);
    this.addExceptionError.set(null);

    const isClosed = this.newExceptionIsClosed();
    const req: CreateExceptionRequest = {
      exception_date: this.newExceptionDate(),
      is_closed: isClosed,
      reason: this.newExceptionReason() || undefined,
      open_time: isClosed ? undefined : toApiTime(this.newExceptionOpenTime()),
      close_time: isClosed ? undefined : toApiTime(this.newExceptionCloseTime()),
    };

    this.artistService.createException(store.id, req).subscribe({
      next: () => {
        this.addingException.set(false);
        this.resetExceptionForm();
        // Reload the full list so the new entry appears with its server-assigned ID.
        this.loadExceptions(store.id);
      },
      error: () => {
        this.addingException.set(false);
        this.addExceptionError.set('Could not add exception. Try again.');
      },
    });
  }

  /** Delete an exception by its date string.
   *
   *  exception.exception_date arrives as a full ISO datetime (the backend's
   *  `time.Time` field JSON-marshals as RFC3339, e.g. "2026-08-24T00:00:00Z"),
   *  but DELETE /stores/:id/exceptions/:date parses its path param with the
   *  strict Go layout "2006-01-02" - plain YYYY-MM-DD only. Passing the raw
   *  ISO string 400s every time ("Date must be in YYYY-MM-DD format"),
   *  meaning this action never worked at all until this truncation was
   *  added - found by actually running it, not by reading the code. */
  deleteException(exception: BusinessHoursException): void {
    const store = this.selectedStore();
    if (!store) return;

    this.deletingExceptionId.set(exception.id);

    const dateOnly = exception.exception_date.slice(0, 10);

    this.artistService.deleteException(store.id, dateOnly).subscribe({
      next: () => {
        this.exceptions.update((list) =>
          list.filter((e) => e.id !== exception.id),
        );
        this.deletingExceptionId.set(null);
      },
      error: () => {
        this.deletingExceptionId.set(null);
      },
    });
  }

  /** Toggle the newExceptionIsClosed signal from the template select. */
  onIsClosedChange(value: string): void {
    this.newExceptionIsClosed.set(value === 'closed');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────────────

  private loadHours(storeId: string): void {
    this.hoursLoading.set(true);
    this.dayRows.set([]);

    this.artistService.getBusinessHours(storeId).subscribe({
      next: (hours) => {
        this.dayRows.set(buildDayRows(hours ?? []));
        this.hoursLoading.set(false);
      },
      error: () => {
        // On error, still show the 7 rows in default closed state so
        // Rania can set her hours from scratch.
        this.dayRows.set(buildDayRows([]));
        this.hoursLoading.set(false);
      },
    });
  }

  private loadExceptions(storeId: string): void {
    this.exceptionsLoading.set(true);
    this.exceptions.set([]);
    this.exceptionsError.set(null);

    this.artistService.getExceptions(storeId).subscribe({
      next: (exceptions) => {
        // Sort chronologically so the nearest date is first.
        const sorted = [...(exceptions ?? [])].sort((a, b) =>
          a.exception_date.localeCompare(b.exception_date),
        );
        this.exceptions.set(sorted);
        this.exceptionsLoading.set(false);
      },
      error: () => {
        this.exceptionsError.set('Could not load special hours. Please refresh.');
        this.exceptionsLoading.set(false);
      },
    });
  }

  /** Immutably update one field (or several) on a single DayRow by index. */
  private updateRow(dayOfWeek: number, patch: Partial<DayRow>): void {
    this.dayRows.update((rows) =>
      rows.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, ...patch } : r)),
    );
  }

  private setSaveError(dayOfWeek: number, msg: string): void {
    this.saveErrors.update((errs) => ({ ...errs, [dayOfWeek]: msg }));
  }

  private clearSaveError(dayOfWeek: number): void {
    this.saveErrors.update((errs) => {
      const copy = { ...errs };
      delete copy[dayOfWeek];
      return copy;
    });
  }

  private resetExceptionForm(): void {
    this.newExceptionDate.set('');
    this.newExceptionIsClosed.set(true);
    this.newExceptionOpenTime.set('09:00');
    this.newExceptionCloseTime.set('18:00');
    this.newExceptionReason.set('');
  }
}
