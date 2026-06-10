/**
 * API response envelope.
 *
 * Every endpoint wraps its payload in this structure (Go response.Body).
 * Success responses populate `data`; failures populate `error`.
 * List endpoints additionally populate `meta` for keyset pagination.
 */

/** Pagination metadata for list endpoints (Go response.Meta). */
export interface ResponseMeta {
  readonly has_more: boolean;
  readonly next_cursor?: string;
  readonly total?: number;
}

/** Error detail returned on failure (Go response.ErrorDetails). */
export interface ApiErrorDetails {
  readonly code: string;
  readonly message: string;
}

/**
 * The success envelope. `data` is the typed payload, `meta` is present
 * on paginated list endpoints. Mirrors Go response.Body.
 */
export interface ApiResponse<T> {
  readonly data: T;
  readonly meta?: ResponseMeta;
  readonly error?: never;
}

/** The error envelope. Mirrors Go response.ErrorBody. */
export interface ApiErrorResponse {
  readonly data?: never;
  readonly error: ApiErrorDetails;
  readonly meta?: never;
}
