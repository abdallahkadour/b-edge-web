import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
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
  PRODUCT_CATEGORIES,
} from '@bedge/shared';
import type { Product, ProductCategory } from '@bedge/shared';

/**
 * Shop - a customer browsing an artist's product catalogue (PRD §13).
 *
 * Products are salon-scoped but customers reach an artist by handle or id,
 * and the public artist response does not carry salon_id. Rather than
 * change the API, this resolves it the way the booking funnel already
 * does: fetch the artist's stores (that endpoint accepts a handle and
 * returns salon_id), then fetch that salon's catalogue. Two requests, no
 * backend change.
 */
@Component({
  selector: 'app-shop-page',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './shop.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopPage implements OnInit {
  private readonly productSvc = inject(ProductDataService);
  private readonly artistSvc = inject(ArtistDataService);
  private readonly router = inject(Router);
  protected readonly cart = inject(CartStore);

  /** Artist UUID or handle, from the route. */
  readonly artistId = input.required<string>();

  readonly categories = PRODUCT_CATEGORIES;

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly products = signal<Product[]>([]);
  readonly selectedCategory = signal<ProductCategory | 'all'>('all');

  readonly displayed = computed(() => {
    const cat = this.selectedCategory();
    // The public endpoint already returns active products only, so no
    // is_active filtering is needed here.
    return cat === 'all'
      ? this.products()
      : this.products().filter((p) => p.category === cat);
  });

  ngOnInit(): void {
    this.load();
  }

  /** Categories are lowercase on the wire (DB CHECK constraint). */
  label(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  selectCategory(cat: ProductCategory | 'all'): void {
    this.selectedCategory.set(cat);
  }

  goBack(): void {
    this.router.navigate(['/book', this.artistId()]);
  }

  openCart(): void {
    this.router.navigate(['/shop', this.artistId(), 'cart']);
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.artistSvc.getStoresByArtist(this.artistId()).subscribe({
      next: (stores) => {
        const salonId = stores?.[0]?.salon_id;
        if (!salonId) {
          this.loading.set(false);
          this.errorMessage.set('This artist does not have a shop yet.');
          return;
        }
        this.productSvc.getSalonProducts(salonId).subscribe({
          next: (items) => {
            this.products.set(items ?? []);
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
            this.errorMessage.set('Could not load the shop. Please try again.');
          },
        });
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 404
            ? 'We could not find this artist.'
            : 'Could not load the shop. Please try again.',
        );
      },
    });
  }
}
