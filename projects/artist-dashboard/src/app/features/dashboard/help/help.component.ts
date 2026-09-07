import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { AuthStore, HelpGuideComponent } from '@bedge/shared';

import { ADMIN_GUIDE } from './admin-guide';
import { ARTIST_GUIDE } from './artist-guide';

type Audience = 'artist' | 'admin';

/**
 * The dashboard help screen.
 *
 * Carries the admin guide as well as the artist one, because the /admin
 * screen it documents lives in this application. The tab only appears for
 * admins - the tasks in it decide whether an artist can trade, and putting
 * them in front of every artist is an invitation to ask for them.
 */
@Component({
  selector: 'bedge-help',
  standalone: true,
  imports: [HelpGuideComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 max-w-3xl">
      <h1 class="text-xl font-semibold text-ink">Help</h1>

      @if (isAdmin()) {
        <div class="inline-flex items-center gap-1 p-1 bg-gray-100 rounded-full mt-4 mb-5">
          @for (tab of tabs(); track tab.id) {
            <button
              type="button"
              (click)="audience.set(tab.id)"
              [class]="
                'px-3 py-1.5 rounded-full text-xs font-bold transition-colors ' +
                (audience() === tab.id ? 'bg-white text-ink shadow-sm' : 'text-gray-500 hover:text-ink')
              "
            >{{ tab.label }}</button>
          }
        </div>
      } @else {
        <div class="mb-5"></div>
      }

      <bedge-help-guide [guide]="guide()" />
    </div>
  `,
})
export class HelpComponent {
  private readonly auth = inject(AuthStore);

  protected readonly audience = signal<Audience>('artist');

  protected readonly isAdmin = computed(() => this.auth.role() === 'admin');

  protected readonly tabs = computed(() => [
    { id: 'artist' as const, label: 'Using B-Edge' },
    { id: 'admin' as const, label: 'Admin' },
  ]);

  protected readonly guide = computed(() =>
    this.audience() === 'admin' && this.isAdmin() ? ADMIN_GUIDE : ARTIST_GUIDE,
  );
}
