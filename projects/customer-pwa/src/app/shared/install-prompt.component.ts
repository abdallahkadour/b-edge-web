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

type InstallMode =
  | 'none'      // nothing to show: already installed, dismissed, or unsupported
  | 'chromium'  // beforeinstallprompt available - a real, programmatic Install button
  | 'ios';      // Safari on iOS - manual Share -> Add to Home Screen instructions

/**
 * A dismissible "Add to home screen" banner, mounted once in the app root
 * so it persists across every route.
 *
 * Two genuinely different install paths, not one path with a missing
 * fallback:
 *
 * Chrome and Edge fire `beforeinstallprompt` when a page qualifies as an
 * installable PWA. Calling `event.preventDefault()` suppresses the
 * browser's own mini-infobar so this banner can offer the same action on
 * B-Edge's own terms - a real button that triggers the native install
 * flow.
 *
 * Safari on iOS never fires that event, full stop - there is no
 * programmatic install API on iOS at all. The only way to add a page to
 * the home screen there is a manual "tap Share, then Add to Home Screen"
 * action, which is a UI convention Apple owns, not something a page can
 * trigger. The previous version of this component correctly documented
 * that Safari never fires the event, then stopped there - which meant
 * iOS users, roughly half of B-Edge's likely customer base, saw nothing
 * at all rather than instructions for the path that actually works for
 * them.
 */
@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './install-prompt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstallPromptComponent {
  readonly mode = signal<InstallMode>('none');
  private deferredEvent: BeforeInstallPromptEvent | null = null;

  constructor() {
    if (localStorage.getItem(DISMISSED_KEY) === '1') return;
    if (this.isRunningStandalone()) return;

    if (this.isIOS()) {
      // No event to wait for - iOS never fires beforeinstallprompt, so
      // show the manual instructions immediately rather than waiting
      // forever for something that will never happen.
      this.mode.set('ios');
      return;
    }

    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      this.deferredEvent = event as BeforeInstallPromptEvent;
      this.mode.set('chromium');
    });
  }

  async install(): Promise<void> {
    if (!this.deferredEvent) return;
    await this.deferredEvent.prompt();
    // Whatever the person chose, the browser will not fire this event
    // again for the same deferred prompt - hide either way rather than
    // leaving a banner that can no longer do anything.
    await this.deferredEvent.userChoice;
    this.deferredEvent = null;
    this.mode.set('none');
  }

  dismiss(): void {
    localStorage.setItem(DISMISSED_KEY, '1');
    this.mode.set('none');
  }

  /** iPadOS 13+ reports itself as "Macintosh" with touch support, so
   *  checking the UA string alone misses iPads. maxTouchPoints catches
   *  that case without needing a UA parsing library for one signal. */
  private isIOS(): boolean {
    const ua = navigator.userAgent;
    const isAppleTouchDevice = /iPad|iPhone|iPod/.test(ua);
    const isDesktopSafariReportingAsIpad =
      ua.includes('Macintosh') && navigator.maxTouchPoints > 1;
    return isAppleTouchDevice || isDesktopSafariReportingAsIpad;
  }

  /** Two different signals because iOS Safari historically only reliably
   *  supports the non-standard `navigator.standalone`, while
   *  `display-mode: standalone` is the standard the rest of the web uses. */
  private isRunningStandalone(): boolean {
    const nav = navigator as Navigator & { standalone?: boolean };
    return nav.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
  }
}
