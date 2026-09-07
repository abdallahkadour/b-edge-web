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
        <button
          type="button"
          (click)="back()"
          class="text-xs text-gray-400 font-semibold underline mb-2"
        >Back</button>
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
