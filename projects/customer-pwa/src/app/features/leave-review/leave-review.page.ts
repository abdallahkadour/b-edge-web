import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';

import { ReviewDataService } from '@bedge/shared';
import type { ReviewBookingContext } from '@bedge/shared';

/**
 * Guest review-link landing page - reached via /review/:token, no account,
 * no login. The token in the URL is the guest's only credential; it was
 * generated the moment their booking was marked completed and is sent to
 * them directly (WhatsApp, once that's wired - see Calendar's manual
 * "send review request" action for how it reaches them until then).
 *
 * Deliberately does NOT include the Stitch reference design's "post review
 * publicly to [artist]'s profile" checkbox - reviews.is_visible has no
 * customer-facing opt-in at submission time in the backend (it's an
 * artist-moderation flag, set after the fact via hide/show). Showing a
 * checkbox with no effect would be worse than not showing one.
 */
@Component({
  selector: 'app-leave-review-page',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './leave-review.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaveReviewPage implements OnInit {
  private readonly reviewSvc: ReviewDataService = inject(ReviewDataService);

  readonly token = input.required<string>();

  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly context = signal<ReviewBookingContext | null>(null);

  readonly rating = signal(5);
  readonly comment = signal('');
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly submitted = signal(false);

  protected readonly stars = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.reviewSvc.getBookingContextByToken(this.token()).subscribe({
      next: (ctx) => {
        this.context.set(ctx);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.loadError.set(
          err.status === 404
            ? "This review link isn't valid or has expired."
            : 'Cannot reach the server.',
        );
      },
    });
  }

  selectRating(star: number): void {
    this.rating.set(star);
  }

  onCommentInput(value: string): void {
    this.comment.set(value.slice(0, 250));
  }

  submit(): void {
    if (this.submitting()) return;
    this.submitting.set(true);
    this.submitError.set(null);

    this.reviewSvc
      .submitReviewByToken(this.token(), {
        rating: this.rating(),
        comment: this.comment().trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.submitted.set(true);
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          this.submitError.set(
            err.status === 409
              ? 'This appointment has already been reviewed.'
              : 'Could not submit your review. Please try again.',
          );
        },
      });
  }

  protected ratingLabel(stars: number): string {
    switch (stars) {
      case 1: return 'Disappointed';
      case 2: return 'Could be better';
      case 3: return 'Average service';
      case 4: return 'Loved it!';
      case 5: return 'Absolutely loved it!';
      default: return 'Rate your experience';
    }
  }
}
