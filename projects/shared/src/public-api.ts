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
export * from './lib/core/auth-error.interceptor';
export * from './lib/core/customer-auth.store';
export * from './lib/core/customer-auth.interceptor';
export * from './lib/core/customer-auth-error.interceptor';
export * from './lib/core/customer-auth.guard';
export * from './lib/core/product-data.service';
export * from './lib/core/cart.store';
export * from './lib/core/onboarding-data.service';
export * from './lib/core/admin-data.service';
export * from './lib/core/phone.util';
export * from './lib/core/booking-status.util';
export * from './lib/core/rate-limit.store';
export * from './lib/core/rate-limit.interceptor';
export * from './lib/core/rate-limit-banner.component';
export * from './lib/core/image-upload.util';

// UI primitives
export * from './lib/ui';
export * from './lib/core/auth.guard';

// ── Data services ─────────────────────────────────────────────────────────────
export * from './lib/core/booking-data.service';
export * from './lib/core/artist-data.service';
export * from './lib/core/discovery-data.service';
export * from './lib/core/review-data.service';
export * from './lib/core/earnings-data.service';
export * from './lib/core/client-data.service';
export * from './lib/core/media-data.service';
export * from './lib/core/cloudinary-upload.service';
