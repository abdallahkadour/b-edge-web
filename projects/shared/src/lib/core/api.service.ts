import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_CONFIG } from '../tokens/api-config.token';
import type { ApiResponse, ResponseMeta } from '../models';

/** A list result carrying both the items and pagination metadata. */
export interface ListResult<T> {
  readonly items: T[];
  readonly meta?: ResponseMeta;
}

/**
 * Thin, typed wrapper over HttpClient. Every B-Edge endpoint returns the
 * `{ data, meta?, error? }` envelope; this service unwraps `data` so callers
 * work with clean domain types. Errors propagate as HttpErrorResponse and are
 * translated centrally by the error interceptor.
 *
 * The auth interceptor attaches the JWT and `withCredentials`, so this service
 * stays focused purely on shape, not on auth concerns.
 *
 * Note on empty collections: Go marshals a nil slice as JSON `null`, not `[]`.
 * That null arrives typed as `T[]` and detonates on the first `.length`,
 * spread, or `@for`. Anything returning a collection must go through
 * `getArray()` or `getList()`, both of which coalesce. `get()` is for single
 * resources only.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_CONFIG).baseUrl;

  /**
   * GET a single resource, unwrapping the envelope's `data`.
   * Do NOT use for arrays — see `getArray()`.
   */
  get<T>(path: string, params?: Record<string, string | number>): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(this.url(path), { params: this.toParams(params) })
      .pipe(map((res) => res.data));
  }

  /**
   * GET a collection that has no pagination envelope, coalescing the API's
   * `null`-for-empty into `[]` so callers can treat the result as an array
   * unconditionally.
   */
  getArray<T>(path: string, params?: Record<string, string | number>): Observable<T[]> {
    return this.http
      .get<ApiResponse<T[]>>(this.url(path), { params: this.toParams(params) })
      .pipe(map((res) => res.data ?? []));
  }

  /** GET a list, returning items plus pagination meta. */
  getList<T>(path: string, params?: Record<string, string | number>): Observable<ListResult<T>> {
    return this.http
      .get<ApiResponse<T[]>>(this.url(path), { params: this.toParams(params) })
      .pipe(map((res) => ({ items: res.data ?? [], meta: res.meta })));
  }

  /** POST a body, unwrapping the envelope's `data`. */
  post<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(this.url(path), body)
      .pipe(map((res) => res.data));
  }

  /**
   * PUT a body, unwrapping the envelope's `data`.
   * Used by endpoints that fully replace a resource — e.g. the client note
   * upsert (PUT /clients/:id/notes), which is NOT a PATCH server-side.
   */
  put<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .put<ApiResponse<T>>(this.url(path), body)
      .pipe(map((res) => res.data));
  }

  /** PATCH a body, unwrapping the envelope's `data`. */
  patch<T>(path: string, body?: unknown): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(this.url(path), body ?? {})
      .pipe(map((res) => res.data));
  }

  /** DELETE a resource. Most B-Edge deletes return 204 (no body). */
  delete(path: string): Observable<void> {
    return this.http.delete<void>(this.url(path));
  }

  /** PATCH/POST endpoints that return 204 No Content. */
  command(path: string, method: 'POST' | 'PATCH', body?: unknown): Observable<void> {
    const url = this.url(path);
    return method === 'POST'
      ? this.http.post<void>(url, body ?? {})
      : this.http.patch<void>(url, body ?? {});
  }

  private url(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private toParams(params?: Record<string, string | number>): HttpParams {
    let hp = new HttpParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          hp = hp.set(key, String(value));
        }
      }
    }
    return hp;
  }
}
