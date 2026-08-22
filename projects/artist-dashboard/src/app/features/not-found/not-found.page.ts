import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

/**
 * Wildcard fallback for any URL that matches no route at all - a typo, a
 * stale bookmark, anything outside the known route table. Mirrors
 * customer-pwa's NotFoundPage exactly, for the same reason it exists there:
 * before this, app.routes.ts's `{ path: '**', redirectTo: 'dashboard' }`
 * silently dropped an artist onto their bookings list with zero indication
 * the URL they typed or bookmarked was actually wrong.
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

  goToDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }
}
