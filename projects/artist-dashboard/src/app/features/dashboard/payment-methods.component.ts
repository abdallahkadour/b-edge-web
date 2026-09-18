import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import {
  ButtonComponent,
  InputDirective,
  PayoutDataService,
  SkeletonComponent,
  extractApiErrorMessage,
} from '@bedge/shared';
import type { PaymentMethodKind, SalonPaymentMethod } from '@bedge/shared';

interface Draft {
  method: PaymentMethodKind;
  account_name: string;
  account_ref: string;
}

/**
 * Where a salon's money should be sent.
 *
 * WHY THIS SCREEN MATTERS MORE THAN IT LOOKS
 *
 * B-Edge has no card rails: a client transfers the deposit directly to the
 * artist. Until the platform held this, the account number reached the client
 * over WhatsApp - the one channel B-Edge does not control - so anyone who
 * could insert themselves into that conversation could substitute their own
 * number, and nobody afterwards had an authoritative value to check against.
 *
 * What is entered here is what a client is shown and told to pay. That is why
 * the account NAME is required alongside the number: both Whish and OMT show a
 * recipient name at confirmation, so it is what lets a client notice they are
 * about to pay the wrong person.
 */
@Component({
  selector: 'bedge-payment-methods',
  standalone: true,
  imports: [ButtonComponent, InputDirective, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payment-methods.component.html',
})
export class PaymentMethodsComponent implements OnInit {
  private readonly api = inject(PayoutDataService);

  protected readonly methods = signal<SalonPaymentMethod[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly editing = signal<PaymentMethodKind | null>(null);
  protected readonly draft = signal<Draft>({ method: 'whish', account_name: '', account_ref: '' });
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly togglingId = signal<string | null>(null);

  protected readonly kinds: readonly { id: PaymentMethodKind; label: string; hint: string }[] = [
    { id: 'whish', label: 'Whish', hint: 'The phone number your Whish account is registered to' },
    { id: 'omt', label: 'OMT', hint: 'The account name and reference a client should quote' },
  ];

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.listMine().subscribe({
      next: (list) => {
        this.methods.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Could not load your payment details. Please try again.');
      },
    });
  }

  protected existing(kind: PaymentMethodKind): SalonPaymentMethod | undefined {
    return this.methods().find((m) => m.method === kind);
  }

  /**
   * True when no client can currently be told where to send money.
   *
   * Worth surfacing loudly: an artist taking deposits with nothing set here
   * is back to sending an account number over WhatsApp, which is the exact
   * situation this screen exists to end.
   */
  protected readonly hasNoActiveDestination = computed(
    () => !this.loading() && !this.methods().some((m) => m.is_active),
  );

  protected startEdit(kind: PaymentMethodKind): void {
    const current = this.existing(kind);
    this.draft.set({
      method: kind,
      account_name: current?.account_name ?? '',
      account_ref: current?.account_ref ?? '',
    });
    this.saveError.set(null);
    this.editing.set(kind);
  }

  protected cancelEdit(): void {
    this.editing.set(null);
    this.saveError.set(null);
  }

  protected patchDraft(patch: Partial<Draft>): void {
    this.draft.update((d) => ({ ...d, ...patch }));
  }

  /** Mirrors the API's own minimums, so Save is not offered for a request
   *  the server will refuse. The server remains the guarantee. */
  protected readonly canSave = computed(() => {
    const d = this.draft();
    return d.account_name.trim().length >= 2 && d.account_ref.trim().replace(/\s+/g, '').length >= 4;
  });

  protected save(): void {
    if (!this.canSave() || this.saving()) return;
    const d = this.draft();

    this.saving.set(true);
    this.saveError.set(null);
    this.api
      .upsert({
        method: d.method,
        account_name: d.account_name.trim(),
        account_ref: d.account_ref.trim(),
      })
      .subscribe({
        next: (saved) => {
          this.saving.set(false);
          this.editing.set(null);
          // Replace in place if present, otherwise append - the API upserts,
          // so a save is equally likely to be a change as an addition.
          this.methods.update((list) => {
            const i = list.findIndex((m) => m.method === saved.method);
            if (i === -1) return [...list, saved];
            const next = [...list];
            next[i] = saved;
            return next;
          });
        },
        error: (err: HttpErrorResponse) => {
          this.saving.set(false);
          this.saveError.set(
            extractApiErrorMessage(err, 'Could not save those details. Check them and try again.'),
          );
        },
      });
  }

  protected toggleActive(m: SalonPaymentMethod): void {
    if (this.togglingId()) return;
    this.togglingId.set(m.id);
    this.api.setActive(m.id, !m.is_active).subscribe({
      next: (updated) => {
        this.togglingId.set(null);
        this.methods.update((list) => list.map((x) => (x.id === updated.id ? updated : x)));
      },
      error: (err: HttpErrorResponse) => {
        this.togglingId.set(null);
        this.error.set(extractApiErrorMessage(err, 'Could not update that payment method.'));
      },
    });
  }
}
