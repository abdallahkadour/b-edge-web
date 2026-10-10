/**
 * Earnings domain models. Mirror the Go earnings response structs.
 * Money fields are strings - decimal.Decimal serializes to quoted JSON strings.
 */

/** A single day in the 7-day daily breakdown. */
export interface DailyEarnings {
  readonly day: string;     // ISO 8601 UTC
  readonly revenue: string; // decimal as string
}

/** Revenue for a single service in the period. */
export interface ServiceEarnings {
  readonly service_id: string;
  readonly service_name: string;
  readonly bookings_count: number;
  readonly revenue: string; // decimal as string
}

/** Stats for a single time window (today / this week / this month). */
export interface PeriodStats {
  readonly revenue: string;        // decimal as string
  readonly bookings_count: number;
}

/** The date range that was queried. */
export interface EarningsPeriod {
  readonly from: string; // ISO 8601
  readonly to: string;   // ISO 8601
}

/** Full response from GET /earnings/summary (Go earnings.EarningsSummaryResponse). */
export interface EarningsSummary {
  readonly period: EarningsPeriod;
  readonly this_month: PeriodStats;
  readonly today: PeriodStats;
  readonly this_week: PeriodStats;
  readonly total_revenue: string;        // decimal as string
  readonly total_bookings: number;
  readonly total_deposits: string;       // decimal as string
  readonly average_booking_value: string; // decimal as string
  readonly daily_breakdown: DailyEarnings[];
  readonly by_service: ServiceEarnings[];
}

/** One window's salon-wide figures (Go earnings.SalonTotals). */
export interface SalonTotals {
  /** Completed + no-show at booked price, every artist - the same rule as
   *  each artist's own Earnings page. Recorded value, not cash received. */
  readonly earned: string;
  readonly earned_bookings: number;
  readonly deposits: string;
  readonly completed: number;
  readonly no_shows: number;
  /** cancelled + refund_due + refunded; never expired. */
  readonly cancelled: number;
  readonly orders_delivered: number;
  readonly orders_value: string;
}

/** What is waiting on someone in the salon now, whatever the period. */
export interface SalonWaiting {
  readonly awaiting_approval: number;
  readonly deposits_to_check: number;
  readonly refunds_owed: number;
  readonly refunds_owed_amount: string;
}

/** One artist's row in the owner's breakdown. */
export interface ArtistOverview {
  readonly artist_id: string;
  readonly name: string;
  readonly is_you: boolean;
  /** False for an artist who has left but had bookings here in the period. */
  readonly is_member: boolean;
  readonly earned: string;
  readonly earned_bookings: number;
  readonly completed: number;
  readonly no_shows: number;
  readonly cancelled: number;
  readonly rating: string;
  readonly review_count: number;
}

/** GET /earnings/salon (Go earnings.SalonOverviewResponse). Owner only. */
export interface SalonOverview {
  readonly period: EarningsPeriod;
  /** The window `previous` covers - cut to the same point while the period
   *  is still running. */
  readonly previous_period: EarningsPeriod;
  readonly totals: SalonTotals;
  readonly previous: SalonTotals;
  readonly waiting: SalonWaiting;
  readonly by_artist: ArtistOverview[];
}
