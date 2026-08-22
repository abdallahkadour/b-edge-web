/**
 * Artist domain models. Mirror the Go artist response/request structs.
 * Money fields (price, deposit_amount, early_bird_fee) and rating are
 * `string` - decimal.Decimal serializes to a quoted JSON string.
 */

/** Public artist profile (Go artist.ArtistResponse). */
export interface Artist {
  readonly id: string;
  readonly handle?: string; // public booking-link identifier, e.g. "rania"
  readonly name: string;
  readonly bio?: string;
  readonly bio_ar?: string;
  readonly instagram?: string;
  readonly avatar_url?: string;
  readonly rating: string;        // decimal as string
  readonly review_count: number;
  readonly is_verified: boolean;
}

/** Full own-profile (Go artist.ArtistProfile) - returned by GET /artists/me. */
export interface ArtistProfile {
  readonly id: string;
  readonly user_id: string;
  readonly salon_id?: string;
  readonly handle?: string;
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly bio?: string;
  readonly bio_ar?: string;
  readonly instagram?: string;
  readonly avatar_url?: string;
  readonly rating: string;
  readonly review_count: number;
  readonly is_verified: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

/** A physical store/location (Go artist.Store). */
export interface Store {
  readonly id: string;
  readonly salon_id: string;
  readonly name: string;
  readonly name_ar?: string;
  readonly address?: string;
  readonly city: string;
  readonly country: string;
  readonly phone?: string;
  readonly same_day_notice_hours: number;
  readonly early_bird_cutoff?: string; // HH:MM:SS
  readonly early_bird_fee: string;     // decimal as string
  readonly weekday_buffer_min: number;
  readonly weekend_buffer_min: number;
  readonly is_active: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

/** POST /artists/salon/stores request body. */
export interface CreateStoreRequest {
  name: string;      // 2–200
  name_ar?: string;  // max 200
  city: string;       // 2–100
  address?: string;   // max 500
  phone?: string;     // max 50
}

/** A salon service (Go artist.ServiceResponse). */
export interface Service {
  readonly id: string;
  readonly salon_id: string;
  readonly name: string;
  readonly name_ar?: string;
  readonly description?: string;
  readonly duration_min: number;
  readonly active_duration_min?: number;
  readonly price: string;          // decimal as string
  readonly deposit_amount: string; // decimal as string
  readonly deposit_deadline_hours: number;
  readonly is_active: boolean;
}

/** Working hours for one day (Go artist.BusinessHours). */
export interface BusinessHours {
  readonly id: string;
  readonly store_id: string;
  readonly day_of_week: number; // 0=Sunday … 6=Saturday
  readonly open_time: string;   // HH:MM:SS
  readonly close_time: string;  // HH:MM:SS
  readonly is_open: boolean;
  readonly created_at: string;
}

/** Holiday / special-hours override (Go artist.BusinessHoursException). */
export interface BusinessHoursException {
  readonly id: string;
  readonly store_id: string;
  readonly exception_date: string; // YYYY-MM-DD
  readonly is_closed: boolean;
  readonly open_time?: string;
  readonly close_time?: string;
  readonly reason?: string;
  readonly created_at: string;
}

/** Request body for PATCH /artists/:id (Go artist.UpdateProfileRequest). */
export interface UpdateProfileRequest {
  handle?: string;      // lowercase alphanumeric + hyphens, 3-50 chars, no leading/trailing hyphen
  bio?: string;         // max 500
  bio_ar?: string;      // max 500
  instagram?: string;   // max 255
  avatar_url?: string;  // max 500, must be a valid URL
}

/** Request body for POST /artists/salon/services. */
export interface CreateServiceRequest {
  name: string;                  // 2–200
  name_ar?: string;              // max 200
  description?: string;
  duration_min: number;          // 15–480
  active_duration_min?: number;  // min 15
  price: string;                 // decimal string
  deposit_amount: string;        // decimal string
  deposit_deadline_hours: number; // 1–168
  category_id?: string;          // uuid
}

/** Request body for PATCH /artists/salon/services/:id. */
export interface UpdateServiceRequest {
  name?: string;
  name_ar?: string;
  description?: string;
  duration_min?: number;
  price?: string;
  deposit_amount?: string;
  deposit_deadline_hours?: number;
  is_active?: boolean;
}

/** Request body for POST /artists/stores/:id/hours. */
export interface SetBusinessHoursRequest {
  day_of_week: number; // 0–6
  open_time: string;   // HH:MM:SS
  close_time: string;  // HH:MM:SS
  is_open: boolean;
}

/** Request body for POST /artists/stores/:id/exceptions. */
export interface CreateExceptionRequest {
  exception_date: string; // YYYY-MM-DD
  is_closed: boolean;
  open_time?: string;
  close_time?: string;
  reason?: string; // max 255
}
