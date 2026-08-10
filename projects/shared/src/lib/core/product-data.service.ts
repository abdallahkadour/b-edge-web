import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  Order,
  EnrichedOrder,
  PlaceOrderRequest,
  ConfirmOrderPaymentRequest,
  CancelOrderRequest,
} from '../models';

/**
 * Data-access for the Product Store domain (PRD §13).
 * Thin wrappers over ApiService - one method per endpoint.
 */
@Injectable({ providedIn: 'root' })
export class ProductDataService {
  private readonly api = inject(ApiService);

  // ── Catalogue (artist) ─────────────────────────────────────────────────

  /**
   * GET /artists/products - the artist's own catalogue, INCLUDING inactive
   * products (they need to see them to reactivate them). The public
   * endpoint below returns active only.
   */
  getMyProducts(): Observable<Product[]> {
    return this.api.getArray<Product>('/artists/salon/products');
  }

  createProduct(req: CreateProductRequest): Observable<Product> {
    return this.api.post<Product>('/artists/salon/products', req);
  }

  /** Partial update - only the fields present are changed. */
  updateProduct(id: string, req: UpdateProductRequest): Observable<Product> {
    return this.api.patch<Product>(`/artists/salon/products/${id}`, req);
  }

  // ── Catalogue (public) ─────────────────────────────────────────────────

  /** GET /salons/:id/products - active products only. Public, no auth. */
  getSalonProducts(salonId: string): Observable<Product[]> {
    return this.api.getArray<Product>(`/salons/${salonId}/products`);
  }

  // ── Orders ─────────────────────────────────────────────────────────────

  /** POST /orders - public, guest-friendly. Identity resolved by phone. */
  placeOrder(req: PlaceOrderRequest): Observable<Order> {
    return this.api.post<Order>('/orders', req);
  }

  /** GET /orders/me - the authenticated customer's own order history. */
  getMyOrders(): Observable<Order[]> {
    return this.api.getArray<Order>('/orders/me');
  }

  getOrder(id: string): Observable<Order> {
    return this.api.get<Order>(`/orders/${id}`);
  }

  /**
   * GET /artists/orders - the artist's fulfilment queue, enriched with
   * customer name/phone. Optional status filter.
   */
  getSalonOrders(status?: string): Observable<EnrichedOrder[]> {
    const path = status ? `/artists/salon/orders?status=${status}` : '/artists/salon/orders';
    return this.api.getArray<EnrichedOrder>(path);
  }

  /**
   * PATCH /artists/orders/:id/confirm-payment - 'placed' → 'confirmed'.
   * The manual "I checked my OMT/Whish account and the money's there"
   * action; there is no payment gateway.
   */
  confirmOrderPayment(id: string, req: ConfirmOrderPaymentRequest = {}): Observable<Order> {
    return this.api.patch<Order>(`/artists/salon/orders/${id}/confirm-payment`, req);
  }

  /** PATCH /artists/orders/:id/ship - 'confirmed' → 'shipped'. */
  shipOrder(id: string): Observable<Order> {
    return this.api.patch<Order>(`/artists/salon/orders/${id}/ship`, {});
  }

  /** PATCH /artists/orders/:id/deliver - 'shipped' → 'delivered'. */
  deliverOrder(id: string): Observable<Order> {
    return this.api.patch<Order>(`/artists/salon/orders/${id}/deliver`, {});
  }

  /**
   * PATCH /orders/:id/cancel - works for either the order's own customer or
   * the salon that owns it. Only permitted from 'placed' or 'confirmed';
   * once shipped, 'returned' is the separate outcome.
   */
  cancelOrder(id: string, req: CancelOrderRequest = {}): Observable<Order> {
    return this.api.patch<Order>(`/orders/${id}/cancel`, req);
  }
}
