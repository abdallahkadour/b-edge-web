/**
 * Auth domain models. Mirror the Go auth response/request structs.
 *
 * Note: the refresh token is delivered ONLY as an httpOnly cookie and is
 * never present in any response body. Do not add a refresh_token field here
 * it would be a security regression.
 */

/** The two self-registerable roles. Admin is provisioned out-of-band. */
export type UserRole = 'customer' | 'artist' | 'admin';

/** Authenticated user info (Go auth.UserInfo). */
export interface UserInfo {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly role: UserRole;
}

/**
 * Result of login and refresh (Go auth.LoginResult).
 * access_token is a short-lived JWT. The refresh token is in the httpOnly cookie.
 */
export interface LoginResult {
  readonly access_token: string;
  readonly user: UserInfo;
}

/** Result of registration (Go auth.RegisterResult). Same shape as login. */
export type RegisterResult = LoginResult;

/** Request body for POST /auth/login (Go auth.LoginRequest). */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Roles a user may self-register as. Excludes admin. */
export type RegisterableRole = 'customer' | 'artist';

/** Request body for POST /auth/register (Go auth.RegisterRequest). */
export interface RegisterRequest {
  name: string;     // 2–100 chars
  email: string;
  password: string; // min 8 chars
  role: RegisterableRole;
  phone?: string;
}

/** Request body for PATCH /auth/change-password. */
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string; // min 8 chars
}

/** Request body for POST /auth/forgot-password. */
export interface ForgotPasswordRequest {
  email: string;
}

/** Request body for POST /auth/reset-password. */
export interface ResetPasswordRequest {
  token: string;
  new_password: string; // min 8 chars
}
