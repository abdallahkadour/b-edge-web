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
import { NgOptimizedImage } from '@angular/common';
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
  DEFAULT_PHONE_ISO,
  PhoneInputComponent,
  isValidNationalPhone,
  toE164,
} from '@bedge/shared';
import type { PlaceOrderRequest } from '@bedge/shared';

/** A random v4 UUID. crypto.randomUUID exists only in secure contexts, so a
 *  phone testing over plain http on the LAN falls back to getRandomValues,
 *  which does not need one. */
function newRequestId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

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
  imports: [LucideAngularModule, ButtonComponent, InputDirective, LocationMapComponent, NgOptimizedImage,
    PhoneInputComponent,
  ],
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

  readonly phoneIso = signal(DEFAULT_PHONE_ISO);
  readonly deliveryNotes = signal('');
  /** Set only once the customer confirms a pin - null means "no location
   *  chosen yet", not "(0,0)", so canPlace() can tell the two apart. */
  readonly deliveryLocation = signal<{ lat: number; lng: number } | null>(null);
  readonly touched = signal(false);

  readonly placing = signal(false);
  readonly errorMessage = signal<string | null>(null);

  /** Resolved from the artist's stores, same as the catalogue screen. */
  private readonly salonId = signal<string | null>(null);

  /** The checkout this page is placing. A retry of the same order sends the
   *  same request_id, so a reply lost on a bad connection answers with the
   *  order already placed instead of placing a second one (the server keeps
   *  the id unique). Anything she changes makes it a new order. */
  private attempt: { body: string; requestId: string } | null = null;

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
    return isValidNationalPhone(this.phoneDigits(), this.phoneIso());
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

    const req: PlaceOrderRequest = {
      salon_id: salonId,
      name: this.name().trim(),
      // Bare local digits, no +961 prefix - matches how every other
      // phone in this app is stored, so a customer's orders and bookings
      // resolve to the same identity.
      phone: toE164(this.phoneDigits(), this.phoneIso()),
      delivery_lat: location.lat,
      delivery_lng: location.lng,
      delivery_notes: this.deliveryNotes().trim() || undefined,
      items: this.cart.toOrderItems(),
    };
    const body = JSON.stringify(req);
    if (this.attempt?.body !== body) {
      this.attempt = { body, requestId: newRequestId() };
    }

    this.productSvc
      .placeOrder({ ...req, request_id: this.attempt.requestId })
      .subscribe({
        next: (order) => {
          this.placing.set(false);
          this.attempt = null;
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
