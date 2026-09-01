import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import type { AppNotification, NotificationLevel } from '@bedge/shared';

import { NotificationStore } from './notification.store';

/** Above this the badge stops being a count and becomes "lots". */
const BADGE_CAP = 9;

/**
 * Notification bell and dropdown panel for the dashboard shell.
 *
 * Lives in artist-dashboard rather than @bedge/shared even though the API
 * is not artist-specific. Both kinds the backend currently produces -
 * delivery_failed and refund_due - are addressed to an artist, so a bell in
 * the customer PWA today would be a permanently empty affordance. Moving it
 * to shared/ui is a small refactor at the point a customer-facing kind
 * actually exists; shipping an empty panel now is a promise the product
 * cannot keep.
 */
@Component({
  selector: 'bedge-notification-bell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  templateUrl: './notification-bell.component.html',
  host: {
    // Escape is bound at the DOCUMENT, not on the panel element.
    //
    // Binding it to the panel looks right and does not work: the panel is a
    // dropdown, so opening it leaves focus on the bell button (or, after a
    // click, on document.body), and a keydown on body never reaches a
    // handler on the panel. Verified in a real browser - Escape did nothing
    // while activeElement was BODY.
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class NotificationBellComponent {
  private readonly store = inject(NotificationStore);
  private readonly router = inject(Router);

  private readonly bellButton = viewChild<ElementRef<HTMLButtonElement>>('bellButton');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  readonly items = this.store.items;
  readonly unreadCount = this.store.unreadCount;
  readonly loading = this.store.loading;
  readonly error = this.store.error;

  readonly open = signal(false);

  /** "9+" past the cap - a two-digit badge does not fit the dot, and the
   *  exact number stops being actionable well before then anyway. */
  readonly badgeLabel = computed(() => {
    const n = this.unreadCount();
    return n > BADGE_CAP ? `${BADGE_CAP}+` : String(n);
  });

  readonly ariaLabel = computed(() => {
    const n = this.unreadCount();
    if (n === 0) return 'Notifications';
    return `Notifications, ${n} unread`;
  });

  constructor() {
    this.store.attach();
    // The store is root-provided and outlives this component, so the timer
    // has to be released explicitly - the layout is destroyed on sign-out,
    // and a poll surviving that would keep hitting an endpoint the user is
    // no longer authorised for.
    inject(DestroyRef).onDestroy(() => this.store.detach());
  }

  toggle(): void {
    const next = !this.open();
    this.open.set(next);
    if (!next) return;

    // Fetch on open, not on construction. The panel's contents are only
    // ever looked at when it is open, and the badge poll already tells us
    // whether there is anything worth opening it for.
    this.store.loadFeed();

    // Move focus into the panel so a keyboard user's next Tab walks the
    // notifications rather than the page behind them. Deliberately NOT a
    // CDK focus trap: this is a dropdown, not a modal - it says
    // aria-modal="false" - and trapping would mean Tab could never leave.
    // The timeout is for the @if: the element does not exist until the
    // template re-renders.
    setTimeout(() => this.panel()?.nativeElement.focus());
  }

  close(): void {
    this.open.set(false);
  }

  /**
   * Escape closes and returns focus to the bell.
   *
   * Returning focus matters: dismissing a dropdown that had focus and
   * leaving focus nowhere drops a keyboard user back to the top of the
   * document, losing their place in a long bookings list.
   */
  onEscape(): void {
    if (!this.open()) return;
    this.close();
    this.bellButton()?.nativeElement.focus();
  }

  markAllRead(): void {
    this.store.markAllRead();
  }

  /** Dismiss. No stopPropagation needed - the dismiss button is a sibling
   *  of the row target rather than nested inside it, so one tap can only
   *  ever hit one of them. */
  archive(id: string): void {
    this.store.archive(id);
  }

  /**
   * Row activation: mark read, then follow the link if there is one.
   *
   * Marking read happens even when there is nowhere to go, because reading
   * the row IS the action for an informational notification.
   */
  activate(n: AppNotification): void {
    this.store.markRead(n.id);
    const target = this.safeLink(n.link);
    if (target) {
      this.close();
      this.router.navigateByUrl(target);
    }
  }

  /**
   * Accepts only same-origin absolute paths.
   *
   * `link` is server-generated, so this is defence in depth rather than a
   * known hole - but it is cheap, and the failure it prevents is a
   * notification that navigates somewhere off-app. `//evil.com` is the case
   * worth naming: it looks like a path, passes a naive `startsWith('/')`
   * check, and is a protocol-relative URL that leaves the origin.
   */
  private safeLink(link?: string): string | null {
    if (!link) return null;
    if (!link.startsWith('/') || link.startsWith('//')) return null;
    return link;
  }

  hasLink(n: AppNotification): boolean {
    return this.safeLink(n.link) !== null;
  }

  isUnread(n: AppNotification): boolean {
    return !n.read_at;
  }

  /** Lucide icon per level. An unknown level falls back to the bell rather
   *  than rendering an empty slot. */
  levelIcon(level: NotificationLevel): string {
    switch (level) {
      case 'action_required':
        return 'alert-circle';
      case 'warning':
        return 'alert-circle';
      default:
        return 'bell';
    }
  }

  levelClass(level: NotificationLevel): string {
    switch (level) {
      case 'action_required':
        return 'text-danger-dark';
      case 'warning':
        return 'text-warning-dark';
      default:
        return 'text-gray-400';
    }
  }

  /**
   * Compact relative time: "now", "4m", "3h", "2d", then a date.
   *
   * Cuts over to an absolute date after a week because "9d" stops being
   * something anyone can convert at a glance, and a notification that old
   * is being read as history rather than as news.
   */
  relativeTime(iso: string): string {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';

    const minutes = Math.floor((Date.now() - then) / 60_000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;

    return new Date(then).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  }
}
