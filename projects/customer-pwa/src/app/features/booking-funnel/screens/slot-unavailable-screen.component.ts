import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

/** Why the time she picked is not hers: it is no longer free (409
 *  SLOT_UNAVAILABLE), or her own 10-minute hold ran out. */
export type UnavailableReason = 'taken' | 'expired';

/**
 * Shown when a hold fails at creation (SLOT_UNAVAILABLE — the time is no
 * longer free) or her hold runs out before submit. It says which: until
 * 2026-10-10 both, and every other failure, read "someone else booked this
 * time while you were filling in your details" - untrue after a lost
 * connection, and before she had typed anything. Matches the reference design's
 * "Slot Unavailable" spec: calm, not alarming, no red — same restrained
 * palette as the confirmation screen, because losing a slot to a race isn't
 * a fault, it's a timing outcome.
 */
@Component({
  selector: 'app-slot-unavailable-screen',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './slot-unavailable-screen.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlotUnavailableScreenComponent {
  readonly reason = input<UnavailableReason>('taken');
  /** Only true when she had reached the details screen. */
  readonly detailsSaved = input(false);
  readonly chooseAnotherTime = output<void>();
  readonly backToProfile = output<void>();
}
