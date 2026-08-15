import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Subject,
  merge,
  of,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  catchError,
  takeUntil,
} from 'rxjs';

import { ClientDataService } from '@bedge/shared';
import type { ClientCard } from '@bedge/shared';

/**
 * Clients list screen for the artist dashboard.
 *
 * Shows all customers who have completed at least one booking with the artist.
 * Supports live search with 300ms debounce.
 * Tapping a client navigates to the detail screen.
 */
@Component({
  selector: 'bedge-clients',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './clients.component.html',
})
export class ClientsComponent implements OnInit, OnDestroy {
  private readonly clientSvc = inject(ClientDataService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();

  // ── State ─────────────────────────────────────────────────────────────────

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly clients = signal<ClientCard[]>([]);
  readonly searchQuery = signal('');

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // One stream drives every load, initial and search alike.
    //
    // switchMap is load-bearing: the previous version called .subscribe()
    // and kicked off a SEPARATE http subscription per keystroke, so
    // nothing cancelled in-flight requests. Typing "a" then "ab" could
    // render "ab" and then have the slower "a" response overwrite it -
    // the user sees results that do not match what is in the box.
    // switchMap cancels the outstanding request whenever a newer one
    // starts, so only the latest query can ever paint.
    //
    // catchError sits INSIDE switchMap deliberately. If it were on the
    // outer pipe, the first failed request would terminate the whole
    // stream and search would stay dead until the screen was reloaded -
    // a worse bug than the one being fixed. Catching per-request keeps
    // the outer stream alive for the next keystroke.
    merge(
      // Immediate first load, not subject to the 300ms debounce.
      of(''),
      this.search$.pipe(debounceTime(300), distinctUntilChanged()),
    )
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.errorMessage.set(null);
        }),
        switchMap((q) =>
          this.clientSvc.listClients(q || undefined).pipe(
            catchError((err: HttpErrorResponse) => {
              this.loading.set(false);
              this.errorMessage.set(
                err.status === 0
                  ? 'Cannot reach the server. Check your connection.'
                  : 'Failed to load clients. Please try again.',
              );
              return of(null);
            }),
          ),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe((data) => {
        // null means the request failed and catchError already set the
        // error message - leave the previous list in place rather than
        // blanking the screen.
        if (data === null) return;
        this.clients.set(data ?? []);
        this.loading.set(false);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Called on every keystroke in the search input. */
  onSearch(value: string): void {
    this.searchQuery.set(value);
    this.search$.next(value.trim());
  }

  /** Navigate to the client detail screen. */
  openClient(client: ClientCard): void {
    this.router.navigate(['/dashboard/clients', client.customer_id]);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Format a decimal string as a dollar amount. */
  formatMoney(value: string): string {
    const n = parseFloat(value) || 0;
    return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  /** Format an ISO date as a short relative label. */
  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  /** Format a decimal rating as a star label e.g. "4.8 ★". */
  formatRating(value?: string): string {
    if (!value) return '';
    const n = parseFloat(value);
    return isNaN(n) ? '' : `${n.toFixed(1)} ★`;
  }

  /** Returns the initials for a client name. */
  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (!parts[0]) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // ── Private ───────────────────────────────────────────────────────────────

}
