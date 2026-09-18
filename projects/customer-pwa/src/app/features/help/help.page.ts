import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Location } from '@angular/common';

import { HelpGuideComponent } from '@bedge/shared';

import { CUSTOMER_GUIDE } from './customer-guide';

/** The customer help screen. */
@Component({
  selector: 'bedge-help-page',
  standalone: true,
  imports: [HelpGuideComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="bg-white border-b border-gray-200 px-5 pt-6 pb-4">
        <!-- A real target, not an underlined text link. WCAG 2.2 SC 2.5.8
             sets a 24x24 minimum; this was 29x16 because the label was the
             whole hit area. The negative margin keeps it visually where the
             text sat while the touchable box extends past it. -->
        <button
          type="button"
          (click)="back()"
          aria-label="Go back"
          class="-ml-2 mb-1 inline-flex items-center gap-1 min-h-11 px-2 text-xs
                 text-gray-500 font-semibold rounded hover:text-ink
                 outline-none focus-visible:outline-2 focus-visible:outline-offset-2
                 focus-visible:outline-ink"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </button>
        <h1 class="text-xl font-bold text-ink">{{ guide.title }}</h1>
      </div>

      <div class="px-5 pt-5">
        <bedge-help-guide [guide]="guide" />
      </div>
    </div>
  `,
})
export class HelpPage {
  private readonly location = inject(Location);

  protected readonly guide = CUSTOMER_GUIDE;

  /** Back to wherever they came from, which for a help link is the right
   *  destination far more often than any fixed route would be. */
  protected back(): void {
    this.location.back();
  }
}
