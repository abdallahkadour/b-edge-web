import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';

import { ProductDataService, extractApiErrorMessage } from '@bedge/shared';
import type { EnrichedOrder, OrderStatus } from '@bedge/shared';

type FilterTab = 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

/**
 * Orders — the artist's product fulfilment queue (PRD §13.2).
 *
 * The state machine is enforced server-side (each transition endpoint is
 * guarded on the current status), so this screen's job is to offer exactly
 * ONE correct next action per order and never present an illegal jump —
 * there is deliberately no way to mark something shipped before its payment
 * is confirmed.
 */
@Component({
  selector: 'bedge-orders',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit {
  private readonly productSvc = inject(ProductDataService);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly orders = signal<EnrichedOrder[]>([]);
  readonly activeTab = signal<FilterTab>('placed');

  /** Per-order in-flight flag, so one card's spinner doesn't freeze the rest. */
  readonly busyOrderId = signal<string | null>(null);

  // confirm-payment modal
  readonly modalOrder = signal<EnrichedOrder | null>(null);
  readonly paymentReference = signal('');
  readonly modalError = signal<string | null>(null);

  readonly tabs: { key: FilterTab; label: string }[] = [
    { key: 'placed', label: 'Needs payment' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  readonly displayed = computed(() => {
    const tab = this.activeTab();
    // 'cancelled' also surfaces 'returned' — both are terminal non-happy
    // outcomes, and a separate tab for a rare state isn't worth the noise.
    if (tab === 'cancelled') {
      return this.orders().filter((o) => o.status === 'cancelled' || o.status === 'returned');
    }
    return this.orders().filter((o) => o.status === tab);
  });

  readonly needsPaymentCount = computed(
    () => this.orders().filter((o) => o.status === 'placed').length,
  );

  ngOnInit(): void {
    this.load();
  }

  countFor(tab: FilterTab): number {
    if (tab === 'cancelled') {
      return this.orders().filter((o) => o.status === 'cancelled' || o.status === 'returned').length;
    }
    return this.orders().filter((o) => o.status === tab).length;
  }

  selectTab(tab: FilterTab): void {
    this.activeTab.set(tab);
  }

  statusLabel(status: OrderStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  statusClass(status: OrderStatus): string {
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

  /** Short display reference. Orders are identified by UUID — there is no
   *  separate order-number column — so the first 8 characters stand in as
   *  something a human can actually read out over the phone. */
  shortRef(id: string): string {
    return id.slice(0, 8).toUpperCase();
  }

  formatDate(iso: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Beirut',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(iso));
  }

  whatsAppLink(order: EnrichedOrder): string | null {
    if (!order.customer_phone) return null;
    const text = encodeURIComponent(
      `Hi ${order.customer_name}, about your B-Edge order #${this.shortRef(order.id)} —`,
    );
    return `https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=${text}`;
  }

  // ── Transitions ──────────────────────────────────────────────────────────

  openConfirmModal(order: EnrichedOrder): void {
    this.paymentReference.set('');
    this.modalError.set(null);
    this.modalOrder.set(order);
  }

  closeModal(): void {
    if (this.busyOrderId()) return;
    this.modalOrder.set(null);
  }

  confirmPayment(): void {
    const order = this.modalOrder();
    if (!order || this.busyOrderId()) return;

    this.busyOrderId.set(order.id);
    this.modalError.set(null);

    const ref = this.paymentReference().trim();
    this.productSvc.confirmOrderPayment(order.id, ref ? { reference: ref } : {}).subscribe({
      next: () => {
        this.busyOrderId.set(null);
        this.modalOrder.set(null);
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.busyOrderId.set(null);
        this.modalError.set(
          extractApiErrorMessage(err, 'Could not confirm payment. Please try again.'),
        );
      },
    });
  }

  markShipped(order: EnrichedOrder): void {
    this.transition(order, this.productSvc.shipOrder(order.id));
  }

  markDelivered(order: EnrichedOrder): void {
    this.transition(order, this.productSvc.deliverOrder(order.id));
  }

  private transition(order: EnrichedOrder, req$: ReturnType<ProductDataService['shipOrder']>): void {
    if (this.busyOrderId()) return;
    this.busyOrderId.set(order.id);
    this.errorMessage.set(null);

    req$.subscribe({
      next: () => {
        this.busyOrderId.set(null);
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.busyOrderId.set(null);
        this.errorMessage.set(
          extractApiErrorMessage(err, 'Could not update this order. Please try again.'),
        );
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    // Fetched unfiltered so every tab count is accurate — the API supports a
    // status filter, but filtering server-side would mean five requests to
    // populate five counts.
    this.productSvc.getSalonOrders().subscribe({
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
