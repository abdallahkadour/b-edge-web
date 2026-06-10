/*
 * Public API surface of @bedge/shared.
 *
 * Everything the two apps (artist-dashboard, customer-pwa) may import lives
 * here. If it is not exported from this file, the apps cannot see it — this is
 * the library's contract. Keep it intentional: export domain types, the API
 * layer, auth, tokens, and feature data-services. Do not export internal
 * helpers that should stay private to the library.
 */
 
// ── Models (domain types + request/response shapes) ──────────────────────────
export * from './lib/models';
 
// ── Configuration token (each app provides its base URL) ─────────────────────
export * from './lib/tokens/api-config.token';
 
// ── Core: API client, auth state, interceptor, guard ─────────────────────────
export * from './lib/core/api.service';
export * from './lib/core/auth.store';
export * from './lib/core/auth.interceptor';
export * from './lib/core/auth.guard';