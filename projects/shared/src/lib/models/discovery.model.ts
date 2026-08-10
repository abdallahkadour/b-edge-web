/**
 * Discovery domain models. Mirror the Go discovery.* response structs.
 * This is the public, unauthenticated browse/search surface - separate from
 * artist.model.ts, which covers the authenticated artist's own profile.
 */

/**
 * One artist result card from GET /discovery/artists.
 *
 * One row per (artist, city) - an artist with two stores in different
 * cities appears twice, once per city, so city-grouped browse UIs can
 * section results without a client-side join.
 */
export interface ArtistCard {
  readonly id: string;
  readonly handle?: string; // prefer this for booking links when present
  readonly name: string;
  readonly category?: string; // 'makeup' | 'hair' | 'nails' | 'lashes' | 'skincare'
  readonly rating: string;    // decimal as string
  readonly review_count: number;
  readonly city: string;
  readonly is_verified: boolean;
  readonly is_new: boolean; // created within the last 30 days
}

/** A store entry inside a public artist profile. */
export interface DiscoveryStoreCard {
  readonly id: string;
  readonly name: string;
  readonly city: string;
}

/** A service entry inside a public artist profile. */
export interface DiscoveryServiceCard {
  readonly id: string;
  readonly name: string;
  readonly duration_min: number;
  readonly price: string;          // decimal as string
  readonly deposit_amount: string; // decimal as string
}

/**
 * Full public profile aggregate from GET /discovery/artists/:id
 * artist + stores + services in one response. Services are empty if the
 * artist has no salon yet.
 */
export interface PublicArtistProfile {
  readonly id: string;
  readonly name: string;
  readonly bio?: string;
  readonly instagram?: string;
  readonly category?: string;
  readonly rating: string;
  readonly review_count: number;
  readonly is_verified: boolean;
  readonly stores: DiscoveryStoreCard[];
  readonly services: DiscoveryServiceCard[];
}

/** The five fixed artist categories the backend validates against. */
export const ARTIST_CATEGORIES = ['makeup', 'hair', 'nails', 'lashes', 'skincare'] as const;
export type ArtistCategory = (typeof ARTIST_CATEGORIES)[number];
