import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import {
  AdminDataService,
  AuthStore,
  ButtonComponent,
  InputDirective,
  extractApiErrorMessage,
} from '@bedge/shared';
import type { PendingArtist } from '@bedge/shared';

/**
 * Admin review queue - the only screen an admin account sees.
 *
 * Deliberately a single flat page, not a dashboard shell with a sidebar.
 * At most two admin accounts will ever exist (see cmd/seedadmin), and
 * their entire job here is one decision, repeated: does this application
 * go live. A 13-item sidebar built for artists running their own business
 * would be actively wrong chrome for that.
 */
@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [LucideAngularModule, ButtonComponent, InputDirective],
  templateUrl: './admin.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPage implements OnInit {
  private readonly adminSvc = inject(AdminDataService);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly pending = signal<PendingArtist[]>([]);

  /** Per-artist in-flight flag, so approving one card doesn't disable the
   *  whole list. */
  readonly busyId = signal<string | null>(null);

  // Reject confirmation, inline on the card - matching the pattern used
  // for order and portfolio-photo cancellation elsewhere in this app,
  // rather than a native confirm() dialog.
  readonly confirmingRejectId = signal<string | null>(null);
  readonly rejectReason = signal('');

  ngOnInit(): void {
    this.load();
  }

  formatDate(iso: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Beirut',
      day: 'numeric', month: 'short', year: 'numeric',
    }).format(new Date(iso));
  }

  approve(artist: PendingArtist): void {
    if (this.busyId()) return;
    this.busyId.set(artist.artist_id);
    this.errorMessage.set(null);

    this.adminSvc.approveArtist(artist.artist_id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.busyId.set(null);
        this.errorMessage.set(extractApiErrorMessage(err, 'Could not approve this artist.'));
      },
    });
  }

  askToReject(artistId: string): void {
    this.rejectReason.set('');
    this.confirmingRejectId.set(artistId);
  }

  cancelReject(): void {
    this.confirmingRejectId.set(null);
  }

  confirmReject(artist: PendingArtist): void {
    if (this.busyId()) return;
    this.busyId.set(artist.artist_id);
    this.errorMessage.set(null);

    const reason = this.rejectReason().trim();
    this.adminSvc.rejectArtist(artist.artist_id, reason ? { reason } : {}).subscribe({
      next: () => {
        this.busyId.set(null);
        this.confirmingRejectId.set(null);
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.busyId.set(null);
        this.errorMessage.set(extractApiErrorMessage(err, 'Could not reject this artist.'));
      },
    });
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login'),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.adminSvc.getPendingArtists().subscribe({
      next: (items) => {
        this.pending.set(items ?? []);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 0 ? 'Cannot reach the server.' : 'Failed to load pending artists.',
        );
      },
    });
  }
}
