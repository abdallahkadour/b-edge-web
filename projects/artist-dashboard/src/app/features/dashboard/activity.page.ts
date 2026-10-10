import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { ActivityDataService, InputDirective, MembershipDataService, SkeletonComponent, extractApiErrorMessage } from '@bedge/shared';
import type { ActivityEntry, ActivityKind, SalonMember } from '@bedge/shared';

import { describeEntry, whoDidIt, type EntryText } from './activity-text';

const TZ = 'Asia/Beirut';

const KINDS: { id: ActivityKind | ''; label: string }[] = [
  { id: '', label: 'All' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'payments', label: 'Payments' },
  { id: 'menu', label: 'Menu' },
  { id: 'shop', label: 'Shop' },
  { id: 'team', label: 'Team' },
];

interface Row {
  entry: ActivityEntry;
  who: string;
  words: EntryText;
  time: string;
}

interface Day {
  label: string;
  rows: Row[];
}

/** YYYY-MM-DD on the salon's calendar. */
function salonDay(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

/**
 * Activity: the salon's log of who did what (2026-10-10).
 *
 * Owner only (salonOwnerGuard; the API refuses a member with 403
 * SALON_ROLE_FORBIDDEN - activity:salon:read). Newest first, grouped by the
 * salon's day; a payment account change is marked, because a redirected
 * account sends customers' deposits to someone else. Read-only, and says so:
 * the log is append-only on the server.
 */
@Component({
  selector: 'bedge-activity',
  standalone: true,
  imports: [InputDirective, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="mb-4">
        <h1 class="text-xl font-semibold text-ink">Activity</h1>
        <p class="text-sm text-gray-500 mt-0.5">Who did what in the salon, newest first. Nothing here can be edited or deleted.</p>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div class="flex gap-1.5 overflow-x-auto" role="tablist" aria-label="What kind of change">
          @for (k of kinds; track k.id) {
            <button type="button" role="tab" [attr.aria-selected]="kind() === k.id" (click)="selectKind(k.id)"
              class="shrink-0 h-8 px-3 rounded-full text-xs font-semibold border transition-colors"
              [class]="kind() === k.id ? 'bg-ink border-ink text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'">{{ k.label }}</button>
          }
        </div>
        @if (people().length > 1) {
          <select bedgeInput class="h-8 text-sm w-auto min-w-36" aria-label="Whose changes"
            [value]="actor()" (change)="selectActor($any($event.target).value)">
            <option value="">Everyone</option>
            @for (p of people(); track p.user_id) {
              <option [value]="p.user_id">{{ p.is_owner ? 'You' : p.display_name }}</option>
            }
          </select>
        }
      </div>

      @if (error(); as e) {
        <div role="alert" class="mb-4 rounded-lg bg-danger-light border border-danger/30 px-4 py-3 text-sm text-danger-dark">{{ e }}</div>
      }

      @if (loading() && entries().length === 0) {
        <div class="space-y-2">
          <bedge-skeleton height="3.5rem" /><bedge-skeleton height="3.5rem" /><bedge-skeleton height="3.5rem" />
        </div>
      } @else if (!error() && entries().length === 0) {
        <p class="text-sm text-gray-400 py-10 text-center">Nothing{{ kind() || actor() ? ' matching this' : ' yet' }}.</p>
      }

      @for (d of days(); track d.label) {
        <section class="mb-5">
          <h2 class="text-2xs font-bold uppercase tracking-wide text-gray-400 mb-2">{{ d.label }}</h2>
          <ol class="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
            @for (r of d.rows; track r.entry.id) {
              <li data-entry class="flex gap-3 px-4 py-3" [attr.data-alert]="r.words.alert ? '' : null"
                [class.bg-warning-light]="r.words.alert">
                <span class="shrink-0 w-11 text-xs font-mono text-gray-400 tabular-nums pt-0.5">{{ r.time }}</span>
                <div class="min-w-0">
                  <p class="text-sm text-ink"><span class="font-semibold">{{ r.who }}</span> {{ r.words.text }}</p>
                  @if (r.words.detail) {
                    <p class="text-xs text-gray-500 mt-0.5 break-words">{{ r.words.detail }}</p>
                  }
                </div>
              </li>
            }
          </ol>
        </section>
      }

      @if (nextCursor()) {
        <button type="button" (click)="loadMore()" [disabled]="loading()"
          class="w-full h-10 rounded-lg border border-gray-200 bg-white text-sm font-medium text-ink disabled:opacity-60">
          {{ loading() ? 'Loading…' : 'Load more' }}
        </button>
      }

      <p class="text-xs text-gray-400 mt-6 max-w-prose">
        Bookings, payment accounts, prices, opening hours, discount codes and shop orders are recorded from 10 October 2026.
        Team changes go back further.
      </p>
    </div>
  `,
})
export class ActivityPage implements OnInit {
  private readonly activity = inject(ActivityDataService);
  private readonly members = inject(MembershipDataService);

  protected readonly kinds = KINDS;
  readonly kind = signal<ActivityKind | ''>('');
  readonly actor = signal('');
  readonly entries = signal<ActivityEntry[]>([]);
  readonly people = signal<SalonMember[]>([]);
  readonly nextCursor = signal<string | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly days = computed((): Day[] => {
    const today = salonDay(new Date());
    const yesterday = salonDay(new Date(Date.now() - 86_400_000));
    const out: Day[] = [];
    for (const e of this.entries()) {
      const at = new Date(e.at);
      const key = salonDay(at);
      const label = key === today ? 'Today' : key === yesterday ? 'Yesterday'
        : new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' }).format(at).replace(',', '');
      let day = out[out.length - 1];
      if (!day || day.label !== label) {
        day = { label, rows: [] };
        out.push(day);
      }
      day.rows.push({
        entry: e, who: whoDidIt(e), words: describeEntry(e),
        time: new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(at),
      });
    }
    return out;
  });

  ngOnInit(): void {
    this.members.listMembers().subscribe({ next: (m) => this.people.set(m), error: () => this.people.set([]) });
    this.load();
  }

  selectKind(k: ActivityKind | ''): void {
    if (k === this.kind()) return;
    this.kind.set(k);
    this.load();
  }

  selectActor(userId: string): void {
    if (userId === this.actor()) return;
    this.actor.set(userId);
    this.load();
  }

  loadMore(): void {
    const cursor = this.nextCursor();
    if (cursor && !this.loading()) this.load(cursor);
  }

  private load(cursor?: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.activity.list({ kind: this.kind() || undefined, actor: this.actor() || undefined, cursor }).subscribe({
      next: (page) => {
        this.entries.update((prev) => (cursor ? [...prev, ...page.items] : page.items));
        this.nextCursor.set(page.meta?.has_more ? page.meta.next_cursor ?? null : null);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (!cursor) this.entries.set([]);
        this.error.set(extractApiErrorMessage(err, 'Could not load the activity log.'));
      },
    });
  }
}
