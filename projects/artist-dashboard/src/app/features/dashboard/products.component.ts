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

import {
  ProductDataService,
  CloudinaryUploadService,
  PRODUCT_CATEGORIES,
  extractApiErrorMessage,
} from '@bedge/shared';
import type { Product, ProductCategory } from '@bedge/shared';

/** The form's working state. Price is a string throughout — it's a string on
 *  the wire (decimal.Decimal) and a string in the input; converting to number
 *  and back would only risk float artefacts on money. */
interface ProductForm {
  name: string;
  category: ProductCategory;
  price: string;
  imageUrl: string;
  description: string;
  isActive: boolean;
}

const EMPTY_FORM: ProductForm = {
  name: '',
  category: 'makeup',
  price: '',
  imageUrl: '',
  description: '',
  isActive: true,
};

/**
 * Products — the artist's sellable catalogue (PRD §13.1).
 *
 * Deliberately shows INACTIVE products behind a toggle rather than hiding
 * them outright: deactivating is how an artist takes something off sale, so
 * they need a way back to it. The public customer endpoint returns active
 * products only.
 */
@Component({
  selector: 'bedge-products',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit {
  private readonly productSvc = inject(ProductDataService);
  // Uploads go browser → Cloudinary directly; only the resulting URL is ever
  // sent to our backend. Reuses the exact service the portfolio uploader
  // already uses — no backend change was needed for product images, since
  // products.image_url is just a string.
  private readonly cloudinary = inject(CloudinaryUploadService);

  readonly categories = PRODUCT_CATEGORIES;

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly products = signal<Product[]>([]);

  readonly selectedCategory = signal<ProductCategory | 'all'>('all');
  readonly showInactive = signal(false);

  // modal state
  readonly modalOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly form = signal<ProductForm>({ ...EMPTY_FORM });
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly uploading = signal(false);

  readonly displayed = computed(() => {
    const cat = this.selectedCategory();
    const includeInactive = this.showInactive();
    return this.products().filter(
      (p) => (cat === 'all' || p.category === cat) && (includeInactive || p.is_active),
    );
  });

  ngOnInit(): void {
    this.load();
  }

  /** Categories are lowercase on the wire (DB CHECK constraint); capitalise
   *  for display only. */
  label(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  selectCategory(cat: ProductCategory | 'all'): void {
    this.selectedCategory.set(cat);
  }

  toggleShowInactive(): void {
    this.showInactive.update((v) => !v);
  }

  openAdd(): void {
    this.editingId.set(null);
    this.form.set({ ...EMPTY_FORM });
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  openEdit(p: Product): void {
    this.editingId.set(p.id);
    this.form.set({
      name: p.name,
      category: p.category ?? 'makeup',
      price: p.price,
      imageUrl: p.image_url ?? '',
      description: p.description ?? '',
      isActive: p.is_active,
    });
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    if (this.saving()) return;
    this.modalOpen.set(false);
  }

  patchForm<K extends keyof ProductForm>(key: K, value: ProductForm[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  /** Handles a file picked from the hidden <input type="file">. */
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Reset the input so picking the SAME file again still fires a change
    // event — otherwise a failed upload can't be retried without choosing a
    // different file first.
    input.value = '';

    if (!file.type.startsWith('image/')) {
      this.formError.set('That file is not an image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.formError.set('That image is larger than 10MB. Please choose a smaller one.');
      return;
    }

    this.uploading.set(true);
    this.formError.set(null);

    this.cloudinary.upload(file).subscribe({
      next: (result) => {
        this.uploading.set(false);
        this.patchForm('imageUrl', result.url);
      },
      error: () => {
        this.uploading.set(false);
        this.formError.set('Could not upload that image. Please try again.');
      },
    });
  }

  clearImage(): void {
    this.patchForm('imageUrl', '');
  }

  isFormValid(): boolean {
    const f = this.form();
    return f.name.trim().length >= 2 && /^\d+(\.\d{1,2})?$/.test(f.price.trim());
  }

  save(): void {
    if (!this.isFormValid() || this.saving()) return;

    const f = this.form();
    this.saving.set(true);
    this.formError.set(null);

    const body = {
      name: f.name.trim(),
      category: f.category,
      price: f.price.trim(),
      description: f.description.trim() || undefined,
      image_url: f.imageUrl.trim() || undefined,
    };

    const id = this.editingId();
    const req$ = id
      ? this.productSvc.updateProduct(id, { ...body, is_active: f.isActive })
      : this.productSvc.createProduct(body);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.modalOpen.set(false);
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.formError.set(extractApiErrorMessage(err, 'Could not save this product. Please try again.'));
      },
    });
  }

  /** Deactivating is a normal "take it off sale" action, not a delete —
   *  there is no delete endpoint, deliberately, since an inactive product
   *  must stay resolvable from historical order lines. */
  toggleActive(p: Product): void {
    this.productSvc.updateProduct(p.id, { is_active: !p.is_active }).subscribe({
      next: () => this.load(),
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(extractApiErrorMessage(err, 'Could not update this product.'));
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.productSvc.getMyProducts().subscribe({
      next: (items) => {
        this.products.set(items ?? []);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 0 ? 'Cannot reach the server.' : 'Failed to load your products.',
        );
      },
    });
  }
}
