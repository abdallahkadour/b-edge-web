/**
 * Customer OTP auth models. Mirror the Go customerauth.* structs.
 * Deliberately separate from the artist auth models (LoginRequest,
 * RegisterRequest, etc.) - phone+OTP is a genuinely different mechanism,
 * not a variant of email+password.
 */

/** POST /customer-auth/request-otp request body. */
export interface RequestOtpRequest {
  phone: string;
}

/** POST /customer-auth/verify-otp request body. */
export interface VerifyOtpRequest {
  phone: string;
  code: string; // exactly 6 digits
}

/** The safe subset of a customer's identity returned to the client. */
export interface CustomerInfo {
  readonly id: string;
  readonly name: string;
  readonly phone: string;
}

/** Response shape for verify-otp and refresh - access token + customer. */
export interface CustomerAuthResult {
  readonly access_token: string;
  readonly customer: CustomerInfo;
}
