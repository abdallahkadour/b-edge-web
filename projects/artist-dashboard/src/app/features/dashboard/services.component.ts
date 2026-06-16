import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ArtistDataService } from '@bedge/shared';
import type {
  Service,
  CreateServiceRequest,
  UpdateServiceRequest,
} from '@bedge/shared';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default deposit deadline hours used when creating or updating a service.
 * Hidden from the UI to keep the form simple — editable in a future iteration.
 */
const DEFAULT_DEPOSIT_DEADLINE_HOURS = 24;

// ─────────────────────────────────────────────────────────────────────────────
// Local types
// ─────────────────────────────────────────────────────────────────────────────

/** Mutable form state shared by both the create and inline-edit forms. */
interface ServiceForm {
  name: string;
  price: string;
  duration_min: number | null;
  deposit_amount: string;
  description: string;
}

/** Returns a blank ServiceForm. */
function emptyForm(): ServiceForm {
  return {
    name: '',
    price: '',
    duration_min: null,
    deposit_amount: '0.00',
    description: '',
  };
}

/** Populate a ServiceForm from an existing Service for inline editing. */
function formFromService(svc: Service): ServiceForm {
  return {
    name: svc.name,
    price: svc.price,
    duration_min: svc.duration_min,
    deposit_amount: svc.deposit_amount,
    description: svc.description ?? '',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Services screen for the artist dashboard.
 *
 * Displays all services for the authenticated artist's salon. Active services
 * are shown at full opacity; inactive (soft-deleted) services are dimmed.
 *
 * Editing is inline — clicking "Edit" on a row expands it into a form in place,
 * avoiding modals. The "Add service" form sits below the list and is toggled
 * by the "+ Add service" button in the page header.
 *
 * Money fields (price, deposit_amount) are stored as decimal strings per the
 * B-Edge API contract — the component keeps them as strings throughout and
 * never parses them to floats to avoid rounding issues.
 */
@Component({
  selector: 'bedge-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './services.component.html',
})
export class ServicesComponent implements OnInit {
  private readonly artistService = inject(ArtistDataService);

  // ── List state ────────────────────────────────────────────────────────────

  /** All services for the salon, including inactive ones. */
  readonly services = signal<Service[]>([]);

  /** True while the initial list is loading. */
  readonly loading = signal(true);

  /** Top-level error shown when the list fails to load. */
  readonly error = signal<string | null>(null);

  // ── Inline edit state ────────────────────────────────────────────────────

  /** ID of the service currently open for inline editing, or null. */
  readonly editingId = signal<string | null>(null);

  /** Form data for the currently editing service row. */
  readonly editForm = signal<ServiceForm>(emptyForm());

  /** True while an update request is in flight. */
  readonly updating = signal(false);

  /** Per-row save error keyed by service ID. */
  readonly updateErrors = signal<Record<string, string>>({});

  /** ID of the service currently being deleted (for per-row loading state). */
  readonly deletingId = signal<string | null>(null);

  // ── Add service form state ────────────────────────────────────────────────

  /** Whether the add-service form is expanded. */
  readonly showAddForm = signal(false);

  /** Form data for the new service being created. */
  readonly addForm = signal<ServiceForm>(emptyForm());

  /** True while a create request is in flight. */
  readonly creating = signal(false);

  /** Error shown below the add-service form. */
  readonly addError = signal<string | null>(null);

  // ── Computed ─────────────────────────────────────────────────────────────

  /** True only when all required add-form fields are filled. */
  readonly canCreate = computed(() => {
    const f = this.addForm();
    return (
      f.name.trim().length >= 2 &&
      f.price.trim().length > 0 &&
      f.duration_min !== null &&
      f.duration_min >= 15
    );
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadServices();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // List actions
  // ─────────────────────────────────────────────────────────────────────────

  /** Open the inline edit form for a service row. */
  startEdit(svc: Service): void {
    this.editingId.set(svc.id);
    this.editForm.set(formFromService(svc));
    this.clearUpdateError(svc.id);
  }

  /** Cancel inline editing without saving. */
  cancelEdit(): void {
    this.editingId.set(null);
    this.editForm.set(emptyForm());
  }

  /** Submit the inline edit form for the currently editing service. */
  saveEdit(svc: Service): void {
    const f = this.editForm();
    this.updating.set(true);
    this.clearUpdateError(svc.id);

    const req: UpdateServiceRequest = {
      name: f.name.trim(),
      description: f.description.trim() || undefined,
      duration_min: f.duration_min ?? svc.duration_min,
      price: f.price.trim(),
      deposit_amount: f.deposit_amount.trim(),
      deposit_deadline_hours: DEFAULT_DEPOSIT_DEADLINE_HOURS,
    };

    this.artistService.updateService(svc.id, req).subscribe({
      next: (updated) => {
        this.services.update((list) =>
          list.map((s) => (s.id === updated.id ? updated : s)),
        );
        this.updating.set(false);
        this.editingId.set(null);
        this.editForm.set(emptyForm());
      },
      error: () => {
        this.updating.set(false);
        this.setUpdateError(svc.id, 'Could not save changes. Try again.');
      },
    });
  }

  /**
   * Deactivate a service (soft delete via DELETE endpoint).
   * The service remains in the list marked inactive — it is never removed
   * from the client's view so the artist can see their full catalogue history.
   */
  deleteService(svc: Service): void {
    if (this.deletingId() === svc.id) return;
    this.deletingId.set(svc.id);

    this.artistService.deleteService(svc.id).subscribe({
      next: () => {
        // Mark as inactive in the local list — avoids a full reload.
        this.services.update((list) =>
          list.map((s) =>
            s.id === svc.id ? { ...s, is_active: false } : s,
          ),
        );
        this.deletingId.set(null);
      },
      error: () => {
        this.deletingId.set(null);
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Add form
  // ─────────────────────────────────────────────────────────────────────────

  /** Toggle the add-service form and reset it when closing. */
  toggleAddForm(): void {
    const next = !this.showAddForm();
    this.showAddForm.set(next);
    if (!next) {
      this.addForm.set(emptyForm());
      this.addError.set(null);
    }
  }

  /** Submit the add-service form. */
  createService(): void {
    if (!this.canCreate()) return;

    const f = this.addForm();
    this.creating.set(true);
    this.addError.set(null);

    const req: CreateServiceRequest = {
      name: f.name.trim(),
      description: f.description.trim() || undefined,
      duration_min: f.duration_min!,
      price: f.price.trim(),
      deposit_amount: f.deposit_amount.trim(),
      deposit_deadline_hours: DEFAULT_DEPOSIT_DEADLINE_HOURS,
    };

    this.artistService.createService(req).subscribe({
      next: (created) => {
        // Prepend to the list so it appears at the top immediately.
        this.services.update((list) => [created, ...list]);
        this.creating.set(false);
        this.showAddForm.set(false);
        this.addForm.set(emptyForm());
      },
      error: () => {
        this.creating.set(false);
        this.addError.set('Could not create service. Try again.');
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Display helpers
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Format the deposit summary line shown on each service card.
   * Shows "no deposit" when deposit_amount is zero.
   */
  depositSummary(svc: Service): string {
    const amount = parseFloat(svc.deposit_amount);
    if (!amount || amount <= 0) return 'no deposit';
    return `deposit $${svc.deposit_amount}`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────────────

  private loadServices(): void {
    this.loading.set(true);
    this.error.set(null);

    this.artistService.getServicesBySalon().subscribe({
      next: (services) => {
        // Guard against null — Go serializes empty slices as null, not [].
        const list = services ?? [];
        // Active services first, then inactive.
        const sorted = [
          ...list.filter((s) => s.is_active),
          ...list.filter((s) => !s.is_active),
        ];
        this.services.set(sorted);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load services. Please refresh.');
        this.loading.set(false);
      },
    });
  }

  private setUpdateError(serviceId: string, msg: string): void {
    this.updateErrors.update((errs) => ({ ...errs, [serviceId]: msg }));
  }

  private clearUpdateError(serviceId: string): void {
    this.updateErrors.update((errs) => {
      const copy = { ...errs };
      delete copy[serviceId];
      return copy;
    });
  }
}