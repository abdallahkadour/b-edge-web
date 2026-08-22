import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { RateLimitStore } from './rate-limit.store';

/**
 * A brief, dismissible-by-timeout banner shown when rateLimitInterceptor
 * observes a 429 anywhere in the app. Mount once at the app root (same
 * placement as customer-pwa's InstallPromptComponent) so it renders above
 * whatever route is active rather than needing every page to know about it.
 */
@Component({
  selector: 'bedge-rate-limit-banner',
  standalone: true,
  templateUrl: './rate-limit-banner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RateLimitBannerComponent {
  protected readonly rateLimitStore = inject(RateLimitStore);
}
