import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import {
  ButtonComponent,
  InputDirective,
  OfferingDataService,
  SkeletonComponent,
  extractApiErrorMessage,
} from '@bedge/shared';
import type { ServiceOffering, UpdateOfferingRequest } from '@bedge/shared';

/**
 * The salon menu with a switch per service, and her price and deposit.
 *
 * One component, three places (spec §7): the join step, "My services", and
 * the owner editing a member. memberArtistId undefined = the caller's own.
 *
 * Saves per row. A switch is a decision about one service; making her press
 * a page-level Save after flipping it would lose the change when she leaves.
 */
@Component({
  selector: 'bedge-service-offerings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, InputDirective, SkeletonComponent],
  templateUrl: './service-offerings.component.html',
})
export class ServiceOfferingsComponent implements OnInit {
  private readonly api = inject(OfferingDataService);

  readonly memberArtistId = input<string | undefined>(undefined);

  protected readonly rows = signal<ServiceOffering[]>([]);
  protected readonly loading = signal(true);
  protected readonly busy = signal<string | null>(null);
  protected readonly rowError = signal<Record<string, string>>({});
  protected readonly draftPrice = signal<Record<string, string>>({});
  protected readonly draftDeposit = signal<Record<string, string>>({});

  // Signal inputs are bound after construction - read them here, never in
  // the constructor (see phone-verification.component for the same rule).
  ngOnInit(): void {
    const id = this.memberArtistId();
    (id ? this.api.listForMember(id) : this.api.listMine()).subscribe({
      next: (rows) => { this.rows.set(rows); this.loading.set(false); },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.rowError.set({ _: extractApiErrorMessage(err, 'Could not load services.') });
      },
    });
  }

  protected toggle(row: ServiceOffering): void {
    if (row.offered && (row.own_price || row.own_deposit) && !confirm(this.turnOffWarning(row))) {
      return;
    }
    this.save(row, { offered: !row.offered });
  }

  /**
   * What turning a service off costs her, named plainly rather than left
   * for her to notice missing later - spec §5. A custom deposit is lost the
   * same way a custom price is, so both are called out when both are set.
   */
  private turnOffWarning(row: ServiceOffering): string {
    const lost = [
      row.own_price ? `price of $${row.own_price}` : null,
      row.own_deposit ? `deposit of $${row.own_deposit}` : null,
    ].filter((s): s is string => s !== null);
    return `Turning off ${row.service_name} removes your ${lost.join(' and ')}. Turn it off?`;
  }

  protected savePrices(row: ServiceOffering): void {
    const req: UpdateOfferingRequest = { offered: true };
    const p = this.draftPrice()[row.service_id];
    const d = this.draftDeposit()[row.service_id];
    if (p !== undefined) req.price = p.trim() === '' ? null : p.trim();
    if (d !== undefined) req.deposit_amount = d.trim() === '' ? null : d.trim();
    this.save(row, req);
  }

  protected useSalonPrice(row: ServiceOffering): void {
    this.save(row, { offered: true, price: null, deposit_amount: null });
  }

  protected setDraft(kind: 'price' | 'deposit', id: string, value: string): void {
    const s = kind === 'price' ? this.draftPrice : this.draftDeposit;
    s.set({ ...s(), [id]: value });
  }

  private save(row: ServiceOffering, req: UpdateOfferingRequest): void {
    const id = this.memberArtistId();
    this.busy.set(row.service_id);
    this.rowError.set({ ...this.rowError(), [row.service_id]: '' });
    (id ? this.api.updateForMember(id, row.service_id, req) : this.api.updateMine(row.service_id, req))
      .subscribe({
        next: (updated) => {
          this.rows.set(this.rows().map((r) => (r.service_id === updated.service_id ? updated : r)));
          this.busy.set(null);
        },
        error: (err: HttpErrorResponse) => {
          this.busy.set(null);
          this.rowError.set({ ...this.rowError(), [row.service_id]: extractApiErrorMessage(err, 'Could not save.') });
        },
      });
  }
}
