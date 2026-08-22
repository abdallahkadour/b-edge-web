/**
 * Onboarding domain models. Mirror the Go onboarding.* structs.
 *
 * ArtistCategory is deliberately NOT redefined here - it already exists in
 * discovery.model.ts (ARTIST_CATEGORIES, used by Discover's category
 * filter) with the identical five values, since both are the same concept:
 * an artist's category. Defining a second, colliding type of the same name
 * was a real bug, not a stylistic choice - caught by the build failing on
 * the ambiguous re-export, not by review.
 */
// Imported, not re-exported - the barrel (index.ts) already exports
// ArtistCategory via discovery.model.ts's own `export *`. Re-exporting it
// again here is exactly what caused the original collision: two paths
// providing the same named export to the same barrel is ambiguous
// regardless of whether the second one is a fresh definition or a
// re-export of the first.
import type { ArtistCategory } from './discovery.model';

/** POST /onboarding/complete request body. Deliberately minimal - see the
 *  Go model's doc comment for why deposit fields are absent entirely
 *  (server-side defaults apply; nothing to configure before a first
 *  booking exists). */
export interface CompleteOnboardingRequest {
  handle: string;
  bio?: string;
  instagram?: string;
  category: ArtistCategory;

  salon_name: string;

  store_name: string;
  city: string;
  address?: string;

  service_name: string;
  service_duration_min: number;
  service_price: string;
}

export interface CompleteOnboardingResponse {
  artist_id: string;
  status: 'pending';
}

export type OnboardingStatusValue = 'pending' | 'active' | 'rejected';

export interface OnboardingStatus {
  status: OnboardingStatusValue;
  created_at?: string;
}
