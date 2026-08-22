import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import {
  OnboardingDataService,
  AuthStore,
  ButtonComponent,
  InputDirective,
  extractApiErrorMessage,
  extractFieldErrors,
  ARTIST_CATEGORIES,
} from '@bedge/shared';
import type { ArtistCategory, CompleteOnboardingRequest } from '@bedge/shared';

type ScreenState = 'loading' | 'form' | 'pending' | 'rejected' | 'error';

/**
 * Self-service artist onboarding.
 *
 * One scrollable form, three visual sections, one submit - deliberately
 * not a multi-step wizard with separate per-step submissions. Marketplace
 * onboarding research converges on splitting "what's required to enter"
 * from "what can be added later" and measuring success by time-to-first-
 * listing, not by how complete a profile is on day one; a heavier,
 * multi-page flow would work against exactly that. Business hours,
 * additional services, and a second store are all added afterward from
 * the screens that already exist for that.
 *
 * This same component also renders the "pending review" and "rejected"
 * states - checked once on load via GET /onboarding/status - since they
 * are the other two things that can be true instead of "show the form".
 */
@Component({
  selector: 'app-onboarding-page',
  standalone: true,
  imports: [LucideAngularModule, ButtonComponent, InputDirective],
  templateUrl: './onboarding.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingPage implements OnInit {
  private readonly onboardingSvc = inject(OnboardingDataService);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  readonly categories = ARTIST_CATEGORIES; // shared with Discover's own category filter
  readonly screenState = signal<ScreenState>('loading');

  // Profile
  readonly handle = signal('');
  readonly bio = signal('');
  readonly instagram = signal('');
  readonly category = signal<ArtistCategory>('makeup');

  // Salon + store
  readonly salonName = signal('');
  readonly storeName = signal('');
  readonly city = signal('');
  readonly address = signal('');

  // First service
  readonly serviceName = signal('');
  readonly serviceDurationMin = signal('60');
  readonly servicePrice = signal('');

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly fieldErrors = signal<Record<string, string>>({});

  ngOnInit(): void {
    this.onboardingSvc.getStatus().subscribe({
      next: (status) => {
        if (status.status === 'active') {
          // Nothing to do here anymore - the normal dashboard is correct.
          this.router.navigateByUrl('/dashboard');
        } else if (status.status === 'pending') {
          this.screenState.set('pending');
        } else {
          this.screenState.set('rejected');
        }
      },
      error: (err: HttpErrorResponse) => {
        // A 404 specifically means onboarding was never started - the
        // expected case for a freshly-registered artist, not an error.
        this.screenState.set(err.status === 404 ? 'form' : 'error');
      },
    });
  }

  /** Lowercases and strips anything the handle format wouldn't allow, live
   *  as the person types - cheaper than letting them submit and bounce off
   *  a validation error for something this mechanical. */
  onHandleInput(value: string): void {
    this.handle.set(
      value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
    );
  }

  /** Clears one field's error the moment the person starts fixing it,
   *  rather than leaving a red border and stale message sitting there
   *  after they've already changed the value - a server-validated error
   *  is only trustworthy up to the next edit. */
  clearFieldError(field: string): void {
    if (!this.fieldErrors()[field]) return;
    const next = { ...this.fieldErrors() };
    delete next[field];
    this.fieldErrors.set(next);
  }

  isFormValid(): boolean {
    return (
      this.handle().trim().length >= 3 &&
      this.salonName().trim().length >= 2 &&
      this.storeName().trim().length >= 2 &&
      this.city().trim().length >= 2 &&
      this.serviceName().trim().length >= 2 &&
      /^\d+(\.\d{1,2})?$/.test(this.servicePrice().trim()) &&
      Number(this.serviceDurationMin()) >= 15 &&
      Number(this.serviceDurationMin()) <= 480
    );
  }

  submit(): void {
    if (!this.isFormValid() || this.submitting()) return;

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.fieldErrors.set({});

    const req: CompleteOnboardingRequest = {
      handle: this.handle().trim(),
      bio: this.bio().trim() || undefined,
      instagram: this.instagram().trim() || undefined,
      category: this.category(),
      salon_name: this.salonName().trim(),
      store_name: this.storeName().trim(),
      city: this.city().trim(),
      address: this.address().trim() || undefined,
      service_name: this.serviceName().trim(),
      service_duration_min: Number(this.serviceDurationMin()),
      service_price: this.servicePrice().trim(),
    };

    this.onboardingSvc.complete(req).subscribe({
      next: () => {
        this.submitting.set(false);
        this.screenState.set('pending');
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.errorMessage.set(
          extractApiErrorMessage(err, 'Could not submit your application. Please try again.'),
        );

        // extractFieldErrors() only ever populates from a 422's `details`
        // array - struct-tag validation the client-side isFormValid()
        // check let slip through. It does NOT cover the two errors this
        // form is realistically most likely to hit: a bad handle format
        // and a taken handle, both returned by the backend as a plain
        // top-level message with no details array at all (see
        // onboarding/service.go - Validate() and the ErrHandleTaken path
        // both skip the field-error machinery entirely, since they're
        // custom checks, not struct-tag ones). Both are special-cased
        // here by error code so the SAME field-highlighting mechanism
        // still works for the errors a person will actually see, not
        // just the rarer struct-tag ones.
        const fields = extractFieldErrors(err);
        const code = (err.error as { error?: { code?: string } })?.error?.code;

        // HANDLE_TAKEN, and the custom handle-format/category checks in
        // Go's onboarding.CompleteOnboardingRequest.Validate(), all skip
        // the struct-tag machinery and return a plain message with no
        // `details` - so extractFieldErrors() alone won't populate
        // anything for either. A keyword match on the message text is an
        // honest heuristic here, not a real field code from the backend,
        // because the backend genuinely doesn't send one for these two
        // paths - flagged as a real limitation, not hidden as if this
        // were a proper field-level error.
        if (code === 'HANDLE_TAKEN' || code === 'VALIDATION_ERROR') {
          const msg = extractApiErrorMessage(err, '');
          const lower = msg.toLowerCase();
          if (msg && !fields['Handle'] && lower.includes('handle')) {
            fields['Handle'] = msg;
          } else if (msg && !fields['Category'] && lower.includes('category')) {
            fields['Category'] = msg;
          }
        }
        this.fieldErrors.set(fields);
      },
    });
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login'),
    });
  }
}
