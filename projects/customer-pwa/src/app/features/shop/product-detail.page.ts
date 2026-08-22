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
  MediaDataService,
  CartStore,
  ButtonComponent,
  isSoldOut,
} from '@bedge/shared';
import type { Product } from '@bedge/shared';

/**
 * Product detail - the screen a customer reaches by tapping a product card
 * body on the Shop grid, rather than its + button.
 *
 * There is no single-product GET endpoint (only the salon-wide catalogue
 * list), so this resolves the same way Shop itself does - artist handle or
 * ID -> stores -> salon_id -> full catalogue - and finds the matching
 * product client-side, rather than adding a new backend endpoint for one
 * screen. Resolved independently of Shop's own already-fetched list
 * (rather than passed via router state) so a direct or bookmarked link to
 * a single product works exactly like every other deep link in this app,
 * not just in-app navigation from the grid.
 */
@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [LucideAngularModule, ButtonComponent],
  templateUrl: './product-detail.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPage implements OnInit {
  private readonly productSvc = inject(ProductDataService);
  private readonly artistSvc = inject(ArtistDataService);
  private readonly mediaSvc = inject(MediaDataService);
  private readonly router = inject(Router);
  protected readonly cart = inject(CartStore);

  /** Artist UUID or handle, from the route. */
  readonly artistId = input.required<string>();
  readonly productId = input.required<string>();

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly product = signal<Product | null>(null);

  /** Additional gallery photos beyond the product's own image_url. Loaded
   *  separately and non-critically - if this fails, the page still works
   *  with just the primary photo, so it never blocks or errors the page. */
  readonly galleryPhotoUrls = signal<string[]>([]);

  /** All photos to show in the carousel: the primary photo first (if any),
   *  then the gallery, in order. */
  readonly allPhotoUrls = computed(() => {
    const cover = this.product()?.image_url;
    return [...(cover ? [cover] : []), ...this.galleryPhotoUrls()];
  });

  readonly activePhotoIndex = signal(0);

  /** Exposed for the template - Angular templates can't call a bare
   *  imported function, only a component member. */
  protected readonly isSoldOut = isSoldOut;

  ngOnInit(): void {
    this.load();
  }

  goBack(): void {
    this.router.navigate(['/shop', this.artistId()]);
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
            this.loading.set(false);
            const match = (items ?? []).find((p) => p.id === this.productId());
            if (!match) {
              this.errorMessage.set('We could not find this product.');
              return;
            }
            this.product.set(match);
            // Same reconcile-on-load as Shop and Cart, so a cart line
            // started here survives a refresh with today's price.
            this.cart.reconcile(items ?? []);
            this.loadGallery();
          },
          error: () => {
            this.loading.set(false);
            this.errorMessage.set('Could not load this product. Please try again.');
          },
        });
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 404
            ? 'We could not find this artist.'
            : 'Could not load this product. Please try again.',
        );
      },
    });
  }

  /** Categories are lowercase on the wire (DB CHECK constraint). */
  label(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  /** Updates the dot indicator as the carousel is swiped - purely visual,
   *  never touches loading/error state. */
  onCarouselScroll(event: Event): void {
    const el = event.target as HTMLElement;
    if (el.clientWidth === 0) return;
    this.activePhotoIndex.set(Math.round(el.scrollLeft / el.clientWidth));
  }

  private loadGallery(): void {
    this.mediaSvc.getProductPhotos(this.productId()).subscribe({
      next: (gallery) => {
        this.galleryPhotoUrls.set((gallery.photos ?? []).map((p) => p.url));
      },
      // Non-critical - the primary photo alone is still a working page.
      error: () => this.galleryPhotoUrls.set([]),
    });
  }
}
