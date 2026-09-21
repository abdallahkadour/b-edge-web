import { salonRoleFromToken } from './salon-role.util';

/** Builds an unsigned JWT-shaped string with the given payload. */
function tokenWith(payload: Record<string, unknown>): string {
  const b64 = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `header.${b64}.signature`;
}

describe('salonRoleFromToken', () => {
  it('reads owner', () => {
    expect(salonRoleFromToken(tokenWith({ salon_role: 'owner' }))).toBe('owner');
  });

  it('reads member', () => {
    expect(salonRoleFromToken(tokenWith({ salon_role: 'member' }))).toBe('member');
  });

  // A token minted before the claim existed must hide owner controls rather
  // than show controls the API will refuse.
  it('treats a token with no salon_role claim as none', () => {
    expect(salonRoleFromToken(tokenWith({ user_id: 'x', role: 'artist' }))).toBe('none');
  });

  it('treats an unrecognised role as none', () => {
    expect(salonRoleFromToken(tokenWith({ salon_role: 'administrator' }))).toBe('none');
    expect(salonRoleFromToken(tokenWith({ salon_role: 'OWNER' }))).toBe('none');
    expect(salonRoleFromToken(tokenWith({ salon_role: 42 }))).toBe('none');
  });

  it('returns none for null, empty and malformed tokens rather than throwing', () => {
    expect(salonRoleFromToken(null)).toBe('none');
    expect(salonRoleFromToken(undefined)).toBe('none');
    expect(salonRoleFromToken('')).toBe('none');
    expect(salonRoleFromToken('not-a-jwt')).toBe('none');
    expect(salonRoleFromToken('a.b')).toBe('none');
    expect(salonRoleFromToken('a.!!!not-base64!!!.c')).toBe('none');
    expect(salonRoleFromToken(`header.${btoa('not json')}.sig`)).toBe('none');
  });

  // Real tokens are base64url and unpadded; a decoder that only handles
  // standard base64 works on some payloads and silently fails on others
  // depending on length, which would make the role flicker by account.
  it('decodes unpadded base64url payloads at every length remainder', () => {
    for (const pad of ['', 'a', 'ab', 'abc']) {
      const tok = tokenWith({ salon_role: 'owner', pad });
      expect(salonRoleFromToken(tok)).toBe('owner');
    }
  });
});
