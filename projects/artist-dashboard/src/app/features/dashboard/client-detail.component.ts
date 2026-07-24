import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { ClientDataService } from '@bedge/shared';
import type { ClientProfile } from '@bedge/shared';

/**
 * Client detail screen — shows one client's full profile, booking history,
 * and the artist's private notes. Notes can be edited inline and saved.
 */
@Component({
  selector: 'bedge-client-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './client-detail.component.html',
})
export class ClientDetailComponent implements OnInit {
  private readonly clientSvc = inject(ClientDataService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // ── State ─────────────────────────────────────────────────────────────────

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly saveSuccess = signal(false);
  readonly profile = signal<ClientProfile | null>(null);

  /** Note content bound to the textarea. */
  noteContent = '';

  /** True while the note textarea is being edited. */
  readonly editingNote = signal(false);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/dashboard/clients']);
      return;
    }
    this.load(id);
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  goBack(): void {
    this.router.navigate(['/dashboard/clients']);
  }

  startEditNote(): void {
    this.editingNote.set(true);
    this.saveSuccess.set(false);
  }

  cancelEditNote(): void {
    const p = this.profile();
    this.noteContent = p?.note ?? '';
    this.editingNote.set(false);
  }

  saveNote(): void {
    const p = this.profile();
    if (!p) return;

    this.saving.set(true);
    this.errorMessage.set(null);

    this.clientSvc.upsertNote(p.customer_id, { content: this.noteContent }).subscribe({
      next: (res) => {
        // Update note in profile signal
        this.profile.update((prev) =>
          prev ? { ...prev, note: res.content } : prev,
        );
        this.saving.set(false);
        this.editingNote.set(false);
        this.saveSuccess.set(true);
        // Auto-dismiss success after 3 seconds
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorMessage.set('Failed to save note. Please try again.');
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  formatMoney(value: string): string {
    const n = parseFloat(value) || 0;
    return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  formatRating(value?: string): string {
    if (!value) return '';
    const n = parseFloat(value);
    return isNaN(n) ? '' : `${n.toFixed(1)} ★`;
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (!parts[0]) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  statusClass(status: string): string {
    switch (status) {
      case 'completed':  return 'bg-gray-100 text-gray-600';
      case 'confirmed':  return 'bg-green-100 text-green-700';
      case 'cancelled':  return 'bg-red-100 text-red-700';
      case 'no_show':    return 'bg-red-100 text-red-700';
      case 'pending':    return 'bg-amber-100 text-amber-700';
      default:           return 'bg-gray-100 text-gray-500';
    }
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      completed: 'Completed', confirmed: 'Confirmed',
      cancelled: 'Cancelled', no_show: 'No show',
      pending: 'Pending', approved: 'Approved',
    };
    return labels[status] ?? status;
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private load(customerId: string): void {
    this.loading.set(true);
    this.clientSvc.getClient(customerId).subscribe({
      next: (data) => {
        this.profile.set(data);
        this.noteContent = data.note ?? '';
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 404
            ? 'Client not found.'
            : 'Failed to load client profile.',
        );
      },
    });
  }
}
