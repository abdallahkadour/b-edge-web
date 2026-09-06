import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import type {
  CreateDiscountRequest,
  Discount,
  DiscountPreview,
  UpdateDiscountRequest,
} from '../models';

/**
 * Discount codes: management for artists, preview for customers.
 *
 * The preview lives on the BOOKING route rather than a discount one, because
 * the price being discounted is already computed and stored on the held row -
 * surcharge included. A preview endpoint that re-derived it would be a second
 * implementation of the pricing, free to disagree with the first.
 */
@Injectable({ providedIn: 'root' })
export class DiscountDataService {
  private readonly api = inject(ApiService);

  /** GET /artists/salon/discounts - the calling artist's codes, active first. */
  listMyDiscounts(): Observable<Discount[]> {
    return this.api.getArray<Discount>('/artists/salon/discounts');
  }

  /** POST /artists/salon/discounts. */
  createDiscount(req: CreateDiscountRequest): Observable<Discount> {
    return this.api.post<Discount>('/artists/salon/discounts', req);
  }

  /** PATCH /artists/salon/discounts/:id - edit or deactivate. */
  updateDiscount(id: string, req: UpdateDiscountRequest): Observable<Discount> {
    return this.api.patch<Discount>(`/artists/salon/discounts/${id}`, req);
  }

  /**
   * POST /bookings/:id/discount-preview - what would this code do?
   *
   * No auth: guest holds are public. A `valid: false` result arrives as a
   * normal 200 and must be rendered, not thrown - see DiscountPreview.
   */
  previewForBooking(bookingId: string, code: string): Observable<DiscountPreview> {
    return this.api.post<DiscountPreview>(`/bookings/${bookingId}/discount-preview`, { code });
  }
}
