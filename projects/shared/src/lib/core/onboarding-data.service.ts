import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import type {
  CompleteOnboardingRequest,
  CompleteOnboardingResponse,
  OnboardingStatus,
} from '../models';

/** Data-access for the artist self-service onboarding flow. */
@Injectable({ providedIn: 'root' })
export class OnboardingDataService {
  private readonly api = inject(ApiService);

  /** POST /onboarding/complete - creates salon + artist (pending) + one
   *  store + one service in a single backend transaction. */
  complete(req: CompleteOnboardingRequest): Observable<CompleteOnboardingResponse> {
    return this.api.post<CompleteOnboardingResponse>('/onboarding/complete', req);
  }

  /** GET /onboarding/status - a 404 (via ApiService's error mapping) means
   *  onboarding was never started; callers should treat that case
   *  separately from a genuine pending/active/rejected status. */
  getStatus(): Observable<OnboardingStatus> {
    return this.api.get<OnboardingStatus>('/onboarding/status');
  }
}
