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
  CreateServiceRequest,
  UpdateServiceRequest,
  SetBusinessHoursRequest,
  CreateExceptionRequest,
} from '../models';

/**
 * Data-access service for the artist domain.
 * Thin wrappers over ApiService — one method per endpoint.
 */
@Injectable({ providedIn: 'root' })
export class ArtistDataService {
  private readonly api = inject(ApiService);

  // ── Profile ────────────────────────────────────────────────────────────────

  /** GET /artists/me — full profile for the authenticated artist. */
  getMyProfile(): Observable<ArtistProfile> {
    return this.api.get<ArtistProfile>('/artists/me');
  }

  /** GET /artists/:id — public profile for any artist. */
  getArtistById(id: string): Observable<Artist> {
    return this.api.get<Artist>(`/artists/${id}`);
  }

  /** PATCH /artists/:id — update bio/instagram. */
  updateProfile(artistId: string, req: UpdateProfileRequest): Observable<Artist> {
    return this.api.patch<Artist>(`/artists/${artistId}`, req);
  }

  // ── Stores ─────────────────────────────────────────────────────────────────

  /** GET /artists/salon/stores — stores for the authenticated artist's salon. */
  getStoresBySalon(): Observable<Store[]> {
    return this.api.get<Store[]>('/artists/salon/stores');
  }

  /** GET /artists/:id/stores — stores an artist is assigned to. */
  getStoresByArtist(artistId: string): Observable<Store[]> {
    return this.api.get<Store[]>(`/artists/${artistId}/stores`);
  }

  // ── Services ───────────────────────────────────────────────────────────────

  /** GET /artists/salon/services — all active services for the salon. */
  getServicesBySalon(): Observable<Service[]> {
    return this.api.get<Service[]>('/artists/salon/services');
  }

  /** POST /artists/salon/services — add a new service. */
  createService(req: CreateServiceRequest): Observable<Service> {
    return this.api.post<Service>('/artists/salon/services', req);
  }

  /** PATCH /artists/salon/services/:id — update a service. */
  updateService(serviceId: string, req: UpdateServiceRequest): Observable<Service> {
    return this.api.patch<Service>(`/artists/salon/services/${serviceId}`, req);
  }

  /** DELETE /artists/salon/services/:id — deactivate a service. */
  deleteService(serviceId: string): Observable<void> {
    return this.api.delete(`/artists/salon/services/${serviceId}`);
  }

  // ── Business hours ──────────────────────────────────────────────────────────

  /** GET /artists/stores/:id/hours — 7-day schedule for a store. */
  getBusinessHours(storeId: string): Observable<BusinessHours[]> {
    return this.api.get<BusinessHours[]>(`/artists/stores/${storeId}/hours`);
  }

  /** POST /artists/stores/:id/hours — upsert hours for a day. */
  setBusinessHours(storeId: string, req: SetBusinessHoursRequest): Observable<void> {
    return this.api.command(`/artists/stores/${storeId}/hours`, 'POST', req);
  }

  /** GET /artists/stores/:id/exceptions — holiday / special hours. */
  getExceptions(storeId: string): Observable<BusinessHoursException[]> {
    return this.api.get<BusinessHoursException[]>(`/artists/stores/${storeId}/exceptions`);
  }

  /** POST /artists/stores/:id/exceptions — add a holiday. */
  createException(storeId: string, req: CreateExceptionRequest): Observable<void> {
    return this.api.command(`/artists/stores/${storeId}/exceptions`, 'POST', req);
  }

  /** DELETE /artists/stores/:id/exceptions/:date — remove an exception. */
  deleteException(storeId: string, date: string): Observable<void> {
    return this.api.delete(`/artists/stores/${storeId}/exceptions/${date}`);
  }
}
