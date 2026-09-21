import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

import {
  ArtistDataService,
  ButtonComponent,
  InputDirective,
  MembershipDataService,
  SkeletonComponent,
  extractApiErrorMessage,
} from '@bedge/shared';
import type { ArtistSchedule, ArtistScheduleException, Store } from '@bedge/shared';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface DayRow {
  dayOfWeek: number;
  name: string;
  working: boolean;
  start: string;
  end: string;
}

function blankWeek(): DayRow[] {
  return DAY_NAMES.map((name, i) => ({
    dayOfWeek: i,
    name,
    working: false,
    start: '09:00',
    end: '18:00',
  }));
}

/**
 * When this artist works, inside the hours their salon's store is open.
 *
 * THE DEFAULT THIS SCREEN HAS TO COMMUNICATE CORRECTLY
 *
 * An artist with no rota is available for the WHOLE of the store's opening
 * hours. That is not a gap to be filled in; it is the normal state, and it
 * is what every artist on the platform is in today. The screen therefore
 * opens saying so plainly rather than rendering seven empty rows that read
 * as "you have not set anything up yet".
 *
 * Setting a rota only ever NARROWS availability. Nothing here can open a
 * store earlier or keep it open later - the store's hours are the outer
 * bound and belong to the salon owner.
 */
@Component({
  selector: 'bedge-my-schedule',
  standalone: true,
  imports: [DatePipe, LucideAngularModule, ButtonComponent, InputDirective, SkeletonComponent],
  templateUrl: './my-schedule.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyScheduleComponent implements OnInit {
  private readonly api = inject(MembershipDataService);
  private readonly artistApi = inject(ArtistDataService);

  protected readonly stores = signal<Store[]>([]);
  protected readonly selectedStoreId = signal<string | null>(null);
  protected readonly week = signal<DayRow[]>(blankWeek());
  protected readonly exceptions = signal<ArtistScheduleException[]>([]);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly saved = signal(false);

  private rota: ArtistSchedule[] = [];

  /**
   * True when this artist has declared nothing at the selected store, which
   * means they are bookable across its whole opening window.
   */
  protected readonly usingStoreHours = computed(
    () => !this.week().some((d) => d.working),
  );

  protected readonly selectedStore = computed(() =>
    this.stores().find((s) => s.id === this.selectedStoreId()) ?? null,
  );

  // ── Exceptions form ──────────────────────────────────────────────────────
  protected readonly showExceptionForm = signal(false);
  protected readonly excDate = signal('');
  protected readonly excReason = signal('');
  protected readonly excError = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.artistApi.getStoresBySalon().subscribe({
      next: (stores) => {
        this.stores.set(stores);
        if (stores.length > 0) this.selectedStoreId.set(stores[0].id);

        this.api.getMyRota().subscribe({
          next: (rota) => {
            this.rota = rota;
            this.applyRotaToWeek();
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
            this.error.set('Could not load your working hours.');
          },
        });
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Could not load your stores.');
      },
    });

    this.api.getMyScheduleExceptions().subscribe({
      next: (list) => this.exceptions.set(list),
      error: () => {
        /* the week is the point of this screen; a failed exception list
           should not blank it */
      },
    });
  }

  /** Projects the stored rota onto the seven-row grid for the chosen store. */
  private applyRotaToWeek(): void {
    const storeId = this.selectedStoreId();
    const rows = blankWeek();
    for (const r of this.rota) {
      if (r.store_id !== storeId) continue;
      const row = rows[r.day_of_week];
      if (!row) continue;
      row.working = r.is_working;
      row.start = r.start_time;
      row.end = r.end_time;
    }
    this.week.set(rows);
  }

  protected selectStore(id: string): void {
    this.selectedStoreId.set(id);
    this.applyRotaToWeek();
    this.saved.set(false);
  }

  protected toggleDay(dayOfWeek: number): void {
    this.week.update((rows) =>
      rows.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, working: !r.working } : r)),
    );
    this.saved.set(false);
  }

  protected setTime(dayOfWeek: number, field: 'start' | 'end', value: string): void {
    this.week.update((rows) =>
      rows.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, [field]: value } : r)),
    );
    this.saved.set(false);
  }

  /** Every working day needs start before end, or the API refuses the lot. */
  protected readonly canSave = computed(() =>
    this.week()
      .filter((d) => d.working)
      .every((d) => d.start < d.end),
  );

  protected save(): void {
    const storeId = this.selectedStoreId();
    if (!storeId || this.saving() || !this.canSave()) return;

    this.saving.set(true);
    this.error.set(null);

    // Only working days are sent. Clearing every day sends an empty week,
    // which removes the rota and restores the default - available whenever
    // the store is open. That is a deliberate way back out, not a no-op.
    const days = this.week()
      .filter((d) => d.working)
      .map((d) => ({
        day_of_week: d.dayOfWeek,
        start_time: d.start,
        end_time: d.end,
        is_working: true,
      }));

    this.api.setMyRota({ store_id: storeId, days }).subscribe({
      next: (rota) => {
        this.rota = rota;
        this.saving.set(false);
        this.saved.set(true);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(extractApiErrorMessage(err, 'Could not save your hours.'));
      },
    });
  }

  /** Clears the rota at this store, returning to the store's own hours. */
  protected useStoreHours(): void {
    this.week.set(blankWeek());
    this.save();
  }

  // ── Days off ─────────────────────────────────────────────────────────────

  protected openExceptionForm(): void {
    this.excDate.set('');
    this.excReason.set('');
    this.excError.set(null);
    this.showExceptionForm.set(true);
  }

  protected addDayOff(): void {
    const date = this.excDate();
    if (!date) return;

    this.api
      .setMyScheduleException({
        exception_date: date,
        is_unavailable: true,
        reason: this.excReason().trim() || undefined,
      })
      .subscribe({
        next: (list) => {
          this.exceptions.set(list);
          this.showExceptionForm.set(false);
        },
        error: (err) =>
          this.excError.set(extractApiErrorMessage(err, 'Could not add that day off.')),
      });
  }

  protected removeException(e: ArtistScheduleException): void {
    this.api.deleteMyScheduleException(e.id).subscribe({
      next: () => this.exceptions.update((list) => list.filter((x) => x.id !== e.id)),
      error: () => {
        /* left on screen; the next load will reconcile */
      },
    });
  }
}
