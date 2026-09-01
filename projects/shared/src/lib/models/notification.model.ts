/**
 * In-app notification centre models. Mirrors the Go `inbox` package
 * (internal/inbox/model.go), which serves these under /notifications.
 *
 * Named `AppNotification`, not `Notification`, on purpose: the DOM has a
 * global `Notification` (the Web Notifications API). A model interface with
 * that name compiles fine but silently shadows the global in every file
 * that imports it, so the day someone adds a desktop push prompt they get
 * a confusing type error a long way from the cause. The backend has the
 * mirror-image problem and solved it the same way - it named the package
 * `inbox` because `notification` was already the outbound WhatsApp queue.
 */

/**
 * `action_required` is the load-bearing level: it means a human must DO
 * something (call a customer who was never reached, send a refund), not
 * merely that they have been told.
 */
export type NotificationLevel = 'info' | 'warning' | 'action_required';

/**
 * Kinds the backend currently produces. Typed as a union of known values
 * widened with `string` so an unrecognised kind from a newer API deploys
 * without breaking an older client - the UI falls back to a default icon
 * rather than rendering nothing.
 */
export type NotificationKind = 'delivery_failed' | 'refund_due' | (string & {});

/** One entry in the caller's feed. */
export interface AppNotification {
  readonly id: string;
  readonly kind: NotificationKind;
  readonly level: NotificationLevel;
  readonly title: string;
  readonly body?: string;
  /** Relative in-app path, e.g. `/dashboard/bookings`. Absent when there is
   *  nowhere useful to go. */
  readonly link?: string;
  /** How many occurrences this row represents. Greater than one means
   *  identical events were bundled server-side - a bulk action touching
   *  twelve bookings is one row saying twelve, not twelve rows. */
  readonly item_count: number;
  /** Absent while unread. */
  readonly read_at?: string;
  readonly created_at: string;
}

/**
 * The feed payload. `unread_count` ships with the list rather than being
 * derived from it, because the list is capped at 50 and filtered to
 * unarchived - counting the array client-side would under-report the badge
 * the moment either limit bit.
 */
export interface NotificationFeed {
  readonly notifications: AppNotification[];
  readonly unread_count: number;
}

/** Payload of the cheap badge-only endpoint. */
export interface UnreadCountResponse {
  readonly unread_count: number;
}
