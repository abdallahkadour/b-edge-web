/**
 * The salon activity log (GET /salon/activity, owner only). Mirrors Go
 * activity.Entry. Old and new values are what the server recorded at the
 * time of the change - their keys depend on the action.
 */

export interface ActivityActor {
  /** Absent for a change nobody made by hand. */
  readonly id?: string;
  readonly name: string;
  /** artist | customer | admin | system */
  readonly role: string;
  readonly is_you: boolean;
}

export interface ActivitySubject {
  readonly service_name?: string;
  readonly customer_name?: string;
  readonly artist_name?: string;
  readonly store_name?: string;
  readonly start_time?: string;
}

export interface ActivityEntry {
  readonly id: string;
  readonly at: string;
  readonly actor: ActivityActor;
  readonly entity_type: string;
  readonly entity_id: string;
  readonly action: string;
  readonly old?: Record<string, unknown>;
  readonly new?: Record<string, unknown>;
  readonly subject: ActivitySubject;
}

/** The feed's filters, as the API names them. */
export type ActivityKind = 'bookings' | 'payments' | 'menu' | 'shop' | 'team';
