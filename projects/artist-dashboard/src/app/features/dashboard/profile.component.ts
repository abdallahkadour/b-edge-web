import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Placeholder for the Profile section. Replaced with the real screen next.
 */
@Component({
  selector: 'bedge-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <h1 class="text-xl font-semibold text-ink mb-2">Profile</h1>
      <p class="text-sm text-gray-500">This section is coming next.</p>
    </div>
  `,
})
export class ProfileComponent {}
