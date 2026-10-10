import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';

import { AuthStore, InputDirective, MembershipDataService } from '@bedge/shared';
import type { SalonMember } from '@bedge/shared';

/** Whose bookings a screen shows: the caller's own, everyone's, or one
 *  artist's (her artists.id). */
export type TeamView = 'mine' | 'all' | (string & {});

/**
 * "Showing: My bookings / Everyone / Maya" - for the salon owner only
 * (2026-10-10). The owner sees and acts on every member's bookings
 * (calendar:salon:read, bookings:any:write); a member, and an owner working
 * alone, see nothing here at all, so the screens are exactly as they were.
 */
@Component({
  selector: 'bedge-team-filter',
  standalone: true,
  imports: [InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (others().length > 0) {
      <label class="flex items-center gap-2 text-xs font-medium text-gray-500">
        Showing
        <select bedgeInput class="h-8 text-sm w-auto min-w-40" aria-label="Whose bookings"
          [value]="value()" (change)="changed.emit($any($event.target).value)">
          <option value="mine">My bookings</option>
          <option value="all">Everyone</option>
          @for (m of others(); track m.artist_id) {
            <option [value]="m.artist_id">{{ m.display_name }}</option>
          }
        </select>
      </label>
    }
  `,
})
export class TeamFilterComponent {
  private readonly auth = inject(AuthStore);
  private readonly members = inject(MembershipDataService);

  readonly value = input<TeamView>('mine');
  readonly changed = output<TeamView>();

  /** The salon's other artists. Empty - and the control hidden - for a
   *  member, for an owner on her own, and if the roster cannot be read. */
  readonly others = signal<SalonMember[]>([]);

  constructor() {
    if (this.auth.isSalonOwner()) {
      this.members.listMembers().subscribe({
        next: (ms) => this.others.set(ms.filter((m) => !m.is_owner)),
        error: () => this.others.set([]),
      });
    }
  }
}
