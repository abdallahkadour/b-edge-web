/**
 * Client CRM domain models. Mirror the Go client response structs.
 * Money fields are strings — decimal.Decimal serializes to quoted JSON strings.
 */

/** One client card in the artist's client list (Go client.ClientCard). */
export interface ClientCard {
  readonly customer_id: string;
  readonly name: string;
  readonly phone?: string;
  readonly bookings_count: number;
  readonly total_spent: string;       // decimal as string
  readonly last_service?: string;
  readonly last_visit?: string;       // ISO 8601
  readonly average_rating?: string;   // decimal as string
  readonly is_vip: boolean;
}

/** One booking in the client's history (Go client.BookingHistory). */
export interface ClientBookingHistory {
  readonly id: string;
  readonly service_name: string;
  readonly store_name: string;
  readonly start_time: string;        // ISO 8601
  readonly status: string;
  readonly final_price: string;       // decimal as string
}

/** Full client profile with history + note (Go client.ClientProfile). */
export interface ClientProfile {
  readonly customer_id: string;
  readonly name: string;
  readonly phone?: string;
  readonly bookings_count: number;
  readonly total_spent: string;       // decimal as string
  readonly average_rating?: string;   // decimal as string
  readonly is_vip: boolean;
  readonly note: string;
  readonly history: ClientBookingHistory[];
}

/** Response after upserting a note (Go client.NoteResponse). */
export interface NoteResponse {
  readonly customer_id: string;
  readonly content: string;
  readonly updated_at: string;        // ISO 8601
}

/** Request body for PUT /clients/:id/notes. */
export interface UpsertNoteRequest {
  content: string;
}
