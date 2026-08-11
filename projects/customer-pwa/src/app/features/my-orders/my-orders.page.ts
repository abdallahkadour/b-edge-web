import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { ProductDataService, CustomerAuthStore, extractApiErrorMessage } from '@bedge/shared';
import type { Order, OrderStatus } from '@bedge/shared';

type FilterTab = 'active' | 'delivered' | 'cancelled';

const ACTIVE_STATUSES = new Set<OrderStatus>(['placed', 'confirmed', 'shipped']);
const CANCELLED_STATUSES = new Set<OrderStatus>(['cancelled', 'returned']);

/** An order can be cancelled from 'placed' or 'confirmed' only, mirroring
 *  the backend's own cancellableOrderStatuses exactly - once shipped, a
 *  physical item is in transit; 'returned' is PRD §13.2's separate outcome
 *  for that case, not a retroactive cancel. */
const CANCELLABLE_STATUSES = new Set<OrderStatus>(['placed', 'confirmed']);

/**
 * My Orders - a logged-in customer's product order history. The direct
 * parallel to My Bookings, for the Product Store side of the app.
 */
@Component({
  selector: 'app-my-orders-page',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './my-orders.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyOrdersPage implements OnInit {
  private readonly productSvc = inject(ProductDataService);
  protected readonly auth = inject(CustomerAuthStore);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly orders = signal<Order[]>([]);
  readonly activeTab = signal<FilterTab>('active');

  // Cancel confirmation is an inline "are you sure?" row within the card
  // itself, not a bottom sheet and not a native confirm() - a sheet would
  // be empty chrome here (unlike a booking cancel, there is no
  // refund-window preview to show; deposits are a booking concept, not a
  // product-order one), and a native browser dialog would be the only
  // place in the whole app that looks like it. confirmingId tracks which
  // single card, if any, is showing its confirm row.
  readonly confirmingId = signal<string | null>(null);
  readonly cancellingId = signal<string | null>(null);
  readonly cancelError = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  selectTab(tab: FilterTab): void {
    this.activeTab.set(tab);
  }

  private statusesFor(tab: FilterTab): Set<OrderStatus> {
    if (tab === 'delivered') return new Set(['delivered']);
    return tab === 'active' ? ACTIVE_STATUSES : CANCELLED_STATUSES;
  }

  filteredOrders(): Order[] {
    const set = this.statusesFor(this.activeTab());
    return this.orders().filter((o) => set.has(o.status));
  }

  countFor(tab: FilterTab): number {
    const set = this.statusesFor(tab);
    return this.orders().filter((o) => set.has(o.status)).length;
  }

  canCancel(order: Order): boolean {
    return CANCELLABLE_STATUSES.has(order.status);
  }

  statusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  statusClass(status: string): string {
    switch (status) {
      case 'confirmed':
      case 'delivered':
        return 'bg-[#16a34a]/10 text-[#16a34a]';
      case 'shipped':
        return 'bg-ink/10 text-ink';
      case 'cancelled':
      case 'returned':
        return 'bg-gray-100 text-gray-400';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  itemSummary(order: Order): string {
    return order.items.map((i) => `${i.product_name} \u00d7${i.quantity}`).join(', ');
  }

  formatDate(iso: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Beirut',
      day: 'numeric', month: 'short', year: 'numeric',
    }).format(new Date(iso));
  }

  shortRef(id: string): string {
    return id.slice(0, 8).toUpperCase();
  }

  askToCancel(orderId: string): void {
    this.cancelError.set(null);
    this.confirmingId.set(orderId);
  }

  dismissCancel(): void {
    this.confirmingId.set(null);
  }

  confirmCancel(order: Order): void {
    if (this.cancellingId()) return;

    this.cancellingId.set(order.id);
    this.cancelError.set(null);

    this.productSvc.cancelOrder(order.id).subscribe({
      next: () => {
        this.cancellingId.set(null);
        this.confirmingId.set(null);
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.cancellingId.set(null);
        this.cancelError.set(extractApiErrorMessage(err, 'Could not cancel this order.'));
      },
    });
  }

  goToBookings(): void {
    this.router.navigateByUrl('/my-bookings');
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: () => this.router.navigateByUrl('/'),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.productSvc.getMyOrders().subscribe({
      next: (items) => {
        this.orders.set(items ?? []);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 0 ? 'Cannot reach the server.' : 'Failed to load your orders.',
        );
      },
    });
  }
}
