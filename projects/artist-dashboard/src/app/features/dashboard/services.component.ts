import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import {
  ArtistDataService,
  BadgeComponent,
  ButtonComponent,
  InputDirective,
  extractApiErrorMessage,
} from '@bedge/shared';
import type { Service, CreateServiceRequest, UpdateServiceRequest } from '@bedge/shared';

/** Shape of the add/edit form. */
interface ServiceForm {
  name: string;
  price: string;
  duration_min: number;
  deposit_amount: string;
  description: string;
}

const emptyForm = (): ServiceForm => ({
  name: '', price: '', duration_min: 60, deposit_amount: '0', description: '',
});

/**
 * Services screen — CRUD for the salon service catalogue.
 * Lists services, inline edit, add new, deactivate.
 */
@Component({
  selector: 'bedge-services',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, BadgeComponent, InputDirective],
  templateUrl: './services.component.html',
})
export class ServicesComponent implements OnInit {
  private readonly artistSvc: ArtistDataService = inject(ArtistDataService);

  // ── State ─────────────────────────────────────────────────────────────────

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly services = signal<Service[]>([]);

  readonly showAddForm = signal(false);
  readonly creating = signal(false);
  readonly addError = signal<string | null>(null);
  readonly addForm = signal<ServiceForm>(emptyForm());

  readonly editingId = signal<string | null>(null);
  readonly editForm = signal<ServiceForm>(emptyForm());
  readonly updating = signal(false);
  readonly updateErrors = signal<Record<string, string>>({});

  readonly deletingId = signal<string | null>(null);

  // ── Computed helpers ──────────────────────────────────────────────────────

  canCreate(): boolean {
    const f = this.addForm();
    return f.name.trim().length >= 2 && parseFloat(f.price) >= 0 && f.duration_min >= 15;
  }

  depositSummary(svc: Service): string {
    const d = parseFloat(svc.deposit_amount);
    return d > 0 ? `$${svc.deposit_amount} deposit` : 'No deposit';
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void { this.load(); }

  // ── Add service ───────────────────────────────────────────────────────────

  toggleAddForm(): void {
    this.showAddForm.update((v) => !v);
    this.addForm.set(emptyForm());
    this.addError.set(null);
  }

  createService(): void {
    if (!this.canCreate()) return;
    const f = this.addForm();
    this.creating.set(true);
    this.addError.set(null);

    const req: CreateServiceRequest = {
      name: f.name.trim(),
      price: f.price,
      duration_min: f.duration_min,
      deposit_amount: f.deposit_amount || '0',
      deposit_deadline_hours: 24,
      description: f.description.trim() || undefined,
    };

    this.artistSvc.createService(req).subscribe({
      next: (svc) => {
        this.services.update((list) => [svc, ...list]);
        this.creating.set(false);
        this.showAddForm.set(false);
        this.addForm.set(emptyForm());
      },
      error: (err: HttpErrorResponse) => {
        this.creating.set(false);
        this.addError.set(
          extractApiErrorMessage(err, 'Failed to create service. Check the values and try again.'),
        );
      },
    });
  }

  // ── Edit service ──────────────────────────────────────────────────────────

  startEdit(svc: Service): void {
    this.editingId.set(svc.id);
    this.editForm.set({
      name: svc.name,
      price: svc.price,
      duration_min: svc.duration_min,
      deposit_amount: svc.deposit_amount,
      description: svc.description ?? '',
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(svc: Service): void {
    const f = this.editForm();
    this.updating.set(true);

    const req: UpdateServiceRequest = {
      name: f.name.trim(),
      price: f.price,
      duration_min: f.duration_min,
      deposit_amount: f.deposit_amount,
      description: f.description.trim() || undefined,
    };

    this.artistSvc.updateService(svc.id, req).subscribe({
      next: (updated) => {
        this.services.update((list) =>
          list.map((s) => (s.id === updated.id ? updated : s)),
        );
        this.updating.set(false);
        this.editingId.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.updating.set(false);
        this.updateErrors.update((e) => ({
          ...e,
          [svc.id]: extractApiErrorMessage(err, 'Failed to save. Try again.'),
        }));
      },
    });
  }

  // ── Delete (deactivate) ───────────────────────────────────────────────────

  deleteService(svc: Service): void {
    this.deletingId.set(svc.id);
    this.artistSvc.deleteService(svc.id).subscribe({
      next: () => {
        this.services.update((list) =>
          list.map((s) => (s.id === svc.id ? { ...s, is_active: false } : s)),
        );
        this.deletingId.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.deletingId.set(null);
        this.updateErrors.update((e) => ({
          ...e,
          [svc.id]: extractApiErrorMessage(err, 'Failed to deactivate.'),
        }));
      },
    });
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.artistSvc.getServicesBySalon().subscribe({
      next: (data: Service[]) => {
        this.services.set(data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load services. Please try again.');
      },
    });
  }
}
