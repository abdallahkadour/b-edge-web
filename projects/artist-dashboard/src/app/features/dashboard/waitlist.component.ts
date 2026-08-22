import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';

import {
  ArtistDataService,
  BookingDataService,
  BadgeComponent,
  bookingStatusTone,
} from '@bedge/shared';
import type { WaitlistEntryResponse } from '@bedge/shared';

/**
 * Waitlist - the artist's view of who's waiting for a fully-booked date
 * (PRD §9.5). Read-only: there's no artist action here by design - the
 * notify-next-in-line cascade is entirely automatic, triggered by
 * cancellations on the backend. This screen exists so an artist can see
 * demand for a date that's already full, not to manage the queue by hand.
 */
@Component({
  selector: 'bedge-waitlist',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, BadgeComponent],
  templateUrl: './waitlist.component.html',
})
export class WaitlistComponent implements OnInit {
  /** Shared across bookings, client-detail and waitlist so the same
   *  status can never render differently on different screens. */
  protected readonly statusTone = bookingStatusTone;

  private readonly artistSvc = inject(ArtistDataService);
  private readonly bookingSvc = inject(BookingDataService);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly entries = signal<WaitlistEntryResponse[]>([]);

  ngOnInit(): void {
    this.load();
  }

  statusLabel(status: string): string {
    return status.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
  }


  formatDate(dateStr: string): string {
    // requested_date is a bare YYYY-MM-DD, not a full timestamp - no
    // timezone conversion needed, unlike every other date in this app.
    return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short',
    });
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.artistSvc.getMyProfile().subscribe({
      next: (profile) => {
        this.bookingSvc.getWaitlistByArtist(profile.id).subscribe({
          next: (entries) => {
            this.entries.set(entries ?? []);
            this.loading.set(false);
          },
          error: (err: HttpErrorResponse) => {
            this.loading.set(false);
            this.errorMessage.set(
              err.status === 0 ? 'Cannot reach the server.' : 'Failed to load the waitlist.',
            );
          },
        });
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 0 ? 'Cannot reach the server.' : 'Failed to load your profile.',
        );
      },
    });
  }
}
