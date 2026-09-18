import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import type {
  PublicPaymentMethod,
  SalonPaymentMethod,
  UpsertPaymentMethodRequest,
} from '../models';

/**
 * Where a salon's money should be sent.
 *
 * The public read is salon-scoped and separate from the artist profile on
 * purpose: the profile is fetched during discovery, so carrying payment
 * destinations on it would publish every artist's account number to anything
 * that paginates the marketplace. This is called only at the point a client
 * is about to pay.
 */
@Injectable({ providedIn: 'root' })
export class PayoutDataService {
  private readonly api = inject(ApiService);

  /** GET /artists/salon/payment-methods - own destinations, retired included. */
  listMine(): Observable<SalonPaymentMethod[]> {
    return this.api.getArray<SalonPaymentMethod>('/artists/salon/payment-methods');
  }

  /**
   * PUT /artists/salon/payment-methods - add or change one.
   *
   * A salon holds at most one account per method, so this is an upsert:
   * "add my Whish number" and "change my Whish number" are the same operation
   * from the artist's side.
   */
  upsert(req: UpsertPaymentMethodRequest): Observable<SalonPaymentMethod> {
    return this.api.put<SalonPaymentMethod>('/artists/salon/payment-methods', req);
  }

  /** PATCH /artists/salon/payment-methods/:id - retire or restore. */
  setActive(id: string, isActive: boolean): Observable<SalonPaymentMethod> {
    return this.api.patch<SalonPaymentMethod>(
      `/artists/salon/payment-methods/${id}`,
      { is_active: isActive },
    );
  }

  /** GET /salons/:id/payment-methods - what a paying client is shown. */
  listForSalon(salonId: string): Observable<PublicPaymentMethod[]> {
    return this.api.getArray<PublicPaymentMethod>(`/salons/${salonId}/payment-methods`);
  }
}
