import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import type { ServiceOffering, UpdateOfferingRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class OfferingDataService {
  private readonly api = inject(ApiService);

  listMine(): Observable<ServiceOffering[]> {
    return this.api.getArray<ServiceOffering>('/artists/salon/my-services');
  }

  updateMine(serviceId: string, req: UpdateOfferingRequest): Observable<ServiceOffering> {
    return this.api.put<ServiceOffering>(`/artists/salon/my-services/${serviceId}`, req);
  }

  listForMember(artistId: string): Observable<ServiceOffering[]> {
    return this.api.getArray<ServiceOffering>(`/artists/salon/members/${artistId}/services`);
  }

  updateForMember(artistId: string, serviceId: string, req: UpdateOfferingRequest): Observable<ServiceOffering> {
    return this.api.put<ServiceOffering>(`/artists/salon/members/${artistId}/services/${serviceId}`, req);
  }
}
