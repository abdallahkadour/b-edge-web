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

import {
  ProductDataService,
  CustomerAuthStore,
  extractApiErrorMessage,
  ButtonComponent,
  BadgeComponent,
  CardComponent,
} from '@bedge/shared';
import type { BadgeTone } from '@bedge/shared';
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
  imports: [LucideAngularModule, ButtonComponent, BadgeComponent, CardComponent],
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

  /** Which single card, if any, has its detail section (items + status
   *  timeline) expanded. The list endpoint already returns full items and
   *  timestamps per order - there was no second request to make, the data
   *  was just never rendered anywhere past the one-line summary. */
  readonly expandedId = signal<string | null>(null);

  /** The happy-path progression a non-cancelled order moves through.
   *  Cancelled/returned orders render their own terminal state instead of
   *  a partially-filled stepper - same reasoning as order-confirmed.page's
   *  steps strip, which this mirrors. */
  private readonly HAPPY_PATH: OrderStatus[] = ['placed', 'confirmed', 'shipped', 'delivered'];
  readonly steps = this.HAPPY_PATH;

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

  /**
   * Maps an order status to a badge tone. Only the MAPPING lives here -
   * how a tone actually looks is owned by BadgeComponent, so "confirmed"
   * can never render green on one screen and grey on another.
   *
   * Note the previous version hardcoded '#16a34a' rather than using the
   * `success` token that already existed in tailwind.config.js.
   */
  statusTone(status: string): BadgeTone {
    switch (status) {
      case 'confirmed':
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'ink';
      case 'cancelled':
      case 'returned':
        return 'muted';
      default:
        return 'neutral';
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

  toggleExpand(orderId: string): void {
    this.expandedId.update((id) => (id === orderId ? null : orderId));
  }

  isTerminalNonDelivery(status: OrderStatus): boolean {
    return status === 'cancelled' || status === 'returned';
  }

  /** Index of the order's current step within HAPPY_PATH, for filling the
   *  stepper dots. Only meaningful when !isTerminalNonDelivery. */
  stepIndex(order: Order): number {
    return this.HAPPY_PATH.indexOf(order.status);
  }

  /** The timestamp to show under a given step, if that step has been
   *  reached - 'placed' always has created_at, the rest map 1:1 to the
   *  order's own *_at fields. */
  stepDate(order: Order, step: OrderStatus): string | undefined {
    switch (step) {
      case 'placed': return order.created_at;
      case 'confirmed': return order.confirmed_at;
      case 'shipped': return order.shipped_at;
      case 'delivered': return order.delivered_at;
      default: return undefined;
    }
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
