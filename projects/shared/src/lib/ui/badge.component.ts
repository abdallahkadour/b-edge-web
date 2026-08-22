import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'success' | 'ink' | 'warning' | 'danger' | 'muted';

/**
 * Status pill.
 *
 * The tone-per-status mapping was previously reimplemented as a switch
 * statement inside three separate components (orders, my-orders,
 * products), each with its own copy of the colour strings. They already
 * disagreed in small ways, which matters more here than for buttons: a
 * customer looking at "Confirmed" in green on one screen and grey on
 * another has a reason to doubt what they are being told.
 *
 * Tone is intentionally decoupled from any specific domain status. The
 * mapping from an order status to a tone belongs in the component that
 * knows about orders - this only owns how a given tone looks.
 */
@Component({
  selector: 'bedge-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [class]="classes()"><ng-content /></span>`,
})
export class BadgeComponent {
  readonly tone = input<BadgeTone>('neutral');

  protected readonly classes = computed(() => {
    const base =
      'inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full';

    const tones: Record<BadgeTone, string> = {
      neutral: 'bg-gray-100 text-gray-600',
      success: 'bg-success/10 text-success-dark',
      ink: 'bg-ink/10 text-ink',
      warning: 'bg-warning-light text-warning-dark',
      danger: 'bg-danger-light text-danger-dark',
      // muted is for terminal, non-happy states (cancelled, returned) -
      // visibly present but deliberately receding.
      muted: 'bg-gray-100 text-gray-400',
    };

    return `${base} ${tones[this.tone()]}`;
  });
}
