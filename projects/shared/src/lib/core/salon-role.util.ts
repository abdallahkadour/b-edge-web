/**
 * The caller's standing inside their salon, as carried by the access token's
 * `salon_role` claim.
 *
 * Distinct from `role` (artist | admin | customer), which is the platform
 * role. An artist is always role 'artist'; whether they may change the
 * salon's prices depends on this.
 *
 * Mirrors internal/pkg/salonrole in the API, which is the authority. Nothing
 * here is a security control - the server decides, and this only decides what
 * to render. A member who reaches an owner-only screen by typing the URL
 * still gets 403 SALON_ROLE_FORBIDDEN from the API.
 */
export type SalonRole = 'owner' | 'member' | 'none';

/**
 * Reads the `salon_role` claim out of a JWT without verifying it.
 *
 * Unverified on purpose: the signature is the server's business, and this
 * value is only ever used to decide what to show. Anything unrecognised,
 * malformed, or absent becomes 'none', which renders the smallest surface -
 * a token minted before this claim existed therefore hides owner controls
 * rather than showing controls the API will refuse.
 */
export function salonRoleFromToken(token: string | null | undefined): SalonRole {
  if (!token) return 'none';

  const parts = token.split('.');
  if (parts.length !== 3) return 'none';

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const claims = JSON.parse(atob(padded)) as { salon_role?: unknown };
    return claims.salon_role === 'owner' || claims.salon_role === 'member'
      ? claims.salon_role
      : 'none';
  } catch {
    // A malformed token is not an error worth surfacing here - the next API
    // call will 401 and the interceptor will handle it. Render as 'none'.
    return 'none';
  }
}
