import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { ProductDataService } from '@bedge/shared';
import type { Order } from '@bedge/shared';

/**
 * Order placed - payment instructions.
 *
 * This screen's real job is not celebration, it is telling the customer how
 * to pay. Nothing has been paid at this point: the order sits in 'placed'
 * until the artist confirms an OMT or Whish transfer manually. Getting this
 * wrong means a customer thinks they are done and the order never
 * progresses.
 */
@Component({
  selector: 'app-order-confirmed-page',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './order-confirmed.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderConfirmedPage implements OnInit {
  private readonly productSvc = inject(ProductDataService);
  private readonly router = inject(Router);

  readonly artistId = input.required<string>();
  readonly orderId = input.required<string>();

  readonly loading = signal(true);
  readonly order = signal<Order | null>(null);
  readonly showDetails = signal(false);

  /** The four happy-path states, for the progress strip. Cancelled and
   *  returned deliberately are not shown here - this screen is only ever
   *  reached immediately after placing an order. */
  readonly steps = ['placed', 'confirmed', 'shipped', 'delivered'];

  ngOnInit(): void {
    // Guest orders are not readable without a session, so a failure here is
    // expected rather than exceptional. The order was already created; this
    // fetch only enriches the screen, so on failure it degrades to the
    // instructions without a total rather than showing an error.
    this.productSvc.getOrder(this.orderId()).subscribe({
      next: (o) => {
        this.order.set(o);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /** Orders are identified by UUID; the first 8 characters stand in as
   *  something a person can read out over the phone. */
  shortRef(): string {
    return this.orderId().slice(0, 8).toUpperCase();
  }

  itemCount(): number {
    return this.order()?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;
  }

  toggleDetails(): void {
    this.showDetails.update((v) => !v);
  }

  backToShop(): void {
    this.router.navigate(['/shop', this.artistId()]);
  }

  viewMyOrders(): void {
    this.router.navigate(['/my-orders']);
  }
}
