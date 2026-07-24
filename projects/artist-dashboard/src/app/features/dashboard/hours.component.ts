import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ArtistDataService } from '@bedge/shared';
import type {
  Store,
  BusinessHours,
  BusinessHoursException,
  SetBusinessHoursRequest,
  CreateExceptionRequest,
} from '@bedge/shared';

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
 */
@Component({
  selector: 'bedge-hours',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  // ── Business hours ────────────────────────────────────────────────────────

  /** Editable rows for the 7 days of the week, for the selected store. */
  readonly dayRows = signal<DayRow[]>([]);

  /** True while hours are loading for the selected store. */
  readonly hoursLoading = signal(false);

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
  // Hours grid
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Called by the template when the user edits any field in a day row.
   * Marks the row dirty so its Save button activates.
   */
  markDirty(row: DayRow): void {
    this.updateRow(row.dayOfWeek, { dirty: true });
  }

  /**
   * Save a single day row. Builds the API request and calls setBusinessHours.
   * The row's save error is cleared on success and set on failure.
   */
  saveRow(row: DayRow): void {
    const store = this.selectedStore();
    if (!store) return;

    this.updateRow(row.dayOfWeek, { saving: true });
    this.clearSaveError(row.dayOfWeek);

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
      error: () => {
        this.updateRow(row.dayOfWeek, { saving: false });
        this.setSaveError(row.dayOfWeek, 'Save failed. Try again.');
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

  /** Delete an exception by its date string. */
  deleteException(exception: BusinessHoursException): void {
    const store = this.selectedStore();
    if (!store) return;

    this.deletingExceptionId.set(exception.id);

    this.artistService.deleteException(store.id, exception.exception_date).subscribe({
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
