import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

/**
 * A minimal typing for the event the standard library doesn't ship types
 * for - BeforeInstallPromptEvent isn't part of the DOM lib.d.ts.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'bedge_install_dismissed';

/**
 * A dismissible "Add to home screen" banner, mounted once in the app root
 * so it persists across every route.
 *
 * Chrome and Edge fire `beforeinstallprompt` when a page qualifies as an
 * installable PWA (manifest + HTTPS, or localhost for dev) and the browser
 * would otherwise show its own small mini-infobar. Calling
 * `event.preventDefault()` suppresses that default UI so this banner can
 * offer the same action on B-Edge's own terms instead - offered once,
 * dismissible, and not shown again this browser once dismissed.
 *
 * Safari never fires this event at all - iOS installation is a manual
 * "Share > Add to Home Screen" action with no programmatic trigger, so
 * this component simply never shows there. That's expected, not a bug.
 */
@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './install-prompt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstallPromptComponent {
  readonly visible = signal(false);
  private deferredEvent: BeforeInstallPromptEvent | null = null;

  constructor() {
    if (localStorage.getItem(DISMISSED_KEY) === '1') return;

    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      this.deferredEvent = event as BeforeInstallPromptEvent;
      this.visible.set(true);
    });

    // If the app is already running as an installed PWA, there is nothing
    // to prompt for - standalone display mode means it was already added.
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.visible.set(false);
    }
  }

  async install(): Promise<void> {
    if (!this.deferredEvent) return;
    await this.deferredEvent.prompt();
    // Whatever the person chose, the browser will not fire this event
    // again for the same deferred prompt - hide either way rather than
    // leaving a banner that can no longer do anything.
    await this.deferredEvent.userChoice;
    this.deferredEvent = null;
    this.visible.set(false);
  }

  dismiss(): void {
    localStorage.setItem(DISMISSED_KEY, '1');
    this.visible.set(false);
  }
}
