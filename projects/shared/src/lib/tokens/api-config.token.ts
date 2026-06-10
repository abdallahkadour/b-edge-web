import { InjectionToken } from '@angular/core';

/**
 * Runtime configuration for the shared API layer.
 * Each app provides its own value (different base URLs per environment).
 */
export interface ApiConfig {
  /** Base URL of the B-Edge API, including /api/v1. No trailing slash. */
  readonly baseUrl: string;
}

/**
 * DI token for ApiConfig. A library cannot read an app's environment file
 * directly, so each app provides this token at bootstrap. This keeps the
 * shared library decoupled from any single app's config.
 */
export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG');
