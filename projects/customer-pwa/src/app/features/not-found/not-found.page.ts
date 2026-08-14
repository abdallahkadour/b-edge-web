import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

/**
 * Wildcard fallback for any URL that matches no route at all - a typo, a
 * stale bookmark, anything outside the known route table. Before this
 * existed, Angular's router simply rendered nothing: a blank white page
 * with no explanation and no way out except the browser's own back button.
 *
 * Deliberately separate from the "artist not found" state on the booking
 * funnel - that one is a valid route with a bad ID inside it (a specific,
 * recoverable case with its own messaging); this one is a URL that never
 * matched a route pattern in the first place.
 */
@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './not-found.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {
  private readonly router = inject(Router);

  goHome(): void {
    this.router.navigateByUrl('/');
  }
}
