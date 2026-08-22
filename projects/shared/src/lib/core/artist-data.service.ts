import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import type {
  Artist,
  ArtistProfile,
  Store,
  Service,
  BusinessHours,
  BusinessHoursException,
  UpdateProfileRequest,
  CreateStoreRequest,
  UpdateStoreRequest,
  CreateServiceRequest,
  UpdateServiceRequest,
  SetBusinessHoursRequest,
  CreateExceptionRequest,
} from '../models';

/**
 * Data-access service for the artist domain.
 * Thin wrappers over ApiService - one method per endpoint.
 *
 * Collection endpoints use `getArray`, which coalesces the API's `null`-for-
 * empty into `[]`. Components must not have to defend against a null that the
 * type system claims is an array.
 */
@Injectable({ providedIn: 'root' })
export class ArtistDataService {
  private readonly api = inject(ApiService);

  // ── Profile ────────────────────────────────────────────────────────────────

  /** GET /artists/me - full profile for the authenticated artist. */
  getMyProfile(): Observable<ArtistProfile> {
    return this.api.get<ArtistProfile>('/artists/me');
  }

  /**
   * GET /artists/:id - public profile for any artist. Accepts either a real
   * UUID or a public handle (e.g. "rania") - the response's own `id` field
   * is always the resolved real UUID, which callers should use for any
   * further request that requires a genuine UUID (e.g. booking creation).
   */
  getArtistById(id: string): Observable<Artist> {
    return this.api.get<Artist>(`/artists/${id}`);
  }

  /** PATCH /artists/:id - update bio/instagram. */
  updateProfile(artistId: string, req: UpdateProfileRequest): Observable<Artist> {
    return this.api.patch<Artist>(`/artists/${artistId}`, req);
  }

  // ── Public booking data ───────────────────────────────────────────────────
  // No auth - this is what the guest booking funnel reads from an artist's
  // shared profile link.

  /**
   * GET /artists/:id/services - active, bookable services for this artist.
   * Accepts either a real UUID or a public handle in :id (backend resolves
   * either form transparently).
   */
  getServicesByArtist(artistId: string): Observable<Service[]> {
    return this.api.getArray<Service>(`/artists/${artistId}/services`);
  }

  // ── Stores ─────────────────────────────────────────────────────────────────

  /** GET /artists/salon/stores - stores for the authenticated artist's salon. */
  getStoresBySalon(): Observable<Store[]> {
    return this.api.getArray<Store>('/artists/salon/stores');
  }

  /** POST /artists/salon/stores - add a second (or further) branch. */
  createStore(req: CreateStoreRequest): Observable<Store> {
    return this.api.post<Store>('/artists/salon/stores', req);
  }

  /** PATCH /artists/stores/:store_id - rename or activate/deactivate a
   *  store. Backend accepts more fields than UpdateStoreRequest exposes
   *  (address, phone, notice hours, early-bird, travel buffer, timezone) -
   *  see the doc comment on UpdateStoreRequest for why only name/is_active
   *  are surfaced here. */
  updateStore(storeId: string, req: UpdateStoreRequest): Observable<Store> {
    return this.api.patch<Store>(`/artists/stores/${storeId}`, req);
  }

  /** GET /artists/:id/stores - stores an artist is assigned to. Accepts either a UUID or a handle in :id. */
  getStoresByArtist(artistId: string): Observable<Store[]> {
    return this.api.getArray<Store>(`/artists/${artistId}/stores`);
  }

  // ── Services ───────────────────────────────────────────────────────────────

  /** GET /artists/salon/services - all active services for the salon. */
  getServicesBySalon(): Observable<Service[]> {
    return this.api.getArray<Service>('/artists/salon/services');
  }

  /** POST /artists/salon/services - add a new service. */
  createService(req: CreateServiceRequest): Observable<Service> {
    return this.api.post<Service>('/artists/salon/services', req);
  }

  /** PATCH /artists/salon/services/:id - update a service. */
  updateService(serviceId: string, req: UpdateServiceRequest): Observable<Service> {
    return this.api.patch<Service>(`/artists/salon/services/${serviceId}`, req);
  }

  /** DELETE /artists/salon/services/:id - deactivate a service. */
  deleteService(serviceId: string): Observable<void> {
    return this.api.delete(`/artists/salon/services/${serviceId}`);
  }

  // ── Business hours ──────────────────────────────────────────────────────────

  /** GET /artists/stores/:id/hours - 7-day schedule for a store. */
  getBusinessHours(storeId: string): Observable<BusinessHours[]> {
    return this.api.getArray<BusinessHours>(`/artists/stores/${storeId}/hours`);
  }

  /** POST /artists/stores/:id/hours - upsert hours for a day. */
  setBusinessHours(storeId: string, req: SetBusinessHoursRequest): Observable<void> {
    return this.api.command(`/artists/stores/${storeId}/hours`, 'POST', req);
  }

  /**
   * GET /artists/stores/:id/exceptions - holiday / special hours.
   *
   * A store with no exceptions is the common case, and that is exactly when
   * the API returns null. Coalescing here is what keeps the Hours screen's
   * sort from throwing on a fresh store.
   */
  getExceptions(storeId: string): Observable<BusinessHoursException[]> {
    return this.api.getArray<BusinessHoursException>(`/artists/stores/${storeId}/exceptions`);
  }

  /** POST /artists/stores/:id/exceptions - add a holiday. */
  createException(storeId: string, req: CreateExceptionRequest): Observable<void> {
    return this.api.command(`/artists/stores/${storeId}/exceptions`, 'POST', req);
  }

  /** DELETE /artists/stores/:id/exceptions/:date - remove an exception. */
  deleteException(storeId: string, date: string): Observable<void> {
    return this.api.delete(`/artists/stores/${storeId}/exceptions/${date}`);
  }
}