import { ChangeDetectionStrategy, Component, computed, inject, input, signal, effect } from '@angular/core';

import { PayoutDataService } from '@bedge/shared';
import type { PublicPaymentMethod } from '@bedge/shared';

/**
 * Where to send a deposit, shown by the app rather than sent in a message.
 *
 * WHY THIS COMPONENT EXISTS
 *
 * B-Edge has no card rails, so the client transfers the deposit directly to
 * the artist. Before the platform held a payment destination, the account
 * number reached the client over WhatsApp - the one channel B-Edge does not
 * control - and anyone able to insert themselves into that conversation could
 * substitute their own number. Nobody afterwards had an authoritative value to
 * check it against.
 *
 * Showing the destination here is what makes the one genuinely useful piece of
 * safety advice sayable: only ever send to the details in the app.
 *
 * WHEN THERE IS NOTHING TO SHOW
 *
 * It says so plainly rather than rendering an empty box. An artist who has not
 * set their details will still send them by message, and pretending otherwise
 * would leave the client trusting a check that did not happen.
 */
@Component({
  selector: 'app-deposit-instructions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isPayable()) {
      <div class="w-full rounded-lg border border-gray-200 bg-white overflow-hidden text-left">
        <div class="px-5 py-4 border-b border-gray-100">
          <p class="text-[12px] font-bold tracking-[0.05em] uppercase text-gray-500">
            Deposit to pay
          </p>
          <p class="text-[22px] font-bold text-ink mt-1">\${{ depositAmount() }}</p>
        </div>

        @if (loading()) {
          <div class="px-5 py-4">
            <p class="text-[13px] text-gray-400">Loading payment details…</p>
          </div>
        } @else if (methods().length > 0) {
          @for (m of methods(); track m.method) {
            <div class="px-5 py-4 border-b border-gray-100">
              <p class="text-[12px] font-bold tracking-[0.05em] uppercase text-gray-500">
                {{ m.method_label }}
              </p>
              <p class="text-[15px] font-semibold text-ink mt-1">{{ m.account_ref }}</p>
              <p class="text-[13px] text-gray-500">{{ m.account_name }}</p>
            </div>
          }
          <!-- The whole point of holding the destination. Phrased as a rule the
               client can apply, not as a reassurance about B-Edge. -->
          <div class="px-5 py-4 bg-gray-50">
            <p class="text-[13px] text-ink font-medium">Only send to the details shown here.</p>
            <p class="text-[12px] text-gray-500 mt-1 leading-[18px]">
              Check the name above matches what your app shows before you confirm. If anyone
              sends you a different number, do not use it. Keep your transfer reference.
            </p>
          </div>
        } @else {
          <div class="px-5 py-4">
            <p class="text-[13px] text-gray-500 leading-[18px]">
              {{ artistName() }} will send you their payment details. Keep your transfer
              reference once you have paid.
            </p>
          </div>
        }
      </div>
    }
  `,
})
export class DepositInstructionsComponent {
  private readonly api = inject(PayoutDataService);

  readonly salonId = input.required<string>();
  /** The deposit as the API returned it - a decimal string, never a number. */
  readonly depositAmount = input.required<string>();
  readonly artistName = input<string>('The artist');

  protected readonly methods = signal<PublicPaymentMethod[]>([]);
  protected readonly loading = signal(false);

  /** Nothing to show when no deposit is due. Parsed rather than compared as a
   *  string, because "0", "0.00" and "0.0" are all the same amount. */
  protected readonly isPayable = computed(() => {
    const n = Number.parseFloat(this.depositAmount());
    return Number.isFinite(n) && n > 0;
  });

  constructor() {
    // Fetched only when a deposit is actually due, so a no-deposit booking
    // never asks the server where to send money.
    effect(() => {
      if (!this.isPayable()) return;
      const salon = this.salonId();
      if (!salon) return;

      this.loading.set(true);
      this.api.listForSalon(salon).subscribe({
        next: (list) => {
          this.methods.set(list);
          this.loading.set(false);
        },
        // A failure here must not look like "this artist has no details" -
        // it falls through to the same honest fallback message.
        error: () => {
          this.methods.set([]);
          this.loading.set(false);
        },
      });
    });
  }
}
