import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import type { ClientCard, ClientProfile, NoteResponse, UpsertNoteRequest } from '../models';

/**
 * Data-access service for the client CRM domain.
 * Thin wrappers over ApiService — one method per endpoint.
 */
@Injectable({ providedIn: 'root' })
export class ClientDataService {
  private readonly api = inject(ApiService);

  /**
   * GET /clients?q= — list the artist's clients.
   * Optional q searches by name or service.
   *
   * Uses getArray: a search that matches nothing returns null, not [], and
   * that is the most-hit path on this screen.
   */
  listClients(q?: string): Observable<ClientCard[]> {
    const params: Record<string, string> = {};
    if (q) params['q'] = q;
    return this.api.getArray<ClientCard>('/clients', params);
  }

  /** GET /clients/:id — one client's full profile + booking history. */
  getClient(customerId: string): Observable<ClientProfile> {
    return this.api.get<ClientProfile>(`/clients/${customerId}`);
  }

  /**
   * PUT /clients/:id/notes — create or update the private note for a client.
   * The server route is a PUT (full replace of the note), not a PATCH.
   */
  upsertNote(customerId: string, req: UpsertNoteRequest): Observable<NoteResponse> {
    return this.api.put<NoteResponse>(`/clients/${customerId}/notes`, req);
  }
}
