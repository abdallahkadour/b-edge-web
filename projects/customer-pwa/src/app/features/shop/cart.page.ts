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
  ButtonComponent,
  CartStore,
  InputDirective,
  LocationMapComponent,
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
  imports: [LucideAngularModule, ButtonComponent, InputDirective, LocationMapComponent],
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
  /** Set only once the customer confirms a pin - null means "no location
   *  chosen yet", not "(0,0)", so canPlace() can tell the two apart. */
  readonly deliveryLocation = signal<{ lat: number; lng: number } | null>(null);
  readonly touched = signal(false);

  readonly placing = signal(false);
  readonly errorMessage = signal<string | null>(null);

  /** Resolved from the artist's stores, same as the catalogue screen. */
  private readonly salonId = signal<string | null>(null);

  ngOnInit(): void {
    this.artistSvc.getStoresByArtist(this.artistId()).subscribe({
      next: (stores) => {
        const salonId = stores?.[0]?.salon_id ?? null;
        this.salonId.set(salonId);

        // This page can be reached directly - a bookmarked cart URL, or a
        // browser restoring the tab after being backgrounded - without
        // ever having passed through the shop catalogue first. If the
        // cart currently only holds lines persisted from a previous
        // session, reconcile them here too, using this salon's live
        // product data. A no-op if the cart is already populated or empty.
        if (salonId) {
          this.productSvc.getSalonProducts(salonId).subscribe({
            next: (items) => this.cart.reconcile(items ?? []),
            error: () => {}, // best-effort - checkout still works either way
          });
        }
      },
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
    return (
      !this.cart.isEmpty() &&
      this.isNameValid() &&
      this.isPhoneValid() &&
      this.deliveryLocation() !== null &&
      !this.placing()
    );
  }

  onPhoneInput(value: string): void {
    this.phoneDigits.set(value.replace(/\D/g, '').slice(0, 8));
  }

  onLocationConfirmed(location: { lat: number; lng: number }): void {
    this.deliveryLocation.set(location);
  }

  changeLocation(): void {
    this.deliveryLocation.set(null);
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

    const location = this.deliveryLocation();
    if (!location) return; // canPlace() already gates this - defensive only

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
        delivery_lat: location.lat,
        delivery_lng: location.lng,
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
