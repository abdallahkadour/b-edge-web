import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

/**
 * Shown when a hold fails at creation (SLOT_UNAVAILABLE — someone else took it
 * first) or expires locally before submit. Matches the reference design's
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
  readonly chooseAnotherTime = output<void>();
  readonly backToProfile = output<void>();
}
