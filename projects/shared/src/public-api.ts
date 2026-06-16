/*
 * Public API surface of @bedge/shared.
 *
 * Export everything the two apps may import. Keep it intentional.
 */

// ── Models ────────────────────────────────────────────────────────────────────
export * from './lib/models';

// ── Configuration token ───────────────────────────────────────────────────────
export * from './lib/tokens/api-config.token';

// ── Core: http client, auth ───────────────────────────────────────────────────
export * from './lib/core/api.service';
export * from './lib/core/auth.store';
export * from './lib/core/auth.interceptor';
export * from './lib/core/auth.guard';

// ── Data services ─────────────────────────────────────────────────────────────
export * from './lib/core/booking-data.service';
export * from './lib/core/artist-data.service';
