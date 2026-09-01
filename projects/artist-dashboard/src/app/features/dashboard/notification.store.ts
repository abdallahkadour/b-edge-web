import { Injectable, inject, signal } from '@angular/core';

import { NotificationDataService } from '@bedge/shared';
import type { AppNotification } from '@bedge/shared';

/**
 * How often the badge re-checks while the tab is visible.
 *
 * 60s is a deliberate compromise. The notifications this centre carries are
 * things an artist should learn about within minutes, not seconds - the
 * flagship one is "a customer was never reached", which is already hours
 * old by the time WhatsApp gives up and marks the message dead. Polling
 * faster would spend battery on a phone and add load for no product gain,
 * and polling much slower would let someone sit on a stale zero for most of
 * an appointment.
 */
const POLL_INTERVAL_MS = 60_000;

/** Rows fetched when the panel opens. The backend caps this at 50 anyway;
 *  the centre is for scanning recent activity, not browsing history. */
const FEED_LIMIT = 20;

/**
 * State for the notification bell.
 *
 * Polls rather than using a socket. There is no realtime transport in this
 * codebase and adding one for a badge would mean a persistent connection,
 * reconnect handling and a second auth path - a large amount of new
 * infrastructure to make a number arrive fifty seconds sooner.
 *
 * Polling pauses when the tab is hidden and resumes with an immediate
 * fetch. Without that, every backgrounded dashboard tab keeps waking a
 * phone radio once a minute forever, which is exactly the behaviour that
 * gets a PWA uninstalled.
 */
@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private readonly data = inject(NotificationDataService);

  private readonly _items = signal<AppNotification[]>([]);
  private readonly _unreadCount = signal(0);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  private timer?: ReturnType<typeof setTimeout>;

  /**
   * How many live bells are attached.
   *
   * Two, normally: the responsive shell renders one in the desktop sidebar
   * and one in the mobile top bar, hiding the wrong one with CSS rather
   * than with @if, so both components genuinely exist. A plain boolean
   * would work today because they mount and unmount together - and would
   * break the first time that stops being true, with the failure showing
   * up as a badge that silently stops updating rather than as an error.
   */
  private attached = 0;

  private readonly onVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      // Fetch straight away rather than waiting out the remainder of an
      // interval that was suspended - someone returning to the tab is
      // exactly when a stale badge is most visible.
      this.pollNow();
    } else {
      clearTimeout(this.timer);
    }
  };

  /**
   * Attaches a bell and begins polling. Safe to call from every instance;
   * only the first starts a timer, so N bells do not make N requests.
   *
   * Each caller owns a matching `detach()`. The store is root-provided and
   * so outlives the dashboard layout that gets torn down on sign-out; a
   * timer left running past logout would keep hitting an endpoint the user
   * is no longer authorised for, once a minute, forever.
   */
  attach(): void {
    this.attached++;
    if (this.attached > 1) return;

    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.pollNow();
  }

  /** Detaches one bell. Polling stops, and the feed is cleared, only once
   *  the last one is gone - clearing on the first would blank the badge on
   *  the still-mounted sibling. Clearing matters because a subsequent
   *  sign-in must not briefly render the previous user's notifications. */
  detach(): void {
    this.attached = Math.max(0, this.attached - 1);
    if (this.attached > 0) return;

    clearTimeout(this.timer);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this._items.set([]);
    this._unreadCount.set(0);
    this._error.set(null);
  }

  /**
   * Loads the full feed. Called when the panel opens.
   *
   * The response carries the unread count, so this also re-syncs the badge -
   * opening the panel can never show an empty list under a non-zero number.
   */
  loadFeed(): void {
    this._loading.set(true);
    this._error.set(null);
    this.data.getFeed({ limit: FEED_LIMIT }).subscribe({
      next: (feed) => {
        this._items.set(feed.notifications ?? []);
        this._unreadCount.set(feed.unread_count);
        this._loading.set(false);
      },
      error: () => {
        this._error.set('Could not load your notifications.');
        this._loading.set(false);
      },
    });
  }

  /**
   * Marks one row read, optimistically.
   *
   * The user has just clicked the row and is usually navigating away in the
   * same gesture; waiting for a round trip before the row stops looking
   * unread would show a visible flicker on the way out. A failure re-syncs
   * from the server rather than trying to invert the local edit, so the
   * panel ends up matching the database either way.
   */
  markRead(id: string): void {
    const target = this._items().find((n) => n.id === id);
    if (!target || target.read_at) return;

    this.applyLocalRead(id);
    this._unreadCount.update((c) => Math.max(0, c - 1));

    this.data.markRead(id).subscribe({ error: () => this.loadFeed() });
  }

  /** Clears the badge in one call. Optimistic for the same reason. */
  markAllRead(): void {
    if (this._unreadCount() === 0) return;

    const now = new Date().toISOString();
    this._items.update((items) => items.map((n) => (n.read_at ? n : { ...n, read_at: now })));
    this._unreadCount.set(0);

    this.data.markAllRead().subscribe({ error: () => this.loadFeed() });
  }

  /**
   * Dismisses a row from the feed.
   *
   * Archiving marks read server-side, so an unread row being dismissed also
   * decrements the badge here. Missing that is how a badge gets permanently
   * stuck at a number with nothing behind it.
   */
  archive(id: string): void {
    const target = this._items().find((n) => n.id === id);
    if (!target) return;

    this._items.update((items) => items.filter((n) => n.id !== id));
    if (!target.read_at) this._unreadCount.update((c) => Math.max(0, c - 1));

    this.data.archive(id).subscribe({ error: () => this.loadFeed() });
  }

  private applyLocalRead(id: string): void {
    const now = new Date().toISOString();
    this._items.update((items) =>
      items.map((n) => (n.id === id ? { ...n, read_at: now } : n)),
    );
  }

  /**
   * One badge fetch, then schedules the next.
   *
   * Chained timeouts rather than setInterval: an interval fires on a fixed
   * schedule regardless of whether the previous request has come back, so a
   * slow or stalled connection quietly accumulates overlapping in-flight
   * requests. Scheduling the next one only after this one settles keeps at
   * most one outstanding.
   */
  private pollNow(): void {
    clearTimeout(this.timer);
    this.data.getUnreadCount().subscribe({
      next: (res) => {
        this._unreadCount.set(res.unread_count);
        this.scheduleNext();
      },
      // Swallowed on purpose. A failed badge poll is not worth an error
      // state on the shell - a 401 is already handled globally by
      // authErrorInterceptor, and anything else resolves on the next tick.
      error: () => this.scheduleNext(),
    });
  }

  private scheduleNext(): void {
    if (this.attached === 0 || document.visibilityState !== 'visible') return;
    this.timer = setTimeout(() => this.pollNow(), POLL_INTERVAL_MS);
  }
}
