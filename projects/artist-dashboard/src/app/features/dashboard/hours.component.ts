import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Placeholder for the Hours section. Replaced with the real screen next.
 */
@Component({
  selector: 'bedge-hours',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <h1 class="text-xl font-semibold text-ink mb-2">Hours</h1>
      <p class="text-sm text-gray-500">This section is coming next.</p>
    </div>
  `,
})
export class HoursComponent {}
