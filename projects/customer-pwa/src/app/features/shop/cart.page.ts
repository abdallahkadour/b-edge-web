import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import {
  ProductDataService,
  ArtistDataService,
  CartStore,
  extractApiErrorMessage,
  isValidLocalPhone,
} from '@bedge/shared';

/**
 * Cart and checkout.
 *
 * There is no payment step here by design: B-Edge has no payment gateway,
 * so an order is placed first and paid afterwards by OMT or Whish transfer,
 * which the artist confirms manually. The same model booking deposits
 * already use. The copy has to set that expectation clearly, or a customer
 * will sit waiting for a card form that never appears.
 */
@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './cart.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPage implements OnInit {
  private readonly productSvc = inject(ProductDataService);
  private readonly artistSvc = inject(ArtistDataService);
  private readonly router = inject(Router);
  protected readonly cart = inject(CartStore);

  readonly artistId = input.required<string>();

  readonly name = signal('');
  readonly phoneDigits = signal('');
  readonly deliveryNotes = signal('');
  readonly touched = signal(false);

  readonly placing = signal(false);
  readonly errorMessage = signal<string | null>(null);

  /** Resolved from the artist's stores, same as the catalogue screen. */
  private readonly salonId = signal<string | null>(null);

  ngOnInit(): void {
    this.artistSvc.getStoresByArtist(this.artistId()).subscribe({
      next: (stores) => this.salonId.set(stores?.[0]?.salon_id ?? null),
      error: () => this.salonId.set(null),
    });
  }

  protected isNameValid(): boolean {
    return this.name().trim().length >= 2;
  }

  protected isPhoneValid(): boolean {
    return isValidLocalPhone(this.phoneDigits());
  }

  protected canPlace(): boolean {
    return !this.cart.isEmpty() && this.isNameValid() && this.isPhoneValid() && !this.placing();
  }

  onPhoneInput(value: string): void {
    this.phoneDigits.set(value.replace(/\D/g, '').slice(0, 8));
  }

  goBack(): void {
    this.router.navigate(['/shop', this.artistId()]);
  }

  lineSubtotal(price: string, quantity: number): string {
    return (parseFloat(price) * quantity).toFixed(2);
  }

  placeOrder(): void {
    this.touched.set(true);
    if (!this.canPlace()) return;

    const salonId = this.salonId();
    if (!salonId) {
      this.errorMessage.set('Could not reach this artist\'s shop. Please try again.');
      return;
    }

    this.placing.set(true);
    this.errorMessage.set(null);

    this.productSvc
      .placeOrder({
        salon_id: salonId,
        name: this.name().trim(),
        // Bare local digits, no +961 prefix - matches how every other
        // phone in this app is stored, so a customer's orders and bookings
        // resolve to the same identity.
        phone: this.phoneDigits(),
        delivery_notes: this.deliveryNotes().trim() || undefined,
        items: this.cart.toOrderItems(),
      })
      .subscribe({
        next: (order) => {
          this.placing.set(false);
          this.cart.clear();
          this.router.navigate(['/shop', this.artistId(), 'confirmed', order.id]);
        },
        error: (err: HttpErrorResponse) => {
          this.placing.set(false);
          this.errorMessage.set(
            extractApiErrorMessage(err, 'Could not place your order. Please try again.'),
          );
        },
      });
  }
}
